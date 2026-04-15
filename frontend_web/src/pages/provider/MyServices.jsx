import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Trash2, Edit3, Eye, Loader2, Package, MapPin, Tag, DollarSign, MoreHorizontal, X, AlertCircle
} from 'lucide-react';
import ProviderLayout from '../../components/provider/ProviderLayout';
import providerApi from '../../api/providerApi';

const MyServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: '', type: 'tour', base_price: '', description: '', address: '', max_guests: '', category_id: '', location_id: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await providerApi.getServices();
            if (res.success) setServices(res.data);
        } catch (err) {
            console.error('Fetch services error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (creating) return;
        setCreating(true);
        try {
            const payload = {
                ...form,
                base_price: Number(form.base_price),
                max_guests: form.max_guests ? Number(form.max_guests) : null,
                category_id: form.category_id || null,
                location_id: form.location_id || null,
            };
            const res = await providerApi.createService(payload);
            if (res.success) {
                alert('Tạo dịch vụ thành công! Đang chờ Admin duyệt.');
                setShowCreateModal(false);
                setForm({ name: '', type: 'tour', base_price: '', description: '', address: '', max_guests: '', category_id: '', location_id: '' });
                fetchServices();
            }
        } catch (err) {
            console.error('Create service error:', err);
            alert(err.response?.data?.message || 'Lỗi khi tạo dịch vụ');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${name}"?`)) return;
        try {
            const res = await providerApi.deleteService(id);
            if (res.success) {
                setServices(services.filter(s => s.id !== id));
                alert('Đã xóa dịch vụ.');
            }
        } catch (err) {
            alert('Lỗi khi xóa dịch vụ');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            active: { bg: 'bg-emerald-50 text-emerald-600', label: 'Hoạt động' },
            pending_review: { bg: 'bg-amber-50 text-amber-600', label: 'Chờ duyệt' },
            draft: { bg: 'bg-slate-100 text-slate-500', label: 'Bản nháp' },
            rejected: { bg: 'bg-rose-50 text-rose-600', label: 'Bị từ chối' },
        };
        const s = map[status] || map.draft;
        return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${s.bg}`}>{s.label}</span>;
    };

    const getTypeBadge = (type) => {
        const map = {
            tour: { bg: 'bg-blue-50 text-blue-600', label: 'Tour' },
            hotel: { bg: 'bg-purple-50 text-purple-600', label: 'Khách sạn' },
            homestay: { bg: 'bg-pink-50 text-pink-600', label: 'Homestay' },
            vehicle: { bg: 'bg-orange-50 text-orange-600', label: 'Phương tiện' },
        };
        const t = map[type] || map.tour;
        return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${t.bg}`}>{t.label}</span>;
    };

    const filteredServices = services.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProviderLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ của tôi</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các tour, khách sạn và dịch vụ bạn đang cung cấp.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Thêm dịch vụ
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                        <p className="text-slate-400 font-bold mb-2">Chưa có dịch vụ nào</p>
                        <p className="text-slate-300 text-sm">Bấm "Thêm dịch vụ" để bắt đầu kinh doanh!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredServices.map(service => (
                            <div key={service.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
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
                                                {service.location && (
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <MapPin size={10} /> {service.location.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600">
                                                {Number(service.base_price).toLocaleString('vi-VN')}₫
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{service.price_unit === 'per_person' ? '/người' : '/phòng'}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDelete(service.id, service.name)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900">Thêm dịch vụ mới</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên dịch vụ *</label>
                                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="VD: Tour Đà Lạt 3N2Đ" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Loại dịch vụ *</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                        <option value="tour">Tour du lịch</option>
                                        <option value="hotel">Khách sạn</option>
                                        <option value="homestay">Homestay</option>
                                        <option value="vehicle">Phương tiện</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giá cơ bản (VNĐ) *</label>
                                    <input required type="number" min="0" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="500000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Địa chỉ</label>
                                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="VD: 123 Trần Phú, TP Đà Lạt" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Số khách tối đa</label>
                                <input type="number" min="1" value={form.max_guests} onChange={e => setForm({...form, max_guests: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả</label>
                                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" placeholder="Mô tả chi tiết về dịch vụ..." />
                            </div>
                            <button type="submit" disabled={creating}
                                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {creating ? <><Loader2 size={16} className="animate-spin" /> Đang tạo...</> : <><Plus size={16} /> Tạo dịch vụ</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </ProviderLayout>
    );
};

export default MyServices;
