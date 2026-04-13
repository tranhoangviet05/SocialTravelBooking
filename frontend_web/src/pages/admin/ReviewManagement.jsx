import React, { useState } from 'react';
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
    X
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminLayout from '../../components/admin/AdminLayout';

const ReviewManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [replyModal, setReplyModal] = useState({ isOpen: false, review: null });
    const [replyText, setReplyText] = useState('');

    // Mock data with Service IDs and Provider Replies
    const [reviews, setReviews] = useState([
        { 
            id: 'rv-001', 
            serviceId: 's1', 
            serviceName: 'InterContinental Danang', 
            user: 'Minh Hoàng', 
            rating: 5, 
            content: 'Dịch vụ tuyệt vời, phòng ốc sạch sẽ và sang trọng. View biển cực đẹp!', 
            createdAt: '2024-04-12',
            adminReply: 'Cảm ơn bạn đã ủng hộ chúng tôi!',
            replyAt: '2024-04-12 15:30'
        },
        { 
            id: 'rv-002', 
            serviceId: 's2', 
            serviceName: 'Tour Khám phá Sơn Đoòng', 
            user: 'Anh Tuấn', 
            rating: 4, 
            content: 'Hướng dẫn viên rất nhiệt tình. Tuy nhiên lịch trình hơi dày đặc.', 
            createdAt: '2024-04-11',
            adminReply: null,
            replyAt: null
        },
        { 
            id: 'rv-003', 
            serviceId: 's1', 
            serviceName: 'InterContinental Danang', 
            user: 'Lan Anh', 
            rating: 3, 
            content: 'Giá hơi cao so với chất lượng dịch vụ lần này.', 
            createdAt: '2024-04-10',
            adminReply: null,
            replyAt: null
        }
    ]);

    const handleOpenReply = (review) => {
        setReplyModal({ isOpen: true, review });
        setReplyText(review.adminReply || '');
    };

    const handleSendReply = () => {
        if (!replyText.trim()) return;

        // Mock update state realtime
        setReviews(prev => prev.map(rv => 
            rv.id === replyModal.review.id 
            ? { ...rv, adminReply: replyText, replyAt: new Date().toLocaleString() } 
            : rv
        ));

        setReplyModal({ isOpen: false, review: null });
        setReplyText('');
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đánh giá</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi phản hồi từ khách hàng và trả lời đánh giá.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên khách, nội dung, mã dịch vụ..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all">
                            <Filter size={18} /> Điểm số
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all">
                            <Calendar size={18} /> Thời gian
                        </button>
                    </div>
                </div>

                <AdminTable 
                    headers={['Khách hàng', 'Dịch vụ', 'Đánh giá', 'Nội dung', 'Phản hồi', '']}
                    title="Tất cả đánh giá"
                    description={`Hiển thị ${reviews.length} đánh giá gần đây.`}
                >
                    {reviews.map((rv) => (
                        <tr key={rv.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User size={16} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{rv.user}</p>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className="max-w-[150px]">
                                    <p className="text-xs font-black text-indigo-600 truncate">{rv.serviceName}</p>
                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-0.5">ID: {rv.serviceId}</p>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                {renderStars(rv.rating)}
                                <span className="text-[10px] font-bold text-gray-400 mt-1 block">{rv.createdAt}</span>
                            </td>
                            <td className="px-8 py-5">
                                <p className="text-sm text-slate-600 font-medium max-w-[250px] line-clamp-2">{rv.content}</p>
                            </td>
                            <td className="px-8 py-5">
                                {rv.adminReply ? (
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                                        <CheckCircle2 size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-tight">Đã trả lời</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                                        <MessageSquare size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Chưa phản hồi</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-8 py-5 text-right">
                                <button 
                                    onClick={() => handleOpenReply(rv)}
                                    className="text-xs font-black text-sky-500 hover:text-sky-600 uppercase tracking-widest bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-all"
                                >
                                    {rv.adminReply ? 'Sửa' : 'Trả lời'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>

                {/* Reply Modal */}
                {replyModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReplyModal({ isOpen: false, review: null })} />
                        <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-slate-900">Phản hồi khách hàng</h3>
                                    <button onClick={() => setReplyModal({ isOpen: false, review: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black text-indigo-600 uppercase">{replyModal.review.user}</span>
                                        {renderStars(replyModal.review.rating)}
                                    </div>
                                    <p className="text-sm text-slate-600 italic">"{replyModal.review.content}"</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">Nội dung phản hồi</label>
                                    <textarea 
                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all font-medium resize-none"
                                        placeholder="Gửi lời cảm ơn hoặc giải đáp thắc mắc..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button 
                                        onClick={() => setReplyModal({ isOpen: false, review: null })}
                                        className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={handleSendReply}
                                        className="flex-[2] py-4 bg-sky-500 hover:bg-sky-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-sky-500/20 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} />
                                        Gửi phản hồi
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
        </AdminLayout>
    );
};

export default ReviewManagement;
