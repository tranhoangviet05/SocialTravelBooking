<?php

namespace App\Jobs;

use App\Events\MessageSent;
use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Service;
use App\Models\User;
use App\Services\GeminiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessGeminiChat implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $conversationId;
    protected string $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $conversationId, string $userId)
    {
        $this->conversationId = $conversationId;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(GeminiService $geminiService): void
    {
        try {
            $conversation = Conversation::find($this->conversationId);
            $user = User::find($this->userId);

            if (!$conversation || !$user) {
                Log::error("ProcessGeminiChat: Conversation or User not found", [
                    'conversation_id' => $this->conversationId,
                    'user_id' => $this->userId
                ]);
                return;
            }

            // 1. Lấy lịch sử chat (15 tin nhắn gần nhất) để giữ context hội thoại
            $messages = Message::where('conversation_id', $this->conversationId)
                ->orderBy('created_at', 'asc')
                ->take(15)
                ->get();

            $contents = [];
            $lastRole = null;

            foreach ($messages as $msg) {
                $role = ($msg->sender_id === '00000000-0000-0000-0000-000000000000') ? 'model' : 'user';
                $text = $msg->content;

                // Chuẩn hóa định dạng Gemini: các role phải luân phiên xen kẽ
                if ($role === $lastRole && !empty($contents)) {
                    $contents[count($contents) - 1]['parts'][0]['text'] .= "\n" . $text;
                } else {
                    $contents[] = [
                        'role' => $role,
                        'parts' => [
                            ['text' => $text]
                        ]
                    ];
                    $lastRole = $role;
                }
            }

            // 2. Tra cứu dữ liệu thực tế (Simple RAG): Danh sách 6 tour/khách sạn bán chạy nhất
            $activeServices = Service::where('status', 'active')
                ->with(['location'])
                ->orderBy('total_bookings', 'desc')
                ->limit(6)
                ->get();

            $servicesContext = "Dưới đây là các dịch vụ du lịch (Tour và Khách sạn) đang mở bán thực tế trên hệ thống. Nếu người dùng hỏi gợi ý, hãy khuyên họ đặt các dịch vụ này và chèn link liên kết dạng Markdown `/service/{slug}`:\n";
            foreach ($activeServices as $service) {
                $typeLabel = $service->type === 'tour' ? 'Tour du lịch' : 'Khách sạn/Phòng';
                $locationName = $service->location ? $service->location->name : 'Nhiều địa điểm';
                $price = number_format($service->base_price, 0, ',', '.') . ' VND';
                
                $servicesContext .= "- **{$service->name}** ({$typeLabel}) tại {$locationName}. Giá từ: {$price}. Đường dẫn chi tiết: `/service/{$service->slug}`\n";
            }

            // 3. Tra cứu lịch sử đặt chỗ (Booking Assistant) của chính user này
            $bookings = Booking::where('user_id', $this->userId)
                ->with(['service'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            $bookingsContext = "Thông tin cá nhân khách hàng:\n";
            $bookingsContext .= "- Tên hiển thị: {$user->display_name}\n";
            $bookingsContext .= "- Email: {$user->email}\n";
            $bookingsContext .= "- Các đơn đặt chỗ (Bookings) gần đây của khách hàng:\n";

            if ($bookings->isEmpty()) {
                $bookingsContext .= "  (Chưa có đơn đặt chỗ nào trên hệ thống)\n";
            } else {
                foreach ($bookings as $booking) {
                    $statusLabel = $this->getBookingStatusLabel($booking->status);
                    $paymentLabel = $booking->payment_status === 'paid' ? 'Đã thanh toán' : ($booking->payment_status === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thanh toán');
                    $amount = number_format($booking->total_amount, 0, ',', '.') . ' VND';
                    $checkIn = $booking->check_in_date;
                    
                    $bookingsContext .= "  + Mã đơn: `#{$booking->booking_code}`, Dịch vụ: {$booking->service->name}, Trạng thái: {$statusLabel}, Thanh toán: {$paymentLabel}, Ngày check-in: {$checkIn}, Tổng số tiền: {$amount}\n";
                }
            }

            // 4. Xây dựng System Instruction (Persona & Context)
            $systemInstruction = "Bạn là Trợ lý ảo Gemini AI, trợ lý hỗ trợ khách hàng thông minh, thân thiện của ứng dụng 'Social Travel Booking'.\n"
                . "Nhiệm vụ của bạn là giải đáp thắc mắc, lập lịch trình du lịch và hỗ trợ khách hàng kiểm tra đơn đặt chỗ hoặc tìm kiếm dịch vụ.\n\n"
                . "QUY TẮC PHẢN HỒI:\n"
                . "1. Trả lời bằng tiếng Việt lịch sự, thân thiện, sử dụng các từ xưng hô ấm áp như 'Tôi' (hoặc 'Gemini') và 'bạn', 'quý khách'.\n"
                . "2. Nếu khách hàng hỏi về lịch trình du lịch, hãy lập lịch trình cụ thể, khoa học, đề xuất các danh lam thắng cảnh và hoạt động hấp dẫn.\n"
                . "3. CHỈ giới thiệu các dịch vụ thực tế có trong danh sách bên dưới khi khách hàng cần tư vấn đặt phòng/tour cụ thể. ĐÍNH KÈM link liên kết dạng Markdown `/service/{slug}` để họ nhấp vào.\n"
                . "4. Khi khách hàng hỏi về đơn hàng của họ (ví dụ: 'đơn hàng của tôi', 'booking của tôi'), hãy sử dụng thông tin đơn hàng được cung cấp trong ngữ cảnh bên dưới để trả lời chính xác mã đơn, trạng thái, ngày check-in. Nếu không có đơn hàng nào, hãy báo cho họ biết.\n"
                . "5. Không bịa đặt thông tin về các đơn hàng hoặc dịch vụ không tồn tại trong ngữ cảnh được cung cấp.\n\n"
                . "=== NGỮ CẢNH HỆ THỐNG ===\n"
                . $servicesContext . "\n"
                . $bookingsContext;

            // 5. Gọi Gemini API
            $replyText = $geminiService->generateContent($systemInstruction, $contents);

            if (!$replyText) {
                $replyText = 'Xin lỗi, tôi đang gặp lỗi kết nối với hệ thống AI. Vui lòng thử lại sau.';
            }

            // 6. Lưu tin nhắn của Bot vào DB
            $botMessage = Message::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'conversation_id' => $this->conversationId,
                'sender_id' => '00000000-0000-0000-0000-000000000000',
                'content' => $replyText,
                'is_read' => false
            ]);

            // Cập nhật last_message_at cho conversation
            $conversation->last_message_at = now();
            $conversation->save();

            // 7. Broadcast tin nhắn mới qua Echo/Reverb
            broadcast(new MessageSent($botMessage, $this->userId));

        } catch (\Throwable $e) {
            Log::error("ProcessGeminiChat Job Exception: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Dịch trạng thái booking sang tiếng Việt thân thiện
     */
    private function getBookingStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Chờ xác nhận',
            'confirmed' => 'Đã xác nhận (Chưa Check-in)',
            'ongoing' => 'Đang diễn ra (Đã Check-in)',
            'completed' => 'Đã hoàn thành (Đã Check-out)',
            'cancelled' => 'Đã hủy',
            default => $status
        };
    }
}
