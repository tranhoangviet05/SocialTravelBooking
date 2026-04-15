import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Trash2, Loader2, Package, MapPin, X, Edit3,
    CheckCircle, AlertCircle, Star, Users, LayoutGrid
} from 'lucide-react';
import ProviderLayout from '../../components/provider/ProviderLayout';
import NoProviderProfile from '../../components/provider/NoProviderProfile';
import providerApi from '../../api/providerApi';

// --- Toast ---
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-[slideInUp_0.3s_ease-out] ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
};

// --- Confirm Delete Modal ---
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150]">
        <div className="bg-white rounded-3xl p-8 w-[400px] shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trash2 size={24} className="text-rose-500" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900">Xác nhận xóa</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{message}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">Hủy bỏ</button>
                <button onClick={onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all">Xóa dịch vụ</button>
            </div>
        </div>
    </div>
);

const MyServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(true);
    
    // System data
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    
    // Modals
    const [showModal, setShowModal] = useState(false); // true for both create and edit
    const [editMode, setEditMode] = useState(false);
    const [currentServiceId, setCurrentServiceId] = useState(null);
    
    const [creating, setCreating] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    
    const initialForm = {
        name: '', type: 'tour', category_id: '', location_id: '',
        base_price: '', description: '', address: '', max_guests: '', 
        price_unit: 'per_person'
    };
    const [form, setForm] = useState(initialForm);

    useEffect(() => { 
        fetchServices();
        fetchSystemData();
    }, []);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    const fetchSystemData = async () => {
        try {
            const [locRes, catRes] = await Promise.all([
                providerApi.getPublicLocations(),
                providerApi.getPublicCategories()
            ]);
            if (locRes.success) setLocations(locRes.data);
            if (catRes.success) setCategories(catRes.data);
        } catch (err) { console.error(err); }
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await providerApi.getServices();
            if (res.success) { setServices(res.data); setHasProfile(true); }
        } catch (err) {
            if (err.response?.status === 404 || err.response?.status === 403) setHasProfile(false);
            else showToast('Không thể tải danh sách dịch vụ', 'error');
        } finally { setLoading(false); }
    };

    const handleOpenCreate = () => {
        setEditMode(false);
        setForm(initialForm);
        setShowModal(true);
    };

    const handleOpenEdit = (service) => {
        setEditMode(true);
        setCurrentServiceId(service.id);
        setForm({
            name: service.name,
            type: service.type,
            category_id: service.category_id,
            location_id: service.location_id,
            base_price: service.base_price,
            description: service.description || '',
            address: service.address || '',
            max_guests: service.max_guests || '',
            price_unit: service.price_unit
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (creating) return;
        if (!form.location_id || !form.category_id) {
            showToast('Vui lòng chọn Điểm đến và Danh mục', 'error');
            return;
        }

        setCreating(true);
        try {
            const payload = {
                ...form,
                base_price: Number(form.base_price),
                category_id: Number(form.category_id),
                location_id: Number(form.location_id),
                max_guests: form.max_guests ? Number(form.max_guests) : null,
            };

            let res;
            if (editMode) {
                res = await providerApi.updateService(currentServiceId, payload);
            } else {
                res = await providerApi.createService(payload);
            }

            if (res.success) {
                showToast(editMode ? 'Cập nhật thành công! Đang chờ duyệt lại.' : 'Tạo dịch vụ thành công! Đang chờ duyệt.');
                setShowModal(false);
                fetchServices();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi xử lý yêu cầu', 'error');
        } finally { setCreating(false); }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return;
        try {
            const res = await providerApi.deleteService(confirmDelete.id);
            if (res.success) {
                setServices(services.filter(s => s.id !== confirmDelete.id));
                showToast('Đã xóa dịch vụ thành công.');
            }
        } catch { showToast('Lỗi khi xóa dịch vụ', 'error'); }
        finally { setConfirmDelete(null); }
    };

    const getStatusBadge = (status) => {
        const map = {
            active: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100', label: 'Hoạt động' },
            pending_review: { cls: 'bg-amber-50 text-amber-600 border border-amber-100', label: 'Chờ duyệt' },
            draft: { cls: 'bg-slate-100 text-slate-500 border border-slate-200', label: 'Bản nháp' },
            rejected: { cls: 'bg-rose-50 text-rose-600 border border-rose-100', label: 'Bị từ chối' },
        };
        const s = map[status] || map.draft;
        return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${s.cls}`}>{s.label}</span>;
    };

    const getTypeBadge = (type) => {
        const map = {
            tour: { cls: 'bg-blue-50 text-blue-600 border border-blue-100', label: '🗺️ Tour' },
            hotel: { cls: 'bg-purple-50 text-purple-600 border border-purple-100', label: '🏨 Khách sạn' },
            homestay: { cls: 'bg-pink-50 text-pink-600 border border-pink-100', label: '🏡 Homestay' },
            vehicle: { cls: 'bg-orange-50 text-orange-600 border border-orange-100', label: '🚌 Phương tiện' },
        };
        const t = map[type] || map.tour;
        return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${t.cls}`}>{t.label}</span>;
    };

    const typeOptions = [
        { key: 'all', label: 'Tất cả' }, { key: 'tour', label: 'Tour' },
        { key: 'hotel', label: 'Khách sạn' }, { key: 'homestay', label: 'Homestay' },
        { key: 'vehicle', label: 'Phương tiện' },
    ];

    const filteredServices = services.filter(s => {
        const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === 'all' || s.type === typeFilter;
        return matchSearch && matchType;
    });

    if (!loading && !hasProfile) {
        return (
            <ProviderLayout>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ của tôi</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các tour, khách sạn và dịch vụ bạn đang cung cấp.</p>
                    </div>
                    <NoProviderProfile onProfileCreated={() => { setHasProfile(true); fetchServices(); }} />
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ của tôi</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Quản lý các tour, khách sạn và dịch vụ bạn đang cung cấp.
                            {services.length > 0 && <span className="ml-2 text-emerald-600 font-bold">{services.length} dịch vụ</span>}
                        </p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Thêm dịch vụ
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium shadow-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {typeOptions.map(opt => (
                            <button key={opt.key} onClick={() => setTypeFilter(opt.key)}
                                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${typeFilter === opt.key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Service List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải danh sách dịch vụ...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <Package size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold mb-1">
                            {searchTerm || typeFilter !== 'all' ? 'Không tìm thấy dịch vụ phù hợp' : 'Chưa có dịch vụ nào'}
                        </p>
                        <p className="text-slate-300 text-sm">
                            {searchTerm || typeFilter !== 'all' ? 'Thử thay đổi bộ lọc' : 'Bấm "Thêm dịch vụ" để bắt đầu!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredServices.map(service => (
                            <div key={service.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {service.media?.[0]?.url ? (
                                                <img src={service.media[0].url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-black text-slate-900 truncate">{service.name}</h3>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                {getTypeBadge(service.type)}
                                                {getStatusBadge(service.status)}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                <span className="flex items-center gap-1"><MapPin size={11} /> {service.location?.name || 'Chưa xác định'}</span>
                                                <span className="flex items-center gap-1"><LayoutGrid size={11} /> {service.category?.name || 'Khác'}</span>
                                                {service.avg_rating > 0 && <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" />{service.avg_rating}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600">{Number(service.base_price).toLocaleString('vi-VN')}₫</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{service.price_unit === 'per_person' ? '/người' : '/phòng/đêm'}</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {service.status !== 'active' && (
                                                <button onClick={() => handleOpenEdit(service)}
                                                    className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Sửa thông tin">
                                                    <Edit3 size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => setConfirmDelete({ id: service.id, name: service.name })}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Xóa">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal (Combine Create & Edit) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{editMode ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                                <p className="text-slate-400 text-sm mt-0.5">Dịch vụ sẽ được Admin xét duyệt trước khi hiển thị</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên dịch vụ *</label>
                                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    placeholder="VD: Tour Đà Lạt 3N2Đ" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Loại hình *</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                        <option value="tour">🗺️ Tour du lịch</option>
                                        <option value="hotel">🏨 Khách sạn</option>
                                        <option value="homestay">🏡 Homestay</option>
                                        <option value="vehicle">🚌 Phương tiện</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Danh mục hệ thống *</label>
                                    <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Điểm đến (Hệ thống) *</label>
                                    <select required value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                        <option value="">-- Chọn địa điểm --</option>
                                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Địa chỉ chi tiết</label>
                                    <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="VD: 123 Trần Phú, TP Đà Lạt" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giá (VNĐ) *</label>
                                    <input required type="number" min="0" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="500000" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Đơn vị</label>
                                    <select value={form.price_unit} onChange={e => setForm({...form, price_unit: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                        <option value="per_person">/ người</option>
                                        <option value="per_room">/ phòng / đêm</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Số khách tối đa</label>
                                    <input type="number" min="1" value={form.max_guests} onChange={e => setForm({...form, max_guests: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="20" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả dịch vụ</label>
                                <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
                                    placeholder="Mô tả chi tiết về dịch vụ..." />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={creating}
                                    className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                                    {creating ? <><Loader2 size={16} className="animate-spin" /> ...</> : <>{editMode ? 'Cập nhật' : 'Tạo dịch vụ'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <ConfirmModal
                    message={`Bạn có chắc muốn xóa dịch vụ "${confirmDelete.name}"?`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <style>{`@keyframes slideInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </ProviderLayout>
    );
};

export default MyServices;
