import React, { useRef, useState } from 'react';
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal, Plus } from 'lucide-react';

const Post = ({ post }) => {
    const scrollRef = useRef(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsMouseDown(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
        scrollRef.current.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
        setIsMouseDown(false);
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Tốc độ di chuyển
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="py-4 border-b border-gray-200">
            <div className="flex gap-3">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] border-2 border-white"><Plus size={16} strokeWidth={3} /></div>
                    </div>
                </div>

                <div className="flex-1 pb-2 overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-[15px] hover:underline cursor-pointer">{post.user.name}</span>
                            <span className="text-gray-400 text-[14px]">{post.time}</span>
                        </div>
                        <button className="text-gray-400 hover:text-black"><MoreHorizontal size={20} /></button>
                    </div>

                    <p className="text-[15px] mt-1 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                    {post.media && post.media.length > 0 && (
                        <div className="mt-3 w-full">
                            {post.media.length === 1 ? (
                                <img
                                    src={post.media[0]}
                                    alt="Post media"
                                    className="w-full h-auto rounded-xl border border-gray-200 bg-gray-50 max-h-[700px] object-cover"
                                />
                            ) : (
                                <div
                                    ref={scrollRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseLeave={handleMouseLeave}
                                    onMouseUp={handleMouseUp}
                                    onMouseMove={handleMouseMove}
                                    className="flex overflow-x-auto gap-2 pb-2 snap-x no-scrollbar transition-all duration-75 select-none"
                                    style={{ cursor: 'grab', scrollBehavior: isMouseDown ? 'auto' : 'smooth' }}
                                >
                                    {post.media.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Post media ${idx}`}
                                            className="h-[480px] w-auto aspect-[3/4] object-cover snap-center rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0 pointer-events-none"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 text-black">
                        <button className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><Heart size={20} /></button>
                        <button className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><MessageCircle size={20} /></button>
                        <button className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><Repeat2 size={20} /></button>
                        <button className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"><Send size={20} /></button>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-[14px] text-gray-500">
                        <span>{post.likes} lượt thích</span>
                        <span>·</span>
                        <span>{post.comments} bình luận</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;