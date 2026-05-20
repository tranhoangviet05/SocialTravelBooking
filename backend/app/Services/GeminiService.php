<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->model = config('services.gemini.model', 'gemini-flash-latest');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    /**
     * Gửi yêu cầu đến Gemini API và trả về nội dung text.
     *
     * @param string $systemInstruction Chỉ dẫn hệ thống (Persona)
     * @param array $contents Danh sách hội thoại (history) chuẩn định dạng Gemini
     * @return string|null
     */
    public function generateContent(string $systemInstruction, array $contents): ?string
    {
        try {
            if (!$this->apiKey) {
                Log::error('Gemini Service: API Key is missing.');
                return 'Hệ thống chưa cấu hình API Key cho Gemini. Vui lòng liên hệ Admin.';
            }

            $url = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

            $payload = [
                'contents' => $contents,
            ];

            if (!empty($systemInstruction)) {
                $payload['systemInstruction'] = [
                    'parts' => [
                        ['text' => $systemInstruction]
                    ]
                ];
            }

            // Gọi API bằng HTTP Client của Laravel
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($url, $payload);

            if ($response->failed()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return 'Rất tiếc, tôi đang gặp sự cố kết nối với hệ thống AI. Vui lòng thử lại sau.';
            }

            $data = $response->json();
            $textResponse = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$textResponse) {
                Log::warning('Gemini Response: Format invalid or empty candidates', ['response' => $data]);
                return 'Tôi không thể xử lý câu hỏi này lúc này. Bạn có thể hỏi câu khác được không?';
            }

            return $textResponse;
        } catch (\Throwable $e) {
            Log::error('Gemini Service Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 'Đã xảy ra lỗi hệ thống khi xử lý câu trả lời từ AI.';
        }
    }
}
