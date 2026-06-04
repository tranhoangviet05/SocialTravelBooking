<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use App\Models\User;
use App\Events\WalletUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    /**
     * Lấy tổng quan ví của Admin (Số tiền đang giữ trung gian toàn hệ thống)
     * GET /api/admin/wallet
     */
    public function index(Request $request)
    {
        $adminUser   = $request->user;
        $adminWallet = Wallet::where('user_id', $adminUser->id)->first();

        // Tổng số tiền đang giữ trung gian trong hệ thống (admin escrow = tổng tiền đã thu về tk thật)
        $totalEscrow = $adminWallet?->escrow_balance ?? 0;
        $adminBalance = $adminWallet?->balance ?? 0; // Phí sàn 5% đã được nhả

        // Thống kê nhanh: Số yêu cầu rút tiền đang chờ xử lý
        $pendingWithdrawals    = WithdrawalRequest::where('status', 'pending')->count();
        $pendingWithdrawAmount = WithdrawalRequest::where('status', 'pending')->sum('amount');

        // Lịch sử giao dịch của ví Admin
        $transactions = WalletTransaction::where('wallet_id', $adminWallet?->id)
            ->with('booking.service')
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'wallet' => [
                    'balance'         => $adminBalance,
                    'escrow_balance'  => $totalEscrow,
                ],
                'pending_withdrawals_count'  => $pendingWithdrawals,
                'pending_withdrawals_amount' => $pendingWithdrawAmount,
                'transactions'               => $transactions,
            ],
        ]);
    }

    /**
     * Danh sách yêu cầu rút tiền
     * GET /api/admin/withdrawal-requests
     */
    public function withdrawalRequests(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = WithdrawalRequest::with(['user'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $requests = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $requests,
        ]);
    }

    /**
     * Duyệt yêu cầu rút tiền
     * PATCH /api/admin/withdrawal-requests/{id}/approve
     */
    public function approveWithdrawal(Request $request, $id)
    {
        $withdrawalRequest = WithdrawalRequest::findOrFail($id);

        if ($withdrawalRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu này đã được xử lý rồi.',
            ], 400);
        }

        DB::transaction(function () use ($withdrawalRequest, $request) {
            // Deduct from Provider's balance
            $providerWallet = Wallet::where('user_id', $withdrawalRequest->user_id)->first();

            if ($providerWallet && $providerWallet->balance >= $withdrawalRequest->amount) {
                DB::statement('
                    UPDATE wallets
                    SET balance = GREATEST(0, COALESCE(balance, 0) - ?)
                    WHERE id = ?
                ', [$withdrawalRequest->amount, $providerWallet->id]);

                $providerWallet->refresh();

                WalletTransaction::create([
                    'wallet_id'      => $providerWallet->id,
                    'type'           => 'withdrawal',
                    'amount'         => -$withdrawalRequest->amount,
                    'balance_before' => $providerWallet->balance + $withdrawalRequest->amount,
                    'balance_after'  => $providerWallet->balance,
                    'note'           => "Rút tiền về tài khoản {$withdrawalRequest->bank_name} - {$withdrawalRequest->bank_account_number}",
                ]);

                broadcast(new WalletUpdated($withdrawalRequest->user_id, $providerWallet));
            }

            $withdrawalRequest->update([
                'status'     => 'approved',
                'admin_note' => $request->input('admin_note', 'Đã chuyển khoản thành công.'),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã duyệt yêu cầu rút tiền.',
        ]);
    }

    /**
     * Từ chối yêu cầu rút tiền
     * PATCH /api/admin/withdrawal-requests/{id}/reject
     */
    public function rejectWithdrawal(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'required|string',
        ]);

        $withdrawalRequest = WithdrawalRequest::findOrFail($id);

        if ($withdrawalRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu này đã được xử lý rồi.',
            ], 400);
        }

        $withdrawalRequest->update([
            'status'     => 'rejected',
            'admin_note' => $request->admin_note,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã từ chối yêu cầu rút tiền.',
        ]);
    }
}
