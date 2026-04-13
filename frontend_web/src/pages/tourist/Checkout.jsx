import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Loader2 } from 'lucide-react';

const Checkout = () => {
    const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' or 'momo'
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsProcessing(true);
        // Giả lập thời gian xử lý thanh toán (2 giây)
        setTimeout(() => {
            setIsProcessing(false);
            navigate('/checkout-success');
        }, 2000);
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Xác nhận thanh toán</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form thông tin người đặt */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Thông tin liên hệ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Họ và tên" placeholder="VD: Nguyễn Văn A" />
                            <Input label="Số điện thoại" placeholder="VD: 0901234567" />
                            <div className="md:col-span-2">
                                <Input label="Email" placeholder="dienemail@gmail.com" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú đặc biệt</label>
                                <textarea className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-sky-500 transition-colors text-sm" rows="3" placeholder="Yêu cầu dị ứng đồ ăn, giờ nhận phòng..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-sky-500 bg-sky-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" className="w-5 h-5 text-sky-600 focus:ring-sky-500" 
                                    checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} 
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-bold text-slate-800">Thanh toán bằng Ví SocialTravel</span>
                                    <span className="block text-xs text-gray-500">Số dư hiện tại: 5,000,000 đ</span>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-pink-500 bg-pink-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" className="w-5 h-5 text-pink-600 focus:ring-pink-500" 
                                    checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} 
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-bold text-slate-800">Thanh toán qua Ví điện tử Momo</span>
                                    <span className="block text-xs text-gray-500">Mã QR Code an toàn, nhanh chóng</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Tóm tắt đơn hàng */}
                <div className="w-full lg:w-96">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Tóm tắt dịch vụ</h2>
                        <div className="mb-4">
                            <img src="https://images.unsplash.com/photo-1595183492723-4c92b2d07e60?w=400&q=80" alt="Service" className="w-full h-32 object-cover rounded-lg mb-3"/>
                            <h3 className="font-bold text-sm text-slate-800">Tour Khám Phá Đà Lạt 3N2Đ</h3>
                            <p className="text-secondary text-xs mt-1">Cung cấp bởi: Viettravel</p>
                        </div>
                        
                        <div className="space-y-2 text-sm border-b border-dashed py-3 border-gray-200">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Check-in</span>
                                <span className="font-semibold text-slate-800">20/05/2026</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Khách</span>
                                <span className="font-semibold text-slate-800">2 Người lớn</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm py-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Đơn giá</span>
                                <span className="font-semibold text-slate-800">1,500,000 đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã giảm giá</span>
                                <span className="font-semibold text-green-600">- 150,000 đ</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3 mt-1 mb-6 flex justify-between items-center">
                            <span className="font-bold text-slate-800">Tổng cộng</span>
                            <span className="text-xl font-black text-red-500">2,850,000 đ</span>
                        </div>

                        <Button 
                            variant="primary" 
                            className="w-full py-3 text-base flex justify-center items-center gap-2"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Thanh toán ngay'
                            )}
                        </Button>
                        <p className="text-[11px] text-center text-gray-400 mt-3">Bằng cách nhấn thanh toán, bạn đồng ý với Điều khoản dịch vụ</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
