<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_alert_id',
        'shipment_id',
        'title',
        'message',
        'email_sent',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'email_sent' => 'boolean',
            'is_read' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function alert(): BelongsTo
    {
        return $this->belongsTo(PackageAlert::class, 'package_alert_id');
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
