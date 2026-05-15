<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tourist\SocialRequest;
use App\Models\User;
use App\Services\SocialService;
use Illuminate\Support\Facades\Log;

class SocialController extends Controller
{
    protected $socialService;

    public function __construct(SocialService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * Lấy trạng thái kích hoạt mạng xã hội của người dùng hiện tại
     */
    public function getSocialStatus(\Illuminate\Http\Request $request)
    {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = User::with('socialProfile')->where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'social_active' => $user->social_active,
                'id'            => $user->id,
                'email'         => $user->email,
                'display_name'  => $user->display_name,
                'avatar_url'    => $user->avatar_url,
                'username'      => $user->socialProfile ? $user->socialProfile->username : null,
            ]
        ]);
    }

    /**
     * Lấy hồ sơ mạng xã hội của chính người dùng hiện tại
     */
    public function getMyProfile(\Illuminate\Http\Request $request)
    {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = User::with('socialProfile')->where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        if (!$user->social_active) {
            return response()->json([
                'success' => true,
                'social_active' => false,
                'message' => 'Người dùng chưa kích hoạt mạng xã hội'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'display_name' => $user->display_name,
                'avatar_url' => $user->avatar_url,
                'social_active' => $user->social_active,
                'social_profile' => $user->socialProfile,
            ]
        ]);
    }

    /**
     * Đồng bộ hồ sơ mạng xã hội (Onboarding)
     */
    public function syncSocialProfile(SocialRequest $request)
    {
        try {
            $firebaseUid = $request->attributes->get('firebaseUid');
            $user = User::where('firebase_uid', $firebaseUid)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại'
                ], 404);
            }

            $validatedData = $request->validated();

            $this->socialService->activateSocialProfile($user, $validatedData);

            // Reload user để lấy dữ liệu mới nhất
            $user->refresh();
            $user->load('socialProfile');

            return response()->json([
                'success' => true,
                'message' => 'Hồ sơ mạng xã hội đã được kích hoạt thành công',
                'data' => [
                    'id'            => $user->id,
                    'social_active' => true,
                    'display_name'  => $user->display_name,
                    'avatar_url'    => $user->avatar_url,
                    'social_profile' => $user->socialProfile,
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('SyncSocialProfile Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi đồng bộ hồ sơ: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Lấy hồ sơ của một người dùng bất kỳ
     */
    public function getOtherProfile(\Illuminate\Http\Request $request, string $userId)
    {
        try {
            $currentUser = $request->attributes->get('userModel');
            $targetUser = $this->socialService->getOtherUserProfile($currentUser, $userId);

            return response()->json([
                'success' => true,
                'data'    => $targetUser
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tìm thấy người dùng'
            ], 404);
        }
    }


    /**
     * Cập nhật thông tin hồ sơ cá nhân
     */
    public function updateProfile(\Illuminate\Http\Request $request)
    {
        try {
            $user = $request->attributes->get('userModel');
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Người dùng không tồn tại'], 404);
            }

            $validatedData = $request->validate([
                'display_name' => 'sometimes|string|max:255',
                'username'     => 'sometimes|string|max:50', // Username giờ nằm ở social_profiles
                'phone'        => 'sometimes|string|max:20',
                'avatar_url'   => 'sometimes|string|max:500',
            ]);

            // 1. Cập nhật bảng users (display_name, phone, avatar_url)
            $userUpdate = [];
            if (isset($validatedData['display_name'])) $userUpdate['display_name'] = $validatedData['display_name'];
            if (isset($validatedData['phone'])) $userUpdate['phone'] = $validatedData['phone'];
            if (isset($validatedData['avatar_url'])) $userUpdate['avatar_url'] = $validatedData['avatar_url'];
            
            if (!empty($userUpdate)) {
                $user->update($userUpdate);
            }

            // 2. Cập nhật bảng social_profiles (username)
            if (isset($validatedData['username'])) {
                // Kiểm tra unique thủ công hoặc qua validator cho bảng social_profiles
                $existing = \App\Models\SocialProfile::where('username', $validatedData['username'])
                            ->where('user_id', '!=', $user->id)
                            ->exists();
                if ($existing) {
                    return response()->json(['success' => false, 'message' => 'Tên đăng nhập đã tồn tại.'], 422);
                }

                if ($user->socialProfile) {
                    $user->socialProfile->update(['username' => $validatedData['username']]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hồ sơ thành công',
                'data'    => $user->load('socialProfile')
            ]);
        } catch (\Throwable $e) {
            Log::error('UpdateProfile Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật hồ sơ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng bài tự động (Dành cho n8n)
     * POST /api/social/post
     */
    public function createPost(\Illuminate\Http\Request $request)
    {
        // 1. Tìm Admin đầu tiên trong hệ thống
        $admin = \App\Models\User::where('role', 'admin')->first();
        
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản Admin'], 404);
        }

        // 2. Lấy nội dung từ n8n
        $content = $request->input('content', 'Bài đăng tự động từ Social Travel Booking');
        
        // 3. Tạo bài đăng thật vào Database
        $post = \App\Models\Post::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $admin->id,
            'content' => $content,
            'status' => 'public',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin đã đăng bài tự động thành công!',
            'data' => $post
        ]);
    }
}
