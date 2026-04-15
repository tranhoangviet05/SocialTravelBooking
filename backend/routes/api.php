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
Route::get('/general/get/locations', [LocationController::class, 'index']); // Giữ để không bị break code cũ
Route::get('/general/get/locations/{id}', [LocationController::class, 'show']); // Giữ để không bị break code cũ
Route::get('/general/get/categories', [CategoryController::class, 'index']);
Route::get('/general/get/categories/{slug}', [CategoryController::class, 'show']);

// Dịch vụ đồ du lịch (vaitro/hanhdong/chucnang)
Route::get('/general/get/services', [ServiceController::class, 'index']);
Route::get('/general/get/services/detail/{slug}', [ServiceController::class, 'show']);
Route::get('/general/get/services/latest', [ServiceController::class, 'latest']);

// ========================
// ROUTE BẢO VỆ (yêu cầu Firebase Auth)
// ========================
Route::middleware('firebase.auth')->group(function () {

    // 1. Đồng bộ người dùng khi đăng nhập Firebase (vaitro/hanhdong/chucnang)
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
        // Dashboard Nhà cung cấp (Lấy thống kê riêng)
        Route::get('/dashboard/stats', function () {
            return response()->json([
                'success' => true,
                'message' => 'Chào mừng Nhà cung cấp! Thống kê của bạn đang được xử lý.',
                'data' => [
                    'active_services' => 0,
                    'total_bookings' => 0,
                    'revenue' => 0
                ]
            ]);
        });

        // Quản lý Dịch vụ của riêng Provider này
        Route::get('/services', [ServiceController::class, 'index']); // Sau này sẽ lọc theo provider_id
    });
});

