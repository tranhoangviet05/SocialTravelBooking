<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Activity extends Model
{
    use HasUuids;

    public $timestamps = false;
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'snapshot'   => 'array',
            'is_public'  => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // --- Helpers ---

    /**
     * Ghi lại hoạt động "Đã đăng bài viết".
     */
    public static function logCreatedPost(string $userId, Post $post): self
    {
        return self::create([
            'user_id'      => $userId,
            'action_type'  => 'created_post',
            'subject_id'   => $post->id,
            'subject_type' => 'post',
            'snapshot'     => [
                'post_id'      => $post->id,
                'post_content' => mb_substr($post->content ?? '', 0, 100),
                'post_image'   => $post->media()->first()?->url,
            ],
            'is_public' => true,
        ]);
    }

    /**
     * Ghi lại hoạt động "Đã thích bài viết".
     */
    public static function logLikedPost(string $userId, Post $post): self
    {
        return self::create([
            'user_id'      => $userId,
            'action_type'  => 'liked_post',
            'subject_id'   => $post->id,
            'subject_type' => 'post',
            'snapshot'     => [
                'post_id'           => $post->id,
                'post_content'      => mb_substr($post->content ?? '', 0, 100),
                'post_image'        => $post->media()->first()?->url,
                'post_author_name'  => $post->author?->display_name,
            ],
            'is_public' => true,
        ]);
    }

    /**
     * Ghi lại hoạt động "Đã bình luận bài viết".
     */
    public static function logCommentedPost(string $userId, Post $post, string $commentText): self
    {
        return self::create([
            'user_id'      => $userId,
            'action_type'  => 'commented_post',
            'subject_id'   => $post->id,
            'subject_type' => 'post',
            'snapshot'     => [
                'post_id'           => $post->id,
                'post_content'      => mb_substr($post->content ?? '', 0, 80),
                'comment_text'      => mb_substr($commentText, 0, 100),
                'post_author_name'  => $post->author?->display_name,
            ],
            'is_public' => true,
        ]);
    }

    /**
     * Ghi lại hoạt động "Đã theo dõi người dùng".
     */
    public static function logFollowedUser(string $userId, User $targetUser): self
    {
        return self::create([
            'user_id'      => $userId,
            'action_type'  => 'followed_user',
            'subject_id'   => $targetUser->id,
            'subject_type' => 'user',
            'snapshot'     => [
                'target_user_id'     => $targetUser->id,
                'target_username'    => $targetUser->username,
                'target_avatar'      => $targetUser->avatar_url,
                'target_display_name'=> $targetUser->display_name,
            ],
            'is_public' => true,
        ]);
    }

    /**
     * Lấy danh sách hoạt động công khai của một user (cho trang Profile).
     */
    public static function getPublicFeed(string $userId, int $perPage = 20)
    {
        return self::where('user_id', $userId)
            ->where('is_public', true)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
