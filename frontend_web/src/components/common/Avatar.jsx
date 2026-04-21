import React from 'react';

const Avatar = ({ src, alt, size = "md", className = "" }) => {
    // Kích thước
    const sizeClasses = {
        xs: "w-6 h-6 text-[10px]",
        sm: "w-8 h-8 text-[12px]",
        md: "w-10 h-10 text-[14px]",
        lg: "w-11 h-11 text-[15px]",
        xl: "w-14 h-14 text-[18px]",
        "2xl": "w-20 h-20 text-[24px]",
    };

    const currentSizeClass = sizeClasses[size] || sizeClasses.md;

    // Logic lấy ký tự đầu
    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    };

    // Màu sắc ngẫu nhiên dựa trên tên
    const stringToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-emerald-500', 
            'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-orange-500'
        ];
        return colors[Math.abs(hash) % colors.length];
    };

    if (src && src.trim() !== "" && !src.includes('pravatar.cc') && !src.includes('ui-avatars.com')) {
        return (
            <img 
                src={src} 
                alt={alt} 
                className={`${currentSizeClass} rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100 ${className}`}
                onError={(e) => {
                    e.target.onerror = null; // Ngăn lặp vô tận
                    e.target.src = ''; // Force render fallback
                    e.target.className = 'hidden'; // Ẩn ảnh lỗi
                }}
            />
        );
    }

    // Fallback UI
    const initials = getInitials(alt);
    const bgColor = stringToColor(alt || "User");

    return (
        <div className={`${currentSizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2 border-white ${bgColor} ${className}`}>
            {initials}
        </div>
    );
};

export default Avatar;
