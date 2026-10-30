<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class TestingToolsController
{
    /**
     * Return non-sensitive checks that help verify the backend is running.
     */
    public function health(): JsonResponse
    {
        $checks = [
            'application' => true,
            'database' => $this->databaseIsAvailable(),
            'storage' => $this->storageIsWritable(),
        ];

        return response()->json([
            'status' => in_array(false, $checks, true) ? 'degraded' : 'ok',
            'app' => config('app.name'),
            'environment' => app()->environment(),
            'debug' => (bool) config('app.debug'),
            'checks' => $checks,
            'timestamp' => now()->toIso8601String(),
        ], in_array(false, $checks, true) ? 503 : 200);
    }

    /**
     * Run one of the explicitly supported maintenance commands.
     */
    public function run(string $command): JsonResponse
    {
        $commands = [
            'optimize-clear' => 'optimize:clear',
            'cache-clear' => 'cache:clear',
            'config-clear' => 'config:clear',
            'route-clear' => 'route:clear',
            'storage-link' => 'storage:link',
            'view-clear' => 'view:clear',
        ];

        abort_unless(isset($commands[$command]), 404);

        $exitCode = Artisan::call($commands[$command]);

        return response()->json([
            'status' => $exitCode === 0 ? 'ok' : 'failed',
            'command' => $commands[$command],
            'output' => trim(Artisan::output()),
        ], $exitCode === 0 ? 200 : 500);
    }

    private function databaseIsAvailable(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    private function storageIsWritable(): bool
    {
        try {
            return Storage::disk()->put('.health-check', now()->toIso8601String())
                && Storage::disk()->delete('.health-check');
        } catch (Throwable) {
            return false;
        }
    }
}
