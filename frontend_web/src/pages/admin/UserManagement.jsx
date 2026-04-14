import React, { useState, useEffect } from 'react';
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
    Clock,
    Loader2,
    Check
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../api/adminApi';

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getAllUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            const response = await adminApi.updateUserRole(userId, newRole);
            if (response.success) {
                alert('Cập nhật vai trò thành công');
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            const msg = error.response?.data?.message || 'Lỗi khi cập nhật vai trò';
            alert(msg);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        setUpdatingId(userId);
        try {
            const response = await adminApi.updateUserStatus(userId, newStatus);
            if (response.success) {
                alert('Cập nhật trạng thái thành công');
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><Shield size={12} /> Admin</span>;
            case 'provider': return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><Settings2 size={12} /> Provider</span>;
            default: return <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><User size={12} /> Client</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle size={14} /> Active</span>;
            case 'banned': return <span className="flex items-center gap-1 text-rose-500 font-bold text-xs"><Ban size={14} /> Banned</span>;
            default: return <span className="flex items-center gap-1 text-amber-500 font-bold text-xs"><Clock size={14} /> Pending</span>;
        }
    };

    const filteredUsers = users.filter(user => 
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Người dùng</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Xem và quản lý tất cả tài khoản trong hệ thống.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên, email, username..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải danh sách người dùng...</p>
                    </div>
                ) : (
                    <AdminTable 
                        headers={['Người dùng', 'Vai trò (Cấp quyền)', 'Trạng thái', 'Hành động']}
                        title="Danh sách thành viên"
                        description={`Hiển thị ${filteredUsers.length} người dùng.`}
                    >
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-black text-sm shadow-sm overflow-hidden border border-white">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (user.display_name || user.email || 'U')[0].toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{user.display_name}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                                    <Mail size={10} />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-wrap gap-2">
                                        <select 
                                            value={user.role}
                                            disabled={updatingId === user.id}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border-0 bg-slate-50 text-slate-600 focus:ring-2 focus:ring-sky-500/20 cursor-pointer outline-none transition-all
                                                ${user.role === 'admin' ? 'text-rose-600 bg-rose-50' : ''}
                                                ${user.role === 'provider' ? 'text-emerald-600 bg-emerald-50' : ''}
                                            `}
                                        >
                                            <option value="tourist">Client (Tourist)</option>
                                            <option value="provider">Provider</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                        {updatingId === user.id && <Loader2 size={14} className="animate-spin text-sky-500 self-center" />}
                                    </div>
                                </td>
                                <td className="px-8 py-5">{getStatusBadge(user.status)}</td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        {user.status === 'active' ? (
                                            <button 
                                                onClick={() => handleStatusChange(user.id, 'banned')}
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all title='Ban user'"
                                            >
                                                <Ban size={18} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleStatusChange(user.id, 'active')}
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all title='Unban user'"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                )}
            </div>
        </AdminLayout>
    );
};

export default UserManagement;
