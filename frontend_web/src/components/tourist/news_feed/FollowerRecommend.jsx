import React from 'react';
import { MOCK_USERS } from '../../../pages/tourist/news_feed/mockData';
import { useAuth } from '../../../contexts/AuthContext';

const FollowerRecommend = () => {
    const { currentUser } = useAuth();
    
    // Thông tin hiển thị (ưu tiên dữ liệu từ DB, fallback về default)
    const displayName = currentUser?.display_name || currentUser?.displayName || 'Người dùng';
    const username = currentUser?.social_profile?.username || currentUser?.email?.split('@')[0] || 'user';
    const avatarUrl = currentUser?.avatar_url || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

    return (
        <div className="hidden lg:block w-[320px] sticky top-0 h-screen pt-12 mr-15 pl-8 pr-6">
            {/* My Profile Quick View */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <img src={avatarUrl} alt={displayName} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight hover:underline cursor-pointer">{username}</span>
                        <span className="text-gray-400 text-[13px]">{displayName}</span>
                    </div>
                </div>
                <button className="text-sky-500 text-xs font-bold hover:text-sky-700 transition-colors cursor-pointer">
                    Chuyển
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-400 text-[13px] uppercase tracking-wider">Gợi ý cho bạn</h3>
                <button className="text-xs font-bold hover:text-gray-500 transition-colors cursor-pointer">Xem tất cả</button>
            </div>

            <div className="flex flex-col gap-4">
                {MOCK_USERS.slice(0, 5).filter(u => u.username !== username).map(user => (
                    <div key={user.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform" />
                            <div className="flex flex-col">
                                <span className="font-bold text-[13px] leading-tight hover:underline cursor-pointer">{user.username}</span>
                                <span className="text-gray-400 text-[12px]">{user.name}</span>
                                <span className="text-[10px] text-gray-300">Gợi ý cho bạn</span>
                            </div>
                        </div>
                        <button className="text-sky-500 text-xs font-bold hover:text-sky-800 transition-colors cursor-pointer">
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


