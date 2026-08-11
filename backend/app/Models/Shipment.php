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
        'approval_status',
        'deal_status',
    ];

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

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

    public function getFirstPhotoUrlAttribute(): ?string
    {
        if (empty($this->product_images) || !is_array($this->product_images)) {
            return null;
        }

        $first = $this->product_images[0] ?? null;
        if (! $first) {
            return null;
        }

        if (str_starts_with($first, 'http://') || str_starts_with($first, 'https://') || str_starts_with($first, 'data:') || str_starts_with($first, '/assets')) {
            return $first;
        }

        return asset('storage/' . ltrim($first, '/'));
    }
}
