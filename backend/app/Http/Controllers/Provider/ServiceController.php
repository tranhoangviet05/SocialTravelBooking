<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    /**
     * Helper: Lấy profile của nhà cung cấp từ user đang đăng nhập
     */
    private function getProvider(Request $request)
    {
        $user = $request->input('user');
        if (!$user) return null;
        
        return ProviderProfile::where('user_id', $user->id)->first();
    }

    /**
     * Danh sách dịch vụ của chính nhà cung cấp đó
     */
    public function index(Request $request)
    {
        $provider = $this->getProvider($request);
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhà cung cấp.'], 404);
        }

        $services = Service::with(['category', 'location', 'media'])
            ->where('provider_id', $provider->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    /**
     * Tạo mới dịch vụ
     */
    public function store(Request $request)
    {
        $provider = $this->getProvider($request);
        if (!$provider) return response()->json(['success' => false, 'message' => 'Lỗi xác thực nhà cung cấp.'], 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:tour,hotel,homestay,vehicle',
            'category_id' => 'nullable|exists:categories,id',
            'location_id' => 'nullable|exists:locations,id',
            'base_price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'max_guests' => 'nullable|integer|min:1',
            'price_unit' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'url'
        ]);

        try {
            return DB::transaction(function () use ($validated, $provider) {
                // Tạo slug
                $slug = Str::slug($validated['name']) . '-' . Str::random(5);

                $service = Service::create([
                    'provider_id' => $provider->id,
                    'name' => $validated['name'],
                    'slug' => $slug,
                    'type' => $validated['type'],
                    'category_id' => $validated['category_id'] ?? null,
                    'location_id' => $validated['location_id'] ?? null,
                    'base_price' => $validated['base_price'],
                    'description' => $validated['description'] ?? '',
                    'address' => $validated['address'] ?? '',
                    'max_guests' => $validated['max_guests'] ?? null,
                    'price_unit' => $validated['price_unit'] ?? 'per_person',
                    'status' => 'pending_review' // Chờ admin duyệt
                ]);

                // Xử lý ảnh nếu có
                if (!empty($validated['images'])) {
                    foreach ($validated['images'] as $index => $url) {
                        ServiceMedia::create([
                            'service_id' => $service->id,
                            'url' => $url,
                            'is_cover' => ($index === 0),
                            'sort_order' => $index,
                            'type' => 'image'
                        ]);
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Đã tạo dịch vụ thành công, vui lòng chờ Admin duyệt.',
                    'data' => $service->load('media')
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết 1 dịch vụ (kiểm tra quyền sở hữu)
     */
    public function show(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::with(['media', 'category', 'location', 'schedules'])->findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền xem dịch vụ này.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    /**
     * Cập nhật dịch vụ
     */
    public function update(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền sửa dịch vụ này.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'base_price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'sometimes|in:draft,pending_review'
        ]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật dịch vụ thành công.',
            'data' => $service
        ]);
    }

    /**
     * Xóa dịch vụ (Soft delete)
     */
    public function destroy(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền xóa dịch vụ này.'], 403);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa dịch vụ thành công.'
        ]);
    }
}
