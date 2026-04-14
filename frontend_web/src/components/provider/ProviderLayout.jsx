import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, Bell, ChevronRight
} from 'lucide-react';
import ProviderSidebar from './ProviderSidebar';

const ProviderLayout = ({ children }) => {
    const location = useLocation();

    // Logic sinh Breadcrumbs đơn giản dựa trên path
    const getBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter((x) => x);
        return pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;

            // Map tên hiển thị
            let label = name.charAt(0).toUpperCase() + name.slice(1);
            if (name === 'provider') label = 'Nhà cung cấp';
            if (name === 'services') label = 'Dịch vụ của tôi';
            if (name === 'bookings') label = 'Lịch đặt chỗ';
            if (name === 'reviews') label = 'Đánh giá';
            if (name === 'wallet') label = 'Ví & Doanh thu';
            if (name === 'settings') label = 'Cài đặt cửa hàng';
            if (name === 'dashboard') label = 'Bảng điều khiển';

            return (
                <div key={routeTo} className="flex items-center">
                    <ChevronRight size={14} className="mx-2 text-slate-300" />
                    {isLast ? (
                        <span className="text-slate-900 font-bold text-sm">{label}</span>
                    ) : (
                        <Link to={routeTo} className="text-slate-400 hover:text-emerald-600 transition-colors text-sm font-medium">
                            {label}
                        </Link>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar chuyên biệt */}
            <ProviderSidebar />

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
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/20"></span>
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

export default ProviderLayout;
