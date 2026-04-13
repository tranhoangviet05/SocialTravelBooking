import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const MyBookings = () => {
    const navigate = useNavigate();
    // Mock data based strictly on the 'bookings' and 'services' table in postgres_schema.sql
    const [bookings] = useState([
        { 
            id: 'b1f6e2c-b075-4c52-a5f0-acebb130762c', 
            booking_code: 'BK-20260412-A8F1',
            service: {
                name: 'Tour Khám Phá Đà Lạt 3N2Đ',
                type: 'tour'
            },
            check_in_date: '2026-05-15',
            total_amount: 3500000,
            payment_method: 'momo',
            payment_status: 'paid', // 'pending', 'paid', 'refunded'
            status: 'confirmed'     // 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'
        },
        { 
            id: 'c2f6e2c-b075-4c52-a5f0-acebb130762d', 
            booking_code: 'BK-20260420-X9K2',
            service: {
                name: 'Khách sạn Mường Thanh Boutique',
                type: 'hotel'
            },
            check_in_date: '2026-06-01',
            total_amount: 1200000,
            payment_method: 'wallet',
            payment_status: 'pending',
            status: 'pending'
        },
        { 
            id: 'd3f6e2c-b075-4c52-a5f0-acebb130762e', 
            booking_code: 'BK-20260415-Y7M3',
            service: {
                name: 'Tour Biển Nha Trang 4N3Đ',
                type: 'tour'
            },
            check_in_date: '2026-03-10',
            total_amount: 4500000,
            payment_method: 'vnpay',
            payment_status: 'paid',
            status: 'completed'
        },
        { 
            id: 'e4f6e2c-b075-4c52-a5f0-acebb130762f', 
            booking_code: 'BK-20260410-Z5N4',
            service: {
                name: 'Resort Vinpearl Phú Quốc',
                type: 'hotel'
            },
            check_in_date: '2026-04-25',
            total_amount: 8000000,
            payment_method: 'banking',
            payment_status: 'refunded',
            status: 'cancelled'
        }
    ]);

    const [activeTab, setActiveTab] = useState('all');

    const handleDetail = (booking) => {
        // Navigate to booking detail or open modal
        console.log('View detail:', booking.booking_code);
        // For now, you can navigate to service detail or create a booking detail page
        navigate(`/service/${booking.id}`);
    };

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'pending', label: 'Chờ xử lý' },
        { id: 'confirmed', label: 'Đã xác nhận' },
        { id: 'ongoing', label: 'Đang diễn ra' },
        { id: 'completed', label: 'Hoàn thành' },
        { id: 'cancelled', label: 'Đã hủy' }
    ];

    const filteredBookings = activeTab === 'all' 
        ? bookings 
        : bookings.filter(booking => booking.status === activeTab);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getPaymentStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            paid: 'bg-green-50 text-green-700 border border-green-200',
            refunded: 'bg-purple-50 text-purple-700 border border-purple-200'
        };
        const labels = {
            pending: 'Chưa thanh toán',
            paid: 'Đã thanh toán',
            refunded: 'Đã hoàn tiền'
        };
        return (
            <span className={`px-2 py-0.5 text-xs rounded-md ${styles[status]}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Chuyến đi của tôi</h1>
            
            {/* Lịch sử đặt chỗ */}
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Lịch sử đặt chỗ</h2>
            
            {/* Status Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
                <div className="border-b border-slate-200">
                    <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Status tabs">
                        {tabs.map((tab) => {
                            const count = tab.id === 'all' 
                                ? bookings.length 
                                : bookings.filter(b => b.status === tab.id).length;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative px-5 py-4 text-sm font-medium whitespace-nowrap transition-all
                                        ${isActive 
                                            ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50/50' 
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-b-2 border-transparent'}
                                    `}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`
                                        ml-2 px-2 py-0.5 text-xs rounded-full
                                        ${isActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Mã Booking</th>
                                <th className="px-6 py-4">Dịch vụ</th>
                                <th className="px-6 py-4">Check-in</th>
                                <th className="px-6 py-4">Thanh toán</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{booking.booking_code}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{booking.service.name}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">{booking.service.type}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{booking.check_in_date}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{formatCurrency(booking.total_amount)}</div>
                                        <div className="mt-1">{getPaymentStatusBadge(booking.payment_status)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleDetail(booking)}>Chi tiết</Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        Không có chuyến đi nào trong mục này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
