import React from 'react';
import { Ticket, Plus, Calendar, Percent, Trash2 } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminLayout from '../../components/admin/AdminLayout';

const CouponManagement = () => {
    const coupons = [
        { id: 'c1', code: 'CHAOHE2024', type: 'percent', val: '15%', min: '500,000₫', end: '2024-06-30', used: '124' },
        { id: 'c2', code: 'STBNEW', type: 'fixed', val: '100,000₫', min: '1,000,000₫', end: '2024-12-31', used: '45' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mã giảm giá</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Chiến dịch khuyến mãi và mã ưu đãi.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/20">
                        <Plus size={18} /> Tạo mã mới
                    </button>
                </div>
                
                <AdminTable 
                    headers={['Mã code', 'Loại giảm', 'Giá trị', 'Đơn tối thiểu', 'Ngày hết hạn', 'Đã dùng', '']}
                    title="Chiến dịch đang chạy"
                >
                    {coupons.map(c => (
                        <tr key={c.id}>
                            <td className="px-8 py-5">
                                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg font-mono font-black text-sm border-2 border-dashed border-amber-200">
                                    {c.code}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{c.type === 'percent' ? 'Phần trăm' : 'Cố định'}</span>
                            </td>
                            <td className="px-8 py-5 text-sm font-black text-slate-900">{c.val}</td>
                            <td className="px-8 py-5 text-sm text-gray-500 font-medium">{c.min}</td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
                                    <Calendar size={14} /> {c.end}
                                </div>
                            </td>
                            <td className="px-8 py-5 text-sm font-black text-slate-700">{c.used}</td>
                            <td className="px-8 py-5 text-right">
                                <button className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </AdminLayout>
    );
};

export default CouponManagement;
