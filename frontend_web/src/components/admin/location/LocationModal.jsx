import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Star, AlertCircle, Loader2 } from 'lucide-react';
import { uploadImage } from '../../../utils/cloudinary';
import { COLORS } from '../../../utils/colors';

const LocationModal = ({ isOpen, onClose, onSave, location, locations, isLoading: isSaving }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        image_url: '',
        is_popular: false,
        description: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (location) {
            setFormData({
                name: location.name || '',
                parent_id: location.parent_id || '',
                image_url: location.image_url || '',
                is_popular: !!location.is_popular,
                description: location.description || ''
            });
            setPreviewUrl(location.image_url || '');
        } else {
            setFormData({ name: '', parent_id: '', image_url: '', is_popular: false, description: '' });
            setPreviewUrl('');
            setSelectedFile(null);
        }
        setErrors({});
    }, [location, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Tên địa điểm là bắt buộc';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        let finalImageUrl = formData.image_url;

        // Upload to Cloudinary if a new file is selected
        if (selectedFile) {
            setIsUploading(true);
            try {
                finalImageUrl = await uploadImage(selectedFile);
            } catch (error) {
                setErrors({ image: 'Lỗi khi tải ảnh lên Cloudinary' });
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        onSave({ ...formData, image_url: finalImageUrl });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-2xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">
                            {location ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Điền đầy đủ các thông tin chi tiết dưới đây</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="pb-8 px-8 overflow-y-hidden max-h-[70vh] no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Side: Basic Info */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên địa điểm</label>
                                <input
                                    type="text"
                                    className={`w-full px-5 py-3.5 bg-slate-50 rounded-2xl border ${errors.name ? 'border-rose-200 ring-4 ring-rose-50' : 'border-slate-100'} focus:bg-white focus:ring-4 focus:ring-sky-50 focus:border-sky-200 transition-all outline-none font-bold text-slate-900`}
                                    placeholder="Ví dụ: Đà Nẵng, Phố Cổ Hội An..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Địa điểm cha (Cấp trên)</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-sky-50 focus:border-sky-200 transition-all outline-none font-bold text-slate-900 appearance-none"
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                >
                                    <option value="">— Cấp Tỉnh/Thành (Mặc định) —</option>
                                    {locations.filter(l => l.id !== location?.id).map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                                <textarea
                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-sky-50 focus:border-sky-200 transition-all outline-none font-medium text-slate-700 min-h-[120px] resize-none"
                                    placeholder="Giới thiệu đôi nét về địa điểm này..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Right Side: Image Upload */}
                        <div className="flex flex-col">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hình ảnh đại diện</label>

                            <div className="relative group flex-1 min-h-[220px]">
                                <div className={`absolute inset-0 rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 bg-slate-50 ${previewUrl ? 'border-sky-500/20' : 'border-slate-200 hover:border-sky-400 hover:bg-sky-50/30'}`}>
                                    {previewUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all cursor-pointer">
                                                    <X size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
                                                <Upload size={32} />
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-sm font-bold text-slate-900">Chọn ảnh từ máy tính</p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Kéo thả hoặc nhấn để chọn</p>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                            {errors.image && <p className="text-rose-500 text-[10px] font-bold mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.image}</p>}
                        </div>

                        {/* Bottom Row - Aligned horizontally */}
                        <div>
                            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-50 cursor-pointer hover:bg-slate-100/50 transition-all">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded-lg border-slate-300 text-amber-500 focus:ring-amber-500"
                                    checked={formData.is_popular}
                                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                />
                                <div>
                                    <p className="text-sm font-black text-slate-900">Đánh dấu phổ biến</p>
                                    <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Hiện ở mục Điểm đến thịnh hành</p>
                                </div>
                                <Star size={18} className={`ml-auto ${formData.is_popular ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                            </label>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={isUploading || isSaving}
                                className="w-full md:w-auto px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3 cursor-pointer"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                {(isUploading || isSaving) ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {isUploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        {location ? 'Lưu thay đổi' : 'Tạo địa điểm'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { transform: scale(0.95) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LocationModal;
