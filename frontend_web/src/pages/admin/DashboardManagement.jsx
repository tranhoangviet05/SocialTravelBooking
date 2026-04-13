import React from 'react';
import {
    Users,
    Briefcase,
    Compass,
    BarChart3,
    TrendingUp,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import AdminMetricCard from '../../components/admin/AdminMetricCard';
import AdminTable from '../../components/admin/AdminTable';
import AdminLayout from '../../components/admin/AdminLayout';

const revenueData = [
    { name: 'T1', revenue: 450, bookings: 120 },
    { name: 'T2', revenue: 580, bookings: 145 },
    { name: 'T3', revenue: 490, bookings: 110 },
    { name: 'T4', revenue: 850, bookings: 210 },
    { name: 'T5', revenue: 760, bookings: 180 },
    { name: 'T6', revenue: 920, bookings: 230 },
    { name: 'T7', revenue: 1200, bookings: 280 },
];

const DashboardManagement = () => {
    const stats = [
        { label: 'Tổng người dùng', value: '2,451', icon: Users, change: '+12.5%', trend: 'up', color: 'sky' },
        { label: 'Nhà cung cấp', value: '184', icon: Briefcase, change: '+5.2%', trend: 'up', color: 'indigo' },
        { label: 'Tổng doanh thu', value: '1.2B₫', icon: BarChart3, change: '+23.1%', trend: 'up', color: 'emerald' },
        { label: 'Booking mới', value: '42', icon: Clock, change: '-2.4%', trend: 'down', color: 'amber' },
    ];

    const recentBookings = [
        { id: 'BK-9802', customer: 'Nguyễn Văn A', service: 'Tour Fansipan 3 ngày 2 đêm', amount: '2,400,000₫', status: 'Completed', date: '10 ph trước' },
        { id: 'BK-9801', customer: 'Trần Thị B', service: 'InterContinental Danang', amount: '5,600,000₫', status: 'Pending', date: '25 ph trước' },
        { id: 'BK-9800', customer: 'Lê Văn C', service: 'Vé Bà Nà Hills', amount: '1,800,000₫', status: 'Cancelled', date: '1 giờ trước' },
        { id: 'BK-9799', customer: 'Phạm Minh D', service: 'Tour Vịnh Hạ Long', amount: '3,200,000₫', status: 'Completed', date: '2 giờ trước' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Chào buổi sáng, Admin!</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Hệ thống Social Travel Booking đang hoạt động bình thường.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer">Tải báo cáo PDF</button>
                        <button className="bg-sky-500 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all cursor-pointer">Live Analytics</button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <AdminMetricCard key={idx} {...stat} />
                    ))}
                </div>

                {/* Revenue Chart Section */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Phân tích Doanh thu</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Dữ liệu 7 tháng gần nhất (Triệu VND)</p>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
                            <TrendingUp size={16} />
                            <span className="text-sm font-black">+24% so với năm ngoái</span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#0ea5e9', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0ea5e9"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Bookings Table */}
                    <div className="lg:col-span-2">
                        <AdminTable
                            title="Giao dịch mới nhất"
                            description="Danh sách các đơn đặt chỗ vừa được thực hiện trong hệ thống."
                            headers={['ID', 'Khách hàng', 'Dịch vụ', 'Giá trị', 'Trạng thái']}
                            actions={<button className="text-sky-500 font-bold text-xs uppercase tracking-widest hover:text-sky-600">Xem tất cả</button>}
                        >
                            {recentBookings.map((bk) => (
                                <tr key={bk.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4 font-mono text-xs font-bold text-gray-400">{bk.id}</td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm font-bold text-slate-700">{bk.customer}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm text-gray-600 block max-w-[200px] truncate">{bk.service}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm font-black text-slate-900">{bk.amount}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(bk.status)}`}>
                                            {bk.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </AdminTable>
                    </div>

                    {/* System Health / Revenue Source */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Nguồn doanh thu</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Tours & Trải nghiệm', value: '65%', color: 'bg-sky-500' },
                                    { label: 'Khách sạn & Resort', value: '25%', color: 'bg-emerald-500' },
                                    { label: 'Dịch vụ di chuyển', value: '10%', color: 'bg-amber-500' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                                            <span className="text-sm font-black text-slate-900">{item.value}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color}`} style={{ width: item.value }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#0f172a] rounded-3xl p-8 shadow-xl text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <Compass className="text-sky-400 mb-4" size={32} />
                                <h3 className="text-lg font-bold mb-2">Mở rộng mạng lưới?</h3>
                                <p className="text-gray-400 text-sm mb-6 font-medium leading-relaxed">Có 12 nhà cung cấp đang chờ phê duyệt hồ sơ kinh doanh.</p>
                                <button className="w-full bg-sky-500 hover:bg-sky-600 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-sky-500/20 transition-all">Phê duyệt ngay</button>
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DashboardManagement;
