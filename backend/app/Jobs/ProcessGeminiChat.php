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

            // Lấy lịch sử chat (15 tin nhắn gần nhất) để giữ context hội thoại
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

            // Gửi tin nhắn sang Webhook của N8N để AI Agent xử lý
            $webhookUrl = config('services.n8n.chatbot_webhook_url');

            if (!$webhookUrl) {
                Log::error("ProcessGeminiChat: N8N Chatbot Webhook URL is not configured in .env");
                $replyText = 'Hệ thống đang bảo trì để nâng cấp kiến trúc.';
            } else {
                // Lấy nội dung tin nhắn mới nhất của user trong mảng history
                $latestUserMessage = count($contents) > 0 ? end($contents)['parts'][0]['text'] : '';

                try {
                    // Đặt timeout cao (60s) vì AI Agent N8N có thể mất nhiều thời gian suy nghĩ và gọi Tools
                    $response = \Illuminate\Support\Facades\Http::timeout(60)->post($webhookUrl, [
                        'user_id' => $this->userId,
                        'user_name' => $user->display_name,
                        'user_email' => $user->email,
                        'conversation_id' => $this->conversationId,
                        'message' => $latestUserMessage,
                    ]);

                    if ($response->successful()) {
                        // N8N AI Agent trả về output mặc định nằm ở trường "output"
                        $n8nData = $response->json();
                        $replyText = $n8nData['output'] ?? (is_string($n8nData) ? $n8nData : json_encode($n8nData, JSON_UNESCAPED_UNICODE));
                    } else {
                        Log::error("ProcessGeminiChat: N8N Error", ['status' => $response->status(), 'body' => $response->body()]);
                        $replyText = 'Xin lỗi, trợ lý AI đang bị quá tải (Lỗi từ N8N). Bạn vui lòng thử lại sau nhé.';
                    }
                } catch (\Throwable $e) {
                    Log::error("ProcessGeminiChat: N8N Timeout/Connection Error: " . $e->getMessage());
                    $replyText = 'Xin lỗi, hệ thống máy chủ AI đang gặp sự cố kết nối. Xin vui lòng thử lại sau ít phút.';
                }
            }

            // 5. Lưu tin nhắn văn bản cuối cùng của Bot vào DB
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
