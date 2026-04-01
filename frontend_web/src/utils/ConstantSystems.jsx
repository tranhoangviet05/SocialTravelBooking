/**
 * Lưu trữ các giá trị cố định để tránh việc gõ sai chuỗi (hard-coded strings).
 */

export const APP_NAME = "Social Travel Booking";

export const BOOKING_STATUS = {
    PENDING: 'pending',     // Đang chờ xử lý
    CONFIRMED: 'confirmed', // Đã xác nhận
    CANCELLED: 'cancelled', // Đã hủy
    COMPLETED: 'completed'  // Đã hoàn thành
};

export const STORAGE_KEYS = {
    USER_TOKEN: 'user_token',
    USER_INFO: 'user_info',
    THEME: 'app_theme'
};

export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout'
};