import axiosClient from '../api/axios';

/**
 * Tải ảnh lên Server Nội bộ (Thay thế Cloudinary)
 * @param {File} file 
 * @returns {Promise<string>} URL của ảnh sau khi tải lên
 */
export const uploadImage = async (file) => {
    const formData = new FormData();
    // Chú ý: Backend cần field tên là 'files[]' (mảng)
    formData.append('files[]', file);
    formData.append('folder', 'images'); // Lưu vào thư mục images

    try {
        const response = await axiosClient.post(
            '/upload', 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        if (response.success && response.urls && response.urls.length > 0) {
            return response.urls[0]; // Lấy URL ảnh đầu tiên
        }
        
        throw new Error('Server không trả về URL của ảnh.');
    } catch (error) {
        console.error('Lỗi tải ảnh lên Server nội bộ:', error);
        throw new Error('Tải ảnh lên thất bại. Vui lòng thử lại.');
    }
};
