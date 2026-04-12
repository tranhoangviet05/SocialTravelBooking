import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Hotel, Compass, CalendarCheck, Star, Wallet, Settings, LogOut, Bell, Search } from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Hotel, label: 'Chỗ nghỉ của tôi' },
    { icon: Compass, label: 'Tours của tôi' },
    { icon: CalendarCheck, label: 'Đặt chỗ' },
    { icon: Star, label: 'Đánh giá' },
    { icon: Wallet, label: 'Thu nhập' },
    { icon: Settings, label: 'Cài đặt' },
];

const ProviderDashboard = () => {
    const { currentUser, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-emerald-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-lg font-black tracking-tight">
                        <span className="text-emerald-400">STB</span> Provider
                    </h1>
                    <p className="text-xs text-emerald-200/60 mt-1">Quản lý dịch vụ</p>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
                                ${item.active
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                            {(currentUser?.displayName || currentUser?.email || 'P')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{currentUser?.displayName || 'Provider'}</p>
                            <p className="text-xs text-emerald-200/60 truncate">{currentUser?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="text-sm text-gray-700 outline-none w-64"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative cursor-pointer text-gray-500 hover:text-gray-800">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">2</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard content */}
                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                        <p className="text-gray-500 text-sm mt-1">Quản lý dịch vụ du lịch của bạn</p>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Tổng đặt chỗ', value: '48', change: '+5', color: 'bg-sky-500' },
                            { label: 'Chờ xác nhận', value: '12', change: 'Mới', color: 'bg-amber-500' },
                            { label: 'Thu nhập tháng', value: '8.5M₫', change: '+15%', color: 'bg-emerald-500' },
                            { label: 'Đánh giá TB', value: '4.7★', change: '+0.2', color: 'bg-violet-500' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <Wallet size={20} className="text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Placeholder */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Đặt chỗ gần đây</h3>
                        <p className="text-gray-400 text-sm">Nội dung sẽ được cập nhật sau...</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderDashboard;
