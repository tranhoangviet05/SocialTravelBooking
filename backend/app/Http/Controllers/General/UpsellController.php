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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UpsellController extends Controller
{
    /**
     * Tự động kiểm tra và gửi mail mời nâng cấp nếu đủ điều kiện
     */
    public static function checkAndNotifyUpsell(Booking $booking)
    {
        try {
            if (!$booking->relationLoaded('service')) {
                $booking->load('service');
            }

            if (!$booking->service || !in_array($booking->service->type, ['hotel', 'homestay']) || !$booking->room_type_id) {
                return;
            }

            $upsell = ServiceUpsell::where('trigger_service_id', $booking->service_id)
                ->where('trigger_room_type_id', $booking->room_type_id)
                ->where('trigger_quantity', '<=', 1)
                ->where('is_active', true)
                ->with(['targetRoomType'])
                ->first();

            if (!$upsell) {
                $upsell = ServiceUpsell::where('trigger_service_id', $booking->service_id)
                    ->whereNull('trigger_room_type_id')
                    ->where('is_active', true)
                    ->with(['targetRoomType'])
                    ->first();
            }

            if ($upsell && $upsell->target_room_type_id !== $booking->room_type_id) {
                // 1. Gửi Email mời nâng cấp
                Mail::to($booking->contact_email)->send(new UpsellInvitationMail($booking, $upsell));
                Log::info("Sent Upsell invitation email for Booking: " . $booking->booking_code);

                // 2. Trigger n8n Workflow (nếu có cấu hình)
                $n8nWebhook = config('services.n8n.upsell_url');
                if ($n8nWebhook) {
                    Http::post($n8nWebhook, [
                        'booking_id' => $booking->id,
                        'booking_code' => $booking->booking_code,
                        'customer_name' => $booking->contact_name,
                        'old_room' => optional($booking->roomType)->name ?? 'Standard',
                        'new_room' => optional($upsell->targetRoomType)->name ?? 'Premium',
                        'has_upsell' => true
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to process upsell trigger: " . $e->getMessage());
        }
    }

    /**
     * Quản lý danh sách Upsell cho Provider
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $upsells = ServiceUpsell::where('provider_id', $user->id)
            ->with(['triggerService', 'targetService', 'perkService', 'triggerRoomType', 'targetRoomType'])
            ->get();

        return response()->json(['success' => true, 'data' => $upsells]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $upsell = ServiceUpsell::updateOrCreate(
            [
                'provider_id' => $user->id,
                'trigger_service_id' => $request->trigger_service_id,
                'trigger_room_type_id' => $request->trigger_room_type_id,
            ],
            $request->all()
        );
        return response()->json(['success' => true, 'data' => $upsell]);
    }

    public function destroy($id)
    {
        ServiceUpsell::destroy($id);
        return response()->json(['success' => true]);
    }

    /**
     * Kiểm tra Upsell khả dụng cho giỏ hàng
     */
    public function checkAvailableUpsells(Request $request)
    {
        $items = $request->input('items', []);
        $availableUpsells = [];

        foreach ($items as $item) {
            $upsell = ServiceUpsell::where('trigger_service_id', $item['service_id'])
                ->where(function($q) use ($item) {
                    if (isset($item['room_type_id'])) {
                        $q->where('trigger_room_type_id', $item['room_type_id'])->orWhereNull('trigger_room_type_id');
                    } else {
                        $q->whereNull('trigger_room_type_id');
                    }
                })
                ->where('is_active', true)
                ->first();

            if ($upsell) {
                $upsell->load(['targetRoomType', 'targetService:id,name', 'perkService:id,name']);
                $availableUpsells[] = $upsell;
            }
        }
        return response()->json(['success' => true, 'data' => $availableUpsells]);
    }

    /**
     * Preview thông tin nâng cấp (Cho User)
     */
    public function getUpgradePreview(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $booking = Booking::with(['service', 'roomType'])->where('id', $id)->where('user_id', $user->id)->first();

            if (!$booking) {
                Log::warning("Upsell Preview: Booking not found or unauthorized", ['booking_id' => $id, 'user_id' => $user->id]);
                return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng.'], 404);
            }

            $upsell = ServiceUpsell::where('trigger_service_id', $booking->service_id)
                ->where(function($q) use ($booking) {
                    $q->where('trigger_room_type_id', $booking->room_type_id)->orWhereNull('trigger_room_type_id');
                })
                ->where('is_active', true)
                ->with(['targetRoomType', 'perkService', 'targetService'])
                ->orderByRaw('trigger_room_type_id IS NULL ASC')
                ->first();

            if (!$upsell) {
                Log::warning("Upsell Preview: No matching upsell rule found", ['service_id' => $booking->service_id, 'room_type_id' => $booking->room_type_id]);
                return response()->json(['success' => false, 'message' => 'Không có nâng cấp phù hợp.'], 404);
            }

            $oldPrice = (float)$booking->total_amount;
            $newBasePrice = (float)($upsell->targetRoomType?->base_price ?? $booking->service?->base_price ?? 0);
            
            $nights = 1;
            if ($booking->check_in_date && $booking->check_out_date) {
                $nights = Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date)) ?: 1;
            }
            
            $newRoomTotal = $newBasePrice * $nights;
            $perkData = null;
            if ($upsell->perkService) {
                $perkPrice = (float)$upsell->perkService->base_price;
                $discount = (int)$upsell->perk_discount_percent;
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
                        'difference' => max(0, $newTotal - $oldPrice),
                    ],
                    'perk' => $perkData
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Preview Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Thực hiện Upgrade Booking
     */
    public function upgradeBooking(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Vui lòng đăng nhập.'], 401);
            }

            $oldBooking = Booking::where('id', $id)->where('user_id', $user->id)->firstOrFail();
            
            if (!in_array($oldBooking->status, ['confirmed', 'paid'])) {
                return response()->json(['success' => false, 'message' => 'Trạng thái đơn hàng không hợp lệ.'], 400);
            }

            return DB::transaction(function() use ($oldBooking) {
                $upsell = ServiceUpsell::where('trigger_service_id', $oldBooking->service_id)
                    ->where(function($q) use ($oldBooking) {
                        $q->where('trigger_room_type_id', $oldBooking->room_type_id)->orWhereNull('trigger_room_type_id');
                    })
                    ->where('is_active', true)
                    ->with(['targetRoomType', 'perkService'])
                    ->first();

                if (!$upsell) {
                    throw new \Exception("Ưu đãi không còn khả dụng.");
                }

                $newBooking = $oldBooking->replicate();
                $newBooking->booking_code = 'UP-' . strtoupper(Str::random(6)) . '-' . date('ymd');
                $newBooking->room_type_id = $upsell->target_room_type_id;
                
                $nights = 1;
                if ($oldBooking->check_in_date && $oldBooking->check_out_date) {
                    $nights = Carbon::parse($oldBooking->check_in_date)->diffInDays(Carbon::parse($oldBooking->check_out_date)) ?: 1;
                }

                $newRoomAmount = ($upsell->targetRoomType?->base_price ?? $oldBooking->service?->base_price) * $nights;
                $perkAmount = 0;
                if ($upsell->perk_service_id && $upsell->perkService) {
                    $perkAmount = $upsell->perkService->base_price * (1 - $upsell->perk_discount_percent/100);
                    $newBooking->special_requests .= "\n[Upgraded Perk: " . $upsell->perkService->name . "]";
                }

                $newBooking->total_amount = $newRoomAmount + $perkAmount;
                $newBooking->payment_status = 'paid';
                $newBooking->save();

                $oldBooking->update([
                    'status' => 'cancelled',
                    'description' => $oldBooking->description . " (Upgraded to " . $newBooking->booking_code . ")"
                ]);

                if ($oldBooking->room_type_id) {
                    HotelRoomType::find($oldBooking->room_type_id)?->increment('inventory');
                }
                if ($newBooking->room_type_id) {
                    HotelRoomType::find($newBooking->room_type_id)?->decrement('inventory');
                }

                return response()->json(['success' => true, 'data' => $newBooking]);
            });
        } catch (\Exception $e) {
            Log::error("Upgrade Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
