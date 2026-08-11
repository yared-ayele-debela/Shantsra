<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealConfirmation extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
        'user_id',
        'partner_id',
        'travel_id',
        'agreed_price',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'agreed_price' => 'decimal:2',
        ];
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function travel(): BelongsTo
    {
        return $this->belongsTo(Travel::class, 'travel_id');
    }
}
