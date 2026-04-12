import React, { useState } from 'react';
import { Clock, MapPin, Star, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const PopularActivities = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeLocation, setActiveLocation] = useState('Tất cả');

    const locations = ['Tất cả', 'Đà Nẵng', 'Quy Nhơn', 'Huế', 'Phú Quốc', 'Nha Trang'];

    const allTours = [
        { id: 1, name: "Tham quan Bà Nà Hills & Cầu Vàng", location: "Đà Nẵng", duration: "1 ngày", rating: 4.9, price: "1.200.000đ", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 15 người", tag: "Best Seller" },
        { id: 2, name: "Tour Kỳ Co - Eo Gió trọn gói", location: "Quy Nhơn", duration: "1 ngày", rating: 4.8, price: "890.000đ", image: "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 20 người", tag: "Mới" },
        { id: 3, name: "Khám phá Đại Nội & Lăng Tự Đức", location: "Huế", duration: "Nửa ngày", rating: 4.7, price: "650.000đ", image: "https://images.unsplash.com/photo-1580974852861-c381510bc98a?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 12 người", tag: "Di sản" },
        { id: 4, name: "Lặn ngắm san hô Hòn Mun", location: "Nha Trang", duration: "Nửa ngày", rating: 4.9, price: "980.000đ", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 8 người", tag: "Phiêu lưu" },
        { id: 5, name: "Tour 4 đảo Phú Quốc", location: "Phú Quốc", duration: "1 ngày", rating: 4.8, price: "1.500.000đ", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 20 người", tag: "Nổi bật" },
        { id: 6, name: "Đạp xe phố cổ Hội An", location: "Đà Nẵng", duration: "3 giờ", rating: 4.6, price: "350.000đ", image: "https://images.unsplash.com/photo-1555432329-1983e979f829?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 10 người", tag: "Văn hoá" },
        { id: 7, name: "Chèo SUP sông Hương", location: "Huế", duration: "2 giờ", rating: 4.5, price: "420.000đ", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 6 người", tag: "Trải nghiệm" },
        { id: 8, name: "Trekking Sơn Trà bình minh", location: "Đà Nẵng", duration: "4 giờ", rating: 4.7, price: "550.000đ", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop", groupSize: "Tối đa 12 người", tag: "Thiên nhiên" },
    ];

    const filteredTours = activeLocation === 'Tất cả' ? allTours : allTours.filter(t => t.location === activeLocation);

    const nextSlide = () => setCurrentIndex(prev => prev < filteredTours.length - 4 ? prev + 1 : 0);
    const prevSlide = () => setCurrentIndex(prev => prev > 0 ? prev - 1 : Math.max(0, filteredTours.length - 4));

    const handleFilter = (loc) => {
        setActiveLocation(loc);
        setCurrentIndex(0);
    };

    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <p className="text-sky-500 font-bold text-xs uppercase tracking-widest mb-2">Tour & Hoạt động</p>
                        <h2 className="text-3xl font-black text-slate-900">Các hoạt động hấp dẫn</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={prevSlide} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all text-gray-400">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextSlide} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all text-gray-400">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Location filter tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {locations.map(loc => (
                        <button
                            key={loc}
                            onClick={() => handleFilter(loc)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeLocation === loc
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-sky-300 hover:text-sky-500'
                                }`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>

                {/* Slider */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out gap-6"
                        style={{ transform: `translateX(-${currentIndex * 26.5}%)` }}
                    >
                        {filteredTours.map(tour => (
                            <div key={tour.id} className="min-w-[calc(25%-18px)] bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={tour.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={tour.name} />
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-sky-600 rounded-md">{tour.tag}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">{tour.name}</h3>
                                    <div className="flex items-center text-gray-400 text-[11px] mb-1">
                                        <MapPin size={12} className="mr-1 text-sky-400" /> {tour.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-4">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {tour.duration}</span>
                                        <span className="flex items-center gap-1"><Users size={12} /> {tour.groupSize}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        <div>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Giá từ</p>
                                            <p className="font-bold text-sky-600 text-base">{tour.price}<span className="text-[10px] font-normal text-gray-400">/người</span></p>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                            <Star size={12} fill="currentColor" /> {tour.rating}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PopularActivities;
