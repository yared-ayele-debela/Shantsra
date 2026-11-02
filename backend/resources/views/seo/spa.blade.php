<!doctype html>
<html lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
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
        </main>
    </div>
</body>
</html>
