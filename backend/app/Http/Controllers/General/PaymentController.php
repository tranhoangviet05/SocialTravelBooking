<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\User;
use App\Events\BookingStatusUpdated;
use App\Events\WalletUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Khởi tạo thanh toán - trả về thông tin cần thiết
     * POST /api/payment/initiate
     * Body: { booking_id, payment_method: 'sepay', payment_type: 'full_100'|'deposit_30' }
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'booking_id'     => 'required|uuid|exists:bookings,id',
            'payment_method' => 'required|in:sepay',
            'payment_type'   => 'nullable|in:full_100,deposit_30',
        ]);

        $userId  = $request->user->id;
        $booking = Booking::where('id', $request->booking_id)
            ->where('user_id', $userId)
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn đặt chỗ.',
            ], 404);
        }

        // Check if this is paying the remaining 70% (already has deposit paid)
        if ($booking->deposit_paid_at && !$booking->remaining_paid_at) {
            return $this->initiateRemainingPayment($booking);
        }

        // First payment: either full_100 or deposit_30
        if ($booking->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Đơn đặt chỗ đã được thanh toán rồi.',
            ], 400);
        }

        $paymentType = $request->payment_type ?? 'full_100';

        // Save payment_type and calculate amounts
        $depositAmount    = round($booking->total_amount * 0.30);
        $remainingAmount  = $booking->total_amount - $depositAmount;

        $booking->update([
            'payment_type'    => $paymentType,
            'deposit_amount'  => $depositAmount,
            'remaining_amount' => $remainingAmount,
        ]);

        return $this->initiateSepayPayment($booking, $paymentType);
    }

    /**
     * Tạo thông tin thanh toán SePay QR cho lần đầu (cọc 30% hoặc 100%)
     */
    private function initiateSepayPayment(Booking $booking, string $paymentType = 'full_100')
    {
        $bankAccount = config('services.sepay.account_number', env('SEPAY_ACCOUNT_NUMBER', '0123456789'));
        $bankCode    = config('services.sepay.bank_code', env('SEPAY_BANK_CODE', 'MB'));

        if ($paymentType === 'deposit_30') {
            $amount  = (int) $booking->deposit_amount;
            // Content prefix: C = Coc (Deposit)
            $content = 'TOCCOC ' . $booking->booking_code;
            $label   = 'Đặt cọc 30%';
        } else {
            $amount  = (int) $booking->total_amount;
            // Content prefix: full payment
            $content = 'THANHTOAN ' . $booking->booking_code;
            $label   = 'Thanh toán 100%';
        }

        $qrUrl = "https://qr.sepay.vn/img?acc={$bankAccount}&bank={$bankCode}&amount={$amount}&des=" . urlencode($content) . "&template=compact2&download=false";

        return response()->json([
            'success' => true,
            'message' => 'Vui lòng quét mã QR để hoàn tất thanh toán.',
            'data'    => [
                'booking_id'       => $booking->id,
                'booking_code'     => $booking->booking_code,
                'payment_type'     => $paymentType,
                'label'            => $label,
                'amount'           => $amount,
                'total_amount'     => $booking->total_amount,
                'payment_method'   => 'sepay',
                'bank_account'     => $bankAccount,
                'bank_code'        => $bankCode,
                'transfer_content' => $content,
                'qr_url'           => $qrUrl,
                'expires_at'       => now()->addMinutes(15)->toISOString(),
            ],
        ]);
    }

    /**
     * Tạo QR để thanh toán 70% còn lại khi check-in bằng online
     */
    private function initiateRemainingPayment(Booking $booking)
    {
        $bankAccount = config('services.sepay.account_number', env('SEPAY_ACCOUNT_NUMBER', '0123456789'));
        $bankCode    = config('services.sepay.bank_code', env('SEPAY_BANK_CODE', 'MB'));

        $amount  = (int) $booking->remaining_amount;
        // Content prefix: R = Remaining
        $content = 'TOCNON ' . $booking->booking_code;

        $qrUrl = "https://qr.sepay.vn/img?acc={$bankAccount}&bank={$bankCode}&amount={$amount}&des=" . urlencode($content) . "&template=compact2&download=false";

        return response()->json([
            'success' => true,
            'message' => 'Quét mã QR để thanh toán phần còn lại.',
            'data'    => [
                'booking_id'       => $booking->id,
                'booking_code'     => $booking->booking_code,
                'payment_type'     => 'remaining_70',
                'label'            => 'Thanh toán 70% còn lại',
                'amount'           => $amount,
                'total_amount'     => $booking->total_amount,
                'payment_method'   => 'sepay',
                'bank_account'     => $bankAccount,
                'bank_code'        => $bankCode,
                'transfer_content' => $content,
                'qr_url'           => $qrUrl,
                'expires_at'       => now()->addMinutes(30)->toISOString(),
            ],
        ]);
    }

    /**
     * Thanh toán 70% còn lại bằng Tiền mặt (Provider xác nhận thu tiền mặt)
     * POST /api/payment/remaining/cash
     */
    public function payRemainingCash(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|uuid|exists:bookings,id',
        ]);

        // Only provider can confirm cash payment
        $user    = $request->user;
        $booking = Booking::where('id', $request->booking_id)
            ->where('payment_type', 'deposit_30')
            ->whereNotNull('deposit_paid_at')
            ->whereNull('remaining_paid_at')
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng hoặc đơn không ở trạng thái cần thanh toán còn lại.',
            ], 404);
        }

        // Verify caller is the provider of this booking
        $provider = \App\Models\ProviderProfile::where('user_id', $user->id)->first();
        if (!$provider || $booking->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền thực hiện.'], 403);
        }

        $booking->update([
            'remaining_paid_at'            => now(),
            'remaining_payment_method'     => 'cash',
        ]);

        // Update escrow: add remaining amount to provider's escrow_balance
        $this->addToEscrow($booking->provider_id, $booking->remaining_amount, $booking);

        $booking->loadMissing(['service.provider.user', 'service.location', 'service.media', 'roomType', 'user']);
        broadcast(new BookingStatusUpdated($booking, 'remaining_cash_paid', 'Đã xác nhận nhận tiền mặt 70% còn lại.'));

        return response()->json([
            'success' => true,
            'message' => 'Đã xác nhận thanh toán 70% bằng tiền mặt.',
            'data'    => $booking,
        ]);
    }

    /**
     * Webhook từ SePay khi nhận được thanh toán
     * POST /api/payment/sepay/webhook
     */
    public function sepayWebhook(Request $request)
    {
        Log::info('--- SEPAY WEBHOOK START ---');
        Log::info('Headers:', $request->headers->all());
        Log::info('Payload:', $request->all());

        $data = $request->all();

        // Xác thực token bí mật từ SePay
        $webhookToken = env('SEPAY_WEBHOOK_TOKEN', '');
        $authHeader   = $request->header('Authorization');

        if ($webhookToken) {
            if (!$authHeader || str_replace('Apikey ', '', $authHeader) !== $webhookToken) {
                Log::warning('SePay webhook: Unauthorized - Invalid token or header');
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }
        }

        $content = $data['transferContent'] ?? $data['content'] ?? '';
        $amount  = (float) ($data['transferAmount'] ?? $data['amount'] ?? 0);

        // Detect payment type from content prefix
        // TOCCOC = deposit, TOCNON = remaining, THANHTOAN = full
        $isDeposit   = stripos($content, 'TOCCOC') !== false;
        $isRemaining = stripos($content, 'TOCNON') !== false;

        // Extract booking code
        preg_match('/BK-?[A-Z0-9]+-?\d+/i', $content, $matches);
        $rawBookingCode = $matches[0] ?? null;

        if (!$rawBookingCode) {
            Log::info('SePay webhook: No booking code found in content: ' . $content);
            return response()->json(['success' => true, 'message' => 'Không tìm thấy mã đặt chỗ']);
        }

        // Find booking
        $booking = $this->findBookingByCode($rawBookingCode);

        if (!$booking) {
            Log::info('SePay webhook: Booking not found: ' . $rawBookingCode);
            return response()->json(['success' => true, 'message' => 'Không tìm thấy đơn hàng']);
        }

        // Handle remaining payment (70%)
        if ($isRemaining) {
            return $this->handleRemainingWebhook($booking, $amount, $data);
        }

        // Handle deposit (30%) or full (100%) payment
        return $this->handleInitialWebhook($booking, $amount, $data, $isDeposit);
    }

    /**
     * Xử lý webhook cho lần thanh toán đầu (cọc 30% hoặc full 100%)
     */
    private function handleInitialWebhook(Booking $booking, float $amount, array $data, bool $isDeposit)
    {
        if ($booking->payment_status === 'paid' && !$isDeposit) {
            Log::info('SePay webhook: Booking already fully paid: ' . $booking->booking_code);
            return response()->json(['success' => true, 'message' => 'Đã xử lý']);
        }

        if ($booking->deposit_paid_at && $isDeposit) {
            Log::info('SePay webhook: Deposit already paid: ' . $booking->booking_code);
            return response()->json(['success' => true, 'message' => 'Cọc đã được thanh toán']);
        }

        // Determine expected amount
        $expectedAmount = $isDeposit ? (float) $booking->deposit_amount : (float) $booking->total_amount;

        if ($expectedAmount > 0 && abs($amount - $expectedAmount) > 1000 && $amount < $expectedAmount - 1000) {
            Log::warning("SePay webhook: Amount mismatch. Expected {$expectedAmount}, got {$amount}");
            return response()->json(['success' => true, 'message' => 'Số tiền không khớp']);
        }

        DB::transaction(function () use ($booking, $data, $amount, $isDeposit) {
            if ($isDeposit) {
                // Mark deposit as paid
                $booking->update([
                    'payment_method'  => 'sepay',
                    'deposit_paid_at' => now(),
                    'payment_status'  => 'paid',
                    'status'          => 'confirmed',
                ]);
                $escrowAmount = $booking->deposit_amount;
            } else {
                // Mark as fully paid
                $booking->update([
                    'payment_method'  => 'sepay',
                    'payment_status'  => 'paid',
                    'paid_at'         => now(),
                    'status'          => 'confirmed',
                ]);
                $escrowAmount = $booking->total_amount;
            }

            // Add to escrow balances (Admin & Provider)
            $this->addToEscrow($booking->provider_id, $escrowAmount, $booking);

            // Auto check & send upsell mail
            \App\Http\Controllers\General\UpsellController::checkAndNotifyUpsell($booking);

            $booking->loadMissing(['service.provider.user', 'service.location', 'service.media', 'roomType', 'user']);
            broadcast(new BookingStatusUpdated($booking, 'paid', 'Đơn đặt chỗ đã được thanh toán thành công!'));

            Log::info("Booking {$booking->booking_code} payment confirmed. IsDeposit: " . ($isDeposit ? 'yes' : 'no'));
        });

        return response()->json(['success' => true, 'message' => 'Xác nhận thanh toán thành công']);
    }

    /**
     * Xử lý webhook cho khoản thanh toán 70% còn lại
     */
    private function handleRemainingWebhook(Booking $booking, float $amount, array $data)
    {
        if ($booking->remaining_paid_at) {
            Log::info('SePay webhook: Remaining already paid: ' . $booking->booking_code);
            return response()->json(['success' => true, 'message' => 'Đã xử lý']);
        }

        if (!$booking->deposit_paid_at) {
            Log::warning('SePay webhook: Remaining payment but no deposit found: ' . $booking->booking_code);
            return response()->json(['success' => true, 'message' => 'Lỗi logic']);
        }

        $expectedAmount = (float) $booking->remaining_amount;
        if ($expectedAmount > 0 && abs($amount - $expectedAmount) > 1000 && $amount < $expectedAmount - 1000) {
            Log::warning("SePay webhook: Remaining amount mismatch. Expected {$expectedAmount}, got {$amount}");
            return response()->json(['success' => true, 'message' => 'Số tiền không khớp']);
        }

        DB::transaction(function () use ($booking) {
            $booking->update([
                'remaining_paid_at'        => now(),
                'remaining_payment_method' => 'sepay',
                'payment_status'           => 'paid',
                'paid_at'                  => now(),
            ]);

            // Add remaining 70% to escrow
            $this->addToEscrow($booking->provider_id, $booking->remaining_amount, $booking);

            $booking->loadMissing(['service.provider.user', 'service.location', 'service.media', 'roomType', 'user']);
            broadcast(new BookingStatusUpdated($booking, 'remaining_paid', 'Thanh toán 70% còn lại thành công!'));
        });

        return response()->json(['success' => true, 'message' => 'Xác nhận thanh toán 70% thành công']);
    }

    /**
     * Cộng tiền vào escrow_balance của Admin và Provider
     */
    private function addToEscrow($providerProfileId, float $amount, Booking $booking)
    {
        // Get provider user
        $providerProfile = \App\Models\ProviderProfile::find($providerProfileId);
        if (!$providerProfile) return;

        // Update Provider escrow_balance
        $providerWallet = Wallet::firstOrCreate(
            ['user_id' => $providerProfile->user_id],
            ['balance' => 0, 'locked_balance' => 0, 'currency' => 'VND']
        );

        // Use raw DB update to safely add escrow_balance (even if column is new)
        DB::statement('UPDATE wallets SET escrow_balance = COALESCE(escrow_balance, 0) + ? WHERE id = ?', [
            $amount, $providerWallet->id
        ]);
        $providerWallet->refresh();

        // Record transaction for provider
        WalletTransaction::create([
            'wallet_id'     => $providerWallet->id,
            'booking_id'    => $booking->id,
            'type'          => 'deposit',
            'amount'        => $amount,
            'balance_before' => $providerWallet->balance,
            'balance_after'  => $providerWallet->balance,
            'note'          => "Tiền giữ trung gian từ booking #{$booking->booking_code}",
        ]);

        // Fire realtime event for provider
        broadcast(new WalletUpdated($providerProfile->user_id, $providerWallet->fresh()));

        // Update Admin escrow_balance
        $adminUser = User::where('role', 'admin')->first();
        if ($adminUser) {
            $adminWallet = Wallet::firstOrCreate(
                ['user_id' => $adminUser->id],
                ['balance' => 0, 'locked_balance' => 0, 'currency' => 'VND']
            );

            DB::statement('UPDATE wallets SET escrow_balance = COALESCE(escrow_balance, 0) + ? WHERE id = ?', [
                $amount, $adminWallet->id
            ]);

            // Create transaction for admin history
            WalletTransaction::create([
                'wallet_id'      => $adminWallet->id,
                'booking_id'     => $booking->id,
                'type'           => 'deposit',
                'amount'         => $amount,
                'balance_before' => $adminWallet->balance,
                'balance_after'  => $adminWallet->balance,
                'note'           => "Tiền giữ trung gian từ booking #{$booking->booking_code}",
            ]);

            broadcast(new WalletUpdated($adminUser->id, $adminWallet->fresh()));
        }

        Log::info("Escrow added: {$amount} for booking {$booking->booking_code}");
    }

    /**
     * Find booking by code (with normalization)
     */
    private function findBookingByCode(string $rawCode): ?Booking
    {
        $booking = Booking::where('booking_code', $rawCode)->first();
        if (!$booking) {
            $normalizedCode = str_replace('-', '', $rawCode);
            $booking = Booking::whereRaw("REPLACE(booking_code, '-', '') = ?", [$normalizedCode])->first();
        }
        return $booking;
    }

    /**
     * Kiểm tra trạng thái thanh toán (Polling từ frontend)
     * GET /api/payment/status/{booking_id}
     */
    public function checkStatus(Request $request, string $bookingId)
    {
        $userId  = $request->user->id;
        $booking = Booking::where('id', $bookingId)
            ->where('user_id', $userId)
            ->select([
                'id', 'booking_code', 'payment_status', 'status', 'paid_at', 'total_amount',
                'payment_type', 'deposit_amount', 'remaining_amount',
                'deposit_paid_at', 'remaining_paid_at', 'remaining_payment_method',
            ])
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'booking_id'               => $booking->id,
                'booking_code'             => $booking->booking_code,
                'payment_status'           => $booking->payment_status,
                'status'                   => $booking->status,
                'paid_at'                  => $booking->paid_at,
                'total_amount'             => $booking->total_amount,
                'payment_type'             => $booking->payment_type,
                'deposit_amount'           => $booking->deposit_amount,
                'remaining_amount'         => $booking->remaining_amount,
                'deposit_paid_at'          => $booking->deposit_paid_at,
                'remaining_paid_at'        => $booking->remaining_paid_at,
                'remaining_payment_method' => $booking->remaining_payment_method,
                'needs_remaining_payment'  => (
                    $booking->payment_type === 'deposit_30' &&
                    $booking->deposit_paid_at !== null &&
                    $booking->remaining_paid_at === null
                ),
            ],
        ]);
    }

    /**
     * Lấy số dư ví hiện tại của user
     * GET /api/wallet/balance
     */
    public function walletBalance(Request $request)
    {
        $userId = $request->user->id;
        $wallet = Wallet::where('user_id', $userId)->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'balance'         => $wallet?->balance ?? 0,
                'escrow_balance'  => $wallet?->escrow_balance ?? 0,
                'locked_balance'  => $wallet?->locked_balance ?? 0,
                'currency'        => $wallet?->currency ?? 'VND',
            ],
        ]);
    }
}
