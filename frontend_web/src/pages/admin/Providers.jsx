import React from 'react';
import { ShieldCheck, Briefcase, Mail, MapPin, Search, Plus } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';

const AdminProviders = () => {
    const providers = [
        { id: 'p1', businessName: 'Sun Group', type: 'Tập đoàn đa ngành', address: 'Hà Nội', status: 'approved', joinedAt: '2023-01-10' },
        { id: 'p2', businessName: 'Oxalis Adventure', type: 'Du lịch mạo hiểm', address: 'Quảng Bình', status: 'approved', joinedAt: '2023-05-15' },
        { id: 'p3', businessName: 'Linh Homestay', type: 'Cá thể kinh doanh', address: 'Sapa', status: 'pending', joinedAt: '2024-04-01' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nhà cung cấp</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý đối tác và phê duyệt hồ sơ kinh doanh.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus size={18} /> Mời đối tác
                </button>
            </div>
            
            <AdminTable 
                headers={['Doanh nghiệp', 'Loại hình', 'Địa chỉ', 'Ngày tham gia', 'Trạng thái', '']}
                title="Danh sách đối tác"
            >
                {providers.map(p => (
                    <tr key={p.id}>
                        <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-900">{p.businessName}</p>
                            <p className="text-[11px] text-gray-400 font-bold">ID: {p.id}</p>
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-600 font-medium">{p.type}</td>
                        <td className="px-8 py-5 text-sm text-gray-500 font-medium">{p.address}</td>
                        <td className="px-8 py-5 text-sm text-gray-400 font-bold">{p.joinedAt}</td>
                        <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${p.status === 'approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                {p.status}
                            </span>
                        </td>
                        <td className="px-8 py-5 text-right font-bold text-sky-500 cursor-pointer">Chi tiết</td>
                    </tr>
                ))}
            </AdminTable>
        </div>
    );
};

export default AdminProviders;
