<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Kreait\Firebase\Exception\Auth\RevokedIdToken;

class FirebaseAuthMiddleware
{
    /**
     * Xác thực người dùng qua Firebase ID Token.
     *
     * Client gửi token trong header:
     *   Authorization: Bearer <firebase-id-token>
     *
     * Sau khi xác thực thành công, thông tin user Firebase
     * được lưu vào request attributes để các controller sử dụng:
     *   $request->firebaseUid     — UID của user trên Firebase
     *   $request->firebaseUser    — Toàn bộ decoded token
     *   $request->firebaseEmail   — Email của user
     */
    public function handle(Request $request, Closure $next): mixed
    {
        // Lấy token từ header Authorization
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return $this->unauthorizedResponse('Token không được cung cấp.');
        }

        try {
            // Xác minh ID Token với Firebase
            $auth = Firebase::auth();
            $verifiedToken = $auth->verifyIdToken($bearerToken);

            // Lưu thông tin user vào request để dùng ở controller
            $request->attributes->set('firebaseUid', $verifiedToken->claims()->get('sub'));
            $request->attributes->set('firebaseEmail', $verifiedToken->claims()->get('email'));
            $request->attributes->set('firebaseUser', $verifiedToken->claims()->all());

        } catch (RevokedIdToken $e) {
            return $this->unauthorizedResponse('Token đã bị thu hồi. Vui lòng đăng nhập lại.');
        } catch (FailedToVerifyToken $e) {
            return $this->unauthorizedResponse('Token không hợp lệ hoặc đã hết hạn.');
        } catch (\Exception $e) {
            return $this->unauthorizedResponse('Xác thực thất bại: ' . $e->getMessage());
        }

        return $next($request);
    }

    /**
     * Trả về response lỗi 401 dạng JSON.
     */
    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 401);
    }
}
