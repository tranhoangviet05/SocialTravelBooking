import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import echo from '../../utils/echo';
import {
    Wallet, Send, CheckCircle, AlertCircle, RotateCw,
    ArrowUpRight, ArrowDownLeft, Clock, History, Banknote, X, Check
} from 'lucide-react';
import bookingApi from '../../api/bookingApi';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

const StatusBadge = ({ status }) => {
    const map = {
        pending: { cls: 'bg-amber-100 text-amber-700', label: 'Đang chờ' },
        approved: { cls: 'bg-emerald-100 text-emerald-700', label: 'Đã duyệt' },
        rejected: { cls: 'bg-rose-100 text-rose-700', label: 'Từ chối' },
    };
    const { cls, label } = map[status] || map.pending;
    return <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${cls}`}>{label}</span>;
};

const WalletManagement = () => {
    const { currentUser } = useAuth();
    const [walletData, setWalletData] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'reject', id }
    const [adminNote, setAdminNote] = useState('');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletRes, withdrawRes] = await Promise.all([
                bookingApi.getAdminWallet(),
                bookingApi.getAdminWithdrawalRequests(activeTab === 'all' ? undefined : activeTab),
            ]);
            if (walletRes.success) setWalletData(walletRes.data);
            if (withdrawRes.success) setWithdrawals(withdrawRes.data?.data || withdrawRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    // Realtime: update when wallet changes
    useEffect(() => {
        if (!currentUser) return;
        const channel = echo.private(`User.${currentUser.id}`);
        channel.listen('.WalletUpdated', (e) => {
            showToast('Số dư hệ thống vừa cập nhật!', 'success');
            fetchData();
        });
        return () => channel.stopListening('.WalletUpdated');
    }, [currentUser]);

    const handleApprove = async () => {
        try {
            const res = await bookingApi.approveWithdrawal(actionModal.id, adminNote || 'Đã chuyển khoản thành công.');
            if (res.success) {
                showToast('Đã duyệt yêu cầu rút tiền.', 'success');
                setActionModal(null);
                setAdminNote('');
                fetchData();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
        }
    };

    const handleReject = async () => {
        if (!adminNote) { showToast('Vui lòng nhập lý do từ chối.', 'error'); return; }
        try {
            const res = await bookingApi.rejectWithdrawal(actionModal.id, adminNote);
            if (res.success) {
                showToast('Đã từ chối yêu cầu.', 'success');
                setActionModal(null);
                setAdminNote('');
                fetchData();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
        }
    };

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'pending', label: 'Chờ duyệt' },
        { id: 'approved', label: 'Đã duyệt' },
        { id: 'rejected', label: 'Từ chối' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Quản lý Ví & Thanh toán</h2>
                    <p className="text-slate-400 text-sm mt-1">Theo dõi dòng tiền trung gian và xử lý yêu cầu rút tiền.</p>
                </div>
                <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                    <RotateCw size={16} className="text-slate-400" />
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Wallet size={20} />
                            </div>
                            <span className="text-sm font-bold tracking-widest uppercase opacity-80">Đang giữ trung gian</span>
                        </div>
                        <h3 className="text-5xl font-black font-mono tracking-tighter mb-2">
                            {fmt(walletData?.wallet?.escrow_balance ?? 0)}
                        </h3>
                        <p className="text-white/70 text-sm">Tổng tiền khách đã chuyển vào tk thật của Admin, đang chờ thanh toán Provider.</p>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <p className="text-white/70 text-sm">Phí sàn 5% đã thu: <span className="text-white font-black">{fmt(walletData?.wallet?.balance ?? 0)}</span></p>
                        </div>
                    </div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full" />
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                    <div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Chờ rút tiền</span>
                        <h4 className="text-2xl font-black text-amber-600">{fmt(walletData?.pending_withdrawals_amount ?? 0)}</h4>
                        <p className="text-xs text-slate-400 mt-1">{walletData?.pending_withdrawals_count ?? 0} yêu cầu đang chờ xử lý</p>
                    </div>
                    <div className="border-t border-dashed border-slate-100 pt-4">
                        <p className="text-xs text-slate-400">Duyệt yêu cầu bên dưới và chuyển khoản thủ công ra ngoài.</p>
                    </div>
                </div>
            </div>

            {/* Withdrawal Requests */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <Send size={18} className="text-indigo-500" />
                    <h3 className="font-black text-slate-900">Yêu cầu rút tiền của Provider</h3>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`px-5 py-3 text-sm font-bold transition-all ${activeTab === t.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                        <RotateCw size={18} className="animate-spin" /> Đang tải...
                    </div>
                ) : withdrawals.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <Send size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="font-bold">Không có yêu cầu rút tiền nào.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {withdrawals.map(w => (
                            <div key={w.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl mt-0.5 ${w.status === 'pending' ? 'bg-amber-50 text-amber-600' : w.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <Banknote size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-slate-800 text-sm">{w.user?.display_name || 'Provider'}</span>
                                            <StatusBadge status={w.status} />
                                        </div>
                                        <p className="text-xs text-slate-500">{w.bank_name} — {w.bank_account_number} — {w.bank_account_name}</p>
                                        {w.admin_note && <p className="text-[11px] text-slate-400 italic mt-1">Ghi chú: {w.admin_note}</p>}
                                        <p className="text-[10px] text-slate-300 mt-1">{new Date(w.created_at).toLocaleString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <p className="text-lg font-black text-slate-800">{fmt(w.amount)}</p>
                                    {w.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => { setActionModal({ type: 'approve', id: w.id }); setAdminNote(''); }}
                                                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-1">
                                                <Check size={12} /> Duyệt
                                            </button>
                                            <button onClick={() => { setActionModal({ type: 'reject', id: w.id }); setAdminNote(''); }}
                                                className="px-3 py-1.5 bg-rose-100 text-rose-600 text-xs font-black rounded-xl hover:bg-rose-200 transition-all flex items-center gap-1">
                                                <X size={12} /> Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-black text-slate-800">
                                {actionModal.type === 'approve' ? '✅ Xác nhận duyệt' : '❌ Từ chối yêu cầu'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">
                                    {actionModal.type === 'approve' ? 'Ghi chú (tùy chọn)' : 'Lý do từ chối *'}
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    placeholder={actionModal.type === 'approve' ? 'Đã chuyển khoản thành công...' : 'Lý do từ chối...'}
                                    rows={3}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sky-400 resize-none"
                                />
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setActionModal(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50">Hủy</button>
                            <button
                                onClick={actionModal.type === 'approve' ? handleApprove : handleReject}
                                className={`flex-1 py-3 text-white rounded-2xl text-sm font-black ${actionModal.type === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                                {actionModal.type === 'approve' ? 'Xác nhận đã chuyển khoản' : 'Từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-bold">{toast.message}</p>
                </div>
            )}
        </div>
    );
};

export default WalletManagement;
