import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from '../services/ServiceCard';

const PopularActivities = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeLocation, setActiveLocation] = useState('Tất cả');

    const locations = ['Tất cả', 'Đà Nẵng', 'Quy Nhơn', 'Huế', 'Phú Quốc', 'Nha Trang'];

    const allTours = [
        { id: 'tour-1', name: "Tham quan Bà Nà Hills & Cầu Vàng", location: "Đà Nẵng", duration: "1 ngày", maxGuests: 15, rating: 4.9, reviewCount: 1250, price: 1200000, type: "tour", highlights: ["Bà Nà Hills", "Cáp treo"], images: ["https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Sun World', verified: true }, images_count: 12, soldCount: 3450 },
        { id: 'tour-2', name: "Tour Kỳ Co - Eo Gió trọn gói", location: "Quy Nhơn", duration: "1 ngày", maxGuests: 20, rating: 4.8, reviewCount: 890, price: 890000, type: "tour", highlights: ["Kỳ Co", "Lặn biển"], images: ["https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Quy Nhơn Tourist', verified: true }, images_count: 8, soldCount: 2100 },
        { id: 'tour-3', name: "Khám phá Đại Nội & Lăng Tự Đức", location: "Huế", duration: "Nửa ngày", maxGuests: 12, rating: 4.7, reviewCount: 450, price: 650000, type: "tour", highlights: ["Văn hoá", "Di sản"], images: ["https://images.unsplash.com/photo-1580974852861-c381510bc98a?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Hue Heritage', verified: true }, images_count: 5, soldCount: 890 },
        { id: 'tour-4', name: "Lặn ngắm san hô Hòn Mun", location: "Nha Trang", duration: "Nửa ngày", maxGuests: 8, rating: 4.9, reviewCount: 670, price: 980000, type: "tour", highlights: ["Lặn san hô", "Cano"], images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Nha Trang Diving', verified: true }, images_count: 10, soldCount: 1540 },
        { id: 'tour-5', name: "Tour 4 đảo Phú Quốc", location: "Phú Quốc", duration: "1 ngày", maxGuests: 20, rating: 4.8, reviewCount: 1100, price: 1500000, type: "tour", highlights: ["4 đảo", "Cáp treo"], images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Phu Quoc Travel', verified: true }, images_count: 15, soldCount: 2800 },
        { id: 'tour-6', name: "Đạp xe phố cổ Hội An", location: "Đà Nẵng", duration: "3 giờ", maxGuests: 10, rating: 4.6, reviewCount: 230, price: 350000, type: "tour", highlights: ["Xe đạp", "Phố cổ"], images: ["https://images.unsplash.com/photo-1555432329-1983e979f829?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Hoi An Bikes', verified: false }, images_count: 4, soldCount: 450 },
        { id: 'tour-7', name: "Chèo SUP sông Hương", location: "Huế", duration: "2 giờ", maxGuests: 6, rating: 4.5, reviewCount: 120, price: 420000, type: "tour", highlights: ["SUP", "Thể thao"], images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Hue SUP', verified: true }, images_count: 6, soldCount: 300 },
        { id: 'tour-8', name: "Trekking Sơn Trà bình minh", location: "Đà Nẵng", duration: "4 giờ", maxGuests: 12, rating: 4.7, reviewCount: 340, price: 550000, type: "tour", highlights: ["Trekking", "Bình minh"], images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop"], provider: { name: 'Da Nang Trek', verified: true }, images_count: 8, soldCount: 560 },
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
                            <ServiceCard 
                                key={tour.id} 
                                service={tour} 
                                className="min-w-[calc(25%-18px)]"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PopularActivities;
