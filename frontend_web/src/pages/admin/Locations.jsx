import React from 'react';
import { MapPin, Plus, Image as ImageIcon, Search } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';

const AdminLocations = () => {
    const locations = [
        { id: 1, name: 'Đà Nẵng', slug: 'da-nang', popular: true, count: 125, image: 'https://images.unsplash.com/photo-1559592442-7e18259f77cc' },
        { id: 2, name: 'Sapa', slug: 'sapa', popular: true, count: 84, image: 'https://images.unsplash.com/photo-1504457047772-27faf1c00561' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Địa điểm du lịch</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các tỉnh thành và điểm đến nổi bật.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <Plus size={18} /> Thêm địa điểm
                </button>
            </div>
            
            <AdminTable 
                headers={['Hình ảnh', 'Tên địa điểm', 'Slug', 'Dịch vụ', 'Phổ biến', '']}
                title="Tất cả địa điểm"
            >
                {locations.map(l => (
                    <tr key={l.id}>
                        <td className="px-8 py-5">
                            <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                            </div>
                        </td>
                        <td className="px-8 py-5 font-black text-slate-900 text-sm">{l.name}</td>
                        <td className="px-8 py-5 font-mono text-xs text-gray-400">{l.slug}</td>
                        <td className="px-8 py-5 font-bold text-slate-600 text-sm">{l.count}</td>
                        <td className="px-8 py-5">
                            <span className={`w-3 h-3 rounded-full inline-block ${l.popular ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-gray-200'}`}></span>
                        </td>
                        <td className="px-8 py-5 text-right font-bold text-sky-500 cursor-pointer text-sm">Chỉnh sửa</td>
                    </tr>
                ))}
            </AdminTable>
        </div>
    );
};

export default AdminLocations;
