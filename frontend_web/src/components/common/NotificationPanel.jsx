import React from 'react';
import { Bell, CheckCheck, Trash2, Clock, AlertCircle, CalendarCheck, UserPlus, Star, MapPin, Tag } from 'lucide-react';

const ICONS = {
    new_user: UserPlus,
    user_registered: UserPlus,
    new_booking: CalendarCheck,
    booking_created: CalendarCheck,
    BookingCreated: CalendarCheck,
    BookingUpdated: CalendarCheck,
    BookingConfirmed: CalendarCheck,
    BookingCancelled: CalendarCheck,
    booking_confirmed: CalendarCheck,
    booking_cancelled: CalendarCheck,
    LocationCreated: MapPin,
    LocationUpdated: MapPin,
    LocationDeleted: MapPin,
    CategoryCreated: Tag,
    CategoryUpdated: Tag,
    CategoryDeleted: Tag,
    ServiceUpdated: AlertCircle,
    ServiceDeleted: AlertCircle,
    ReviewCreated: Star,
    provider_approved: AlertCircle,
    provider_rejected: AlertCircle,
    default: Bell,
};

const getIcon = (event) => ICONS[event] || ICONS.default;

const formatTime = (isoString) => {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
    } catch {
        return '';
    }
};

const NotificationPanel = ({ notifications, unreadCount, isOpen, setIsOpen, markAllRead, markRead, clearAll }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Panel */}
            <div className="fixed top-20 right-6 w-[380px] max-h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 flex flex-col animate-[slideDown_0.25s_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                            <Bell size={18} className="text-sky-500" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-base">Thông báo</h3>
                            {unreadCount > 0 && (
                                <p className="text-[11px] text-sky-500 font-bold">{unreadCount} thông báo mới</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                title="Đánh dấu đã đọc tất cả"
                            >
                                <CheckCheck size={16} />
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Xóa tất cả"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <span className="text-lg leading-none">×</span>
                        </button>
                    </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Bell size={28} className="text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold text-sm">Chưa có thông báo nào</p>
                            <p className="text-slate-300 text-xs mt-1 text-center">Thông báo realtime sẽ xuất hiện khi có sự kiện mới.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map((notif) => {
                                const Icon = getIcon(notif.event);
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => markRead(notif.id)}
                                        className={`px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer ${
                                            !notif.read ? 'bg-sky-50/40' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                !notif.read ? 'bg-sky-100 text-sky-500' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-bold leading-tight ${!notif.read ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-300 font-medium shrink-0 mt-0.5">
                                                        <Clock size={10} /> {formatTime(notif.timestamp)}
                                                    </span>
                                                </div>
                                                <p className={`text-xs mt-1 leading-relaxed ${!notif.read ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {notif.body}
                                                </p>
                                                {!notif.read && (
                                                    <span className="inline-block w-2 h-2 bg-sky-500 rounded-full mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100 text-center">
                        <p className="text-[11px] text-slate-300 font-medium">Thông báo được đồng bộ realtime qua Firebase Firestore</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
};

export default NotificationPanel;
