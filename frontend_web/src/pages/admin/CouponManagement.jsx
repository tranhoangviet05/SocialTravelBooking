import React, { useState, useEffect } from 'react';
import {
    Ticket,
    Plus,
    Calendar,
    Percent,
    Trash2,
    Search,
    Loader2,
    X,
    CheckCircle2,
    AlertCircle,
    Edit3,
    DollarSign,
    RotateCw,
    Users,
    Lock,
    Globe
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import TableSkeleton from '../../components/common/TableSkeleton';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';

const CouponManagement = () => {
    const { coupons, fetchCoupons, loadingStates, addCoupon, updateCoupon, removeCoupon } = useAdminData();
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ isOpen: false, coupon: null });
    const [formData, setFormData] = useState({
        code: '',
        type: 'percent',
        discount_value: '',
        min_order_amount: '',
        usage_limit: '',
        valid_from: '',
        valid_until: '',
        is_public: true,
        max_discount: '',
        assigned_users: []
    });
    const [backgroundTasks, setBackgroundTasks] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    const toast = useNotification();

    useEffect(() => {
        fetchCoupons(false, 1, { search: searchTerm });
        // Fetch users for assignment
        adminApi.getAllUsers({ limit: 1000 }).then(res => {
            if (res.success && res.data && res.data.data) {
                setAllUsers(res.data.data.filter(u => u.role === 'tourist'));
            }
        }).catch(err => console.error(err));
    }, [fetchCoupons]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCoupons(true, 1, { search: searchTerm });
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setModal({ isOpen: true, coupon });
            setFormData({
                code: coupon.code,
                type: coupon.type,
                discount_value: coupon.discount_value,
                min_order_amount: coupon.min_order_amount || '',
                usage_limit: coupon.usage_limit || '',
                valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
                valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
                is_public: coupon.is_public ?? true,
                max_discount: coupon.max_discount || '',
                assigned_users: coupon.users ? coupon.users.map(u => u.id) : []
            });
        } else {
            setModal({ isOpen: true, coupon: null });
            setFormData({
                code: '',
                type: 'percent',
                discount_value: '',
                min_order_amount: '',
                usage_limit: '',
                valid_from: '',
                valid_until: '',
                is_public: true,
                max_discount: '',
                assigned_users: []
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let response;
            if (modal.coupon) {
                response = await adminApi.updateCoupon(modal.coupon.id, formData);
                if (response.success) {
                    toast?.success?.('Cập nhật thành công');
                    updateCoupon(response.data);
                }
            } else {
                response = await adminApi.createCoupon(formData);
                if (response.success) {
                    toast?.success?.('Tạo mới thành công');
                    addCoupon(response.data);
                }
            }

            if (response.success) {
                setModal({ isOpen: false, coupon: null });
            }
        } catch (error) {
            console.error('Coupon save error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast?.error?.(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
        
        setBackgroundTasks(prev => ({ ...prev, [id]: 'deleting' }));
        const originalCoupon = coupons.find(c => c.id === id);
        removeCoupon(id);

        try {
            const response = await adminApi.deleteCoupon(id);
            if (response.success) {
                toast?.success?.('Đã xóa mã giảm giá');
            }
        } catch (error) {
            console.error('Delete coupon error:', error);
            toast?.error?.('Không thể xóa mã giảm giá');
            // Rollback
            if (originalCoupon) addCoupon(originalCoupon);
        } finally {
            setBackgroundTasks(prev => {
                const newTasks = { ...prev };
                delete newTasks[id];
                return newTasks;
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Number(amount).toLocaleString('vi-VN') + '₫';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Vô thời hạn';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const toggleUserSelection = (userId) => {
        setFormData(prev => {
            const current = prev.assigned_users || [];
            if (current.includes(userId)) {
                return { ...prev, assigned_users: current.filter(id => id !== userId) };
            } else {
                return { ...prev, assigned_users: [...current, userId] };
            }
        });
    };

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mã giảm giá</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các chiến dịch khuyến mãi và ưu đãi.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Tạo mã mới
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo mã code..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchCoupons()}
                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={20} />
                        </button>
                    </div>
                </div>

                {loadingStates.coupons ? (
                    <TableSkeleton columns={6} rows={8} />
                ) : (
                    <AdminTable
                        headers={['Mã', 'Loại', 'Giá trị', 'Đơn tối thiểu', 'Hạn dùng', 'Lượt dùng', '']}
                        title="Tất cả mã giảm giá"
                        description={`Hiện có ${coupons.length} mã đang hoạt động.`}
                    >
                        {coupons.length > 0 ? coupons.map((c) => {
                            const isDeleting = backgroundTasks[c.id] === 'deleting';
                            return (
                                <tr key={c.id} className={`hover:bg-gray-50/50 transition-colors group relative ${isDeleting ? 'optimistic-updating' : ''}`}>
                                    <td className="px-8 py-5">
                                        {isDeleting ? (
                                            <div className="optimistic-adding-text text-[10px] font-bold uppercase text-rose-500">Đang xóa...</div>
                                        ) : (
                                            <span className="font-mono text-sm font-black text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100">{c.code}</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {c.type === 'percent' ? (
                                            <div className="flex items-center gap-1.5 text-sky-500">
                                                <Percent size={14} /> Phần trăm
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-emerald-500">
                                                <DollarSign size={14} /> Cố định
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-slate-900">
                                                {c.type === 'percent' ? `${c.discount_value}%` : formatCurrency(c.discount_value)}
                                            </span>
                                            {!c.is_public && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full w-fit">
                                                    <Lock size={10} /> Ưu đãi riêng ({c.users?.length || 0})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-bold text-slate-600">{formatCurrency(c.min_order_amount || 0)}</span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-500">
                                        <div className="flex flex-col gap-0.5">
                                            <span>Từ: {formatDate(c.valid_from)}</span>
                                            <span>Đến: {formatDate(c.valid_until)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.min((c.used_count / (c.usage_limit || 1)) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">{c.used_count}/{c.usage_limit || '∞'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleOpenModal(c)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Sửa"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} className="px-8 py-10 text-center text-slate-400 font-bold">
                                    Chưa có mã giảm giá nào
                                </td>
                            </tr>
                        )}
                    </AdminTable>
                )}

                {/* Modal */}
                {modal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                        {modal.coupon ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới'}
                                    </h3>
                                    <button type="button" onClick={() => setModal({ isOpen: false, coupon: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mã Code (In hoa, viết liền)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                            placeholder="VÍ DỤ: GIAM50K"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Loại hình</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                            >
                                                <option value="percent">Phần trăm (%)</option>
                                                <option value="fixed">Cố định (₫)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Giá trị giảm</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.discount_value}
                                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none"
                                                placeholder={formData.type === 'percent' ? '5, 10, 15...' : '50000, 100000...'}
                                            />
                                        </div>
                                    </div>

                                    {formData.type === 'percent' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mức giảm tối đa (Tùy chọn)</label>
                                            <input
                                                type="number"
                                                value={formData.max_discount}
                                                onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                                placeholder="Ví dụ: 100000 (Để trống nếu không giới hạn)"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Đơn tối thiểu</label>
                                            <input
                                                type="number"
                                                value={formData.min_order_amount}
                                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                                placeholder="0 (Không giới hạn)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Giới hạn lượt dùng</label>
                                            <input
                                                type="number"
                                                value={formData.usage_limit}
                                                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                                placeholder="Bỏ trống nếu không hạn chế"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Từ ngày</label>
                                            <input
                                                type="date"
                                                value={formData.valid_from}
                                                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Đến ngày</label>
                                            <input
                                                type="date"
                                                value={formData.valid_until}
                                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2 border-t border-gray-100">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block">Hình thức cung cấp</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_public: true })}
                                                className={`flex items-center gap-2 p-4 rounded-2xl border-2 transition-all ${formData.is_public ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <Globe size={18} />
                                                <div className="text-left">
                                                    <div className="font-bold text-sm">Công khai</div>
                                                    <div className="text-[10px] opacity-80 mt-0.5">Ai cũng có thể dùng</div>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_public: false })}
                                                className={`flex items-center gap-2 p-4 rounded-2xl border-2 transition-all ${!formData.is_public ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <Lock size={18} />
                                                <div className="text-left">
                                                    <div className="font-bold text-sm">Riêng tư</div>
                                                    <div className="text-[10px] opacity-80 mt-0.5">Chỉ cấp cho User được chọn</div>
                                                </div>
                                            </button>
                                        </div>
                                        
                                        {!formData.is_public && (
                                            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                                <label className="text-xs font-black text-slate-700 mb-3 flex items-center gap-2">
                                                    <Users size={14} className="text-rose-500" /> Chọn khách hàng được nhận mã:
                                                </label>
                                                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                                                    {allUsers.length === 0 ? (
                                                        <div className="text-xs text-slate-400 italic text-center py-2">Không có khách hàng nào.</div>
                                                    ) : (
                                                        allUsers.map(u => (
                                                            <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                                                                    checked={formData.assigned_users?.includes(u.id)}
                                                                    onChange={() => toggleUserSelection(u.id)}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-bold text-sm text-slate-800 truncate">{u.display_name || u.full_name}</div>
                                                                    <div className="text-xs text-slate-500 truncate">{u.email}</div>
                                                                </div>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="mt-2 text-xs font-bold text-rose-600">Đã chọn {formData.assigned_users?.length || 0} người</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setModal({ isOpen: false, coupon: null })}
                                        className="flex-1 py-4 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : (modal.coupon ? <CheckCircle2 size={16} /> : <Plus size={16} />)}
                                        {modal.coupon ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CouponManagement;
