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

// ========================
// ROUTE CÔNG KHAI (không cần đăng nhập)
// ========================
Route::get('/ping', fn() => response()->json([
    'success' => true,
    'message' => 'Social Travel Booking API đang chạy!',
    'timestamp' => now()->toISOString(),
]));

// ========================
// ROUTE BẢO VỆ (yêu cầu Firebase Auth)
// ========================
Route::middleware('firebase.auth')->group(function () {

    // Lấy thông tin user hiện tại từ Firebase Token
    Route::get('/me', function (\Illuminate\Http\Request $request) {
        return response()->json([
            'success' => true,
            'data' => [
                'uid'   => $request->attributes->get('firebaseUid'),
                'email' => $request->attributes->get('firebaseEmail'),
            ],
        ]);
    });

    // ===========================================================
    // Thêm các route khác tại đây, ví dụ:
    // Route::apiResource('destinations', DestinationController::class);
    // Route::apiResource('bookings', BookingController::class);
    // ===========================================================
});