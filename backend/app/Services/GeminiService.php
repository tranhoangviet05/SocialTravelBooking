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
        $this->apiKey  = config('services.gemini.key');
        $this->model   = config('services.gemini.model', 'gemini-2.0-flash');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    /**
     * Gửi yêu cầu đến Gemini API và trả về nội dung text.
     *
     * @param string $systemInstruction Chỉ dẫn hệ thống (Persona)
     * @param array $contents Danh sách hội thoại (history) chuẩn định dạng Gemini
     * @param array|null $tools Danh sách các công cụ (Function Calling)
     * @return array|string Trả về ['functionCall'=>...] nếu AI muốn gọi hàm,
     *                      chuỗi text nếu là câu trả lời bình thường,
     *                      ['error'=>...] nếu có lỗi
     */
    public function generateContent(string $systemInstruction, array $contents, ?array $tools = null): array|string
    {
        try {
            if (!$this->apiKey) {
                Log::error('Gemini Service: API Key is missing.');
                return ['error' => 'Hệ thống chưa cấu hình API Key cho Gemini. Vui lòng liên hệ Admin.'];
            }

            $url = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

            $payload = [
                'contents' => $contents,
            ];

            if (!empty($systemInstruction)) {
                $payload['systemInstruction'] = [
                    'parts' => [['text' => $systemInstruction]]
                ];
            }

            if (!empty($tools)) {
                $payload['tools'] = [
                    ['functionDeclarations' => $tools]
                ];

                // Tắt tính năng "thinking" của gemini-2.5 khi dùng Function Calling
                // để tránh lỗi định dạng response và tăng tốc độ phản hồi
                $payload['generationConfig'] = [
                    'thinkingConfig' => ['thinkingBudget' => 0]
                ];
            }

            Log::info('Gemini Payload', ['payload' => json_encode($payload, JSON_PRETTY_PRINT)]);
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(45)
                ->post($url, $payload);

            if ($response->failed()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['error' => 'Rất tiếc, tôi đang gặp sự cố kết nối với hệ thống AI. Vui lòng thử lại sau.'];
            }

            $data      = $response->json();
            $parts     = $data['candidates'][0]['content']['parts'] ?? [];

            if (empty($parts)) {
                Log::warning('Gemini Response: Empty parts', [
                    'finish_reason' => $data['candidates'][0]['finishReason'] ?? 'unknown',
                    'response'      => $data,
                ]);
                return ['error' => 'Tôi không thể xử lý câu hỏi này lúc này. Bạn có thể hỏi câu khác được không?'];
            }

            // Duyệt qua tất cả parts: gemini-2.5-flash (thinking model) trả về
            // nhiều parts, trong đó parts[0] có thể là "thought" (suy nghĩ nội bộ).
            // Phải tìm đúng part chứa functionCall hoặc text thực sự.
            $textResult = null;
            foreach ($parts as $part) {
                // Bỏ qua phần "thinking" nội bộ của model
                if (!empty($part['thought'])) {
                    continue;
                }

                // Ưu tiên: nếu AI muốn gọi hàm
                if (isset($part['functionCall'])) {
                    return ['functionCall' => $part['functionCall']];
                }

                // Lưu lại phần text đầu tiên tìm được
                if (isset($part['text']) && $textResult === null) {
                    $textResult = $part['text'];
                }
            }

            return $textResult ?? 'Tôi chưa hiểu rõ ý bạn, vui lòng nói rõ hơn nhé.';

        } catch (\Throwable $e) {
            Log::error('Gemini Service Exception', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return ['error' => 'Đã xảy ra lỗi hệ thống khi xử lý câu trả lời từ AI.'];
        }
    }
}
