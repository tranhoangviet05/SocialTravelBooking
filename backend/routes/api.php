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
    Route::prefix('admin')->group(function () {
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
    // Thêm các route khác tại đây, ví dụ:
    // Route::apiResource('destinations', DestinationController::class);
    // Route::apiResource('bookings', BookingController::class);
    // ===========================================================
});

