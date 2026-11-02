<?php

return [
    'url' => rtrim((string) env('FRONTEND_URL', env('APP_URL', 'http://localhost:5173')), '/'),
    'asset_path' => env('FRONTEND_ASSET_PATH', 'frontend-build'),
    'og_image' => env('SEO_OG_IMAGE', env('APP_URL', 'http://localhost:8000').'/assets/og-fallback.svg'),
    'gsc_verification' => env('SEO_GSC_VERIFICATION'),
    'ga4_measurement_id' => env('GA4_MEASUREMENT_ID'),
];
