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
        
        $isNewUser = false;
        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            $isNewUser = true;

            $user = User::create([
                'firebase_uid' => $firebaseUid,
                'email' => $firebaseEmail,
                'display_name' => $firebaseData['name'] ?? null,
                'avatar_url' => $firebaseData['picture'] ?? null,
                'role' => 'tourist',
                'status' => 'active',
            ]);
        } else {
            // Cập nhật thông tin mới nhất từ Firebase (nếu có)
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
