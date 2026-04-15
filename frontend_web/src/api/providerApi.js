import axios from './axios';

const providerApi = {
    // Setup
    setupProfile: () => axios.post('/provider/setup-profile'),

    // Dashboard
    getStats: () => axios.get('/provider/dashboard/stats'),

    // Dịch vụ
    getServices: () => axios.get('/provider/services'),
    getService: (id) => axios.get(`/provider/services/${id}`),
    createService: (data) => axios.post('/provider/services', data),
    updateService: (id, data) => axios.put(`/provider/services/${id}`, data),
    deleteService: (id) => axios.delete(`/provider/services/${id}`),

    // Đặt chỗ
    getBookings: (status = 'all') => axios.get('/provider/bookings', { params: { status } }),
    getBooking: (id) => axios.get(`/provider/bookings/${id}`),
    updateBookingStatus: (id, status, cancelReason = '') =>
        axios.patch(`/provider/bookings/${id}/status`, { status, cancel_reason: cancelReason }),

    // Đánh giá
    getReviews: () => axios.get('/provider/reviews'),
    replyReview: (id, reply) => axios.post(`/provider/reviews/${id}/reply`, { reply }),

    // Hỗ trợ (Lấy dữ liệu hệ thống)
    getPublicLocations: () => axios.get('/general/get/locations'),
    getPublicCategories: () => axios.get('/general/get/categories'),
    
    uploadFiles: (files, folder = 'services') => {
        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));
        formData.append('folder', folder);
        return axios.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Ví tiền & Cài đặt
    getWallet: () => axios.get('/provider/wallet'),
    getWalletReport: () => axios.get('/provider/wallet/report'),
    getSettings: () => axios.get('/provider/settings'),
    updateSettings: (data) => axios.put('/provider/settings', data),
};

export default providerApi;
