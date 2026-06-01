<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use App\Models\Service;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendServiceToN8n implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $service;

    /**
     * Create a new job instance.
     */
    public function __construct(Service $service)
    {
        $this->service = $service;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $webhookUrl = config('services.n8n.moderation_url');

        try {
            $response = Http::timeout(10)->post($webhookUrl, $this->service->toArray());

            if (!$response->successful()) {
                Log::warning('Failed to send service to n8n moderation webhook', [
                    'service_id' => $this->service->id,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception while sending service to n8n', [
                'service_id' => $this->service->id,
                'message' => $e->getMessage()
            ]);
        }
    }
}
