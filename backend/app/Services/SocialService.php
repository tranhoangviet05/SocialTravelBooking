<?php

namespace App\Services;

use App\Models\User;
use App\Models\SocialProfile;
use Illuminate\Support\Facades\DB;
use Exception;

class SocialService
{
    /**
     * Kích hoạt hồ sơ mạng xã hội lần đầu (Onboarding).
     */
    public function activateSocialProfile(User $user, array $data): bool
    {
        return DB::transaction(function () use ($user, $data) {
            try {
                // 1. Cập nhật thông tin cơ bản của User
                if (!empty($data['displayName'])) {
                    $user->display_name = $data['displayName'];
                }
                if (!empty($data['avatarUrl'])) {
                    $user->avatar_url = $data['avatarUrl'];
                }
                
                $user->social_active = true;
                $user->save();

                // 2. Tạo hoặc cập nhật social_profile
                // Chúng ta dùng updateOrCreate để đề phòng trường hợp bản ghi đã tồn tại
                SocialProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'username'        => $data['username'],
                        'bio'             => $data['bio'] ?? '',
                        'is_verified'     => false,
                        'followers_count' => 0,
                        'following_count' => 0,
                        'posts_count'     => 0,
                        'website_url'     => $data['websiteUrl'] ?? null,
                    ]
                );

                return true;
            } catch (Exception $e) {
                Log::error('SocialService@activateSocialProfile error: ' . $e->getMessage());
                throw $e;
            }
        });
    }
}