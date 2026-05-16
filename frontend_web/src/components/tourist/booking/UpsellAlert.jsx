import React from 'react';
import { ArrowUpCircle, Gift, ChevronRight, Check } from 'lucide-react';

const UpsellAlert = ({ upsell, onAccept, onDecline }) => {
    if (!upsell) return null;

    const { target_service, perk_service, perk_discount_percent } = upsell;
    
    return (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 shadow-xl shadow-indigo-200 relative overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-center gap-6">
                {/* Icon Section */}
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
                    <ArrowUpCircle size={32} className="text-white" />
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Gợi ý thông minh cho bạn</span>
                        <div className="h-px w-8 bg-indigo-300/30" />
                    </div>
                    <h4 className="text-lg font-black text-white leading-tight">
                        Nâng cấp lên <span className="text-sky-300">{target_service?.name}</span> để nhận đặc quyền!
                    </h4>
                    
                    {perk_service && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-indigo-100">
                            <Gift size={16} className="text-amber-400" />
                            <p className="text-sm font-bold">
                                Tặng ngay: <span className="text-amber-300 font-black">{perk_discount_percent === 100 ? 'MIỄN PHÍ' : `GIẢM ${perk_discount_percent}%`}</span> dịch vụ {perk_service.name}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Section */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button 
                        onClick={onAccept}
                        className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-sm font-black hover:bg-sky-50 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                    >
                        Nâng cấp ngay <ChevronRight size={16} />
                    </button>
                    <button 
                        onClick={onDecline}
                        className="text-xs font-bold text-white/60 hover:text-white transition-colors"
                    >
                        Không, tôi giữ lựa chọn cũ
                    </button>
                </div>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                    <Check size={12} /> Dịch vụ xịn hơn
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                    <Check size={12} /> Tiết kiệm tới 40%
                </div>
            </div>
        </div>
    );
};

export default UpsellAlert;
