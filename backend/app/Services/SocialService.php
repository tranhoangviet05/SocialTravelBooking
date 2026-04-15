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
     * - Tạo bản ghi social_profiles
     * - Đặt social_active = true trong users
     */
    public function activateSocialProfile(User $user, array $data): bool
    {
        return DB::transaction(function () use ($user, $data) {
            try {
                // Cập nhật display_name, avatar_url nếu được gửi lên
                if (!empty($data['displayName'])) {
                    $user->display_name = $data['displayName'];
                }
                if (!empty($data['avatarUrl']) || !empty($data['avatar_url'])) {
                    $user->avatar_url = $data['avatarUrl'] ?? $data['avatar_url'];
                }

                // Đánh dấu đã hoàn thành onboarding
                $user->social_active = true;
                $user->save();

                // Tạo hoặc cập nhật social_profile
                SocialProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'username'        => $data['username'],
                        'bio'             => $data['bio'] ?? null,
                        'is_verified'     => false,
                        'followers_count' => 0,
                        'following_count' => 0,
                        'posts_count'     => 0,
                    ]
                );

                return true;
            } catch (Exception $e) {
                logger()->error('Lỗi kích hoạt hồ sơ xã hội: ' . $e->getMessage());
                throw $e;
            }
        });
    }
}