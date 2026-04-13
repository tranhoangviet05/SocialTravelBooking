import React from 'react';
import { Settings, Save, Bell, Shield, Database, Globe, Percent } from 'lucide-react';

const AdminSettings = () => {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cài đặt hệ thống</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Cấu hình tham số vận hành sàn và các thiết lập bảo mật.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Commission Settings */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                            <Percent size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Hoa hồng & Thanh toán</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tỷ lệ hoa hồng sàn (%)</label>
                                <input type="number" defaultValue="10" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tỷ lệ Affiliate (%)</label>
                                <input type="number" defaultValue="5" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thời gian giải phóng Escrow (Giờ)</label>
                            <input type="number" defaultValue="48" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                            <p className="text-[10px] text-gray-400 font-bold">Thời gian chờ sau khi khách check-in để chuyển tiền cho nhà cung cấp.</p>
                        </div>
                    </div>
                </div>

                {/* AI & Moderation */}
                <div className="bg-[#0f172a] rounded-3xl p-8 shadow-xl text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white/10 text-sky-400 rounded-xl flex items-center justify-center shadow-inner">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-lg font-black">AI & Kiểm duyệt nội dung</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ngưỡng tự động từ chối (Confidence)</label>
                                <span className="text-sky-400 font-black">0.85</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.05" defaultValue="0.85" className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-sm font-bold">Tự động ẩn bài viết bị báo cáo</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Nếu đạt trên 5 báo cáo spam từ người dùng uy tín.</p>
                            </div>
                            <div className="w-10 h-5 bg-sky-500 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button className="px-8 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all">Hủy thay đổi</button>
                    <button className="flex items-center gap-2 px-10 py-3 bg-sky-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all">
                        <Save size={18} /> Lưu cấu hình
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
