import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Clock, Users, CheckCircle2, Shield, CalendarDays,
    Loader2, BedDouble,
    Sun, Moon, Utensils, WifiHigh, Snowflake,
    Dumbbell, ShoppingBag, Waves,
    Car, Coffee, TreePine, Camera, Plus, Minus, AlertCircle,
    X, ChevronLeft, ChevronRight, Info, MessageSquare, User
} from 'lucide-react';
import Button from '../../components/common/Button';
import ServiceReviews from '../../components/tourist/services/ServiceReviews';
import { MOCK_REVIEWS } from '../../data/mockServices';
import axios from 'axios';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
    isBefore, parseISO, startOfDay
} from 'date-fns';
import { vi } from 'date-fns/locale';

// Amenity icon mapping
const AMENITY_ICONS = {
    'wifi': WifiHigh, 'internet': WifiHigh, 'wifi miễn phí': WifiHigh,
    'pool': Waves, 'hồ bơi': Waves, 'bể bơi': Waves, 'swimming': Waves,
    'parking': Car, 'đỗ xe': Car, 'bãi đỗ': Car,
    'breakfast': Coffee, 'ăn sáng': Coffee, 'buffet': Coffee,
    'ac': Snowflake, 'điều hòa': Snowflake, 'máy lạnh': Snowflake,
    'gym': Dumbbell, 'phòng gym': Dumbbell, 'fitness': Dumbbell,
    'restaurant': Utensils, 'nhà hàng': Utensils, 'ẩm thực': Utensils,
    'beach': TreePine, 'biển': TreePine, 'bãi biển': TreePine,
    'spa': Camera, 'massage': Camera, 'thư giãn': Camera,
    'shop': ShoppingBag, 'mua sắm': ShoppingBag, 'cửa hàng': ShoppingBag,
};

const getAmenityIcon = (text) => {
    const lower = (text || '').toLowerCase();
    for (const [key, Icon] of Object.entries(AMENITY_ICONS)) {
        if (lower.includes(key)) return Icon;
    }
    return CheckCircle2;
};

const Tab = ({ id, label, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            active === id
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
        }`}
    >
        {label}
    </button>
);

const ItineraryItem = ({ item, isLast }) => {
    const activities = item.activities || [];
    const meals = item.meals || [];
    
    return (
        <div className="flex gap-6">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-sky-200 z-10 shrink-0">
                    {item.day_number}
                </div>
                {!isLast && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-sky-200 to-slate-100/50 my-2 min-h-[60px]" />
                )}
            </div>
            <div className="flex-1 pb-10">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-slate-800 text-base">Ngày {item.day_number}: {item.title}</h4>
                    </div>
                    
                    {item.description && (
                        <p className="text-sm text-slate-500 leading-relaxed mb-6 italic">{item.description}</p>
                    )}

                    {/* Activities / Stops */}
                    {activities.length > 0 && (
                        <div className="space-y-4 mb-2">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <MapPin size={12} className="text-sky-500" />
                                Điểm đến & Hoạt động
                            </h5>
                            <div className="space-y-4 ml-1">
                                {activities.map((act, i) => {
                                    let time = null;
                                    let title = act;
                                    let desc = null;

                                    if (typeof act === 'string' && act.includes(':')) {
                                        const parts = act.split(':');
                                        title = parts[0].trim();
                                        desc = parts.slice(1).join(':').trim();
                                    } else if (typeof act === 'object' && act !== null) {
                                        time = act.time;
                                        title = act.title || act.location;
                                        desc = act.description;
                                    }

                                    return (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full border-2 border-sky-400 bg-white group-hover:bg-sky-400 transition-colors mt-1.5" />
                                                {i < activities.length - 1 && <div className="w-px h-full bg-slate-100 my-1" />}
                                            </div>
                                            <div className="flex-1">
                                                {time && <span className="text-[9px] font-black text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">{time}</span>}
                                                <p className="text-sm font-bold text-slate-700 mt-0.5">{title}</p>
                                                {desc && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AmenityBadge = ({ text }) => {
    const Icon = getAmenityIcon(text);
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sky-500"><Icon size={16} /></span>
            <span className="text-sm font-medium text-slate-700">{text}</span>
        </div>
    );
};

const StarRating = ({ rating, size = 14 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={size} className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
        ))}
    </div>
);

const Counter = ({ label, sublabel, value, min = 0, max = 10, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <p className="text-sm font-black text-slate-800">{label}</p>
            {sublabel && <p className="text-[10px] text-slate-400 font-bold uppercase">{sublabel}</p>}
        </div>
        <div className="flex items-center gap-3">
            <button 
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <Minus size={14} />
            </button>
            <span className="w-6 text-center font-black text-slate-800">{value}</span>
            <button 
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <Plus size={14} />
            </button>
        </div>
    </div>
);

const backendBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');

const RoomDetailModal = ({ room, onClose }) => {
    const [activeImg, setActiveImg] = useState(0);
    if (!room) return null;

    const images = room.images && room.images.length > 0 ? room.images : [];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center text-slate-800 hover:bg-white transition-all"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                    {/* Left: Gallery */}
                    <div className="w-full md:w-1/2 bg-slate-100 relative group h-[300px] md:h-[450px] overflow-hidden">
                        {images.length > 0 ? (
                            <>
                                <img 
                                    src={images[activeImg].startsWith('http') ? images[activeImg] : `${backendBaseUrl}/storage/${images[activeImg]}`} 
                                    alt={room.name}
                                    className="w-full h-full object-cover"
                                />
                                {images.length > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setActiveImg((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setActiveImg((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {images.map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`h-1.5 rounded-full transition-all ${i === activeImg ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} 
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Camera size={48} className="opacity-20" />
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">{room.name}</h2>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                                    <Users size={16} className="text-sky-500" />
                                    {room.capacity_adults} người lớn {room.capacity_children > 0 && `, ${room.capacity_children} trẻ em`}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                                    <BedDouble size={16} className="text-sky-500" />
                                    {room.total_rooms} phòng ngủ
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-3">Mô tả chi tiết</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {room.description || "Chưa có mô tả chi tiết cho loại phòng này."}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-3">Tiện nghi phòng</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {(room.amenities || []).length > 0 ? (
                                        room.amenities.map((am, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                                {am}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-slate-400 font-bold">Liên hệ để biết thêm chi tiết</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Giá từ</p>
                                <p className="text-2xl font-black text-slate-800">
                                    {new Intl.NumberFormat('vi-VN').format(room.base_price)}đ
                                    <span className="text-sm font-bold text-slate-400 ml-1">/đêm</span>
                                </p>
                            </div>
                            <Button variant="primary" onClick={onClose} className="rounded-xl px-8">Đóng</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AvailabilityCalendar = ({ selectedDate, onSelect, availabilities, systemHolidays = [], onBlockedClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black text-slate-800 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </h4>
            <div className="flex gap-1">
                <button 
                    type="button" 
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                    <ChevronLeft size={16} />
                </button>
                <button 
                    type="button" 
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(d => (
                    <div key={d} className="text-[10px] font-black text-slate-400 text-center">{d}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        const today = startOfDay(new Date());

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dateStr = format(cloneDay, 'yyyy-MM-dd');
                const availability = availabilities?.find(a => a.available_date === dateStr);
                const slotsLeft = availability ? (availability.total_slots - availability.booked_slots) : 0;
                const isPast = isBefore(cloneDay, today);
                const isCurrentMonth = isSameMonth(cloneDay, monthStart);
                const isSelected = selectedDate === dateStr;

                // Kiểm tra system holiday
                const holiday = systemHolidays.find(h => h.date === dateStr);
                const isHolidayBlocked = holiday?.is_block_booking === true;
                const isHolidayDisplay = holiday && !isHolidayBlocked; // chỉ hiển thị, không chặn

                // Provider block
                const isProviderBlocked = availability?.is_blocked === true;

                const isAvailable = !isHolidayBlocked && !isProviderBlocked
                    && availability && slotsLeft > 0 && !isPast;

                // Tooltip text
                let tooltip = '';
                if (isHolidayBlocked) tooltip = `🚫 ${holiday.name}`;
                else if (isProviderBlocked) tooltip = `🔒 ${availability?.block_reason || 'Nhà cung cấp đóng cửa'}`;

                days.push(
                    <div key={dateStr} className="relative group">
                        <button
                            type="button"
                            onClick={() => {
                                if (!isAvailable) {
                                    if (onBlockedClick) {
                                        if (isHolidayBlocked) onBlockedClick(`Hệ thống đã chặn ngày lễ: ${holiday.name}`);
                                        else if (isProviderBlocked) onBlockedClick(`Nhà cung cấp đã chặn ngày này: ${availability?.block_reason || ''}`);
                                        else if (isPast) onBlockedClick(`Không thể chọn ngày trong quá khứ.`);
                                        else if (slotsLeft <= 0) onBlockedClick(`Ngày ${dateStr} đã hết chỗ.`);
                                    }
                                } else {
                                    onSelect(dateStr);
                                }
                            }}
                            title={tooltip}
                            className={`relative w-full h-12 flex flex-col items-center justify-center rounded-xl transition-all border
                                ${!isCurrentMonth ? 'opacity-20 pointer-events-none border-transparent' : ''}
                                ${isSelected
                                    ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-100 z-10 scale-105'
                                    : isHolidayBlocked
                                        ? 'bg-rose-50 border-rose-200 text-rose-400 cursor-not-allowed'
                                        : isProviderBlocked
                                            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                            : isHolidayDisplay
                                                ? 'bg-blue-50 border-blue-200 text-slate-800 hover:border-sky-300'
                                                : isAvailable
                                                    ? 'bg-white border-slate-100 hover:border-sky-300 text-slate-800'
                                                    : 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed'}
                            `}
                        >
                            <span className="text-xs font-black">{format(cloneDay, 'd')}</span>
                            {isAvailable && !isSelected && (
                                <span className="text-[8px] font-bold mt-0.5 text-sky-500">
                                    {slotsLeft} vé
                                </span>
                            )}
                            {isSelected && (
                                <span className="text-[8px] font-bold mt-0.5 text-white/80">{slotsLeft} vé</span>
                            )}
                            {isHolidayBlocked && isCurrentMonth && (
                                <span className="text-[7px] font-bold text-rose-400 mt-0.5 truncate w-full text-center px-0.5">🚫</span>
                            )}
                            {isHolidayDisplay && isCurrentMonth && (
                                <span className="text-[7px] font-bold text-blue-400 mt-0.5">🎌</span>
                            )}
                            {isProviderBlocked && isCurrentMonth && !isHolidayBlocked && (
                                <span className="text-[7px] font-bold text-slate-400 mt-0.5">🔒</span>
                            )}
                            {!isAvailable && !isHolidayBlocked && !isProviderBlocked && isCurrentMonth && !isPast && (
                                <span className="text-[8px] font-bold text-slate-300 mt-0.5">Hết</span>
                            )}
                        </button>
                        {/* Tooltip khi hover */}
                        {tooltip && isCurrentMonth && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                                {tooltip}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                            </div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1" key={day.toISOString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-1">{rows}</div>;
    };

    return (
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mt-4">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {/* Chú thích */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <div className="w-3 h-3 bg-white border border-slate-200 rounded" />
                    Còn chỗ
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-[8px]">🎌</div>
                    Ngày lễ (mở đặt)
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <div className="w-3 h-3 bg-rose-50 border border-rose-200 rounded flex items-center justify-center text-[8px]">🚫</div>
                    Bị chặn
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-[8px]">🔒</div>
                    NCC đóng
                </div>
            </div>
        </div>
    );
};

const ServiceDetailSkeleton = () => (
    <div className="min-h-screen bg-slate-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {/* Image Gallery Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[440px] mb-8 shadow-sm">
                <div className="md:col-span-2 rounded-2xl bg-slate-200 animate-pulse h-full" />
                <div className="hidden md:flex flex-col gap-4 h-full">
                    <div className="flex-1 rounded-2xl bg-slate-200 animate-pulse" />
                    <div className="flex-1 rounded-2xl bg-slate-200 animate-pulse" />
                </div>
                <div className="hidden md:block rounded-2xl bg-slate-200 animate-pulse h-full" />
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1">
                    {/* Header Skeleton */}
                    <div className="h-10 w-3/4 bg-slate-200 animate-pulse rounded-lg mb-4" />
                    <div className="h-6 w-1/4 bg-slate-200 animate-pulse rounded-lg mb-8" />
                    
                    {/* Tabs Skeleton */}
                    <div className="flex gap-8 border-b border-slate-200 mb-8">
                        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-t-lg" />
                        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-t-lg" />
                        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-t-lg" />
                    </div>

                    {/* Content Skeleton */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
                        <div className="h-6 w-1/4 bg-slate-200 animate-pulse rounded mb-4" />
                        <div className="h-4 w-full bg-slate-200 animate-pulse rounded" />
                        <div className="h-4 w-full bg-slate-200 animate-pulse rounded" />
                        <div className="h-4 w-5/6 bg-slate-200 animate-pulse rounded" />
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="w-full lg:w-[380px]">
                    <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-xl space-y-6">
                        <div className="h-12 w-1/2 bg-slate-200 animate-pulse rounded-lg" />
                        <div className="h-32 w-full bg-slate-200 animate-pulse rounded-2xl" />
                        <div className="h-32 w-full bg-slate-200 animate-pulse rounded-2xl" />
                        <div className="h-14 w-full bg-slate-200 animate-pulse rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ServiceDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const toast = useNotification();

    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedRoomModal, setSelectedRoomModal] = useState(null);
    const [systemHolidays, setSystemHolidays] = useState([]);
    const [bookingForm, setBookingForm] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        adults: 1,
        children: 0,
        rooms: 1
    });
    const [selectedRoomType, setSelectedRoomType] = useState(null);

    useEffect(() => {
        // Kiểm tra hash để chuyển tab tự động (ví dụ: #reviews)
        const hash = window.location.hash;
        if (hash === '#reviews') {
            setActiveTab('reviews');
            // Cuộn xuống phần nội dung tab
            setTimeout(() => {
                const element = document.getElementById('service-tabs-content');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveTab('overview');
        }

        const fetchDetail = async () => {
            try {
                const [serviceRes, holidayRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/general/get/services/detail/${slug}`),
                    axios.get(`${import.meta.env.VITE_API_URL}/holidays`, {
                        params: {
                            start_date: format(new Date(), 'yyyy-MM-dd'),
                            end_date: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
                        }
                    }),
                ]);
                if (serviceRes.data.success) {
                    const data = serviceRes.data.data;
                    setServiceData(data);
                    if (data.room_types && data.room_types.length > 0) {
                        setSelectedRoomType(data.room_types[0]);
                    }
                }
                if (holidayRes.data.success) {
                    setSystemHolidays(holidayRes.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết dịch vụ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    // Theo dõi hành vi: Gửi tín hiệu "view_service" ngay lập tức khi load xong data
    const { trackAction } = useBehaviorTracking(currentUser, serviceData?.location?.id, serviceData?.type);

    useEffect(() => {
        if (serviceData && currentUser) {
            trackAction('view_service', { 
                service_id: serviceData.id,
                location_id: serviceData.location?.id,
                service_type: serviceData.type,
                dwell_time: 0 // Lần đầu gửi dwell_time = 0
            });
        }
    }, [serviceData?.id, currentUser?.id, trackAction]);

    if (loading) return <ServiceDetailSkeleton />;

    if (!serviceData) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-lg">
                Không tìm thấy thông tin dịch vụ này.
            </div>
        );
    }

    const isTour = serviceData.type === 'tour';
    const isHotel = serviceData.type === 'hotel';
    const isHomestay = serviceData.type === 'homestay';
    const isVehicle = serviceData.type === 'vehicle';

    const rawImages = serviceData.media?.map(m => m.url) || [];
    const allImages = rawImages.length > 0 
        ? rawImages.map(img => img.startsWith('http') ? img : `${backendBaseUrl}/storage/${img}`)
        : ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'];
    const price = selectedRoomType ? selectedRoomType.base_price : (serviceData.base_price ?? 0);
    const rating = serviceData.rating_avg ?? 0;
    const reviewCount = serviceData.total_reviews ?? serviceData.total_bookings ?? 0;
    const duration = (isTour && serviceData.duration_days)
        ? `${serviceData.duration_days} ngày ${serviceData.duration_nights ? serviceData.duration_nights + ' đêm' : ''}`
        : (isHotel || isHomestay ? 'Lưu trú' : 'Trong ngày');
    
    // Price unit label (matching ServiceCard)
    const unitLabel = serviceData.price_unit === 'per_person' ? 'người' : 'phòng';
    
    const reviews = serviceData.reviews ?? [];

    const nights = (isHotel || isHomestay) && bookingForm.startDate && bookingForm.endDate
        ? Math.max(1, Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24)))
        : 1;

    const calculateTotal = () => {
        let total = 0;
        if (serviceData.price_unit === 'per_person') {
            total = (price * bookingForm.adults + price * 0.5 * bookingForm.children) * nights;
        } else {
            total = price * nights * bookingForm.rooms;
        }
        return Math.floor(total);
    };

    const totalPrice = calculateTotal();

    const currentAvailability = isTour && bookingForm.startDate 
        ? (serviceData.availabilities || []).find(a => a.available_date === bookingForm.startDate)
        : null;
    const tourTicketsLeft = currentAvailability ? (currentAvailability.total_slots - currentAvailability.booked_slots) : 0;
    
    // Capacity validation
    const getCapacityInfo = () => {
        if (isTour) return { 
            maxTotal: bookingForm.startDate ? tourTicketsLeft : (serviceData.max_guests || 50), 
            label: 'vé' 
        };
        if (isHotel || isHomestay) {
            const adultsPerUnit = selectedRoomType?.capacity_adults || 2;
            const childrenPerUnit = selectedRoomType?.capacity_children || 0;
            return { 
                maxAdults: adultsPerUnit * bookingForm.rooms,
                maxTotal: (adultsPerUnit + childrenPerUnit) * bookingForm.rooms,
                label: 'người' 
            };
        }
        return { maxTotal: serviceData.max_guests || 10, label: 'người' };
    };

    const capacityInfo = getCapacityInfo();
    const totalGuests = bookingForm.adults + bookingForm.children;
    
    const isOverCapacity = isTour
        ? (bookingForm.startDate && bookingForm.adults > tourTicketsLeft)
        : (isHotel || isHomestay) 
            ? (bookingForm.adults > capacityInfo.maxAdults || totalGuests > capacityInfo.maxTotal)
            : (totalGuests > capacityInfo.maxTotal);
    
    const isMissingDates = (isHotel || isHomestay) && (!bookingForm.startDate || !bookingForm.endDate);
    const isTourUnavailable = isTour && (!currentAvailability || tourTicketsLeft <= 0);

    const canBook = !isOverCapacity && !isMissingDates && !isTourUnavailable;

    const amenities = serviceData.amenities || serviceData.tags || [];
    const includes = serviceData.includes || [];
    const excludes = serviceData.excludes || [];
    const schedules = [...(serviceData.schedules || [])].sort((a, b) => a.day_number - b.day_number);


    const handleBooking = () => {
        if (!serviceData) return;
        
        let finalBookingInfo = { ...bookingForm };
        
        // Calculate return date for tours based on duration_days
        if (isTour && bookingForm.startDate && serviceData.duration_days) {
            try {
                const startDate = new Date(bookingForm.startDate);
                if (!isNaN(startDate.getTime())) {
                    const endDate = addDays(startDate, serviceData.duration_days - 1);
                    finalBookingInfo.endDate = format(endDate, 'yyyy-MM-dd');
                }
            } catch (err) {
                console.error("Error calculating return date:", err);
            }
        }

        navigate('/checkout', { 
            state: { 
                service: serviceData,
                bookingInfo: {
                    ...finalBookingInfo,
                    date: bookingForm.startDate, // For backward compatibility
                    room_type_id: selectedRoomType?.id,
                    selectedRoomType: selectedRoomType
                }
            } 
        });
    };

    const handleStartDateChange = (val) => {
        setBookingForm(prev => {
            const newState = { ...prev, startDate: val };
            // If new start date is after current end date, reset end date
            if (prev.endDate && val >= prev.endDate) {
                newState.endDate = '';
            }
            return newState;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8 pb-16">
                {/* Header: Name, Type, Rating, Location - ABOVE image */}
                <div className="mb-6">
                    {/* Type badge */}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 ${
                        isTour ? 'bg-blue-50 text-blue-600' :
                        isHotel ? 'bg-purple-50 text-purple-600' :
                        isHomestay ? 'bg-pink-50 text-pink-600' :
                        'bg-orange-50 text-orange-600'
                    }`}>
                        {isTour ? '🗺️ Tour du lịch' : isHotel ? '🏨 Khách sạn' : isHomestay ? '🏡 Homestay' : '🚌 Phương tiện'}
                    </span>

                    <h1 className="text-3xl lg:text-4xl font-black text-slate-800 mb-4 leading-tight">{serviceData.name}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <span className="flex items-center gap-1.5">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                            <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
                            <span className="text-slate-400">({reviewCount} đánh giá)</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin size={16} className="text-rose-400" />
                            {serviceData.location?.name || 'Việt Nam'}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <span className="font-bold text-slate-700">{serviceData.provider?.business_name || 'Hệ thống'}</span>
                        </span>
                    </div>

                </div>

                {/* Image Gallery - Optimized 4-column layout */}
                <div 
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 shadow-sm overflow-hidden rounded-2xl h-[300px] md:h-[440px] max-h-[300px] md:max-h-[440px]"
                >
                    {/* Column 1 & 2: Big Main Image */}
                    <div
                        className="md:col-span-2 relative group cursor-pointer rounded-2xl overflow-hidden h-full"
                        onClick={() => { setActiveImage(0); setLightboxOpen(true); }}
                    >
                        <img
                            src={allImages[0]}
                            alt="Main"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                    {/* Column 3: Two Small Images */}
                    <div className="hidden md:flex flex-col gap-4 h-full">
                        {[1, 2].map((idx) => (
                            <div
                                key={idx}
                                className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer"
                                onClick={() => { 
                                    if (allImages[idx]) {
                                        setActiveImage(idx); 
                                        setLightboxOpen(true); 
                                    }
                                }}
                            >
                                {allImages[idx] ? (
                                    <img
                                        src={allImages[idx]}
                                        alt={`Gallery ${idx}`}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <Camera size={24} className="text-slate-300 opacity-20" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Column 4: One Tall Image or "More" Overlay */}
                    <div
                        className="hidden md:block rounded-2xl overflow-hidden relative group cursor-pointer h-full"
                        onClick={() => { 
                            if (allImages.length > 3) {
                                setActiveImage(3); 
                                setLightboxOpen(true); 
                            }
                        }}
                    >
                        {allImages[3] ? (
                            <div className="relative h-full">
                                <img 
                                    src={allImages[3]} 
                                    alt="Gallery 3" 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                {allImages.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center group-hover:bg-black/40 transition-colors">
                                        <span className="text-white font-black text-3xl">+{allImages.length - 3}</span>
                                        <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Xem tất cả ảnh</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <Camera size={32} className="text-slate-300 opacity-20" />
                            </div>
                        )}
                    </div>
                </div>



                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Quick Stats - Moved inside content area to prevent overlap */}
                        <div className="flex flex-wrap gap-3 py-6 border-b border-slate-100 mb-8">
                            {isTour && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <Clock size={18} className="text-sky-500" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Thời lượng</p>
                                        <p className="font-bold text-slate-800 text-xs">{duration}</p>
                                    </div>
                                </div>
                            )}
                            {(isHotel || isHomestay) && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <BedDouble size={18} className="text-purple-500" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Loại phòng</p>
                                        <p className="font-bold text-slate-800 text-xs">{selectedRoomType ? selectedRoomType.name : 'Standard'}</p>
                                    </div>
                                </div>
                            )}
                            {serviceData.max_guests && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <Users size={18} className="text-emerald-500" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Số khách</p>
                                        <p className="font-bold text-slate-800 text-xs">Tối đa {serviceData.max_guests}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Shield size={18} className="text-amber-500" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chính sách</p>
                                    <p className="font-bold text-slate-800 text-xs">Hủy miễn phí 48h</p>
                                </div>
                            </div>
                        </div>
                        {/* Tabs */}
                        <div id="service-tabs-content" className="flex gap-6 border-b border-slate-200 mb-8 bg-white rounded-t-2xl px-2">
                            <Tab id="overview" label="Tổng quan" active={activeTab} onClick={setActiveTab} />
                            {isTour && <Tab id="itinerary" label={`Lịch trình (${schedules.length} ngày)`} active={activeTab} onClick={setActiveTab} />}
                            {(isTour || amenities.length > 0 || includes.length > 0 || excludes.length > 0) && (
                                <Tab id="amenities" label="Tiện nghi" active={activeTab} onClick={setActiveTab} />
                            )}
                            <Tab id="reviews" label={`Đánh giá & Bình luận`} active={activeTab} onClick={setActiveTab} />
                        </div>

                        {/* Tab: Overview */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Description */}
                                <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <Sun size={20} className="text-amber-500" />
                                        Giới thiệu
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                        {serviceData.description || 'Chưa có mô tả cho dịch vụ này.'}
                                    </p>
                                </section>

                                {/* Provider Info */}
                                {serviceData.provider && (
                                    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 shrink-0 border border-sky-100 overflow-hidden">
                                                    {serviceData.provider.avatar_url ? (
                                                        <img src={serviceData.provider.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={32} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Được cung cấp bởi</p>
                                                    <h3 className="text-lg font-black text-slate-800">{serviceData.provider.business_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                        <span className="text-xs font-bold text-slate-500">Đối tác xác thực</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                className="w-full sm:w-auto px-8 py-3 rounded-xl border-sky-200 text-sky-600 hover:bg-sky-50 font-black flex items-center justify-center gap-2 shadow-sm shadow-sky-100/50"
                                                onClick={() => {
                                                    const name = encodeURIComponent(serviceData.provider.business_name);
                                                    const avatar = encodeURIComponent(serviceData.provider.avatar_url || '');
                                                    window.open(`/messages?userId=${serviceData.provider.user_id}&name=${name}&avatar=${avatar}`, '_blank');
                                                }}
                                            >
                                                <MessageSquare size={18} />
                                                Liên hệ ngay
                                            </Button>
                                        </div>
                                    </section>
                                )}

                                {/* Room Selection for Hotels */}
                                {(isHotel || isHomestay) && serviceData.room_types?.length > 0 && (
                                    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <BedDouble size={20} className="text-purple-500" />
                                            Chọn loại phòng
                                        </h2>
                                        <div className="space-y-4">
                                            {serviceData.room_types.map((room) => (
                                                <div 
                                                    key={room.id}
                                                    onClick={() => setSelectedRoomType(room)}
                                                    className={`group relative flex flex-col md:flex-row gap-5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                        selectedRoomType?.id === room.id 
                                                            ? 'border-sky-500 bg-sky-50/30 ring-4 ring-sky-50 shadow-md' 
                                                            : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm'
                                                    }`}
                                                >
                                                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                                        <img 
                                                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                            alt={room.name} 
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="flex-1">
                                                                <h3 className="font-black text-slate-800">{room.name}</h3>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedRoomModal(room); }}
                                                                    className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:text-sky-600 flex items-center gap-1 transition-colors mt-0.5"
                                                                >
                                                                    <Info size={12} />
                                                                    Xem chi tiết
                                                                </button>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-black text-sky-600">{new Intl.NumberFormat('vi-VN').format(room.base_price)}đ</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ đêm</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                                            {room.description || 'Không có mô tả chi tiết cho loại phòng này.'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-4">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                                <Users size={14} className="text-slate-400" />
                                                                {room.capacity_adults} người lớn {room.capacity_children > 0 && `, ${room.capacity_children} trẻ em`}
                                                                {room.total_rooms > 1 && <span className="text-sky-600 ml-2">({room.total_rooms} phòng ngủ)</span>}
                                                            </div>
                                                            {room.amenities?.slice(0, 3).map((am, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                                    {am}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {selectedRoomType?.id === room.id && (
                                                        <div className="absolute top-4 right-4 bg-sky-500 text-white p-1 rounded-full shadow-lg">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                            </div>
                        )}

                        {/* Tab: Itinerary (Tour) */}
                        {activeTab === 'itinerary' && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <CalendarDays size={22} className="text-sky-500" />
                                        Lịch trình chi tiết
                                    </h2>
                                    {schedules.length > 0 && (
                                        <span className="text-xs font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full">
                                            {schedules.length} ngày
                                        </span>
                                    )}
                                </div>

                                {schedules.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-bold">Nhà cung cấp chưa cập nhật lịch trình.</p>
                                        <p className="text-sm mt-1">Liên hệ để biết thêm chi tiết.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {schedules.map((item, idx) => (
                                            <ItineraryItem
                                                key={item.id || idx}
                                                item={item}
                                                isLast={idx === schedules.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Amenities (All types) */}
                        {activeTab === 'amenities' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {includes.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                                <CheckCircle2 size={20} className="text-emerald-500" />
                                                Bao gồm
                                            </h2>
                                            <ul className="space-y-3">
                                                {includes.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                                        <span className="text-sm text-slate-600 font-medium">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {excludes.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                                <X size={20} className="text-rose-500" />
                                                Không bao gồm
                                            </h2>
                                            <ul className="space-y-3">
                                                {excludes.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                                                            <X size={12} className="text-rose-500" />
                                                        </div>
                                                        <span className="text-sm text-slate-600 font-medium">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {!isTour && (
                                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
                                                <Utensils size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-slate-800">Tiện ích & Dịch vụ</h2>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Các tiện nghi có sẵn tại đây</p>
                                            </div>
                                        </div>
                                        
                                        {amenities.length === 0 ? (
                                            <div className="text-center py-12 text-slate-400">
                                                <Info size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="font-bold">Chưa có thông tin tiện nghi.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {amenities.map((item, i) => {
                                                    const Icon = AMENITY_ICONS[item.toLowerCase()] || Info;
                                                    return (
                                                        <div key={i} className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-all group">
                                                            <Icon size={28} className="text-slate-400 group-hover:text-sky-500 mb-3 transition-colors" />
                                                            <span className="text-xs font-black text-slate-600 group-hover:text-sky-800 text-center capitalize tracking-tight">{item}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Reviews */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                {/* Rating Summary */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <div className="text-5xl font-black text-slate-800">{rating.toFixed(1)}</div>
                                            <StarRating rating={rating} size={18} />
                                            <p className="text-sm text-slate-400 mt-1 font-medium">{reviewCount} đánh giá</p>
                                        </div>
                                        <div className="flex-1 border-l border-slate-100 pl-8 space-y-2">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const pct = star === 5 ? 65 : star === 4 ? 20 : star === 3 ? 10 : 5;
                                                return (
                                                    <div key={star} className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-500 w-6">{star}</span>
                                                        <Star size={12} className="text-amber-400 fill-amber-400" />
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400 w-8">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Feedback & Review Component (Merged) */}
                                <ServiceReviews serviceId={serviceData.id} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Booking */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7 sticky top-24">
                            {/* Price */}
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-3xl font-black text-slate-800">
                                    {new Intl.NumberFormat('vi-VN').format(price)}đ
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-1.5">
                                    {isHotel || isHomestay ? `/ đêm / ${unitLabel}` : `/ ${unitLabel}`}
                                </span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-5">
                                Giá tham khảo tại thời điểm này
                            </p>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleBooking(); }}>
                                {isTour ? (
                                    <div className="space-y-4">
                                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                                                    <CalendarDays size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-slate-800">Chọn ngày khởi hành</h3>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Xem số vé còn trống theo ngày</p>
                                                </div>
                                            </div>

                                            <AvailabilityCalendar 
                                                selectedDate={bookingForm.startDate}
                                                availabilities={serviceData.availabilities}
                                                systemHolidays={systemHolidays}
                                                onSelect={(date) => setBookingForm({ ...bookingForm, startDate: date })}
                                                onBlockedClick={(msg) => toast?.error?.(msg)}
                                            />

                                            {bookingForm.startDate && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-600">Thời lượng:</span>
                                                    </div>
                                                    <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
                                                        {serviceData.duration_days} ngày {serviceData.duration_nights ? `${serviceData.duration_nights} đêm` : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className={`border rounded-xl p-4 transition-all ${bookingForm.startDate ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200 hover:border-sky-300'}`}>
                                            <label className="block text-[10px] uppercase tracking-widest font-black text-sky-500 mb-1.5">Nhận phòng</label>
                                            <input
                                                type="date"
                                                value={bookingForm.startDate}
                                                onChange={(e) => handleStartDateChange(e.target.value)}
                                                className="w-full font-bold text-slate-800 outline-none cursor-pointer bg-transparent"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className={`border rounded-xl p-4 transition-all ${bookingForm.endDate ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200 hover:border-sky-300'}`}>
                                            <label className="block text-[10px] uppercase tracking-widest font-black text-sky-500 mb-1.5">Trả phòng</label>
                                            <input
                                                type="date"
                                                value={bookingForm.endDate}
                                                onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                                                className="w-full font-bold text-slate-800 outline-none cursor-pointer bg-transparent"
                                                min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                                                disabled={!bookingForm.startDate}
                                            />
                                        </div>
                                    </div>
                                )}

                                {(isHotel || isHomestay) && (
                                    <div className="border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition-colors">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400">Số lượng phòng</label>
                                            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Còn {selectedRoomType?.inventory || 0} phòng</span>
                                        </div>
                                        <Counter 
                                            value={bookingForm.rooms}
                                            min={1}
                                            max={selectedRoomType?.inventory || 1}
                                            onChange={(val) => setBookingForm({ ...bookingForm, rooms: val })}
                                        />
                                    </div>
                                )}

                                {isTour ? (
                                    <div className="border border-slate-200 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400">Số lượng vé</label>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                tourTicketsLeft > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                                            }`}>
                                                {bookingForm.startDate ? (tourTicketsLeft > 0 ? `Còn ${tourTicketsLeft} vé` : 'Hết vé') : 'Vui lòng chọn ngày'}
                                            </span>
                                        </div>
                                        <Counter 
                                            label="Số vé"
                                            value={bookingForm.adults}
                                            min={1}
                                            max={tourTicketsLeft > 0 ? tourTicketsLeft : 1}
                                            onChange={(val) => setBookingForm({ ...bookingForm, adults: val, children: 0 })}
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 rounded-xl p-4 space-y-1 divide-y divide-slate-100">
                                        <Counter 
                                            label="Người lớn"
                                            sublabel="Từ 12 tuổi"
                                            value={bookingForm.adults}
                                            min={1}
                                            onChange={(val) => setBookingForm({ ...bookingForm, adults: val })}
                                        />
                                        <Counter 
                                            label="Trẻ em"
                                            sublabel="2 - 11 tuổi"
                                            value={bookingForm.children}
                                            min={0}
                                            onChange={(val) => setBookingForm({ ...bookingForm, children: val })}
                                        />
                                    </div>
                                )}

                                {/* Validation Errors */}
                                {isTour && !bookingForm.startDate && (
                                    <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-start gap-3">
                                        <AlertCircle size={18} className="text-sky-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-sky-600">Chưa chọn ngày</p>
                                            <p className="text-[10px] text-sky-500 font-medium leading-tight">
                                                Vui lòng chọn một ngày khởi hành còn vé để tiếp tục.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isTour && bookingForm.startDate && isTourUnavailable && (
                                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-3">
                                        <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-rose-600">Hết chỗ!</p>
                                            <p className="text-[10px] text-rose-500 font-medium leading-tight">
                                                Ngày này hiện đã hết vé hoặc không khả dụng. Vui lòng chọn ngày khác.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isMissingDates && (
                                    <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-start gap-3">
                                        <AlertCircle size={18} className="text-sky-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-sky-600">Thông tin chưa đầy đủ</p>
                                            <p className="text-[10px] text-sky-500 font-medium leading-tight">
                                                Vui lòng chọn đầy đủ Ngày nhận phòng và Ngày trả phòng để tiếp tục.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isOverCapacity && (
                                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-3 animate-shake">
                                        <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-rose-600">Vượt quá sức chứa!</p>
                                            <p className="text-[10px] text-rose-500 font-medium leading-tight">
                                                {isTour ? `Tour này chỉ nhận tối đa ${capacityInfo.maxTotal} khách.` : 
                                                 bookingForm.adults > capacityInfo.maxAdults ? `Với ${bookingForm.rooms} phòng, bạn chỉ có thể ở tối đa ${capacityInfo.maxAdults} người lớn.` :
                                                 `Với ${bookingForm.rooms} phòng, tổng số người (bao gồm trẻ em) không được quá ${capacityInfo.maxTotal}.`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>{serviceData.price_unit === 'per_person' ? 'Đơn giá / người' : 'Đơn giá / phòng'}</span>
                                        <span>{new Intl.NumberFormat('vi-VN').format(Math.floor(price))}đ</span>
                                    </div>
                                    {(isHotel || isHomestay) && (
                                        <>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Số đêm</span>
                                                <span>{nights} đêm</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Số phòng</span>
                                                <span>{bookingForm.rooms} phòng</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between text-base font-black text-slate-800 border-t border-slate-100 pt-2 mt-2">
                                        <span>Tổng cộng</span>
                                        <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    disabled={!canBook}
                                    className={`w-full py-4 text-base font-black rounded-xl mt-2 shadow-lg transition-all ${
                                        !canBook ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'shadow-sky-200'
                                    }`}
                                >
                                    {isTour 
                                        ? (!bookingForm.startDate ? 'Chọn ngày khởi hành' : isTourUnavailable ? 'Hết vé ngày này' : 'Đặt ngay')
                                        : (isMissingDates ? 'Chọn ngày để đặt' : isOverCapacity ? 'Không đủ chỗ' : 'Đặt ngay')}
                                </Button>
                                <p className="text-center text-xs text-slate-400">Bạn sẽ không bị tính phí lúc này</p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Room Detail Modal */}
            <RoomDetailModal 
                room={selectedRoomModal} 
                onClose={() => setSelectedRoomModal(null)} 
            />

            {/* Lightbox */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={activeImage}
                slides={allImages.map(img => ({ src: img }))}
            />
        </div>
    );
};

export default ServiceDetail;
