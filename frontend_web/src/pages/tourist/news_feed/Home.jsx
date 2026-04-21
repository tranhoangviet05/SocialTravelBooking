import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Post from '../../../components/tourist/news_feed/Post';
import Avatar from '../../../components/common/Avatar';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocialData } from '../../../contexts/SocialDataContext';
import { Repeat2 } from 'lucide-react';

const Home = () => {
    const { openCreateModal, refreshTrigger } = useOutletContext();
    const { currentUser } = useAuth();
    const { feedPosts, fetchFeed, loading } = useSocialData();
    const navigate = useNavigate();

    useEffect(() => {
        // Force refresh nếu có trigger (vừa đăng bài)
        fetchFeed(refreshTrigger > 0);
    }, [fetchFeed, refreshTrigger]);

    return (
        <div className="w-full">
            {/* Top Navigation */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 pt-6">
                <div className="flex justify-center gap-6 pb-4 font-semibold text-[15px]">
                    <button className="text-black border-b-2 border-black pb-1">Dành cho bạn</button>
                    <button className="text-gray-400 hover:text-gray-700 pb-1">Đang theo dõi</button>
                </div>
            </div>

            <div className="p-6">
                <div
                    className="flex items-center gap-4 pb-4 border-b border-gray-200 mb-4 cursor-pointer group"
                    onClick={openCreateModal}
                >
                    <div onClick={(e) => { e.stopPropagation(); navigate('/newsfeed/profile'); }}>
                        <Avatar src={currentUser?.avatar_url} alt={currentUser?.display_name} size="md" />
                    </div>
                    <div className="flex-1 text-gray-400 text-[15px]">Có gì mới?</div>
                    <button className="px-5 py-1.5 border border-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">Đăng</button>
                </div>

                {/* Post Feed */}
                <div className="px-2 md:px-0">
                    {loading && feedPosts.length === 0 ? (
                        <div className="flex flex-col gap-6 py-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse flex gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-20 bg-gray-100 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : feedPosts.length > 0 ? (
                        feedPosts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <Repeat2 size={32} className="text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">Chưa có bài viết nào. Hãy theo dõi thêm mọi người!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
