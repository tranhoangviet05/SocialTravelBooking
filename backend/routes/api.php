<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Social Travel Booking
|--------------------------------------------------------------------------
| Tiền tố: /api (ví dụ: GET /api/ping)
|
| Middleware 'firebase.auth':
|   - Xác thực Firebase ID Token từ header: Authorization: Bearer <token>
|   - Sau xác thực: $request->firebaseUid, ->firebaseEmail, ->firebaseUser
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Auth\AuthController;

use App\Http\Controllers\General\LocationController;
use App\Http\Controllers\General\CategoryController;
use App\Http\Controllers\General\BehaviorTrackingController;
use App\Http\Controllers\General\RecommendationController;
use App\Http\Controllers\General\BehaviorRedisController;
use App\Http\Controllers\General\BehaviorDatabaseController;
use App\Http\Controllers\General\ServiceController;
use App\Http\Controllers\Social\PostController;
use App\Http\Controllers\Social\InteractionController;
use App\Http\Controllers\Social\FollowController;
use App\Http\Controllers\Social\TagController;
use App\Http\Controllers\General\ServiceFeedbackController;

// ========================
// ROUTE CÔNG KHAI (không cần đăng nhập)
// ========================
Route::get('/ping', fn() => response()->json([
    'success' => true,
    'message' => 'Social Travel Booking API đang chạy!',
]
));

// Route công khai để tải ảnh trực tiếp (Hỗ trợ mọi đường dẫn & Ảnh mặc định)
Route::get('/images/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    if (file_exists($fullPath)) return response()->file($fullPath);

    $altPath = storage_path('app/public/images/' . $path);
    if (file_exists($altPath)) return response()->file($altPath);

    // Nếu không tìm thấy, trả về một ảnh mặc định để không bị lỗi 404
    return response()->file(public_path('images/default-tour.jpg'));
})->where('path', '.*');

// Địa điểm & Danh mục (Public)
Route::get('/locations', [LocationController::class, 'index']);
Route::get('/locations/{id}', [LocationController::class, 'show']);
// Alias cũ cho tương thích
Route::get('/general/get/locations', [LocationController::class, 'index']);
Route::get('/general/get/locations/{id}', [LocationController::class, 'show']);
Route::get('/general/get/categories', [CategoryController::class, 'index']);
Route::get('/general/get/categories/{slug}', [CategoryController::class, 'show']);

// Dịch vụ du lịch (Public)
Route::get('/general/get/services', [ServiceController::class, 'index']);
Route::get('/general/get/services/detail/{slug}', [ServiceController::class, 'show']);
Route::get('/general/get/services/latest', [ServiceController::class, 'latest']);
Route::get('/general/get/services/{id}/feedbacks', [ServiceFeedbackController::class, 'index']);

// Bài đăng mạng xã hội (Public)
Route::get('/general/get/posts/latest', [PostController::class, 'latest']);

// Mã giảm giá (Public)
Route::get('/general/get/coupons', [\App\Http\Controllers\General\CouponController::class, 'index']);

// Webhook SePay (Public - không cần auth, SePay gọi vào)
Route::post('/payment/sepay/webhook', [\App\Http\Controllers\General\PaymentController::class, 'sepayWebhook']);


// ========================
// INTERNAL API FOR n8n (No Auth for local bridge)
// ========================
Route::group(['prefix' => 'internal'], function() {
    // Behavior tracking sync
    Route::post('/behavior/sync', [BehaviorTrackingController::class, 'syncFromN8n']);
    Route::get('/behavior/active-users', [BehaviorTrackingController::class, 'getActiveUsers']);
    Route::post('/behavior/process-recommendations', [BehaviorTrackingController::class, 'processRecommendations']);
    Route::post('/behavior/cleanup', [BehaviorDatabaseController::class, 'cleanup']);

    // Database Bridge
    Route::group(['prefix' => 'db'], function() {
        Route::post('/upsert-behavior', [BehaviorDatabaseController::class, 'upsertBehavior']);
        Route::post('/process-bulk', [BehaviorDatabaseController::class, 'processBulkRecommendations']);
        Route::get('/get-pending', [BehaviorDatabaseController::class, 'getPendingUsers']);
        Route::get('/get-best-interest', [BehaviorDatabaseController::class, 'getBestInterest']);
        Route::post('/save-recommendations', [BehaviorDatabaseController::class, 'saveRecommendations']);
        Route::post('/cleanup', [BehaviorDatabaseController::class, 'cleanup']);
    });
});

// ========================
// ROUTE BẢO VỆ (yêu cầu Firebase Auth)
// ========================
Route::middleware('firebase.auth')->group(function () {
    // 1. Đồng bộ người dùng khi đăng nhập Firebase
    Route::post('/auth/post/sync', [AuthController::class, 'sync']);
    
    // Behavior Tracking & Recommendations (Public/User API)
    Route::post('/track-behavior', [BehaviorTrackingController::class, 'track']);
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    
    // 2. Upload tệp tin
    Route::post('/upload', [\App\Http\Controllers\General\UploadController::class, 'upload']);

    // 3. Lấy thông tin user hiện tại
    Route::get('/user/get/profile', function (\Illuminate\Http\Request $request) {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = \App\Models\User::with(['socialProfile', 'touristProfile'])->where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Đảm bảo social_active luôn trả về boolean thật
        $userData = $user->toArray();
        $userData['social_active'] = (bool) $user->social_active;

        return response()->json([
            'success' => true,
            'data' => $userData
        ]);
    });
    Route::put('/user/update-profile', [\App\Http\Controllers\Social\SocialController::class, 'updateProfile']);

    // 3. Routes Mạng xã hội
    Route::get('/user/get/social-status', [\App\Http\Controllers\Social\SocialController::class, 'getSocialStatus']);
    Route::get('/user/get/social-profile', [\App\Http\Controllers\Social\SocialController::class, 'getMyProfile']);
    Route::post('/auth/post/sync-social-profile', [\App\Http\Controllers\Social\SocialController::class, 'syncSocialProfile']);

    Route::prefix('social')->group(function () {
        // Bài đăng
        Route::get('/posts', [PostController::class, 'index']);
        Route::post('/posts', [PostController::class, 'store']);
        Route::get('/posts/{id}', [PostController::class, 'show']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
        Route::get('/users/{userId}/posts', [PostController::class, 'userPosts']);

        // Tương tác
        Route::post('/posts/{postId}/like', [InteractionController::class, 'toggleLike']);
        Route::get('/posts/{postId}/comments', [InteractionController::class, 'getComments']);
        Route::post('/posts/{postId}/comments', [InteractionController::class, 'storeComment']);
        Route::get('/users/{userId}/replies', [InteractionController::class, 'userReplies']);

        // Theo dõi
        Route::post('/users/{followingId}/follow', [FollowController::class, 'toggleFollow']);
        Route::get('/users/{userId}/followers', [FollowController::class, 'getFollowers']);
        Route::get('/users/{userId}/following', [FollowController::class, 'getFollowing']);
        Route::get('/users/{userId}/profile', [\App\Http\Controllers\Social\SocialController::class, 'getOtherProfile']);
        Route::get('/users/search', [FollowController::class, 'search']);
        Route::get('/suggestions/users', [FollowController::class, 'suggestions']);
        Route::get('/search/all', [PostController::class, 'searchAll']);
        Route::get('/profile/me', [\App\Http\Controllers\Social\SocialController::class, 'getMyProfile']);

        // Hashtags
        Route::get('/tags/suggestions', [TagController::class, 'suggestions']);

        // Thông báo
        Route::get('/notifications', [\App\Http\Controllers\Social\NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\Social\NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [\App\Http\Controllers\Social\NotificationController::class, 'markAllAsRead']);
    });

    // ===========================================================
    // TOURIST ROUTES (Khách du lịch - Cần User Model)
    // ===========================================================
    Route::middleware('role:tourist,provider,admin')->group(function () {
        Route::post('/bookings', [\App\Http\Controllers\General\BookingController::class, 'store']);
        Route::get('/user/bookings', [\App\Http\Controllers\General\BookingController::class, 'myBookings']);
        Route::get('/user/bookings/{id}', [\App\Http\Controllers\General\BookingController::class, 'show']);
        Route::post('/user/bookings/{id}/cancel', [\App\Http\Controllers\General\BookingController::class, 'cancel']);
        Route::post('/user/bookings/{id}/check-in', [\App\Http\Controllers\General\BookingController::class, 'checkIn']);
        Route::post('/user/bookings/{id}/undo-check-in', [\App\Http\Controllers\General\BookingController::class, 'undoCheckIn']);
        Route::post('/user/bookings/{id}/check-out', [\App\Http\Controllers\General\BookingController::class, 'checkOut']);
        Route::get('/user/bookings/by-code/{code}', [\App\Http\Controllers\General\BookingController::class, 'getByCode']);
        Route::get('/user/booking-details/{id}', [\App\Http\Controllers\General\BookingController::class, 'show']);

        Route::post('/reviews', [\App\Http\Controllers\General\ReviewController::class, 'store']);
        Route::post('/services/{id}/feedbacks', [ServiceFeedbackController::class, 'store']);

        // Tourist profile routes
        Route::get('/user/tourist-profile', [\App\Http\Controllers\General\TouristProfileController::class, 'show']);
        Route::put('/user/tourist-profile', [\App\Http\Controllers\General\TouristProfileController::class, 'update']);

        Route::post('/payment/initiate', [\App\Http\Controllers\General\PaymentController::class, 'initiate']);
        Route::get('/payment/status/{bookingId}', [\App\Http\Controllers\General\PaymentController::class, 'checkStatus']);
        Route::get('/wallet/balance', [\App\Http\Controllers\General\PaymentController::class, 'walletBalance']);
        Route::post('/coupons/apply', [\App\Http\Controllers\General\CouponController::class, 'apply']);

        // Chat routes
        Route::get('/chat/unread-count', [\App\Http\Controllers\General\ChatController::class, 'getUnreadCount']);
        Route::get('/chat/conversations', [\App\Http\Controllers\General\ChatController::class, 'getConversations']);
        Route::get('/chat/conversations/{id}/messages', [\App\Http\Controllers\General\ChatController::class, 'getMessages']);
        Route::post('/chat/messages', [\App\Http\Controllers\General\ChatController::class, 'sendMessage']);

        // Broadcasting auth (xác thực kênh riêng tư cho realtime)
        Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $pusher = new \Pusher\Pusher(
                config('broadcasting.connections.reverb.key'),
                config('broadcasting.connections.reverb.secret'),
                config('broadcasting.connections.reverb.app_id'),
                [
                    'host' => config('broadcasting.connections.reverb.options.host', '127.0.0.1'),
                    'port' => config('broadcasting.connections.reverb.options.port', 8080),
                    'scheme' => config('broadcasting.connections.reverb.options.scheme', 'http'),
                    'useTLS' => config('broadcasting.connections.reverb.options.useTLS', false),
                ]
            );

            $channelName = $request->input('channel_name');
            $socketId = $request->input('socket_id');

            // Xác thực quyền truy cập kênh
            if (str_starts_with($channelName, 'private-chat.')) {
                $conversationId = str_replace('private-chat.', '', $channelName);
                $conversation = \App\Models\Conversation::find($conversationId);

                if (!$conversation) {
                    return response()->json(['error' => 'Channel not found'], 403);
                }

                if ($user->id !== $conversation->user_one && $user->id !== $conversation->user_two) {
                    return response()->json(['error' => 'Forbidden'], 403);
                }
            }

            $auth = $pusher->authorizeChannel($channelName, $socketId);
            return response()->json(json_decode($auth, true));
        });
    });

    // ===========================================================
    // ADMIN ROUTES (Quản trị viên)
    // ===========================================================
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Dashboard thống kê
        Route::get('/dashboard/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);

        // Quản lý Người dùng
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
        Route::patch('/users/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'updateRole']);
        Route::patch('/users/{id}/status', [\App\Http\Controllers\Admin\UserController::class, 'updateStatus']);

        // Quản lý Địa điểm
        Route::post('/locations', [LocationController::class, 'store']);
        Route::put('/locations/{id}', [LocationController::class, 'update']);
        Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

        // Quản lý Danh mục
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Quản lý Dịch vụ
        Route::get('/services', [\App\Http\Controllers\Admin\ServiceController::class, 'index']);
        Route::get('/services/{id}', [\App\Http\Controllers\Admin\ServiceController::class, 'show']);
        Route::post('/services', [\App\Http\Controllers\Admin\ServiceController::class, 'store']);
        Route::put('/services/{id}', [\App\Http\Controllers\Admin\ServiceController::class, 'update']);
        Route::patch('/services/{id}/status', [\App\Http\Controllers\Admin\ServiceController::class, 'updateStatus']);
        Route::delete('/services/{id}', [\App\Http\Controllers\Admin\ServiceController::class, 'destroy']);

        // Quản lý Đặt chỗ
        Route::get('/bookings', [\App\Http\Controllers\Admin\BookingController::class, 'index']);
        Route::get('/bookings/{id}', [\App\Http\Controllers\Admin\BookingController::class, 'show']);
        Route::patch('/bookings/{id}/status', [\App\Http\Controllers\Admin\BookingController::class, 'updateStatus']);

        // Quản lý Nhà cung cấp
        Route::get('/providers', [\App\Http\Controllers\Admin\ProviderController::class, 'index']);
        Route::get('/providers/{id}', [\App\Http\Controllers\Admin\ProviderController::class, 'show']);
        Route::patch('/providers/{id}/status', [\App\Http\Controllers\Admin\ProviderController::class, 'updateStatus']);

        // Quản lý Đánh giá
        Route::get('/reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index']);
        Route::post('/reviews/{id}/reply', [\App\Http\Controllers\Admin\ReviewController::class, 'reply']);
        Route::delete('/reviews/{id}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy']);

        // Quản lý Mã giảm giá
        Route::get('/coupons', [\App\Http\Controllers\Admin\CouponController::class, 'index']);
        Route::post('/coupons', [\App\Http\Controllers\Admin\CouponController::class, 'store']);
        Route::put('/coupons/{id}', [\App\Http\Controllers\Admin\CouponController::class, 'update']);
        Route::delete('/coupons/{id}', [\App\Http\Controllers\Admin\CouponController::class, 'destroy']);

        // Quản lý Báo cáo vi phạm
        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index']);
        Route::get('/reports/{id}', [\App\Http\Controllers\Admin\ReportController::class, 'show']);
        Route::patch('/reports/{id}/resolve', [\App\Http\Controllers\Admin\ReportController::class, 'resolve']);

        // Cài đặt hệ thống
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index']);
        Route::post('/settings/batch', [\App\Http\Controllers\Admin\SettingController::class, 'updateBatch']);

        // Tự động hóa n8n
        Route::get('/automation/workflows', [\App\Http\Controllers\Admin\AutomationController::class, 'index']);
        Route::patch('/automation/workflows/{id}/toggle', [\App\Http\Controllers\Admin\AutomationController::class, 'toggle']);
    });

    // ===========================================================
    // PROVIDER ROUTES (Nhà cung cấp)
    // ===========================================================
    Route::prefix('provider')->middleware('role:provider')->group(function () {

        // --- Tự tạo ProviderProfile nếu chưa có (gọi lần đầu) ---
        Route::post('/setup-profile', [\App\Http\Controllers\Provider\ProfileController::class, 'setup']);

        // --- Dashboard & Thống kê ---
        Route::get('/dashboard/stats', [\App\Http\Controllers\Provider\DashboardController::class, 'stats']);

        // --- Quản lý Dịch vụ (CRUD) ---
        Route::get('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'index']);
        Route::post('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'store']);
        Route::get('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'show']);
        Route::put('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'update']);
        Route::delete('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroy']);

        // --- Lịch trình dịch vụ (Tour) ---
        Route::get('/services/{id}/schedules', [\App\Http\Controllers\Provider\ServiceController::class, 'getSchedules']);
        Route::post('/services/{id}/schedules', [\App\Http\Controllers\Provider\ServiceController::class, 'storeSchedule']);
        Route::put('/services/{id}/schedules/{scheduleId}', [\App\Http\Controllers\Provider\ServiceController::class, 'updateSchedule']);
        Route::delete('/services/{id}/schedules/{scheduleId}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroySchedule']);

        // --- Tiện nghi / Bao gồm / Không bao gồm ---
        Route::put('/services/{id}/amenities', [\App\Http\Controllers\Provider\ServiceController::class, 'updateAmenities']);

        // --- Loại phòng (Hotel) ---
        Route::get('/services/{id}/room-types', [\App\Http\Controllers\Provider\ServiceController::class, 'getRoomTypes']);
        Route::post('/services/{id}/room-types', [\App\Http\Controllers\Provider\ServiceController::class, 'storeRoomType']);
        Route::put('/services/{id}/room-types/{roomTypeId}', [\App\Http\Controllers\Provider\ServiceController::class, 'updateRoomType']);
        Route::delete('/services/{id}/room-types/{roomTypeId}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroyRoomType']);

        // --- Quản lý Trạng thái khả dụng (Số chỗ/phòng trống theo ngày) ---
        Route::get('/services/{id}/availability', [\App\Http\Controllers\Provider\AvailabilityController::class, 'index']);
        Route::post('/services/{id}/availability/batch', [\App\Http\Controllers\Provider\AvailabilityController::class, 'updateBatch']);

        // --- Quản lý Đơn đặt chỗ ---
        Route::get('/bookings', [\App\Http\Controllers\Provider\BookingController::class, 'index']);
        Route::get('/bookings/{id}', [\App\Http\Controllers\Provider\BookingController::class, 'show']);
        Route::patch('/bookings/{id}/status', [\App\Http\Controllers\Provider\BookingController::class, 'updateStatus']);

        // --- Quản lý Đánh giá ---
        Route::get('/reviews', [\App\Http\Controllers\Provider\ReviewController::class, 'index']);
        Route::post('/reviews/{id}/reply', [\App\Http\Controllers\Provider\ReviewController::class, 'reply']);

        // --- Quản lý Ví tiền & Doanh thu ---
        Route::get('/wallet', [\App\Http\Controllers\Provider\WalletController::class, 'index']);
        Route::get('/wallet/report', [\App\Http\Controllers\Provider\WalletController::class, 'report']);

        // --- Cấu hình cửa hàng ---
        Route::get('/settings', [\App\Http\Controllers\Provider\SettingController::class, 'index']);
        Route::put('/settings', [\App\Http\Controllers\Provider\SettingController::class, 'update']);
    });
});

// ===========================================================
// N8N AUTOMATION ROUTES (Công khai cho n8n)
// ===========================================================
Route::get('/n8n/users', function () {
    $users = \App\Models\User::where('role', 'tourist')
        // Lấy cả user active và banned (để có thể mở khóa qua email)
        ->whereIn('status', ['active', 'banned'])
        ->where(function ($q) {
            // Trường hợp 1: Chưa bao giờ nhận email từ n8n
            $q->whereNull('last_promo_sent_at')
              // Trường hợp 2: Có ít nhất một đơn hàng đã thanh toán MỚI HƠN thời điểm gửi email gần nhất
              // Điều này đảm bảo mỗi đơn hàng thanh toán chỉ kích hoạt n8n 1 lần.
              ->orWhereHas('bookings', function ($bq) {
                  $bq->where('payment_status', 'paid')
                     ->whereRaw('bookings.created_at > users.last_promo_sent_at');
              });
        })
        ->withCount(['bookings' => function ($query) {
            $query->where('payment_status', 'paid');
        }])
        ->get();
    return response()->json(['success' => true, 'data' => $users]);
});

Route::get('/n8n/user-history/{id}', function ($id) {
    if (!\Illuminate\Support\Str::isUuid($id)) {
        return response()->json(['success' => false, 'message' => 'Invalid UUID'], 400);
    }
    $bookings = \App\Models\Booking::where('user_id', $id)->with('service.media')->get();
    $paidCount = \App\Models\Booking::where('user_id', $id)->where('payment_status', 'paid')->count();
    $totalCount = $bookings->count();
    
    return response()->json([
        'success' => true,
        'paid_bookings_count' => $paidCount,
        'total_bookings_count' => $totalCount,
        'data' => $bookings
    ]);
});

Route::get('/n8n/hotels', function (\Illuminate\Http\Request $request) {
    $locId = $request->query('location_id');
    $query = \App\Models\Service::with(['location', 'media'])
        ->where('type', 'hotel')
        ->where('status', 'active');
    
    if ($locId) {
        $query->where('location_id', $locId);
    }
    
    $hotels = $query->get();

    // FALLBACK: Nếu không có khách sạn ở địa điểm này, lấy 3 khách sạn bất kỳ
    if ($hotels->isEmpty()) {
        $hotels = \App\Models\Service::with(['location', 'media'])
            ->where('type', 'hotel')
            ->where('status', 'active')
            ->inRandomOrder()
            ->limit(3)
            ->get();
    }

    $hotels = $hotels->map(function($h) {
        $h->media->map(function($m) {
            $originalUrl = $m->getRawOriginal('url');
            if (str_starts_with($originalUrl, 'http')) {
                $m->image_url = $originalUrl;
            } else {
                $path = str_replace('public/', '', $originalUrl);
                $m->image_url = url('/api/images/' . $path);
            }
            return $m;
        });
        return $h;
    });
    return response()->json(['success' => true, 'data' => $hotels]);
});

Route::get('/n8n/services', function () {
    $services = \App\Models\Service::with(['location', 'media'])
        ->where('type', 'tour')
        ->where('status', 'active')
        ->orderBy('created_at', 'desc')
        ->limit(3)
        ->get();

    // FALLBACK: Nếu rỗng, lấy 3 cái ngẫu nhiên
    if ($services->isEmpty()) {
        $services = \App\Models\Service::with(['location', 'media'])
            ->where('type', 'tour')
            ->where('status', 'active')
            ->inRandomOrder()
            ->limit(3)
            ->get();
    }

    $services = $services->map(function($s) {
        $s->media->map(function($m) {
            $originalUrl = $m->getRawOriginal('url');
            if (str_starts_with($originalUrl, 'http')) {
                $m->image_url = $originalUrl;
            } else {
                $path = str_replace('public/', '', $originalUrl);
                $m->image_url = url('/api/images/' . $path);
            }
            return $m;
        });
        return $s;
    });
    return response()->json(['success' => true, 'data' => $services]);
});

// API Đánh dấu User đã được gửi Email & Mở khóa (Hỗ trợ cả GET để mở thủ công qua trình duyệt)
Route::match(['get', 'post'], '/n8n/users/{id}/mark-emailed', function ($id) {
    if (!\Illuminate\Support\Str::isUuid($id)) {
        return response()->json(['success' => false, 'message' => 'Invalid UUID'], 400);
    }
    
    $user = \App\Models\User::find($id);
    if ($user) {
        $user->last_promo_sent_at = now();
        $user->status = 'active'; // Tự động mở khóa khi đã gửi email thành công
        $user->save();
        return response()->json([
            'success' => true, 
            'message' => 'Đã đánh dấu gửi email và mở khóa người dùng thành công.'
        ]);
    }
    return response()->json(['success' => false, 'message' => 'User not found'], 404);
});

// Lấy một mã giảm giá ngẫu nhiên có sẵn trong DB (Dành cho n8n)
Route::get('/n8n/coupons/random', function () {
    $coupon = \App\Models\Coupon::where('valid_until', '>', now())
        ->inRandomOrder()
        ->first();
        
    if (!$coupon) {
        return response()->json(['success' => false, 'message' => 'Không còn mã giảm giá nào hiệu lực'], 404);
    }
    return response()->json(['success' => true, 'data' => $coupon]);
});

// API DÀNH RIÊNG CHO DEV TEST (Xóa toàn bộ cờ để test lại từ đầu)
Route::get('/n8n/users/reset-testing', function () {
    // 1. Reset cờ gửi mail quảng cáo ở bảng users & Mở khóa tất cả user
    \App\Models\User::query()->update([
        'last_promo_sent_at' => null,
        'status' => 'active'
    ]);
    
    // 2. Reset cờ nhắc nhở thanh toán & xin đánh giá ở bảng bookings
    \App\Models\Booking::query()->update([
        'last_reminded_at' => null,
        'review_requested_at' => null
    ]);

    return response()->json([
        'success' => true, 
        'message' => 'Đã "cởi trói" toàn bộ người dùng và đơn hàng. Sẵn sàng test lại từ đầu!'
    ]);
});

// N8n tạo Voucher
Route::post('/n8n/coupons', function (\Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'code' => 'required|string|max:50',
        'type' => 'required|in:percent,fixed',
        'discount_value' => 'required|numeric|min:0',
        'min_order_amount' => 'nullable|numeric|min:0',
        'usage_limit' => 'nullable|integer|min:1',
        'per_user_limit' => 'nullable|integer|min:1',
        'valid_from' => 'nullable|date',
        'valid_until' => 'nullable|date|after_or_equal:valid_from',
    ]);

    try {
        $coupon = \App\Models\Coupon::firstOrCreate(
            ['code' => $validated['code']],
            $validated
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Lấy/Tạo mã giảm giá từ n8n thành công',
            'data' => $coupon
        ], 201);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi khi tạo mã giảm giá: ' . $e->getMessage()
        ], 500);
    }
});

Route::post('/n8n/logs', function (\Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'user_id' => 'nullable|uuid',
        'email' => 'required|email',
        'display_name' => 'required|string',
        'campaign_type' => 'required|string',
        'service_name' => 'nullable|string',
        'status' => 'nullable|string',
        'metadata' => 'nullable|array'
    ]);
    $log = \App\Models\AutomationLog::create($validated);
    return response()->json(['success' => true, 'data' => $log], 201);
});

Route::get('/n8n/bookings/abandoned', function () {
    $twoHoursAgo = now()->subHours(2);
    $bookings = \App\Models\Booking::with(['user', 'service'])
        ->where('payment_status', 'pending')
        ->where('created_at', '<=', $twoHoursAgo)
        ->whereNull('last_reminded_at')
        ->get();
    return response()->json(['success' => true, 'data' => $bookings]);
});

Route::get('/n8n/bookings/completed', function () {
    $bookings = \App\Models\Booking::with(['user', 'service'])
        ->where('status', 'completed')
        ->whereNull('review_requested_at')
        ->get();
    return response()->json(['success' => true, 'data' => $bookings]);
});

// Admin lấy danh sách Log (Giữ lại trong auth để bảo mật)
Route::middleware('firebase.auth')->get('/admin/automation-logs', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\AutomationLog::orderBy('created_at', 'desc')->get()
    ]);
});

// === BOOKING DEEP-LINKING (Public for email recovery) ===
Route::get('/bookings/{id}', function ($id) {
    $booking = \App\Models\Booking::with(['service.provider', 'service.media', 'service.roomTypes'])
        ->where('id', $id)
        ->firstOrFail();
    return response()->json(['success' => true, 'data' => $booking]);
});

// === N8N AUTOMATION MARKING ROUTES ===
Route::post('/n8n/bookings/{id}/mark-reminded', function ($id) {
    $booking = \App\Models\Booking::findOrFail($id);
    $booking->update(['last_reminded_at' => now()]);
    return response()->json(['success' => true]);
});

Route::post('/n8n/bookings/{id}/mark-abandoned-emailed', function ($id) {
    $booking = \App\Models\Booking::findOrFail($id);
    $booking->update(['last_reminded_at' => now()]);
    return response()->json(['success' => true]);
});

Route::post('/n8n/bookings/{id}/mark-review-requested', function ($id) {
    $booking = \App\Models\Booking::findOrFail($id);
    $booking->update(['review_requested_at' => now()]);
    return response()->json(['success' => true]);
});

Route::post('/social/post', [\App\Http\Controllers\Social\SocialController::class, 'createPost']);
