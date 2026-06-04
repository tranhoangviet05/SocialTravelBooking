import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../api/authApi';
import bookingApi from '../../api/bookingApi';
import { Ticket, Gift, Calendar } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [myCoupons, setMyCoupons] = useState([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    
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

            // Fetch coupons
            setLoadingCoupons(true);
            bookingApi.getMyCoupons()
                .then(res => {
                    if (res.success) setMyCoupons(res.data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingCoupons(false));
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { getCurrentUser } = await import('../../firebase/services/authService');
            const fbUser = getCurrentUser();
            if (!fbUser) throw new Error('Không tìm thấy người dùng Firebase');

            const idToken = await fbUser.getIdToken();
            const response = await authApi.updateProfile(idToken, {
                display_name: formData.display_name,
                username: formData.username,
                phone: formData.phone
            });

            if (response.success) {
                await refreshProfile();
                setIsEditing(false);
                alert('Cập nhật hồ sơ thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            alert(error.response?.data?.message || 'Lỗi cập nhật hồ sơ');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
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
                                        <Button 
                                            variant="primary" 
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </Button>
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

            {/* Coupons Section */}
            <h2 className="text-xl font-bold text-slate-800 mt-10 mb-4 flex items-center gap-2">
                <Ticket className="text-emerald-500" /> Ưu đãi của tôi
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                {loadingCoupons ? (
                    <div className="text-center py-4 text-slate-400 font-medium animate-pulse">Đang tải mã giảm giá...</div>
                ) : myCoupons.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-medium">Bạn chưa có mã giảm giá nào.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myCoupons.map(c => (
                            <div key={c.id} className={`p-5 rounded-2xl border-2 flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md ${c.is_available ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50' : 'border-slate-200 bg-slate-50 opacity-75'}`}>
                                {!c.is_public && (
                                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg">
                                        Mã riêng
                                    </div>
                                )}
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 mt-1">
                                        <div className="font-black text-xl text-slate-800 tracking-tight">{c.code}</div>
                                        <p className="text-sm font-bold text-emerald-600 mt-1">
                                            Giảm {c.type === 'percent' ? `${c.discount_value}%` : new Intl.NumberFormat('vi-VN').format(c.discount_value) + 'đ'}
                                            {c.type === 'percent' && c.max_discount && ` (Tối đa ${new Intl.NumberFormat('vi-VN').format(c.max_discount)}đ)`}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200">
                                        <Gift size={24} className="text-emerald-600" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 text-[11px] text-slate-500 font-medium mt-2 bg-white/60 p-2.5 rounded-lg border border-slate-100">
                                    {c.min_order_amount > 0 && <span>• Đơn tối thiểu: <strong className="text-slate-700">{new Intl.NumberFormat('vi-VN').format(c.min_order_amount)}đ</strong></span>}
                                    {c.valid_until ? (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> HSD: <strong className="text-slate-700">{new Date(c.valid_until).toLocaleDateString('vi-VN')}</strong>
                                        </span>
                                    ) : (
                                        <span>• Không giới hạn thời gian</span>
                                    )}
                                </div>
                                {!c.is_available && c.unavailability_reason && (
                                    <div className="text-[11px] font-bold text-rose-500 mt-1 bg-rose-50 border border-rose-100 p-2 rounded-lg text-center">
                                        {c.unavailability_reason}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Access Links */}
            <div className="mt-6 space-y-3">
                {/* Lịch sử đặt chỗ */}
                <div 
                    onClick={() => navigate('/my-bookings')}
                    className="bg-white rounded-xl shadow-sm border border-rose-200 p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                >
                    <div>
                        <h3 className="font-bold text-slate-800 text-base group-hover:text-rose-600 transition-colors">
                            Lịch sử đặt chỗ
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">Xem tất cả đơn hàng</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                    </div>
                </div>

                {/* Danh sách yêu thích */}
                <div 
                    onClick={() => navigate('/wishlist')}
                    className="bg-white rounded-xl shadow-sm border border-sky-200 p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                >
                    <div>
                        <h3 className="font-bold text-slate-800 text-base group-hover:text-sky-600 transition-colors">
                            Danh sách yêu thích Tour &amp; khách sạn lưu trú
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">Xem danh sách Tour &amp; khách sạn đã lưu</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
