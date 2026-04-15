import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CreatePostModal from '../../components/tourist/news_feed/CreatePostModal';
import Sidebar from '../../components/tourist/news_feed/Slidebar';
import RightSidebar from '../../components/tourist/news_feed/FollowerRecommend';
import FloatingMessageButton from '../../components/tourist/news_feed/FloatingMessageButon';

const NewsFeed = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


    return (
        <div className="min-h-screen bg-white text-black font-sans flex justify-center">
            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

            {/* Main Container */}
            <div className="w-full flex justify-between relative px-2 md:px-6">

                {/* Left Navigation */}
                <Sidebar 
                    openCreateModal={() => setIsCreateModalOpen(true)}
                />

                {/* Center Content (News Feed / Profile / Search) */}
                <main className="flex-1 max-w-[620px] min-h-screen border-x border-gray-100 bg-white shadow-[0_0_40px_rgba(0,0,0,0.02)]">
                    <Outlet context={{ openCreateModal: () => setIsCreateModalOpen(true) }} />
                </main>

                {/* Right Sidebar (Gợi ý theo dõi) - Chỉ hiện trên màn hình lớn */}
                <RightSidebar />

            </div>

            {/* Create Post Modal */}
            <CreatePostModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />


            {/* Floating Action Button */}
            <FloatingMessageButton />
        </div>
    );
}

export default NewsFeed;
