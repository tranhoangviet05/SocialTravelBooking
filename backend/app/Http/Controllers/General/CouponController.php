<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Lấy danh sách mã giảm giá đang hoạt động (Public)
     */
    public function index()
    {
        $coupons = Coupon::where('is_public', true)
            ->where(function ($query) {
                $query->whereNull('valid_until')
                      ->orWhere('valid_until', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    /**
     * Lấy danh sách TẤT CẢ mã giảm giá (Public + Personal) của user để checkout
     */
    public function myCoupons(Request $request)
    {
        $user = $request->user();
        
        // Lấy tất cả mã public đang hoạt động (không bị xóa)
        $publicCoupons = Coupon::where('is_public', true)
            ->orderBy('created_at', 'desc')
            ->get();

        // Lấy các mã cá nhân được gán
        $personalCoupons = [];
        if ($user) {
            $personalCoupons = $user->coupons()->get();
        }

        // Gộp chung 2 mảng, loại bỏ trùng nếu lỡ có
        $allCoupons = $publicCoupons->concat($personalCoupons)->unique('id')->values();

        // Đánh giá trạng thái từng coupon đối với user hiện tại
        $formattedCoupons = $allCoupons->map(function ($c) use ($user) {
            $isAvailable = true;
            $unavailabilityReason = null;

            // Kiểm tra hạn sử dụng
            if ($c->valid_until && $c->valid_until < now()) {
                $isAvailable = false;
                $unavailabilityReason = 'Mã đã hết hạn';
            }
            // Kiểm tra lượt sử dụng chung
            else if ($c->usage_limit && $c->used_count >= $c->usage_limit) {
                $isAvailable = false;
                $unavailabilityReason = 'Mã đã hết lượt sử dụng';
            }
            // Kiểm tra private
            else if (!$c->is_public) {
                // Nếu là mã riêng tư, kiểm tra xem user này đã dùng chưa thông qua pivot
                if ($c->pivot && $c->pivot->is_used) {
                    $isAvailable = false;
                    $unavailabilityReason = 'Bạn đã sử dụng mã này rồi';
                }
            }

            return [
                'id' => $c->id,
                'code' => $c->code,
                'type' => $c->type,
                'discount_value' => $c->discount_value,
                'max_discount' => $c->max_discount,
                'min_order_amount' => $c->min_order_amount,
                'valid_from' => $c->valid_from,
                'valid_until' => $c->valid_until,
                'is_public' => $c->is_public,
                'is_available' => $isAvailable,
                'unavailability_reason' => $unavailabilityReason
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedCoupons
        ]);
    }

    /**
     * Kiểm tra và áp dụng mã giảm giá
     */
    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không tồn tại.'
            ], 404);
        }

        // Kiểm tra thời hạn
        if ($coupon->valid_until && $coupon->valid_until < now()) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết hạn.'], 400);
        }
        if ($coupon->valid_from && $coupon->valid_from > now()) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá chưa đến thời gian sử dụng.'], 400);
        }

        // Kiểm tra lượt sử dụng chung
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng.'], 400);
        }

        // Kiểm tra mã riêng tư
        $user = $request->user();
        if (!$coupon->is_public) {
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để sử dụng mã này.'], 401);
            }
            
            // Tìm trong pivot table xem user có được gán mã này không
            $pivot = $user->coupons()->where('coupon_id', $coupon->id)->first();
            if (!$pivot) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền sử dụng mã giảm giá này.'], 403);
            }
            if ($pivot->pivot->is_used) {
                return response()->json(['success' => false, 'message' => 'Bạn đã sử dụng mã giảm giá này rồi.'], 400);
            }
        }

        // Kiểm tra điều kiện đơn hàng tối thiểu
        if ($request->order_amount < $coupon->min_order_amount) {
            return response()->json([
                'success' => false, 
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ('.number_format($coupon->min_order_amount).'đ) để sử dụng mã này.'
            ], 400);
        }

        $subtotal = $request->order_amount;
        $discountAmount = 0;

        if ($coupon->type === 'percent') {
            $discountAmount = (int) ($subtotal * $coupon->discount_value / 100);
            if ($coupon->max_discount && $discountAmount > $coupon->max_discount) {
                $discountAmount = (int) $coupon->max_discount;
            }
        } else {
            $discountAmount = (int) $coupon->discount_value;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->type,
                'discount_value' => $coupon->discount_value,
                'discount_amount' => $discountAmount,
                'total_amount' => max(0, $subtotal - $discountAmount)
            ]
        ]);
    }
}
