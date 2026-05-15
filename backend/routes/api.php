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
Route::get('/general/get/locations', [LocationController::class, 'index']);
Route::get('/general/get/locations/{id}', [LocationController::class, 'show']);
Route::get('/general/get/categories', [CategoryController::class, 'index']);
Route::get('/general/get/categories/{slug}', [CategoryController::class, 'show']);

// Dịch vụ du lịch (Public)
Route::get('/general/get/services', [ServiceController::class, 'index']);
Route::get('/general/get/services/detail/{slug}', [ServiceController::class, 'show']);
Route::get('/general/get/services/latest', [ServiceController::class, 'latest']);
Route::get('/general/get/services/{id}/feedbacks', [ServiceFeedbackController::class, 'index']);

// Mã giảm giá (Public)
Route::get('/general/get/coupons', [\App\Http\Controllers\General\CouponController::class, 'index']);

// Webhook SePay (Public - không cần auth, SePay gọi vào)
Route::post('/payment/sepay/webhook', [\App\Http\Controllers\General\PaymentController::class, 'sepayWebhook']);

// ========================
// ROUTE BẢO VỆ (yêu cầu Firebase Auth)
// ========================
Route::middleware('firebase.auth')->group(function () {

    // 1. Đồng bộ người dùng khi đăng nhập Firebase
    Route::post('/auth/post/sync', [AuthController::class, 'sync']);
    
    // 2. Upload tệp tin
    Route::post('/upload', [\App\Http\Controllers\General\UploadController::class, 'upload']);

    // 3. Lấy thông tin user hiện tại
    Route::get('/user/get/profile', function (\Illuminate\Http\Request $request) {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = \App\Models\User::with('socialProfile')->where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Đảm bảo social_active luôn trả về boolean thật (tránh Postgres trả về 0/1)
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
        Route::get('/user/booking-details/{id}', [\App\Http\Controllers\General\BookingController::class, 'show']);

        Route::middleware('role:tourist,provider,admin')->group(function () {
            Route::post('/bookings', [\App\Http\Controllers\General\BookingController::class, 'store']);
            Route::get('/user/bookings', [\App\Http\Controllers\General\BookingController::class, 'myBookings']);
            Route::post('/user/bookings/{id}/cancel', [\App\Http\Controllers\General\BookingController::class, 'cancel']);
        Route::post('/reviews', [\App\Http\Controllers\General\ReviewController::class, 'store']);
        Route::post('/services/{id}/feedbacks', [ServiceFeedbackController::class, 'store']);

        // Payment routes
        Route::post('/payment/initiate', [\App\Http\Controllers\General\PaymentController::class, 'initiate']);
        Route::get('/payment/status/{bookingId}', [\App\Http\Controllers\General\PaymentController::class, 'checkStatus']);
        Route::get('/wallet/balance', [\App\Http\Controllers\General\PaymentController::class, 'walletBalance']);
        Route::post('/coupons/apply', [\App\Http\Controllers\General\CouponController::class, 'apply']);
    }); // Kết thúc nhóm role:tourist,provider,admin (dòng 136)

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
        Route::post('/setup-profile', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $profile = \App\Models\ProviderProfile::firstOrCreate(
                ['user_id' => $user->id],
                ['business_name' => ($user->display_name ?? 'Nhà cung cấp') . "'s Business", 'status' => 'pending', 'address' => '']
            );
            return response()->json(['success' => true, 'data' => $profile]);
        });
        Route::get('/dashboard/stats', [\App\Http\Controllers\Provider\DashboardController::class, 'stats']);
        Route::get('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'index']);
        Route::post('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'store']);
        Route::get('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'show']);
        Route::put('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'update']);
        Route::delete('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroy']);
        Route::get('/services/{id}/schedules', [\App\Http\Controllers\Provider\ServiceController::class, 'getSchedules']);
        Route::post('/services/{id}/schedules', [\App\Http\Controllers\Provider\ServiceController::class, 'storeSchedule']);
        Route::put('/services/{id}/schedules/{scheduleId}', [\App\Http\Controllers\Provider\ServiceController::class, 'updateSchedule']);
        Route::delete('/services/{id}/schedules/{scheduleId}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroySchedule']);
        Route::put('/services/{id}/amenities', [\App\Http\Controllers\Provider\ServiceController::class, 'updateAmenities']);
        Route::get('/services/{id}/room-types', [\App\Http\Controllers\Provider\ServiceController::class, 'getRoomTypes']);
        Route::post('/services/{id}/room-types', [\App\Http\Controllers\Provider\ServiceController::class, 'storeRoomType']);
        Route::put('/services/{id}/room-types/{roomTypeId}', [\App\Http\Controllers\Provider\ServiceController::class, 'updateRoomType']);
        Route::delete('/services/{id}/room-types/{roomTypeId}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroyRoomType']);
        Route::get('/bookings', [\App\Http\Controllers\Provider\BookingController::class, 'index']);
        Route::get('/bookings/{id}', [\App\Http\Controllers\Provider\BookingController::class, 'show']);
        Route::patch('/bookings/{id}/status', [\App\Http\Controllers\Provider\BookingController::class, 'updateStatus']);
        Route::get('/reviews', [\App\Http\Controllers\Provider\ReviewController::class, 'index']);
        Route::post('/reviews/{id}/reply', [\App\Http\Controllers\Provider\ReviewController::class, 'reply']);
        Route::get('/wallet', [\App\Http\Controllers\Provider\WalletController::class, 'index']);
        Route::get('/wallet/report', [\App\Http\Controllers\Provider\WalletController::class, 'report']);
        Route::get('/settings', [\App\Http\Controllers\Provider\SettingController::class, 'index']);
        Route::put('/settings', [\App\Http\Controllers\Provider\SettingController::class, 'update']);
    });
}); // Kết thúc nhóm firebase.auth (dòng 69)

// ===========================================================
// N8N AUTOMATION ROUTES (Công khai cho n8n)
// ===========================================================
Route::get('/n8n/users', function () {
    $timeFrame = now()->subHours(24);
    $users = \App\Models\User::where('role', 'tourist')
        ->where('status', 'active')
        ->where(function ($q) use ($timeFrame) {
            $q->whereNull('last_promo_sent_at')
              ->orWhere('last_promo_sent_at', '<', $timeFrame);
        })
        ->withCount(['bookings' => function ($query) {
            $query->where('payment_status', 'paid');
        }])
        ->get();
    return response()->json(['success' => true, 'data' => $users]);
});

Route::get('/n8n/user-history/{id}', function ($id) {
    return response()->json(['success' => true, 'data' => \App\Models\Booking::where('user_id', $id)->with('service')->get()]);
});

Route::get('/n8n/hotels', function (\Illuminate\Http\Request $request) {
    $locId = $request->query('location_id');
    $query = \App\Models\Service::with(['location', 'media'])->where('type', 'hotel')->where('status', 'active');
    if ($locId) $query->where('location_id', $locId);
    
    $hotels = $query->limit(3)->get()->map(function($h) {
        $h->media->map(function($m) {
            $path = str_replace('public/', '', $m->getRawOriginal('url'));
            $m->image_url = url('/api/images/' . $path);
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
        ->get()
        ->map(function($s) {
            $s->media->map(function($m) {
                $path = str_replace('public/', '', $m->getRawOriginal('url'));
                $m->image_url = url('/api/images/' . $path);
                return $m;
            });
            return $s;
        });
    return response()->json(['success' => true, 'data' => $services]);
});

Route::post('/n8n/users/{id}/mark-emailed', function ($id) {
    $user = \App\Models\User::find($id);
    if ($user) {
        $user->last_promo_sent_at = now();
        $user->save();
        return response()->json(['success' => true]);
    }
    return response()->json(['success' => false], 404);
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

Route::post('/n8n/bookings/{id}/mark-reminded', function ($id) {
    $booking = \App\Models\Booking::findOrFail($id);
    $booking->update(['last_reminded_at' => now()]);
    return response()->json(['success' => true]);
});

Route::get('/n8n/bookings/completed', function () {
    $bookings = \App\Models\Booking::with(['user', 'service'])
        ->where('status', 'completed')
        ->whereNull('review_requested_at')
        ->get();
    return response()->json(['success' => true, 'data' => $bookings]);
});

Route::post('/n8n/bookings/{id}/mark-review-requested', function ($id) {
    $booking = \App\Models\Booking::findOrFail($id);
    $booking->update(['review_requested_at' => now()]);
    return response()->json(['success' => true]);
});

Route::post('/social/post', [\App\Http\Controllers\Social\SocialController::class, 'createPost']);

// API DÀNH RIÊNG CHO DEV TEST (Xóa toàn bộ cờ để test lại từ đầu)
Route::get('/n8n/users/reset-testing', function () {
    // 1. Reset cờ gửi mail quảng cáo ở bảng users
    \App\Models\User::whereNotNull('last_promo_sent_at')->update(['last_promo_sent_at' => null]);
    
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
