import React, { useState } from 'react';
import { 
    Zap, 
    Link2, 
    Settings2, 
    Activity, 
    CheckCircle2, 
    AlertCircle, 
    RotateCcw,
    ExternalLink,
    Play,
    Pause
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';

const AdminAutomation = () => {
    const [workflows, setWorkflows] = useState([
        { 
            id: 'wf-1', 
            name: 'Cross-sell Automation', 
            desc: 'Tự động gửi email giới thiệu Tour khi khách đặt Khách sạn.',
            status: 'active', 
            lastRun: '15 ph trước', 
            successRate: '98%',
            webhook: 'https://n8n.travelbooking.com/webhook/cross-sell'
        },
        { 
            id: 'wf-2', 
            name: 'Upsell Strategy', 
            desc: 'Gợi ý nâng cấp hạng phòng hoặc dịch vụ đi kèm sau 1 ngày đặt.',
            status: 'active', 
            lastRun: '2 giờ trước', 
            successRate: '95%',
            webhook: 'https://n8n.travelbooking.com/webhook/upsell'
        },
        { 
            id: 'wf-3', 
            name: 'Customer Retention', 
            desc: 'Gửi mã giảm giá cho khách hàng sau 30 ngày không quay lại.',
            status: 'paused', 
            lastRun: '1 ngày trước', 
            successRate: '100%',
            webhook: 'https://n8n.travelbooking.com/webhook/retention'
        }
    ]);

    const toggleStatus = (id) => {
        setWorkflows(prev => prev.map(wf => 
            wf.id === id ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' } : wf
        ));
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tự động hóa (n8n Workflow)</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các kịch bản Marketing và Chăm sóc khách hàng tự động thông qua n8n.</p>
            </div>

            {/* Connection Status Card */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10">
                            <Zap className="text-amber-400 fill-amber-400" size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black italic">TRẠNG THÁI KẾT NỐI N8N</h3>
                                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-tight">Đang trực tuyến</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mt-1 font-medium italic">https://n8n.travelbooking.vn (v1.2.4)</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all">
                            <RotateCcw size={18} /> Kiểm tra lại
                        </button>
                        <button className="flex items-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 rounded-2xl text-sm font-black shadow-lg shadow-sky-500/20 transition-all">
                            <Settings2 size={18} /> Cấu hình API
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            </div>

            {/* Workflow List */}
            <div className="grid grid-cols-1 gap-6">
                <AdminTable 
                    headers={['Tên luồng công việc', 'Trạng thái', 'Lần chạy cuối', 'Tỷ lệ thành công', 'Webhook URL', '']}
                    title="Kịch bản tự động hóa"
                    description="Danh sách các workflow đang kết nối với hệ thống n8n."
                >
                    {workflows.map((wf) => (
                        <tr key={wf.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-6">
                                <div>
                                    <p className="text-sm font-black text-slate-800">{wf.name}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-1">{wf.desc}</p>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${
                                    wf.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    {wf.status === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    <span className="text-[10px] font-black uppercase tracking-tight">{wf.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-slate-500 italic">{wf.lastRun}</td>
                            <td className="px-8 py-6">
                                <span className="text-sm font-black text-slate-900">{wf.successRate}</span>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                                    <Link2 size={12} />
                                    {wf.webhook.slice(0, 30)}...
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => toggleStatus(wf.id)}
                                        className={`p-2 rounded-xl transition-all ${
                                            wf.status === 'active' 
                                            ? 'text-amber-500 hover:bg-amber-50' 
                                            : 'text-emerald-500 hover:bg-emerald-50'
                                        }`}
                                        title={wf.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                    >
                                        {wf.status === 'active' ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <button className="p-2 text-gray-300 hover:text-sky-500 rounded-xl transition-all">
                                        <ExternalLink size={20} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Tổng số lần Trigger', value: '12,854', icon: Activity, color: 'text-sky-500' },
                    { label: 'Tiết kiệm thời gian', value: '450 giờ', icon: Zap, color: 'text-amber-500' },
                    { label: 'Tỷ lệ chuyển đổi', value: '+12.5%', icon: CheckCircle2, color: 'text-emerald-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminAutomation;
