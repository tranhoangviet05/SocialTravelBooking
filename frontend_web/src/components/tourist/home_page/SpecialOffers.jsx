import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight, Loader2, Tag } from 'lucide-react';
import axios from 'axios';

const SpecialOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/general/get/coupons');
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

    const gradients = [
        "from-sky-500 to-blue-600",
        "from-emerald-500 to-teal-600",
        "from-orange-400 to-rose-500",
        "from-purple-500 to-indigo-600",
        "from-pink-500 to-rose-600",
        "from-amber-400 to-orange-500"
    ];

    if (loading) {
        return (
            <div className="py-12 flex items-center justify-center">
                <Loader2 className="animate-spin text-sky-500" size={32} />
            </div>
        );
    }

    if (offers.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-10 text-center md:text-left">
                    <p className="text-sky-500 font-black text-xs uppercase tracking-[0.2em] mb-2">Ưu đãi độc quyền</p>
                    <h2 className="text-4xl font-black text-slate-900">Mã giảm giá cho bạn</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer, i) => (
                        <div key={offer.id} className={`relative rounded-3xl p-8 bg-gradient-to-br ${gradients[i % gradients.length]} text-white overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
                                        {offer.type === 'percent' ? `Giảm ${offer.discount_value}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(offer.discount_value)}đ`}
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 group-hover:rotate-12 transition-transform">
                                        <Tag size={24} className="fill-white/20" />
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black mb-3 leading-tight">{offer.name || offer.title || "Ưu đãi du lịch"}</h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
                                    {offer.description || `Sử dụng mã ${offer.code} để nhận ưu đãi ngay hôm nay.`}
                                </p>

                                <div className="flex items-center justify-between border-t border-white/20 pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Mã code</span>
                                        <span className="text-xl font-black tracking-widest">{offer.code}</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-xs font-black bg-white text-slate-900 px-5 py-3 rounded-2xl hover:bg-sky-50 transition-colors shadow-lg">
                                        Sao chép <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SpecialOffers;
