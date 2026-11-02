<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebsiteSetting;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $s = WebsiteSetting::current();

        return response()->json([
            'site_name' => in_array(strtolower(trim((string) $s->site_name)), ['peerbridge', 'peerbridge delivery', 'preebridge'], true)
                ? 'Shantasra'
                : $s->site_name,
            'site_tagline' => $s->site_tagline,
            'site_description' => $s->site_description,
            'meta_keywords' => $s->meta_keywords,
            'logo_url' => $s->logoPublicUrl(),
            'favicon_url' => $s->faviconPublicUrl(),
            'social' => [
                'facebook' => $s->social_facebook,
                'twitter' => $s->social_twitter,
                'instagram' => $s->social_instagram,
                'linkedin' => $s->social_linkedin,
                'youtube' => $s->social_youtube,
            ],
        ]);
    }
}
