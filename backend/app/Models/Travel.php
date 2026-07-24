<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Travel extends Model
{
    use HasFactory;

    protected $table = 'travel';

    protected $fillable = [
        'traveler_id',
        'from_city',
        'to_city',
        'departure_date',
        'available_weight',
        'price_per_kg',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'departure_date' => 'date',
            'available_weight' => 'decimal:2',
            'price_per_kg' => 'decimal:2',
        ];
    }

    public function traveler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'traveler_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
