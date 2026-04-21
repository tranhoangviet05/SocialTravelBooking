import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socialApi from '../api/socialApi';
import echo from '../utils/echo';

const SocialDataContext = createContext(null);

export const useSocialData = () => useContext(SocialDataContext);

export const SocialDataProvider = ({ children }) => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [profileCache, setProfileCache] = useState({});
    const [lastFeedFetch, setLastFeedFetch] = useState(null);
    const [loading, setLoading] = useState(false);

    const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

    // =========================================================
    // WebSocket Listener - Đặt ở đây để chỉ có 1 listener duy nhất
    // =========================================================
    useEffect(() => {
        const channel = echo.channel('social-interactions');

        // Cập nhật likes cho bất kỳ bài viết nào đang được cache
        channel.listen('.post.liked', (e) => {
            const postId = String(e.postId);
            const newCount = e.likesCount;

            // Cập nhật trong Feed
            setFeedPosts(prev => prev.map(p =>
                String(p.id) === postId
                    ? { ...p, likes_count: newCount }
                    : p
            ));

            // Cập nhật trong Profile Cache
            setProfileCache(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(uid => {
                    if (next[uid]?.posts) {
                        const updatedPosts = next[uid].posts.map(p =>
                            String(p.id) === postId ? { ...p, likes_count: newCount } : p
                        );
                        if (updatedPosts !== next[uid].posts) {
                            next[uid] = { ...next[uid], posts: updatedPosts };
                            changed = true;
                        }
                    }
                });
                return changed ? next : prev;
            });
        });

        return () => {
            channel.stopListening('.post.liked');
        };
    }, []); // Chỉ mount/unmount 1 lần

    const fetchFeed = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && lastFeedFetch && (now - lastFeedFetch < CACHE_DURATION) && feedPosts.length > 0) {
            return;
        }

        try {
            setLoading(true);
            const response = await socialApi.getFeed();
            if (response.success) {
                setFeedPosts(response.data.data);
                setLastFeedFetch(now);
            }
        } catch (error) {
            console.error("Fetch feed error:", error);
        } finally {
            setLoading(false);
        }
    }, [lastFeedFetch, feedPosts.length]);

    const fetchUserProfile = useCallback(async (userId, force = false) => {
        const now = Date.now();
        const cached = profileCache[userId];
        
        if (!force && cached && (now - cached.lastFetched < CACHE_DURATION)) {
            return cached;
        }

        try {
            const [postsRes, repliesRes] = await Promise.all([
                socialApi.getUserPosts(userId),
                socialApi.getUserReplies(userId)
            ]);

            const newData = {
                posts: postsRes.success ? postsRes.data.data : [],
                replies: repliesRes.success ? repliesRes.data.data : [],
                lastFetched: now
            };

            setProfileCache(prev => ({
                ...prev,
                [userId]: newData
            }));

            return newData;
        } catch (error) {
            console.error("Fetch profile error:", error);
            return null;
        }
    }, [profileCache]);

    // Xóa bài viết khỏi cache toàn cục
    const removePostFromState = (postId) => {
        // Cập nhật Feed
        setFeedPosts(prev => prev.filter(p => p.id !== postId));
        
        // Cập nhật Profile Cache (Immutable update)
        setProfileCache(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(uid => {
                if (next[uid] && next[uid].posts) {
                    next[uid] = {
                        ...next[uid],
                        posts: next[uid].posts.filter(p => p.id !== postId)
                    };
                }
            });
            return next;
        });
    };

    // Cập nhật trạng thái follow trong toàn bộ cache
    const updateFollowStatus = (userId, isFollowing, followersCount) => {
        // Cập nhật Feed
        setFeedPosts(prev => prev.map(p => {
            if (p.user_id === userId) {
                return { ...p, author: { ...p.author, is_following: isFollowing } };
            }
            return p;
        }));

        // Cập nhật Profile Cache
        setProfileCache(prev => {
            const next = { ...prev };
            if (next[userId]) {
                // Đây là logic đơn giản, thực tế có thể cần cập nhật social_profile của user đó
            }
            return next;
        });
    };

    const value = {
        feedPosts,
        setFeedPosts,
        lastFeedFetch,
        fetchFeed,
        fetchUserProfile,
        profileCache,
        removePostFromState,
        updateFollowStatus,
        loading
    };

    return (
        <SocialDataContext.Provider value={value}>
            {children}
        </SocialDataContext.Provider>
    );
};
