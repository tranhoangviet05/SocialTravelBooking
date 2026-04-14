import axios from './axios';

const adminApi = {
    // Quản lý người dùng
    getAllUsers: () => axios.get('/admin/users'),
    
    updateUserRole: (id, role) => axios.patch(`/admin/users/${id}/role`, { role }),
    
    updateUserStatus: (id, status) => axios.patch(`/admin/users/${id}/status`, { status }),

    // Quản lý địa điểm (đã có route bảo vệ)
    createLocation: (data) => axios.post('/admin/locations', data),
    updateLocation: (id, data) => axios.put(`/admin/locations/${id}`, data),
    deleteLocation: (id) => axios.delete(`/admin/locations/${id}`),

    // Quản lý danh mục
    createCategory: (data) => axios.post('/admin/categories', data),
    updateCategory: (id, data) => axios.put(`/admin/categories/${id}`, data),
    deleteCategory: (id) => axios.delete(`/admin/categories/${id}`),
};

export default adminApi;
