<?php
namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Services\SocialService;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    protected $socialService;

    public function __construct(SocialService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * Like / Unlike bài viết
     */
    public function toggleLike(Request $request, string $postId)
    {
        $user = $request->attributes->get('userModel');
        $result = $this->socialService->toggleLike($user, $postId);

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }

    /**
     * Lấy bình luận của bài viết
     */
    public function getComments(string $postId)
    {
        $comments = \App\Models\Comment::with('user')
                                       ->where('post_id', $postId)
                                       ->orderBy('created_at', 'asc')
                                       ->get();
        return response()->json([
            'success' => true,
            'data'    => $comments
        ]);
    }

    /**
     * Gửi bình luận
     */
    public function storeComment(Request $request, string $postId)
    {
        $request->validate(['content' => 'required|string']);
        $user = $request->attributes->get('userModel');
        
        $comment = $this->socialService->addComment($user, $postId, $request->content);

        return response()->json([
            'success' => true,
            'data'    => $comment
        ], 201);
    }

    /**
     * Lấy danh sách bình luận của người dùng (Replies)
     */
    public function userReplies(Request $request, string $userId)
    {
        try {
            $replies = $this->socialService->getUserComments($userId, $request->get('limit', 15));

            return response()->json([
                'success' => true,
                'data'    => $replies
            ]);
        } catch (\Throwable $e) {
            \Log::error('InteractionController@userReplies error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải câu trả lời của người dùng'
            ], 500);
        }
    }
}
