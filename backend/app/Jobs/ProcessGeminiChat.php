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
                ->latest('created_at')
                ->take(15)
                ->get()
                ->reverse()
                ->values();

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

            $systemInstruction = "Bạn là nhân viên CSKH xuất sắc của SocialTravelBooking. Giọng điệu ấm áp, chuyên nghiệp, luôn xưng hô 'Chúng tôi' và 'Bạn' (hoặc tùy theo xưng hô của khách).\n"
                . "Nhiệm vụ: Giải đáp thắc mắc, kiểm tra lịch sử đặt phòng/tour của khách, và gợi ý dịch vụ du lịch.\n"
                . "Khi khách hỏi về đơn hàng, hãy gọi hàm search_user_bookings. Nếu khách hỏi về 1 đơn cụ thể, hãy kiểm tra danh sách xem có không, nếu không có hãy yêu cầu mã đơn.\n"
                . "Khi khách muốn tìm tour hoặc khách sạn, hãy gọi hàm search_services.\n"
                . "Tuyệt đối không tự bịa ra thông tin đơn hàng hoặc dịch vụ. Chỉ trả lời dựa trên kết quả của hàm trả về.";

            $tools = [
                [
                    'name' => 'search_user_bookings',
                    'description' => 'Tìm kiếm đơn đặt phòng/tour của khách hàng hiện tại. Sử dụng khi khách hỏi về lịch sử đặt, thời gian check-in, trạng thái đơn.',
                    'parameters' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'service_type' => [
                                'type' => 'STRING',
                                'description' => 'Loại dịch vụ: "hotel", "tour", "homestay", "vehicle", hoặc "all"',
                            ],
                            'booking_code' => [
                                'type' => 'STRING',
                                'description' => 'Mã đơn hàng cụ thể nếu khách có cung cấp (ví dụ: BKG-1234)',
                            ]
                        ]
                    ]
                ],
                [
                    'name' => 'search_services',
                    'description' => 'Tìm kiếm các dịch vụ, tour, khách sạn trên hệ thống để giới thiệu cho khách.',
                    'parameters' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'keyword' => [
                                'type' => 'STRING',
                                'description' => 'Từ khóa tìm kiếm (ví dụ: "Phú Quốc", "Đà Lạt", "Khách sạn 5 sao")',
                            ],
                            'service_type' => [
                                'type' => 'STRING',
                                'description' => 'Loại dịch vụ cần tìm: "hotel", "tour", "homestay", "vehicle", hoặc "all"',
                            ]
                        ]
                    ]
                ]
            ];

            $replyText = 'Xin lỗi, tôi đang gặp chút sự cố. Bạn vui lòng thử lại sau nhé.';
            $maxLoops = 3;
            $loopCount = 0;

            while ($loopCount < $maxLoops) {
                $response = $geminiService->generateContent($systemInstruction, $contents, $tools);

                // Nếu GeminiService trả về mảng lỗi
                if (is_array($response) && isset($response['error'])) {
                    $replyText = $response['error'];
                    break;
                }

                // Nếu AI yêu cầu gọi hàm
                if (is_array($response) && isset($response['functionCall'])) {
                    $functionCall = $response['functionCall'];
                    $functionName = $functionCall['name'];
                    $functionArgs = $functionCall['args'] ?? [];

                    // Thêm functionCall vào lịch sử
                    $contents[] = [
                        'role' => 'model',
                        'parts' => [['functionCall' => $functionCall]]
                    ];

                    // Thực thi hàm PHP nội bộ
                    $functionResult = [];
                    if ($functionName === 'search_user_bookings') {
                        $functionResult = $this->searchUserBookings($functionArgs);
                    } elseif ($functionName === 'search_services') {
                        $functionResult = $this->searchServices($functionArgs);
                    } else {
                        $functionResult = ['error' => 'Function not found'];
                    }

                    // Đưa kết quả vào lịch sử - role phải là 'user' theo đặc tả Gemini API
                    $contents[] = [
                        'role' => 'user',
                        'parts' => [
                            [
                                'functionResponse' => [
                                    'name' => $functionName,
                                    'response' => [
                                        'name' => $functionName,
                                        'content' => $functionResult
                                    ]
                                ]
                            ]
                        ]
                    ];
                    $loopCount++;
                } elseif (is_string($response)) {
                    // AI trả về câu trả lời cuối cùng dạng văn bản
                    $replyText = $response;
                    break;
                } else {
                    break;
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

    /**
     * Hàm dùng cho AI tra cứu lịch sử đơn hàng của người dùng hiện tại
     */
    private function searchUserBookings(array $args): array
    {
        $query = Booking::where('user_id', $this->userId)->with('service:id,name,type,address');
        
        if (!empty($args['booking_code'])) {
            $query->where('booking_code', 'like', '%' . $args['booking_code'] . '%');
        }
        
        if (!empty($args['service_type']) && $args['service_type'] !== 'all') {
            $query->whereHas('service', function($q) use ($args) {
                $q->where('type', $args['service_type']);
            });
        }
        
        $bookings = $query->latest()->take(5)->get();
        
        if ($bookings->isEmpty()) {
            return ['message' => 'Không tìm thấy đơn hàng nào phù hợp với yêu cầu.'];
        }
        
        $result = [];
        foreach ($bookings as $b) {
            $result[] = [
                'booking_code' => $b->booking_code,
                'service_name' => $b->service->name ?? 'Không xác định',
                'service_type' => $b->service->type ?? 'Không xác định',
                'status' => $this->getBookingStatusLabel($b->status),
                'check_in_date' => $b->check_in_date ? $b->check_in_date->format('d/m/Y') : null,
                'total_amount' => number_format($b->total_amount, 0, ',', '.') . ' VNĐ',
            ];
        }
        
        return ['bookings' => $result];
    }

    /**
     * Hàm dùng cho AI tra cứu dịch vụ/tour trên hệ thống
     */
    private function searchServices(array $args): array
    {
        $query = Service::where('status', 'active');
        
        if (!empty($args['service_type']) && $args['service_type'] !== 'all') {
            $query->where('type', $args['service_type']);
        }
        
        if (!empty($args['keyword'])) {
            $keyword = $args['keyword'];
            $query->where(function($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('address', 'like', "%{$keyword}%");
            });
        }
        
        $services = $query->latest()->take(5)->get();
        
        if ($services->isEmpty()) {
            return ['message' => 'Không tìm thấy dịch vụ nào phù hợp với từ khóa.'];
        }
        
        $result = [];
        foreach ($services as $s) {
            $result[] = [
                'id' => $s->id,
                'name' => $s->name,
                'type' => $s->type,
                'price' => number_format($s->base_price, 0, ',', '.') . ' VNĐ',
                'address' => $s->address,
                'rating' => $s->rating_avg,
            ];
        }
        
        return ['services' => $result];
    }
}
