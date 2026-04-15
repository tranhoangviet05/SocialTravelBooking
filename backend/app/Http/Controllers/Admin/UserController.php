<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Lấy danh sách tất cả người dùng
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Cập nhật vai trò (role) của người dùng.
     * Khi đổi sang 'provider', tự động tạo ProviderProfile nếu chưa có.
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:tourist,provider,admin'
        ]);

        $user = User::findOrFail($id);

        // Tránh việc admin tự hạ quyền của chính mình
        $currentUserUid = $request->attributes->get('firebaseUid');
        if ($user->firebase_uid === $currentUserUid && $request->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể tự hạ quyền quản trị của chính mình.'
            ], 403);
        }

        $user->role = $request->role;
        $user->save();

        // Xóa cache để cập nhật role mới ngay lập tức
        Cache::forget("user_role_{$user->firebase_uid}");

        // Nếu đổi sang provider → tự động tạo ProviderProfile nếu chưa có
        if ($request->role === 'provider') {
            ProviderProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => ($user->display_name ?? 'Nhà cung cấp') . "'s Business",
                    'status'        => 'pending',
                    'address'       => '',
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật vai trò của {$user->display_name} thành {$request->role}.",
            'data' => $user
        ]);
    }

    /**
     * Cập nhật trạng thái (status) người dùng (Active/Banned)..
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,banned,pending'
        ]);

        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        // Xóa cache vì status cũng ảnh hưởng tới việc truy cập
        Cache::forget("user_role_{$user->firebase_uid}");

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật trạng thái người dùng thành {$request->status}.",
            'data' => $user
        ]);
    }
}
