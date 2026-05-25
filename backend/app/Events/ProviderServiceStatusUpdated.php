<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProviderServiceStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $recipientId;
    public $service_id;
    public $service_name;
    public $status;
    public $rejection_reason;
    public $approval_note;

    public function __construct($recipientId, $service_id, $service_name, $status, $rejection_reason = null, $approval_note = null)
    {
        $this->recipientId = $recipientId;
        $this->service_id = $service_id;
        $this->service_name = $service_name;
        $this->status = $status;
        $this->rejection_reason = $rejection_reason;
        $this->approval_note = $approval_note;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('User.' . $this->recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ProviderServiceStatusUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'service_id' => $this->service_id,
            'service_name' => $this->service_name,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'approval_note' => $this->approval_note,
            'time' => now()->toIso8601String(),
        ];
    }
}
