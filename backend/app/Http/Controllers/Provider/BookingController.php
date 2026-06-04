<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ProviderProfile;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\User;
use App\Events\BookingStatusUpdated;
use App\Events\WalletUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{

    private function getProvider(Request $request)
    {
        $user = $request->user();
        return ProviderProfile::where('user_id', $user->id)->first();
    }

    /**
     * Danh sách đơn đặt chỗ của nhà cung cấp
     */
    public function index(Request $request)
    {
        $provider = $this->getProvider($request);
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ nhà cung cấp.'], 404);
        }

        $query = Booking::with(['user', 'service'])
            ->where('provider_id', $provider->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'checkin_requested') {
                $query->whereNotNull('tourist_check_in_at')
                      ->where('is_checked_in', false);
            } else {
                $query->where('status', $request->status);
            }
        }

        $bookings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Chi tiết đơn đặt chỗ
     */
    public function show(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $booking = Booking::with(['user', 'service', 'review'])->findOrFail($id);

        if ($booking->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền xem đơn này.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    /**
     * Cập nhật trạng thái đơn (confirmed, ongoing, completed, cancelled)
     * Khi chuyển sang 'ongoing' (xác nhận Check-in), tự động thực hiện Clearing (phân bổ doanh thu)
     */
    public function updateStatus(Request $request, $id, \App\Services\ChatService $chatService)
    {
        $provider = $this->getProvider($request);
        $booking  = Booking::findOrFail($id);

        if ($booking->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền cập nhật đơn này.'], 403);
        }

        $request->validate([
            'status' => 'required|in:confirmed,ongoing,completed,cancelled'
        ]);

        $newStatus = $request->status;

        $validTransitions = [
            'confirmed' => ['ongoing', 'cancelled'],
            'ongoing'   => ['completed'],
        ];

        $currentStatus = $booking->status;

        if ($currentStatus === 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Đơn hàng đang chờ khách thanh toán. Bạn không thể thực hiện hành động nào lúc này."
            ], 422);
        }

        if (!isset($validTransitions[$currentStatus]) || !in_array($newStatus, $validTransitions[$currentStatus])) {
            return response()->json([
                'success' => false,
                'message' => "Không thể chuyển từ trạng thái '{$currentStatus}' sang '{$newStatus}'."
            ], 422);
        }

        // When confirming check-in (confirmed -> ongoing), run revenue clearing
        if ($newStatus === 'ongoing') {
            // Validate that the booking is fully paid (or deposit paid for deposit_30)
            $isFullyPaid = $booking->payment_status === 'paid';
            $isDepositPaid = $booking->deposit_paid_at !== null;

            if (!$isFullyPaid && !$isDepositPaid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng chưa được thanh toán, không thể xác nhận Check-in.'
                ], 422);
            }
        }

        DB::transaction(function () use ($booking, $newStatus, $request, $provider, $chatService) {
            $booking->status = $newStatus;

            if ($newStatus === 'ongoing') {
                $booking->is_checked_in = true;
                $booking->checked_in_at = now();
                $booking->save();

                // Run revenue clearing
                $this->performRevenueClearing($booking, $provider);

                $chatService->sendCheckInConfirmedMessage($booking);
            }

            if ($newStatus === 'confirmed') {
                $booking->save();
                $chatService->sendBookingConfirmedMessage($booking);
            }

            if ($newStatus === 'cancelled') {
                $booking->cancel_reason = $request->input('cancel_reason', 'Bị hủy bởi nhà cung cấp');
                $booking->cancelled_at  = now();
                $booking->save();
            }

            if ($newStatus === 'completed') {
                $booking->save();
            }

            $booking->loadMissing(['service.provider.user', 'service.location', 'service.media', 'roomType', 'user']);
            broadcast(new BookingStatusUpdated($booking, 'status_updated', "Đơn đặt chỗ đã chuyển sang trạng thái: {$newStatus}"));
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn đặt chỗ thành công.',
            'data'    => $booking->load(['user', 'service'])
        ]);
    }

    /**
     * Thực hiện phân bổ doanh thu (Clearing) khi Check-in được xác nhận.
     * Logic:
     *   - Tổng tiền Admin đang giữ hộ (escrow) cho booking này
     *   - Admin giữ lại 5% = Phí sàn
     *   - Provider nhận 95%
     *
     * Hai trường hợp:
     * 1. full_100 hoặc deposit_30 + thanh toán 70% online:
     *    -> Tổng tiền = total_amount. Provider nhận 95% từ escrow.
     * 2. deposit_30 + 70% Tiền mặt:
     *    -> Tổng tiền = total_amount. Provider đã cầm 70% tiền mặt thật ngoài đời.
     *    -> Escrow chỉ có 30% tiền cọc. Phí sàn 5% toàn đơn.
     *    -> Provider nhận (30% - 5%) = 25% từ escrow. (70% tiền mặt đã nhận ngoài đời)
     */
    private function performRevenueClearing(Booking $booking, ProviderProfile $provider)
    {
        $totalAmount    = (float) $booking->total_amount;
        $platformFeeRate = 0.05; // 5%
        $platformFee    = round($totalAmount * $platformFeeRate, 2);
        $providerRevenue = $totalAmount - $platformFee; // 95%

        // Is this a deposit_30 + cash remaining case?
        $isCashRemaining = (
            $booking->payment_type === 'deposit_30' &&
            $booking->remaining_payment_method === 'cash'
        );

        if ($isCashRemaining) {
            // Provider already received 70% cash in real life.
            // Escrow only has 30% deposit.
            // Platform fee = 5% of total. We deduct it from the deposit (30%).
            // Provider gets: (deposit_amount - platform_fee) from escrow.
            $depositAmount       = (float) $booking->deposit_amount;
            $escrowToRelease     = $depositAmount;       // Total escrow from this booking
            $providerFromEscrow  = $depositAmount - $platformFee; // Provider gets 25%
        } else {
            // Full payment is in escrow (either full_100 or deposit_30 + sepay remaining)
            $escrowToRelease     = $totalAmount;
            $providerFromEscrow  = $providerRevenue; // 95%
        }

        Log::info("Revenue clearing for booking {$booking->booking_code}: total={$totalAmount}, fee={$platformFee}, provider_from_escrow={$providerFromEscrow}");

        // 1. Update Provider Wallet: escrow -> balance
        $providerUser   = User::find($provider->user_id);
        $providerWallet = Wallet::firstOrCreate(
            ['user_id' => $providerUser->id],
            ['balance' => 0, 'locked_balance' => 0, 'currency' => 'VND']
        );

        DB::statement('
            UPDATE wallets 
            SET 
                escrow_balance = GREATEST(0, COALESCE(escrow_balance, 0) - ?),
                balance = COALESCE(balance, 0) + ?
            WHERE id = ?
        ', [$escrowToRelease, $providerFromEscrow, $providerWallet->id]);

        $providerWallet->refresh();

        WalletTransaction::create([
            'wallet_id'      => $providerWallet->id,
            'booking_id'     => $booking->id,
            'type'           => 'revenue_allocation',
            'amount'         => $providerFromEscrow,
            'balance_before' => $providerWallet->balance - $providerFromEscrow,
            'balance_after'  => $providerWallet->balance,
            'note'           => "Doanh thu 95% từ booking #{$booking->booking_code} (Phí sàn 5%: " . number_format($platformFee) . "đ)",
        ]);

        // Broadcast realtime wallet update to provider
        broadcast(new WalletUpdated($providerUser->id, $providerWallet));

        // 2. Update Admin Wallet: escrow -> balance (5% fee)
        $adminUser   = User::where('role', 'admin')->first();
        if ($adminUser) {
            $adminWallet = Wallet::firstOrCreate(
                ['user_id' => $adminUser->id],
                ['balance' => 0, 'locked_balance' => 0, 'currency' => 'VND']
            );

            DB::statement('
                UPDATE wallets 
                SET 
                    escrow_balance = GREATEST(0, COALESCE(escrow_balance, 0) - ?),
                    balance = COALESCE(balance, 0) + ?
                WHERE id = ?
            ', [$escrowToRelease, $platformFee, $adminWallet->id]);

            $adminWallet->refresh();

            WalletTransaction::create([
                'wallet_id'      => $adminWallet->id,
                'booking_id'     => $booking->id,
                'type'           => 'platform_fee',
                'amount'         => $platformFee,
                'balance_before' => $adminWallet->balance - $platformFee,
                'balance_after'  => $adminWallet->balance,
                'note'           => "Phí sàn 5% từ booking #{$booking->booking_code}",
            ]);

            broadcast(new WalletUpdated($adminUser->id, $adminWallet));
        }
    }
}
