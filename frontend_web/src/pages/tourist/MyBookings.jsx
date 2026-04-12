import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';

const MyBookings = () => {
    // Mock data based strictly on the 'bookings' and 'services' table in postgres_schema.sql
    const [bookings, setBookings] = useState([
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
        }
    ]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-sky-100 text-sky-800',
            ongoing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        const labels = {
            pending: 'Chờ xử lý',
            confirmed: 'Đã xác nhận',
            ongoing: 'Đang diễn ra',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
                {labels[status] || status}
            </span>
        );
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
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Mã Booking</th>
                                <th className="px-6 py-4">Dịch vụ</th>
                                <th className="px-6 py-4">Check-in</th>
                                <th className="px-6 py-4">Thanh toán</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {bookings.map((booking) => (
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
                                    <td className="px-6 py-4">
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="outline" size="sm">Chi tiết</Button>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Bạn chưa có chuyến đi nào được đặt.
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
