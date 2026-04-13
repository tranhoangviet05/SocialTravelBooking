import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, MapPin, Hotel, Compass,
    BarChart3, Settings, LogOut, Bell, Search, ChevronRight
} from 'lucide-react';
import { API_ENDPOINTS } from '../../utils/ConstantSystems';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: API_ENDPOINTS.ADMIN_DASHBOARD },
    { icon: Users, label: 'Người dùng', path: API_ENDPOINTS.USERS_ADMIN },
    { icon: MapPin, label: 'Địa điểm', path: API_ENDPOINTS.LOCATIONS_ADMIN },
    { icon: Hotel, label: 'Lưu trú', path: API_ENDPOINTS.HOTELS_ADMIN },
    { icon: Compass, label: 'Tours & Hoạt động', path: API_ENDPOINTS.TOURS_ADMIN },
    { icon: BarChart3, label: 'Thống kê', path: API_ENDPOINTS.STATS_ADMIN },
    { icon: Settings, label: 'Cài đặt', path: API_ENDPOINTS.SETTINGS_ADMIN },
];

const AdminLayout = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    // Logic sinh Breadcrumbs đơn giản dựa trên path
    const getBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter((x) => x);
        return pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;

            // Map tên hiển thị
            let label = name.charAt(0).toUpperCase() + name.slice(1);
            if (name === 'admin') label = 'Quản trị';
            if (name === 'locations') label = 'Địa điểm';
            if (name === 'dashboard') label = 'Bảng điều khiển';
            if (name === 'users') label = 'Người dùng';

            return (
                <div key={routeTo} className="flex items-center">
                    <ChevronRight size={14} className="mx-2 text-slate-300" />
                    {isLast ? (
                        <span className="text-slate-900 font-bold text-sm">{label}</span>
                    ) : (
                        <Link to={routeTo} className="text-slate-400 hover:text-sky-600 transition-colors text-sm font-medium">
                            {label}
                        </Link>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl shadow-slate-900/20">
                {/* Logo */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-black text-xl italic shadow-lg shadow-sky-500/20">S</div>
                        <div>
                            <h1 className="text-lg font-black tracking-tighter leading-none">STB Admin</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Management Hub</p>
                        </div>
                    </div>
                </div>

                {/* Menu Nav */}
                <nav className="flex-1 p-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.label} to={item.path}>
                                <button
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group
                                        ${isActive
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                                    {item.label}
                                </button>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-sky-400 font-black shadow-inner">
                            {(currentUser?.displayName || currentUser?.email || 'A')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate text-slate-100">{currentUser?.displayName || 'Administrator'}</p>
                            <p className="text-[10px] text-sky-500 font-bold truncate uppercase tracking-tighter">System Manager</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-rose-400 hover:bg-rose-500/10 transition-all group cursor-pointer"
                    >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20">
                            <LogOut size={16} />
                        </div>
                        ĐĂNG XUẤT
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Top bar */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-[40]">
                    {/* Left: Breadcrumbs & Page Info */}
                    <div className="flex items-center">
                        <div className="flex items-center text-slate-400">
                            <LayoutDashboard size={18} />
                            {getBreadcrumbs()}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-end">
                        <button className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full border-2 border-white ring-2 ring-sky-500/20"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-10 animate-[fadeIn_0.4s_ease-out]">
                    {children}
                </main>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AdminLayout;
