import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin, Image as ImageIcon } from 'lucide-react';
import Button from '../../components/common/Button';

const MOCK_POSTS = [
    {
        id: 1,
        author: { name: 'Thanh Vũ', avatar: null },
        location: 'Đà Lạt, Lâm Đồng',
        time: '2 giờ trước',
        content: 'Chuyến đi săn mây tuyệt vời tại Đồi Chè Cầu Đất. Thời tiết lạnh nhưng cảnh quang rực rỡ lúc bình minh làm mình quên hết mệt mỏi! Tour này guide rất nhiệt tình, đánh giá 5 sao cho công ty Phương Trang.',
        images: ['https://images.unsplash.com/photo-1595183492723-4c92b2d07e60?auto=format&fit=crop&q=80&w=800'],
        likes: 124,
        comments: 23,
    },
    {
        id: 2,
        author: { name: 'Nguyễn Trần Tâm', avatar: null },
        location: 'Hội An, Quảng Nam',
        time: '5 giờ trước',
        content: 'Khách sạn Mường Thanh Boutique ở Hội An cực kỳ đẹp và yên tĩnh. Ăn sáng buffet ngon, nhân viên thân thiện. Gợi ý mọi người nên thử nếu có ý định nghỉ dưỡng!',
        images: ['https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&q=80&w=800'],
        likes: 89,
        comments: 12,
    }
];

const Community = () => {
    const [posts, setPosts] = useState(MOCK_POSTS);

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Cộng đồng du lịch</h1>

            {/* Tạo bài viết mới */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">
                        U
                    </div>
                    <div className="flex-1">
                        <textarea 
                            placeholder="Bạn muốn chia sẻ trải nghiệm du lịch nào hôm nay?" 
                            className="w-full bg-gray-50 rounded-xl border-none resize-none px-4 py-3 outline-none text-sm text-slate-700 min-h-[100px]"
                        ></textarea>
                        <div className="flex items-center justify-between mt-3">
                            <button className="flex items-center gap-2 text-sky-600 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold">
                                <ImageIcon size={18} />
                                <span>Thêm ảnh</span>
                            </button>
                            <Button variant="primary">Đăng bài</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bảng tin (Feed) */}
            <div className="space-y-6">
                {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Header bài viết */}
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                {post.author.name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">{post.author.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                    <span>{post.time}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><MapPin size={12}/> {post.location}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Nội dung */}
                        <div className="px-4 pb-3">
                            <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                        </div>

                        {/* Hình ảnh */}
                        {post.images.length > 0 && (
                            <img src={post.images[0]} alt="Post image" className="w-full h-80 object-cover" />
                        )}

                        {/* Tương tác */}
                        <div className="px-4 py-3 border-t border-slate-100 bg-gray-50/50 flex items-center gap-6">
                            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors">
                                <Heart size={18} />
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors">
                                <MessageCircle size={18} />
                                <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-green-500 transition-colors ml-auto">
                                <Share2 size={18} />
                                <span>Chia sẻ</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Community;
