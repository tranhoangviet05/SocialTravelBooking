import React, { useState, useEffect } from 'react';
import {
    Search, Loader2, CalendarCheck, User, Package, Clock, CheckCircle, XCircle, Play, Filter, ChevronDown
} from 'lucide-react';
import ProviderLayout from '../../components/provider/ProviderLayout';
import providerApi from '../../api/providerApi';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await providerApi.getBookings(statusFilter);
            if (res.success) setBookings(res.data);
        } catch (err) {
            console.error('Fetch bookings error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        if (updatingId) return;
        setUpdatingId(bookingId);
        try {
            const res = await providerApi.updateBookingStatus(bookingId, newStatus);
            if (res.success) {
                alert('Cập nhật trạng thái thành công!');
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: 'bg-amber-50 text-amber-600', icon: Clock, label: 'Chờ xác nhận' },
            confirmed: { bg: 'bg-blue-50 text-blue-600', icon: CheckCircle, label: 'Đã xác nhận' },
            ongoing: { bg: 'bg-violet-50 text-violet-600', icon: Play, label: 'Đang diễn ra' },
            completed: { bg: 'bg-emerald-50 text-emerald-600', icon: CheckCircle, label: 'Hoàn thành' },
            cancelled: { bg: 'bg-rose-50 text-rose-600', icon: XCircle, label: 'Đã hủy' },
        };
        const s = map[status] || map.pending;
        return (
            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${s.bg}`}>
                <s.icon size={12} /> {s.label}
            </span>
        );
    };

    const getActionButtons = (booking) => {
        const isProcessing = updatingId === booking.id;
        const btnClass = "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50";

        switch (booking.status) {
            case 'pending':
                return (
                    <div className="flex gap-2">
                        <button disabled={isProcessing} onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className={`${btnClass} bg-emerald-500 text-white hover:bg-emerald-600`}>
                            {isProcessing ? <Loader2 size={12} className="animate-spin" /> : 'Xác nhận'}
                        </button>
                        <button disabled={isProcessing} onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className={`${btnClass} bg-rose-100 text-rose-600 hover:bg-rose-200`}>
                            Từ chối
                        </button>
                    </div>
                );
            case 'confirmed':
                return (
                    <button disabled={isProcessing} onClick={() => handleStatusUpdate(booking.id, 'ongoing')}
                        className={`${btnClass} bg-violet-500 text-white hover:bg-violet-600`}>
                        Bắt đầu
                    </button>
                );
            case 'ongoing':
                return (
                    <button disabled={isProcessing} onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className={`${btnClass} bg-emerald-500 text-white hover:bg-emerald-600`}>
                        Hoàn thành
                    </button>
                );
            default:
                return null;
        }
    };

    const statusTabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'confirmed', label: 'Đã xác nhận' },
        { key: 'ongoing', label: 'Đang diễn ra' },
        { key: 'completed', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    return (
        <ProviderLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lịch đặt chỗ</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý tất cả đơn đặt chỗ từ khách hàng.</p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {statusTabs.map(tab => (
                        <button key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                statusFilter === tab.key
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                    : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải đơn đặt chỗ...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <CalendarCheck size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">Chưa có đơn đặt chỗ nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.map(booking => (
                            <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">#{booking.booking_code}</span>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900">{booking.service?.name || 'Dịch vụ'}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><User size={12} /> {booking.contact_name || booking.user?.display_name}</span>
                                            <span className="flex items-center gap-1"><CalendarCheck size={12} /> {booking.check_in_date}</span>
                                            <span>{booking.num_adults} người lớn {booking.num_children > 0 ? `+ ${booking.num_children} trẻ em` : ''}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-lg font-black text-emerald-600">{Number(booking.total_amount).toLocaleString('vi-VN')}₫</p>
                                        <div className="mt-3">
                                            {getActionButtons(booking)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
};

export default MyBookings;
