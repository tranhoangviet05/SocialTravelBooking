import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, MoreHorizontal, User } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminLayout from '../../components/admin/AdminLayout';

const ReportManagement = () => {
    const reports = [
        { id: 'R-101', type: 'spam', status: 'pending', desc: 'Nội dung quảng cáo rác trong bình luận', user: 'Hoang Kim', time: '2 giờ trước' },
        { id: 'R-100', type: 'inappropriate', status: 'resolved', desc: 'Hình ảnh không phù hợp với tiêu chuẩn', user: 'Linh Nga', time: '1 ngày trước' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Báo cáo & Vi phạm</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Xử lý các báo cáo từ cộng đồng về nội dung và người dùng.</p>
                    </div>
                </div>
                
                <AdminTable 
                    headers={['ID', 'Loại báo cáo', 'Nội dung', 'Người báo cáo', 'Thời gian', 'Trạng thái', '']}
                    title="Yêu cầu cần xử lý"
                >
                    {reports.map(r => (
                        <tr key={r.id}>
                            <td className="px-8 py-5 font-mono text-xs text-gray-400 font-bold">{r.id}</td>
                            <td className="px-8 py-5">
                                <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                                    {r.type}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <p className="text-sm text-slate-700 font-medium max-w-[250px] truncate">{r.desc}</p>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <User size={14} className="text-gray-400" /> {r.user}
                                </div>
                            </td>
                            <td className="px-8 py-5 text-xs text-gray-400 font-medium">{r.time}</td>
                            <td className="px-8 py-5">
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${r.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {r.status === 'pending' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                    {r.status}
                                </div>
                            </td>
                            <td className="px-8 py-5 text-right font-bold text-sky-500 cursor-pointer text-sm">Xử lý</td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </AdminLayout>
    );
};

export default ReportManagement;
