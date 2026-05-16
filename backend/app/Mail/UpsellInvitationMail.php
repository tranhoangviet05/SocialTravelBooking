<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\ServiceUpsell;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UpsellInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $upsell;

    /**
     * Create a new message instance.
     */
    public function __construct(Booking $booking, ServiceUpsell $upsell)
    {
        $this->booking = $booking;
        $this->upsell = $upsell;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎁 Cơ hội nâng cấp dịch vụ tuyệt vời cho chuyến đi của bạn!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.upsell_invitation',
            with: [
                'userName' => $this->booking->contact_name,
                'serviceName' => $this->booking->service->name,
                'targetRoom' => $this->upsell->targetRoomType->name,
                'upgradeUrl' => env('FRONTEND_URL', 'http://localhost:3000') . '/my-bookings/' . $this->booking->id . '/upgrade',
            ]
        );
    }
}
