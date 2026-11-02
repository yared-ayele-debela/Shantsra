<!doctype html>
<html lang="{{ $locale }}" dir="{{ $locale === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&family=Noto+Sans+Ethiopic:wght@400;500;700&display=swap" rel="stylesheet">
    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    @unless ($indexable)
        <meta name="robots" content="noindex,follow">
    @endunless
    <link rel="canonical" href="{{ $canonical }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ $settings['site_name'] ?? 'PeerBridge Delivery' }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $canonical }}">
    <meta property="og:image" content="{{ asset('favicon.ico') }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <link rel="alternate" hreflang="en" href="{{ $canonical }}">
    <link rel="alternate" hreflang="am" href="{{ $canonical }}">
    <link rel="alternate" hreflang="ar" href="{{ $canonical }}">
    <link rel="alternate" hreflang="x-default" href="{{ $canonical }}">
    <script type="application/ld+json">{!! $structuredData !!}</script>
    @php
        $manifestPath = public_path(config('frontend.asset_path').'/manifest.json');
        $manifest = file_exists($manifestPath) ? json_decode(file_get_contents($manifestPath), true) : null;
        $entry = $manifest['src/main.jsx'] ?? null;
    @endphp
    @if ($entry)
        @foreach ($entry['css'] ?? [] as $css)
            <link rel="stylesheet" href="{{ asset(config('frontend.asset_path').'/'.$css) }}">
        @endforeach
        <script type="module" src="{{ asset(config('frontend.asset_path').'/'.$entry['file']) }}"></script>
    @else
        <script type="module" src="{{ config('frontend.url') }}/src/main.jsx"></script>
    @endif
</head>
<body>
    <div id="root">
        <main data-seo-content>
            <h1>{{ $content['h1'] ?? $title }}</h1>
            <p>{{ $content['summary'] ?? $description }}</p>
            @if (!empty($content['listings']))
                <section aria-labelledby="route-listings">
                    <h2 id="route-listings">Active delivery requests</h2>
                    <ul>
                        @foreach ($content['listings'] as $listing)
                            <li><a href="{{ $listing['url'] }}">{{ $listing['title'] }}</a></li>
                        @endforeach
                    </ul>
                </section>
            @endif
            @if (!empty($content['relatedRoutes']))
                <nav aria-label="Related routes">
                    <h2>Related routes</h2>
                    <ul>
                        @foreach ($content['relatedRoutes'] as $relatedRoute)
                            <li><a href="{{ $relatedRoute }}">{{ $relatedRoute }}</a></li>
                        @endforeach
                    </ul>
                </nav>
            @endif
        </main>
    </div>
</body>
</html>
