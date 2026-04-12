import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    
    // States matching 'users' table schema
    const [formData, setFormData] = useState({
        username: '',
        display_name: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                username: currentUser.username || '',
                display_name: currentUser.displayName || currentUser.display_name || '',
                phone: currentUser.phone || '',
                email: currentUser.email || ''
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Hồ sơ cá nhân</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                            {currentUser?.photoURL || currentUser?.avatar_url ? (
                                <img 
                                    src={currentUser.photoURL || currentUser.avatar_url} 
                                    alt="Avatar" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-100" 
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-4xl text-slate-500 overflow-hidden font-bold">
                                    {(formData.display_name || formData.email || '?')[0].toUpperCase()}
                                </div>
                            )}
                            <Button variant="outline" size="sm">Đổi ảnh đại diện</Button>
                        </div>
                        
                        {/* Form Section */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label="Tên hiển thị (Display Name)" 
                                    name="display_name"
                                    value={formData.display_name} 
                                    onChange={handleChange}
                                    disabled={!isEditing} 
                                />
                                <Input 
                                    label="Tên đăng nhập (Username)" 
                                    name="username"
                                    value={formData.username} 
                                    onChange={handleChange}
                                    disabled={!isEditing} 
                                />
                                <Input 
                                    label="Số điện thoại" 
                                    name="phone"
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    disabled={!isEditing} 
                                />
                                <Input 
                                    label="Địa chỉ Email" 
                                    name="email"
                                    value={formData.email} 
                                    disabled={true} // Email không cho đổi tùy tiện
                                />
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
                                        <Button variant="primary" onClick={() => setIsEditing(false)}>Lưu thay đổi</Button>
                                    </>
                                ) : (
                                    <Button variant="primary" onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Section (Based on schema) */}
            <h2 className="text-xl font-bold text-slate-800 mt-10 mb-4">Ví điện tử của bạn</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 flex items-center justify-between">
                <div>
                    <h3 className="text-slate-500 text-sm font-medium">Số dư khả dụng (VND)</h3>
                    <p className="text-3xl font-bold text-sky-600 mt-1">0 <span className="text-lg">đ</span></p>
                    <p className="text-xs text-slate-400 mt-1">Số dư bị khóa: 0 đ</p>
                </div>
                <div className="space-x-3">
                    <Button variant="outline">Lịch sử giao dịch</Button>
                    <Button variant="primary">Nạp tiền vào ví</Button>
                </div>
            </div>
            
            {/* Password Section */}
            <h2 className="text-xl font-bold text-slate-800 mt-10 mb-4">Bảo mật</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="max-w-md space-y-6">
                    <Input type="password" label="Mật khẩu hiện tại" />
                    <Input type="password" label="Mật khẩu mới" />
                    <Input type="password" label="Xác nhận mật khẩu mới" />
                    <Button variant="primary">Đổi mật khẩu</Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
