import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, CheckCircle2, Shield, CalendarDays, Heart, Share2, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { MOCK_REVIEWS } from '../../data/mockServices';
import { useWishlist } from '../../contexts/WishlistContext';
import axios from 'axios';

const ServiceDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    
    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/general/get/services/detail/${slug}`);
                if (response.data.success) {
                    setServiceData(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết dịch vụ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    const isFavorited = isInWishlist(serviceData?.id);

    const handleBooking = () => {
        navigate('/checkout');
    };

    const handleFavorite = () => {
        if (isFavorited) {
            removeFromWishlist(serviceData.id);
        } else {
            addToWishlist(serviceData);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center pt-20">
            <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>;
    }

    if (!serviceData) {
        return <div className="text-center py-40 text-slate-500 font-bold">Không tìm thấy thông tin dịch vụ này.</div>;
    }

    // Mapping backend data to display
    const images = serviceData.media?.map(m => m.url) || [];
    const service = {
        id: serviceData.id,
        name: serviceData.name,
        provider: serviceData.provider?.business_name || 'Hệ thống',
        type: serviceData.type,
        location: serviceData.location?.name || 'Việt Nam',
        rating: serviceData.rating_avg || 0,
        reviews: serviceData.total_bookings || 0, // Placeholder for real review count
        price: serviceData.base_price,
        oldPrice: serviceData.base_price * 1.2, // Fake discount for display
        duration: serviceData.duration_days ? `${serviceData.duration_days} ngày ${serviceData.duration_nights ? serviceData.duration_nights + ' đêm' : ''}` : 'Trong ngày',
        maxGuests: serviceData.max_guests,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'],
        description: serviceData.description,
        amenities: serviceData.tags || [],
        includes: serviceData.includes || [],
        excludes: serviceData.excludes || ['Các chi phí cá nhân ngoài chương trình'],
        itinerary: serviceData.schedules?.map(s => ({
            day: s.day_number,
            title: s.title,
            content: s.description
        })) || [
            { day: 1, title: 'Bắt đầu hành trình', content: 'Xe đón quý khách theo lịch hẹn. Check-in nghỉ ngơi và ăn trưa.' },
            { day: 2, title: 'Trải nghiệm địa phương', content: 'Tham quan các điểm đến nổi tiếng theo chương trình.' },
            { day: 3, title: 'Kết thúc chuyến đi', content: 'Tự do mua sắm và làm thủ tục trả phòng, xe đưa quý khách về điểm hẹn.' }
        ]
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
            {/* Header: Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">{service.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                        <span className="flex items-center gap-1.5 text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
                            <Star size={16} className="fill-current" />
                            {service.rating} ({service.reviews} đánh giá)
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-gray-400" />
                            {service.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-500">
                            Cung cấp bởi <span className="font-bold text-slate-700">{service.provider}</span>
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                        <Share2 size={20} />
                    </button>
                    <button 
                        onClick={handleFavorite}
                        className={`p-2.5 rounded-full border transition-colors ${
                            isFavorited 
                                ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600' 
                                : 'border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-rose-100'
                        }`}
                    >
                        <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
                    </button>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 h-[400px]">
                <div className="md:col-span-3 rounded-2xl overflow-hidden relative group h-full">
                    <img 
                        src={service.images[activeImage]} 
                        alt="Main view" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer" 
                    />
                </div>
                <div className="hidden md:flex flex-col gap-4 h-full">
                    {service.images.slice(1, 3).map((img, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden h-1/2 relative group" onClick={() => setActiveImage(idx + 1)}>
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" />
                            {idx === 1 && service.images.length > 3 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                    <span className="text-white font-bold text-lg">+{service.images.length - 3}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content & Sidebar */}
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Dịch vụ Info */}
                <div className="flex-1 space-y-10">
                    {/* Đặc điểm nối bật */}
                    <div className="flex flex-wrap gap-6 py-6 border-y border-slate-100">
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-sky-500" strokeWidth={1.5} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Thời lượng</p>
                                <p className="font-semibold text-slate-800">{service.duration}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-sky-500" strokeWidth={1.5} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Số khách tối đa</p>
                                <p className="font-semibold text-slate-800">{service.maxGuests} người</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-sky-500" strokeWidth={1.5} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Chính sách hủy</p>
                                <p className="font-semibold text-slate-800">Miễn phí trước 48h</p>
                            </div>
                        </div>
                    </div>

                    {/* Giới thiệu */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Tổng quan</h2>
                        <p className="text-slate-600 leading-relaxed">{service.description}</p>
                    </section>

                    {/* Dịch vụ bao gồm */}
                    <section className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Bao gồm</h2>
                            <ul className="space-y-3">
                                {service.amenities.map(item => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-slate-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Không bao gồm</h2>
                            <ul className="space-y-3">
                                {service.excludes.map(item => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="w-2.5 h-[2px] bg-red-500"></span>
                                        </div>
                                        <span className="text-slate-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Lịch trình (nếu là Tour) */}
                    {service.type === 'tour' && (
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Lịch trình chi tiết</h2>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {service.itinerary.map((item, index) => (
                                    <div key={item.day} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-sky-100 text-sky-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold text-xs ring-4 ring-white z-10">
                                            N{item.day}
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-800">{item.title}</div>
                                            </div>
                                            <div className="text-slate-600 py-2">{item.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Đánh giá & Bình luận */}
                    <section className="pt-6 border-t border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Đánh giá từ khách hàng ({service.reviews})</h2>
                        
                        {/* Viết bình luận */}
                        <div className="flex gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center shrink-0">
                                U
                            </div>
                            <div className="flex-1">
                                <textarea rows="3" placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..." className="w-full bg-white rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-sky-500 mb-3 resize-none"></textarea>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(s => <Star key={s} size={18} className="text-gray-300 hover:text-amber-400 cursor-pointer transition-colors" />)}
                                    </div>
                                    <Button variant="primary" size="sm">Gửi đánh giá</Button>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách bình luận */}
                        <div className="space-y-6">
                            {MOCK_REVIEWS.map(review => (
                                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 font-bold text-slate-500 flex items-center justify-center">
                                                {review.user.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{review.user.name}</p>
                                                <p className="text-xs text-gray-400">{review.createdAt}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-3">{review.content}</p>
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {review.images.map((img, i) => (
                                                <img key={i} src={img} alt="Review" className="w-20 h-20 object-cover rounded-lg" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 mt-4">
                                        <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-sky-600 font-medium transition-colors">
                                            ♥ Hữu ích ({review.helpfulCount})
                                        </button>
                                        <button className="text-xs text-gray-400 hover:text-slate-700 font-medium transition-colors">Trực tiếp phản hồi</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Hộp Booking */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sticky top-28">
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-black text-slate-800">
                                {new Intl.NumberFormat('vi-VN').format(service.price)}đ
                            </span>
                            <span className="text-slate-400 line-through text-sm mb-1">
                                {new Intl.NumberFormat('vi-VN').format(service.oldPrice)}đ
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm border-b border-slate-100 pb-5 mb-5">
                            Giá dành cho 1 người lớn (đã bao gồm thuế & phí)
                        </p>

                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleBooking(); }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-slate-200 rounded-xl p-3 col-span-2">
                                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Ngày tham gia</label>
                                    <input type="date" className="w-full font-semibold text-slate-800 outline-none cursor-pointer bg-transparent" />
                                </div>
                                <div className="border border-slate-200 rounded-xl p-3">
                                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Người lớn</label>
                                    <select className="w-full font-semibold text-slate-800 outline-none cursor-pointer bg-transparent">
                                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="border border-slate-200 rounded-xl p-3">
                                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Trẻ em</label>
                                    <select className="w-full font-semibold text-slate-800 outline-none cursor-pointer bg-transparent">
                                        {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <Button type="submit" variant="primary" className="w-full py-4 text-base font-bold rounded-xl mt-4">
                                Đặt ngay
                            </Button>
                            <p className="text-center text-xs text-slate-400">Bạn sẽ không bị tính phí lúc này</p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
