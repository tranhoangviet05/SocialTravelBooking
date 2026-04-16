import React, { useState, useEffect, useRef } from 'react';
import { useProviderData } from '../../contexts/ProviderDataContext';
import {
    Plus, Search, Trash2, Loader2, Package, MapPin, X, Edit3,
    CheckCircle, AlertCircle, Star, Users, LayoutGrid, Image as ImageIcon,
    UploadCloud, Clock
} from 'lucide-react';
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

// --- Confirm Modal ---
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150]">
        <div className="bg-white rounded-3xl p-8 w-[400px] shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trash2 size={24} className="text-rose-500" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900">Xác nhận</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{message}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">Hủy</button>
                <button onClick={onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all">Đồng ý</button>
            </div>
        </div>
    </div>
);
const MyServices = () => {
    const { 
        services, locations, categories, 
        fetchServices, fetchSystemData, 
        loadingStates, 
        setServices 
    } = useProviderData();

    const loading = (loadingStates.services && services.length === 0) || (loadingStates.system && locations.length === 0);
    const [hasProfile, setHasProfile] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    
    // Modals & Forms
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentServiceId, setCurrentServiceId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Images
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef(null);

    const initialForm = {
        name: '', type: 'tour', category_id: '', location_id: '',
        base_price: '', description: '', address: '', max_guests: '', 
        price_unit: 'per_person', duration_days: '', duration_nights: ''
    };
    const [form, setForm] = useState(initialForm);
    const [toast, setToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { 
        fetchServices().catch(err => {
            if (err.response?.status === 404 || err.response?.status === 403) setHasProfile(false);
        }); 
        fetchSystemData(); 
    }, [fetchServices, fetchSystemData]);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            showToast('Bạn chỉ có thể tải lên tối đa 5 ảnh', 'error');
            return;
        }
        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newPreviews = [...previewUrls];
        if (newPreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(newPreviews[index]);
        }
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const handleOpenCreate = () => {
        setEditMode(false);
        setForm(initialForm);
        setSelectedFiles([]);
        setPreviewUrls([]);
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
            price_unit: service.price_unit,
            duration_days: service.duration_days || '',
            duration_nights: service.duration_nights || ''
        });
        setSelectedFiles([]);
        setPreviewUrls(service.media?.map(m => m.url) || []);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!form.location_id || !form.category_id) return showToast('Vui lòng chọn Điểm đến và Danh mục', 'error');

        setSubmitting(true);
        try {
            let imageUrls = previewUrls.filter(url => url.startsWith('http'));

            if (selectedFiles.length > 0) {
                const uploadRes = await providerApi.uploadFiles(selectedFiles);
                if (uploadRes.success) {
                    imageUrls = [...imageUrls, ...uploadRes.urls];
                }
            }

            const payload = {
                ...form,
                base_price: Number(form.base_price),
                category_id: Number(form.category_id),
                location_id: Number(form.location_id),
                max_guests: form.max_guests ? Number(form.max_guests) : null,
                duration_days: form.duration_days ? Number(form.duration_days) : null,
                duration_nights: form.duration_nights ? Number(form.duration_nights) : null,
                images: imageUrls
            };

            const res = editMode 
                ? await providerApi.updateService(currentServiceId, payload)
                : await providerApi.createService(payload);

            if (res.success) {
                showToast(editMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
                setShowModal(false);
                fetchServices();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi xử lý', 'error');
        } finally { setSubmitting(false); }
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await providerApi.deleteService(confirmDelete.id);
            if (res.success) {
                setServices(services.filter(s => s.id !== confirmDelete.id));
                showToast('Đã xóa dịch vụ.');
            }
        } catch { showToast('Lỗi khi xóa', 'error'); }
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

    const filteredServices = services.filter(s => {
        const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === 'all' || s.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ của tôi</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Quản lý các dịch vụ bạn đang cung cấp. {services.length > 0 && <span className="ml-2 text-emerald-600 font-bold">{services.length} dịch vụ</span>}
                        </p>
                    </div>
                    <button onClick={handleOpenCreate} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                        <Plus size={18} /> Thêm dịch vụ
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Tìm kiếm dịch vụ..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'tour', 'hotel', 'homestay', 'vehicle'].map(opt => (
                            <button key={opt} onClick={() => setTypeFilter(opt)} className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${typeFilter === opt ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'}`}>
                                {opt === 'all' ? 'Tất cả' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div> : (
                    <div className="grid gap-4">
                        {filteredServices.map(service => (
                            <div key={service.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {service.media?.[0]?.url ? <img src={service.media[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 truncate">{service.name}</h3>
                                            <div className="flex gap-2 mt-1.5">{getTypeBadge(service.type)} {getStatusBadge(service.status)}</div>
                                            <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                                                <span className="flex items-center gap-1"><MapPin size={11} /> {service.location?.name || '---'}</span>
                                                {(service.duration_days || service.duration_nights) && (
                                                    <span className="flex items-center gap-1"><Clock size={11} /> {service.duration_days}N {service.duration_nights}Đ</span>
                                                )}
                                                <span className="flex items-center gap-1"><LayoutGrid size={11} /> {service.category?.name || '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600">{Number(service.base_price).toLocaleString()}₫</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{service.price_unit === 'per_person' ? '/người' : '/phòng'}</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            {service.status !== 'active' && <button onClick={() => handleOpenEdit(service)} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"><Edit3 size={16} /></button>}
                                            <button onClick={() => setConfirmDelete({ id: service.id, name: service.name })} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-[2.5rem] p-8 w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900">{editMode ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Hình ảnh dịch vụ (Tối đa 5 ảnh)</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border bg-slate-50 group">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {previewUrls.length < 5 && (
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                                            <UploadCloud size={24} />
                                            <span className="text-[10px] font-bold mt-1 uppercase">Tải ảnh</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Tên dịch vụ *</label>
                                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20" placeholder="VD: Tour Trekking Langbiang" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold">
                                        <option value="tour">🗺️ Tour du lịch</option>
                                        <option value="hotel">🏨 Khách sạn</option>
                                        <option value="homestay">🏡 Homestay</option>
                                        <option value="vehicle">🚌 Phương tiện</option>
                                    </select>
                                    <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold">
                                        <option value="">-- Danh mục --</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <select required value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold">
                                        <option value="">-- Địa điểm --</option>
                                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                    <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold" placeholder="Địa chỉ chi tiết" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={form.duration_days} onChange={e => setForm({...form, duration_days: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold" placeholder="Số ngày (VD: 3)" />
                                        <span className="text-xs font-bold text-slate-400">Ngày</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={form.duration_nights} onChange={e => setForm({...form, duration_nights: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold" placeholder="Số đêm (VD: 2)" />
                                        <span className="text-xs font-bold text-slate-400">Đêm</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <input required type="number" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold" placeholder="Giá (VNĐ)" />
                                    <select value={form.price_unit} onChange={e => setForm({...form, price_unit: e.target.value})} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold">
                                        <option value="per_person">/ người</option>
                                        <option value="per_room">/ phòng</option>
                                    </select>
                                    <input type="number" value={form.max_guests} onChange={e => setForm({...form, max_guests: e.target.value})} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold" placeholder="Khách tối đa" />
                                </div>

                                <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold resize-none" placeholder="Mô tả dịch vụ..." />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Hủy</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : (editMode ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ ngay')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmDelete && <ConfirmModal message={`Xóa dịch vụ "${confirmDelete.name}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)} />}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default MyServices;
