<?php

namespace App\Http\Controllers\Internal;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatbotController extends Controller
{
    /**
     * Lấy danh sách booking của user cho N8N Tool
     */
    public function getUserBookings($userId): JsonResponse
    {
        $bookings = Booking::where('user_id', $userId)
            ->with(['service:id,name,type'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        if ($bookings->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Người dùng chưa có đơn đặt chỗ nào.',
                'data' => []
            ]);
        }

        $formattedBookings = $bookings->map(function ($booking) {
            return [
                'booking_code' => $booking->booking_code,
                'service_name' => $booking->service->name,
                'service_type' => $booking->service->type,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
                'total_amount' => $booking->total_amount,
                'check_in_date' => $booking->check_in_date
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedBookings
        ]);
    }

    /**
     * Tìm kiếm dịch vụ cho N8N Tool
     */
    public function searchServices(Request $request): JsonResponse
    {
        $query = Service::where('status', 'active')->with(['location:id,name']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('location')) {
            $location = $request->location;
            $query->whereHas('location', function ($q) use ($location) {
                $q->where('name', 'LIKE', '%' . $location . '%');
            });
        }

        $services = $query->orderBy('total_bookings', 'desc')->limit(5)->get();

        if ($services->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Không tìm thấy dịch vụ nào phù hợp.',
                'data' => []
            ]);
        }

        $formattedServices = $services->map(function ($service) {
            return [
                'id' => $service->id,
                'slug' => $service->slug,
                'name' => $service->name,
                'type' => $service->type,
                'location' => $service->location->name ?? 'N/A',
                'price' => $service->base_price,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedServices
        ]);
    }
}
