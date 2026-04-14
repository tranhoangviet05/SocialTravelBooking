<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

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
     * Cập nhật vai trò (role) của người dùng
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:tourist,provider,admin'
        ]);

        $user = User::findOrFail($id);
        
        // Tránh việc admin tự hạ quyền của chính mình (tùy chọn)
        $currentUserUid = $request->attributes->get('firebaseUid');
        if ($user->firebase_uid === $currentUserUid && $request->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể tự hạ quyền quản trị của chính mình.'
            ], 403);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật vai trò của {$user->display_name} thành {$request->role}.",
            'data' => $user
        ]);
    }

    /**
     * Cập nhật trạng thái (status) người dùng (Active/Banned)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,banned,pending'
        ]);

        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật trạng thái người dùng thành {$request->status}.",
            'data' => $user
        ]);
    }
}
