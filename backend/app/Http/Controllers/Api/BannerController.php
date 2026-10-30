<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $placement = $request->string('placement')->toString();

        $banners = Banner::query()
            ->currentlyVisible()
            ->when($placement, fn ($query) => $query->whereIn('placement', [$placement, 'all']))
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Banner $banner): array => [
                'id' => $banner->id,
                'title' => $banner->title,
                'badge' => $banner->badge,
                'description' => $banner->description,
                'image_url' => $banner->imageUrl(),
                'bg_gradient' => $banner->bg_gradient,
                'cta_text' => $banner->cta_text,
                'cta_link' => $banner->cta_link,
                'placement' => $banner->placement,
            ]);

        return response()->json(['banners' => $banners]);
    }
}
