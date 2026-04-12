import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const serviceApi = {
    // Lấy danh sách dịch vụ (tour + accommodation) với filter
    getServices: async (params = {}) => {
        const response = await axios.get(`${API_URL}/services`, { params });
        return response.data;
    },

    // Lấy chi tiết 1 dịch vụ
    getService: async (id) => {
        const response = await axios.get(`${API_URL}/services/${id}`);
        return response.data;
    },

    // Lấy danh sách loại dịch vụ (tour / accommodation)
    getCategories: async () => {
        const response = await axios.get(`${API_URL}/service-categories`);
        return response.data;
    },

    // Lấy địa điểm nổi bật
    getLocations: async () => {
        const response = await axios.get(`${API_URL}/locations`);
        return response.data;
    },

    // Tạo đặt chỗ (booking)
    createBooking: async (serviceId, bookingData) => {
        const response = await axios.post(`${API_URL}/bookings`, {
            service_id: serviceId,
            ...bookingData,
        });
        return response.data;
    },

    // Lấy đánh giá của 1 dịch vụ
    getReviews: async (serviceId, page = 1) => {
        const response = await axios.get(`${API_URL}/services/${serviceId}/reviews`, {
            params: { page }
        });
        return response.data;
    },

    // Gửi đánh giá
    createReview: async (serviceId, reviewData) => {
        const response = await axios.post(`${API_URL}/services/${serviceId}/reviews`, reviewData);
        return response.data;
    },

    // Tìm kiếm dịch vụ (search)
    search: async (query, filters = {}) => {
        const response = await axios.get(`${API_URL}/services/search`, {
            params: { q: query, ...filters }
        });
        return response.data;
    },
};

export default serviceApi;