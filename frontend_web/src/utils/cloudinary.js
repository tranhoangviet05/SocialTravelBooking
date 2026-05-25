import axios from 'axios';

/**
 * Tải ảnh trực tiếp lên Cloudinary từ Frontend
 * @param {File} file 
 * @returns {Promise<string>} URL của ảnh sau khi tải lên Cloudinary
 */
export const uploadImage = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Chưa cấu hình Cloudinary trong file .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        if (response.data && response.data.secure_url) {
            return response.data.secure_url;
        }
        
        throw new Error('Cloudinary không trả về URL của ảnh.');
    } catch (error) {
        console.error('Lỗi tải ảnh lên Cloudinary:', error);
        throw new Error('Tải ảnh lên thất bại. Vui lòng thử lại.');
    }
};
