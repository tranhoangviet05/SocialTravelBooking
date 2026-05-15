import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, Send, MoreVertical, Phone, Video,
    Image as ImageIcon, Paperclip, Smile, Loader2,
    CheckCircle2, Clock, MapPin, User, MessageSquare
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Skeleton from '../../components/common/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import chatApi from '../../api/chatApi';
import echo from '../../utils/echo';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import MessageSkeleton from '../../components/common/MessageSkeleton';

const Messages = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get('userId');
    const targetUserName = searchParams.get('name');
    const targetUserAvatar = searchParams.get('avatar');

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    const fetchConversations = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const response = await chatApi.getConversations();
            if (response.success) {
                setConversations(response.data);

                if (targetUserId) {
                    const existingConv = response.data.find(c => String(c.other_user?.id) === String(targetUserId));
                    if (existingConv) {
                        setActiveConversation(existingConv);
                        if (isInitial) fetchMessages(existingConv.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [currentUser, targetUserId]);

    const fetchMessages = async (conversationId) => {
        setMessagesLoading(true);
        try {
            const response = await chatApi.getMessages(conversationId);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setMessagesLoading(false);
            setTimeout(scrollToBottom, 50);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchConversations(true);
        }
    }, [currentUser, fetchConversations]);

    // Listen for NEW conversations and messages
    useEffect(() => {
        if (!currentUser) return;

        // 1. Listen on User channel for new conversations/global updates
        const userChannel = echo.private(`User.${currentUser.id}`);
        userChannel.listen('.MessageSent', (e) => {
            fetchConversations(false);
        });

        // 2. Listen on active conversation channel
        let chatChannel = null;
        if (activeConversation) {
            chatChannel = echo.channel(`chat.${activeConversation.id}`);

            chatChannel.listen('.MessageSent', (e) => {
                if (e.sender_id !== currentUser.id) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === e.id)) return prev;
                        return [...prev, e];
                    });
                    setTimeout(scrollToBottom, 50);
                }
                fetchConversations(false);
            });
        }

        return () => {
            if (chatChannel) chatChannel.stopListening('.MessageSent');
            userChannel.stopListening('.MessageSent'); // If we broadcast to user too
        };
    }, [currentUser, activeConversation, fetchConversations]);

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        fetchMessages(conv.id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const payload = activeConversation
            ? { conversation_id: activeConversation.id, content: newMessage }
            : { recipient_id: targetUserId, content: newMessage };

        const tempMessage = {
            id: Date.now(),
            content: newMessage,
            sender_id: currentUser.id,
            created_at: new Date().toISOString(),
            is_temp: true
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        setTimeout(scrollToBottom, 50);

        try {
            const response = await chatApi.sendMessage(payload);
            if (response.success) {
                setMessages(prev => prev.map(m => m.id === tempMessage.id ? response.data : m));
                fetchConversations(false);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        (conv.other_user?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.business_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderMessageContent = (message) => {
        const content = message.content || '';
        const isAuto = content.includes('**#BK-') || content.includes('**Yêu cầu Check-in:**');

        // Trích xuất mã đơn hàng nếu là tin nhắn tự động
        let bookingCode = '';
        if (isAuto) {
            const match = content.match(/#BK(?:-DETAIL)?-([A-Z0-9-]+)/);
            if (match) bookingCode = match[1];
        }

        if (isAuto) {
            return (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 my-2 max-w-[85%] animate-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                            <Clock className="text-white w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="text-blue-900 text-[13px] whitespace-pre-wrap">
                                {content.split('**#BK-DETAIL')[0]}
                            </div>
                            {bookingCode && (
                                <button
                                    onClick={() => navigate(`/booking-detail/${bookingCode}`)}
                                    className="mt-3 w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <CheckCircle2 size={14} />
                                    Xem chi tiết đơn hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`max-w-[70%] rounded-[20px] px-4 py-2 text-[15px] leading-tight
                ${message.sender_id === currentUser.id
                    ? 'bg-[#0084FF] text-white self-end'
                    : 'bg-[#F0F0F0] text-black self-start'}`}
            >
                {content}
            </div>
        );
    };

    if (loading) return <MessageSkeleton />;

    return (
        <div className="h-screen flex bg-white overflow-hidden font-sans text-black">
            {/* Left Sidebar */}
            <div className="w-[360px] border-r border-gray-200 flex flex-col shrink-0">
                <div className="px-4 pt-4 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
                        <div className="flex gap-2">
                            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                <MessageSquare size={18} />
                            </div>
                        </div>
                    </div>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Messenger"
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-[15px] focus:outline-none focus:ring-0 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map(conv => {
                        const lastMsg = conv.last_message;
                        const isActive = activeConversation?.id === conv.id;
                        const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUser.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-colors group
                                    ${isActive ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                            >
                                <div className="relative shrink-0">
                                    {conv.other_user?.avatar_url ? (
                                        <img src={conv.other_user.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                                            {(conv.business_name || conv.other_user?.display_name || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`text-[15px] truncate font-medium ${isUnread ? 'font-bold' : ''}`}>
                                            {conv.business_name || conv.other_user?.display_name}
                                        </span>
                                        <span className="text-[12px] text-gray-500 shrink-0">
                                            {lastMsg && format(new Date(lastMsg.created_at), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className={`text-[13px] truncate ${isUnread ? 'text-black font-semibold' : 'text-gray-500'}`}>
                                        {lastMsg ? lastMsg.content : 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {activeConversation || targetUserId ? (
                    <>
                        {/* Header */}
                        <div className="h-[60px] px-4 border-b border-gray-200 flex items-center justify-between shadow-sm shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden">
                                    {(activeConversation?.other_user?.avatar_url || targetUserAvatar) ? (
                                        <img src={activeConversation?.other_user?.avatar_url || targetUserAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{(activeConversation?.business_name || activeConversation?.other_user?.display_name || targetUserName || '?')[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-[15px] truncate">
                                        {activeConversation?.business_name || activeConversation?.other_user?.display_name || targetUserName || 'Đang tải...'}
                                    </h3>
                                    <p className="text-[12px] text-gray-500">
                                        {activeConversation ? 'Đang hoạt động' : 'Bắt đầu cuộc trò chuyện mới'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-blue-600">
                                <MoreVertical size={20} className="cursor-pointer text-gray-400" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar">
                            {messages.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <MessageSquare size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium">Bắt đầu cuộc trò chuyện với {activeConversation?.business_name || targetUserName || 'Nhà cung cấp'}</p>
                                </div>
                            )}

                            {messages.map((msg, index) => {
                                const isSelf = msg.sender_id === currentUser.id;
                                const showAvatar = !isSelf && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);

                                return (
                                    <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} items-end gap-2 mb-0.5`}>
                                        {!isSelf && (
                                            <div className="w-7 h-7 shrink-0">
                                                {showAvatar && (
                                                    (activeConversation?.other_user?.avatar_url || targetUserAvatar) ? (
                                                        <img src={activeConversation?.other_user?.avatar_url || targetUserAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                                            {(activeConversation?.business_name || activeConversation?.other_user?.display_name || targetUserName || '?')[0].toUpperCase()}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                        {renderMessageContent(msg)}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions for first time chat */}
                        {messages.length === 0 && (
                            <div className="px-4 pb-2">
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "Xin chào, tôi muốn hỏi về dịch vụ này",
                                        "Dịch vụ này còn chỗ vào ngày mai không?",
                                        "Tôi có thể thương lượng giá được không?",
                                        "Có ưu đãi gì cho đoàn đông người không?"
                                    ].map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setNewMessage(suggestion)}
                                            className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[13px] font-medium border border-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 pt-2">
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <ImageIcon size={22} className="cursor-pointer hover:text-blue-700 transition-colors" />
                                <Paperclip size={22} className="cursor-pointer hover:text-blue-700 transition-colors" />
                                <Smile size={22} className="cursor-pointer hover:text-blue-700 transition-colors" />
                                <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2 ml-2">
                                    <input
                                        type="text"
                                        placeholder="Aa"
                                        className="flex-1 py-2 px-4 bg-gray-100 border-none rounded-full text-[15px] focus:outline-none focus:ring-0"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" disabled={!newMessage.trim()} className="text-blue-600 disabled:text-gray-300">
                                        <Send size={22} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white">
                        <div className="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-[32px] flex items-center justify-center mb-8 mx-auto shadow-2xl rotate-3">
                                <MessageSquare size={48} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Kết nối du lịch nhanh chóng</h3>
                            <p className="text-gray-500 text-[16px] mb-10 leading-relaxed">
                                Chào mừng bạn đến với trung tâm tin nhắn. Đây là nơi kết nối Khách du lịch và Nhà cung cấp để trao đổi các vấn đề liên quan đến chuyến đi.
                            </p>

                            <div className="grid grid-cols-1 gap-4 text-left mb-10">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[15px]">Phản hồi thời gian thực</h4>
                                        <p className="text-[13px] text-gray-500">Nhận thông báo và phản hồi ngay lập tức từ nhà cung cấp.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[15px]">Hỗ trợ tận nơi</h4>
                                        <p className="text-[13px] text-gray-500">Hỏi về vị trí, lịch trình hoặc các yêu cầu đặc biệt cho chuyến đi.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[15px]">Xác nhận an toàn</h4>
                                        <p className="text-[13px] text-gray-500">Lưu lại lịch sử trao đổi để bảo vệ quyền lợi của bạn.</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 font-medium italic">
                                Chọn một hội thoại bên trái để bắt đầu trò chuyện ngay!
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ccc; }
                body { overflow: hidden; }
            `}</style>
        </div>
    );
};

export default Messages;
