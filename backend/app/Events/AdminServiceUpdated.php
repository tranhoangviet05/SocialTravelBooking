<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminServiceUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $service;
    public $action; // 'created', 'updated', 'deleted'
    public $service_id; // Keep for 'deleted' action

    public function __construct($service, $action)
    {
        if ($action !== 'deleted') {
            $this->service = $service->loadMissing(['provider.user', 'location', 'category', 'media']);
            $this->service_id = $service->id;
        } else {
            // For 'deleted', $service is just the ID
            $this->service_id = $service;
            $this->service = null;
        }
        $this->action = $action;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin.services'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'AdminServiceUpdated';
    }

    public function broadcastWith(): array
    {
        $mappedService = null;
        if ($this->service) {
            $mappedService = $this->service->toArray(); // Let Laravel serialize all loaded relations
        }

        return [
            'service_id' => $this->service_id,
            'service_name' => $this->service ? $this->service->name : '',
            'service' => $mappedService,
            'action' => $this->action,
            'time' => now()->toIso8601String(),
        ];
    }
}
