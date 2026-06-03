<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
    /**
     * Lấy danh sách TẤT CẢ dịch vụ (Admin xem toàn bộ, bao gồm draft/rejected)
     * GET /api/admin/services
     */
    public function index(Request $request)
    {
        $query = Service::with(['provider.user:id,display_name,email', 'category:id,name', 'location:id,name', 'media']);

        // Lọc theo type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Lọc theo status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Tìm kiếm
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('slug', 'ilike', "%{$search}%")
                  ->orWhere('address', 'ilike', "%{$search}%");
            });
        }

        $services = $query->orderByRaw("CASE WHEN status = 'pending_review' THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết một dịch vụ
     * GET /api/admin/services/{id}
     */
    public function show($id)
    {
        $service = Service::with(['provider.user:id,display_name,email', 'category', 'location', 'media', 'schedules', 'reviews.user:id,display_name', 'roomTypes'])
            ->find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    /**
     * Tạo dịch vụ mới (Admin tạo trực tiếp)
     * POST /api/admin/services
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider_id' => 'required|uuid|exists:provider_profiles,id',
            'category_id' => 'nullable|integer|exists:categories,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:tour,hotel,homestay,vehicle',
            'status' => 'nullable|in:draft,pending_review,active,rejected',
            'base_price' => 'required|numeric|min:0',
            'price_unit' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'amenities' => 'nullable|array',
            'includes' => 'nullable|array',
            'excludes' => 'nullable|array',
            
            // CTI Tour fields
            'duration_days' => 'nullable|integer|min:0',
            'duration_nights' => 'nullable|integer|min:0',
            
            // CTI Homestay/Tour capacity
            'max_guests' => 'nullable|integer|min:1',
            
            // CTI Hotel fields
            'star_rating' => 'nullable|integer|min:1|max:5',
            'checkin_time' => 'nullable|string|max:10',
            'checkout_time' => 'nullable|string|max:10',
            
            // CTI Homestay fields
            'total_bedrooms' => 'nullable|integer|min:1',
            'total_bathrooms' => 'nullable|integer|min:1',
            
            // CTI Vehicle fields
            'vehicle_type' => 'nullable|string|max:50',
            'seats' => 'nullable|integer|min:1',
            'transmission' => 'nullable|string|max:50',
            'fuel_type' => 'nullable|string|max:50',
            'inventory' => 'nullable|integer|min:1',
        ]);

        // Tạo slug tự động
        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(6);
        $validated['status'] = $validated['status'] ?? 'active'; // Admin tạo → mặc định active

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($validated, &$service) {
                // Tách các trường chi tiết
                $tourFields = [
                    'duration_days' => $validated['duration_days'] ?? 1,
                    'duration_nights' => $validated['duration_nights'] ?? 0,
                    'max_guests' => $validated['max_guests'] ?? 50,
                ];

                $vehicleFields = [
                    'vehicle_type' => $validated['vehicle_type'] ?? null,
                    'seats' => $validated['seats'] ?? null,
                    'transmission' => $validated['transmission'] ?? null,
                    'fuel_type' => $validated['fuel_type'] ?? null,
                    'inventory' => $validated['inventory'] ?? 1,
                ];

                $hotelFields = [
                    'star_rating' => $validated['star_rating'] ?? null,
                    'checkin_time' => $validated['checkin_time'] ?? '14:00',
                    'checkout_time' => $validated['checkout_time'] ?? '12:00',
                ];

                $homestayFields = [
                    'checkin_time' => $validated['checkin_time'] ?? '14:00',
                    'checkout_time' => $validated['checkout_time'] ?? '12:00',
                    'max_guests' => $validated['max_guests'] ?? 2,
                    'total_bedrooms' => $validated['total_bedrooms'] ?? 1,
                    'total_bathrooms' => $validated['total_bathrooms'] ?? 1,
                ];

                // Tạo dịch vụ với các trường cơ bản
                $service = Service::create([
                    'provider_id' => $validated['provider_id'],
                    'name' => $validated['name'],
                    'slug' => $validated['slug'],
                    'type' => $validated['type'],
                    'category_id' => $validated['category_id'] ?? null,
                    'location_id' => $validated['location_id'] ?? null,
                    'base_price' => $validated['base_price'],
                    'description' => $validated['description'] ?? '',
                    'address' => $validated['address'] ?? '',
                    'price_unit' => $validated['price_unit'] ?? 'per_person',
                    'status' => $validated['status'],
                    'amenities' => $validated['amenities'] ?? [],
                    'includes' => $validated['includes'] ?? [],
                    'excludes' => $validated['excludes'] ?? []
                ]);

                // Tạo bản ghi tương ứng trong bảng chi tiết
                if ($service->type === 'tour') {
                    $service->tourDetail()->create($tourFields);
                } elseif ($service->type === 'vehicle') {
                    $service->vehicleDetail()->create($vehicleFields);
                } elseif ($service->type === 'hotel') {
                    $service->hotelDetail()->create($hotelFields);
                } elseif ($service->type === 'homestay') {
                    $service->homestayDetail()->create($homestayFields);
                }
            });

            $service->load(['provider.user:id,display_name,email', 'category:id,name', 'location:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Tạo dịch vụ thành công',
                'data' => $service
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Create service error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật dịch vụ
     * PUT /api/admin/services/{id}
     */
    public function update(Request $request, $id)
    {
        $service = Service::find($id);
        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ'
            ], 404);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|integer|exists:categories,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:tour,hotel,homestay,vehicle',
            'status' => 'nullable|in:draft,pending_review,active,rejected',
            'rejection_reason' => 'nullable|string',
            'base_price' => 'sometimes|numeric|min:0',
            'price_unit' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'amenities' => 'nullable|array',
            'includes' => 'nullable|array',
            'excludes' => 'nullable|array',
            
            // CTI Tour fields
            'duration_days' => 'nullable|integer|min:0',
            'duration_nights' => 'nullable|integer|min:0',
            
            // CTI Homestay/Tour capacity
            'max_guests' => 'nullable|integer|min:1',
            
            // CTI Hotel fields
            'star_rating' => 'nullable|integer|min:1|max:5',
            'checkin_time' => 'nullable|string|max:10',
            'checkout_time' => 'nullable|string|max:10',
            
            // CTI Homestay fields
            'total_bedrooms' => 'nullable|integer|min:1',
            'total_bathrooms' => 'nullable|integer|min:1',
            
            // CTI Vehicle fields
            'vehicle_type' => 'nullable|string|max:50',
            'seats' => 'nullable|integer|min:1',
            'transmission' => 'nullable|string|max:50',
            'fuel_type' => 'nullable|string|max:50',
            'inventory' => 'nullable|integer|min:1',
        ]);

        // Cập nhật slug nếu tên thay đổi
        if (isset($validated['name']) && $validated['name'] !== $service->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(6);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $service) {
                // Tách các trường chi tiết
                $tourFields = array_filter([
                    'duration_days' => $validated['duration_days'] ?? null,
                    'duration_nights' => $validated['duration_nights'] ?? null,
                    'max_guests' => $validated['max_guests'] ?? null,
                ], fn($v) => !is_null($v));

                $vehicleFields = array_filter([
                    'vehicle_type' => $validated['vehicle_type'] ?? null,
                    'seats' => $validated['seats'] ?? null,
                    'transmission' => $validated['transmission'] ?? null,
                    'fuel_type' => $validated['fuel_type'] ?? null,
                    'inventory' => $validated['inventory'] ?? null,
                ], fn($v) => !is_null($v));

                $hotelFields = array_filter([
                    'star_rating' => $validated['star_rating'] ?? null,
                    'checkin_time' => $validated['checkin_time'] ?? null,
                    'checkout_time' => $validated['checkout_time'] ?? null,
                ], fn($v) => !is_null($v));

                $homestayFields = array_filter([
                    'checkin_time' => $validated['checkin_time'] ?? null,
                    'checkout_time' => $validated['checkout_time'] ?? null,
                    'max_guests' => $validated['max_guests'] ?? null,
                    'total_bedrooms' => $validated['total_bedrooms'] ?? null,
                    'total_bathrooms' => $validated['total_bathrooms'] ?? null,
                ], fn($v) => !is_null($v));

                // Xóa các trường chi tiết khỏi validated của bảng chính services
                unset(
                    $validated['duration_days'], $validated['duration_nights'], $validated['max_guests'],
                    $validated['star_rating'], $validated['checkin_time'], $validated['checkout_time'],
                    $validated['total_bedrooms'], $validated['total_bathrooms'],
                    $validated['vehicle_type'], $validated['seats'], $validated['transmission'], $validated['fuel_type'], $validated['inventory']
                );

                $service->update($validated);

                // Cập nhật hoặc tạo mới thông tin chi tiết
                if ($service->type === 'tour' && !empty($tourFields)) {
                    $service->tourDetail()->updateOrCreate([], $tourFields);
                } elseif ($service->type === 'vehicle' && !empty($vehicleFields)) {
                    $service->vehicleDetail()->updateOrCreate([], $vehicleFields);
                } elseif ($service->type === 'hotel' && !empty($hotelFields)) {
                    $service->hotelDetail()->updateOrCreate([], $hotelFields);
                } elseif ($service->type === 'homestay' && !empty($homestayFields)) {
                    $service->homestayDetail()->updateOrCreate([], $homestayFields);
                }
            });

            $service->load(['provider.user:id,display_name,email', 'category:id,name', 'location:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dịch vụ thành công',
                'data' => $service
            ]);
        } catch (\Throwable $e) {
            Log::error('Update service error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa dịch vụ (soft delete)
     * DELETE /api/admin/services/{id}
     */
    public function destroy($id)
    {
        $service = Service::find($id);
        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ'
            ], 404);
        }

        $service->delete(); // Soft delete vì model có SoftDeletes

        return response()->json([
            'success' => true,
            'message' => 'Xóa dịch vụ thành công'
        ]);
    }

    /**
     * PATCH /api/admin/services/{id}/status
     * Duyệt hoặc từ chối dịch vụ
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,rejected',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);

        $service = Service::with('provider.user')->findOrFail($id);

        try {
            $service->status = $request->status;
            if ($request->status === 'rejected') {
                $service->rejection_reason = $request->rejection_reason;
            } else {
                $service->rejection_reason = null; // Xóa lý do nếu duyệt
                $service->approval_note = 'Được phê duyệt bởi ADMIN';
            }
            $service->save();

            // Notify Provider
            if ($service->provider && $service->provider->user_id) {
                broadcast(new \App\Events\ProviderServiceStatusUpdated(
                    $service->provider->user_id,
                    $service->id,
                    $service->name,
                    $service->status,
                    $service->rejection_reason,
                    $service->approval_note
                ));
            }
            
            // Notify Public (Tourists on frontend)
            broadcast(new \App\Events\PublicServiceStatusUpdated(
                $service->id,
                $service->status
            ));
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái dịch vụ thành công',
                'data' => $service
            ]);
        } catch (\Throwable $e) {
            Log::error('Update status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}
