<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceAvailability;
use App\Models\HotelRoomType;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AvailabilityController extends Controller
{
    /**
     * Helper: Lấy profile của nhà cung cấp từ user đang đăng nhập
     */
    private function getProvider(Request $request)
    {
        $user = $request->input('user');
        if (!$user) return null;
        return \App\Models\ProviderProfile::where('user_id', $user->id)->first();
    }

    /**
     * Lấy danh sách trạng thái trong một khoảng thời gian
     * Kèm theo system_holidays để Frontend hiển thị overlay calendar toàn diện
     */
    public function index(Request $request, $serviceId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($serviceId);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $startDate = $request->get('start_date', Carbon::now()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->addDays(30)->toDateString());

        // Lấy trạng thái của dịch vụ này
        $availability = ServiceAvailability::where('service_id', $serviceId)
            ->whereBetween('available_date', [$startDate, $endDate])
            ->orderBy('available_date')
            ->get();

        // Lấy ngày lễ hệ thống trong cùng khoảng ngày để hiển thị overlay
        $systemHolidays = \App\Models\SystemHoliday::whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get(['id', 'date', 'name', 'type', 'description', 'is_block_booking']);

        return response()->json([
            'success'         => true,
            'data'            => $availability,
            'system_holidays' => $systemHolidays,
        ]);
    }

    /**
     * Cập nhật trạng thái hàng loạt (Bulk Update)
     */
    public function updateBatch(Request $request, $serviceId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($serviceId);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $validated = $request->validate([
            'dates'          => 'required|array|min:1',
            'dates.*'        => 'date_format:Y-m-d',
            'total_slots'    => 'required|integer|min:0',
            'price_override' => 'nullable|numeric|min:0',
            'is_blocked'     => 'boolean',
            // Mới: Lý do chặn ngày (chỉ cần khi is_blocked = true)
            'block_reason'   => 'nullable|string|max:255',
            'block_type'     => 'nullable|in:maintenance,staff_leave,private_event,fully_booked,other',
        ]);

        // Nếu is_blocked = false, xóa lý do chặn
        $isBlocked = $validated['is_blocked'] ?? false;
        $blockReason = $isBlocked ? ($validated['block_reason'] ?? null) : null;
        $blockType   = $isBlocked ? ($validated['block_type'] ?? null) : null;

        try {
            DB::transaction(function () use ($serviceId, $validated, $isBlocked, $blockReason, $blockType) {
                foreach ($validated['dates'] as $date) {
                    ServiceAvailability::updateOrCreate(
                        [
                            'service_id'     => $serviceId,
                            'available_date' => $date
                        ],
                        [
                            'total_slots'    => $validated['total_slots'],
                            'price_override' => $validated['price_override'] ?? null,
                            'is_blocked'     => $isBlocked,
                            'block_reason'   => $blockReason,
                            'block_type'     => $blockType,
                        ]
                    );
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái khả dụng thành công.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }
}
