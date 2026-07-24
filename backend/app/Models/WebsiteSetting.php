<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WebsiteSetting extends Model
{
    protected $fillable = [
        'site_name',
        'site_tagline',
        'site_description',
        'meta_keywords',
        'logo_path',
        'favicon_path',
        'social_facebook',
        'social_twitter',
        'social_instagram',
        'social_linkedin',
        'social_youtube',
    ];

    /**
     * Single row used for public site branding (admin-managed).
     */
    public static function current(): self
    {
        $row = static::query()->first();
        if ($row) {
            return $row;
        }

        return static::query()->create([
            'site_name' => 'PeerBridge',
            'site_tagline' => 'UAE to Ethiopia',
        ]);
    }

    public function logoPublicUrl(): ?string
    {
        return $this->assetUrl($this->logo_path);
    }

    public function faviconPublicUrl(): ?string
    {
        return $this->assetUrl($this->favicon_path);
    }

    private function assetUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return asset('storage/'.$path);
    }

    public function deleteStoredLogo(): void
    {
        if ($this->logo_path) {
            Storage::disk('public')->delete($this->logo_path);
        }
    }

    public function deleteStoredFavicon(): void
    {
        if ($this->favicon_path) {
            Storage::disk('public')->delete($this->favicon_path);
        }
    }
}
