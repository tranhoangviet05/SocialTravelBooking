<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ProviderProfile;
use App\Services\RealtimeService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $realtimeService;

    public function __construct(RealtimeService $realtimeService)
    {
        $this->realtimeService = $realtimeService;
    }

    private function getProvider(Request $request)
    {
        $user = $request->input('user');
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
            $query->where('status', $request->status);
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
     */
    public function updateStatus(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $booking = Booking::findOrFail($id);

        if ($booking->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền cập nhật đơn này.'], 403);
        }

        $request->validate([
            'status' => 'required|in:confirmed,ongoing,completed,cancelled'
        ]);

        $newStatus = $request->status;

        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['ongoing', 'cancelled'],
            'ongoing' => ['completed'],
        ];

        $currentStatus = $booking->status;
        if (!isset($validTransitions[$currentStatus]) || !in_array($newStatus, $validTransitions[$currentStatus])) {
            return response()->json([
                'success' => false,
                'message' => "Không thể chuyển từ trạng thái '{$currentStatus}' sang '{$newStatus}'."
            ], 422);
        }

        $booking->status = $newStatus;

        if ($newStatus === 'cancelled') {
            $booking->cancel_reason = $request->input('cancel_reason', 'Bị hủy bởi nhà cung cấp');
            $booking->cancelled_at = now();
        }

        $booking->save();

        // ========================
        // REALTIME NOTIFICATION
        // ========================
        $eventName = $newStatus === 'cancelled' ? 'BookingCancelled'
            : ($newStatus === 'confirmed' ? 'BookingConfirmed' : 'BookingUpdated');

        // Notify Admin
        $this->realtimeService->broadcastAdmin('BookingUpdated', [
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'service_id' => $booking->service_id,
            'service_name' => $booking->service?->name,
            'contact_name' => $booking->contact_name,
            'old_status' => $currentStatus,
            'new_status' => $newStatus,
            'provider_id' => $provider->id,
            'updated_at' => $booking->updated_at?->toISOString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn đặt chỗ thành công.',
            'data' => $booking->load(['user', 'service'])
        ]);
    }
}
