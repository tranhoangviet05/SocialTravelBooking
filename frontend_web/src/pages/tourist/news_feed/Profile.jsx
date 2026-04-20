import React, { useState } from 'react';
import {
    Instagram,
    BarChart2,
    Edit,
    UserPlus,
    Camera,
    Image as ImageIcon,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Repeat2,
    Send
} from 'lucide-react';
import Post from '../../../components/tourist/news_feed/Post';
import { useAuth } from '../../../contexts/AuthContext';

const MOCK_MY_POSTS = [
// ... (keep MOCK_MY_POSTS for now as real post API is not fully linked yet)
    {
        id: 101,
        user: { name: 'Trần Việt', avatar: 'https://i.pravatar.cc/150?u=myprofile' },
        time: '1 ngày',
        content: 'Vừa hoàn thành chuyến trekking Tà Năng - Phan Dũng. Cảm giác thật tuyệt vời khi đứng giữa biển mây!',
        media: ['https://images.unsplash.com/photo-1501555088652-021faa106b9b', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'],
        likes: 120,
        comments: 15
    },
    {
        id: 102,
        user: { name: 'Trần Việt', avatar: 'https://i.pravatar.cc/150?u=myprofile' },
        time: '3 ngày',
        content: 'Tìm đồng đội đi Hà Giang cuối tháng này nha mọi người ơi. Ai đi comment bên dưới nhé!',
        likes: 45,
        comments: 28
    }
];

const MOCK_REPLIES = [
    {
        id: 1,
        user: { name: 'Trần Việt', avatar: 'https://i.pravatar.cc/150?u=myprofile' },
        time: '2 giờ',
        content: 'Đúng rồi bạn ơi, view ở đây buổi chiều đẹp lắm!',
        targetPost: { user: 'Hoàng Nam', content: 'Có ai biết chỗ nào ngắm hoàng hôn đẹp ở Phú Quốc không?' },
        likes: 3
    },
    {
        id: 2,
        user: { name: 'Trần Việt', avatar: 'https://i.pravatar.cc/150?u=myprofile' },
        time: '5 giờ',
        content: 'Mình cũng vừa đi tour này xong, dịch vụ rất tốt.',
        targetPost: { user: 'Minh Anh', content: 'Review tour 4 đảo Nha Trang siêu chi tiết cho mọi người.' },
        likes: 12
    }
];

const MOCK_MEDIA = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1472396961695-1ad2267ef71d',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'
];

const Profile = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('Bài đăng');

    const socialProfile = currentUser?.social_profile;
    const displayName = currentUser?.display_name || currentUser?.displayName || 'Người dùng';
    const username = socialProfile?.username || currentUser?.email?.split('@')[0] || 'user';
    const avatarUrl = currentUser?.avatar_url || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
    const bio = socialProfile?.bio || 'Chưa có giới thiệu.';
    const followersCount = socialProfile?.followers_count || 0;
    const followingCount = socialProfile?.following_count || 0;
    const postsCount = socialProfile?.posts_count || 0;

    const tabs = ['Bài đăng', 'Câu trả lời', 'File phương tiện', 'Bài đăng lại'];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Bài đăng':
                return (
                    <div className="flex flex-col">
                        {postsCount > 0 ? (
                            MOCK_MY_POSTS.map(post => <Post key={post.id} post={post} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Edit size={48} className="mb-4 opacity-20" />
                                <p className="text-[15px] font-medium">Bạn chưa có bài đăng nào</p>
                            </div>
                        )}
                    </div>
                );
            case 'Câu trả lời':
                return (
                    <div className="flex flex-col">
                        {MOCK_REPLIES.map(reply => (
                            <div key={reply.id} className="py-4 border-b border-gray-200">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 border-l-2 border-gray-200 ml-5 mt-2 mb-2"></div>
                                        <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 p-3 rounded-2xl mb-2 border border-gray-100">
                                            <p className="text-[13px] text-gray-500 font-semibold mb-1">Đã trả lời {reply.targetPost.user}</p>
                                            <p className="text-[14px] text-gray-400 line-clamp-1 italic">"{reply.targetPost.content}"</p>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[15px]">{displayName}</span>
                                                <span className="text-gray-400 text-[14px]">{reply.time}</span>
                                            </div>
                                            <button className="text-gray-400"><MoreHorizontal size={18} /></button>
                                        </div>
                                        <p className="text-[15px] mt-1">{reply.content}</p>
                                        <div className="flex items-center gap-4 mt-3 text-gray-400">
                                            <Heart size={18} className="hover:text-red-500 cursor-pointer" />
                                            <MessageCircle size={18} className="hover:text-sky-500 cursor-pointer" />
                                            <Repeat2 size={18} className="hover:text-green-500 cursor-pointer" />
                                            <Send size={18} className="hover:text-sky-500 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'File phương tiện':
                return (
                    <div className="grid grid-cols-3 gap-1">
                        {MOCK_MEDIA.map((url, idx) => (
                            <div key={idx} className="aspect-square relative group cursor-pointer overflow-hidden">
                                <img src={url} alt="media" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ImageIcon className="text-white" size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Bài đăng lại':
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Repeat2 size={48} className="mb-4 opacity-20" />
                        <p className="text-[15px] font-medium">Bạn chưa đăng lại bài viết nào</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full p-6 pt-10">
            {/* Profile Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-3xl font-bold">{displayName}</h1>
                    <p className="text-[15px] mt-1 text-slate-600 font-medium">@{username}</p>
                </div>
                <div className="relative group">
                    <img src={avatarUrl} alt="Avatar" className="w-[84px] h-[84px] rounded-full object-cover border border-gray-200" />
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera size={20} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
                <p className="text-[15px] text-slate-800 whitespace-pre-wrap">{bio}</p>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[15px] text-gray-500 font-medium">
                    <div className="flex -space-x-2">
                        <img src="https://i.pravatar.cc/150?u=1" className="w-5 h-5 rounded-full border-2 border-white" />
                        <img src="https://i.pravatar.cc/150?u=2" className="w-5 h-5 rounded-full border-2 border-white" />
                    </div>
                    <span className="hover:underline cursor-pointer">{followersCount} người theo dõi</span>
                    <span>·</span>
                    <span className="hover:underline cursor-pointer">{followingCount} đang theo dõi</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><BarChart2 size={24} className="text-slate-800" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Instagram size={24} className="text-slate-800" /></button>
                </div>
            </div>

            <button className="w-full py-2.5 border border-gray-300 rounded-2xl font-bold text-[15px] mb-8 hover:bg-gray-50 transition-all active:scale-[0.98]">
                Chỉnh sửa trang cá nhân
            </button>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 pb-3 text-[15px] font-bold transition-all relative ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black animate-in fade-in slide-in-from-bottom-1 duration-300" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mb-10 min-h-[300px]">
                {renderTabContent()}
            </div>

        </div>
    );
};

export default Profile;