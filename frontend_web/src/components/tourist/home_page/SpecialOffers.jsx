import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Copy, CheckCircle2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const SpecialOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/general/get/coupons`);
                if (response.data.success) {
                    setOffers(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy mã giảm giá:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollAmount = direction === 'left' ? -container.offsetWidth / 2 : container.offsetWidth / 2;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="py-16 flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-sky-500" size={32} />
            </div>
        );
    }

    if (offers.length === 0) return null;

    return (
        <section className="py-16 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Sub-section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Tag size={16} className="text-indigo-600" />
                            </div>
                            <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">
                                Ưu đãi nổi bật
                            </p>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Mã giảm giá cho bạn
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => scroll('left')}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div 
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                    {offers.map((offer) => (
                        <div 
                            key={offer.id} 
                            className="flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-w-[320px] max-w-[360px] shrink-0 snap-start group hover:shadow-md hover:border-indigo-100 transition-all"
                        >
                            {/* Left Part: Discount */}
                            <div className="bg-indigo-50/50 text-indigo-600 p-6 flex flex-col items-center justify-center w-2/5 border-r border-dashed border-indigo-200 relative group-hover:bg-indigo-50 transition-colors">
                                {/* Cutout top & bottom */}
                                <div className="absolute -top-4 -right-4 w-8 h-8 bg-slate-50 rounded-full border-b border-l border-slate-100"></div>
                                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-slate-50 rounded-full border-t border-l border-slate-100"></div>
                                
                                <span className="text-3xl font-black tracking-tighter">
                                    {offer.type === 'percent' ? `${offer.discount_value}%` : `${offer.discount_value / 1000}K`}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-indigo-500/80">
                                    GIẢM
                                </span>
                            </div>
                            
                            {/* Right Part: Details */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2">
                                        {offer.name || 'Ưu đãi đặt phòng & dịch vụ'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {offer.min_order_amount > 0 ? `Đơn tối thiểu ${new Intl.NumberFormat('vi-VN').format(offer.min_order_amount)}đ` : 'Không yêu cầu đơn tối thiểu'}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg text-sm tracking-wider">
                                        {offer.code}
                                    </span>
                                    <button 
                                        onClick={() => handleCopy(offer.code, offer.id)}
                                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                        title="Sao chép"
                                    >
                                        {copiedId === offer.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default SpecialOffers;

