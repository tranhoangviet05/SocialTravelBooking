import React from 'react';
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
    MoreVertical
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';

const AdminServices = () => {
    const services = [
        { id: 's1', name: 'InterContinental Danang Sun Peninsula Resort', type: 'hotel', provider: 'Sun Group', price: '12,500,000₫', status: 'active', rating: 4.9, location: 'Đà Nẵng' },
        { id: 's2', name: 'Tour Khám phá Hang Sơn Đoòng 4N3Đ', type: 'tour', provider: 'Oxalis Adventure', price: '68,000,000₫', status: 'active', rating: 5.0, location: 'Quảng Bình' },
        { id: 's3', name: 'Ha Long Bay Luxury Cruise', type: 'tour', provider: 'Heritage Line', price: '8,200,000₫', status: 'pending_review', rating: 4.8, location: 'Quảng Ninh' },
        { id: 's4', name: 'Vinpearl Luxury Nha Trang', type: 'hotel', provider: 'Vingroup', price: '4,500,000₫', status: 'active', rating: 4.7, location: 'Khánh Hòa' },
        { id: 's5', name: 'Private Car Ho Chi Minh to Mui Ne', type: 'vehicle', provider: 'GoTravel', price: '1,800,000₫', status: 'draft', rating: 4.5, location: 'Hồ Chí Minh' },
    ];

    const getTypeIcon = (type) => {
        switch (type) {
            case 'tour': return <Compass className="text-sky-500" size={16} />;
            case 'hotel': return <Hotel className="text-emerald-500" size={16} />;
            case 'homestay': return <Home className="text-amber-500" size={16} />;
            case 'vehicle': return <Car className="text-indigo-500" size={16} />;
            default: return <Tag className="text-gray-500" size={16} />;
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ & Tours</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các tour, khách sạn và dịch vụ du lịch trên hệ thống.</p>
                </div>
                <button className="flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all">
                    <Plus size={18} />
                    Tạo dịch vụ mới
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm tên dịch vụ, nhà cung cấp, địa điểm..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:shadow-md transition-all font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all">
                        <Filter size={18} />
                        Loại
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all">
                        Trạng thái
                    </button>
                </div>
            </div>

            <AdminTable 
                headers={['Dịch vụ', 'Loại', 'Nhà cung cấp', 'Giá cơ bản', 'Đánh giá', 'Trạng thái', '']}
                title="Tất cả dịch vụ"
                description="Tổng cộng có 1,240 dịch vụ đang hoạt động."
            >
                {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-5">
                            <div className="max-w-[300px]">
                                <p className="text-sm font-black text-slate-900 truncate leading-tight">{svc.name}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-gray-400">
                                    <MapPin size={10} />
                                    {svc.location}
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-600">
                            <div className="flex items-center gap-2 uppercase tracking-wide text-[10px]">
                                {getTypeIcon(svc.type)}
                                {svc.type}
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                {svc.provider}
                            </span>
                        </td>
                        <td className="px-8 py-5">
                            <span className="text-sm font-black text-slate-900">{svc.price}</span>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-1">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="text-sm font-black text-slate-700">{svc.rating}</span>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(svc.status)} uppercase tracking-tight`}>
                                {svc.status.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                            <button className="p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-all">
                                <MoreVertical size={20} />
                            </button>
                        </td>
                    </tr>
                ))}
            </AdminTable>
        </div>
    );
};

export default AdminServices;
