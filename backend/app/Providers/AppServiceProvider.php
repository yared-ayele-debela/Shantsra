<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();

        ResetPassword::createUrlUsing(function (object $user, string $token): string {
            $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');

            return $frontendUrl.'/reset-password?token='.$token.'&email='.urlencode($user->email);
        });

        \Illuminate\Support\Facades\View::composer('admin.*', function ($view) {
            try {
                if (\Illuminate\Support\Facades\Schema::hasTable('website_settings')) {
                    $view->with('siteSettings', \App\Models\WebsiteSetting::current());
                }
            } catch (\Throwable $e) {
                // Ignore if db is uninitialized
            }
        });
    }
}
