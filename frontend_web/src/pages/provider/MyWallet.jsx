import React, { useState, useEffect, useCallback } from 'react';
import { useProviderData } from '../../contexts/ProviderDataContext';
import { useAuth } from '../../contexts/AuthContext';
import echo from '../../utils/echo';
import { 
    Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, 
    TrendingUp, Calendar, History, Loader2, DollarSign,
    ArrowRightLeft, BadgeCheck, RotateCw, Lock, Send, CheckCircle, AlertCircle
} from 'lucide-react';
import WalletSkeleton from '../../components/common/WalletSkeleton';
import bookingApi from '../../api/bookingApi';

const MyWallet = () => {
    const { 
        wallet, walletReport: report, fetchWallet, fetchWalletReport, loadingStates 
    } = useProviderData();
    const { currentUser } = useAuth();

    const loading = loadingStates.wallet || loadingStates.walletReport;
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', bank_name: '', bank_account_number: '', bank_account_name: '' });
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Realtime wallet balance: lắng nghe WalletUpdated event
    useEffect(() => {
        if (!currentUser) return;
        const channel = echo.private(`User.${currentUser.id}`);
        channel.listen('.WalletUpdated', (e) => {
            setToast({ message: e.message || 'Số dư ví đã cập nhật!', type: 'success' });
            fetchWallet(true); // refresh wallet data
        });
        return () => channel.stopListening('.WalletUpdated');
    }, [currentUser, fetchWallet]);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    useEffect(() => {
        fetchWallet();
        fetchWalletReport();
    }, [fetchWallet, fetchWalletReport]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price ?? 0);
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'booking_payment': 
            case 'revenue_allocation':
            case 'deposit': return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowUpRight size={20} /></div>;
            case 'platform_fee':
            case 'commission': return <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><ArrowDownLeft size={20} /></div>;
            case 'withdrawal': return <div className="p-2 bg-violet-50 text-violet-600 rounded-xl"><Send size={20} /></div>;
            case 'refund': return <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><ArrowRightLeft size={20} /></div>;
            default: return <div className="p-2 bg-slate-50 text-slate-600 rounded-xl"><DollarSign size={20} /></div>;
        }
    };

    const getTransactionLabel = (type) => {
        const labels = {
            'booking_payment': 'Nhận tiền đặt chỗ',
            'revenue_allocation': 'Phân bổ doanh thu (95%)',
            'deposit': 'Giữ trung gian',
            'platform_fee': 'Phí sàn 5%',
            'commission': 'Khấu trừ hoa hồng',
            'withdrawal': 'Rút tiền về tài khoản',
            'refund': 'Hoàn trả tiền cho khách',
        };
        return labels[type] || 'Giao dịch khác';
    };

    const handleWithdraw = async () => {
        if (!withdrawForm.amount || !withdrawForm.bank_name || !withdrawForm.bank_account_number || !withdrawForm.bank_account_name) {
            setToast({ message: 'Vui lòng điền đầy đủ thông tin.', type: 'error' });
            return;
        }
        setWithdrawLoading(true);
        try {
            const res = await bookingApi.createWithdrawalRequest({
                amount: Number(withdrawForm.amount),
                bank_name: withdrawForm.bank_name,
                bank_account_number: withdrawForm.bank_account_number,
                bank_account_name: withdrawForm.bank_account_name,
            });
            if (res.success) {
                setToast({ message: res.message || 'Yêu cầu rút tiền đã được gửi!', type: 'success' });
                setShowWithdrawModal(false);
                setWithdrawForm({ amount: '', bank_name: '', bank_account_number: '', bank_account_name: '' });
            } else {
                setToast({ message: res.message || 'Gửi yêu cầu thất bại.', type: 'error' });
            }
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Có lỗi xảy ra.', type: 'error' });
        } finally {
            setWithdrawLoading(false);
        }
    };

    if (loading) {
        return <WalletSkeleton />;
    }

    const walletObj = wallet?.wallet || { balance: 0, locked_balance: 0, escrow_balance: 0 };

    return (
        <>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ví tiền & Doanh thu</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi thu nhập và quản lý dòng tiền của bạn.</p>
                    </div>
                    <button onClick={() => { fetchWallet(true); fetchWalletReport(true); }}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Balance Card */}
                    <div className="md:col-span-2 relative overflow-hidden bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-600/20 group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                        <WalletIcon size={20} />
                                    </div>
                                    <span className="text-sm font-bold tracking-widest uppercase opacity-80">Số dư khả dụng</span>
                                </div>
                                <BadgeCheck className="text-white/40 group-hover:text-white/100 transition-all" size={24} />
                            </div>
                            <h3 className="text-5xl font-black mb-1 font-mono tracking-tighter">
                                {formatPrice(walletObj.balance)}
                            </h3>
                            <div className="flex items-center gap-3 text-white/70 mt-6 pt-6 border-t border-white/10">
                                <TrendingUp size={16} />
                                <p className="text-sm font-medium">Tổng doanh thu thực nhận: <span className="text-white font-bold ml-1">{formatPrice(wallet?.total_earned || 0)}</span></p>
                            </div>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Escrow & Withdraw Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Đang giữ trung gian</span>
                                <h4 className="text-2xl font-black text-amber-600 tracking-tighter">{formatPrice(walletObj.escrow_balance ?? 0)}</h4>
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Tiền từ các đơn đặt cọc / thanh toán, đang chờ bạn xác nhận Check-in.</p>
                            </div>
                            <div className="border-t border-dashed border-slate-100 pt-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Đóng băng</span>
                                <h4 className="text-xl font-black text-slate-400">{formatPrice(walletObj.locked_balance)}</h4>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowWithdrawModal(true)}
                            className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                            <Send size={16} /> Rút tiền về NH
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    {/* Transaction History */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <History className="text-emerald-500" size={20} />
                                <h3 className="font-black text-slate-900">Lịch sử giao dịch</h3>
                            </div>
                        </div>

                        {!wallet?.transactions || wallet.transactions.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 py-20 flex flex-col items-center">
                                <ArrowRightLeft size={40} className="text-slate-200 mb-3" />
                                <p className="text-slate-400 font-bold">Chưa có giao dịch nào phát sinh</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
                                {wallet.transactions.map((t, idx) => (
                                    <div key={t.id} className={`p-5 flex items-center justify-between hover:bg-slate-50 transition-all ${idx !== wallet.transactions.length - 1 ? 'border-bottom border-slate-50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            {getTransactionIcon(t.type)}
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{getTransactionLabel(t.type)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-2">
                                                    <Calendar size={10} /> 
                                                    {new Date(t.created_at).toLocaleString('vi-VN')}
                                                    {t.booking?.service?.name && <span className="text-emerald-500 ml-1">• {t.booking.service.name}</span>}
                                                </p>
                                                {t.note && <p className="text-[10px] text-slate-400 italic mt-0.5">{t.note}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-base font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.amount >= 0 ? '+' : ''}{formatPrice(t.amount)}
                                            </p>
                                            <p className="text-[10px] text-slate-300 font-medium">Số dư: {formatPrice(t.balance_after)}</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-4 bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-all">Xem tất cả giao dịch</button>
                            </div>
                        )}
                    </div>

                    {/* Chart / Report */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <TrendingUp className="text-emerald-500" size={20} />
                            <h3 className="font-black text-slate-900">Tăng trưởng 6 tháng</h3>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm min-h-[400px]">
                            {report.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                                    <TrendingUp size={48} className="mb-2" />
                                    <p className="text-xs font-bold">Chưa đủ dữ liệu biểu đồ</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {report.map(r => (
                                        <div key={r.month} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                                                <span>Tháng {r.month.split('-')[1]}</span>
                                                <span className="text-slate-900">{formatPrice(r.total)}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                                    style={{ width: `${Math.min(100, (r.total / Math.max(...report.map(x => x.total))) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-8 pt-6 border-t border-dashed">
                                        <p className="text-[10px] text-slate-400 font-medium text-center italic">Biểu đồ tự động cập nhật dựa trên dữ liệu thanh toán thực tế hàng tháng.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`.border-bottom { border-bottom: 1px solid #f8fafc; }`}</style>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Send size={18} className="text-slate-600" /> Yêu cầu rút tiền
                            </h3>
                            <button onClick={() => setShowWithdrawModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm">
                                <p className="text-slate-500">Số dư khả dụng: <span className="text-emerald-700 font-black">{formatPrice(walletObj.balance)}</span></p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Số tiền rút (VNĐ) *</label>
                                <input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                                    placeholder="Tối thiểu 10,000đ"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tên ngân hàng *</label>
                                <input type="text" value={withdrawForm.bank_name} onChange={e => setWithdrawForm(f => ({ ...f, bank_name: e.target.value }))}
                                    placeholder="VD: Vietcombank, MB Bank..."
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Số tài khoản *</label>
                                <input type="text" value={withdrawForm.bank_account_number} onChange={e => setWithdrawForm(f => ({ ...f, bank_account_number: e.target.value }))}
                                    placeholder="Số tài khoản ngân hàng"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tên chủ tài khoản *</label>
                                <input type="text" value={withdrawForm.bank_account_name} onChange={e => setWithdrawForm(f => ({ ...f, bank_account_name: e.target.value }))}
                                    placeholder="NGUYEN VAN A"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
                            </div>
                            <p className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl">Admin sẽ xét duyệt và chuyển khoản trong vòng <strong>1-3 ngày làm việc</strong>.</p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowWithdrawModal(false)}
                                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50">
                                Hủy
                            </button>
                            <button onClick={handleWithdraw} disabled={withdrawLoading}
                                className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
                                {withdrawLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-[slideInUp_0.3s_ease-out] ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-bold">{toast.message}</p>
                </div>
            )}

            <style>{`
                .border-bottom { border-bottom: 1px solid #f8fafc; }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default MyWallet;
