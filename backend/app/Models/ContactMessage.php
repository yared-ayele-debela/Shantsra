<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactMessage extends Model
{
    protected $fillable = [
        'contact_conversation_id',
        'user_id',
        'body',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ContactConversation::class, 'contact_conversation_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
