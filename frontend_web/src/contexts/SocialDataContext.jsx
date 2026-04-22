import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socialApi from '../api/socialApi';
import echo from '../utils/echo';
import { useAuth } from './AuthContext';

const SocialDataContext = createContext(null);

export const useSocialData = () => useContext(SocialDataContext);

export const SocialDataProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [feedPosts, setFeedPosts] = useState([]);
    const [profileCache, setProfileCache] = useState({});
    const [feedPagination, setFeedPagination] = useState({ currentPage: 1, lastPage: 1, hasMore: true });
    const [lastFeedFetch, setLastFeedFetch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

    // =========================================================
    // WebSocket Listener
    // =========================================================
    useEffect(() => {
        console.log("Đang khởi tạo kết nối Reverb...");
        const interactionChannel = echo.channel('social-interactions');
        const updateChannel = echo.channel('social-updates');

        echo.connector.pusher.connection.bind('connected', () => {
            console.log("Đã kết nối thành công tới Reverb Server!");
        });

        // Cập nhật likes
        interactionChannel.listen('.post.liked', (e) => {
            const postId = String(e.postId);
            const newCount = e.likesCount;
            const isMe = currentUser && String(e.likedBy) === String(currentUser.id);

            setFeedPosts(prev => prev.map(p => {
                if (String(p.id) === postId) {
                    return { 
                        ...p, 
                        likes_count: newCount,
                        is_liked: isMe ? e.liked : p.is_liked
                    };
                }
                return p;
            }));

            setProfileCache(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(uid => {
                    if (next[uid]?.posts) {
                        const updatedPosts = next[uid].posts.map(p => {
                            if (String(p.id) === postId) {
                                return { 
                                    ...p, 
                                    likes_count: newCount,
                                    is_liked: isMe ? e.liked : p.is_liked
                                };
                            }
                            return p;
                        });
                        if (updatedPosts !== next[uid].posts) {
                            next[uid] = { ...next[uid], posts: updatedPosts };
                            changed = true;
                        }
                    }
                });
                return changed ? next : prev;
            });
        });

        // Lắng nghe sự kiện Follow
        updateChannel.listen('.user.followed', (e) => {
            const { followerId, followingId, status, followerCount, followingCount } = e;

            setFeedPosts(prev => prev.map(p => {
                if (String(p.user_id) === String(followingId)) {
                    return { 
                        ...p, 
                        author: { 
                            ...p.author, 
                            is_following: status,
                            social_profile: {
                                ...p.author.social_profile,
                                followers_count: followerCount
                            }
                        } 
                    };
                }
                return p;
            }));

            setProfileCache(prev => {
                const next = { ...prev };
                let changed = false;

                if (next[followingId]) {
                    next[followingId] = {
                        ...next[followingId],
                        user: {
                            ...next[followingId].user,
                            is_following: status,
                            social_profile: {
                                ...next[followingId].user?.social_profile,
                                followers_count: followerCount
                            }
                        }
                    };
                    changed = true;
                }

                if (next[followerId]) {
                    next[followerId] = {
                        ...next[followerId],
                        user: {
                            ...next[followerId].user,
                            social_profile: {
                                ...next[followerId].user?.social_profile,
                                following_count: followingCount
                            }
                        }
                    };
                    changed = true;
                }

                return changed ? next : prev;
            });
        });

        return () => {
            interactionChannel.stopListening('.post.liked');
            updateChannel.stopListening('.user.followed');
        };
    }, []);

    const fetchFeed = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && lastFeedFetch && (now - lastFeedFetch < CACHE_DURATION) && feedPosts.length > 0) {
            return;
        }

        try {
            setLoading(true);
            const response = await socialApi.getFeed(10, 1);
            if (response.success) {
                const paginationData = response.data;
                setFeedPosts(paginationData.data);
                setFeedPagination({
                    currentPage: paginationData.current_page,
                    lastPage: paginationData.last_page,
                    hasMore: paginationData.current_page < paginationData.last_page
                });
                setLastFeedFetch(now);
            }
        } catch (error) {
            console.error("Fetch feed error:", error);
        } finally {
            setLoading(false);
        }
    }, [lastFeedFetch, feedPosts.length]);

    const fetchMoreFeed = useCallback(async () => {
        if (loadingMore || !feedPagination.hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = feedPagination.currentPage + 1;
            const response = await socialApi.getFeed(10, nextPage);
            
            if (response.success) {
                const paginationData = response.data;
                setFeedPosts(prev => [...prev, ...paginationData.data]);
                setFeedPagination({
                    currentPage: paginationData.current_page,
                    lastPage: paginationData.last_page,
                    hasMore: paginationData.current_page < paginationData.last_page
                });
            }
        } catch (error) {
            console.error("Fetch more feed error:", error);
        } finally {
            setLoadingMore(false);
        }
    }, [feedPagination, loadingMore]);

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
                user: postsRes.success && postsRes.data.data.length > 0 ? postsRes.data.data[0].author : null,
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
        const pId = String(postId);
        setFeedPosts(prev => prev.filter(p => String(p.id) !== pId));
        setProfileCache(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(uid => {
                if (next[uid]?.posts) {
                    next[uid] = {
                        ...next[uid],
                        posts: next[uid].posts.filter(p => String(p.id) !== pId)
                    };
                }
            });
            return next;
        });
    };

    // Cập nhật trạng thái follow trong toàn bộ cache
    const updateFollowStatus = (userId, isFollowing, followersCount) => {
        const uId = String(userId);
        setFeedPosts(prev => prev.map(p => {
            if (String(p.user_id) === uId) {
                return { 
                    ...p, 
                    author: { 
                        ...p.author, 
                        is_following: isFollowing,
                        social_profile: {
                            ...p.author?.social_profile,
                            followers_count: followersCount || p.author?.social_profile?.followers_count
                        }
                    } 
                };
            }
            return p;
        }));
    };

    // Cập nhật một bài viết cụ thể trong cache
    const updatePostInState = (postId, newData) => {
        const pId = String(postId);
        
        // Cập nhật Feed
        setFeedPosts(prev => prev.map(p => 
            String(p.id) === pId ? { ...p, ...newData } : p
        ));

        // Cập nhật Profile Cache
        setProfileCache(prev => {
            const next = { ...prev };
            let changed = false;
            Object.keys(next).forEach(uid => {
                if (next[uid]?.posts) {
                    const updatedPosts = next[uid].posts.map(p =>
                        String(p.id) === pId ? { ...p, ...newData } : p
                    );
                    if (updatedPosts !== next[uid].posts) {
                        next[uid] = { ...next[uid], posts: updatedPosts };
                        changed = true;
                    }
                }
            });
            return changed ? next : prev;
        });
    };

    const value = {
        feedPosts,
        feedPagination,
        fetchFeed,
        fetchMoreFeed,
        fetchUserProfile,
        profileCache,
        removePostFromState,
        updatePostInState,
        updateFollowStatus,
        loading,
        loadingMore
    };

    return (
        <SocialDataContext.Provider value={value}>
            {children}
        </SocialDataContext.Provider>
    );
};

export default SocialDataContext;
