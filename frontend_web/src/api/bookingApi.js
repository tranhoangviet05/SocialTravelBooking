import axiosClient from './axios';

/**
 * API Service cho Booking & Payment
 */
const bookingApi = {
    /**
     * Tạo đơn đặt chỗ mới
     * @param {object} data - { service_id, check_in_date, check_out_date, num_adults, num_children, contact_name, contact_email, contact_phone, special_requests, coupon_code, payment_method }
     */
    createBooking: (data) => axiosClient.post('/bookings', data),
    getBookingById: (id) => axiosClient.get(`/user/booking-details/${id}`),

    /**
     * Khởi tạo thanh toán
     * @param {string} bookingId - UUID của booking
     * @param {string} paymentMethod - 'sepay' | 'wallet'
     */
    initiatePayment: (bookingId, paymentMethod, paymentType = 'full_100') =>
        axiosClient.post('/payment/initiate', {
            booking_id: bookingId,
            payment_method: paymentMethod,
            payment_type: paymentType,
        }),

    /**
     * Kiểm tra trạng thái thanh toán (dùng cho polling)
     * @param {string} bookingId
     */
    checkPaymentStatus: (bookingId) =>
        axiosClient.get(`/payment/status/${bookingId}`),

    /**
     * Lấy danh sách booking của user hiện tại
     */
    getMyBookings: () => axiosClient.get('/user/bookings'),
    cancelBooking: (id) => axiosClient.post(`/user/bookings/${id}/cancel`),

    /**
     * Lấy số dư ví
     */
    getWalletBalance: () => axiosClient.get('/wallet/balance'),

    /**
     * Lấy danh sách mã giảm giá của người dùng
     */
    getMyCoupons: () => axiosClient.get('/coupons'),

    /**
     * Áp dụng mã giảm giá
     * @param {string} code
     * @param {number} amount
     */
    applyCoupon: (code, amount) =>
        axiosClient.post('/coupons/apply', { code, order_amount: amount }),

    /**
     * Lấy chi tiết đơn hàng qua mã code
     */
    getBookingByCode: (code) => axiosClient.get(`/user/bookings/by-code/${code}`),

    checkIn: (id) => axiosClient.post(`/user/bookings/${id}/check-in`),
    undoCheckIn: (id) => axiosClient.post(`/user/bookings/${id}/undo-check-in`),
    checkOut: (id) => axiosClient.post(`/user/bookings/${id}/check-out`),

    /** Kiểm tra các gói Upsell khả dụng */
    checkUpsells: (items) => axiosClient.post('/upsells/check', { items }),

    /** Lấy chi tiết gói Upsell cụ thể */
    getUpsellPackage: (id) => axiosClient.get(`/upsells/package/${id}`),

    /** Quy trình Upsell sau khi đặt chỗ */
    getUpsellPreview: (id) => axiosClient.get(`/user/bookings/${id}/upsell-preview`),
    upgradeBooking: (id) => axiosClient.post(`/user/bookings/${id}/upgrade`),

    /** Wallet & Withdrawal */
    getProviderWallet: () => axiosClient.get('/provider/wallet'),
    getWithdrawalRequests: () => axiosClient.get('/provider/withdrawal-requests'),
    createWithdrawalRequest: (data) => axiosClient.post('/provider/withdrawal-requests', data),

    /** Admin Wallet */
    getAdminWallet: () => axiosClient.get('/admin/wallet'),
    getAdminWithdrawalRequests: (status) => axiosClient.get('/admin/withdrawal-requests', { params: { status } }),
    approveWithdrawal: (id, note) => axiosClient.patch(`/admin/withdrawal-requests/${id}/approve`, { admin_note: note }),
    rejectWithdrawal: (id, note) => axiosClient.patch(`/admin/withdrawal-requests/${id}/reject`, { admin_note: note }),
};

export default bookingApi;
