<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Travel;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SitemapController extends Controller
{
    private const CHUNK_SIZE = 50000;

    public function index(): Response
    {
        $entries = $this->sitemapEntries();
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach (array_keys($entries) as $type) {
            foreach (range(1, max(1, (int) ceil(count($entries[$type]) / self::CHUNK_SIZE))) as $page) {
                $xml .= '<sitemap><loc>'.e(url("/sitemaps/{$type}-{$page}.xml")).'</loc><lastmod>'.now()->toAtomString().'</lastmod></sitemap>';
            }
        }
        $xml .= '</sitemapindex>';

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function child(string $type, int $page): Response
    {
        $entries = $this->sitemapEntries()[$type] ?? null;
        abort_unless($entries, 404);
        $urls = array_slice($entries, ($page - 1) * self::CHUNK_SIZE, self::CHUNK_SIZE);
        abort_if($page < 1 || ($page > 1 && $urls === []), 404);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
        foreach ($urls as $entry) {
            $xml .= '<url><loc>'.e($entry['loc']).'</loc>';
            if (! empty($entry['lastmod'])) {
                $xml .= '<lastmod>'.e($entry['lastmod']).'</lastmod>';
            }
            foreach (['en', 'am', 'ar', 'x-default'] as $language) {
                $xml .= '<xhtml:link rel="alternate" hreflang="'.$language.'" href="'.e($entry['loc']).'"/>';
            }
            $xml .= '</url>';
        }
        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots(): Response
    {
        $body = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /api',
            'Disallow: /dashboard',
            'Disallow: /login',
            'Disallow: /register',
            'Disallow: /reset-password',
            'Disallow: /storage/private',
            'Disallow: /*?*',
            'Sitemap: '.url('/sitemap.xml'),
            '',
        ]);

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function warm(): void
    {
        Cache::put('seo:sitemaps:entries', $this->buildEntries(), now()->addHours(2));
    }

    private function sitemapEntries(): array
    {
        return Cache::remember('seo:sitemaps:entries', now()->addHours(2), fn () => $this->buildEntries());
    }

    private function buildEntries(): array
    {
        $static = ['/', '/packages', '/travelers', '/how-it-works', '/faq', '/about', '/contact', '/safety'];
        $entries = [
            'static' => array_map(fn (string $path) => ['loc' => url($path), 'lastmod' => now()->toAtomString()], $static),
            'routes' => [],
            'packages' => [],
            'travelers' => [],
        ];

        Shipment::query()
            ->where('approval_status', 'approved')
            ->where(function ($query) {
                $query->where('deal_status', '!=', 'confirmed')->orWhereNull('deal_status');
            })
            ->where('is_paused_by_inquiries', false)
            ->where(function ($query) {
                $query->whereNull('travel_date')->orWhereDate('travel_date', '>=', Carbon::today());
            })
            ->select(['id', 'from_city', 'to_city', 'description', 'updated_at'])
            ->chunkById(1000, function ($shipments) use (&$entries) {
                foreach ($shipments as $shipment) {
                    $title = Str::limit($shipment->description ?: "Package from {$shipment->from_city} to {$shipment->to_city}", 55, '');
                    $entries['packages'][] = [
                        'loc' => url("/packages/{$shipment->id}-".Str::slug($title)),
                        'lastmod' => $shipment->updated_at?->toAtomString(),
                    ];
                    $entries['routes'][] = [
                        'loc' => url('/routes/'.Str::slug($shipment->from_city).'-to-'.Str::slug($shipment->to_city)),
                        'lastmod' => $shipment->updated_at?->toAtomString(),
                    ];
                }
            });

        Travel::query()
            ->whereHas('traveler', fn ($query) => $query->where('status', 'active'))
            ->where(function ($query) {
                $query->whereNull('departure_date')->orWhereDate('departure_date', '>=', Carbon::today());
            })
            ->with('traveler:id,name')
            ->select(['id', 'traveler_id', 'from_city', 'to_city', 'updated_at'])
            ->chunkById(1000, function ($travels) use (&$entries) {
                foreach ($travels as $travel) {
                    $entries['travelers'][] = [
                        'loc' => url("/travelers/{$travel->id}-".Str::slug($travel->traveler?->name ?: 'traveler')),
                        'lastmod' => $travel->updated_at?->toAtomString(),
                    ];
                }
            });

        $entries['routes'] = collect($entries['routes'])->unique('loc')->values()->all();

        return $entries;
    }
}
