<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\ProviderProfile;
use App\Models\Coupon;
use App\Services\RealtimeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    protected $realtimeService;

    public function __construct(RealtimeService $realtimeService)
    {
        $this->realtimeService = $realtimeService;
    }

    /**
     * Tạo đơn đặt chỗ mới (Tourist)
     * POST /api/bookings
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_id'   => 'required|integer|exists:services,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'nullable|date|after:check_in_date',
            'num_adults'  => 'required|integer|min:1|max:50',
            'num_children' => 'nullable|integer|min:0|max:20',
            'contact_name'  => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'special_requests' => 'nullable|string|max:1000',
            'coupon_code'  => 'nullable|string|max:50',
            'payment_method' => 'required|in:wallet,momo,vnpay,banking',
        ]);

        try {
            $service = Service::with('provider')->findOrFail($request->service_id);

            // Tính giá
            $basePrice = $service->base_price ?? $service->price ?? 0;
            $adultCount = (int) $request->num_adults;
            $childCount = (int) ($request->num_children ?? 0);
            $subtotal = $basePrice * $adultCount + ($basePrice * 0.5 * $childCount);

            // Kiểm tra & áp dụng coupon
            $discountAmount = 0;
            $appliedCoupon = null;
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', $request->coupon_code)
                    ->where('is_active', true)
                    ->whereNull('expires_at')
                    ->first()
                    ?? Coupon::where('code', $request->coupon_code)
                        ->where('is_active', true)
                        ->where('expires_at', '>', now())
                        ->first();

                if ($coupon) {
                    $coupon->increment('usage_count');
                    $appliedCoupon = $coupon;
                    if ($coupon->discount_type === 'percent') {
                        $discountAmount = (int) ($subtotal * $coupon->discount_value / 100);
                        if ($coupon->max_discount && $discountAmount > $coupon->max_discount) {
                            $discountAmount = $coupon->max_discount;
                        }
                    } else {
                        $discountAmount = (int) $coupon->discount_value;
                    }
                }
            }

            $totalAmount = max(0, $subtotal - $discountAmount);

            // Tạo booking
            $booking = DB::transaction(function () use ($request, $service, $adultCount, $childCount, $subtotal, $discountAmount, $totalAmount, $appliedCoupon) {
                $booking = Booking::create([
                    'booking_code' => 'BK-' . strtoupper(Str::random(6)) . '-' . date('ymd'),
                    'user_id' => $request->input('user.id'),
                    'service_id' => $service->id,
                    'provider_id' => $service->provider_id,
                    'check_in_date' => $request->check_in_date,
                    'check_out_date' => $request->check_out_date,
                    'num_adults' => $adultCount,
                    'num_children' => $childCount,
                    'contact_name' => $request->contact_name,
                    'contact_email' => $request->contact_email,
                    'contact_phone' => $request->contact_phone,
                    'special_requests' => $request->special_requests,
                    'coupon_id' => $appliedCoupon?->id,
                    'coupon_code' => $appliedCoupon?->code,
                    'discount_amount' => $discountAmount,
                    'subtotal' => $subtotal,
                    'total_amount' => $totalAmount,
                    'payment_method' => $request->payment_method,
                    'payment_status' => 'pending',
                    'status' => 'pending',
                ]);

                return $booking;
            });

            $booking->load(['service:id,name,slug,type,base_price', 'user:id,display_name,email']);

            // ========================
            // REALTIME NOTIFICATION
            // ========================
            // 1. Broadcast cho Admin
            $this->realtimeService->broadcastAdmin('BookingCreated', [
                'booking_id'    => $booking->id,
                'booking_code'  => $booking->booking_code,
                'service_id'   => $service->id,
                'service_name' => $service->name,
                'contact_name' => $booking->contact_name,
                'contact_email'=> $booking->contact_email,
                'contact_phone'=> $booking->contact_phone,
                'total_amount' => $totalAmount,
                'status'       => $booking->status,
                'created_at'   => $booking->created_at?->toISOString(),
            ]);

            // 2. Broadcast cho Provider liên quan
            if ($service->provider_id) {
                $this->realtimeService->broadcastProvider($service->provider_id, 'BookingCreated', [
                    'booking_id'    => $booking->id,
                    'booking_code'  => $booking->booking_code,
                    'service_id'   => $service->id,
                    'service_name' => $service->name,
                    'customer_name' => $booking->contact_name,
                    'customer_email'=> $booking->contact_email,
                    'total_amount' => $totalAmount,
                    'status'       => $booking->status,
                    'created_at'   => $booking->created_at?->toISOString(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Đặt chỗ thành công! Vui lòng hoàn tất thanh toán.',
                'data' => $booking
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Booking store error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo đơn đặt chỗ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách đặt chỗ của user hiện tại
     * GET /api/user/bookings
     */
    public function myBookings(Request $request)
    {
        $userId = $request->input('user.id');

        $bookings = Booking::with(['service:id,name,slug,type,base_price,images'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bk) {
                return [
                    'id' => $bk->id,
                    'booking_code' => $bk->booking_code,
                    'service' => $bk->service ? [
                        'id'   => $bk->service->id,
                        'name' => $bk->service->name,
                        'slug' => $bk->service->slug,
                        'type' => $bk->service->type,
                        'price' => $bk->service->base_price ?? $bk->service->price,
                        'image' => is_array($bk->service->images) ? ($bk->service->images[0] ?? null) : null,
                    ] : null,
                    'check_in_date' => $bk->check_in_date,
                    'check_out_date' => $bk->check_out_date,
                    'num_adults' => $bk->num_adults,
                    'num_children' => $bk->num_children,
                    'total_amount' => $bk->total_amount,
                    'payment_method' => $bk->payment_method,
                    'payment_status' => $bk->payment_status,
                    'status' => $bk->status,
                    'created_at' => $bk->created_at?->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }
}
