<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\EmailCampaignController;
use App\Http\Controllers\Admin\PackageCategoryController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Admin\SubscriptionPlanController;
use App\Http\Controllers\Admin\TestingToolsController;
use App\Http\Controllers\Admin\TravelController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WebsiteSettingController;
use App\Http\Controllers\MarketingSubscriptionController;
use App\Http\Controllers\PublicSeoController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/unsubscribe/{token}', [MarketingSubscriptionController::class, 'unsubscribe'])->name('marketing.unsubscribe');

Route::get('/', [PublicSeoController::class, 'home'])->name('home');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.index');
Route::get('/sitemaps/{type}-{page}.xml', [SitemapController::class, 'child'])
    ->whereIn('type', ['static', 'routes', 'packages', 'travelers'])
    ->whereNumber('page')->name('sitemap.child');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');
Route::get('/og/packages/{shipmentId}.svg', [\App\Http\Controllers\OgImageController::class, 'package'])
    ->whereNumber('shipmentId')->name('seo.og.package');
Route::get('/og/routes/{origin}-to-{destination}.svg', [\App\Http\Controllers\OgImageController::class, 'route'])->name('seo.og.route');
Route::get('/packages/{shipmentId}-{slug?}', [PublicSeoController::class, 'package'])
    ->whereNumber('shipmentId')->name('seo.package');
Route::get('/travelers/{travelId}-{slug?}', [PublicSeoController::class, 'traveler'])
    ->whereNumber('travelId')->name('seo.traveler');
Route::get('/routes/{origin}-to-{destination}', [PublicSeoController::class, 'routeLanding'])->name('seo.route');
Route::get('/how-it-works', [PublicSeoController::class, 'staticPage'])->defaults('type', 'how-it-works')->name('seo.how-it-works');
Route::get('/faq', [PublicSeoController::class, 'staticPage'])->defaults('type', 'faq')->name('seo.faq');
Route::get('/about', [PublicSeoController::class, 'staticPage'])->defaults('type', 'about')->name('seo.about');
Route::get('/contact', [PublicSeoController::class, 'staticPage'])->defaults('type', 'contact')->name('seo.contact');
Route::get('/safety', [PublicSeoController::class, 'staticPage'])->defaults('type', 'safety')->name('seo.safety');
Route::get('/dashboard', [PublicSeoController::class, 'privatePage'])->defaults('type', 'dashboard')->name('seo.dashboard');
Route::get('/login', [PublicSeoController::class, 'privatePage'])->defaults('type', 'login')->name('seo.login');
Route::get('/register', [PublicSeoController::class, 'privatePage'])->defaults('type', 'register')->name('seo.register');
Route::get('/reset-password', [PublicSeoController::class, 'privatePage'])->defaults('type', 'reset-password')->name('seo.reset-password');
Route::get('/chat', [PublicSeoController::class, 'privatePage'])->defaults('type', 'chat')->name('seo.chat');
Route::get('/{locale}/{path?}', [PublicSeoController::class, 'localized'])
    ->whereIn('locale', ['en', 'am', 'ar'])
    ->where('path', '.*')->name('seo.localized');
Route::fallback(fn () => abort(404));

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'create'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'store'])->name('login.store');
    });

    Route::middleware('admin.auth')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'destroy'])->name('logout');

        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::resource('banners', BannerController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('/tools/health', [TestingToolsController::class, 'health'])->name('tools.health');
        Route::post('/tools/{command}', [TestingToolsController::class, 'run'])
            ->whereIn('command', ['optimize-clear', 'cache-clear', 'config-clear', 'route-clear', 'storage-link', 'view-clear'])
            ->name('tools.run');
        Route::get('/profile', [AdminProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [AdminProfileController::class, 'update'])->name('profile.update');

        Route::get('/settings/website', [WebsiteSettingController::class, 'edit'])->name('settings.website.edit');
        Route::put('/settings/website', [WebsiteSettingController::class, 'update'])->name('settings.website.update');

        Route::get('/notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/{notification}/read', [AdminNotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/mark-all-read', [AdminNotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        Route::delete('/notifications/{notification}', [AdminNotificationController::class, 'destroy'])->name('notifications.destroy');

        Route::get('/campaigns', [EmailCampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create', [EmailCampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns', [EmailCampaignController::class, 'store'])->name('campaigns.store');
        Route::get('/campaigns/{campaign}', [EmailCampaignController::class, 'show'])->name('campaigns.show');
        Route::post('/campaigns/{campaign}/send', [EmailCampaignController::class, 'send'])->name('campaigns.send');
        Route::patch('/campaigns/{campaign}/cancel', [EmailCampaignController::class, 'cancel'])->name('campaigns.cancel');

        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::patch('/users/{user}/id-document-status', [UserController::class, 'updateIdDocumentStatus'])->name('users.id-document-status');

        Route::get('/shipments', [ShipmentController::class, 'index'])->name('shipments.index');
        Route::get('/shipments/{shipment}', [ShipmentController::class, 'show'])->name('shipments.show');
        Route::get('/shipments/{shipment}/edit', [ShipmentController::class, 'edit'])->name('shipments.edit');
        Route::put('/shipments/{shipment}', [ShipmentController::class, 'update'])->name('shipments.update');
        Route::patch('/shipments/{shipment}/approve', [ShipmentController::class, 'approve'])->name('shipments.approve');
        Route::patch('/shipments/{shipment}/reject', [ShipmentController::class, 'reject'])->name('shipments.reject');
        Route::patch('/shipments/{shipment}/status', [ShipmentController::class, 'updateStatus'])->name('shipments.update-status');
        Route::delete('/shipments/{shipment}', [ShipmentController::class, 'destroy'])->name('shipments.destroy');

        Route::resource('package-categories', PackageCategoryController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('subscription-plans', SubscriptionPlanController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::get('/travels', [TravelController::class, 'index'])->name('travels.index');
        Route::get('/travels/{travel}', [TravelController::class, 'show'])->name('travels.show');
        Route::patch('/travels/{travel}/status', [TravelController::class, 'updateStatus'])->name('travels.update-status');

        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.update-status');

        Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    });
});
