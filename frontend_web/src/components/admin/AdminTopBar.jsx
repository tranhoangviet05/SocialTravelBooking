import React from 'react';
import { Search, Bell, Menu, Maximize, Calendar } from 'lucide-react';

const AdminTopBar = ({ title }) => {
    const today = new Date().toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 font-medium">
                    <Calendar size={12} />
                    <span>{today}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl w-80 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500/50 transition-all duration-300">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm dữ liệu toàn hệ thống..."
                        className="text-sm text-gray-700 bg-transparent outline-none w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all lg:hidden">
                        <Menu size={20} />
                    </button>
                    <button className="hidden sm:flex p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                        <Maximize size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminTopBar;
