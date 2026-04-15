import React, { useState, useEffect } from 'react';
import {
    Star, MessageSquare, Send, Loader2, User, Clock, Package
} from 'lucide-react';
import ProviderLayout from '../../components/provider/ProviderLayout';
import providerApi from '../../api/providerApi';

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await providerApi.getReviews();
            if (res.success) setReviews(res.data);
        } catch (err) {
            console.error('Fetch reviews error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim() || sending) return;
        setSending(true);
        try {
            const res = await providerApi.replyReview(reviewId, replyText.trim());
            if (res.success) {
                alert('Đã gửi phản hồi thành công!');
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, provider_reply: replyText.trim(), provider_reply_at: new Date().toISOString() } : r
                ));
                setReplyingId(null);
                setReplyText('');
            }
        } catch (err) {
            alert('Lỗi khi gửi phản hồi');
        } finally {
            setSending(false);
        }
    };

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
            ))}
        </div>
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <ProviderLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đánh giá của khách hàng</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Xem và phản hồi các đánh giá từ khách hàng đã sử dụng dịch vụ.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải đánh giá...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <MessageSquare size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">Chưa có đánh giá nào</p>
                        <p className="text-slate-300 text-sm mt-1">Đánh giá sẽ xuất hiện khi khách hàng hoàn thành dịch vụ.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">
                                            {(review.user?.display_name || 'K')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{review.user?.display_name || 'Khách hàng'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {renderStars(review.rating)}
                                                <span className="text-[10px] text-slate-400 font-bold">{formatDate(review.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 flex items-center gap-1">
                                        <Package size={10} /> {review.service?.name || 'Dịch vụ'}
                                    </span>
                                </div>

                                {/* Content */}
                                <p className="text-sm text-slate-600 leading-relaxed mb-4 pl-[52px]">{review.content || '(Không có nội dung)'}</p>

                                {/* Provider Reply */}
                                {review.provider_reply ? (
                                    <div className="ml-[52px] bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Phản hồi của bạn</span>
                                            <span className="text-[10px] text-emerald-400">{formatDate(review.provider_reply_at)}</span>
                                        </div>
                                        <p className="text-sm text-emerald-800">{review.provider_reply}</p>
                                    </div>
                                ) : replyingId === review.id ? (
                                    <div className="ml-[52px] flex gap-2">
                                        <input
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Nhập phản hồi của bạn..."
                                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            onKeyDown={e => e.key === 'Enter' && handleReply(review.id)}
                                        />
                                        <button disabled={sending} onClick={() => handleReply(review.id)}
                                            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-1.5">
                                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            Gửi
                                        </button>
                                        <button onClick={() => { setReplyingId(null); setReplyText(''); }}
                                            className="px-3 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                                            Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setReplyingId(review.id); setReplyText(''); }}
                                        className="ml-[52px] flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                        <MessageSquare size={14} /> Phản hồi đánh giá
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
};

export default MyReviews;
