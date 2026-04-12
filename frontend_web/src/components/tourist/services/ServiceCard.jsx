import React from 'react';
import { Star, MapPin, Clock, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service, className = '' }) => {
    const {
        id,
        name,
        type,
        location,
        price,
        originalPrice,
        rating,
        reviewCount,
        duration,
        maxGuests,
        images,
        highlights = [],
        provider,
        images_count,
        soldCount,
    } = service;

    const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;
    const mainImage = images?.[0] || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800';
    const typeLabel = type === 'tour' ? 'Tour' : 'Lưu trú';
    const typeColor = type === 'tour' ? 'bg-amber-500' : 'bg-sky-600';

    const formatPrice = (p) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p);

    return (
        <Link
            to={`/service/${id}`}
            className={`group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${className}`}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={mainImage}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Discount badge */}
                {discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        -{discount}%
                    </span>
                )}

                {/* Type badge */}
                <span className={`absolute top-3 right-3 ${typeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {typeLabel}
                </span>

                {/* Favorite */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all cursor-pointer"
                >
                    <Heart size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>

                {/* Sold count */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span>Đã bán {soldCount || 0}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Location */}
                <div className="flex items-center gap-1 text-sky-600 text-xs font-semibold mb-2">
                    <MapPin size={12} />
                    <span>{location}</span>
                </div>

                {/* Name */}
                <h3 className="text-slate-900 font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors">
                    {name}
                </h3>

                {/* Provider */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {provider?.name?.[0] || 'P'}
                    </div>
                    <span className="text-xs text-gray-500">{provider?.name}</span>
                    {provider?.verified && (
                        <svg className="w-3.5 h-3.5 text-sky-500" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                    )}
                </div>

                {/* Highlights */}
                {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {highlights.slice(0, 3).map((h, i) => (
                            <span key={i} className="text-[11px] text-slate-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                {h}
                            </span>
                        ))}
                        {highlights.length > 3 && (
                            <span className="text-[11px] text-slate-400">+{highlights.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Info row */}
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {duration}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={12} />
                        Tối đa {maxGuests}
                    </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-700">{rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">({reviewCount} đánh giá)</span>
                </div>

                {/* Price */}
                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                    <div>
                        <span className="text-lg font-black text-sky-700">{formatPrice(price)}</span>
                        {type === 'accommodation' && (
                            <span className="text-xs text-gray-400"> / đêm</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">/{images_count} ảnh</span>
                    </div>
                </div>

                {originalPrice && (
                    <div className="text-xs text-gray-400 line-through mt-0.5">
                        {formatPrice(originalPrice)}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ServiceCard;