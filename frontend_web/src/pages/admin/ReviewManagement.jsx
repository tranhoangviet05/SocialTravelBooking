import React, { useState, useEffect } from 'react';
import {
    Search,
    Star,
    MessageSquare,
    Send,
    Filter,
    Calendar,
    User,
    ExternalLink,
    CheckCircle2,
    X,
    Loader2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    RotateCw
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import TableSkeleton from '../../components/common/TableSkeleton';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';

const ReviewManagement = () => {
    const { reviews, meta, loadingStates, fetchReviews, updateReview, removeReview } = useAdminData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [filterReplied, setFilterReplied] = useState('');
    const [replyModal, setReplyModal] = useState({ isOpen: false, review: null });
    const [replyText, setReplyText] = useState('');
    const [backgroundTasks, setBackgroundTasks] = useState({});
    const [submitting, setSubmitting] = useState(false);
    
    const activeMeta = meta.reviews || { current_page: 1, last_page: 1, total: 0 };
    const toast = useNotification();

    useEffect(() => {
        if (!searchTerm && !filterRating && !filterReplied && reviews.length > 0) return;
        fetchReviews(false, 1, { search: searchTerm, rating: filterRating, replied: filterReplied });
    }, [fetchReviews, filterRating, filterReplied, reviews.length]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchReviews(true, 1, { search: searchTerm, rating: filterRating, replied: filterReplied });
    };

    const handleOpenReply = (review) => {
        setReplyModal({ isOpen: true, review });
        setReplyText(review.provider_reply || '');
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        const targetId = replyModal.review.id;
        setSubmitting(true);
        try {
            const response = await adminApi.replyToReview(targetId, replyText);
            if (response.success) {
                toast?.success?.('Gửi phản hồi thành công');
                updateReview({ ...response.data, isOptimistic: false });
                setReplyModal({ isOpen: false, review: null });
                setReplyText('');
            }
        } catch (error) {
            console.error('Reply review error:', error);
            toast?.error?.('Không thể gửi phản hồi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        
        setBackgroundTasks(prev => ({ ...prev, [id]: 'deleting' }));
        const originalReview = reviews.find(r => r.id === id);
        
        // Cập nhật lạc quan
        removeReview(id);

        try {
            const response = await adminApi.deleteReview(id);
            if (response.success) {
                toast?.success?.('Đã xóa đánh giá');
            }
        } catch (error) {
            console.error('Delete review error:', error);
            toast?.error?.('Không thể xóa đánh giá');
            // Rollback
            fetchReviews(true, activeMeta.current_page);
        } finally {
            setBackgroundTasks(prev => {
                const newTasks = { ...prev };
                delete newTasks[id];
                return newTasks;
            });
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={12}
                        className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đánh giá</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi phản hồi từ khách hàng và điều phối nội dung.</p>
                </div>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm nội dung, tên khách hàng..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                    >
                        <option value="">Tất cả điểm</option>
                        <option value="5">5 Sao</option>
                        <option value="4">4 Sao</option>
                        <option value="3">3 Sao</option>
                        <option value="2">2 Sao</option>
                        <option value="1">1 Sao</option>
                    </select>
                    <select
                        value={filterReplied}
                        onChange={(e) => setFilterReplied(e.target.value)}
                        className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                    >
                        <option value="">Trạng thái</option>
                        <option value="false">Chưa phản hồi</option>
                        <option value="true">Đã phản hồi</option>
                    </select>
                    <button type="button" onClick={() => fetchReviews(true, activeMeta.current_page)}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                </div>
            </form>

            {loadingStates.reviews ? (
                <TableSkeleton columns={6} rows={8} />
            ) : (
                <>
                    <AdminTable
                        headers={['Dịch vụ', 'Khách hàng', 'Đánh giá', 'Nội dung', 'Trạng thái', '']}
                        title="Tất cả đánh giá"
                        description={`Tổng cộng ${activeMeta.total} đánh giá.`}
                    >
                        {reviews.length > 0 ? reviews.map((rv) => {
                            const isDeleting = backgroundTasks[rv.id] === 'deleting';
                            return (
                                <tr key={rv.id} className={`hover:bg-gray-50/50 transition-colors group relative ${isDeleting ? 'optimistic-updating' : ''}`}>
                                    <td className="px-8 py-5">
                                        {isDeleting ? (
                                            <div className="optimistic-adding-text text-[10px] font-bold uppercase text-rose-500">Đang xóa...</div>
                                        ) : (
                                            <div className="max-w-[180px]">
                                                <p className="text-sm font-black text-slate-900 truncate">{rv.service?.name || 'N/A'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 truncate">#{rv.service?.id?.split('-')[0]}</p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {rv.user?.avatar_url ? (
                                                <img src={rv.user.avatar_url} className="w-8 h-8 rounded-full border border-gray-100 object-cover" alt="" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                    {rv.user?.display_name?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{rv.user?.display_name || 'Khách'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold truncate max-w-[120px]">{rv.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {renderStars(rv.rating)}
                                        <span className="text-[10px] font-bold text-gray-400 mt-1 block tracking-tighter uppercase">{formatDate(rv.created_at)}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm text-slate-600 font-medium max-w-[250px] line-clamp-2 italic">"{rv.content}"</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        {rv.provider_reply ? (
                                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">Đã trả lời</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                                                <MessageCircle size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Chưa phản hồi</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenReply(rv)}
                                                className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                                title="Trả lời"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rv.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                    Không có dữ liệu đánh giá
                                </td>
                            </tr>
                        )}
                    </AdminTable>

                    {activeMeta.last_page > 1 && (
                        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100 mt-4 shadow-sm">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
                                Trang {activeMeta.current_page} / {activeMeta.last_page} ({activeMeta.total} đánh giá)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchReviews(true, activeMeta.current_page - 1)}
                                    disabled={activeMeta.current_page <= 1}
                                    className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => fetchReviews(true, activeMeta.current_page + 1)}
                                    disabled={activeMeta.current_page >= activeMeta.last_page}
                                    className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {replyModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Phản hồi khách hàng</h3>
                                <button onClick={() => setReplyModal({ isOpen: false, review: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">{replyModal.review?.user?.display_name}</span>
                                    </div>
                                    {renderStars(replyModal.review?.rating)}
                                </div>
                                <p className="text-sm text-slate-600 font-medium italic leading-relaxed">"{replyModal.review?.content}"</p>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nội dung phản hồi</label>
                                <textarea
                                    className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all font-medium resize-none shadow-inner"
                                    placeholder="Gửi lời cảm ơn hoặc giải đáp thắc mắc..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setReplyModal({ isOpen: false, review: null })}
                                    className="flex-1 py-4 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSendReply}
                                    disabled={submitting || !replyText.trim()}
                                    className="flex-[2] py-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {replyModal.review?.provider_reply ? 'Cập nhật' : 'Gửi ngay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ReviewManagement;
