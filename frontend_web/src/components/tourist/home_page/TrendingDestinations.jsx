import React from 'react';
import dnBg from '../../../assets/images/dn_bg.jpg';
import quynhonBg from '../../../assets/images/quynhon_bg.jpg';
import hueBg from '../../../assets/images/hue_bg.jpg';

const TrendingDestinations = () => {
    const destinations = [
        {
            name: "Đà Nẵng",
            image: dnBg,
            info: "Thành phố đáng sống nhất Việt Nam với bãi biển Mỹ Khê, cầu Vàng và ẩm thực đa dạng.",
            tag: "Biển & Phố"
        },
        {
            name: "Quy Nhơn",
            image: quynhonBg,
            info: "Viên ngọc ẩn giấu với Eo Gió, Kỳ Co và những bãi biển hoang sơ tuyệt đẹp.",
            tag: "Thiên nhiên"
        },
        {
            name: "Huế",
            image: hueBg,
            info: "Cố đô ngàn năm với Đại Nội, lăng tẩm triều Nguyễn và nét đẹp văn hóa trầm mặc.",
            tag: "Di sản"
        }
    ];

    return (
        <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-10">
                    <p className="text-sky-500 font-bold text-xs uppercase tracking-widest mb-2">Khám phá</p>
                    <h2 className="text-3xl font-black text-slate-900">Điểm đến thịnh hành</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[420px]">
                    {destinations.map((dest, i) => (
                        <div key={i} className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg">
                            <img src={dest.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={dest.name} />

                            {/* Default: show name only */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-2">{dest.tag}</span>
                                <h3 className="text-white text-2xl font-black">{dest.name}</h3>
                            </div>

                            {/* Hover: show info overlay - transparent */}
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[8px] flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <h3 className="text-white text-2xl font-black mb-3">{dest.name}</h3>
                                <p className="text-white/90 text-sm leading-relaxed mb-4">{dest.info}</p>
                                <button className="self-start px-5 py-2 bg-white/90 text-slate-900 rounded-xl text-xs font-bold hover:bg-white transition-all">
                                    Xem chi tiết →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrendingDestinations;
