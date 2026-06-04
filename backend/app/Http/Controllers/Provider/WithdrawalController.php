<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    /**
     * Lấy danh sách yêu cầu rút tiền của provider đang đăng nhập
     * GET /api/provider/withdrawal-requests
     */
    public function index(Request $request)
    {
        $userId = $request->user->id;

        $requests = WithdrawalRequest::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $wallet = Wallet::where('user_id', $userId)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'wallet' => [
                    'balance'        => $wallet?->balance ?? 0,
                    'escrow_balance' => $wallet?->escrow_balance ?? 0,
                ],
                'requests' => $requests,
            ],
        ]);
    }

    /**
     * Tạo yêu cầu rút tiền mới
     * POST /api/provider/withdrawal-requests
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount'              => 'required|numeric|min:10000',
            'bank_name'           => 'required|string|max:100',
            'bank_account_number' => 'required|string|max:30',
            'bank_account_name'   => 'required|string|max:100',
        ]);

        $userId = $request->user->id;
        $wallet = Wallet::where('user_id', $userId)->first();
        
        $pendingWithdrawalAmount = WithdrawalRequest::where('user_id', $userId)
            ->where('status', 'pending')
            ->sum('amount');

        $availableBalance = ($wallet?->balance ?? 0) - $pendingWithdrawalAmount;

        if (!$wallet || $availableBalance < $request->amount) {
            return response()->json([
                'success' => false,
                'message' => "Số dư khả dụng không đủ (bạn đang có " . number_format($pendingWithdrawalAmount) . "đ chờ duyệt).",
            ], 400);
        }

        DB::transaction(function () use ($request, $userId, $wallet) {
            // Create the request
            WithdrawalRequest::create([
                'user_id'             => $userId,
                'amount'              => $request->amount,
                'bank_name'           => $request->bank_name,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name'   => $request->bank_account_name,
                'status'              => 'pending',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Yêu cầu rút tiền đã được gửi! Admin sẽ xử lý trong vòng 1-3 ngày làm việc.',
        ]);
    }
}
