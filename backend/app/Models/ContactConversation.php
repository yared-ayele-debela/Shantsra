<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContactConversation extends Model
{
    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'listable_type',
        'listable_id',
    ];

    public function listable(): MorphTo
    {
        return $this->morphTo();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ContactMessage::class)->orderBy('created_at');
    }

    /**
     * @return array{0: int, 1: int}
     */
    public static function orderedUserPair(int $userIdA, int $userIdB): array
    {
        return $userIdA <= $userIdB ? [$userIdA, $userIdB] : [$userIdB, $userIdA];
    }

    public function involvesUser(int $userId): bool
    {
        return (int) $this->user_one_id === $userId || (int) $this->user_two_id === $userId;
    }

    public function otherUserId(int $userId): int
    {
        return (int) $this->user_one_id === $userId
            ? (int) $this->user_two_id
            : (int) $this->user_one_id;
    }
}
