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
        $user = $request->user();
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

        $perPage = (int) $request->get('per_page', 8);
        $search = $request->get('search');
        $type = $request->get('type');

        $query = Service::with(['category', 'location', 'media', 'roomTypes:id,service_id,name,base_price,capacity_adults'])
            ->where('provider_id', $provider->id);

        if ($search) {
            $query->where('name', 'ilike', "%{$search}%");
        }
        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        $services = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page'    => $services->lastPage(),
                'per_page'     => $services->perPage(),
                'total'        => $services->total(),
            ]
        ]);
    }

    /**
     * Lấy tất cả dịch vụ kèm room_types (dành cho UpsellManager, không phân trang)
     */
    public function getWithRoomTypes(Request $request)
    {
        $provider = $this->getProvider($request);
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy nhà cung cấp.'], 404);
        }

        $services = Service::with(['roomTypes:id,service_id,name,base_price,capacity_adults'])
            ->where('provider_id', $provider->id)
            ->select('id', 'name', 'type', 'base_price')
            ->get();

        return response()->json(['success' => true, 'data' => $services]);
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
            'duration_days' => 'nullable|integer|min:0',
            'duration_nights' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string|max:1000'
        ]);

        try {
            DB::transaction(function () use ($validated, $provider, &$service) {
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
                    'duration_days' => $validated['duration_days'] ?? null,
                    'duration_nights' => $validated['duration_nights'] ?? null,
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                    'status' => 'pending_review'
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

                // TỰ ĐỘNG TẠO LOẠI PHÒNG MẶC ĐỊNH (cho Hotel/Homestay)
                if (in_array($service->type, ['hotel', 'homestay'])) {
                    $service->roomTypes()->create([
                        'name' => 'Phòng thường (Mặc định)',
                        'rank' => 'standard',
                        'description' => 'Phòng tiêu chuẩn được tạo tự động từ thông tin cơ bản.',
                        'base_price' => $service->base_price,
                        'total_rooms' => 1,
                        'capacity_adults' => $service->max_guests ?? 2,
                        'capacity_children' => 0,
                        'status' => 'active'
                    ]);
                }
            });

            // Load relations cho response
            $service->load('media');

            return response()->json([
                'success' => true,
                'message' => 'Đã tạo dịch vụ thành công, vui lòng chờ Admin duyệt.',
                'data' => $service
            ], 201);
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
            'type' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'location_id' => 'sometimes|exists:locations,id',
            'base_price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'max_guests' => 'nullable|integer|min:1',
            'price_unit' => 'nullable|string',
            'duration_days' => 'nullable|integer|min:0',
            'duration_nights' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string|max:1000'
        ]);

        // Khi sửa, đẩy về trạng thái chờ duyệt lại
        $validated['status'] = 'pending_review';

        try {
            DB::transaction(function () use ($validated, $service) {
                // 1. Tách images ra khỏi validated
                $images = $validated['images'] ?? null;
                unset($validated['images']);

                // 2. Cập nhật các thông tin cơ bản
                $service->update($validated);

                // 3. Nếu có gửi danh sách ảnh mới, cập nhật lại bảng service_media
                if ($images !== null) {
                    // Xóa ảnh cũ (hoặc có thể giữ lại tùy logic, ở đây là ghi đè danh sách mới)
                    $service->media()->delete();
                    
                    foreach ($images as $index => $url) {
                        \App\Models\ServiceMedia::create([
                            'service_id' => $service->id,
                            'url' => $url,
                            'is_cover' => ($index === 0),
                            'sort_order' => $index,
                            'type' => 'image'
                        ]);
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dịch vụ thành công, vui lòng chờ Admin duyệt lại.',
                'data' => $service->load('media')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật dịch vụ: ' . $e->getMessage()
            ], 500);
        }
        // Tách images ra trước, không được update trực tiếp lên bảng services
        $images = $validated['images'] ?? null;
        unset($validated['images']);

        // Đưa về chờ duyệt lại
        $validated['status'] = 'pending_review';
        $service->update($validated);

        // Nếu FE gửi danh sách images mới → đồng bộ service_media
        if ($images !== null) {
            // Lọc bỏ chuỗi rỗng
            $images = array_values(array_filter($images, fn($url) => !empty($url)));

            // Lấy ảnh cũ để so sánh
            $oldUrls = $service->media()->pluck('url')->toArray();

            // Tìm ảnh bị loại bỏ (có trong cũ nhưng không còn trong mới)
            $removedUrls = array_diff($oldUrls, $images);

            // Xóa file vật lý khỏi ổ đĩa (chỉ xóa ảnh local, bỏ qua Cloudinary)
            foreach ($removedUrls as $url) {
                $this->deleteLocalImage($url);
            }

            // Xóa media cũ rồi tạo lại
            $service->media()->delete();
            foreach ($images as $index => $url) {
                ServiceMedia::create([
                    'service_id' => $service->id,
                    'url'        => $url,
                    'is_cover'   => ($index === 0),
                    'sort_order' => $index,
                    'type'       => 'image',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật dịch vụ thành công, vui lòng chờ Admin duyệt lại.',
            'data'    => $service->load('media')
        ]);
    }

    /**
     * Xóa dịch vụ (Soft delete) + dọn ảnh vật lý
     */
    public function destroy(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền xóa dịch vụ này.'], 403);
        }

        // Xóa toàn bộ ảnh vật lý trước khi soft delete
        foreach ($service->media()->pluck('url') as $url) {
            $this->deleteLocalImage($url);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa dịch vụ thành công.'
        ]);
    }

    /**
     * Helper: Xóa file ảnh local khỏi ổ đĩa
     * Chỉ xóa ảnh lưu trong public/images/... (bỏ qua Cloudinary/external URL)
     */
    private function deleteLocalImage(string $url): void
    {
        // Chỉ xử lý path nội bộ, bỏ qua link ngoài (http/https)
        if (str_starts_with($url, 'http')) return;

        // Chuyển /images/... → đường dẫn vật lý
        $relativePath = ltrim($url, '/');
        $physicalPath = public_path($relativePath);

        if (file_exists($physicalPath)) {
            @unlink($physicalPath);
        }
    }

    // =============================================
    // LỊCH TRÌNH (Schedules) - Dành cho Tour
    // =============================================

    public function getSchedules(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::with('schedules')->findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $service->schedules->sortBy('day_number')->values()
        ]);
    }

    public function storeSchedule(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $validated = $request->validate([
            'day_number' => 'required|integer|min:1',
            'title'      => 'required|string|max:255',
            'description'=> 'nullable|string',
            'activities' => 'nullable|array',
            'meals'      => 'nullable|array',
        ]);

        $schedule = $service->schedules()->create($validated);

        return response()->json(['success' => true, 'data' => $schedule], 201);
    }

    public function updateSchedule(Request $request, $id, $scheduleId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $schedule = \App\Models\ServiceSchedule::where('service_id', $id)->findOrFail($scheduleId);

        $validated = $request->validate([
            'day_number' => 'sometimes|integer|min:1',
            'title'      => 'sometimes|string|max:255',
            'description'=> 'nullable|string',
            'activities' => 'nullable|array',
            'meals'      => 'nullable|array',
        ]);

        $schedule->update($validated);

        return response()->json(['success' => true, 'data' => $schedule]);
    }

    public function destroySchedule(Request $request, $id, $scheduleId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $schedule = \App\Models\ServiceSchedule::where('service_id', $id)->findOrFail($scheduleId);
        $schedule->delete();

        return response()->json(['success' => true, 'message' => 'Đã xóa ngày trong lịch trình.']);
    }

    // =============================================
    // TIỆN NGHI / BAO GỒM / KHÔNG BAO GỒM
    // =============================================

    public function updateAmenities(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $validated = $request->validate([
            'amenities' => 'nullable|array',
            'amenities.*' => 'string|max:100',
            'includes' => 'nullable|array',
            'includes.*' => 'string|max:100',
            'excludes' => 'nullable|array',
            'excludes.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        // amenities, includes, excludes là jsonb - có thể update bình thượng
        $service->update([
            'amenities' => $validated['amenities'] ?? $service->amenities ?? [],
            'includes'  => $validated['includes'] ?? $service->includes ?? [],
            'excludes'  => $validated['excludes'] ?? $service->excludes ?? [],
        ]);

        // tags là text[] trong PostgreSQL - phải dùng DB::statement
        if (array_key_exists('tags', $validated)) {
            $tags = $validated['tags'] ?? [];
            $tagsFormatted = '{' . implode(',', array_map(fn($t) => '"' . addslashes($t) . '"', $tags)) . '}';
            DB::statement('UPDATE services SET tags = ? WHERE id = ?', [$tagsFormatted, $service->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật tiện nghi dịch vụ.',
            'data'    => $service->fresh()
        ]);
    }

    // =============================================
    // QUẢN LÝ LOẠI PHÒNG (Room Types) - Dành cho Hotel
    // =============================================

    public function getRoomTypes(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::with('roomTypes')->findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $service->roomTypes
        ]);
    }

    public function storeRoomType(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'rank'              => 'nullable|string|in:standard,premium,vip',
            'description'       => 'nullable|string',
            'base_price'        => 'required|numeric|min:0',
            'total_rooms'       => 'required|integer|min:1',
            'inventory'         => 'required|integer|min:1',
            'capacity_adults'   => 'required|integer|min:1',
            'capacity_children' => 'nullable|integer|min:0',
            'amenities'         => 'nullable|array',
            'images'            => 'nullable|array',
        ]);

        $roomType = $service->roomTypes()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo loại phòng thành công.',
            'data' => $roomType
        ], 201);
    }

    public function updateRoomType(Request $request, $id, $roomTypeId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $roomType = \App\Models\HotelRoomType::where('service_id', $id)->findOrFail($roomTypeId);

        $validated = $request->validate([
            'name'              => 'sometimes|string|max:255',
            'rank'              => 'sometimes|string|in:standard,premium,vip',
            'description'       => 'nullable|string',
            'base_price'        => 'sometimes|numeric|min:0',
            'total_rooms'       => 'sometimes|integer|min:1',
            'inventory'         => 'sometimes|integer|min:1',
            'capacity_adults'   => 'sometimes|integer|min:1',
            'capacity_children' => 'nullable|integer|min:0',
            'amenities'         => 'nullable|array',
            'images'            => 'nullable|array',
            'status'            => 'sometimes|string|in:active,inactive',
        ]);

        $roomType->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật loại phòng thành công.',
            'data' => $roomType
        ]);
    }

    public function destroyRoomType(Request $request, $id, $roomTypeId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($id);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $roomType = \App\Models\HotelRoomType::where('service_id', $id)->findOrFail($roomTypeId);
        $roomType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa loại phòng thành công.'
        ]);
    }
}
