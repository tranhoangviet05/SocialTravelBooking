<?php

namespace App\Services;

use App\Models\User;
use App\Models\SocialProfile;
use App\Events\PostLiked;
use App\Events\CommentCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
                if (!empty($data['displayName'])) {
                    $user->display_name = $data['displayName'];
                }
                if (!empty($data['avatarUrl'])) {
                    $user->avatar_url = $data['avatarUrl'];
                }
                
                $user->social_active = true;
                $user->save();

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

    /**
     * Tạo bài viết mới
     */
    public function createPost(User $user, array $data): \App\Models\Post
    {
        return DB::transaction(function () use ($user, $data) {
            $post = \App\Models\Post::create([
                'user_id'     => $user->id,
                'content'     => $data['content'] ?? null,
                'location_id' => $data['location_id'] ?? null,
                'visibility'  => $data['visibility'] ?? 'public',
            ]);

            // Xử lý media
            if (!empty($data['media'])) {
                foreach ($data['media'] as $index => $item) {
                    $post->media()->create([
                        'url'   => $item['url'],
                        'type'  => $item['type'] ?? 'image',
                        'order' => $index,
                    ]);
                }
            }

            // Xử lý tags
            if (!empty($data['tags'])) {
                foreach ($data['tags'] as $tagName) {
                    $tag = \App\Models\Tag::firstOrCreate(
                        ['name' => strtolower($tagName)],
                        ['display_name' => $tagName]
                    );
                    $post->tags()->attach($tag->id);
                }
            }

            // Cập nhật số lượng bài viết trong social_profile
            $user->socialProfile()->increment('posts_count');

            return $post->load(['author', 'media', 'tags', 'location']);
        });
    }

    /**
     * Like hoặc Unlike bài viết
     */
    public function toggleLike(User $user, string $postId): array
    {
        $post = \App\Models\Post::findOrFail($postId);
        $like = \App\Models\Like::where('user_id', $user->id)->where('post_id', $postId)->first();

        if ($like) {
            $like->delete();
            $post->decrement('likes_count');
            $liked = false;
        } else {
            \App\Models\Like::create([
                'user_id' => $user->id,
                'post_id' => $postId
            ]);
            $post->increment('likes_count');
            $liked = true;
        }

        broadcast(new PostLiked($postId, $post->likes_count, $user->id, $liked));

        return ['liked' => $liked, 'likes_count' => $post->likes_count];
    }

    /**
     * Thêm bình luận
     */
    public function addComment(User $user, string $postId, string $content): \App\Models\Comment
    {
        return DB::transaction(function () use ($user, $postId, $content) {
            $post = \App\Models\Post::findOrFail($postId);
            
            $comment = \App\Models\Comment::create([
                'user_id' => $user->id,
                'post_id' => $postId,
                'content' => $content
            ]);

            $post->increment('comments_count');

            $comment = $comment->load('user');
            
            // Gửi notification real-time
            broadcast(new CommentCreated($comment))->toOthers();

            return $comment;
        });
    }

    /**
     * Follow hoặc Unfollow người dùng
     */
    public function toggleFollow(User $follower, string $followingId): array
    {
        if ($follower->id === $followingId) {
            throw new Exception("Bạn không thể theo dõi chính mình");
        }

        $followingUser = User::findOrFail($followingId);
        
        $follow = \App\Models\Follow::where('follower_id', $follower->id)
                                    ->where('following_id', $followingId)
                                    ->first();

        if ($follow) {
            $follow->delete();
            
            $follower->socialProfile()->decrement('following_count');
            $followingUser->socialProfile()->decrement('followers_count');
            
            $status = false;
        } else {
            \App\Models\Follow::create([
                'follower_id'  => $follower->id,
                'following_id' => $followingId
            ]);

            $follower->socialProfile()->increment('following_count');
            $followingUser->socialProfile()->increment('followers_count');
            
            $status = true;
        }

        return [
            'following' => $status,
            'followers_count' => $followingUser->socialProfile->followers_count
        ];
    }

    public function getFeed(User $user, int $perPage = 10)
    {
        // Lấy danh sách ID những người đang theo dõi
        $followingIds = \App\Models\Follow::where('follower_id', $user->id)
                                          ->pluck('following_id')
                                          ->toArray();
        
        // Luôn bao gồm bài viết của chính mình
        $followingIds[] = $user->id;

        $posts = \App\Models\Post::whereIn('user_id', $followingIds)
                               ->with(['author.socialProfile', 'media', 'tags', 'location'])
                               ->withCount([
                                   'likes as is_liked' => function($query) use ($user) {
                                       $query->where('user_id', $user->id);
                                   }
                               ])
                               ->orderByDesc('created_at')
                               ->paginate($perPage);

        // Bổ sung trạng thái follow cho từng author
        $posts->getCollection()->transform(function ($post) use ($user) {
            $post->author->is_following = \App\Models\Follow::where('follower_id', $user->id)
                                                            ->where('following_id', $post->user_id)
                                                            ->exists();
            return $post;
        });

        // Nếu bản tin theo dõi trống, gợi ý bài viết công khai của mọi người (Discovery Mode)
        if ($posts->total() === 0) {
            $discoveryPosts = \App\Models\Post::where('visibility', 'public')
                                   ->with(['author.socialProfile', 'media', 'tags', 'location'])
                                   ->withCount([
                                       'likes as is_liked' => function($query) use ($user) {
                                           $query->where('user_id', $user->id);
                                       }
                                   ])
                                   ->orderByDesc('created_at')
                                   ->paginate($perPage);
            
            $discoveryPosts->getCollection()->transform(function ($post) use ($user) {
                $post->author->is_following = \App\Models\Follow::where('follower_id', $user->id)
                                                                ->where('following_id', $post->user_id)
                                                                ->exists();
                return $post;
            });
            
            return $discoveryPosts;
        }

        return $posts;
    }

    /**
     * Lấy bài viết của một người dùng cụ thể
     */
    public function getUserPosts(User $user, string $targetUserId, int $perPage = 10)
    {
        $posts = \App\Models\Post::where('user_id', $targetUserId)
                               ->with(['author.socialProfile', 'media', 'tags', 'location'])
                               ->withCount(['likes as is_liked' => function($query) use ($user) {
                                   $query->where('user_id', $user->id);
                               }])
                               ->orderByDesc('created_at')
                               ->paginate($perPage);

        $isFollowing = \App\Models\Follow::where('follower_id', $user->id)
                                         ->where('following_id', $targetUserId)
                                         ->exists();

        $posts->getCollection()->transform(function ($post) use ($isFollowing) {
            $post->author->is_following = $isFollowing;
            return $post;
        });

        return $posts;
    }

    /**
     * Lấy danh sách bình luận của một người dùng cụ thể (Replies)
     */
    public function getUserComments(string $userId, int $perPage = 15)
    {
        return \App\Models\Comment::where('user_id', $userId)
                                  ->with(['post.author', 'author'])
                                  ->orderByDesc('created_at')
                                  ->paginate($perPage);
    }

    /**
     * Tìm kiếm bài viết (theo từ khóa, hashtag hoặc địa điểm)
     */
    public function searchPosts(User $user, ?string $q = null, ?string $tag = null, ?int $locationId = null, int $perPage = 15)
    {
        $query = \App\Models\Post::with(['author.socialProfile', 'media', 'tags', 'location'])
                                 ->withCount(['likes as is_liked' => function($q) use ($user) {
                                     $q->where('user_id', $user->id);
                                 }])
                                 ->where('visibility', 'public');

        if ($tag) {
            $query->whereHas('tags', function($q) use ($tag) {
                $q->where('name', strtolower($tag));
            });
        }

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('content', 'like', "%{$q}%")
                    ->orWhereHas('author', function($sub2) use ($q) {
                        $sub2->where('display_name', 'like', "%{$q}%");
                    });
            });
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Tìm kiếm người dùng
     */
    public function searchUsers(User $user, string $q, int $perPage = 20)
    {
        $users = User::with('socialProfile')
                     ->where('social_active', true)
                     ->where(function($query) use ($q) {
                         $query->where('display_name', 'like', "%{$q}%")
                               ->orWhereHas('socialProfile', function($sub) use ($q) {
                                   $sub->where('username', 'like', "%{$q}%");
                               });
                     })
                     ->where('id', '!=', $user->id)
                     ->paginate($perPage);

        // Bổ sung trạng thái is_following
        $users->getCollection()->transform(function($u) use ($user) {
            $u->is_following = \App\Models\Follow::where('follower_id', $user->id)
                                                 ->where('following_id', $u->id)
                                                 ->exists();
            return $u;
        });

        return $users;
    }
}
