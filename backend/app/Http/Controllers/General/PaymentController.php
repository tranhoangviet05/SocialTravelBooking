<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Khởi tạo thanh toán - trả về thông tin cần thiết
     * POST /api/payment/initiate
     * Body: { booking_id, payment_method: 'sepay'|'wallet' }
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'booking_id'      => 'required|uuid|exists:bookings,id',
            'payment_method'  => 'required|in:sepay,wallet',
        ]);

        $userId  = $request->input('user.id');
        $booking = Booking::where('id', $request->booking_id)
            ->where('user_id', $userId)
            ->where('payment_status', 'pending')
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn đặt chỗ hoặc đơn đã được thanh toán.',
            ], 404);
        }

        if ($request->payment_method === 'wallet') {
            return $this->initiateWalletPayment($booking, $userId);
        }

        // SePay QR payment
        return $this->initiateSepayPayment($booking);
    }

    /**
     * Thanh toán qua Ví nội bộ (trừ tiền trực tiếp)
     */
    private function initiateWalletPayment(Booking $booking, string $userId)
    {
        try {
            $result = DB::transaction(function () use ($booking, $userId) {
                $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();

                if (!$wallet) {
                    throw new \Exception('Bạn chưa có ví điện tử. Vui lòng liên hệ hỗ trợ.');
                }

                if ($wallet->balance < $booking->total_amount) {
                    throw new \Exception('Số dư ví không đủ. Vui lòng nạp thêm tiền.');
                }

                $balanceBefore = $wallet->balance;
                $wallet->balance -= $booking->total_amount;
                $wallet->save();

                WalletTransaction::create([
                    'wallet_id'      => $wallet->id,
                    'booking_id'     => $booking->id,
                    'type'           => 'booking_payment',
                    'amount'         => -$booking->total_amount,
                    'balance_before' => $balanceBefore,
                    'balance_after'  => $wallet->balance,
                    'note'           => "Thanh toán đặt chỗ #{$booking->booking_code}",
                ]);

                $booking->payment_method = 'wallet';
                $booking->payment_status = 'paid';
                $booking->paid_at        = now();
                $booking->status         = 'confirmed';
                $booking->save();

                return $booking;
            });

            return response()->json([
                'success'  => true,
                'message'  => 'Thanh toán ví thành công!',
                'redirect' => 'success',
                'data'     => [
                    'booking_code'   => $result->booking_code,
                    'total_amount'   => $result->total_amount,
                    'payment_method' => 'wallet',
                    'paid_at'        => $result->paid_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Tạo thông tin thanh toán SePay QR
     * SePay dùng chuyển khoản ngân hàng + nội dung tự động matching
     */
    private function initiateSepayPayment(Booking $booking)
    {
        // SePay dùng quy ước: nội dung chuyển khoản = booking_code
        // QR Code STIipe: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=CONTENT
        $bankAccount = config('services.sepay.account_number', env('SEPAY_ACCOUNT_NUMBER', '0123456789'));
        $bankCode    = config('services.sepay.bank_code', env('SEPAY_BANK_CODE', 'MB'));
        $amount      = (int) $booking->total_amount;
        $content     = 'THANHTOAN ' . $booking->booking_code; // Nội dung matching

        // URL QR SePay công khai (không cần API key cho static QR)
        $qrUrl = "https://qr.sepay.vn/img?acc={$bankAccount}&bank={$bankCode}&amount={$amount}&des=" . urlencode($content) . "&template=compact2&download=false";

        return response()->json([
            'success' => true,
            'message' => 'Vui lòng quét mã QR để hoàn tất thanh toán.',
            'data'    => [
                'booking_id'     => $booking->id,
                'booking_code'   => $booking->booking_code,
                'total_amount'   => $booking->total_amount,
                'payment_method' => 'sepay',
                'bank_account'   => $bankAccount,
                'bank_code'      => $bankCode,
                'transfer_content' => $content,
                'qr_url'         => $qrUrl,
                'expires_at'     => now()->addMinutes(15)->toISOString(),
            ],
        ]);
    }

    /**
     * Webhook từ SePay khi nhận được thanh toán
     * POST /api/payment/sepay/webhook
     * (Không cần auth, dùng token bí mật từ header)
     */
    public function sepayWebhook(Request $request)
    {
        // Xác thực token bí mật từ SePay
        // SePay gửi header: Authorization: Apikey <mã_token>
        $webhookToken = env('SEPAY_WEBHOOK_TOKEN', '');
        $authHeader = $request->header('Authorization');

        if ($webhookToken) {
            if (!$authHeader || str_replace('Apikey ', '', $authHeader) !== $webhookToken) {
                Log::warning('SePay webhook: Unauthorized - Invalid token or header');
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }
        }

        $data = $request->all();
        Log::info('SePay webhook received:', $data);

        // SePay gửi: transferAmount, transferContent, transactionDate, referenceCode, ...
        $content      = $data['transferContent'] ?? $data['content'] ?? '';
        $amount       = (float) ($data['transferAmount'] ?? $data['amount'] ?? 0);

        // Tìm booking từ nội dung chuyển khoản
        preg_match('/BK-[A-Z0-9]+-\d+/i', $content, $matches);
        $bookingCode = $matches[0] ?? null;

        if (!$bookingCode) {
            Log::info('SePay webhook: No booking code found in content: ' . $content);
            return response()->json(['success' => true, 'message' => 'Không tìm thấy mã đặt chỗ']); // 200 để SePay không retry
        }

        $booking = Booking::where('booking_code', $bookingCode)
            ->where('payment_status', 'pending')
            ->first();

        if (!$booking) {
            Log::info('SePay webhook: Booking not found or already paid: ' . $bookingCode);
            return response()->json(['success' => true, 'message' => 'Đã xử lý']);
        }

        // Kiểm tra số tiền (cho phép sai lệch 1000 VND)
        if (abs($amount - $booking->total_amount) > 1000) {
            Log::warning("SePay webhook: Amount mismatch. Expected {$booking->total_amount}, got {$amount}");
            // Vẫn confirm nếu đủ tiền (có thể hơn)
            if ($amount < $booking->total_amount - 1000) {
                return response()->json(['success' => true, 'message' => 'Số tiền không khớp']);
            }
        }

        // Cập nhật trạng thái booking
        DB::transaction(function () use ($booking, $data) {
            $booking->payment_method = 'momo'; // map sepay -> momo trong enum hiện tại
            $booking->payment_status = 'paid';
            $booking->paid_at        = now();
            $booking->status         = 'confirmed';
            $booking->save();

            // Ghi log transaction vào wallet của provider (escrow)
            Log::info("Booking {$booking->booking_code} confirmed via SePay");
        });

        return response()->json(['success' => true, 'message' => 'Xác nhận thanh toán thành công']);
    }

    /**
     * Kiểm tra trạng thái thanh toán (Polling từ frontend)
     * GET /api/payment/status/{booking_id}
     */
    public function checkStatus(Request $request, string $bookingId)
    {
        $userId  = $request->input('user.id');
        $booking = Booking::where('id', $bookingId)
            ->where('user_id', $userId)
            ->select(['id', 'booking_code', 'payment_status', 'status', 'paid_at', 'total_amount'])
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'booking_id'     => $booking->id,
                'booking_code'   => $booking->booking_code,
                'payment_status' => $booking->payment_status,
                'status'         => $booking->status,
                'paid_at'        => $booking->paid_at,
                'total_amount'   => $booking->total_amount,
            ],
        ]);
    }

    /**
     * Lấy số dư ví hiện tại của user
     * GET /api/wallet/balance
     */
    public function walletBalance(Request $request)
    {
        $userId = $request->input('user.id');
        $wallet = Wallet::where('user_id', $userId)->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'balance'        => $wallet?->balance ?? 0,
                'locked_balance' => $wallet?->locked_balance ?? 0,
                'currency'       => $wallet?->currency ?? 'VND',
            ],
        ]);
    }
}
