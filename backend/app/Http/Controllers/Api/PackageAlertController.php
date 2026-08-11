<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PackageAlert;
use App\Models\PackageNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PackageAlertController extends Controller
{
    /**
     * Get user's package alerts and triggered notifications.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $alerts = $user->packageAlerts()
            ->latest()
            ->get()
            ->map(function (PackageAlert $alert) {
                return [
                    'id' => $alert->id,
                    'from_city' => $alert->from_city,
                    'to_city' => $alert->to_city,
                    'start_date' => $alert->start_date ? Carbon::parse($alert->start_date)->toDateString() : null,
                    'end_date' => $alert->end_date ? Carbon::parse($alert->end_date)->toDateString() : null,
                    'email_notify' => (bool) $alert->email_notify,
                    'is_active' => (bool) $alert->is_active,
                    'created_at' => $alert->created_at->toIso8601String(),
                ];
            });

        $notifications = $user->packageNotifications()
            ->with(['shipment', 'alert'])
            ->latest()
            ->take(20)
            ->get()
            ->map(function (PackageNotification $notification) {
                $shipment = $notification->shipment;
                return [
                    'id' => $notification->id,
                    'package_alert_id' => $notification->package_alert_id,
                    'shipment_id' => $notification->shipment_id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'email_sent' => (bool) $notification->email_sent,
                    'is_read' => (bool) $notification->is_read,
                    'created_at' => $notification->created_at->toIso8601String(),
                    'shipment' => $shipment ? [
                        'id' => $shipment->id,
                        'receiver_name' => $shipment->receiver_name,
                        'from_city' => $shipment->from_city,
                        'to_city' => $shipment->to_city,
                        'weight' => (float) $shipment->weight,
                        'description' => $shipment->description,
                        'travel_date' => $shipment->travel_date ? Carbon::parse($shipment->travel_date)->toDateString() : null,
                    ] : null,
                ];
            });

        return response()->json([
            'alerts' => $alerts,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Store a new package notification alert rule.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_city' => ['required', 'string', 'max:255'],
            'to_city' => ['required', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'email_notify' => ['nullable', 'boolean'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        $alert = PackageAlert::create([
            'user_id' => $user->id,
            'from_city' => trim($validated['from_city']),
            'to_city' => trim($validated['to_city']),
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'email_notify' => $validated['email_notify'] ?? true,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Package alert notification created successfully.',
            'alert' => [
                'id' => $alert->id,
                'from_city' => $alert->from_city,
                'to_city' => $alert->to_city,
                'start_date' => $alert->start_date ? Carbon::parse($alert->start_date)->toDateString() : null,
                'end_date' => $alert->end_date ? Carbon::parse($alert->end_date)->toDateString() : null,
                'email_notify' => (bool) $alert->email_notify,
                'is_active' => (bool) $alert->is_active,
                'created_at' => $alert->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Toggle the active status of an alert.
     */
    public function toggle(Request $request, PackageAlert $alert): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($alert->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $alert->update([
            'is_active' => !$alert->is_active,
        ]);

        return response()->json([
            'message' => 'Package alert status updated.',
            'is_active' => (bool) $alert->is_active,
        ]);
    }

    /**
     * Delete an alert.
     */
    public function destroy(Request $request, PackageAlert $alert): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($alert->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $alert->delete();

        return response()->json([
            'message' => 'Package alert deleted successfully.',
        ]);
    }

    /**
     * Dismiss/delete a triggered notification.
     */
    public function dismissNotification(Request $request, PackageNotification $notification): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($notification->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification dismissed successfully.',
        ]);
    }
}
