<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;
    public $action;
    public $message;
    public $touristId;
    public $providerId;

    /**
     * Create a new event instance.
     */
    public function __construct(Booking $booking, $action, $message)
    {
        // Load các quan hệ cần thiết để trả về cho Frontend
        $this->booking = $booking->loadMissing(['service.media', 'service.location', 'provider.user', 'roomType', 'user']);
        $this->action = $action;
        $this->message = $message;
        $this->touristId = $booking->user_id;
        $this->providerId = $booking->provider ? $booking->provider->user_id : ($booking->service && $booking->service->provider ? $booking->service->provider->user_id : null);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        if ($this->touristId) {
            $channels[] = new PrivateChannel('User.' . $this->touristId);
        }
        if ($this->providerId) {
            $channels[] = new PrivateChannel('User.' . $this->providerId);
        }
        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'BookingStatusUpdated';
    }

    public function broadcastWith(): array
    {
        $bk = $this->booking;
        
        $mappedBooking = [
            'id' => $bk->id,
            'booking_code' => $bk->booking_code,
            'user_id' => $bk->user_id,
            'service_id' => $bk->service_id,
            'check_in_date' => $bk->check_in_date,
            'check_out_date' => $bk->check_out_date,
            'num_adults' => $bk->num_adults,
            'num_children' => $bk->num_children,
            'contact_name' => $bk->contact_name,
            'contact_phone' => $bk->contact_phone,
            'contact_email' => $bk->contact_email,
            'total_amount' => $bk->total_amount,
            'payment_method' => $bk->payment_method,
            'payment_status' => $bk->payment_status,
            'status' => $bk->status,
            'cancel_reason' => $bk->cancel_reason,
            'tourist_check_in_at' => $bk->tourist_check_in_at,
            'is_checked_in' => (bool)$bk->is_checked_in,
            'checked_in_at' => $bk->checked_in_at,
            'checked_out_at' => $bk->checked_out_at,
            'created_at' => $bk->created_at ? $bk->created_at->toISOString() : null,
            'user' => $bk->user ? [
                'id' => $bk->user->id,
                'display_name' => $bk->user->display_name,
                'avatar_url' => $bk->user->avatar_url,
            ] : null,
            'service' => $bk->service ? [
                'id'   => $bk->service->id,
                'name' => $bk->service->name,
                'slug' => $bk->service->slug,
                'type' => $bk->service->type,
                'price' => $bk->service->base_price,
                'image' => (count($bk->service->media) > 0) ? $bk->service->media[0]->url : null,
            ] : null,
            'room_type' => $bk->roomType ? [
                'id'   => $bk->roomType->id,
                'name' => $bk->roomType->name,
                'rank' => $bk->roomType->rank,
            ] : null,
            'provider' => $bk->provider ? [
                'id' => $bk->provider->id,
                'business_name' => $bk->provider->business_name,
                'user_id' => $bk->provider->user_id,
                'avatar_url' => $bk->provider->user ? $bk->provider->user->avatar_url : null,
            ] : null,
        ];

        return [
            'booking' => $mappedBooking,
            'action' => $this->action,
            'message' => $this->message,
        ];
    }
}
