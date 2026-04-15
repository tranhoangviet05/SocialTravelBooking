import React from 'react';
import { MessageCircle, Send } from 'lucide-react';

const FloatingMessageButton = () => {
    return (
        <button className="fixed bottom-8 right-8 px-6 h-14 bg-sky-500 text-white shadow-[0_8px_30px_rgba(14,165,233,0.3)] rounded-full flex items-center justify-center gap-2 hover:scale-105 hover:bg-sky-600 transition-all z-50 group">
            <Send size={22} className="rotate-[-15deg] group-hover:rotate-0 transition-transform" />
            <span className="font-bold text-[15px]">Tin nhắn</span>
        </button>
    );
};

export default FloatingMessageButton;