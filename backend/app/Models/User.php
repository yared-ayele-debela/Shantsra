<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'email', 'password', 'phone', 'role', 'status', 'city', 'country', 'id_document_type', 'id_document_number', 'id_document_path', 'id_document_status', 'marketing_opt_in', 'unsubscribe_token'])]
#[Hidden(['password', 'remember_token', 'id_document_path'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $appends = [
        'id_document_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'marketing_opt_in' => 'boolean',
        ];
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'sender_id');
    }

    public function travels(): HasMany
    {
        return $this->hasMany(Travel::class, 'traveler_id');
    }

    public function sentBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'sender_id');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewed_user_id');
    }

    public function emailCampaignRecipients(): HasMany
    {
        return $this->hasMany(EmailCampaignRecipient::class);
    }

    public function getIdDocumentUrlAttribute(): ?string
    {
        if (! $this->id_document_path) {
            return null;
        }

        return asset('storage/'.$this->id_document_path);
    }

    public function deleteStoredIdDocument(): void
    {
        if ($this->id_document_path) {
            Storage::disk('public')->delete($this->id_document_path);
        }
    }
}
