import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, MapPin, RotateCw, Search, Loader2,
    Edit2, Trash2, Star, ChevronLeft, ChevronRight
} from 'lucide-react';
import LocationModal from '../../components/admin/location/LocationModal';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import adminApi from '../../api/adminApi';
import TableSkeleton from '../../components/common/TableSkeleton';

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;
    const { current_page, last_page, total } = meta;
    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-400 font-medium">Tổng: <span className="font-bold text-slate-600">{total}</span> địa điểm</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(current_page - 1)} disabled={current_page <= 1}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={18} />
                </button>
                {Array.from({ length: last_page }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => onPageChange(page)}
                        className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-all ${
                            page === current_page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'
                        }`}>
                        {page}
                    </button>
                ))}
                <button onClick={() => onPageChange(current_page + 1)} disabled={current_page >= last_page}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

const LocationManagement = () => {
    const {
        locations, setLocations, meta, fetchLocations, loadingStates,
        addLocation, updateLocation, removeLocation
    } = useAdminData();
    const locationsMeta = meta?.locations || { current_page: 1, last_page: 1, total: 0 };
    const loading = loadingStates.locations;

    const [searchTerm, setSearchTerm] = useState('');
    const [isPopularActive, setIsPopularActive] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const toast = useNotification();

    const doFetch = useCallback((page = 1, search = '', popular = false, force = false) => {
        fetchLocations(force, page, {
            search: search || undefined,
            is_popular: popular ? '1' : undefined,
        });
    }, [fetchLocations]);

    useEffect(() => {
        const timer = setTimeout(() => {
            doFetch(1, searchTerm, isPopularActive, false);
            setCurrentPage(1);
        }, searchTerm ? 400 : 0);
        return () => clearTimeout(timer);
    }, [searchTerm, isPopularActive, doFetch]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        doFetch(page, searchTerm, isPopularActive);
    };

    const handleAddClick = () => { setEditingLocation(null); setIsModalOpen(true); };
    const handleEditClick = (loc) => { setEditingLocation(loc); setIsModalOpen(true); };

    const [backgroundTasks, setBackgroundTasks] = useState({}); // { id: 'adding' | 'updating' }

    const handleSave = async (data, selectedFile) => {
        // Close modal immediately after validation (validation is inside Modal)
        setIsModalOpen(false);
        
        const taskId = editingLocation ? editingLocation.id : `temp-${Date.now()}`;
        setBackgroundTasks(prev => ({ ...prev, [taskId]: editingLocation ? 'updating' : 'adding' }));

        // Nếu là thêm mới, tạo một bản ghi tạm thời
        if (!editingLocation) {
            const tempLoc = {
                id: taskId,
                name: data.name,
                image_url: data.image_url || '',
                country_code: data.country_code,
                is_popular: data.is_popular,
                isOptimistic: true
            };
            addLocation(tempLoc);
        } else {
            // Nếu là sửa, cập nhật flag isOptimistic
            updateLocation({ ...editingLocation, ...data, isOptimistic: true });
        }

        try {
            let finalImageUrl = data.image_url;
            // Xử lý upload ảnh ngầm nếu có
            if (selectedFile) {
                const { uploadImage } = await import('../../utils/cloudinary');
                finalImageUrl = await uploadImage(selectedFile);
            }

            const finalData = { ...data, image_url: finalImageUrl };
            
            if (editingLocation) {
                const res = await adminApi.updateLocation(editingLocation.id, finalData);
                if (res.success) {
                    toast.success('Đã cập nhật xong!');
                    updateLocation({ ...res.data, isOptimistic: false });
                }
            } else {
                const res = await adminApi.createLocation(finalData);
                if (res.success) {
                    toast.success('Đã thêm địa điểm mới!');
                    // Thay thế bản ghi tạm bằng bản ghi thật
                    setLocations(prev => prev.map(l => l.id === taskId ? res.data : l));
                }
            }
        } catch (e) {
            console.error('Error saving location:', e);
            toast.error('Lỗi khi lưu dữ liệu ngầm. Vui lòng thử lại.');
            // Rollback nếu lỗi
            if (editingLocation) {
                updateLocation({ ...editingLocation, isOptimistic: false });
            } else {
                removeLocation(taskId);
            }
        } finally {
            setBackgroundTasks(prev => {
                const newTasks = { ...prev };
                delete newTasks[taskId];
                return newTasks;
            });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa địa điểm này?')) return;
        try {
            const res = await adminApi.deleteLocation(id);
            if (res.success) {
                toast.success('Xóa địa điểm thành công!');
                removeLocation(id);
                if (locations.length === 1 && currentPage > 1) {
                    handlePageChange(currentPage - 1);
                }
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Không thể xóa địa điểm.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Địa điểm</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Quản lý các điểm đến du lịch trên toàn quốc.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng địa điểm</p>
                            <p className="text-lg font-black text-slate-800 leading-none">{locationsMeta.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text" placeholder="Tìm kiếm địa điểm..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={() => setIsPopularActive(v => !v)}
                    className={`flex items-center gap-2 px-6 py-4 rounded-[22px] text-sm font-bold transition-all border ${
                        isPopularActive ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-100 text-slate-500'
                    }`}>
                    <Star size={16} className={isPopularActive ? 'fill-amber-500 text-amber-500' : ''} />
                    Phổ biến
                </button>
                <button onClick={() => doFetch(currentPage, searchTerm, isPopularActive, true)}
                    className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                    <RotateCw size={20} />
                </button>
                <button onClick={handleAddClick}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[22px] shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer uppercase text-xs tracking-widest">
                    <Plus size={20} /> Thêm địa điểm
                </button>
            </div>

            {loading ? (
                <TableSkeleton columns={5} rows={10} />
            ) : locations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                        <MapPin size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Chưa có địa điểm nào</h3>
                    <p className="text-slate-500 max-w-xs mt-2">Thêm các địa điểm du lịch nổi bật để người dùng dễ tìm kiếm.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Địa điểm</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Quốc gia</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Phổ biến</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {locations.map((loc) => {
                                        const isTemp = String(loc.id).startsWith('temp-');
                                        const isUpdating = loc.isOptimistic && !isTemp;
                                        const isAdding = loc.isOptimistic && isTemp;

                                        return (
                                            <tr key={loc.id} className={`hover:bg-slate-50/50 transition-colors group ${isUpdating ? 'optimistic-updating' : ''} ${isAdding ? 'optimistic-adding' : ''}`}>
                                                <td className="px-6 py-4">
                                                    {isAdding ? (
                                                        <div className="optimistic-adding-text text-[10px] font-bold uppercase">Đang thêm...</div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400">#{loc.id}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shadow-sm border border-slate-100 flex items-center justify-center">
                                                            {loc.image_url ? (
                                                                <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <MapPin size={18} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase text-xs">{loc.name}</p>
                                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">/{loc.slug || 'generating...'}</p>
                                                            {loc.parent && <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase flex items-center gap-1">
                                                                <ChevronRight size={10} /> {loc.parent.name}
                                                            </p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 uppercase">
                                                        {loc.country_code || 'VN'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {loc.is_popular ? <Star size={16} className="inline fill-amber-500 text-amber-500" /> : <span className="text-slate-300 text-sm">—</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {!loc.isOptimistic && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleEditClick(loc)}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer">
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(loc.id)}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination meta={locationsMeta} onPageChange={handlePageChange} />
                </>
            )}

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                location={editingLocation}
                locations={locations}
                isLoading={isSaving}
            />
        </div>
    );
};

export default LocationManagement;
