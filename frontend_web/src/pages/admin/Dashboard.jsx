import React from 'react';
import { BarChart3 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const Dashboard = () => {
    return (
        <AdminLayout>
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Bảng tổng quan</h2>
                <p className="text-slate-500 font-medium mt-1">Chào mừng bạn quay trở lại hệ thống Social Travel Booking</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Tổng người dùng', value: '1,234', change: '+12%', color: 'border-sky-500/20 bg-sky-50/50 text-sky-600' },
                    { label: 'Tổng booking', value: '856', change: '+8%', color: 'border-emerald-500/20 bg-emerald-50/50 text-emerald-600' },
                    { label: 'Doanh thu tháng', value: '45.2M₫', change: '+23%', color: 'border-violet-500/20 bg-violet-50/50 text-violet-600' },
                    { label: 'Đánh giá 5★', value: '92%', change: '+2%', color: 'border-amber-500/20 bg-amber-50/50 text-amber-600' },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-white rounded-[24px] p-8 shadow-sm border ${stat.color.split(' ')[0]} transition-all hover:shadow-xl hover:shadow-slate-200/50 group`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color.split(' ')[1]} group-hover:scale-110 transition-transform`}>
                                <BarChart3 size={24} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{stat.change}</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Placeholder content */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                    <BarChart3 size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Hoạt động đang cập nhật</h3>
                <p className="text-slate-400 max-w-sm font-medium">Chúng tôi đang xử lý dữ liệu để cung cấp thông tin chi tiết nhất về hoạt động của hệ thống.</p>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
