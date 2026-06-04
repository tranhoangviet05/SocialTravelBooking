import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
    Loader2, CheckCircle2, QrCode, Wallet, ChevronRight,
    Clock, AlertCircle, RefreshCw, Copy, Check, Shield,
    CreditCard, Banknote, User, Phone, Mail, MessageSquare,
    Tag, X, Map, Hotel, Home, Car, BedDouble
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import bookingApi from '../../api/bookingApi';
import UpsellAlert from '../../components/tourist/booking/UpsellAlert';
import { ArrowUpCircle, Gift, Ticket, Calendar, AlertCircle as AlertCircleIcon } from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n ?? 0) + 'đ';

/* ─── Sub-Components (Defined first to avoid initialization errors) ─── */

const FormField = ({ label, icon, value, onChange, placeholder, type = "text", error, readOnly }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            {icon} {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm transition-all outline-none
                ${readOnly ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-white text-slate-800 border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-50'}
                ${error ? 'border-rose-400 bg-rose-50' : ''}`}
        />
        {error && <span className="text-[10px] font-bold text-rose-500 ml-1">{error}</span>}
    </div>
);

const InfoRow = ({ label, value, highlight, copyable }) => {
    const [copied, setCopied] = useState(false);
    return (
        <div className="flex items-center justify-between p-3.5">
            <span className="text-xs font-bold text-slate-500">{label}</span>
            <div className="flex items-center gap-1.5">
                <span className={`text-sm font-black ${highlight ? 'text-red-600 text-base' : 'text-slate-800'}`}>{value}</span>
                {copyable && (
                    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                        className={`p-1 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─── Step Indicator ────────────────────────────────────────────── */
const StepBar = ({ step }) => {
    const steps = ['Thông tin', 'Thanh toán', 'Hoàn tất'];
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((label, i) => {
                const idx = i + 1;
                const done = step > idx;
                const active = step === idx;
                return (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300
                                ${done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                    : active ? 'bg-sky-500 text-white shadow-lg shadow-sky-200 ring-4 ring-sky-100'
                                    : 'bg-slate-100 text-slate-400'}`}>
                                {done ? <CheckCircle2 size={16} /> : idx}
                            </div>
                            <span className={`text-xs font-bold mt-1 ${active ? 'text-sky-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mx-1 mb-5 transition-all duration-500 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/* ─── Payment Method Card ────────────────────────────────────────── */
const PaymentCard = ({ id, selected, onSelect, icon: Icon, iconColor, title, subtitle, badge }) => (
    <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200
        ${selected === id ? 'border-sky-500 bg-sky-50/60 shadow-md shadow-sky-100' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
        <input type="radio" name="payment" className="sr-only" checked={selected === id} onChange={() => onSelect(id)} />
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
            <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{title}</span>
                {badge && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{badge}</span>}
            </div>
            <span className="text-xs text-slate-400">{subtitle}</span>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${selected === id ? 'border-sky-500 bg-sky-500' : 'border-slate-300'}`}>
            {selected === id && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
    </label>
);

/* ─── SePay QR Panel ─────────────────────────────────────────────── */
const SepayQRPanel = ({ paymentData, onPollingSuccess, bookingId }) => {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [polling, setPolling] = useState(false);
    const [status, setStatus] = useState('waiting'); // waiting | confirmed | expired
    const intervalRef = useRef(null);
    const pollRef = useRef(null);

    // Kiểm tra thủ công khi bấm nút
    const handleManualCheck = async () => {
        if (polling) return;
        setPolling(true);
        try {
            const res = await bookingApi.checkPaymentStatus(bookingId);
            if (res?.data?.payment_status === 'paid') {
                setStatus('confirmed');
                onPollingSuccess(res.data);
            } else {
                alert('Hệ thống chưa ghi nhận thanh toán của bạn. Vui lòng đợi trong giây lát hoặc liên hệ hỗ trợ.');
            }
        } catch (err) {
            console.error('Manual check error:', err);
        } finally {
            setPolling(false);
        }
    };

    // Đếm ngược thời gian
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(intervalRef.current);
                    setStatus('expired');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    // Polling kiểm tra trạng thái (mỗi 5 giây)
    useEffect(() => {
        if (status !== 'waiting') return;
        pollRef.current = setInterval(async () => {
            try {
                const res = await bookingApi.checkPaymentStatus(bookingId);
                if (res?.data?.payment_status === 'paid') {
                    clearInterval(pollRef.current);
                    setStatus('confirmed');
                    setTimeout(() => onPollingSuccess(res.data), 1500);
                }
            } catch (_) {}
        }, 5000);
        return () => clearInterval(pollRef.current);
    }, [bookingId, status, onPollingSuccess]);

    const copyContent = () => {
        navigator.clipboard.writeText(paymentData.transfer_content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss = String(timeLeft % 60).padStart(2, '0');

    if (status === 'confirmed') {
        return (
            <div className="flex flex-col items-center py-10 gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <p className="text-xl font-black text-emerald-600">Xác nhận thanh toán!</p>
                <p className="text-sm text-slate-500">Đang chuyển đến trang thành công...</p>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="flex flex-col items-center py-10 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                    <Clock size={32} className="text-rose-500" />
                </div>
                <p className="text-lg font-black text-rose-600">Hết thời gian thanh toán</p>
                <p className="text-sm text-slate-500">Mã QR đã hết hạn. Vui lòng tải lại trang để tạo mã mới.</p>
                <button onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-colors">
                    <RefreshCw size={15} /> Tải lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Timer */}
            <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-black
                ${timeLeft < 120 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                <Clock size={16} />
                Hết hạn sau: {mm}:{ss}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50">
                    <img
                        src={paymentData.qr_url}
                        alt="QR SePay"
                        className="w-52 h-52 object-contain rounded-xl"
                        onError={(e) => {
                            // QR fallback nếu không load được
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div className="w-52 h-52 hidden items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-sm font-bold text-center p-4">
                        <QrCode size={40} className="mb-2 mx-auto" />
                        Không load được QR. Dùng thông tin chuyển khoản bên dưới.
                    </div>
                </div>
                <p className="text-xs text-slate-500 font-medium text-center">
                    Mở app ngân hàng → Quét mã QR để thanh toán
                </p>
            </div>

            {/* Transfer info */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
                <InfoRow label="Ngân hàng" value={paymentData.bank_code} />
                <InfoRow label="Số tài khoản" value={paymentData.bank_account} copyable />
                <InfoRow label="Số tiền" value={fmt(paymentData.total_amount)} highlight />
                <div className="flex items-center justify-between p-3.5">
                    <span className="text-xs font-bold text-slate-500">Nội dung CK</span>
                    <div className="flex items-center gap-2">
                        <code className="text-xs font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            {paymentData.transfer_content}
                        </code>
                        <button onClick={copyContent}
                            className={`p-1 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Important note */}
            <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span><strong>Quan trọng:</strong> Nhập <strong>đúng</strong> nội dung chuyển khoản để hệ thống tự động xác nhận. Sai nội dung có thể mất đến 24h xử lý thủ công.</span>
            </div>

            {/* Auto check indicator */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    Đang tự động kiểm tra trạng thái thanh toán...
                </div>
                <button
                    onClick={handleManualCheck}
                    disabled={polling}
                    className="w-full flex items-center justify-center gap-2 py-3 mt-1 bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-600 hover:text-sky-600 font-bold rounded-2xl text-xs transition-all disabled:opacity-50"
                >
                    {polling ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                    {polling ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản thành công — Nhấn để kiểm tra ngay'}
                </button>
            </div>
        </div>
    );
};

// InfoRow and FormField moved to top

/* ─── Main Checkout Page ─────────────────────────────────────────── */
const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingId } = useParams();
    const { currentUser } = useAuth();
    const [loadingBooking, setLoadingBooking] = useState(!!bookingId);

    // Dữ liệu từ navigate state (nếu có)
    const [service, setService] = useState(location.state?.service);
    const [bookingInfo, setBookingInfo] = useState(location.state?.bookingInfo);

    // Form state
    const [form, setForm] = useState({
        checkInDate: bookingInfo?.startDate || bookingInfo?.date || '',
        checkOutDate: bookingInfo?.endDate || '',
        numAdults: bookingInfo?.adults || 1,
        numChildren: service?.type === 'tour' ? 0 : (bookingInfo?.children || 0),
        numRooms: bookingInfo?.rooms || 1,
        contactName: currentUser?.displayName || currentUser?.display_name || '',
        contactEmail: currentUser?.email || '',
        contactPhone: currentUser?.phone || '',
        specialRequests: '',
        couponCode: '',
        room_type_id: bookingInfo?.room_type_id || null,
        selectedRoomType: bookingInfo?.selectedRoomType || null,
    });

    const [booking, setBooking] = useState(null);
    const [errors, setErrors] = useState({});
    const [activeUpsell, setActiveUpsell] = useState(null);
    const [step, setStep] = useState(1); // 1=form, 2=payment, 3=done
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [walletBalance, setWalletBalance] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('sepay');
    const [couponInput, setCouponInput] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);

    // Kiểm tra Upsell khi thông tin phòng/dịch vụ thay đổi
    useEffect(() => {
        if (!service?.id || step !== 1) return;
        
        const checkUpsell = async () => {
            try {
                const res = await bookingApi.checkUpsells([{
                    service_id: service.id,
                    quantity: form.numRooms
                }]);
                if (res.success && res.data.length > 0) {
                    setActiveUpsell(res.data[0]);
                } else {
                    setActiveUpsell(null);
                }
            } catch (err) {
                console.error("Check upsell failed", err);
            }
        };

        checkUpsell();
    }, [service?.id, form.numRooms, step]);

    const handleAcceptUpsell = () => {
        if (!activeUpsell) return;
        setService(activeUpsell.target_service);
        setForm(prev => ({ ...prev, numRooms: 1 }));
        setActiveUpsell(null);
        alert(`Đã nâng cấp lên ${activeUpsell.target_service.name}! Bạn sẽ nhận được ưu đãi từ ${activeUpsell.perk_service.name} sau khi hoàn tất.`);
    };
    // 1. Nếu vào bằng link Email (có bookingId), lấy data từ Server
    useEffect(() => {
        if (!bookingId) return;

        const fetchBooking = async () => {
            setLoadingBooking(true);
            setErrors({});
            try {
                const res = await bookingApi.getBookingById(bookingId);
                if (res.success && res.data) {
                    const b = res.data;
                    setService(b.service);
                    setBooking(b); // Lưu booking có sẵn để thanh toán
                    
                    setForm({
                        checkInDate: b.check_in_date ? b.check_in_date.split('T')[0] : '',
                        checkOutDate: b.check_out_date ? b.check_out_date.split('T')[0] : '',
                        numAdults: b.num_adults || 1,
                        numChildren: b.num_children || 0,
                        numRooms: 1, // Mặc định 1 phòng khi load từ email link
                        contactName: b.contact_name || '',
                        contactEmail: b.contact_email || '',
                        contactPhone: b.contact_phone || '',
                        specialRequests: b.special_requests || '',
                        couponCode: b.coupon_code || '',
                        room_type_id: b.room_type_id || null,
                        selectedRoomType: b.service?.room_types?.find(r => r.id === b.room_type_id) || null,
                    });
                    
                    // Nếu đơn đã có booking sẵn, nhảy thẳng sang bước thanh toán 
                    setStep(2); 
                } else {
                    setErrors({ general: res.message || "Không tìm thấy dữ liệu đơn hàng." });
                }
            } catch (err) {
                console.error("Error fetching booking:", err);
                setErrors({ general: err.response?.data?.message || "Lỗi kết nối đến máy chủ (404)." });
            } finally {
                setLoadingBooking(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // 2. Nếu vào từ trang Detail (có bookingInfo qua state)
    useEffect(() => {
        if (!bookingId && bookingInfo) {
            setForm(f => ({
                ...f,
                checkInDate: bookingInfo.startDate || bookingInfo.date || '',
                checkOutDate: bookingInfo.endDate || '',
                numAdults: bookingInfo.adults || 1,
                numChildren: bookingInfo.children || 0,
                numRooms: bookingInfo.rooms || 1,
                room_type_id: bookingInfo.room_type_id || null,
                selectedRoomType: bookingInfo.selectedRoomType || null,
            }));
        }
    }, [bookingId, bookingInfo]);
    
    // Đồng bộ thông tin từ Profile nếu form đang trống (Lần đầu load)
    useEffect(() => {
        if (currentUser) {
            setForm(f => ({
                ...f,
                contactName: f.contactName || currentUser.displayName || currentUser.display_name || '',
                contactEmail: f.contactEmail || currentUser.email || '',
                contactPhone: f.contactPhone || currentUser.phone || '',
            }));
        }
    }, [currentUser]);

    // Auto-calculate check-out for Tours
    useEffect(() => {
        if (service?.type === 'tour' && form.checkInDate && service.duration_days) {
            const startDate = new Date(form.checkInDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + parseInt(service.duration_days));
            
            const endDateStr = endDate.toISOString().split('T')[0];
            if (form.checkOutDate !== endDateStr) {
                setForm(f => ({ ...f, checkOutDate: endDateStr }));
            }
        }
    }, [form.checkInDate, service]);

    const selectedRoomType = form.selectedRoomType;
    const basePrice    = selectedRoomType ? selectedRoomType.base_price : (service?.base_price ?? 0);
    
    let subtotal = 0;
    let priceDetails = '';

    if (service?.type === 'hotel' || service?.type === 'homestay') {
        // Tính theo đêm
        const checkIn = new Date(form.checkInDate);
        const checkOut = new Date(form.checkOutDate || form.checkInDate);
        let nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (nights < 1) nights = 1;
        const numRooms = form.numRooms || 1; // fallback tránh NaN
        subtotal = basePrice * nights * numRooms;
        priceDetails = `${nights} đêm × ${numRooms} phòng × ${fmt(Math.floor(basePrice))}`;
    } else if (service?.type === 'tour') {
        // Tính theo vé
        subtotal = basePrice * form.numAdults;
        priceDetails = `${form.numAdults} vé × ${fmt(Math.floor(basePrice))}`;
    } else {
        // Tính theo người
        const adultPrice = basePrice * form.numAdults;
        const childPrice = basePrice * 0.5 * form.numChildren;
        subtotal = adultPrice + childPrice;
        priceDetails = `${form.numAdults} người lớn ${form.numChildren > 0 ? `+ ${form.numChildren} trẻ em` : ''} × ${fmt(Math.floor(basePrice))}`;
    }

    subtotal = Math.floor(subtotal);

    // Khi load từ email/MyBookings (có booking từ server), dùng total_amount trực tiếp
    // tránh NaN do numRooms hoặc selectedRoomType không có đủ data
    const displayTotal = (booking?.total_amount != null && booking.total_amount > 0)
        ? booking.total_amount
        : Math.max(0, subtotal - discountAmount);
    const totalAmount = displayTotal;

    // Lấy số dư ví
    useEffect(() => {
        if (!service) return;
        bookingApi.getWalletBalance()
            .then(res => setWalletBalance(res?.data?.balance ?? 0))
            .catch(() => setWalletBalance(0));
    }, [service]);

    if (loadingBooking) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 animate-pulse">
                    <div className="h-8 bg-slate-200 rounded-xl w-3/4 mx-auto" />
                    <div className="h-4 bg-slate-100 rounded-lg w-1/2 mx-auto" />
                    <div className="space-y-4">
                        <div className="h-32 bg-white rounded-3xl border border-slate-100" />
                        <div className="h-64 bg-white rounded-3xl border border-slate-100" />
                    </div>
                </div>
                <div className="mt-8 flex items-center gap-3 text-slate-400 font-bold text-sm">
                    <Loader2 className="animate-spin" /> Đang tải thông tin đơn hàng...
                </div>
            </div>
        );
    }

    if (!service && !bookingId) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-8 bg-white rounded-3xl m-4 border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <AlertCircle size={48} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy dịch vụ</h2>
                    <p className="text-slate-400 max-w-xs mx-auto">Vui lòng chọn dịch vụ từ trang chủ hoặc tìm kiếm để tiến hành đặt chỗ.</p>
                </div>
                <button onClick={() => navigate('/search')}
                    className="px-8 py-4 bg-sky-500 text-white rounded-2xl font-black shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all hover:scale-105 active:scale-95">
                    Khám phá dịch vụ ngay
                </button>
            </div>
        );
    }

    if (!service && bookingId) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-8 bg-white rounded-3xl m-4 border border-rose-100 shadow-sm">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-200">
                    <X size={48} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy đơn hàng</h2>
                    <p className="text-slate-400 max-w-xs mx-auto mb-4">Mã đơn: #{bookingId.substring(0,8)}...</p>
                    <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl font-mono mb-6">
                        Lỗi: {errors.general || "Server trả về 404 (Không tìm thấy route hoặc đơn hàng)"}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/my-bookings')}
                        className="px-6 py-4 bg-slate-800 text-white rounded-2xl font-black shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95">
                        Quay lại đơn hàng
                    </button>
                    <button onClick={() => window.location.reload()}
                        className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // Validate form step 1
    const validateStep1 = () => {
        const e = {};
        if (!form.checkInDate) e.checkInDate = 'Vui lòng chọn ngày';
        if (!form.contactName.trim()) e.contactName = 'Vui lòng nhập họ tên';
        if (!form.contactPhone.trim()) e.contactPhone = 'Vui lòng nhập số điện thoại';
        if (!form.contactEmail.trim()) e.contactEmail = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Email không hợp lệ';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Bước 1 → 2: Tạo booking
    const handleCreateBooking = async () => {
        if (!validateStep1()) return;
        setIsProcessing(true);
        try {
            const res = await bookingApi.createBooking({
                service_id:       service.id,
                check_in_date:    form.checkInDate,
                check_out_date:   form.checkOutDate || null,
                num_adults:       form.numAdults,
                num_children:     form.numChildren,
                contact_name:     form.contactName,
                contact_email:    form.contactEmail,
                contact_phone:    form.contactPhone,
                special_requests: form.specialRequests || null,
                coupon_code:      couponApplied?.code || null,
                payment_method:   paymentMethod,
                room_type_id:     form.room_type_id,
            });
            if (res?.success && res?.data) {
                setBooking(res.data);
                setStep(2);
            } else {
                alert(res?.message || 'Tạo đơn thất bại. Vui lòng thử lại.');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.';
            alert(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    // Bước 2: Xác nhận phương thức & khởi tạo thanh toán
    const handleInitiatePayment = async () => {
        if (!booking) return;
        setIsProcessing(true);
        try {
            const res = await bookingApi.initiatePayment(booking.id, paymentMethod);
            if (res?.success) {
                if (paymentMethod === 'wallet') {
                    // Ví: thanh toán ngay
                    navigate('/success', {
                        state: {
                            booking: { ...booking, ...res.data },
                            service,
                        },
                        replace: true,
                    });
                } else {
                    // SePay: hiện QR
                    setPaymentData(res.data);
                }
            } else {
                alert(res?.message || 'Không thể khởi tạo thanh toán.');
            }
        } catch (err) {
            alert(err?.response?.data?.message || 'Lỗi kết nối.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Callback khi SePay xác nhận
    const handleSepaySuccess = (confirmedData) => {
        navigate('/success', {
            state: {
                booking: { ...booking, ...confirmedData },
                service,
            },
            replace: true,
        });
    };

    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 pt-28 pb-10 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-black text-slate-800 mb-2 text-center">Xác nhận & Thanh toán</h1>
                <p className="text-center text-slate-400 text-sm mb-8">Đặt dịch vụ an toàn, hoàn tiền dễ dàng</p>

                <StepBar step={step} />

                {/* --- COUPON MODAL --- */}
                {isCouponModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <Ticket size={18} className="text-emerald-500" /> Chọn mã giảm giá
                                </h3>
                                <button onClick={() => setIsCouponModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50">
                                {loadingCoupons ? (
                                    <div className="flex justify-center items-center py-10 text-slate-400 gap-2">
                                        <Loader2 size={18} className="animate-spin" /> Đang tải danh sách...
                                    </div>
                                ) : availableCoupons.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400">
                                        Không có mã giảm giá nào.
                                    </div>
                                ) : (
                                    availableCoupons.map((c) => {
                                        // Kiểm tra thêm điều kiện đơn hàng tối thiểu
                                        let finalAvailable = c.is_available;
                                        let finalReason = c.unavailability_reason;
                                        if (finalAvailable && subtotal < c.min_order_amount) {
                                            finalAvailable = false;
                                            finalReason = `Đơn hàng tối thiểu ${fmt(c.min_order_amount)}`;
                                        }

                                        return (
                                            <div key={c.id} className={`p-4 rounded-2xl border-2 flex flex-col gap-3 transition-all relative overflow-hidden
                                                ${finalAvailable ? 'border-emerald-200 bg-white hover:border-emerald-400 cursor-pointer shadow-sm' : 'border-slate-200 bg-slate-100 opacity-75 cursor-not-allowed'}`}
                                                onClick={async () => {
                                                    if (!finalAvailable) return;
                                                    try {
                                                        const res = await bookingApi.applyCoupon(c.code, subtotal);
                                                        if (res.success) {
                                                            setCouponApplied(res.data);
                                                            setDiscountAmount(res.data.discount_amount);
                                                            setCouponInput(c.code);
                                                            setIsCouponModalOpen(false);
                                                        }
                                                    } catch (err) {
                                                        alert(err.response?.data?.message || 'Không thể áp dụng mã này');
                                                    }
                                                }}
                                            >
                                                {!c.is_public && (
                                                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-bl-lg">
                                                        Ưu đãi riêng
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1">
                                                        <div className="font-black text-lg text-slate-800 flex items-center gap-2">
                                                            {c.code}
                                                        </div>
                                                        <p className="text-sm font-bold text-emerald-600 mt-0.5">
                                                            Giảm {c.type === 'percent' ? `${c.discount_value}%` : fmt(c.discount_value)}
                                                            {c.type === 'percent' && c.max_discount && ` (Tối đa ${fmt(c.max_discount)})`}
                                                        </p>
                                                    </div>
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                                                        <Gift size={24} className="text-emerald-500" />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    {c.min_order_amount > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Banknote size={12} /> Đơn từ {fmt(c.min_order_amount)}
                                                        </span>
                                                    )}
                                                    {c.valid_until && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} /> HSD: {new Date(c.valid_until).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    )}
                                                </div>

                                                {!finalAvailable && finalReason && (
                                                    <div className="text-[11px] font-bold text-rose-500 flex items-center gap-1 bg-rose-50 p-1.5 rounded-lg">
                                                        <AlertCircleIcon size={12} /> {finalReason}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ── LEFT COLUMN ── */}
                    <div className="flex-1 space-y-5">

                        {/* STEP 1: Thông tin */}
                        {step === 1 && (
                            <>
                                {/* Contact Info */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h2 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                                        <User size={18} className="text-sky-500" /> Thông tin liên hệ
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            label="Họ và tên *" icon={<User size={14} />}
                                            value={form.contactName} error={errors.contactName}
                                            onChange={v => setField('contactName', v)} placeholder="Nguyễn Văn A"
                                        />
                                        <FormField
                                            label="Số điện thoại *" icon={<Phone size={14} />}
                                            value={form.contactPhone} error={errors.contactPhone}
                                            onChange={v => setField('contactPhone', v)} placeholder="0901234567"
                                        />
                                        <div className="sm:col-span-2">
                                            <FormField
                                                label="Email *" icon={<Mail size={14} />}
                                                value={form.contactEmail} error={errors.contactEmail}
                                                onChange={v => setField('contactEmail', v)} placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Trip Details */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h2 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                                        <Clock size={18} className="text-sky-500" /> Chi tiết chuyến đi
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            label="Ngày nhận / Bắt đầu" type="date"
                                            value={form.checkInDate} readOnly
                                        />
                                        {(service.type === 'hotel' || service.type === 'homestay' || service.type === 'tour') && (
                                            <FormField
                                                label={service.type === 'tour' ? "Ngày kết thúc" : "Ngày trả phòng"} type="date"
                                                value={form.checkOutDate} readOnly
                                            />
                                        )}
                                        <div className={service.type === 'hotel' || service.type === 'homestay' ? 'sm:col-span-2 grid grid-cols-3 gap-4' : 'sm:col-span-2 grid grid-cols-2 gap-4'}>
                                            {(service.type === 'hotel' || service.type === 'homestay') && (
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Số lượng phòng</label>
                                                    <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700">
                                                        {form.numRooms} phòng
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5">{service.type === 'tour' ? 'Số lượng vé' : 'Người lớn'}</label>
                                                <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700">
                                                    {form.numAdults} {service.type === 'tour' ? 'vé' : 'người lớn'}
                                                </div>
                                            </div>
                                            {service.type !== 'tour' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Trẻ em</label>
                                                    <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700">
                                                        {form.numChildren} trẻ em
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                                                <MessageSquare size={13} /> Yêu cầu đặc biệt
                                            </label>
                                            <textarea
                                                rows={3} value={form.specialRequests}
                                                onChange={e => setField('specialRequests', e.target.value)}
                                                placeholder="Dị ứng thực phẩm, yêu cầu phòng, giờ nhận phòng sớm..."
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400 transition-colors resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Coupon */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <Tag size={18} className="text-emerald-500" /> Mã giảm giá
                                    </h2>
                                    {couponApplied ? (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                                            <div>
                                                <p className="text-sm font-black text-emerald-700">{couponApplied.code}</p>
                                                <p className="text-xs text-emerald-600">Giảm {fmt(discountAmount)}</p>
                                            </div>
                                            <button onClick={() => { setCouponApplied(null); setDiscountAmount(0); setCouponInput(''); }}
                                                className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <input
                                                    value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                                    placeholder="Nhập mã giảm giá..."
                                                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 transition-colors uppercase tracking-wider"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!couponInput) return;
                                                        try {
                                                            const res = await bookingApi.applyCoupon(couponInput, subtotal);
                                                            if (res.success) {
                                                                setCouponApplied(res.data);
                                                                setDiscountAmount(res.data.discount_amount);
                                                            } else {
                                                                alert(res.message || 'Mã không hợp lệ');
                                                            }
                                                        } catch (err) {
                                                            alert(err.response?.data?.message || 'Mã không hợp lệ');
                                                        }
                                                    }}
                                                    className="px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-colors whitespace-nowrap">
                                                    Áp dụng
                                                </button>
                                            </div>
                                            
                                            <div className="relative flex py-2 items-center">
                                                <div className="flex-grow border-t border-slate-100"></div>
                                                <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-400">hoặc</span>
                                                <div className="flex-grow border-t border-slate-100"></div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    setIsCouponModalOpen(true);
                                                    setLoadingCoupons(true);
                                                    try {
                                                        const res = await bookingApi.getMyCoupons();
                                                        if (res.success) setAvailableCoupons(res.data);
                                                    } catch (err) {
                                                        console.error(err);
                                                    } finally {
                                                        setLoadingCoupons(false);
                                                    }
                                                }}
                                                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors"
                                            >
                                                <Ticket size={16} /> Xem tất cả mã ưu đãi
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <CreditCard size={18} className="text-sky-500" /> Phương thức thanh toán
                                    </h2>
                                    <div className="space-y-3">
                                        <PaymentCard
                                            id="sepay"
                                            selected={paymentMethod}
                                            onSelect={setPaymentMethod}
                                            icon={QrCode}
                                            iconColor="bg-sky-100 text-sky-600"
                                            title="Chuyển khoản ngân hàng (SePay)"
                                            subtitle="Quét mã QR — xác nhận tự động trong 1 phút"
                                            badge="Phổ biến"
                                        />
                                        <PaymentCard
                                            id="wallet"
                                            selected={paymentMethod}
                                            onSelect={setPaymentMethod}
                                            icon={Wallet}
                                            iconColor="bg-violet-100 text-violet-600"
                                            title="Ví SocialTravel"
                                            subtitle={walletBalance !== null
                                                ? `Số dư: ${fmt(walletBalance)}`
                                                : 'Đang tải số dư...'}
                                        />
                                    </div>

                                    {paymentMethod === 'wallet' && walletBalance !== null && walletBalance < totalAmount && (
                                        <div className="mt-3 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
                                            <AlertCircle size={14} className="shrink-0" />
                                            Số dư ví không đủ. Cần thêm <strong>{fmt(totalAmount - walletBalance)}</strong>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* STEP 2: QR Payment */}
                        {step === 2 && paymentMethod === 'sepay' && !paymentData && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center">
                                    <QrCode size={32} className="text-sky-600" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-lg font-black text-slate-800 mb-1">Thanh toán qua SePay</h2>
                                    <p className="text-sm text-slate-500">
                                        Hệ thống sẽ tạo mã QR chuyển khoản ngân hàng và tự động xác nhận khi nhận được tiền.
                                    </p>
                                </div>
                                <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
                                    <InfoRow label="Mã đặt chỗ" value={booking?.booking_code} />
                                    <InfoRow label="Tổng thanh toán" value={fmt(booking?.total_amount)} highlight />
                                </div>
                                <button
                                    onClick={handleInitiatePayment}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl text-base transition-colors disabled:opacity-50 shadow-lg shadow-sky-200">
                                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <QrCode size={20} />}
                                    {isProcessing ? 'Đang tạo mã QR...' : 'Hiển thị mã QR'}
                                </button>
                            </div>
                        )}

                        {/* SePay QR display */}
                        {step === 2 && paymentData && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                                    <QrCode size={18} className="text-sky-500" /> Quét mã QR để thanh toán
                                </h2>
                                <SepayQRPanel
                                    paymentData={paymentData}
                                    bookingId={booking?.id}
                                    onPollingSuccess={handleSepaySuccess}
                                />
                            </div>
                        )}

                        {/* Step 2 wallet confirm */}
                        {step === 2 && paymentMethod === 'wallet' && !paymentData && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                                    <Wallet size={32} className="text-violet-600" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-lg font-black text-slate-800 mb-1">Thanh toán bằng Ví</h2>
                                    <p className="text-sm text-slate-500">
                                        Số dư: <strong className="text-violet-600">{fmt(walletBalance)}</strong>
                                    </p>
                                </div>
                                <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
                                    <InfoRow label="Mã đặt chỗ" value={booking?.booking_code} />
                                    <InfoRow label="Số tiền trừ" value={fmt(booking?.total_amount)} highlight />
                                    <InfoRow label="Số dư còn lại" value={fmt((walletBalance ?? 0) - (booking?.total_amount ?? 0))} />
                                </div>
                                <button
                                    onClick={handleInitiatePayment}
                                    disabled={isProcessing || (walletBalance ?? 0) < (booking?.total_amount ?? 0)}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-violet-500 hover:bg-violet-600 text-white font-black rounded-2xl text-base transition-colors disabled:opacity-50 shadow-lg shadow-violet-200">
                                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Wallet size={20} />}
                                    {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán ví'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT SIDEBAR: Order Summary ── */}
                    <div className="w-full lg:w-[360px] shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <h2 className="text-base font-black text-slate-800 mb-4 border-b border-slate-100 pb-3">
                                Tóm tắt đơn hàng
                            </h2>

                            {/* Service info */}
                            <div className="flex gap-3 mb-5">
                                <img
                                    src={service.media?.[0]?.url || service.cover_image || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200'}
                                    alt={service.name}
                                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="font-black text-sm text-slate-800 line-clamp-2">{service.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {service.provider?.business_name || 'Nhà cung cấp'}
                                    </p>
                                    <span className="flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 w-fit">
                                        {service.type === 'tour' ? <><Map size={10} /> Tour</> :
                                         service.type === 'hotel' ? <><Hotel size={10} /> Khách sạn</> :
                                         service.type === 'homestay' ? <><Home size={10} /> Homestay</> : <><Car size={10} /> Xe</>}
                                    </span>
                                    {form.selectedRoomType && (
                                        <p className="flex items-center gap-1 text-[10px] font-bold text-purple-600 mt-1">
                                            <BedDouble size={10} /> {form.selectedRoomType.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="space-y-2.5 text-sm border-t border-dashed border-slate-200 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">{priceDetails}</span>
                                    <span className="font-bold text-slate-700">{fmt(subtotal)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span className="font-bold">Mã giảm giá ({couponApplied?.code})</span>
                                        <span className="font-black">−{fmt(discountAmount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                                <span className="font-black text-slate-800">Tổng cộng</span>
                                <span className="text-2xl font-black text-red-500">{fmt(totalAmount)}</span>
                            </div>

                            {/* Action buttons */}
                            {step === 1 && (
                                <button
                                    onClick={handleCreateBooking}
                                    disabled={isProcessing}
                                    className="w-full mt-5 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700
                                        text-white font-black rounded-2xl text-base transition-all shadow-lg shadow-sky-200 disabled:opacity-50">
                                    {isProcessing
                                        ? <><Loader2 size={20} className="animate-spin" />Đang xử lý...</>
                                        : <>Tiếp tục<ChevronRight size={20} /></>
                                    }
                                </button>
                            )}

                            {/* Security badge */}
                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                                <Shield size={13} className="text-emerald-400" />
                                Thanh toán được bảo mật 256-bit SSL
                            </div>

                            {/* Back button */}
                            {step === 2 && (
                                <button onClick={() => { setStep(1); setPaymentData(null); setBooking(null); }}
                                    className="w-full mt-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                                    ← Quay lại
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Checkout;
