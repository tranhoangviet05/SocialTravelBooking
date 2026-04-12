import React from 'react';
import { Zap, Clock, ArrowRight } from 'lucide-react';

const SpecialOffers = () => {
    const offers = [
        {
            title: "Flash Sale mùa hè",
            desc: "Giảm đến 40% cho các resort 5 sao tại Phú Quốc và Nha Trang.",
            badge: "Hot",
            gradient: "from-sky-500 to-blue-600",
            icon: <Zap size={20} />,
            expire: "Còn 3 ngày"
        },
        {
            title: "Đặt sớm giá tốt",
            desc: "Đặt phòng trước 30 ngày, tiết kiệm ngay 25% cho mọi điểm đến.",
            badge: "Tiết kiệm",
            gradient: "from-emerald-500 to-teal-600",
            icon: <Clock size={20} />,
            expire: "Áp dụng đến 30/06"
        },
        {
            title: "Combo du lịch nhóm",
            desc: "Ưu đãi đặc biệt cho nhóm từ 4 người: Phòng + Vé tham quan + Ăn uống.",
            badge: "Nhóm",
            gradient: "from-orange-400 to-rose-500",
            icon: <Zap size={20} />,
            expire: "Giới hạn 50 suất"
        }
    ];

    return (
        <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-10">
                    <p className="text-sky-500 font-bold text-xs uppercase tracking-widest mb-2">Không thể bỏ lỡ</p>
                    <h2 className="text-3xl font-black text-slate-900">Ưu đãi đặc biệt</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {offers.map((offer, i) => (
                        <div key={i} className={`relative rounded-2xl p-6 bg-gradient-to-br ${offer.gradient} text-white overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider">{offer.badge}</span>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">{offer.icon}</div>
                                </div>
                                <h3 className="text-xl font-black mb-2">{offer.title}</h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-4">{offer.desc}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{offer.expire}</span>
                                    <button className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                                        Xem ngay <ArrowRight size={14} />
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
