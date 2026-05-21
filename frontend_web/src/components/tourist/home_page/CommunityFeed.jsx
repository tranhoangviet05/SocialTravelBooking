import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Repeat2, Send, MoreHorizontal, Loader2 } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CommunityPostSkeleton } from '../../common/HomeSkeletons';

const CommunityFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestPosts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/general/get/posts/latest`);
                if (response.data.success) {
                    setPosts(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy bài viết cộng đồng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestPosts();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-slate-50/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-4">
                            <div className="w-12 h-1 bg-sky-100 rounded-full"></div>
                            <div className="h-10 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
                            <div className="h-4 w-48 bg-slate-100 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <CommunityPostSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (posts.length === 0) return null;

    return (
        <section className="py-20 bg-slate-50/30">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="w-12 h-1 bg-sky-500 rounded-full mb-4"></div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Khoảnh khắc chia sẻ</h2>
                        <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Góc nhìn thực tế từ cộng đồng du lịch</p>
                    </div>
                    <button className="text-sky-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                        Khám phá thêm <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex flex-col h-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <div className="flex gap-3 flex-1">
                                {/* Left: Avatar & Thread Line */}
                                <div className="flex flex-col items-center">
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-100 shrink-0">
                                        <img 
                                            src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.display_name || 'User'}&background=random`} 
                                            className="w-full h-full object-cover" 
                                            alt="" 
                                        />
                                    </div>
                                    <div className="w-[1.5px] grow bg-gray-100 my-2 rounded-full"></div>
                                </div>

                                {/* Right: Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-bold text-[13px] text-slate-900 truncate">
                                            {post.author?.social_profile?.username || post.author?.display_name}
                                        </h4>
                                        <span className="text-[11px] text-gray-400 shrink-0">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: false, locale: vi })}
                                        </span>
                                    </div>

                                    {post.location && (
                                        <p className="text-[11px] text-sky-600 font-bold mb-2 truncate">
                                            {post.location.name}
                                        </p>
                                    )}

                                    <div className="mt-1">
                                        <p className="text-[13px] text-slate-700 leading-relaxed line-clamp-4">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Media Preview (Small) */}
                                    {post.media && post.media.length > 0 && (
                                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-50 aspect-[4/3]">
                                            <img 
                                                src={post.media[0].url} 
                                                className="w-full h-full object-cover" 
                                                alt="" 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-3">
                                <div className="flex items-center gap-4 text-slate-900">
                                    <button className="hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                                        <Heart size={18} />
                                    </button>
                                    <button className="hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                                        <MessageCircle size={18} />
                                    </button>
                                    <button className="hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                                        <Repeat2 size={18} />
                                    </button>
                                    <button className="hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                                        <Send size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium">
                                    <span>{post.comments_count || 0} câu trả lời</span>
                                    <span>•</span>
                                    <span>{post.likes_count || 0} lượt thích</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CommunityFeed;
