import React, { useState, useEffect } from 'react';
import {
    CalendarCheck, Bell, Wallet, Star, TrendingUp, Plus, Loader2, Package, AlertCircle
} from 'lucide-react';
import providerApi from '../../api/providerApi';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await providerApi.getStats();
                if (res.success) setStats(res.data);
            } catch (err) {
                console.error('Dashboard stats error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Đang tải dữ liệu...</p>
            </div>
        );
    }

    // Nếu chưa có Provider Profile
    if (stats && !stats.has_profile) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bảng điều khiển</h2>
                    <p className="text-slate-500 font-medium mt-1">Chào mừng bạn đến với Cổng Nhà cung cấp!</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 text-center">
                    <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-amber-800 mb-2">Chưa có hồ sơ nhà cung cấp</h3>
                    <p className="text-amber-600 mb-6">Hồ sơ kinh doanh của bạn chưa được thiết lập. Vui lòng liên hệ Admin để được kích hoạt.</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Dịch vụ hoạt động', value: stats?.active_services || 0, color: 'from-blue-500 to-sky-400', icon: Package },
        { label: 'Tổng đặt chỗ', value: stats?.total_bookings || 0, color: 'from-violet-600 to-purple-400', icon: CalendarCheck },
        { label: 'Chờ xác nhận', value: stats?.pending_bookings || 0, color: 'from-amber-500 to-orange-400', icon: Bell },
        { label: 'Doanh thu (VNĐ)', value: Number(stats?.revenue || 0).toLocaleString('vi-VN'), color: 'from-emerald-600 to-teal-400', icon: Wallet },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bảng điều khiển</h2>
                <p className="text-slate-500 font-medium mt-1">
                    Chào mừng <span className="text-emerald-600 font-black">{stats?.business_name || 'Nhà cung cấp'}</span>, đây là hiệu suất kinh doanh của bạn!
                </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={26} className="text-white" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Đánh giá trung bình */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Tổng quan đánh giá</h3>
                            <p className="text-slate-400 text-sm font-medium">Điểm đánh giá từ khách hàng</p>
                        </div>
                        <button
                            onClick={() => navigate('/provider/reviews')}
                            className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
                        >
                            Xem tất cả
                        </button>
                    </div>
                    <div className="flex items-center gap-8 py-8">
                        <div className="text-center">
                            <div className="text-6xl font-black text-emerald-600">{stats?.avg_rating || '—'}</div>
                            <div className="flex items-center justify-center gap-1 mt-2">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={18} className={i <= Math.round(stats?.avg_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                ))}
                            </div>
                            <p className="text-sm text-slate-400 font-bold mt-2">{stats?.total_reviews || 0} đánh giá</p>
                        </div>
                        <div className="flex-1 border-l border-slate-100 pl-8">
                            <p className="text-slate-500 leading-relaxed">
                                {stats?.total_reviews > 0
                                    ? 'Khách hàng đánh giá dịch vụ của bạn rất tốt! Hãy tiếp tục duy trì chất lượng để thu hút thêm nhiều khách hàng mới.'
                                    : 'Chưa có đánh giá nào. Khi khách hàng sử dụng dịch vụ và để lại đánh giá, thông tin sẽ hiển thị tại đây.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-900/10">
                    <h3 className="text-xl font-black mb-2 tracking-tight">Thao tác nhanh</h3>
                    <p className="text-emerald-100/80 text-sm font-medium mb-8 leading-relaxed">
                        Quản lý dịch vụ và đơn hàng của bạn ngay tại đây.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/provider/services')}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm font-black transition-all border border-white/20 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Thêm dịch vụ mới
                        </button>
                        <button
                            onClick={() => navigate('/provider/bookings')}
                            className="w-full py-4 bg-white text-emerald-700 rounded-2xl text-sm font-black shadow-lg transition-all hover:scale-[1.02]"
                        >
                            Quản lý đặt chỗ ({stats?.pending_bookings || 0} chờ duyệt)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
