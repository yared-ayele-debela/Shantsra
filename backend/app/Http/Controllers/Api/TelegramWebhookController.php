<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request, TelegramService $telegramService): JsonResponse
    {
        $update = $request->all();

        if (! empty($update)) {
            $telegramService->handleUpdate($update);
        }

        return response()->json(['ok' => true]);
    }
}
