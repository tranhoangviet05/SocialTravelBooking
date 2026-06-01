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

        $query = Service::with(['media', 'location', 'category', 'roomTypes'])
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
        try {
            $provider = $this->getProvider($request);
            if (!$provider) {
                return response()->json(['success' => false, 'message' => 'Lỗi xác thực nhà cung cấp: Không tìm thấy hồ sơ nhà cung cấp.'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|in:tour,hotel,homestay,vehicle',
                'category_id' => 'nullable|exists:categories,id',
                'location_id' => 'nullable|exists:locations,id',
                'base_price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'address' => 'nullable|string',
                'price_unit' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string|max:1000',
                
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

            DB::transaction(function () use ($validated, $provider, &$service) {
                // Tạo slug
                $slug = Str::slug($validated['name']) . '-' . Str::random(5);

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
                ];

                // Tạo dịch vụ với các trường cơ bản
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
                    'price_unit' => $validated['price_unit'] ?? 'per_person',
                    'status' => 'pending_review'
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
                if ($service->type === 'hotel') {
                    $service->roomTypes()->create([
                        'name' => 'Phòng Tiêu Chuẩn',
                        'rank' => 'standard',
                        'description' => 'Phòng tiêu chuẩn được tạo tự động từ thông tin cơ bản.',
                        'base_price' => $service->base_price,
                        'capacity_adults' => 2,
                        'total_bedrooms' => 1,
                        'total_bathrooms' => 1,
                        'status' => 'active'
                    ]);
                } elseif ($service->type === 'homestay') {
                    $service->roomTypes()->create([
                        'name' => 'Nguyên căn',
                        'rank' => 'entire_property',
                        'description' => 'Căn mặc định được tạo tự động.',
                        'base_price' => $service->base_price,
                        'inventory' => 1,
                        'capacity_adults' => $validated['max_guests'] ?? 2,
                        'total_bedrooms' => $validated['total_bedrooms'] ?? 1,
                        'total_bathrooms' => $validated['total_bathrooms'] ?? 1,
                        'status' => 'active'
                    ]);
                }
            });

            // Load relations cho response
            $service->load(['media', 'location', 'category', 'roomTypes']);

            // Phát sự kiện realtime
            broadcast(new \App\Events\AdminServiceUpdated($service, 'created'));

            // Gửi dữ liệu sang N8N kiểm duyệt (N8N sẽ phản hồi ngay lập tức nhờ chế độ Respond Immediately)
            $webhookUrl = config('services.n8n.moderation_url');
            if ($webhookUrl) {
                try {
                    \Illuminate\Support\Facades\Http::timeout(2)->post($webhookUrl, $service->toArray());
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Không thể gọi N8N Moderation Webhook: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã tạo dịch vụ thành công, vui lòng chờ Admin duyệt.',
                'data' => $service
            ], 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Provider ServiceController@store error: " . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
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
        try {
            $provider = $this->getProvider($request);
            if (!$provider) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhà cung cấp.'], 403);
            }

            $service = Service::with(['media', 'category', 'location', 'schedules'])->findOrFail($id);

            if ($service->provider_id !== $provider->id) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền xem dịch vụ này.'], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $service
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Provider ServiceController@show error for ID: {$id}: " . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xem chi tiết dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật dịch vụ
     */
    public function update(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info("Provider ServiceController@update called for ID: {$id}. Payload: ", $request->all());
        
        try {
            $provider = $this->getProvider($request);
            if (!$provider) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhà cung cấp.'], 403);
            }

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
                'price_unit' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string|max:1000',
                
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

            // Khi sửa, đẩy về trạng thái chờ duyệt lại
            $validated['status'] = 'pending_review';

            DB::transaction(function () use ($validated, $service) {
                // Tách images ra khỏi validated
                $images = $validated['images'] ?? null;
                unset($validated['images']);

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
                ], fn($v) => !is_null($v));

                $syncRoomTypeFields = [
                    'max_guests' => $validated['max_guests'] ?? null,
                    'total_bedrooms' => $validated['total_bedrooms'] ?? null,
                    'total_bathrooms' => $validated['total_bathrooms'] ?? null,
                    'base_price' => $validated['base_price'] ?? null,
                ];

                // Xóa các trường chi tiết khỏi validated của bảng chính services
                unset(
                    $validated['duration_days'], $validated['duration_nights'], $validated['max_guests'],
                    $validated['star_rating'], $validated['checkin_time'], $validated['checkout_time'],
                    $validated['total_bedrooms'], $validated['total_bathrooms'],
                    $validated['vehicle_type'], $validated['seats'], $validated['transmission'], $validated['fuel_type'], $validated['inventory']
                );

                // Cập nhật các thông tin cơ bản
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

                    // Đồng bộ dữ liệu qua loại phòng "Nguyên căn" mặc định nếu có
                    $defaultRoomType = $service->roomTypes()->where('name', 'Nguyên căn')->first();
                    if ($defaultRoomType) {
                        $defaultRoomType->update([
                            'capacity_adults' => $syncRoomTypeFields['max_guests'] ?? $defaultRoomType->capacity_adults,
                            'total_bedrooms' => $syncRoomTypeFields['total_bedrooms'] ?? $defaultRoomType->total_bedrooms,
                            'total_bathrooms' => $syncRoomTypeFields['total_bathrooms'] ?? $defaultRoomType->total_bathrooms,
                            'base_price' => $syncRoomTypeFields['base_price'] ?? $defaultRoomType->base_price,
                        ]);
                    }
                }

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
            });

            // Phát sự kiện realtime
            broadcast(new \App\Events\AdminServiceUpdated($service, 'updated'));

            // Gửi dữ liệu sang N8N kiểm duyệt lại (N8N sẽ phản hồi ngay lập tức nhờ chế độ Respond Immediately)
            $webhookUrl = config('services.n8n.moderation_url');
            if ($webhookUrl) {
                try {
                    \Illuminate\Support\Facades\Http::timeout(2)->post($webhookUrl, $service->toArray());
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Không thể gọi N8N Moderation Webhook: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dịch vụ thành công, vui lòng chờ Admin duyệt lại.',
                'data' => $service->load(['media', 'location', 'category', 'roomTypes'])
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Provider ServiceController@update error for ID: {$id}: " . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa dịch vụ (Soft delete) + dọn ảnh vật lý
     */
    public function destroy(Request $request, $id)
    {
        try {
            $provider = $this->getProvider($request);
            if (!$provider) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhà cung cấp.'], 403);
            }

            $service = Service::findOrFail($id);

            if ($service->provider_id !== $provider->id) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền xóa dịch vụ này.'], 403);
            }

            // Xóa toàn bộ ảnh vật lý trước khi soft delete
            foreach ($service->media()->pluck('url') as $url) {
                $this->deleteLocalImage($url);
            }

            $serviceName = $service->name;
            $service->delete();

            // Phát sự kiện realtime
            broadcast(new \App\Events\AdminServiceUpdated($id, 'deleted'));

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa dịch vụ thành công.'
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Provider ServiceController@destroy error for ID: {$id}: " . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa dịch vụ: ' . $e->getMessage()
            ], 500);
        }
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
            'rank'              => 'nullable|string|in:standard,premium,vip,entire_property',
            'description'       => 'nullable|string',
            'base_price'        => 'required|numeric|min:0',
            'inventory'         => 'required|integer|min:1',
            'capacity_adults'   => 'required|integer|min:1',
            'total_bedrooms'    => 'nullable|integer|min:1',
            'total_bathrooms'   => 'nullable|integer|min:1',
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
            'rank'              => 'sometimes|string|in:standard,premium,vip,entire_property',
            'description'       => 'nullable|string',
            'base_price'        => 'sometimes|numeric|min:0',
            'inventory'         => 'sometimes|integer|min:1',
            'capacity_adults'   => 'sometimes|integer|min:1',
            'total_bedrooms'    => 'nullable|integer|min:1',
            'total_bathrooms'   => 'nullable|integer|min:1',
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
