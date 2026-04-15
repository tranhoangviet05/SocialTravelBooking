import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from '../services/ServiceCard';

const Accommodations = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeLocation, setActiveLocation] = useState('Tất cả');

    const locations = ['Tất cả', 'Đà Nẵng', 'Hội An', 'Phú Quốc', 'Nha Trang', 'Đà Lạt', 'Sa Pa'];

    const allStays = [
        { id: 'acc-1', name: "InterContinental Sun Peninsula", location: "Đà Nẵng", rating: 4.9, reviewCount: 452, price: 8500000, type: "accommodation", highlights: ["Resort", "Ocean View"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 2, provider: { name: "Social Travel", verified: true }, images_count: 8, soldCount: 320 },
        { id: 'acc-2', name: "La Siesta Hoi An Resort", location: "Hội An", rating: 4.8, reviewCount: 310, price: 3200000, type: "accommodation", highlights: ["Boutique", "Historic"], images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 2, provider: { name: "La Siesta Group", verified: true }, images_count: 5, soldCount: 150 },
        { id: 'acc-3', name: "Topas Ecolodge", location: "Sa Pa", rating: 4.7, reviewCount: 215, price: 5100000, type: "accommodation", highlights: ["Ecolodge", "Mountains"], images: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 2, provider: { name: "Topas Group", verified: true }, images_count: 6, soldCount: 98 },
        { id: 'acc-4', name: "Ana Villas Dalat", location: "Đà Lạt", rating: 4.8, reviewCount: 189, price: 2800000, type: "accommodation", highlights: ["Villa", "Vintage"], images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 4, provider: { name: "Ana Mandara", verified: false }, images_count: 7, soldCount: 210 },
        { id: 'acc-5', name: "Pullman Vung Tau", location: "Đà Nẵng", rating: 4.6, reviewCount: 520, price: 2500000, type: "accommodation", highlights: ["Hotel", "Modern"], images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 2, provider: { name: "Accor", verified: true }, images_count: 10, soldCount: 550 },
        { id: 'acc-6', name: "JW Marriott Phu Quoc", location: "Phú Quốc", rating: 4.9, reviewCount: 890, price: 9200000, type: "accommodation", highlights: ["Resort", "Luxury"], images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 2, provider: { name: "Marriott", verified: true }, images_count: 12, soldCount: 430 },
        { id: 'acc-7', name: "Six Senses Ninh Van Bay", location: "Nha Trang", rating: 5.0, reviewCount: 154, price: 12000000, type: "accommodation", highlights: ["Luxury", "Private Beach"], images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 2, provider: { name: "Six Senses", verified: true }, images_count: 8, soldCount: 65 },
        { id: 'acc-8', name: "The Reverie Saigon", location: "Đà Nẵng", rating: 4.9, reviewCount: 342, price: 6800000, type: "accommodation", highlights: ["Hotel", "City Center"], images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop"], duration: "1 đêm", maxGuests: 2, provider: { name: "WMC Group", verified: true }, images_count: 9, soldCount: 200 },
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
                            <ServiceCard 
                                key={stay.id} 
                                service={stay} 
                                className="min-w-[calc(25%-18px)]"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Accommodations;
