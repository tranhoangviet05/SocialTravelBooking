import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    X, ArrowLeft, CheckCircle2, Clock, MapPin,
    CreditCard, MessageSquare, Download, Share2,
    Phone, Mail, Calendar, User, Users, BedDouble, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../components/common/Button';
import bookingApi from '../../api/bookingApi';

const BookingDetail = () => {
    const { bookingCode } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookingDetail = async () => {
            try {
                setLoading(true);
                const response = await bookingApi.getBookingByCode(bookingCode);
                if (response.success) {
                    setBooking(response.data);
                } else {
                    setError(response.message || 'Không tìm thấy đơn hàng');
                }
            } catch (err) {
                console.error('Error fetching booking:', err);
                setError('Đã có lỗi xảy ra khi tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        if (bookingCode) {
            fetchBookingDetail();
        }
    }, [bookingCode]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Oops!</h2>
                    <p className="text-slate-500 mb-8">{error || 'Không tìm thấy thông tin đơn hàng'}</p>
                    <Button variant="primary" className="w-full py-4 rounded-2xl font-bold" onClick={() => navigate('/my-bookings')}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-slate-800">Chi tiết đơn đặt chỗ</h1>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                {/* Status Banner */}
                <div className={`mb-8 p-6 rounded-[32px] flex items-center justify-between shadow-sm
                    ${booking.payment_status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    <div>
                        <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">Trạng thái</p>
                        <h3 className="text-2xl font-black">
                            {booking.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </h3>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        {booking.payment_status === 'paid' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Booking Header Card */}
                        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200/60">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        {booking.service?.type}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Mã đặt chỗ: #{booking.booking_code}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 mb-2">{booking.service?.name}</h2>
                                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                    <MapPin size={16} />
                                    {booking.service?.location?.name || 'Vị trí đã xác nhận'}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian chuyến đi</p>
                                                <p className="font-bold text-slate-800 text-lg">{formatDate(booking.check_in_date)}</p>
                                                <p className="text-xs text-slate-500 mt-1">Giờ nhận phòng: 12:00 AM</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thành viên tham gia</p>
                                                <p className="font-bold text-slate-800 text-lg">{booking.num_adults} Người lớn, {booking.num_children} Trẻ em</p>
                                                <p className="text-xs text-slate-500 mt-1">Tổng cộng: {Number(booking.num_adults) + Number(booking.num_children)} khách</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thông tin liên lạc</p>
                                                <p className="font-bold text-slate-800 text-lg">{booking.contact_name}</p>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <p className="text-xs text-slate-500 flex items-center gap-2 font-bold">
                                                        <Phone size={14} className="text-blue-500" />
                                                        {booking.contact_phone}
                                                    </p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-2 font-bold">
                                                        <Mail size={14} className="text-blue-500" />
                                                        {booking.contact_email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.roomType ? (
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                                    <BedDouble size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loại phòng đã đặt</p>
                                                    <p className="font-bold text-amber-600 text-lg">{booking.roomType.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Diện tích: {booking.roomType.size || '30'} m²</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chi tiết dịch vụ</p>
                                                    <p className="font-bold text-slate-800 text-lg">
                                                        {booking.service?.type === 'tour' ? 'Chuyến tham quan' :
                                                            booking.service?.type === 'hotel' ? 'Khách sạn' :
                                                                booking.service?.type === 'homestay' ? 'Homestay' : 'Phương tiện di chuyển'
                                                        }
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {booking.service?.type === 'tour' ? 'Bao gồm hướng dẫn viên & bảo hiểm' : 'Hỗ trợ đưa đón tận nơi'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {booking.special_requests && (
                                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yêu cầu đặc biệt</p>
                                        <p className="text-sm text-slate-600 italic">"{booking.special_requests}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200/60">
                            <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <CreditCard size={22} className="text-blue-600" />
                                Thông tin thanh toán
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="text-sm font-medium">Phương thức</span>
                                    <span className="font-bold uppercase">{booking.payment_method}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="text-sm font-medium">Trạng thái</span>
                                    <span className={`font-bold ${booking.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {booking.payment_status === 'paid' ? 'Đã quyết toán' : 'Chưa thanh toán'}
                                    </span>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-slate-800 font-black">Tổng thanh toán</span>
                                    <span className="text-2xl font-black text-blue-600">{formatCurrency(booking.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* QR Ticket */}
                        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-200/60 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Mã vé điện tử</p>

                            <div className="p-4 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 mb-6 group-hover:border-blue-200 transition-colors">
                                {booking.payment_status === 'paid' ? (
                                    <div className="bg-white p-3 rounded-2xl shadow-sm inline-block">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Booking: ${booking.booking_code}`)}`}
                                            alt="Ticket QR"
                                            className="w-40 h-40"
                                        />
                                    </div>
                                ) : (
                                    <div className="py-10 text-slate-300">
                                        <AlertCircle size={48} className="mx-auto mb-4" />
                                        <p className="text-xs font-bold px-4">Thanh toán để nhận mã vé</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-xl font-black text-slate-800 tracking-widest mb-8">#{booking.booking_code}</p>

                            <div className="space-y-3">
                                {booking.payment_status === 'paid' && (
                                    <Button variant="outline" className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                        <Download size={18} />
                                        Tải vé (PDF)
                                    </Button>
                                )}
                                <Button
                                    variant="primary"
                                    className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                                    onClick={() => {
                                        const name = encodeURIComponent(booking.provider?.business_name || '');
                                        const avatar = encodeURIComponent(booking.provider?.user?.avatar_url || '');
                                        window.open(`/messages?userId=${booking.provider?.user_id}&name=${name}&avatar=${avatar}`, '_blank');
                                    }}
                                >
                                    <MessageSquare size={18} />
                                    Liên hệ Provider
                                </Button>
                            </div>
                        </div>

                        {/* Location Help */}
                        <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-lg shadow-blue-200">
                            <MapPin size={32} className="mb-4 opacity-50" />
                            <h5 className="font-black text-lg mb-2">Bạn cần hỗ trợ?</h5>
                            <p className="text-blue-100 text-sm leading-relaxed mb-6">
                                Nếu có bất kỳ thắc mắc nào về chuyến đi hoặc thay đổi lịch trình, hãy liên hệ trực tiếp với Nhà cung cấp.
                            </p>
                            <div className="h-1 w-12 bg-white/30 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
