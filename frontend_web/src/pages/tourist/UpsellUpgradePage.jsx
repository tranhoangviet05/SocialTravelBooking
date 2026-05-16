import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';
import Button from '../../components/common/Button';
import { 
    Loader2, ChevronRight, Sparkles, CheckCircle2, 
    ArrowUpRight, BedDouble, Gift, ShieldCheck, 
    Info, Star, TrendingUp, DollarSign 
} from 'lucide-react';

const UpsellUpgradePage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const res = await bookingApi.getUpsellPreview(bookingId);
                if (res.success) {
                    setData(res.data);
                } else {
                    setError(res.message || 'Không tìm thấy ưu đãi phù hợp.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin.');
            } finally {
                setLoading(false);
            }
        };
        fetchPreview();
    }, [bookingId]);

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const res = await bookingApi.upgradeBooking(bookingId);
            if (res.success) {
                setSuccess(true);
                // Sau 3 giây chuyển hướng về trang đơn hàng
                setTimeout(() => {
                    navigate('/my-bookings');
                }, 3000);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi thực hiện nâng cấp.');
        } finally {
            setUpgrading(false);
        }
    };

    const fmt = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Đang tải ưu đãi đặc biệt...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Rất tiếc!</h2>
                <p className="text-slate-500 mb-8">{error}</p>
                <Button variant="primary" fullWidth onClick={() => navigate('/my-bookings')}>Quay lại đơn hàng</Button>
            </div>
        </div>
    );

    const { booking, upsell, comparison, perk } = data;

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {success ? (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-2xl border border-emerald-100">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CheckCircle2 className="w-14 h-14 text-emerald-600" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 mb-4">Nâng cấp thành công!</h1>
                        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                            Chúc mừng! Đơn hàng của bạn đã được nâng cấp lên hạng phòng cao cấp hơn. 
                            Hệ thống sẽ tự động cập nhật lịch sử đặt chỗ của bạn.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button variant="primary" onClick={() => navigate('/my-bookings')}>Xem đơn hàng mới</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                <Sparkles size={14} /> Đặc quyền dành riêng cho bạn
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                                Nâng tầm trải nghiệm <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">tại {booking.service?.name}</span>
                            </h1>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                Dựa trên sở thích của bạn, nhà cung cấp dành tặng cơ hội nâng cấp lên hạng phòng tốt hơn với chi phí cực kỳ ưu đãi.
                            </p>
                        </div>

                            {/* Comparison Cards */}
                            <div className="grid md:grid-cols-2 gap-6 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 text-indigo-500">
                                    <TrendingUp size={24} />
                                </div>

                                {/* Before Card */}
                                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm opacity-60">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">Hiện tại</div>
                                        <BedDouble className="text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{booking.room_type?.name || 'Phòng tiêu chuẩn'}</h3>
                                    <p className="text-slate-400 text-sm mb-6">Đã bao gồm các tiện ích cơ bản</p>
                                    <div className="pt-6 border-t border-slate-50">
                                        <p className="text-2xl font-black text-slate-400">{fmt(comparison.old_total)}</p>
                                        <p className="text-xs text-slate-400 font-bold">Tổng tiền đơn cũ</p>
                                    </div>
                                </div>

                                {/* After Card */}
                                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 border border-white/10 relative overflow-hidden transition-transform hover:-translate-y-1">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Sparkles size={120} />
                                    </div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase backdrop-blur-md">Đề xuất nâng cấp</div>
                                        <Star className="text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-1">{upsell.target_room_type?.name}</h3>
                                    <p className="text-indigo-100 text-sm mb-6">Không gian sang trọng & Tầm nhìn tuyệt đẹp</p>
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-2 text-sm text-indigo-50 font-bold">
                                            <ShieldCheck size={18} className="text-emerald-400" /> Vị trí đẹp nhất khách sạn
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-indigo-50 font-bold">
                                            <ArrowUpRight size={18} className="text-emerald-400" /> Miễn phí nhận phòng sớm (nếu có)
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-3xl font-black">{fmt(comparison.new_total)}</p>
                                        <p className="text-xs text-indigo-200 font-bold">Tổng tiền sau khi nâng cấp</p>
                                    </div>
                                </div>
                            </div>

                            {/* Perk Section */}
                            {perk && (
                                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
                                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50" />
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Gift size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-800">Dịch vụ đi kèm miễn phí</h4>
                                            <p className="text-slate-500 text-sm">Chúng tôi đã tích hợp thêm ưu đãi đặc biệt này cho bạn</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-white p-2 shadow-sm border border-slate-100 flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-400 leading-none">ƯU ĐÃI</p>
                                                    <p className="text-lg font-black text-indigo-600">-{upsell.perk_discount_percent}%</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-700">{perk.service?.name}</p>
                                                <p className="text-xs text-slate-500">{perk.service?.type === 'vehicle' ? 'Dịch vụ di chuyển' : 'Dịch vụ tham quan'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 line-through font-bold">{fmt(perk.original_price)}</p>
                                            <p className="text-lg font-black text-emerald-600">{perk.final_price === 0 ? 'MIỄN PHÍ' : fmt(perk.final_price)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary & Checkout */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-1">
                                            <DollarSign size={16} /> Chi phí chênh lệch cần thanh toán
                                        </div>
                                        <p className="text-3xl md:text-4xl font-black text-slate-900">
                                            {comparison.difference === 0 ? 'HOÀN TOÀN MIỄN PHÍ' : fmt(comparison.difference)}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-2 font-bold italic">
                                            * Hệ thống sẽ tự động đối soát và khấu trừ/yêu cầu thanh toán bổ sung cho nhà cung cấp khi bạn xác nhận.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button 
                                            variant="outline" 
                                            size="lg" 
                                            onClick={() => navigate('/my-bookings')}
                                            className="px-8"
                                        >
                                            Để sau
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            size="lg" 
                                            onClick={handleUpgrade}
                                            disabled={upgrading}
                                            className="px-12 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 gap-2 flex items-center font-black"
                                        >
                                            {upgrading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                            Xác nhận Nâng cấp ngay
                                        </Button>
                                    </div>
                                </div>
                            </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpsellUpgradePage;
