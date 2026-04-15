import React from 'react';
import {
    Instagram,
    BarChart2,
    Edit,
    UserPlus,
    Camera,
    Image as ImageIcon
} from 'lucide-react';

const Profile = () => {
    return (
        <div className="w-full p-6 pt-10">
            {/* Profile Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Trần Việt</h1>
                    <p className="text-[15px] mt-1">tzitttt.2909</p>
                </div>
                <img src="https://i.pravatar.cc/150?u=myprofile" alt="Avatar" className="w-[84px] h-[84px] rounded-full object-cover border border-gray-200" />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[15px] text-gray-500">
                    <div className="flex -space-x-2">
                        <img src="https://i.pravatar.cc/150?u=1" className="w-5 h-5 rounded-full border border-white" />
                        <img src="https://i.pravatar.cc/150?u=2" className="w-5 h-5 rounded-full border border-white" />
                    </div>
                    <span className="hover:underline cursor-pointer">4 người theo dõi</span>
                </div>
                <div className="flex items-center gap-4">
                    <BarChart2 size={24} className="text-black" />
                    <Instagram size={24} className="text-black" />
                </div>
            </div>

            <button className="w-full py-2 border border-gray-300 rounded-xl font-semibold text-[15px] mb-8 hover:bg-gray-50 transition-colors">
                Chỉnh sửa trang cá nhân
            </button>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {['Thread', 'Câu trả lời', 'File phương tiện', 'Bài đăng lại'].map((tab, i) => (
                    <button key={tab} className={`flex-1 pb-3 text-[15px] font-semibold ${i === 0 ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-700'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Profile Completion Cards (Horizontal Scroll) */}
            <div className="mb-6 flex justify-between items-center">
                <span className="font-semibold text-[15px]">Hoàn tất trang cá nhân</span>
                <span className="text-[14px] text-gray-500">Còn 4</span>
            </div>

            <div className="flex overflow-x-auto gap-3 pb-4 snap-x">
                {[
                    { icon: Edit, title: "Tạo thread", desc: "Chia sẻ suy nghĩ hoạt động nổi bật mới đây của bạn.", btn: "Tạo" },
                    { icon: UserPlus, title: "Theo dõi 10 trang", desc: "Hãy lấp đầy bảng feed bằng những thread bạn quan tâm.", btn: "Theo dõi" },
                    { icon: Camera, title: "Thêm ảnh đại diện", desc: "Giúp mọi người dễ dàng nhận ra bạn hơn.", btn: "Thêm" }
                ].map((item, idx) => (
                    <div key={idx} className="min-w-[160px] flex-shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center snap-center">
                        <item.icon size={28} className="text-black mb-3 stroke-[1.5]" />
                        <h4 className="font-semibold text-[14px] mb-2">{item.title}</h4>
                        <p className="text-[13px] text-gray-500 leading-tight mb-4 flex-grow">{item.desc}</p>
                        <button className="w-full py-1.5 bg-black text-white rounded-xl text-[14px] font-semibold">{item.btn}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;