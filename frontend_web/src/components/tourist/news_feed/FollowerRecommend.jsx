import React from 'react';
import { MOCK_USERS } from '../../../pages/tourist/news_feed/mockData';

const FollowerRecommend = () => {
    // Giả sử user hiện tại là user có id 4 (Trần Việt)
    const currentUser = MOCK_USERS.find(u => u.username === "tzitttt.2909") || MOCK_USERS[3];

    return (
        <div className="hidden lg:block w-[320px] sticky top-0 h-screen pt-12 mr-15 pl-8 pr-6">
            {/* My Profile Quick View */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight hover:underline cursor-pointer">{currentUser.username}</span>
                        <span className="text-gray-500 text-[14px]">{currentUser.name}</span>
                    </div>
                </div>
                <button className="text-sky-500 text-xs font-bold hover:text-sky-700 transition-colors">
                    Chuyển
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-500 text-sm">Gợi ý cho bạn</h3>
                <button className="text-xs font-bold hover:text-gray-500 transition-colors">Xem tất cả</button>
            </div>

            <div className="flex flex-col gap-5">
                {MOCK_USERS.slice(0, 3).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                            <div className="flex flex-col">
                                <span className="font-bold text-[13px] leading-tight hover:underline cursor-pointer">{user.username}</span>
                                <span className="text-gray-400 text-[12px]">{user.name}</span>
                            </div>
                        </div>
                        <button className="text-sky-500 text-xs font-bold hover:text-black transition-colors">
                            Theo dõi
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-[12px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1 leading-tight">
                <a href="#" className="hover:underline">Giới thiệu</a>
                <a href="#" className="hover:underline">Trợ giúp</a>
                <a href="#" className="hover:underline">Báo chí</a>
                <a href="#" className="hover:underline">API</a>
                <a href="#" className="hover:underline">Việc làm</a>
                <a href="#" className="hover:underline">Quyền riêng tư</a>
                <a href="#" className="hover:underline">Điều khoản</a>
                <a href="#" className="hover:underline">Vị trí</a>
                <a href="#" className="hover:underline">Ngôn ngữ</a>
            </div>
            <p className="mt-4 text-[12px] text-gray-400 font-semibold uppercase tracking-wider">© 2024 Social Travel Booking</p>
        </div>
    );
};

export default FollowerRecommend;


