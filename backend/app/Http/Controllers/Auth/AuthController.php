<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Đồng bộ người dùng từ Firebase (Đăng ký/Đăng nhập tự động).
     * 
     * Endpoint: POST /api/auth/post/sync
     * Middleware: firebase.auth (Xác thực ID Token)
     */
    public function sync(Request $request)
    {
        try {
            // Lấy thông tin từ Middleware FirebaseAuthMiddleware
            $firebaseUid = $request->attributes->get('firebaseUid');
            $firebaseEmail = $request->attributes->get('firebaseEmail');
            $firebaseUser = $request->attributes->get('firebaseUser');

            if (!$firebaseUid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy định danh Firebase trong yêu cầu.'
                ], 400);
            }

            // Tìm hoặc tạo User mới
            $isNewUser = false;
            $user = User::where('firebase_uid', $firebaseUid)->first();

            if (!$user) {
                $isNewUser = true;
                
                // Tạo Username duy nhất từ email (ví dụ: viet.tran từ viet.tran@gmail.com)
                $baseUsername = Str::before($firebaseEmail, '@');
                $username = $baseUsername;
                $counter = 1;

                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                $user = User::create([
                    'firebase_uid' => $firebaseUid,
                    'username' => $username,
                    'email' => $firebaseEmail,
                    'display_name' => $firebaseUser['name'] ?? $username,
                    'avatar_url' => $firebaseUser['picture'] ?? null,
                    'role' => 'tourist', // Mặc định là khách du lịch
                    'status' => 'active',
                ]);
            } else {
                // Nếu đã có User, cập nhật lại thông tin từ Firebase (nếu có thay đổi)
                $user->update([
                    'display_name' => $firebaseUser['name'] ?? $user->display_name,
                    'avatar_url' => $firebaseUser['picture'] ?? $user->avatar_url,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => $isNewUser ? 'Đăng ký thành viên thành công' : 'Đăng nhập thành công',
                'data' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'display_name' => $user->display_name,
                    'avatar_url' => $user->avatar_url,
                    'role' => $user->role,
                    'is_new_user' => $isNewUser
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Auth Sync Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra trong quá trình đồng bộ tài khoản: ' . $e->getMessage()
            ], 500);
        }
    }
}
