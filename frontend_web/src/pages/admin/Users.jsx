import React, { useState } from 'react';
import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    UserPlus, 
    Shield, 
    User, 
    Ban, 
    CheckCircle,
    Mail,
    Calendar,
    Settings2,
    Clock
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const users = [
        { id: 'u1', username: 'john_doe', email: 'john@example.com', displayName: 'John Doe', role: 'tourist', status: 'active', createdAt: '2024-01-15' },
        { id: 'u2', username: 'travel_agent', email: 'agent@pro.vn', displayName: 'Minh Travel', role: 'provider', status: 'active', createdAt: '2024-02-10' },
        { id: 'u3', username: 'admin_stb', email: 'admin@stb.com', displayName: 'System Admin', role: 'admin', status: 'active', createdAt: '2023-12-01' },
        { id: 'u4', username: 'test_user', email: 'test@gmail.com', displayName: 'Test Forbidden', role: 'tourist', status: 'banned', createdAt: '2024-03-05' },
        { id: 'u5', username: 'anna_smith', email: 'anna@smith.uk', displayName: 'Anna Smith', role: 'tourist', status: 'pending', createdAt: '2024-04-12' },
    ];

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><Shield size={12} /> Admin</span>;
            case 'provider': return <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><Settings2 size={12} /> Provider</span>;
            default: return <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><User size={12} /> Tourist</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle size={14} /> Active</span>;
            case 'banned': return <span className="flex items-center gap-1 text-rose-500 font-bold text-xs"><Ban size={14} /> Banned</span>;
            default: return <span className="flex items-center gap-1 text-amber-500 font-bold text-xs"><Clock size={14} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Người dùng</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Xem và quản lý tất cả tài khoản trong hệ thống Social Travel Booking.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                    <UserPlus size={18} />
                    Thêm người dùng mới
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên, email, username..." 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-3 border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all">
                        <Filter size={18} />
                        Lọc vai trò
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all">
                        Trạng thái
                    </button>
                </div>
            </div>

            <AdminTable 
                headers={['Người dùng', 'Vai trò', 'Ngày tham gia', 'Trạng thái', '']}
                title="Danh sách thành viên"
                description={`Hiển thị ${users.length} người dùng.`}
            >
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-sky-500/10">
                                    {user.displayName[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{user.displayName}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                            <Mail size={10} />
                                            {user.email}
                                        </div>
                                        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">@{user.username}</div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5">{getRoleBadge(user.role)}</td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                <Calendar size={14} className="text-gray-300" />
                                {user.createdAt}
                            </div>
                        </td>
                        <td className="px-8 py-5">{getStatusBadge(user.status)}</td>
                        <td className="px-8 py-5 text-right">
                            <button className="p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-all">
                                <MoreHorizontal size={20} />
                            </button>
                        </td>
                    </tr>
                ))}
            </AdminTable>
        </div>
    );
};

export default AdminUsers;
