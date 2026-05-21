<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BehaviorTrackingController extends Controller
{
    /**
     * Nhận dữ liệu hành vi từ Frontend và chuyển tiếp sang n8n.
     * n8n sẽ chịu trách nhiệm ghi/cập nhật trực tiếp vào bảng user_behavior.
     */
    public function track(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id'      => 'required|uuid',
                'action_type'  => 'required|string', 
                'location_id'  => 'nullable|integer',
                'service_type' => 'nullable|string',
                'service_id'   => 'nullable|string',
                'post_id'      => 'nullable|string',
                'comment_text' => 'nullable|string',
                'dwell_time'   => 'nullable|numeric',
                'tags'         => 'nullable|array', // Mảng tag_id
            ]);

            $n8nUrl = env('N8N_WEBHOOK_URL');
            if ($n8nUrl) {
                // Gửi dữ liệu và bắt phản hồi để debug
                $response = Http::post($n8nUrl, $validated);
                
                if ($response->failed()) {
                    Log::error('n8n Webhook Error', [
                        'url' => $n8nUrl,
                        'status' => $response->status(),
                        'response' => $response->body()
                    ]);
                } else {
                    Log::info('n8n Webhook Triggered Successfully', ['status' => $response->status()]);
                }
            } else {
                Log::warning('N8N_WEBHOOK_URL is not defined in .env');
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Behavior Tracking Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
