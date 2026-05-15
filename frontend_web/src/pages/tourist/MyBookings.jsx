import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import bookingApi from '../../api/bookingApi';
import { Loader2, Calendar, CreditCard, ExternalLink, AlertCircle, MessageSquare, BedDouble, MapPin, Undo2, LogOut } from 'lucide-react';


const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await bookingApi.getMyBookings();
            if (response.success) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đặt chỗ:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt chỗ này không?')) return;

        try {
            const res = await bookingApi.cancelBooking(id);
            if (res.success) {
                alert('Đã hủy đơn đặt chỗ thành công.');
                fetchBookings();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn.');
        }
    };

    const handleDetail = (code) => {
        window.open(`/booking-detail/${code}`, '_blank');
    };

    const handleCheckIn = async (id) => {
        try {
            const res = await bookingApi.checkIn(id);
            if (res.success) {
                alert('Yêu cầu Check-in thành công! Vui lòng chờ nhà cung cấp xác nhận.');
                fetchBookings();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi Check-in.');
        }
    };

    const handleUndoCheckIn = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn hoàn tác yêu cầu Check-in?')) return;
        try {
            const res = await bookingApi.undoCheckIn(id);
            if (res.success) {
                alert('Đã hoàn tác yêu cầu Check-in.');
                fetchBookings();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi hoàn tác.');
        }
    };

    const handleCheckOut = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn Check-out?')) return;
        try {
            const res = await bookingApi.checkOut(id);
            if (res.success) {
                alert('Check-out thành công!');
                fetchBookings();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi Check-out.');
        }
    };

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'pending', label: 'Chờ xử lý' },
        { id: 'confirmed', label: 'Đã xác nhận' },
        { id: 'ongoing', label: 'Đang lưu trú' },
        { id: 'completed', label: 'Hoàn thành' },
        { id: 'cancelled', label: 'Đã hủy' }
    ];

    const filteredBookings = activeTab === 'all'
        ? bookings
        : bookings.filter(booking => booking.status === activeTab);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const getPaymentStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            paid: 'bg-green-50 text-green-700 border border-green-200',
            refunded: 'bg-purple-50 text-purple-700 border border-purple-200',
            failed: 'bg-red-50 text-red-700 border border-red-200'
        };
        const labels = {
            pending: 'Chưa thanh toán',
            paid: 'Đã thanh toán',
            refunded: 'Đã hoàn tiền',
            failed: 'Thất bại'
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-slate-100 text-slate-600',
            confirmed: 'bg-sky-100 text-sky-700',
            ongoing: 'bg-amber-100 text-amber-700',
            completed: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-rose-100 text-rose-700'
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8 animate-pulse">
                        <div className="h-10 bg-slate-200 rounded-xl w-48" />
                        <div className="h-10 bg-slate-200 rounded-xl w-32" />
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-14 bg-slate-50 border-b border-slate-100" />
                        <div className="p-6 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-6 animate-pulse">
                                    <div className="w-32 h-24 bg-slate-100 rounded-xl" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-slate-100 rounded w-1/4" />
                                        <div className="h-6 bg-slate-200 rounded w-1/2" />
                                        <div className="h-4 bg-slate-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Chuyến đi của tôi</h1>
                        <p className="text-slate-500 text-sm mt-1">Quản lý lịch sử và trạng thái các dịch vụ đã đặt</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate('/search')}>Đặt chuyến đi mới</Button>
                </div>

                {/* Status Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50">
                        <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Status tabs">
                            {tabs.map((tab) => {
                                const count = tab.id === 'all'
                                    ? bookings.length
                                    : bookings.filter(b => b.status === tab.id).length;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            relative px-6 py-4 text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2
                                            ${isActive
                                                ? 'text-sky-600 bg-white border-b-2 border-sky-600'
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 border-b-2 border-transparent'}
                                        `}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <span>{tab.label}</span>
                                        <span className={`
                                            px-2 py-0.5 text-[10px] rounded-full font-black
                                            ${isActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-500'}
                                        `}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bookings List */}
                    <div className="divide-y divide-slate-100">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Service Image */}
                                    <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        <img
                                            src={booking.service?.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300'}
                                            alt={booking.service?.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Booking Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-mono text-xs font-bold text-slate-400">#{booking.booking_code}</span>
                                            {getStatusBadge(booking.status)}
                                            {getPaymentStatusBadge(booking.payment_status)}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-sky-600 transition-colors cursor-pointer" onClick={() => handleDetail(booking.booking_code)}>
                                            {booking.service?.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-slate-300" />
                                                {formatDate(booking.check_in_date)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CreditCard size={14} className="text-slate-300" />
                                                {formatCurrency(booking.total_amount)}
                                            </div>
                                            <div className="text-sky-500 bg-sky-50 px-2 py-0.5 rounded uppercase tracking-widest text-[9px]">
                                                {booking.service?.type}
                                            </div>
                                            {booking.room_type && (
                                                <div className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-widest text-[9px] flex items-center gap-1">
                                                    <BedDouble size={12} /> {booking.room_type.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => handleDetail(booking.booking_code)} className="gap-1 px-4">
                                            Chi tiết <ExternalLink size={14} />
                                        </Button>
                                        {booking.provider && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const name = encodeURIComponent(booking.provider?.business_name || '');
                                                    const avatar = encodeURIComponent(booking.provider?.avatar_url || '');
                                                    window.open(`/messages?userId=${booking.provider.user_id}&name=${name}&avatar=${avatar}`, '_blank');
                                                }}
                                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 flex items-center gap-1"
                                            >
                                                Liên hệ
                                                <MessageSquare size={14} />
                                            </Button>
                                        )}
                                        {booking.status === 'pending' && (
                                            <>
                                                {booking.payment_status === 'pending' && (
                                                    <Button variant="primary" size="sm" onClick={() => navigate(`/checkout/${booking.id}`)}>
                                                        Thanh toán ngay
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => handleCancel(booking.id)} className="text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300">
                                                    Hủy đơn
                                                </Button>
                                            </>
                                        )}

                                        {booking.status === 'confirmed' && booking.payment_status === 'paid' && (booking.service?.type === 'hotel' || booking.service?.type === 'homestay') && (
                                            <>
                                                {!booking.tourist_check_in_at && (
                                                    <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleCheckIn(booking.id); }} className="gap-1 flex items-center">
                                                        Check-in <MapPin size={14} />
                                                    </Button>
                                                )}
                                                {booking.tourist_check_in_at && !booking.is_checked_in && (
                                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleUndoCheckIn(booking.id); }} className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1 flex items-center">
                                                        Hoàn tác Check-in <Undo2 size={14} />
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {(booking.status === 'ongoing' || booking.is_checked_in) && !booking.checked_out_at && (booking.service?.type === 'hotel' || booking.service?.type === 'homestay') && (
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCheckOut(booking.id); }} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1 flex items-center">
                                                Check-out <LogOut size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredBookings.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                    <AlertCircle size={32} className="text-slate-200" />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-bold">Không tìm thấy chuyến đi nào</p>
                                    <p className="text-slate-400 text-xs">Bạn chưa có đơn đặt chỗ nào trong mục này.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MyBookings;
