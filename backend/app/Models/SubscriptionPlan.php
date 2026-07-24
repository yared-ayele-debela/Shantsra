<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'monthly_post_limit',
        'yearly_post_limit',
        'monthly_price',
        'yearly_price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'monthly_post_limit' => 'integer',
            'yearly_post_limit' => 'integer',
            'monthly_price' => 'decimal:2',
            'yearly_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
