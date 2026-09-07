<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\PackageAlert;
use App\Models\PackageNotification;
use App\Mail\PackageAlertMatchedMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ShipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $shipments = $user->shipments()
            ->with('category:id,name')
            ->latest()
            ->get()
            ->map(function (Shipment $shipment) {
                $isConfirmed = $shipment->deal_status === 'confirmed'
                    || $shipment->status === 'deal_made'
                    || \App\Models\DealConfirmation::where('shipment_id', $shipment->id)->where('status', 'deal_made')->exists();

                return [
                    'id' => $shipment->id,
                    'category_id' => $shipment->category_id,
                    'category_name' => $shipment->category?->name,
                    'receiver_name' => $shipment->receiver_name,
                    'receiver_phone' => $shipment->receiver_phone,
                    'from_city' => $shipment->from_city,
                    'to_city' => $shipment->to_city,
                    'weight' => (float) $shipment->weight,
                    'description' => $shipment->description,
                    'travel_date' => $shipment->travel_date
                        ? Carbon::parse($shipment->travel_date)->toDateString()
                        : null,
                    'is_urgent' => (bool) $shipment->is_urgent,
                    'status' => $shipment->status,
                    'approval_status' => $shipment->approval_status ?? 'pending',
                    'deal_status' => $isConfirmed ? 'confirmed' : ($shipment->deal_status ?? 'pending'),
                    'inquiry_count' => (int) ($shipment->inquiry_count ?? 0),
                    'is_paused_by_inquiries' => (bool) ($shipment->is_paused_by_inquiries ?? false),
                    'product_images' => collect($shipment->product_images ?? [])
                        ->map(fn (string $path) => (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:') || str_starts_with($path, '/assets')) ? $path : asset('storage/'.$path))
                        ->all(),
                ];
            })
            ->values();

        return response()->json([
            'shipments' => $shipments,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['nullable', 'exists:package_categories,id'],
            'receiver_name' => ['required', 'string', 'max:255'],
            'receiver_phone' => ['nullable', 'string', 'max:50'],
            'from_city' => ['required', 'string', 'max:255'],
            'to_city' => ['required', 'string', 'max:255'],
            'weight' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'travel_date' => ['required', 'date', 'after_or_equal:today'],
            'is_urgent' => ['nullable', 'boolean'],
            'cover_image' => ['nullable', 'string'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $imagePaths = collect($request->file('images', []))
            ->map(fn ($image) => $image->store('shipments', 'public'))
            ->values()
            ->all();

        if (empty($imagePaths) && !empty($request->input('cover_image'))) {
            $imagePaths = [$request->input('cover_image')];
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        $shipment = Shipment::create([
            'sender_id' => $user->id,
            'category_id' => $validated['category_id'] ?? null,
            'receiver_name' => $validated['receiver_name'],
            'receiver_phone' => $validated['receiver_phone'] ?? null,
            'from_city' => $validated['from_city'],
            'to_city' => $validated['to_city'],
            'weight' => $validated['weight'],
            'description' => $validated['description'] ?? null,
            'product_images' => $imagePaths,
            'travel_date' => $validated['travel_date'],
            'is_urgent' => $validated['is_urgent'] ?? false,
            'status' => 'pending',
            'approval_status' => 'pending',
        ]);

        $shipment->load('category:id,name');

        // Create Admin Notification alert for newly posted package
        \App\Models\AdminNotification::create([
            'shipment_id' => $shipment->id,
            'user_id' => $user->id,
            'type' => 'new_package',
            'title' => "New Package Posted: {$shipment->from_city} ➔ {$shipment->to_city}",
            'message' => "User {$user->name} posted a new package request ({$shipment->weight}kg) for {$shipment->receiver_name}.",
            'is_read' => false,
        ]);

        // Check matching package alerts and send email notifications
        $this->triggerPackageAlerts($shipment);

        return response()->json([
            'message' => 'Shipment created successfully.',
            'shipment' => [
                'id' => $shipment->id,
                'category_id' => $shipment->category_id,
                'category_name' => $shipment->category?->name,
                'receiver_name' => $shipment->receiver_name,
                'receiver_phone' => $shipment->receiver_phone,
                'from_city' => $shipment->from_city,
                'to_city' => $shipment->to_city,
                'weight' => (float) $shipment->weight,
                'description' => $shipment->description,
                'travel_date' => $shipment->travel_date
                    ? Carbon::parse($shipment->travel_date)->toDateString()
                    : null,
                'is_urgent' => (bool) $shipment->is_urgent,
                'status' => $shipment->status,
                'approval_status' => $shipment->approval_status,
                'deal_status' => $shipment->deal_status ?? 'pending',
                'product_images' => collect($shipment->product_images ?? [])
                    ->map(fn (string $path) => (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:') || str_starts_with($path, '/assets')) ? $path : asset('storage/'.$path))
                    ->all(),
            ],
        ], 201);
    }

    public function update(Request $request, Shipment $shipment): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($shipment->sender_id && $user && $shipment->sender_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $validated = $request->validate([
            'category_id' => ['nullable', 'exists:package_categories,id'],
            'receiver_name' => ['sometimes', 'required', 'string', 'max:255'],
            'receiver_phone' => ['nullable', 'string', 'max:50'],
            'from_city' => ['sometimes', 'required', 'string', 'max:255'],
            'to_city' => ['sometimes', 'required', 'string', 'max:255'],
            'weight' => ['sometimes', 'required', 'numeric', 'min:0.1', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'travel_date' => ['sometimes', 'required', 'date'],
            'is_urgent' => ['nullable', 'boolean'],
            'cover_image' => ['nullable', 'string'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $updateData = [];
        if (isset($validated['receiver_name'])) $updateData['receiver_name'] = $validated['receiver_name'];
        if (isset($validated['receiver_phone'])) $updateData['receiver_phone'] = $validated['receiver_phone'];
        if (isset($validated['from_city'])) $updateData['from_city'] = $validated['from_city'];
        if (isset($validated['to_city'])) $updateData['to_city'] = $validated['to_city'];
        if (isset($validated['weight'])) $updateData['weight'] = $validated['weight'];
        if (isset($validated['description'])) $updateData['description'] = $validated['description'];
        if (isset($validated['travel_date'])) $updateData['travel_date'] = $validated['travel_date'];
        if (isset($validated['is_urgent'])) $updateData['is_urgent'] = $validated['is_urgent'];
        if (isset($validated['category_id'])) $updateData['category_id'] = $validated['category_id'];

        if ($request->hasFile('images')) {
            $imagePaths = collect($request->file('images', []))
                ->map(fn ($image) => $image->store('shipments', 'public'))
                ->values()
                ->all();
            $updateData['product_images'] = $imagePaths;
        } elseif (!empty($request->input('cover_image'))) {
            $updateData['product_images'] = [$request->input('cover_image')];
        }

        $shipment->update($updateData);
        $shipment->load('category:id,name');

        return response()->json([
            'message' => 'Shipment updated successfully.',
            'shipment' => [
                'id' => $shipment->id,
                'category_id' => $shipment->category_id,
                'category_name' => $shipment->category?->name,
                'receiver_name' => $shipment->receiver_name,
                'receiver_phone' => $shipment->receiver_phone,
                'from_city' => $shipment->from_city,
                'to_city' => $shipment->to_city,
                'weight' => (float) $shipment->weight,
                'description' => $shipment->description,
                'travel_date' => $shipment->travel_date
                    ? Carbon::parse($shipment->travel_date)->toDateString()
                    : null,
                'is_urgent' => (bool) $shipment->is_urgent,
                'status' => $shipment->status,
                'product_images' => collect($shipment->product_images ?? [])
                    ->map(fn (string $path) => (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:') || str_starts_with($path, '/assets')) ? $path : asset('storage/'.$path))
                    ->all(),
            ],
        ]);
    }

    public function destroy(Request $request, Shipment $shipment): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($shipment->sender_id && $user && $shipment->sender_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $shipment->delete();

        return response()->json([
            'message' => 'Shipment deleted successfully.',
        ]);
    }

    protected function triggerPackageAlerts(Shipment $shipment): void
    {
        try {
            $fromCity = mb_strtolower(trim($shipment->from_city));
            $toCity = mb_strtolower(trim($shipment->to_city));
            $travelDate = $shipment->travel_date ? Carbon::parse($shipment->travel_date)->startOfDay() : null;

            // Query active package alerts from other users
            $alerts = PackageAlert::with('user')
                ->where('is_active', true)
                ->when($shipment->sender_id, fn ($q) => $q->where('user_id', '!=', $shipment->sender_id))
                ->get();

            foreach ($alerts as $alert) {
                $alertFrom = mb_strtolower(trim($alert->from_city));
                $alertTo = mb_strtolower(trim($alert->to_city));

                // Check city match (exact or partial / substring match)
                $fromMatch = ($alertFrom === $fromCity)
                    || str_contains($fromCity, $alertFrom)
                    || str_contains($alertFrom, $fromCity);

                $toMatch = ($alertTo === $toCity)
                    || str_contains($toCity, $alertTo)
                    || str_contains($alertTo, $toCity);

                if (!$fromMatch || !$toMatch) {
                    continue;
                }

                // Check date range if configured
                if ($travelDate) {
                    if ($alert->start_date && $travelDate->lt(Carbon::parse($alert->start_date)->startOfDay())) {
                        continue;
                    }
                    if ($alert->end_date && $travelDate->gt(Carbon::parse($alert->end_date)->endOfDay())) {
                        continue;
                    }
                }

                // Matched! Notify user
                $emailSent = false;
                $recipientUser = $alert->user;

                if ($recipientUser && $alert->email_notify && $recipientUser->email) {
                    try {
                        Mail::to($recipientUser->email)->send(new PackageAlertMatchedMail($shipment, $alert, $recipientUser));
                        $emailSent = true;
                    } catch (\Throwable $mailErr) {
                        Log::error('Package alert email send error: '.$mailErr->getMessage());
                    }
                }

                PackageNotification::create([
                    'user_id' => $alert->user_id,
                    'package_alert_id' => $alert->id,
                    'shipment_id' => $shipment->id,
                    'title' => "New Package Posted: {$shipment->from_city} ➔ {$shipment->to_city}",
                    'message' => "A package matching your route alert ({$alert->from_city} to {$alert->to_city}) has been posted for recipient {$shipment->receiver_name}.",
                    'email_sent' => $emailSent,
                    'is_read' => false,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('triggerPackageAlerts error: '.$e->getMessage());
        }
    }

    public function inquire(Request $request, Shipment $shipment): JsonResponse
    {
        $user = $request->user('sanctum');
        $ip = $request->ip();
        $contactType = $request->input('contact_type', 'whatsapp');

        // If the sender themselves clicks contact on their own package, ignore
        if ($user && $shipment->sender_id === $user->id) {
            return response()->json([
                'message' => 'Sender viewing own contact.',
                'inquiry_count' => (int) ($shipment->inquiry_count ?? 0),
                'is_paused' => (bool) ($shipment->is_paused_by_inquiries ?? false),
            ]);
        }

        // Check if an inquiry was already recorded for this user or IP in the last 24 hours
        $alreadyInquired = \App\Models\ShipmentInquiry::query()
            ->where('shipment_id', $shipment->id)
            ->where(function ($q) use ($user, $ip) {
                if ($user) {
                    $q->where('user_id', $user->id);
                } elseif ($ip) {
                    $q->where('ip_address', $ip);
                }
            })
            ->where('created_at', '>=', Carbon::now()->subHours(24))
            ->exists();

        if (! $alreadyInquired) {
            \App\Models\ShipmentInquiry::create([
                'shipment_id' => $shipment->id,
                'user_id' => $user?->id,
                'ip_address' => $ip,
                'contact_type' => $contactType,
            ]);

            $newCount = (int) ($shipment->inquiry_count ?? 0) + 1;
            $shouldPause = $newCount >= 5;

            $shipment->update([
                'inquiry_count' => $newCount,
                'is_paused_by_inquiries' => $shouldPause,
            ]);

            if ($shouldPause) {
                \App\Models\AdminNotification::create([
                    'shipment_id' => $shipment->id,
                    'user_id' => $shipment->sender_id,
                    'type' => 'inquiry_pause',
                    'title' => "Listing Paused (5 Inquiries): {$shipment->from_city} ➔ {$shipment->to_city}",
                    'message' => "Package #{$shipment->id} for {$shipment->receiver_name} received 5 traveler inquiries and was automatically paused on the website to prevent spam calls.",
                    'is_read' => false,
                ]);
            }
        }

        return response()->json([
            'message' => 'Inquiry recorded.',
            'inquiry_count' => (int) $shipment->inquiry_count,
            'is_paused' => (bool) $shipment->is_paused_by_inquiries,
        ]);
    }

    public function reactivate(Request $request, Shipment $shipment): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($shipment->sender_id && $user && $shipment->sender_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $shipment->update([
            'inquiry_count' => 0,
            'is_paused_by_inquiries' => false,
            'deal_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Shipment listing reactivated successfully on directory!',
            'shipment' => [
                'id' => $shipment->id,
                'inquiry_count' => 0,
                'is_paused_by_inquiries' => false,
                'deal_status' => 'pending',
            ],
        ]);
    }
}
