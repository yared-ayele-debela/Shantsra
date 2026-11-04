<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\OpenShipmentController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\TravelerController;
use App\Http\Controllers\Api\TravelListingController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\PackageCategoryController;
use App\Http\Controllers\Api\PackageAlertController;
use App\Http\Controllers\Api\DealConfirmationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\TelegramWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/telegram/webhook', [TelegramWebhookController::class, 'handle']);

Route::middleware('guest')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

Route::get('/travelers', [TravelerController::class, 'index']);
Route::get('/shipments/open', [OpenShipmentController::class, 'index']);
Route::get('/shipments/urgent', [OpenShipmentController::class, 'urgent']);
Route::post('/shipments/{shipment}/inquire', [ShipmentController::class, 'inquire']);
Route::get('/package-categories', [PackageCategoryController::class, 'index']);
Route::get('/site-settings', [SiteSettingController::class, 'show']);
Route::get('/banners', [BannerController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/user', [AuthController::class, 'updateProfile']);
    Route::post('/user', [AuthController::class, 'updateProfile']);
    Route::get('/shipments', [ShipmentController::class, 'index']);
    Route::post('/shipments', [ShipmentController::class, 'store']);
    Route::put('/shipments/{shipment}', [ShipmentController::class, 'update']);
    Route::post('/shipments/{shipment}', [ShipmentController::class, 'update']);
    Route::post('/shipments/{shipment}/reactivate', [ShipmentController::class, 'reactivate']);
    Route::delete('/shipments/{shipment}', [ShipmentController::class, 'destroy']);
    Route::post('/travels', [TravelListingController::class, 'store']);
    Route::get('/travels/mine', [TravelListingController::class, 'mine']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations/start', [ConversationController::class, 'start']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'storeMessage']);
    
    // Simple Deal Confirmations
    Route::get('/deals/mine', [DealConfirmationController::class, 'index']);
    Route::post('/deals/confirm', [DealConfirmationController::class, 'store']);

    // Deal & Package Reviews
    Route::get('/reviews/mine', [ReviewController::class, 'index']);
    Route::get('/reviews/shipment/{shipment}', [ReviewController::class, 'show']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Package Alert Notifications
    Route::get('/package-alerts', [PackageAlertController::class, 'index']);
    Route::post('/package-alerts', [PackageAlertController::class, 'store']);
    Route::patch('/package-alerts/{alert}/toggle', [PackageAlertController::class, 'toggle']);
    Route::delete('/package-alerts/{alert}', [PackageAlertController::class, 'destroy']);
    Route::delete('/package-notifications/{notification}', [PackageAlertController::class, 'dismissNotification']);

    Route::post('/logout', [AuthController::class, 'logout']);
});
