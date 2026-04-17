import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRealtime } from './SocketContext';

const RealtimeNotificationContext = createContext(null);

export const useRealtimeNotification = () => {
    const ctx = useContext(RealtimeNotificationContext);
    if (!ctx) throw new Error('useRealtimeNotification must be used within RealtimeNotificationProvider');
    return ctx;
};

const EVENT_MESSAGES = {
    // Admin events
    new_user: { title: 'Người dùng mới', body: (d) => `${d?.user_name || 'Một người dùng'} vừa đăng ký tài khoản mới.` },
    user_registered: { title: 'Đăng ký thành viên', body: (d) => `${d?.display_name || 'Một người dùng'} đã tham gia hệ thống.` },
    new_booking: { title: 'Đơn đặt chỗ mới', body: (d) => `Có đơn đặt chỗ mới: ${d?.booking_code || ''} - ${d?.service_name || ''}.` },
    booking_created: { title: 'Đơn đặt chỗ mới', body: (d) => `Đơn ${d?.booking_code || ''} vừa được tạo. Khách hàng: ${d?.customer_name || ''}.` },
    BookingCreated: { title: 'Đơn đặt chỗ mới', body: (d) => `Có đơn đặt chỗ mới từ ${d?.contact_name || 'khách hàng'}.` },
    LocationCreated: { title: 'Địa điểm mới', body: (d) => `Địa điểm "${d?.name || ''}" vừa được thêm vào hệ thống.` },
    LocationUpdated: { title: 'Cập nhật địa điểm', body: (d) => `Địa điểm "${d?.name || ''}" đã được cập nhật.` },
    LocationDeleted: { title: 'Xóa địa điểm', body: (d) => `Địa điểm "${d?.name || ''}" đã bị xóa khỏi hệ thống.` },
    CategoryCreated: { title: 'Danh mục mới', body: (d) => `Danh mục "${d?.name || ''}" vừa được tạo.` },
    CategoryUpdated: { title: 'Cập nhật danh mục', body: (d) => `Danh mục "${d?.name || ''}" đã được cập nhật.` },
    CategoryDeleted: { title: 'Xóa danh mục', body: (d) => `Danh mục "${d?.name || ''}" đã bị xóa.` },
    ServiceUpdated: { title: 'Dịch vụ được cập nhật', body: (d) => `Dịch vụ "${d?.name || d?.service_name || ''}" đã được cập nhật.` },
    ReviewCreated: { title: 'Đánh giá mới', body: (d) => `Có đánh giá mới cho dịch vụ "${d?.service_name || ''}".` },
    provider_approved: { title: 'Nhà cung cấp được duyệt', body: (d) => `Nhà cung cấp "${d?.business_name || ''}" đã được phê duyệt.` },
    provider_rejected: { title: 'Nhà cung cấp bị từ chối', body: (d) => `Yêu cầu nhà cung cấp "${d?.business_name || ''}" đã bị từ chối.` },
    service_pending: { title: 'Dịch vụ chờ duyệt', body: (d) => `Dịch vụ "${d?.name || ''}" đang chờ được phê duyệt.` },
    new_report: { title: 'Báo cáo mới', body: (d) => `Có báo cáo mới từ người dùng.` },
    // Provider events
    BookingUpdated: { title: 'Cập nhật đơn đặt chỗ', body: (d) => `Đơn ${d?.booking_code || ''} đã được cập nhật trạng thái.` },
    BookingConfirmed: { title: 'Đơn được xác nhận', body: (d) => `Đơn ${d?.booking_code || ''} đã được xác nhận.` },
    BookingCancelled: { title: 'Đơn bị hủy', body: (d) => `Đơn ${d?.booking_code || ''} đã bị hủy.` },
    ServiceDeleted: { title: 'Dịch vụ bị xóa', body: (d) => `Dịch vụ "${d?.name || d?.service_name || ''}" đã bị xóa.` },
    WalletUpdated: { title: 'Ví được cập nhật', body: (d) => `Số dư ví của bạn đã được cập nhật.` },
    booking_confirmed: { title: 'Xác nhận đơn hàng', body: (d) => `Đơn ${d?.booking_code || ''} đã được xác nhận.` },
    booking_cancelled: { title: 'Hủy đơn hàng', body: (d) => `Đơn ${d?.booking_code || ''} đã bị hủy.` },
};

const getNotificationContent = (event, data) => {
    const config = EVENT_MESSAGES[event];
    if (config) {
        return {
            title: config.title,
            body: config.body(data),
        };
    }
    return {
        title: event.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        body: data?.message || JSON.stringify(data) || 'Có thông báo mới từ hệ thống.',
    };
};

export const RealtimeNotificationProvider = ({ children, channel, role }) => {
    const { listen } = useRealtime();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('realtime_notifications');
            if (saved) {
                const parsed = JSON.parse(saved);
                setNotifications(parsed.notifications || []);
                setUnreadCount(parsed.unreadCount || 0);
            }
        } catch (e) { /* ignore */ }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('realtime_notifications', JSON.stringify({ notifications, unreadCount }));
    }, [notifications, unreadCount]);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const addNotification = useCallback((event, data) => {
        const { title, body } = getNotificationContent(event, data);
        const notif = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            event,
            title,
            body,
            data,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [notif, ...prev].slice(0, 50)); // keep max 50
        setUnreadCount(prev => prev + 1);
    }, []);

    // Subscribe to Firestore channel
    useEffect(() => {
        if (!listen || !channel) return;

        const unsubscribe = listen(channel, (signal) => {
            if (!signal || !signal.event) return;
            const { event, data } = signal;
            console.log(`[RealtimeNotification] ${role} received:`, event, data);
            addNotification(event, data);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [listen, channel, role, addNotification]);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    const markRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const toggleOpen = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const value = {
        notifications,
        unreadCount,
        isOpen,
        setIsOpen,
        markAllRead,
        markRead,
        clearAll,
        toggleOpen,
        panelRef,
    };

    return (
        <RealtimeNotificationContext.Provider value={value}>
            {children}
        </RealtimeNotificationContext.Provider>
    );
};

// Hook rút gọn cho từng role
export const useAdminRealtimeNotifications = () => useRealtimeNotification();

export default RealtimeNotificationContext;
