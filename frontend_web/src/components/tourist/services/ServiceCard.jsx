import React from 'react';
import { Star, MapPin, Clock, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../contexts/WishlistContext';

const ServiceCard = ({ service, className = '' }) => {
    // Mapping backend fields to local variables
    const {
        id,
        name,
        slug,
        type,
        location,
        base_price,
        rating_avg,
        total_bookings,
        duration_days,
        duration_nights,
        max_guests,
        price_unit,
        media = [],
        tags = [],
        provider,
        media_count,
    } = service;

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isFavorited = isInWishlist(id);

    // Format data
    const price = base_price;
    const rating = rating_avg || 0;
    const soldCount = total_bookings || 0;
    const locationName = location?.name || 'Việt Nam';
    const mainImage = media.find(m => m.is_cover)?.url || media[0]?.url || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800';
    
    // Price unit label
    const unitLabel = price_unit === 'per_person' ? 'người' : 'phòng';
    
    // Duration label
    const duration = (type === 'tour' && duration_days)
        ? `${duration_days} ngày ${duration_nights ? duration_nights + ' đêm' : ''}`
        : (type === 'tour' ? 'Trong ngày' : 'Lưu trú');

    const typeLabel = type === 'tour' ? 'Tour' : 'Lưu trú';
    const typeColor = type === 'tour' ? 'bg-amber-500' : 'bg-sky-600';

    const formatPrice = (p) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p);

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFavorited) {
            removeFromWishlist(id);
        } else {
            addToWishlist(service);
        }
    };

    return (
        <Link
            to={`/service/${slug}`}
            className={`group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100/50 ${className}`}
        >
            {/* Image Section */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={mainImage}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Glassmorphism Badge: Type */}
                <div className="absolute top-4 left-4">
                    <span className={`backdrop-blur-md ${type === 'tour' ? 'bg-amber-500/90' : 'bg-sky-600/90'} text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm`}>
                        {typeLabel}
                    </span>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleFavorite}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all ${
                        isFavorited 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-white/80 text-gray-500 hover:text-rose-500'
                    }`}
                >
                    <Heart size={16} className={isFavorited ? 'fill-current' : ''} />
                </button>

                {/* Sold Badge */}
                <div className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Users size={12} />
                    <span>{soldCount} lượt đặt</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Location & Rating */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sky-600 text-[11px] font-bold uppercase tracking-wider">
                        <MapPin size={12} strokeWidth={2.5} />
                        <span>{locationName}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-amber-700">{rating}</span>
                    </div>
                </div>

                {/* Service Name */}
                <h3 className="text-slate-900 font-extrabold text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-sky-700 transition-colors">
                    {name}
                </h3>

                {/* Provider Info */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                        {provider?.business_name?.[0] || 'P'}
                    </div>
                    <span className="text-[12px] text-slate-400 font-medium">{provider?.business_name || 'Hệ thống'}</span>
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 uppercase tracking-tighter">
                                # {t}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer Info Row */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Từ</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[17px] font-black text-sky-700">{formatPrice(price)}</span>
                            {type === 'hotel' || type === 'homestay' ? (
                                <span className="text-[10px] text-slate-400 font-bold">/ đêm / {unitLabel}</span>
                            ) : (
                                <span className="text-[10px] text-slate-400 font-bold">/ {unitLabel}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[11px] font-bold">{duration}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default ServiceCard;