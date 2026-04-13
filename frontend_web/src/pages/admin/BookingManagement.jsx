import React from 'react';
import { 
    Search, 
    Calendar, 
    CreditCard, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Eye,
    Download,
    Filter
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminLayout from '../../components/admin/AdminLayout';

const BookingManagement = () => {
    const bookings = [
        { id: 'BK-5521', code: 'STB89201', customer: 'Nguyễn Minh Quân', service: 'Da Lat Discovery Tour', amount: '3,850,000₫', payment: 'paid', status: 'confirmed', date: '2024-04-12' },
        { id: 'BK-5520', code: 'STB89200', customer: 'Le Thu Thao', service: 'JW Marriott Phu Quoc', amount: '15,200,000₫', payment: 'pending', status: 'pending', date: '2024-04-12' },
        { id: 'BK-5519', code: 'STB89199', customer: 'David Beckham', service: 'Sapa Trekking Adventure', amount: '4,500,000₫', payment: 'paid', status: 'completed', date: '2024-04-11' },
        { id: 'BK-5518', code: 'STB89198', customer: 'Tran Van Giau', service: 'Muong Thanh Luxury', amount: '2,100,000₫', payment: 'refunded', status: 'cancelled', date: '2024-04-10' },
        { id: 'BK-5517', code: 'STB89197', customer: 'Hoang Kim Chi', service: 'Fansipan Cable Car Ticket', amount: '850,000₫', payment: 'paid', status: 'confirmed', date: '2024-04-10' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed': return 'text-sky-600 bg-sky-50 border-sky-100';
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getPaymentBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500"><CheckCircle2 size={12} /> Đã thanh toán</span>;
            case 'pending': return <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500"><Clock size={12} /> Chờ thanh toán</span>;
            case 'refunded': return <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-500"><CreditCard size={12} /> Đã hoàn tiền</span>;
            default: return null;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đặt chỗ</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi và xử lý tất cả các giao dịch đặt tour và phòng trên toàn hệ thống.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white border border-gray-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all">
                            <Download size={18} />
                            Xuất Excel
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm mã đặt chỗ, khách hàng, dịch vụ..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm appearance-none focus:outline-none font-bold text-slate-700">
                                <option>Tất cả thời gian</option>
                                <option>Hôm nay</option>
                                <option>7 ngày qua</option>
                                <option>Tháng này</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0f172a] text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/10 transition-all">
                            <Filter size={18} />
                            Lọc nâng cao
                        </button>
                    </div>
                </div>

                <AdminTable 
                    headers={['Mã đặt chỗ', 'Khách hàng', 'Dịch vụ', 'Tổng tiền', 'Thanh toán', 'Trạng thái', '']}
                    title="Lịch sử đặt chỗ"
                    description="Tìm thấy 8,421 đơn đặt chỗ."
                >
                    {bookings.map((bk) => (
                        <tr key={bk.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-5">
                                <span className="font-mono text-[11px] font-bold text-gray-400 block tracking-wider">{bk.code}</span>
                                <span className="text-[10px] text-gray-300 font-bold mt-0.5 block">{bk.date}</span>
                            </td>
                            <td className="px-8 py-5">
                                <p className="text-sm font-black text-slate-900">{bk.customer}</p>
                            </td>
                            <td className="px-8 py-5">
                                <p className="text-sm text-gray-600 font-medium truncate max-w-[180px]">{bk.service}</p>
                            </td>
                            <td className="px-8 py-5">
                                <span className="text-sm font-black text-slate-900">{bk.amount}</span>
                            </td>
                            <td className="px-8 py-5">
                                {getPaymentBadge(bk.payment)}
                            </td>
                            <td className="px-8 py-5">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(bk.status)}`}>
                                    {bk.status}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <button className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all">
                                    <Eye size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            </div>
        </AdminLayout>
    );
};

export default BookingManagement;
