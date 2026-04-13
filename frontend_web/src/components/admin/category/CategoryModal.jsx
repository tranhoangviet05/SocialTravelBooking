import React, { useState, useEffect } from 'react';
import { X, Tag, Save, Loader2, Sparkles } from 'lucide-react';
import { COLORS } from '../../../utils/colors';

const CategoryModal = ({ isOpen, onClose, onSave, category, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: ''
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || ''
            });
        } else {
            setFormData({ name: '', slug: '' });
        }
    }, [category, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Tag size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cấu hình phân loại dịch vụ</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên danh mục</label>
                            <div className="relative group">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Tour Văn Hóa, Khách Sạn VIP..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Slug Field (Static hint) */}
                        {formData.name && (
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Đường dẫn tự động:</span>
                                <span className="text-xs font-mono font-bold text-indigo-600">/{category?.slug || 'tu-dong-tao'}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 cursor-pointer hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all uppercase text-xs tracking-widest active:scale-95"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 cursor-pointer hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest active:scale-95"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Save size={20} />
                            )}
                            {category ? 'Cập nhật ngay' : 'Tạo danh mục'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
