<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Đồng bộ người dùng từ dữ liệu Firebase
     * 
     * @param array $firebaseData [uid, email, name, picture]
     * @return array [user, is_new_user]
     */
    public function syncFirebaseUser(array $firebaseData): array
    {
        $firebaseUid = $firebaseData['uid'];
        $firebaseEmail = $firebaseData['email'];
        $requestedRole = $firebaseData['role'] ?? 'tourist';
        
        $isNewUser = false;
        
        // 1. Tìm theo Firebase UID
        $user = User::where('firebase_uid', $firebaseUid)->first();

        // 2. Nếu không thấy UID, tìm theo Email (trường hợp user đã có sẵn trong DB nhưng chưa link Firebase)
        if (!$user && $firebaseEmail) {
            $user = User::where('email', $firebaseEmail)->first();
            if ($user) {
                // Link tài khoản hiện có với Firebase UID
                $user->update(['firebase_uid' => $firebaseUid]);
            }
        }

        if (!$user) {
            $isNewUser = true;

            // Fallback: nếu name là null (đăng ký bằng Email), dùng phần trước @ của email
            $displayName = $firebaseData['name'] 
                ?? explode('@', $firebaseEmail)[0] 
                ?? 'Người dùng';

            $user = User::create([
                'firebase_uid' => $firebaseUid,
                'email' => $firebaseEmail,
                'display_name' => $displayName,
                'avatar_url' => $firebaseData['picture'] ?? null,
                'role' => $requestedRole,
                'status' => 'active',
            ]);
        } else {
            // Cập nhật thông tin mới nhất từ Firebase (nếu có)
            // Không tự động đè role hiện tại trừ khi có yêu cầu cụ thể (có thể mở rộng sau)
            $user->update([
                'display_name' => $firebaseData['name'] ?? $user->display_name,
                'avatar_url' => $firebaseData['picture'] ?? $user->avatar_url,
            ]);
        }

        return [
            'user' => $user,
            'is_new_user' => $isNewUser
        ];
    }
}
