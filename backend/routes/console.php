<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Http\Controllers\SitemapController;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('campaigns:dispatch-scheduled')->everyMinute();

Artisan::command('seo:sitemaps', function () {
    app(SitemapController::class)->warm();
    $this->info('SEO sitemap cache refreshed.');
})->purpose('Refresh public SEO sitemap data');

Schedule::command('seo:sitemaps')->hourly();
