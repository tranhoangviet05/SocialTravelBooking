import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import Avatar from '../../../components/common/Avatar';
import socialApi from '../../../api/socialApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';

const PostDetailModal = ({ postId, isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const notification = useNotification();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    useEffect(() => {
        if (isOpen && postId) {
            setCurrentMediaIndex(0);
            fetchPostDetails();
        }
    }, [isOpen, postId]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            const response = await socialApi.getPostDetail(postId);
            if (response.success) {
                setPost(response.data);
                setIsLiked(response.data.is_liked > 0);

                // Fetch comments
                const commRes = await socialApi.getComments(postId);
                if (commRes.success) {
                    setComments(commRes.data);
                }
            }
        } catch (error) {
            notification.error("Không thể tải chi tiết bài viết");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!post) return;
        try {
            const response = await socialApi.toggleLike(post.id);
            if (response.success) {
                setPost(prev => ({ ...prev, likes_count: response.data.likes_count }));
                setIsLiked(response.data.liked);
            }
        } catch (error) {
            notification.error("Lỗi khi like");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await socialApi.addComment(post.id, newComment);
            if (response.success) {
                setComments(prev => [response.data, ...prev]);
                setPost(prev => ({ ...prev, comments_count: prev.comments_count + 1 }));
                setNewComment('');
                notification.success("Đã đăng bình luận");
            }
        } catch (error) {
            notification.error("Lỗi khi gửi bình luận");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : post ? (
                    <>
                        {/* Media Section (Left) - Chỉ hiện khi có ảnh */}
                        {post.media && post.media.length > 0 && (
                            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
                                <img
                                    src={post.media[currentMediaIndex].url}
                                    alt={`Ảnh ${currentMediaIndex + 1}`}
                                    className="max-w-full max-h-full object-contain transition-opacity duration-200"
                                />

                                {/* Nút chuyển ảnh - chỉ hiện khi có nhiều hơn 1 ảnh */}
                                {post.media.length > 1 && (
                                    <>
                                        {/* Nút Trước */}
                                        <button
                                            onClick={() => setCurrentMediaIndex(i => Math.max(0, i - 1))}
                                            disabled={currentMediaIndex === 0}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={22} />
                                        </button>

                                        {/* Nút Tiếp theo */}
                                        <button
                                            onClick={() => setCurrentMediaIndex(i => Math.min(post.media.length - 1, i + 1))}
                                            disabled={currentMediaIndex === post.media.length - 1}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={22} />
                                        </button>

                                        {/* Chỉ số ảnh & Dots */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                                            <div className="flex gap-1.5">
                                                {post.media.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentMediaIndex(i)}
                                                        className={`rounded-full transition-all ${
                                                            i === currentMediaIndex
                                                                ? 'w-5 h-2 bg-white'
                                                                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-white/70 text-xs font-medium bg-black/30 px-2 py-0.5 rounded-full">
                                                {currentMediaIndex + 1} / {post.media.length}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Content Section - Chiếm toàn bộ nếu không có ảnh */}
                        <div className={`${post.media && post.media.length > 0 ? 'w-full md:w-[400px]' : 'w-full'} flex flex-col bg-white border-l border-gray-100`}>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar src={post.author?.avatar_url} alt={post.author?.display_name} size="sm" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[14px]">{post.author?.display_name}</span>
                                        <span className="text-[12px] text-gray-500">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi })}
                                        </span>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-black"><MoreHorizontal size={20} /></button>
                            </div>

                            {/* Post Content & Comments */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
                                <div className="pb-4 border-b border-gray-50">
                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {post.tags.map(tag => (
                                                <span key={tag.id} className="text-sky-600 font-medium hover:underline cursor-pointer text-sm">
                                                    #{tag.display_name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Comments List */}
                                <div className="space-y-4">
                                    {comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar src={comment.author?.avatar_url} alt={comment.author?.display_name} size="xs" />
                                                <div className="flex-1 flex flex-col">
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <span className="font-bold text-[13px] block mb-0.5">{comment.author?.display_name}</span>
                                                        <p className="text-[14px] text-gray-800">{comment.content}</p>
                                                    </div>
                                                    <span className="text-[11px] text-gray-400 mt-1 ml-1">
                                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-400 italic text-sm">Chưa có bình luận nào</div>
                                    )}
                                </div>
                            </div>

                            {/* Actions & Input */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex items-center gap-4 mb-3">
                                    <button onClick={handleLike} className={`${isLiked ? 'text-red-500' : 'text-black'}`}>
                                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                                    </button>
                                    <MessageCircle size={24} />
                                    <Send size={24} />
                                </div>
                                <div className="text-[14px] font-bold mb-3">{post.likes_count} lượt thích</div>

                                <form onSubmit={handleComment} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Thêm bình luận..."
                                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[14px] outline-none focus:ring-1 focus:ring-gray-300"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className="text-sky-500 font-bold text-[14px] disabled:opacity-50"
                                    >
                                        Đăng
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default PostDetailModal;
