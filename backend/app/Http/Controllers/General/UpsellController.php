<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\ServiceUpsell;
use App\Models\Service;
use App\Models\Booking;
use App\Models\HotelRoomType;
use App\Mail\UpsellInvitationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpsellController extends Controller
{
    /**
     * Tự động kiểm tra và gửi mail mời nâng cấp nếu đủ điều kiện
     * Được gọi từ PaymentController sau khi thanh toán thành công
     */
    public static function checkAndNotifyUpsell(Booking $booking)
    {
        try {
            if (!$booking->relationLoaded('service')) {
                $booking->load('service');
            }
            
            // Chỉ áp dụng cho Hotel/Homestay có room_type_id
            if (!$booking->service || !in_array($booking->service->type, ['hotel', 'homestay']) || !$booking->room_type_id) {
                return;
            }

            $upsell = ServiceUpsell::where('trigger_service_id', $booking->service_id)
                ->where('trigger_room_type_id', $booking->room_type_id)
                ->where('trigger_quantity', '<=', 1) // Thường 1 phòng cũng có thể upsell nếu quy tắc cho phép
                ->where('is_active', true)
                ->with(['targetRoomType'])
                ->first();

            // Nếu không khớp chính xác room_type, thử luật chung cho toàn service
            if (!$upsell) {
                $upsell = ServiceUpsell::where('trigger_service_id', $booking->service_id)
                    ->whereNull('trigger_room_type_id')
                    ->where('is_active', true)
                    ->with(['targetRoomType'])
                    ->first();
            }

            if ($upsell && $upsell->target_room_type_id !== $booking->room_type_id) {
                Mail::to($booking->contact_email)->send(new UpsellInvitationMail($booking, $upsell));
                Log::info("Sent Upsell invitation email for Booking: " . $booking->booking_code);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send upsell email: " . $e->getMessage());
        }
    }
    /**
     * Lấy danh sách upsell của nhà cung cấp hiện tại
     * GET /api/provider/upsells
     */
    public function getProviderUpsells(Request $request)
    {
        $user = $request->user();

        // Lấy provider_id từ ProviderProfile nếu cần
        $providerId = $user->id;

        $upsells = ServiceUpsell::where('provider_id', $providerId)
            ->with([
                'triggerService:id,name,type,base_price',
                'targetService:id,name,type,base_price',
                'perkService:id,name,type,base_price',
                'triggerRoomType:id,service_id,name,base_price,capacity_adults',
                'targetRoomType:id,service_id,name,base_price,capacity_adults',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $upsells,
        ]);
    }

    /**
     * Tạo mới một chiến dịch Upsell
     * POST /api/provider/upsells
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'trigger_service_id'    => 'required|uuid|exists:services,id',
            'trigger_room_type_id'  => 'nullable|exists:hotel_room_types,id',
            'trigger_quantity'      => 'required|integer|min:1',
            'target_service_id'     => 'required|uuid|exists:services,id',
            'target_room_type_id'   => 'nullable|exists:hotel_room_types,id',
            'perk_service_id'       => 'nullable|uuid|exists:services,id',
            'perk_discount_percent' => 'nullable|integer|min:0|max:100',
            'description'           => 'nullable|string|max:500',
            'is_active'             => 'boolean',
        ]);

        // Gán provider_id từ user đang đăng nhập
        $validated['provider_id'] = $request->user()->id;

        // Mặc định perk_discount_percent = 100 nếu có perk nhưng không nhập %
        if (!empty($validated['perk_service_id']) && !isset($validated['perk_discount_percent'])) {
            $validated['perk_discount_percent'] = 100;
        }

        // Kiểm tra logic: trigger_room_type phải thuộc trigger_service
        if (!empty($validated['trigger_room_type_id'])) {
            $rt = \App\Models\HotelRoomType::find($validated['trigger_room_type_id']);
            if (!$rt || $rt->service_id !== $validated['trigger_service_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Loại phòng kích hoạt không thuộc dịch vụ đã chọn.'
                ], 422);
            }
        }

        // Kiểm tra logic: target_room_type phải thuộc target_service (cùng khách sạn)
        if (!empty($validated['target_room_type_id'])) {
            $rt = \App\Models\HotelRoomType::find($validated['target_room_type_id']);
            if (!$rt || $rt->service_id !== $validated['target_service_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Loại phòng nâng cấp không thuộc dịch vụ đã chọn.'
                ], 422);
            }

            // Kiểm tra: không được chọn cùng loại phòng
            if ($validated['trigger_room_type_id'] === $validated['target_room_type_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Loại phòng kích hoạt và loại phòng nâng cấp phải khác nhau.'
                ], 422);
            }
        }

        $upsell = ServiceUpsell::create($validated);

        // Load relationships để trả về
        $upsell->load([
            'triggerService:id,name,type',
            'targetService:id,name,type',
            'perkService:id,name,type,base_price',
            'triggerRoomType:id,service_id,name,base_price',
            'targetRoomType:id,service_id,name,base_price',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $upsell,
        ], 201);
    }

    /**
     * Xóa một chiến dịch Upsell
     * DELETE /api/provider/upsells/{id}
     */
    public function destroy(Request $request, $id)
    {
        $upsell = ServiceUpsell::where('id', $id)
            ->where('provider_id', $request->user()->id)
            ->firstOrFail();

        $upsell->delete();

        return response()->json(['success' => true, 'message' => 'Đã xóa chiến dịch.']);
    }

    /**
     * Dành cho n8n: Lấy toàn bộ quy tắc active
     * GET /api/n8n/upsells/internal-list
     */
    public function getInternalUpsells()
    {
        return response()->json([
            'success' => true,
            'data'    => ServiceUpsell::where('is_active', true)
                ->with([
                    'triggerService:id,name,type',
                    'targetService:id,name,type,base_price',
                    'perkService:id,name,type,base_price',
                    'triggerRoomType:id,service_id,name,base_price',
                    'targetRoomType:id,service_id,name,base_price',
                ])
                ->get()
        ]);
    }

    /**
     * Kiểm tra upsell phù hợp khi khách đang checkout
     * POST /api/upsells/check
     */
    public function checkAvailableUpsells(Request $request)
    {
        $request->validate([
            'items'                => 'required|array',
            'items.*.service_id'   => 'required|uuid',
            'items.*.room_type_id' => 'nullable|string',
            'items.*.quantity'     => 'required|integer|min:1',
        ]);

        $availableUpsells = [];

        foreach ($request->items as $item) {
            $serviceId  = $item['service_id'];
            $roomTypeId = $item['room_type_id'] ?? null;
            $quantity   = $item['quantity'];

            $query = ServiceUpsell::where('trigger_service_id', $serviceId)
                ->where('trigger_quantity', '<=', $quantity)
                ->where('is_active', true);

            // Nếu có room_type_id, ưu tiên lọc chính xác; fallback ra null (áp dụng toàn dịch vụ)
            if ($roomTypeId) {
                $exact = (clone $query)->where('trigger_room_type_id', $roomTypeId)->first();
                $upsell = $exact ?? $query->whereNull('trigger_room_type_id')->first();
            } else {
                $upsell = $query->whereNull('trigger_room_type_id')->first();
            }

            if ($upsell) {
                $upsell->load([
                    'targetService:id,name,type,base_price',
                    'targetRoomType:id,service_id,name,base_price,capacity_adults',
                    'perkService:id,name,type,base_price',
                ]);
                $availableUpsells[] = $upsell;
            }
        }

        return response()->json([
            'success' => true,
            'data'    => $availableUpsells,
        ]);
    }

    /**
     * Xem trước thông tin nâng cấp cho một đơn hàng
     * GET /api/user/bookings/{id}/upsell-preview
     */
    public function getUpgradePreview(Request $request, $id)
    {
        $userId = $request->user->id;
        $booking = Booking::with(['service', 'roomType'])
            ->where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        // Tìm quy tắc upsell áp dụng
        $upsell = ServiceUpsell::where('trigger_service_id', $booking->service_id)
            ->where(function($q) use ($booking) {
                $q->where('trigger_room_type_id', $booking->room_type_id)
                  ->orWhereNull('trigger_room_type_id');
            })
            ->where('is_active', true)
            ->with([
                'targetRoomType',
                'perkService:id,name,type,base_price',
                'targetService:id,name,type,base_price'
            ])
            ->orderByRaw('trigger_room_type_id IS NULL ASC') // Ưu tiên exact match
            ->first();

        if (!$upsell) {
            return response()->json(['success' => false, 'message' => 'Đơn hàng này không có chương trình nâng cấp phù hợp.'], 404);
        }

        // Tính toán chênh lệch
        $oldPrice = (float) $booking->total_amount;
        
        // Giả định nâng cấp lên 1 phòng target (vì upsell thường là dồn nhiều phòng nhỏ thành 1 phòng lớn)
        $newBasePrice = (float) $upsell->targetRoomType->base_price;
        
        // Tính số đêm từ booking cũ
        $nights = 1;
        if ($booking->check_in_date && $booking->check_out_date) {
            $nights = $booking->check_in_date->diffInDays($booking->check_out_date);
            if ($nights < 1) $nights = 1;
        }
        
        $newRoomTotal = $newBasePrice * $nights;
        
        // Perk discount
        $perkData = null;
        if ($upsell->perkService) {
            $perkPrice = (float) $upsell->perkService->base_price;
            $discount = (int) $upsell->perk_discount_percent;
            $finalPerkPrice = $perkPrice * (1 - $discount/100);
            $perkData = [
                'service' => $upsell->perkService,
                'original_price' => $perkPrice,
                'final_price' => $finalPerkPrice,
                'savings' => $perkPrice - $finalPerkPrice
            ];
            $newTotal = $newRoomTotal + $finalPerkPrice;
        } else {
            $newTotal = $newRoomTotal;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'booking' => $booking,
                'upsell' => $upsell,
                'comparison' => [
                    'old_total' => $oldPrice,
                    'new_total' => $newTotal,
                    'difference' => $newTotal - $oldPrice,
                ],
                'perk' => $perkData
            ]
        ]);
    }

    /**
     * Thực hiện nâng cấp đơn hàng
     * POST /api/user/bookings/{id}/upgrade
     */
    public function upgradeBooking(Request $request, $id)
    {
        $userId = $request->user->id;
        $oldBooking = Booking::where('id', $id)->where('user_id', $userId)->firstOrFail();
        
        if ($oldBooking->status === 'cancelled' || $oldBooking->status === 'completed') {
            return response()->json(['success' => false, 'message' => 'Đơn hàng không ở trạng thái hợp lệ để nâng cấp.'], 400);
        }

        return DB::transaction(function() use ($oldBooking, $request) {
            // 1. Tìm lại upsell để lấy giá mới nhất
            $upsell = ServiceUpsell::where('trigger_service_id', $oldBooking->service_id)
                ->where(function($q) use ($oldBooking) {
                    $q->where('trigger_room_type_id', $oldBooking->room_type_id)
                      ->orWhereNull('trigger_room_type_id');
                })
                ->where('is_active', true)
                ->first();

            if (!$upsell) throw new \Exception("Quy tắc nâng cấp không còn hiệu lực.");

            // 2. Tạo đơn hàng mới (Dòng này đáp ứng "xoá đơn cũ hiển thị đơn mới")
            $newBooking = $oldBooking->replicate();
            $newBooking->booking_code = 'UP-' . strtoupper(\Illuminate\Support\Str::random(6)) . '-' . date('ymd');
            $newBooking->room_type_id = $upsell->target_room_type_id;
            
            // Tính lại tiền
            $nights = $oldBooking->check_in_date->diffInDays($oldBooking->check_out_date) ?: 1;
            $newRoomAmount = $upsell->targetRoomType->base_price * $nights;
            
            $perkAmount = 0;
            if ($upsell->perk_service_id) {
                $perkAmount = $upsell->perkService->base_price * (1 - $upsell->perk_discount_percent/100);
                // Bạn có thể lưu thông tin perk vào một bảng booking_items nếu hệ thống có, 
                // ở đây ta tạm cộng vào total_amount và ghi vào special_requests
                $newBooking->special_requests .= "\n[Upsell Perk: " . $upsell->perkService->name . "]";
            }

            $newBooking->total_amount = $newRoomAmount + $perkAmount;
            $newBooking->status = $oldBooking->status;
            $newBooking->payment_status = 'paid'; // Giả định thanh toán chênh lệch thành công hoặc xử lý sau
            $newBooking->save();

            // 3. Hủy đơn hàng cũ
            $oldBooking->update([
                'status' => 'cancelled',
                'description' => $oldBooking->description . " (Đã nâng cấp lên đơn " . $newBooking->booking_code . ")"
            ]);

            // Trả lại inventory cho phòng cũ
            $oldRT = HotelRoomType::find($oldBooking->room_type_id);
            if ($oldRT) $oldRT->increment('inventory');

            // Trừ inventory cho phòng mới
            $newRT = HotelRoomType::find($newBooking->room_type_id);
            if ($newRT) $newRT->decrement('inventory');

            return response()->json([
                'success' => true,
                'message' => 'Nâng cấp thành công! Đơn hàng mới của bạn là ' . $newBooking->booking_code,
                'data' => $newBooking
            ]);
        });
    }
}
