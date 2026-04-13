import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, CalendarDays, Download } from 'lucide-react';
import Button from '../../components/common/Button';
import confetti from 'canvas-confetti';

const Success = () => {
    const navigate = useNavigate();

    // Hiệu ứng pháo giấy ăn mừng
    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full p-8 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-white -z-10"></div>
                
                <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-2">Thanh toán thành công!</h1>
                <p className="text-slate-500 mb-8">
                    Cảm ơn bạn đã đặt dịch vụ. Mã giao dịch của bạn là <span className="font-bold text-sky-600">#STB-98A7F2</span>. <br/>Chúng tôi đã gửi email xác nhận chi tiết đến bạn.
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                    <h3 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2 mb-3">Thông tin đơn hàng</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Dịch vụ:</span>
                            <span className="font-semibold text-slate-800 text-right">Tour Khám Phá Đà Lạt 3N2Đ</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Người đặt:</span>
                            <span className="font-semibold text-slate-800">Nguyễn Văn Khách</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Ngày khởi hành:</span>
                            <span className="font-semibold text-slate-800">20/05/2026</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 mt-1">
                            <span className="text-slate-500 font-bold">Tổng tiền:</span>
                            <span className="font-black text-sky-600 text-lg">2,850,000 đ</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={() => navigate('/my-bookings')}
                        className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                    >
                        <CalendarDays size={18} />
                        Quản lý vé của tôi
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                    >
                        <Home size={18} />
                    </button>
                    <button 
                        className="sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                        title="Tải biên lai PDF"
                    >
                        <Download size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Success;
