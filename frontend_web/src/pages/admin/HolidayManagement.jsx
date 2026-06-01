import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Plus,
    Trash2,
    Edit2,
    X,
    Save,
    Loader2,
    AlertTriangle,
    Flag,
    Ban,
    CheckCircle2,
    Info,
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const TYPE_CONFIG = {
    national_holiday: {
        label: 'Ngày lễ quốc gia',
        color: 'bg-blue-50 text-blue-600 border-blue-100',
        dot: 'bg-blue-500',
        icon: Flag,
    },
    national_mourning: {
        label: 'Quốc tang',
        color: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-500',
        icon: Ban,
    },
    emergency: {
        label: 'Khẩn cấp',
        color: 'bg-rose-50 text-rose-600 border-rose-100',
        dot: 'bg-rose-500',
        icon: AlertTriangle,
    },
    other: {
        label: 'Khác',
        color: 'bg-gray-50 text-gray-600 border-gray-200',
        dot: 'bg-gray-400',
        icon: Info,
    },
};

const EMPTY_FORM = {
    date: '',
    name: '',
    type: 'national_holiday',
    description: '',
    is_block_booking: false,
};

const HolidayManagement = () => {
    const toast = useNotification();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [showModal, setShowModal] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        fetchHolidays();
    }, [year]);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getHolidays(year);
            if (res.success) setHolidays(res.data);
        } catch (e) {
            toast?.error?.('Lỗi khi tải danh sách ngày lễ');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingHoliday(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (holiday) => {
        setEditingHoliday(holiday);
        setForm({
            date: holiday.date,
            name: holiday.name,
            type: holiday.type,
            description: holiday.description || '',
            is_block_booking: holiday.is_block_booking,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.date || !form.name) {
            toast?.error?.('Vui lòng điền đầy đủ ngày và tên');
            return;
        }
        setSaving(true);
        try {
            let res;
            if (editingHoliday) {
                res = await adminApi.updateHoliday(editingHoliday.id, form);
            } else {
                res = await adminApi.createHoliday(form);
            }
            if (res.success) {
                toast?.success?.(editingHoliday ? 'Đã cập nhật ngày lễ' : 'Đã thêm ngày lễ mới');
                setShowModal(false);
                fetchHolidays();
            }
        } catch (e) {
            const msg = e?.response?.data?.message || 'Có lỗi xảy ra';
            toast?.error?.(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa ngày lễ này?')) return;
        setDeletingId(id);
        try {
            const res = await adminApi.deleteHoliday(id);
            if (res.success) {
                toast?.success?.('Đã xóa ngày lễ');
                setHolidays(prev => prev.filter(h => h.id !== id));
            }
        } catch (e) {
            toast?.error?.('Lỗi khi xóa');
        } finally {
            setDeletingId(null);
        }
    };

    const blockedCount = holidays.filter(h => h.is_block_booking).length;
    const displayCount = holidays.filter(h => !h.is_block_booking).length;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ngày Lễ & Ngày Đặc Biệt</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        Quản lý ngày nghỉ lễ quốc gia, quốc tang và các ngày đặc biệt ảnh hưởng đến đặt chỗ.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Year picker */}
                    <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Thêm ngày lễ
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Tổng ngày đặc biệt', value: holidays.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Calendar },
                    { label: 'Chặn đặt chỗ', value: blockedCount, color: 'text-rose-600', bg: 'bg-rose-50', icon: Ban },
                    { label: 'Chỉ hiển thị', value: displayCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-7 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-3xl font-black text-slate-900 tabular-nums">{s.value}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                            <s.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <AdminTable
                headers={['Ngày', 'Tên sự kiện', 'Loại', 'Ảnh hưởng đặt chỗ', 'Mô tả', '']}
                title="Danh sách ngày lễ"
                description={`Năm ${year} — Các ngày lễ ảnh hưởng đến lịch đặt dịch vụ.`}
            >
                {loading ? (
                    <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                            <p className="text-slate-400 font-bold">Đang tải...</p>
                        </td>
                    </tr>
                ) : holidays.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200 text-gray-300">
                                <Calendar size={32} />
                            </div>
                            <p className="text-slate-400 font-bold italic">Chưa có ngày lễ nào trong năm {year}.</p>
                            <button onClick={openCreate} className="mt-4 text-indigo-500 font-bold text-sm hover:underline">
                                + Thêm ngày lễ đầu tiên
                            </button>
                        </td>
                    </tr>
                ) : (
                    holidays.map(h => {
                        const cfg = TYPE_CONFIG[h.type] || TYPE_CONFIG.other;
                        const TypeIcon = cfg.icon;
                        const isDeleting = deletingId === h.id;
                        return (
                            <tr key={h.id} className="group hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0">
                                {/* Ngày */}
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-center">
                                            <span className="text-[10px] font-black text-indigo-600 leading-tight">
                                                {new Date(h.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="text-xs font-black text-slate-500 tabular-nums">
                                            {new Date(h.date).getFullYear()}
                                        </span>
                                    </div>
                                </td>
                                {/* Tên */}
                                <td className="px-8 py-5">
                                    <p className="text-sm font-black text-slate-900">{h.name}</p>
                                </td>
                                {/* Loại */}
                                <td className="px-8 py-5">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border w-fit ${cfg.color}`}>
                                        <TypeIcon size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{cfg.label}</span>
                                    </div>
                                </td>
                                {/* Block */}
                                <td className="px-8 py-5">
                                    {h.is_block_booking ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-rose-50 text-rose-600 border-rose-100 w-fit">
                                            <Ban size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Chặn đặt chỗ</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-100 w-fit">
                                            <CheckCircle2 size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Vẫn mở đặt</span>
                                        </div>
                                    )}
                                </td>
                                {/* Mô tả */}
                                <td className="px-8 py-5 max-w-[200px]">
                                    <p className="text-xs text-slate-400 font-medium truncate italic">{h.description || '—'}</p>
                                </td>
                                {/* Actions */}
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <button
                                            onClick={() => openEdit(h)}
                                            className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-90"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(h.id)}
                                            disabled={isDeleting}
                                            className="p-2.5 bg-white text-slate-400 hover:text-rose-600 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-90"
                                            title="Xóa"
                                        >
                                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </AdminTable>

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 space-y-6">
                        {/* Modal header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {editingHoliday ? 'Chỉnh sửa ngày lễ' : 'Thêm ngày lễ mới'}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium mt-0.5">
                                    Điền thông tin ngày đặc biệt hoặc ngày lễ quốc gia
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Date */}
                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Ngày *</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Tên sự kiện *</label>
                                <input
                                    type="text"
                                    placeholder="VD: Quốc khánh 2/9, Tết Nguyên Đán..."
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Loại ngày lễ</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(TYPE_CONFIG).map(([value, cfg]) => {
                                        const Icon = cfg.icon;
                                        const active = form.type === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, type: value }))}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-bold text-sm transition-all ${
                                                    active
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                                        : 'bg-gray-50 text-slate-600 border-gray-200 hover:border-indigo-200'
                                                }`}
                                            >
                                                <Icon size={14} />
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Mô tả thêm</label>
                                <textarea
                                    placeholder="Ghi chú thêm về ngày lễ này..."
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all resize-none"
                                />
                            </div>

                            {/* Block booking toggle */}
                            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                form.is_block_booking ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div>
                                    <p className="font-black text-sm text-slate-800">Chặn đặt chỗ</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {form.is_block_booking
                                            ? '🔴 Khách hàng KHÔNG thể đặt vào ngày này'
                                            : '🟢 Khách hàng vẫn có thể đặt bình thường'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, is_block_booking: !f.is_block_booking }))}
                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                                        form.is_block_booking ? 'bg-rose-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                                        form.is_block_booking ? 'left-6' : 'left-0.5'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-slate-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingHoliday ? 'Lưu thay đổi' : 'Thêm ngày lễ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayManagement;
