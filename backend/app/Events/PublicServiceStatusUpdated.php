<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PublicServiceStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $service_id;
    public $status;

    /**
     * Create a new event instance.
     */
    public function __construct($service_id, $status)
    {
        $this->service_id = $service_id;
        $this->status = $status;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('services'),
        ];
    }

    /**
     * Tên event khi được gửi đi
     */
    public function broadcastAs(): string
    {
        return 'PublicServiceStatusUpdated';
    }

    /**
     * Dữ liệu trả về cho client
     */
    public function broadcastWith(): array
    {
        return [
            'service_id' => $this->service_id,
            'status'     => $this->status,
            'time'       => now()->toIso8601String(),
        ];
    }
}
