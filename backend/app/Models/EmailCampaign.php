<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    use HasFactory;

    public const AUDIENCE_OPTIONS = [
        'all' => 'All opted-in users',
        'active' => 'Only active users',
        'senders' => 'Only senders',
        'travelers' => 'Only travelers',
        'ethiopia' => 'Users in Ethiopia',
        'uae' => 'Users in UAE',
    ];

    protected $fillable = [
        'created_by_admin_id',
        'subject',
        'title',
        'body',
        'image_url',
        'cta_text',
        'cta_url',
        'audience_filter',
        'status',
        'batch_id',
        'scheduled_at',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by_admin_id');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(EmailCampaignRecipient::class);
    }

    public function audienceLabel(): string
    {
        return self::AUDIENCE_OPTIONS[$this->audience_filter] ?? ucfirst($this->audience_filter);
    }
}
