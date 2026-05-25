<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Log;

class ChatService
{
    private function getConversationAndUsers(Booking $booking)
    {
        $touristId = $booking->user_id;
        $service = $booking->service;
        
        if (!$service) return null;

        $providerProfile = $service->provider;
        if (!$providerProfile) return null;

        $providerUserId = $providerProfile->user_id;
        if (!$providerUserId) return null;

        $u1 = $touristId < $providerUserId ? $touristId : $providerUserId;
        $u2 = $touristId < $providerUserId ? $providerUserId : $touristId;

        $conversation = Conversation::firstOrCreate(
            ['user_one' => $u1, 'user_two' => $u2],
            ['last_message_at' => now()]
        );

        return [$conversation, $touristId, $providerUserId, $service];
    }

    /**
     * Gửi tin nhắn tự động khi đơn hàng được xác nhận
     */
    public function sendBookingConfirmedMessage(Booking $booking)
    {
        try {
            $data = $this->getConversationAndUsers($booking);
            if (!$data) return;
            [$conversation, $touristId, $providerUserId, $service] = $data;

            // Nội dung tin nhắn tự động
            $content = "**Xác nhận thanh toán:** Chúc mừng bạn đã thanh toán thành công đơn hàng **#{$booking->booking_code}**.\n\n"
                     . "Chúng tôi đã nhận được số tiền " . number_format($booking->total_amount) . " VND cho dịch vụ: **{$service->name}**.\n\n"
                     . "Trạng thái: **Đã xác nhận**\n"
                     . "Bạn có thể xem chi tiết đơn hàng tại đây: **#BK-DETAIL-{$booking->booking_code}**";

            // Tạo tin nhắn (Người gửi là Provider)
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $providerUserId,
                'content' => $content,
            ]);

            $conversation->update(['last_message_at' => now()]);

            // Broadcast real-time
            broadcast(new MessageSent($message, $touristId));

            Log::info("Automated message sent for booking " . $booking->booking_code);

        } catch (\Exception $e) {
            Log::error("ChatService Error: " . $e->getMessage());
        }
    }

    /**
     * Khách gửi yêu cầu Check-in
     */
    public function sendCheckInRequestMessage(Booking $booking)
    {
        try {
            $data = $this->getConversationAndUsers($booking);
            if (!$data) return;
            [$conversation, $touristId, $providerUserId, $service] = $data;

            $content = "**Yêu cầu Check-in:** Khách hàng đã gửi yêu cầu Check-in cho đơn hàng **#{$booking->booking_code}**.\n\n"
                     . "Dịch vụ: **{$service->name}**\n"
                     . "Vui lòng xác nhận yêu cầu Check-in.\n"
                     . "**#BK-DETAIL-{$booking->booking_code}**";

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $touristId,
                'content' => $content,
            ]);

            $conversation->update(['last_message_at' => now()]);
            broadcast(new MessageSent($message, $providerUserId));

        } catch (\Exception $e) {
            Log::error("ChatService Error: " . $e->getMessage());
        }
    }

    /**
     * Khách hủy yêu cầu Check-in
     */
    public function sendUndoCheckInMessage(Booking $booking)
    {
        try {
            $data = $this->getConversationAndUsers($booking);
            if (!$data) return;
            [$conversation, $touristId, $providerUserId, $service] = $data;

            $content = "**Hủy yêu cầu Check-in:** Khách hàng đã hoàn tác yêu cầu Check-in cho đơn hàng **#{$booking->booking_code}**.\n\n"
                     . "Dịch vụ: **{$service->name}**\n"
                     . "**#BK-DETAIL-{$booking->booking_code}**";

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $touristId,
                'content' => $content,
            ]);

            $conversation->update(['last_message_at' => now()]);
            broadcast(new MessageSent($message, $providerUserId));

        } catch (\Exception $e) {
            Log::error("ChatService Error: " . $e->getMessage());
        }
    }

    /**
     * Khách báo Check-out
     */
    public function sendCheckOutMessage(Booking $booking)
    {
        try {
            $data = $this->getConversationAndUsers($booking);
            if (!$data) return;
            [$conversation, $touristId, $providerUserId, $service] = $data;

            $content = "**Check-out:** Khách hàng đã Check-out thành công cho đơn hàng **#{$booking->booking_code}**.\n\n"
                     . "Dịch vụ: **{$service->name}**\n"
                     . "Trạng thái đơn hàng đã chuyển sang Hoàn thành.\n"
                     . "**#BK-DETAIL-{$booking->booking_code}**";

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $touristId,
                'content' => $content,
            ]);

            $conversation->update(['last_message_at' => now()]);
            broadcast(new MessageSent($message, $providerUserId));

        } catch (\Exception $e) {
            Log::error("ChatService Error: " . $e->getMessage());
        }
    }

    /**
     * Provider xác nhận Check-in
     */
    public function sendCheckInConfirmedMessage(Booking $booking)
    {
        try {
            $data = $this->getConversationAndUsers($booking);
            if (!$data) return;
            [$conversation, $touristId, $providerUserId, $service] = $data;

            $content = "**Xác nhận Check-in:** Chào mừng bạn! Nhà cung cấp đã xác nhận Check-in cho đơn hàng **#{$booking->booking_code}**.\n\n"
                     . "Dịch vụ: **{$service->name}**\n"
                     . "Trạng thái đơn hàng: **Đang lưu trú/Đang diễn ra**\n"
                     . "**#BK-DETAIL-{$booking->booking_code}**";

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $providerUserId,
                'content' => $content,
            ]);

            $conversation->update(['last_message_at' => now()]);
            broadcast(new MessageSent($message, $touristId));

        } catch (\Exception $e) {
            Log::error("ChatService Error: " . $e->getMessage());
        }
    }
}
