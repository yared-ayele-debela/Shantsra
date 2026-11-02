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

        $description = Str::limit("Send {$shipment->description} from {$shipment->from_city} to {$shipment->to_city} with PeerBridge Delivery.", 155, '');

        return $this->render('package', $title, $description, $canonical, [
            'h1' => $title,
            'summary' => $description,
            'jsonLd' => [
                '@type' => 'Service',
                'name' => $title,
                'serviceType' => 'Peer-to-peer package delivery',
                'areaServed' => [$shipment->from_city, $shipment->to_city],
                'url' => $canonical,
            ],
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
        ]);
    }

    public function routeLanding(string $origin, string $destination): View
    {
        $originName = Str::headline(str_replace('-', ' ', $origin));
        $destinationName = Str::headline(str_replace('-', ' ', $destination));
        $title = "Send packages from {$originName} to {$destinationName} | PeerBridge";
        $description = "Find trusted travelers and active package delivery requests from {$originName} to {$destinationName}.";

        return $this->render('route', $title, $description, url("/routes/{$origin}-to-{$destination}"), [
            'h1' => "Delivery from {$originName} to {$destinationName}",
            'summary' => $description,
        ]);
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

    private function render(string $type, string $title, string $description, ?string $canonical = null, array $content = []): View
    {
        $settings = Cache::remember(
            'seo:site-settings',
            now()->addMinutes(10),
            fn () => WebsiteSetting::query()->first()?->only(['site_name', 'logo_url', 'same_as'])
        );
        $siteName = $settings['site_name'] ?? 'PeerBridge Delivery';
        $canonical ??= url()->current();
        $content['jsonLd'] ??= [
            '@type' => 'WebPage',
            'name' => $title,
            'description' => $description,
            'url' => $canonical,
        ];

        $structuredData = json_encode([
            '@context' => 'https://schema.org',
            '@graph' => [
                ['@type' => 'Organization', 'name' => $siteName, 'url' => config('frontend.url')],
                ['@type' => 'WebSite', 'name' => $siteName, 'url' => config('frontend.url')],
                $content['jsonLd'],
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return view('seo.spa', compact('type', 'title', 'description', 'canonical', 'content', 'settings', 'structuredData'));
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
        return Str::limit($shipment->description ?: "Package from {$shipment->from_city} to {$shipment->to_city}", 55, '');
    }

    private function packageUrl(Shipment $shipment): string
    {
        return url("/packages/{$shipment->id}-".Str::slug($this->packageTitle($shipment)));
    }
}
