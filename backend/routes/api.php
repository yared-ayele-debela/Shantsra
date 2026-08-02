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
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

Route::get('/travelers', [TravelerController::class, 'index']);
Route::get('/shipments/open', [OpenShipmentController::class, 'index']);
Route::get('/shipments/urgent', [OpenShipmentController::class, 'urgent']);
Route::get('/package-categories', [PackageCategoryController::class, 'index']);
Route::get('/site-settings', [SiteSettingController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/user', [AuthController::class, 'updateProfile']);
    Route::post('/user', [AuthController::class, 'updateProfile']);
    Route::get('/shipments', [ShipmentController::class, 'index']);
    Route::post('/shipments', [ShipmentController::class, 'store']);
    Route::post('/travels', [TravelListingController::class, 'store']);
    Route::get('/travels/mine', [TravelListingController::class, 'mine']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations/start', [ConversationController::class, 'start']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'storeMessage']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
