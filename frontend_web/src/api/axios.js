import axios from 'axios';

// Khởi tạo instance của axios
const axiosClient = axios.create({
    // URL của Backend Laravel (thường là http://localhost:8000/api)
    baseURL: "http://localhost:8000/api",
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Bạn có thể thêm interceptor tại đây để xử lý lỗi hoặc đính kèm Token khi đăng nhập
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Xử lý lỗi chung (ví dụ: 401 logout người dùng)
        return Promise.reject(error);
    }
);

export default axiosClient;