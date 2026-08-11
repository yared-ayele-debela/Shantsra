<?php

namespace App\Mail;

use App\Models\PackageAlert;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PackageAlertMatchedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Shipment $shipment,
        public PackageAlert $alert,
        public User $user,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🔔 New Package Posted: {$this->shipment->from_city} to {$this->shipment->to_city}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.package-alert-matched',
            with: [
                'shipment' => $this->shipment,
                'alert' => $this->alert,
                'user' => $this->user,
            ],
        );
    }
}
