import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Post from '../../../components/tourist/news_feed/Post';
import { MOCK_POSTS } from './mockData';

const Home = () => {
    const { openCreateModal } = useOutletContext();
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
                    <img src="https://i.pravatar.cc/150?u=myprofile" alt="Me" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 text-gray-400 text-[15px]">Có gì mới?</div>
                    <button className="px-5 py-1.5 border border-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">Đăng</button>
                </div>


                {/* Feed */}
                <div className="flex flex-col">
                    {MOCK_POSTS.map(post => <Post key={post.id} post={post} />)}
                </div>
            </div>
        </div>
    );
};

export default Home;
