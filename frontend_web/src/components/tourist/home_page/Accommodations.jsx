import React, { useState } from 'react';
import { Star, MapPin, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { COLORS } from '../../../utils/colors';

const Accommodations = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeLocation, setActiveLocation] = useState('Tất cả');

    const locations = ['Tất cả', 'Đà Nẵng', 'Hội An', 'Phú Quốc', 'Nha Trang', 'Đà Lạt', 'Sa Pa'];

    const allStays = [
        { id: 1, name: "InterContinental Sun Peninsula", location: "Đà Nẵng", rating: 4.9, price: "8.500.000đ", type: "Resort", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop" },
        { id: 2, name: "La Siesta Hoi An Resort", location: "Hội An", rating: 4.8, price: "3.200.000đ", type: "Boutique", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop" },
        { id: 3, name: "Topas Ecolodge", location: "Sa Pa", rating: 4.7, price: "5.100.000đ", type: "Ecolodge", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop" },
        { id: 4, name: "Ana Villas Dalat", location: "Đà Lạt", rating: 4.8, price: "2.800.000đ", type: "Villa", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop" },
        { id: 5, name: "Pullman Vung Tau", location: "Đà Nẵng", rating: 4.6, price: "2.500.000đ", type: "Hotel", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop" },
        { id: 6, name: "JW Marriott Phu Quoc", location: "Phú Quốc", rating: 4.9, price: "9.200.000đ", type: "Resort", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop" },
        { id: 7, name: "Six Senses Ninh Van Bay", location: "Nha Trang", rating: 5.0, price: "12.000.000đ", type: "Luxury", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop" },
        { id: 8, name: "The Reverie Saigon", location: "Đà Nẵng", rating: 4.9, price: "6.800.000đ", type: "Hotel", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop" },
    ];

    const filteredStays = activeLocation === 'Tất cả' ? allStays : allStays.filter(s => s.location === activeLocation);

    const nextSlide = () => {
        setCurrentIndex(prev => prev < filteredStays.length - 4 ? prev + 1 : 0);
    };
    const prevSlide = () => {
        setCurrentIndex(prev => prev > 0 ? prev - 1 : Math.max(0, filteredStays.length - 4));
    };

    // Reset index on filter change
    const handleFilterChange = (loc) => {
        setActiveLocation(loc);
        setCurrentIndex(0);
    };

    return (
        <section className="py-8 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <p className="text-sky-500 font-bold text-xs uppercase tracking-widest mb-2">Lưu trú</p>
                        <h2 className="text-3xl font-black text-slate-900">Chỗ nghỉ hàng đầu</h2>
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
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {locations.map(loc => (
                        <button
                            key={loc}
                            onClick={() => handleFilterChange(loc)}
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
                        {filteredStays.map(stay => (
                            <div key={stay.id} className="min-w-[calc(25%-18px)] bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="relative h-52 overflow-hidden">
                                    <img src={stay.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stay.name} />
                                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
                                        <Heart size={16} />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-bold rounded-md uppercase tracking-wider">{stay.type}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                            <Star size={12} fill="currentColor" /> {stay.rating}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-1 group-hover:text-sky-600 transition-colors">{stay.name}</h3>
                                    <div className="flex items-center text-gray-400 text-[11px] mb-4">
                                        <MapPin size={12} className="mr-1 text-sky-400" /> {stay.location}
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        <div>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Giá từ</p>
                                            <p className="font-bold text-sky-600 text-base">{stay.price}<span className="text-[10px] font-normal text-gray-400">/đêm</span></p>
                                        </div>
                                        <button className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-[10px] font-bold hover:bg-sky-600 transition-colors">
                                            Đặt ngay
                                        </button>
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

export default Accommodations;
