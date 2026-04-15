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

// ========================
// ROUTE CÔNG KHAI (không cần đăng nhập)
// ========================
Route::get('/ping', fn() => response()->json([
    'success' => true,
    'message' => 'Social Travel Booking API đang chạy!',
    'timestamp' => now()->toISOString(),
]));

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

// ========================
// ROUTE BẢO VỆ (yêu cầu Firebase Auth)
// ========================
Route::middleware('firebase.auth')->group(function () {

    // 1. Đồng bộ người dùng khi đăng nhập Firebase
    Route::post('/auth/post/sync', [AuthController::class, 'sync']);

    // 2. Lấy thông tin user hiện tại
    Route::get('/user/get/profile', function (\Illuminate\Http\Request $request) {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = \App\Models\User::where('firebase_uid', $firebaseUid)->first();

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    });

    // ===========================================================
    // ADMIN ROUTES (Quản trị viên)
    // ===========================================================
    Route::prefix('admin')->middleware('role:admin')->group(function () {
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
    });

    // ===========================================================
    // PROVIDER ROUTES (Nhà cung cấp)
    // ===========================================================
    Route::prefix('provider')->middleware('role:provider')->group(function () {

        // --- Tự tạo ProviderProfile nếu chưa có (gọi lần đầu) ---
        Route::post('/setup-profile', function (\Illuminate\Http\Request $request) {
            $user = $request->input('user');
            $profile = \App\Models\ProviderProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => ($user->display_name ?? 'Nhà cung cấp') . "'s Business",
                    'status'        => 'pending',
                    'address'       => '',
                ]
            );
            return response()->json([
                'success' => true,
                'message' => 'Hồ sơ nhà cung cấp đã được khởi tạo. Vui lòng chờ Admin phê duyệt.',
                'data'    => $profile
            ]);
        });

        // --- Dashboard & Thống kê ---
        Route::get('/dashboard/stats', [\App\Http\Controllers\Provider\DashboardController::class, 'stats']);

        // --- Quản lý Dịch vụ (CRUD) ---
        Route::get('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'index']);
        Route::post('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'store']);
        Route::get('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'show']);
        Route::put('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'update']);
        Route::delete('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroy']);

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
