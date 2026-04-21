import React, { useState, useEffect } from 'react';
import socialApi from '../../../api/socialApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import Avatar from '../../../components/common/Avatar';
import { useSocialData } from '../../../contexts/SocialDataContext';

const FollowerRecommend = () => {
    const { currentUser } = useAuth();
    const { updateFollowStatus } = useSocialData();
    const notification = useNotification();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await socialApi.getSuggestions();
            if (response.success) {
                setSuggestions(response.data);
            }
        } catch (error) {
            console.error("Fetch suggestions error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleFollow = async (userId) => {
        try {
            const response = await socialApi.toggleFollow(userId);
            if (response.success) {
                const isFollowing = response.data.following;
                setSuggestions(prev => prev.map(s => s.id === userId ? { ...s, is_following: isFollowing } : s));
                updateFollowStatus(userId, isFollowing, response.data.followers_count);
                notification.success(isFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi");
            }
        } catch (error) {
            notification.error("Lỗi khi thay đổi trạng thái theo dõi");
        }
    };

    return (
        <div className="hidden lg:block w-[350px] sticky top-4 h-fit px-4 pt-12">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <h2 className="font-bold text-[18px] mb-4">Gợi ý cho bạn</h2>
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map(suggestion => (
                            <div key={suggestion.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Avatar src={suggestion.avatar_url} alt={suggestion.display_name} size="md" />
                                    <div className="flex flex-col overflow-hidden max-w-[140px]">
                                        <span className="font-bold text-[14px] leading-tight hover:underline cursor-pointer truncate">
                                            {suggestion.display_name}
                                        </span>
                                        <span className="text-gray-500 text-[13px] truncate">@{suggestion.social_profile?.username}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleFollow(suggestion.id)}
                                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all shadow-sm ${suggestion.is_following ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                                >
                                    {suggestion.is_following ? 'Đang theo dõi' : 'Theo dõi'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm italic py-4">Không có gợi ý mới</p>
                    )}
                </div>
            </div>

            <div className="mt-8 text-[12px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1 px-2">
                <a href="#" className="hover:underline">Giới thiệu</a>
                <a href="#" className="hover:underline">Hỗ trợ</a>
                <a href="#" className="hover:underline">Điều khoản</a>
                <a href="#" className="hover:underline">Bảo mật</a>
            </div>
            <p className="mt-4 text-[12px] text-gray-400 font-semibold px-2 uppercase tracking-tight">© 2024 Social Travel Booking</p>
        </div>
    );
};

export default FollowerRecommend;
