<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Travel;
use App\Models\WebsiteSetting;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PublicSeoController extends Controller
{
    public function home(): View|RedirectResponse
    {
        if (request()->filled('package')) {
            $shipment = Shipment::find(request()->integer('package'));
            if ($shipment) {
                return redirect()->to($this->packageUrl($shipment), 301);
            }
        }

        return $this->render('home', 'PeerBridge Delivery | Cross-border delivery between UAE and Ethiopia', 'Send packages between the UAE and Ethiopia with trusted travelers on PeerBridge Delivery.');
    }

    public function package(int $shipmentId, ?string $slug = null): View|RedirectResponse
    {
        $shipment = Cache::remember("seo:shipment:{$shipmentId}", now()->addMinutes(10), fn () => Shipment::with('category')->find($shipmentId));
        if (! $shipment) {
            abort(404);
        }
        if (! $this->isIndexableShipment($shipment)) {
            abort(410);
        }

        $title = $this->packageTitle($shipment);
        $canonical = $this->packageUrl($shipment);
        if ($slug !== Str::slug($title)) {
            return redirect()->to($canonical, 301);
        }

        $description = Str::limit($this->safeText("Send {$shipment->description} from {$shipment->from_city} to {$shipment->to_city} with PeerBridge Delivery."), 155, '');

        return $this->render('package', $title, $description, $canonical, [
            'h1' => $title,
            'summary' => $description,
            'jsonLd' => [
                '@type' => 'Service',
                'name' => $title,
                'serviceType' => 'Peer-to-peer package delivery',
                'areaServed' => [$shipment->from_city, $shipment->to_city],
                'url' => $canonical,
                'offers' => [
                    '@type' => 'Offer',
                    'url' => $canonical,
                    'availability' => 'https://schema.org/InStock',
                ],
            ],
            'ogImage' => url("/og/packages/{$shipment->id}.svg"),
        ]);
    }

    public function traveler(int $travelId, ?string $slug = null): View|RedirectResponse
    {
        $travel = Cache::remember("seo:travel:{$travelId}", now()->addMinutes(10), fn () => Travel::with('traveler')->find($travelId));
        if (! $travel || ! $travel->traveler || $travel->traveler->status !== 'active') {
            abort(404);
        }

        $title = "Traveler from {$travel->from_city} to {$travel->to_city} | PeerBridge";
        $canonical = url("/travelers/{$travel->id}-".Str::slug($travel->traveler->name ?: 'traveler'));
        if ($slug !== Str::slug($travel->traveler->name ?: 'traveler')) {
            return redirect()->to($canonical, 301);
        }

        return $this->render('traveler', $title, "View an upcoming PeerBridge traveler trip from {$travel->from_city} to {$travel->to_city}.", $canonical, [
            'h1' => $title,
            'summary' => "Upcoming trip from {$travel->from_city} to {$travel->to_city}.",
            'jsonLd' => [
            '@type' => 'Trip',
            'name' => $title,
            'itinerary' => [
                '@type' => 'Place',
                'name' => "{$travel->from_city} to {$travel->to_city}",
            ],
            'url' => $canonical,
            ],
        ]);
    }

    public function routeLanding(string $origin, string $destination): View
    {
        $originName = Str::headline(str_replace('-', ' ', $origin));
        $destinationName = Str::headline(str_replace('-', ' ', $destination));
        $shipments = Shipment::query()
            ->where('approval_status', 'approved')
            ->where('from_city', 'like', $originName)
            ->where('to_city', 'like', $destinationName)
            ->where('is_paused_by_inquiries', false)
            ->where(function ($query) {
                $query->where('deal_status', '!=', 'confirmed')->orWhereNull('deal_status');
            })
            ->where(function ($query) {
                $query->whereNull('travel_date')->orWhereDate('travel_date', '>=', Carbon::today());
            })
            ->latest()
            ->limit(12)
            ->get(['id', 'description', 'from_city', 'to_city', 'updated_at']);
        $travels = Travel::query()
            ->where('from_city', 'like', $originName)
            ->where('to_city', 'like', $destinationName)
            ->whereHas('traveler', fn ($query) => $query->where('status', 'active'))
            ->where(function ($query) {
                $query->whereNull('departure_date')->orWhereDate('departure_date', '>=', Carbon::today());
            })
            ->get(['price_per_kg']);
        $prices = $travels->pluck('price_per_kg')->filter()->map(fn ($price) => (float) $price);
        $priceRange = $prices->isNotEmpty()
            ? 'Typical traveler pricing is '.number_format($prices->min(), 2).' to '.number_format($prices->max(), 2).' per kg.'
            : 'Pricing varies by traveler, package weight, and timing.';
        $title = Str::limit("Send packages from {$originName} to {$destinationName} | PeerBridge", 58, '');
        $description = Str::limit("Find active package requests and trusted travelers from {$originName} to {$destinationName}.", 155, '');
        $canonical = url("/routes/{$origin}-to-{$destination}");

        return $this->render('route', $title, $description, $canonical, [
            'h1' => "Delivery from {$originName} to {$destinationName}",
            'summary' => "{$description} {$priceRange}",
            'listings' => $shipments->map(fn (Shipment $shipment) => [
                'url' => $this->packageUrl($shipment),
                'title' => $this->packageTitle($shipment),
            ])->all(),
            'relatedRoutes' => $shipments->map(fn (Shipment $shipment) => url('/routes/'.Str::slug($shipment->to_city).'-to-'.Str::slug($shipment->from_city)))->unique()->values()->all(),
            'ogImage' => url("/og/routes/{$origin}-to-{$destination}.svg"),
        ], $shipments->isNotEmpty() || $prices->isNotEmpty());
    }

    public function staticPage(string $type): View
    {
        $pages = [
            'how-it-works' => ['How PeerBridge Delivery works', 'Learn how PeerBridge connects senders with trusted travelers for cross-border delivery.'],
            'faq' => ['Frequently asked questions | PeerBridge Delivery', 'Answers about sending packages and traveling with PeerBridge Delivery.'],
            'about' => ['About PeerBridge Delivery', 'PeerBridge Delivery helps people move packages across borders through trusted travelers.'],
            'contact' => ['Contact PeerBridge Delivery', 'Contact PeerBridge Delivery for help with a package or traveler listing.'],
            'safety' => ['Safety at PeerBridge Delivery', 'Learn how PeerBridge supports safer package handovers and verified travel listings.'],
        ];
        abort_unless(isset($pages[$type]), 404);
        [$title, $description] = $pages[$type];

        return $this->render($type, $title, $description, url("/{$type}"), [
            'h1' => $title,
            'summary' => $description,
        ]);
    }

    public function localized(string $locale, ?string $path = null): View
    {
        abort_unless(in_array($locale, ['en', 'am', 'ar'], true), 404);
        $pages = [
            'en' => ['PeerBridge Delivery', 'Cross-border package delivery between the UAE and Ethiopia.'],
            'am' => ['PeerBridge Delivery | የድንበር ተሻጋሪ መላኪያ', 'በታመኑ ተጓዦች መካከል በኢሜሬትስ እና በኢትዮጵያ ጥቅሎችን ይላኩ።'],
            'ar' => ['PeerBridge Delivery | توصيل بين الإمارات وإثيوبيا', 'أرسل الطرود بين الإمارات وإثيوبيا مع مسافرين موثوقين.'],
        ];
        [$title, $description] = $pages[$locale];
        $path = trim((string) $path, '/');
        $canonical = url("/{$locale}".($path ? "/{$path}" : ''));

        return $this->render('localized', $title, $description, $canonical, [
            'h1' => $title,
            'summary' => $description,
        ], true, $locale);
    }

    private function render(string $type, string $title, string $description, ?string $canonical = null, array $content = [], bool $indexable = true, string $locale = 'en'): View
    {
        $settings = Cache::remember(
            'seo:site-settings',
            now()->addMinutes(10),
            fn () => WebsiteSetting::query()->first()?->only([
                'site_name',
                'social_facebook',
                'social_twitter',
                'social_instagram',
                'social_linkedin',
                'social_youtube',
            ])
        );
        $siteName = $settings['site_name'] ?? 'PeerBridge Delivery';
        $canonical ??= url()->current();
        $content['jsonLd'] ??= [
            '@type' => 'WebPage',
            'name' => $title,
            'description' => $description,
            'url' => $canonical,
        ];
        $content['breadcrumb'] = [
            ['name' => 'Home', 'url' => url('/')],
            ['name' => $title, 'url' => $canonical],
        ];

        $structuredData = json_encode([
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Organization',
                    'name' => $siteName,
                    'url' => config('frontend.url'),
                    'sameAs' => array_values(array_filter([
                        $settings['social_facebook'] ?? null,
                        $settings['social_twitter'] ?? null,
                        $settings['social_instagram'] ?? null,
                        $settings['social_linkedin'] ?? null,
                        $settings['social_youtube'] ?? null,
                    ])),
                ],
                [
                    '@type' => 'WebSite',
                    'name' => $siteName,
                    'url' => config('frontend.url'),
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => config('frontend.url').'/packages?search={search_term_string}',
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
                [
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => collect($content['breadcrumb'])->values()->map(fn (array $item, int $index) => [
                        '@type' => 'ListItem',
                        'position' => $index + 1,
                        'name' => $item['name'],
                        'item' => $item['url'],
                    ])->all(),
                ],
                $content['jsonLd'],
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return view('seo.spa', compact('type', 'title', 'description', 'canonical', 'content', 'settings', 'structuredData', 'locale', 'indexable'));
    }

    private function isIndexableShipment(Shipment $shipment): bool
    {
        return $shipment->approval_status === 'approved'
            && $shipment->deal_status !== 'confirmed'
            && ! $shipment->is_paused_by_inquiries
            && (! $shipment->travel_date || Carbon::parse($shipment->travel_date)->isToday() || Carbon::parse($shipment->travel_date)->isFuture());
    }

    private function packageTitle(Shipment $shipment): string
    {
        return Str::limit($this->safeText($shipment->description ?: "Package from {$shipment->from_city} to {$shipment->to_city}"), 55, '');
    }

    private function packageUrl(Shipment $shipment): string
    {
        return url("/packages/{$shipment->id}-".Str::slug($this->packageTitle($shipment)));
    }

    private function safeText(string $text): string
    {
        return trim((string) preg_replace([
            '/[\w.+-]+@[\w-]+\.[\w.-]+/i',
            '/(?:\+?\d[\d\s().-]{7,}\d)/',
        ], '[private contact removed]', $text));
    }
}
