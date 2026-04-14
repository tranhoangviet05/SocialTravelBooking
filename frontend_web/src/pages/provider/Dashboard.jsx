import React from 'react';
import { 
    CalendarCheck, 
    Bell, 
    Wallet, 
    Star, 
    TrendingUp, 
    Plus 
} from 'lucide-react';

const ProviderDashboard = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bảng điều khiển</h2>
                <p className="text-slate-500 font-medium mt-1">Chào mừng bạn quay trở lại, đây là hiệu suất kinh doanh của bạn!</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Tổng đặt chỗ', value: '128', change: '+12%', color: 'from-blue-500 to-sky-400', icon: CalendarCheck },
                    { label: 'Chờ xác nhận', value: '15', change: 'Mới', color: 'from-amber-500 to-orange-400', icon: Bell },
                    { label: 'Doanh thu tháng', value: '24.5M₫', change: '+18.5%', color: 'from-emerald-600 to-teal-400', icon: Wallet },
                    { label: 'Đánh giá TB', value: '4.8', change: '+0.3', color: 'from-violet-600 to-purple-400', icon: Star },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={26} className="text-white" />
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Đặt chỗ mới nhất</h3>
                            <p className="text-slate-400 text-sm font-medium">Theo dõi các đơn hàng vừa được đặt</p>
                        </div>
                        <button className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                            Xem tất cả
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                            <CalendarCheck size={40} />
                        </div>
                        <p className="text-slate-400 font-bold">Chưa có dữ liệu đặt chỗ mới</p>
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-900/10">
                    <h3 className="text-xl font-black mb-2 tracking-tight">Mẹo tăng trưởng</h3>
                    <p className="text-emerald-100/80 text-sm font-medium mb-8 leading-relaxed">
                        Cập nhật hình ảnh chất lượng cao để tăng tỷ lệ đặt chỗ lên tới 40%!
                    </p>
                    <div className="space-y-4">
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm font-black transition-all border border-white/20">
                            Thêm dịch vụ mới
                        </button>
                        <button className="w-full py-4 bg-white text-emerald-700 rounded-2xl text-sm font-black shadow-lg transition-all hover:scale-[1.02]">
                            Tải báo cáo tháng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
