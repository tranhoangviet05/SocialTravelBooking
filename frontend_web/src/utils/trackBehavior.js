import axiosClient from '../api/axios';

/**
 * Theo dõi hành vi người dùng và gửi tới hệ thống phân tích n8n/Laravel
 * 
 * @param {Object} data 
 * @param {string} data.user_id - ID người dùng (UUID)
 * @param {string} data.action_type - Loại hành động: 'view_post', 'view_service', 'like_post', 'comment_post'
 * @param {number} data.location_id - ID địa điểm liên quan
 * @param {string} data.service_type - Loại dịch vụ liên quan: 'hotel', 'tour'
 * @param {number} data.dwell_time - Thời gian xem (giây)
 * @param {Array} data.tags - Danh sách ID của tags liên quan
 */
export const trackBehavior = async (data) => {
    try {
        if (!data.user_id) return;
        
        await axiosClient.post('/track-behavior', {
            user_id: data.user_id,
            action_type: data.action_type,
            location_id: data.location_id || null,
            service_type: data.service_type || null,
            dwell_time: data.dwell_time || 0,
            tags: data.tags || []
        });
        
        console.log(`[Behavior] Tracked: ${data.action_type} for Location: ${data.location_id}`);
    } catch (error) {
        console.error('[Behavior] Tracking failed:', error);
    }
};
