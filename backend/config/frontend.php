<?php

return [
    'url' => rtrim((string) env('FRONTEND_URL', env('APP_URL', 'http://localhost:5173')), '/'),
    'asset_path' => env('FRONTEND_ASSET_PATH', 'frontend-build'),
];
