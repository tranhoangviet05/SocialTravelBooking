import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, ArrowUp, Gift, Loader2, ChevronRight, Check, Trash2, ToggleLeft, ToggleRight, Info, Sparkles, Percent } from 'lucide-react';
import providerApi from '../../api/providerApi';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n ?? 0) + 'đ';

const UpsellManager = ({ onClose, showToast }) => {
    const [upsells, setUpsells] = useState([]);
    const [services, setServices] = useState([]); // tự load kèm room_types
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const initialForm = {
        service_id: '',           // Khách sạn được chọn (cùng dùng cho trigger & target)
        trigger_room_type_id: '', // Loại phòng nhỏ (điều kiện kích hoạt)
        trigger_quantity: 2,      // Số phòng nhỏ phải đặt
        target_room_type_id: '',  // Loại phòng lớn hơn (đề xuất nâng cấp)
        perk_service_id: '',      // Dịch vụ đi kèm (xe, tour...)
        perk_discount_percent: 100,
        description: '',
        is_active: true
    };
    const [form, setForm] = useState(initialForm);

    // Khách sạn được chọn
    const selectedService = useMemo(() => services.find(s => s.id === form.service_id), [services, form.service_id]);
    const roomTypes = useMemo(() => selectedService?.room_types ?? [], [selectedService]);

    // Loại phòng đang chọn
    const triggerRT = useMemo(() => roomTypes.find(rt => rt.id === form.trigger_room_type_id), [roomTypes, form.trigger_room_type_id]);
    const targetRT  = useMemo(() => roomTypes.find(rt => rt.id === form.target_room_type_id),  [roomTypes, form.target_room_type_id]);

    // Tính toán giá preview
    const preview = useMemo(() => {
        const originalTotal = Number(triggerRT?.base_price ?? 0) * Number(form.trigger_quantity || 1);
        const upgradePrice  = Number(targetRT?.base_price ?? 0);
        const diff = upgradePrice - originalTotal;
        const perkBase = Number(services.find(s => s.id === form.perk_service_id)?.base_price ?? 0);
        const perkSaved = perkBase * (Number(form.perk_discount_percent) / 100);
        return { originalTotal, upgradePrice, diff, perkBase, perkSaved };
    }, [triggerRT, targetRT, form.trigger_quantity, form.perk_service_id, form.perk_discount_percent, services]);

    useEffect(() => {
        Promise.all([fetchUpsells(), fetchServices()]);
    }, []);

    const fetchServices = async () => {
        try {
            const res = await providerApi.getServicesWithRooms();
            if (res.success) {
                console.log("UpsellManager: Loaded services:", res.data);
                setServices(res.data);
            }
        } catch (err) {
            console.error('Fetch services error:', err);
        }
    };

    const fetchUpsells = async () => {
        try {
            const res = await providerApi.getUpsells();
            if (res.success) setUpsells(res.data);
        } catch (err) {
            console.error('Fetch upsells error:', err);
        } finally { setLoading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.trigger_room_type_id || !form.target_room_type_id) {
            return showToast('Vui lòng chọn đủ loại phòng kích hoạt và loại phòng nâng cấp', 'error');
        }
        if (form.trigger_room_type_id === form.target_room_type_id) {
            return showToast('Loại phòng kích hoạt và nâng cấp phải khác nhau', 'error');
        }
        setSaving(true);
        try {
            // Gửi cả trigger_service_id = target_service_id = service_id
            const payload = {
                ...form,
                trigger_service_id: form.service_id,
                target_service_id:  form.service_id,
            };
            const res = await providerApi.storeUpsell(payload);
            if (res.success) {
                showToast('Đã lưu chiến dịch Upsell!');
                fetchUpsells();
                setShowForm(false);
                setForm(initialForm);
            } else {
                showToast(res.message || 'Lỗi khi lưu', 'error');
            }
        } catch { showToast('Lỗi kết nối máy chủ', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa chiến dịch này?')) return;
        try {
            await providerApi.deleteUpsell(id);
            showToast('Đã xóa chiến dịch');
            setUpsells(prev => prev.filter(u => u.id !== id));
        } catch { showToast('Lỗi khi xóa', 'error'); }
    };

    const perkService = useMemo(() => services.find(s => s.id === form.perk_service_id), [services, form.perk_service_id]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                <ArrowUp className="text-white" size={22} />
                            </span>
                            Chiến dịch Nâng cấp Phòng (Upsell)
                        </h3>
                        <p className="text-slate-400 text-sm mt-1 ml-[52px]">Khi khách đặt nhiều phòng nhỏ → gợi ý 1 phòng lớn hơn + tặng kèm ưu đãi.</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={22} /></button>
                </div>

                <div className="flex-1 overflow-hidden flex min-h-0">

                    {/* LEFT: Danh sách chiến dịch */}
                    <div className="flex-1 overflow-y-auto p-8 border-r border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách chiến dịch ({upsells.length})</h4>
                            <button onClick={() => { setShowForm(true); setForm(initialForm); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20">
                                <Plus size={14} /> Tạo mới
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={36} /></div>
                        ) : upsells.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Sparkles size={44} className="mx-auto mb-4 text-slate-200" />
                                <p className="text-slate-400 font-bold">Chưa có chiến dịch nào.</p>
                                <button onClick={() => setShowForm(true)} className="mt-3 text-indigo-600 font-black text-sm hover:underline">Tạo ngay!</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upsells.map(up => (
                                    <div key={up.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${up.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {up.is_active ? '● Đang chạy' : '○ Đã tắt'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">{up.trigger_service?.name}</span>
                                            </div>
                                            <button onClick={() => handleDelete(up.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-slate-300 hover:text-rose-500">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>

                                        {/* Trigger → Target Room Types */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Đặt ≥ {up.trigger_quantity} phòng</p>
                                                <p className="text-sm font-black text-slate-700">{up.trigger_room_type?.name ?? 'Tất cả'}</p>
                                                {up.trigger_room_type?.base_price && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{fmt(up.trigger_room_type.base_price)}/đêm</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <ChevronRight size={18} className="text-indigo-300" />
                                                <span className="text-[9px] text-indigo-300 font-bold">Nâng cấp</span>
                                            </div>
                                            <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-center">
                                                <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">1 phòng cao cấp</p>
                                                <p className="text-sm font-black text-indigo-700">{up.target_room_type?.name ?? '---'}</p>
                                                {up.target_room_type?.base_price && (
                                                    <p className="text-[10px] text-indigo-400 mt-0.5">{fmt(up.target_room_type.base_price)}/đêm</p>
                                                )}
                                            </div>
                                        </div>

                                        {up.perk_service && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Gift size={13} className="text-amber-500" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-600">
                                                    <span className="text-amber-600">{up.perk_discount_percent === 100 ? 'Miễn phí' : `Giảm ${up.perk_discount_percent}%`}</span> — {up.perk_service.name}
                                                </p>
                                            </div>
                                        )}
                                        {up.description && <p className="mt-2 text-[11px] text-slate-400 italic">{up.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Form */}
                    <div className={`w-full md:w-[420px] flex-shrink-0 overflow-y-auto transition-opacity duration-300 ${showForm ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="p-8">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Thiết lập chiến dịch</h4>

                            <form onSubmit={handleSave} className="space-y-5">

                                {/* ── 1. CHỌN KHÁCH SẠN ── */}
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Khách sạn áp dụng</p>
                                    <select
                                        required
                                        value={form.service_id}
                                        onChange={e => setForm({ ...initialForm, service_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="">-- Chọn khách sạn / homestay --</option>
                                        {services.filter(s => ['hotel','homestay'].includes(s.type)).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {selectedService && roomTypes.length === 0 && (
                                        <p className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-2 rounded-xl">
                                            ⚠️ Khách sạn này chưa có loại phòng nào. Hãy thêm loại phòng trước.
                                        </p>
                                    )}
                                </div>

                                {/* ── 2. ĐIỀU KIỆN KÍCH HOẠT ── */}
                                {selectedService && roomTypes.length > 0 && (
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Điều kiện kích hoạt</p>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 ml-1">Loại phòng nhỏ (điều kiện) *</label>
                                            <select
                                                required
                                                value={form.trigger_room_type_id}
                                                onChange={e => setForm({ ...form, trigger_room_type_id: e.target.value, target_room_type_id: '' })}
                                                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold outline-none"
                                            >
                                                <option value="">-- Chọn loại phòng --</option>
                                                {roomTypes.map(rt => (
                                                    <option key={rt.id} value={rt.id}>
                                                        🛏️ {rt.name}{rt.base_price ? ` — ${fmt(rt.base_price)}/đêm` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 ml-1">Số phòng phải đặt (tối thiểu) *</label>
                                            <input
                                                type="number" min="2" required
                                                value={form.trigger_quantity}
                                                onChange={e => setForm({ ...form, trigger_quantity: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
                                                placeholder="VD: 2"
                                            />
                                            {triggerRT && (
                                                <p className="text-[11px] text-slate-500 mt-1 ml-1">
                                                    Khách đặt {form.trigger_quantity} × <span className="font-bold">{triggerRT.name}</span> = <span className="font-black text-slate-700">{fmt(preview.originalTotal)}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Arrow */}
                                {form.trigger_room_type_id && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-indigo-100" />
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                            <ArrowUp size={16} className="text-white" />
                                        </div>
                                        <div className="flex-1 h-px bg-indigo-100" />
                                    </div>
                                )}

                                {/* ── 3. LOẠI PHÒNG NÂNG CẤP ── */}
                                {form.trigger_room_type_id && (
                                    <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">3. Phòng nâng cấp (Target)</p>

                                        <div>
                                            <label className="block text-[10px] font-bold text-indigo-500 mb-1.5 ml-1">Chọn loại phòng cao cấp hơn *</label>
                                            <select
                                                required
                                                value={form.target_room_type_id}
                                                onChange={e => setForm({ ...form, target_room_type_id: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border-2 border-indigo-500 rounded-xl text-sm font-black outline-none"
                                            >
                                                <option value="">-- Chọn phòng VIP / Suite... --</option>
                                                {roomTypes
                                                    .filter(rt => rt.id !== form.trigger_room_type_id)
                                                    .map(rt => (
                                                        <option key={rt.id} value={rt.id}>
                                                            ✨ {rt.name}{rt.base_price ? ` — ${fmt(rt.base_price)}/đêm` : ''}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        {/* Preview chênh lệch giá */}
                                        {triggerRT && targetRT && (
                                            <div className={`rounded-xl p-3 text-xs font-bold flex items-start gap-2 ${preview.diff <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                <Info size={14} className="flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p>Thay vì đặt <strong>{form.trigger_quantity} phòng {triggerRT.name}</strong> ({fmt(preview.originalTotal)})</p>
                                                    <p className="mt-0.5">→ Nâng cấp <strong>1 phòng {targetRT.name}</strong> ({fmt(preview.upgradePrice)})</p>
                                                    <p className="mt-1 font-black">
                                                        {preview.diff <= 0
                                                            ? `✅ Khách tiết kiệm ${fmt(Math.abs(preview.diff))}`
                                                            : `📈 Khách trả thêm ${fmt(preview.diff)}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── 4. PERK ── */}
                                {form.target_room_type_id && (
                                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <Gift size={11} /> 4. Ưu đãi đi kèm (không bắt buộc)
                                        </p>

                                        <select
                                            value={form.perk_service_id}
                                            onChange={e => setForm({ ...form, perk_service_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm font-bold outline-none"
                                        >
                                            <option value="">-- Không có ưu đãi --</option>
                                            {services.filter(s => !['hotel','homestay'].includes(s.type)).map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.type === 'vehicle' ? '🚗' : '🗺️'} {s.name} — {fmt(s.base_price)}
                                                </option>
                                            ))}
                                        </select>

                                        {form.perk_service_id && (
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                                    <Percent size={10} /> Mức giảm giá (100 = Miễn phí)
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="range" min="0" max="100" step="10"
                                                        value={form.perk_discount_percent}
                                                        onChange={e => setForm({ ...form, perk_discount_percent: Number(e.target.value) })}
                                                        className="flex-1 accent-amber-500"
                                                    />
                                                    <span className="w-14 text-center px-2 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-black">
                                                        {form.perk_discount_percent === 100 ? 'Free' : `${form.perk_discount_percent}%`}
                                                    </span>
                                                </div>
                                                {perkService && (
                                                    <p className="text-[11px] text-amber-700 font-bold">
                                                        {fmt(perkService.base_price)} → Khách trả: <span className="font-black">
                                                            {form.perk_discount_percent === 100 ? 'Miễn phí' : fmt(perkService.base_price * (1 - form.perk_discount_percent / 100))}
                                                        </span>
                                                        {preview.perkSaved > 0 && <span className="text-emerald-600"> (tiết kiệm {fmt(preview.perkSaved)})</span>}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── 5. GHI CHÚ & TRẠNG THÁI ── */}
                                {form.target_room_type_id && (
                                    <>
                                        <textarea
                                            rows={2}
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none outline-none"
                                            placeholder="Ghi chú chiến dịch... (tùy chọn)"
                                        />

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div
                                                className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600">
                                                {form.is_active ? 'Kích hoạt ngay' : 'Lưu nháp'}
                                            </span>
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                        >
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                            Lưu chiến dịch
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpsellManager;
