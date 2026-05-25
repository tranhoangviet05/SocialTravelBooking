import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Compass,
    Hotel,
    Car,
    Home,
    MapPin,
    Tag,
    Star,
    MoreVertical,
    Loader2,
    CheckCircle2,
    XCircle,
    Eye,
    Edit3,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    Clock,
    FileText,
    Image as ImageIcon,
    ShieldCheck,
    Info,
    Calendar,
    Users,
    Map
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import TableSkeleton from '../../components/common/TableSkeleton';
import echo from '../../utils/echo';

const ServiceManagement = () => {
    const { services, meta, loadingStates, fetchServices, setServices, updateService, removeService, isLoadingServices } = useAdminData();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [actionMenuId, setActionMenuId] = useState(null);
    const [statusModal, setStatusModal] = useState({ open: false, service: null });
    const [detailModal, setDetailModal] = useState({ open: false, service: null, loading: false });
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [updating, setUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const toast = useNotification();

    const activeMeta = meta?.services || { current_page: 1, last_page: 1, total: 0 };

    const doFetchServices = useCallback(async (page = 1, force = false) => {
        const params = { page, per_page: 8 };
        if (searchTerm) params.search = searchTerm;
        if (filterType) params.type = filterType;
        if (filterStatus) params.status = filterStatus;
        await fetchServices(force, params);
    }, [searchTerm, filterType, filterStatus, fetchServices]);

    useEffect(() => {
        doFetchServices(currentPage, false);
    }, [filterType, filterStatus, currentPage, doFetchServices]);

    useEffect(() => {
        const channel = echo.channel('admin.services');
        channel.listen('.AdminServiceUpdated', (e) => {
            const { service_id, service_name, service, action } = e;
            if (action === 'created') {
                toast?.success?.(`Có dịch vụ mới chờ duyệt: ${service_name}`);
                if (service) {
                    setServices(prev => [service, ...prev]);
                }
            } else if (action === 'updated') {
                toast?.info?.(`Dịch vụ đã được cập nhật: ${service_name}`);
                if (service) {
                    setServices(prev => {
                        const exists = prev.some(s => s.id === service_id);
                        if (exists) {
                            return prev.map(s => s.id === service_id ? service : s);
                        }
                        return [service, ...prev];
                    });
                }
            } else if (action === 'deleted') {
                toast?.info?.(`Dịch vụ đã bị xóa: ${service_name}`);
                setServices(prev => prev.filter(s => s.id !== service_id));
            }
        });

        return () => {
            channel.stopListening('.AdminServiceUpdated');
        };
    }, [currentPage, doFetchServices, toast]);

    const fetchPage = async (page = 1) => {
        setCurrentPage(page);
        await doFetchServices(page, true);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        doFetchServices(1);
    };

    const handleStatusUpdate = async () => {
        if (!statusModal.service || !newStatus) return;
        if (newStatus === 'rejected' && !rejectionReason.trim()) {
            toast?.error?.('Vui lòng nhập lý do từ chối');
            return;
        }

        const targetId = statusModal.service.id;
        const targetStatus = newStatus;
        const targetReason = rejectionReason;

        // 1. Đóng modal ngay lập tức
        setStatusModal({ open: false, service: null });
        setNewStatus('');
        setRejectionReason('');

        // 2. Cập nhật trạng thái "Lạc quan" (Optimistic)
        const originalService = services.find(s => s.id === targetId);
        updateService({ ...originalService, status: targetStatus, isOptimistic: true });

        try {
            const response = await adminApi.updateServiceStatus(
                targetId,
                targetStatus,
                targetStatus === 'rejected' ? targetReason : null
            );
            if (response.success) {
                toast?.success?.('Đã cập nhật trạng thái dịch vụ!');
                // Gộp dữ liệu mới từ API với các quan hệ cũ (provider, location, v.v.)
                updateService({ ...originalService, ...response.data, isOptimistic: false });
            }
        } catch (error) {
            toast?.error?.('Lỗi khi cập nhật trạng thái ngầm.');
            // Rollback nếu lỗi
            updateService({ ...originalService, isOptimistic: false });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa dịch vụ này? (Có thể khôi phục lại)')) return;
        try {
            const response = await adminApi.deleteService(id);
            if (response.success) {
                toast?.success?.('Xóa dịch vụ thành công');
                removeService(id);
            }
        } catch (error) {
            console.error('Delete service error:', error);
            toast?.error?.('Không thể xóa dịch vụ');
        }
    };

    const handleViewDetail = async (id) => {
        setDetailModal({ open: true, service: null, loading: true });
        try {
            console.log('Fetching service detail for ID:', id);
            const response = await adminApi.getServiceDetail(id);
            console.log('Service detail response:', response);
            
            // Xử lý dữ liệu linh hoạt: kiểm tra response.data hoặc chính response
            const serviceData = response.data || response;
            
            if (serviceData && (serviceData.id || response.success)) {
                setDetailModal({ 
                    open: true, 
                    service: response.data || response, 
                    loading: false 
                });
            } else {
                toast?.error?.('Dữ liệu dịch vụ không hợp lệ');
                setDetailModal(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Fetch service detail error:', error);
            toast?.error?.('Không thể lấy chi tiết dịch vụ');
            setDetailModal({ open: false, service: null, loading: false });
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'tour': return <Compass className="text-sky-500" size={16} />;
            case 'hotel': return <Hotel className="text-emerald-500" size={16} />;
            case 'homestay': return <Home className="text-amber-500" size={16} />;
            case 'vehicle': return <Car className="text-indigo-500" size={16} />;
            default: return <Tag className="text-gray-500" size={16} />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'tour': return 'Tour';
            case 'hotel': return 'Khách sạn';
            case 'homestay': return 'Homestay';
            case 'vehicle': return 'Di chuyển';
            default: return type;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending_review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'draft': return 'bg-gray-50 text-gray-500 border-gray-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'pending_review': return 'Chờ duyệt';
            case 'draft': return 'Bản nháp';
            case 'rejected': return 'Từ chối';
            default: return status;
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0₫';
        return Number(price).toLocaleString('vi-VN') + '₫';
    };

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ & Tours</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Quản lý {activeMeta.total} dịch vụ trên toàn hệ thống.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm tên dịch vụ, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="tour">Tour</option>
                            <option value="hotel">Khách sạn</option>
                            <option value="homestay">Homestay</option>
                            <option value="vehicle">Di chuyển</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="pending_review">Chờ duyệt</option>
                            <option value="draft">Bản nháp</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                        <button onClick={() => fetchPage(currentPage)}
                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {isLoadingServices ? (
                    <TableSkeleton columns={7} rows={10} />
                ) : (
                    <>
                        <AdminTable
                            headers={['Dịch vụ', 'Loại', 'Nhà cung cấp', 'Giá cơ bản', 'Đánh giá', 'Trạng thái', '']}
                            title="Tất cả dịch vụ"
                            description={`Tổng cộng ${activeMeta.total} dịch vụ.`}
                        >
                            {services.length > 0 ? services.map((svc) => (
                                <tr key={svc.id} className={`hover:bg-gray-50/50 transition-colors group relative ${svc.isOptimistic ? 'optimistic-updating' : ''}`}>
                                    <td className="px-8 py-5">
                                        <div className="max-w-[300px]">
                                            <button 
                                                onClick={() => handleViewDetail(svc.id)}
                                                className="text-sm font-black text-slate-900 truncate leading-tight hover:text-indigo-600 transition-colors text-left block w-full"
                                            >
                                                {svc.name}
                                            </button>
                                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-gray-400">
                                                <MapPin size={10} />
                                                {svc.location?.name || svc.address || 'Chưa có'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                        <div className="flex items-center gap-2 uppercase tracking-wide text-[10px]">
                                            {getTypeIcon(svc.type)}
                                            {getTypeLabel(svc.type)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                            {svc.provider?.business_name || svc.provider?.user?.display_name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-slate-900">{formatPrice(svc.base_price)}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1">
                                            <Star size={14} className="text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-black text-slate-700">{svc.rating_avg || '0.0'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(svc.status)} uppercase tracking-tight flex-shrink-0 inline-block`}>
                                            {getStatusLabel(svc.status)}
                                        </span>
                                        {svc.status === 'active' && svc.approval_note && (
                                            <div className="text-[9px] text-emerald-600 mt-1.5 flex items-center gap-1 font-bold bg-emerald-50/50 px-2 py-1 rounded-lg w-max">
                                                <ShieldCheck size={10} /> {svc.approval_note}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right relative">
                                        <button
                                            onClick={() => setActionMenuId(actionMenuId === svc.id ? null : svc.id)}
                                            className="p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-all"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {actionMenuId === svc.id && (
                                            <div className="absolute right-8 top-14 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-48 z-50">
                                                <button
                                                    onClick={() => {
                                                        setStatusModal({ open: true, service: svc });
                                                        setNewStatus(svc.status);
                                                        setActionMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                    Thay đổi trạng thái
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDelete(svc.id);
                                                        setActionMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                    Xóa dịch vụ
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center text-gray-400 font-bold">
                                        Không tìm thấy dịch vụ nào
                                    </td>
                                </tr>
                            )}
                        </AdminTable>

                        {/* Pagination */}
                        {activeMeta.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium">
                                    Trang {activeMeta.current_page} / {activeMeta.last_page} ({activeMeta.total} kết quả)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchPage(activeMeta.current_page - 1)}
                                        disabled={activeMeta.current_page <= 1}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => fetchPage(activeMeta.current_page + 1)}
                                        disabled={activeMeta.current_page >= activeMeta.last_page}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

            {/* Status Update Modal */}
            {statusModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-slate-900">Cập nhật trạng thái</h3>
                                <button onClick={() => setStatusModal({ open: false, service: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                                <p className="text-sm font-black text-slate-900 truncate">{statusModal.service?.name}</p>
                                <p className="text-xs text-gray-400 mt-1">Trạng thái hiện tại: <span className="font-bold">{getStatusLabel(statusModal.service?.status)}</span></p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Trạng thái mới</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                    >
                                        <option value="draft">Bản nháp</option>
                                        <option value="pending_review">Chờ duyệt</option>
                                        <option value="active">Hoạt động</option>
                                        <option value="rejected">Từ chối</option>
                                    </select>
                                </div>

                                {newStatus === 'rejected' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Lý do từ chối</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none font-medium"
                                            placeholder="Nhập lý do từ chối dịch vụ..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setStatusModal({ open: false, service: null })}
                                    className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating}
                                    className="flex-[2] py-4 bg-sky-500 hover:bg-sky-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal.open && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setDetailModal({ open: false, service: null, loading: false })} />
                    <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusStyle(detailModal.service?.status)}`}>
                                    {detailModal.service ? getTypeIcon(detailModal.service.type) : <Info size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                                        {detailModal.loading ? 'Đang tải...' : (detailModal.service?.name || 'Chi tiết dịch vụ')}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {detailModal.service && (
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${getStatusStyle(detailModal.service.status)}`}>
                                                {getStatusLabel(detailModal.service.status)}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {detailModal.service?.type || 'Dịch vụ'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setDetailModal({ open: false, service: null, loading: false })}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            {detailModal.loading ? (
                                <div className="h-full flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                    <p className="font-bold text-slate-400">Đang tải dữ liệu chi tiết...</p>
                                </div>
                            ) : detailModal.service ? (() => {
                                const roomTypes = detailModal.service.room_types || detailModal.service.roomTypes || [];
                                return (
                                <div className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column */}
                                        <div className="lg:col-span-2 space-y-8">
                                            {/* Main Media */}
                                            <div className="aspect-video w-full rounded-[2rem] bg-slate-200 overflow-hidden shadow-md relative group">
                                                {detailModal.service.media && detailModal.service.media.length > 0 ? (
                                                    <img 
                                                        src={detailModal.service.media[0].url} 
                                                        alt="" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <ImageIcon size={64} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 bg-slate-900/60 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                                                    📸 Ảnh bìa
                                                </div>
                                            </div>

                                            {/* Gallery */}
                                            {detailModal.service.media && detailModal.service.media.length > 1 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <ImageIcon size={18} className="text-pink-500" /> Bộ sưu tập ảnh ({detailModal.service.media.length})
                                                    </h4>
                                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                                        {detailModal.service.media.map((m, i) => (
                                                            <div key={i} className="aspect-square rounded-2xl bg-white border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all shadow-sm group relative">
                                                                <img src={m.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                {m.is_cover && (
                                                                    <span className="absolute bottom-1 right-1 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">COVER</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Description */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                    <FileText size={18} className="text-indigo-500" /> Mô tả chi tiết dịch vụ
                                                </h4>
                                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-sm">
                                                    {detailModal.service.description || 'Không có mô tả chi tiết cho dịch vụ này.'}
                                                </div>
                                            </div>

                                            {/* Vehicle Specific Details */}
                                            {detailModal.service.type === 'vehicle' && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Car size={18} className="text-indigo-500" /> Thông số phương tiện di chuyển
                                                    </h4>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hình thức</p>
                                                            <p className="text-sm font-black text-slate-880 mt-1">
                                                                {detailModal.service.vehicle_type === 'self_drive' ? '🚗 Tự lái' : '👨‍✈️ Có tài xế'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Số chỗ ngồi</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                💺 {detailModal.service.seats || '--'} chỗ
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hộp số</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                ⚙️ {detailModal.service.transmission === 'manual' ? 'Số sàn' : detailModal.service.transmission === 'automatic' ? 'Số tự động' : '--'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nhiên liệu</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                ⛽ {detailModal.service.fuel_type === 'gasoline' ? 'Xăng' : detailModal.service.fuel_type === 'diesel' ? 'Dầu Diesel' : detailModal.service.fuel_type === 'electric' ? 'Điện' : '--'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hotel Specific Details */}
                                            {detailModal.service.type === 'hotel' && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Hotel size={18} className="text-emerald-500" /> Thông tin cơ sở lưu trú khách sạn
                                                    </h4>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hạng sao</p>
                                                            <div className="flex items-center gap-1 mt-1 text-amber-500">
                                                                {detailModal.service.star_rating ? (
                                                                    [...Array(detailModal.service.star_rating)].map((_, i) => (
                                                                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                                                    ))
                                                                ) : 'Chưa xếp hạng'}
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giờ nhận phòng tiêu chuẩn</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                🕒 {detailModal.service.checkin_time || '14:00'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giờ trả phòng tiêu chuẩn</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                🕒 {detailModal.service.checkout_time || '12:00'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Homestay Specific Details */}
                                            {detailModal.service.type === 'homestay' && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Home size={18} className="text-amber-500" /> Cấu trúc & Thời gian Homestay
                                                    </h4>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phòng ngủ</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                🛏️ {detailModal.service.total_bedrooms || 1} phòng
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phòng tắm</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                🚿 {detailModal.service.total_bathrooms || 1} phòng
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nhận phòng</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                🕒 {detailModal.service.checkin_time || '14:00'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trả phòng</p>
                                                            <p className="text-sm font-black text-slate-800 mt-1">
                                                                🕒 {detailModal.service.checkout_time || '12:00'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Room Types for Hotel / Homestay */}
                                            {(detailModal.service.type === 'hotel' || detailModal.service.type === 'homestay') && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Hotel size={18} className="text-emerald-500" /> Cấu trúc & Loại phòng nghỉ ({roomTypes.length})
                                                    </h4>
                                                    {roomTypes.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-6">
                                                            {roomTypes.map((room) => {
                                                                let roomImgs = [];
                                                                try {
                                                                    roomImgs = typeof room.images === 'string' ? JSON.parse(room.images) : room.images || [];
                                                                } catch(e) {
                                                                    roomImgs = room.images || [];
                                                                }
                                                                let roomAmenities = [];
                                                                try {
                                                                    roomAmenities = typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities || [];
                                                                } catch(e) {
                                                                    roomAmenities = room.amenities || [];
                                                                }

                                                                return (
                                                                <div key={room.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all">
                                                                    {/* Room image thumbnail */}
                                                                    <div className="w-full md:w-1/3 bg-slate-100 h-48 md:h-auto relative shrink-0">
                                                                        {roomImgs.length > 0 ? (
                                                                            <img 
                                                                                src={roomImgs[0]} 
                                                                                alt={room.name} 
                                                                                className="w-full h-full object-cover" 
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                                <ImageIcon size={32} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Room info */}
                                                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                                                <h5 className="font-black text-slate-800 text-base">{room.name}</h5>
                                                                                <span className="text-sm font-black text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-xl">
                                                                                    {formatPrice(room.base_price)} <span className="text-[10px] text-slate-400 font-bold">/đêm</span>
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                                                                                {room.description || 'Chưa có mô tả chi tiết cho loại phòng này.'}
                                                                            </p>
                                                                            
                                                                            {/* Specifications */}
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                                                                                    <Users size={12} className="text-emerald-500 shrink-0" />
                                                                                    <span>Sức chứa: {room.capacity_adults} Lớn {room.capacity_children > 0 && `, ${room.capacity_children} Trẻ`}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                                                                                    <Home size={12} className="text-emerald-500 shrink-0" />
                                                                                    <span>Số phòng: {room.total_rooms} (Kho: {room.inventory})</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Room Amenities */}
                                                                        {roomAmenities.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1.5 border-t border-slate-50 pt-3">
                                                                                {roomAmenities.slice(0, 5).map((am, i) => (
                                                                                    <span key={i} className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md">
                                                                                        {am}
                                                                                    </span>
                                                                                ))}
                                                                                {roomAmenities.length > 5 && (
                                                                                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                                                        +{ roomAmenities.length - 5 } khác
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )})}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] text-center text-sm font-bold text-amber-600">
                                                            ⚠️ Dịch vụ khách sạn này chưa có loại phòng nào được tạo! (Thiếu dữ liệu để duyệt)
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Schedules */}
                                            {detailModal.service.type === 'tour' && detailModal.service.schedules?.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Map size={18} className="text-sky-500" /> Lịch trình chuyến đi chi tiết
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {[...detailModal.service.schedules].sort((a,b) => a.day_number - b.day_number).map((day) => {
                                                            let acts = [];
                                                            try {
                                                                acts = typeof day.activities === 'string' ? JSON.parse(day.activities) : day.activities || [];
                                                            } catch(e) {
                                                                acts = day.activities || [];
                                                            }
                                                            let meals = [];
                                                            try {
                                                                meals = typeof day.meals === 'string' ? JSON.parse(day.meals) : day.meals || [];
                                                            } catch(e) {
                                                                meals = day.meals || [];
                                                            }

                                                            return (
                                                            <div key={day.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-lg shadow-sky-200 shrink-0">
                                                                            {day.day_number}
                                                                        </div>
                                                                        <p className="font-black text-slate-900 text-sm md:text-base">{day.title}</p>
                                                                    </div>
                                                                    {meals.length > 0 && (
                                                                        <div className="flex gap-1">
                                                                            {meals.map((m, idx) => (
                                                                                <span key={idx} className="bg-amber-50 text-amber-600 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-amber-100">
                                                                                    🍴 {m}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {day.description && (
                                                                    <p className="text-xs text-slate-500 mb-3 italic ml-14 font-medium leading-relaxed">{day.description}</p>
                                                                )}
                                                                <div className="ml-14 space-y-2">
                                                                    {acts.length > 0 && acts.map((act, i) => (
                                                                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                                            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shrink-0" />
                                                                            <span>{act}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )})}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Inclusions & Exclusions */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Includes */}
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <CheckCircle2 size={18} className="text-emerald-500" /> Dịch vụ bao gồm
                                                    </h4>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[150px] space-y-3">
                                                        {detailModal.service.includes && detailModal.service.includes.length > 0 ? (
                                                            detailModal.service.includes.map((inc, i) => (
                                                                <div key={i} className="flex items-start gap-2.5 text-xs font-bold text-slate-600 leading-normal">
                                                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                    <span>{inc}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-slate-400 font-bold italic">Không có thông tin dịch vụ bao gồm.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Excludes */}
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <XCircle size={18} className="text-rose-500" /> Không bao gồm
                                                    </h4>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[150px] space-y-3">
                                                        {detailModal.service.excludes && detailModal.service.excludes.length > 0 ? (
                                                            detailModal.service.excludes.map((exc, i) => (
                                                                <div key={i} className="flex items-start gap-2.5 text-xs font-bold text-slate-600 leading-normal">
                                                                    <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                                                    <span>{exc}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-slate-400 font-bold italic">Không có thông tin dịch vụ loại trừ.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* System / Service Amenities */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                    <Tag size={18} className="text-indigo-500" /> Các tiện nghi & Tiện ích đi kèm
                                                </h4>
                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                    {detailModal.service.amenities && detailModal.service.amenities.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {detailModal.service.amenities.map((am, i) => (
                                                                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-black uppercase rounded-xl border border-slate-100 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                                    {am}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 font-bold italic">Chưa cấu hình các tiện ích đi kèm.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Customer Reviews */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                    <Star size={18} className="text-amber-500" /> Nhận xét & Đánh giá từ khách hàng ({detailModal.service.reviews?.length || 0})
                                                </h4>
                                                <div className="space-y-4">
                                                    {detailModal.service.reviews && detailModal.service.reviews.length > 0 ? (
                                                        detailModal.service.reviews.slice(0, 5).map((rev) => (
                                                            <div key={rev.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center border border-indigo-100">
                                                                            {rev.user?.display_name?.[0]?.toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-800">{rev.user?.display_name}</p>
                                                                            <p className="text-[9px] font-bold text-slate-400">
                                                                                {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star key={i} size={12} className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-100"} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-slate-600 font-medium leading-relaxed pl-10">
                                                                    {rev.content || 'Khách hàng không để lại nhận xét.'}
                                                                </p>
                                                                {rev.provider_reply && (
                                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-medium text-slate-500 ml-10 mt-2">
                                                                        <p className="font-black text-slate-700 mb-1">📬 Nhà cung cấp phản hồi:</p>
                                                                        {rev.provider_reply}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center text-xs text-slate-400 font-bold italic py-8">
                                                            Chưa có đánh giá nào cho dịch vụ này.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-6">
                                            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá cơ bản</p>
                                                    <p className="text-3xl font-black text-white">{formatPrice(detailModal.service.base_price)}</p>
                                                </div>
                                                <div className="h-px bg-white/10" />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời lượng</p>
                                                        <p className="text-sm font-bold">
                                                            {detailModal.service.type === 'tour' 
                                                                ? `${detailModal.service.duration_days}N ${detailModal.service.duration_nights}Đ` 
                                                                : 'Lưu trú / Thuê'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sức chứa tối đa</p>
                                                        <p className="text-sm font-bold">{detailModal.service.max_guests || '--'} khách</p>
                                                    </div>
                                                </div>
                                                <div className="h-px bg-white/10" />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kho / Số lượng</p>
                                                        <p className="text-sm font-bold">{detailModal.service.inventory || '1'} chiếc/slot</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn vị giá</p>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                                            {detailModal.service.price_unit === 'per_person' ? 'Mỗi người' : 'Mỗi phòng/xe'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Danh mục & Thẻ</h5>
                                                <div className="space-y-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1.5">
                                                            📂 {detailModal.service.category?.name || 'Chưa có'}
                                                        </span>
                                                    </div>
                                                    {detailModal.service.tags && detailModal.service.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 border-t border-slate-50 pt-3">
                                                            {detailModal.service.tags.map((t, idx) => (
                                                                <span key={idx} className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md">
                                                                    #{t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                                                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Nhà cung cấp</h5>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm text-lg shrink-0">
                                                        {detailModal.service.provider?.user?.display_name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-slate-900 truncate">{detailModal.service.provider?.business_name || detailModal.service.provider?.user?.display_name}</p>
                                                        <p className="text-[10px] text-indigo-500 font-bold truncate">{detailModal.service.provider?.user?.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Địa điểm hoạt động</h5>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-slate-900">{detailModal.service.location?.name || 'Chưa gắn'}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">
                                                            {detailModal.service.address || 'Chưa có địa chỉ cụ thể'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})() : (
                                <div className="h-full flex items-center justify-center p-12 text-slate-400 font-bold">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
                            <button 
                                onClick={() => setDetailModal({ open: false, service: null, loading: false })}
                                className="px-8 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                            >
                                Đóng
                            </button>
                            {!detailModal.loading && detailModal.service?.status === 'pending_review' && (
                                <>
                                    <button 
                                        onClick={() => {
                                            setStatusModal({ open: true, service: detailModal.service });
                                            setNewStatus('rejected');
                                            setDetailModal({ open: false, service: null, loading: false });
                                        }}
                                        className="px-8 py-3 bg-rose-50 text-rose-600 text-sm font-black rounded-2xl hover:bg-rose-100 transition-all border border-rose-100"
                                    >
                                        Từ chối duyệt
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setStatusModal({ open: true, service: detailModal.service });
                                            setNewStatus('active');
                                            setDetailModal({ open: false, service: null, loading: false });
                                        }}
                                        className="px-10 py-3 bg-emerald-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                                    >
                                        Phê duyệt
                                    </button>
                                </>
                            )}
                        </div>
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

export default ServiceManagement;
