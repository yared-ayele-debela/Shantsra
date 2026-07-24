<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'category_id',
        'receiver_name',
        'receiver_phone',
        'from_city',
        'to_city',
        'weight',
        'description',
        'product_images',
        'travel_date',
        'is_urgent',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'travel_date' => 'date',
            'weight' => 'decimal:2',
            'product_images' => 'array',
            'is_urgent' => 'boolean',
        ];
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PackageCategory::class, 'category_id');
    }

    public function booking(): HasOne
    {
        return $this->hasOne(Booking::class);
    }
}
