<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class OpenShipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min(max($request->integer('limit', 20), 1), 50);

        $shipments = Shipment::query()
            ->where('status', 'pending')
            ->whereDoesntHave('booking')
            ->with(['sender:id,name', 'category:id,name'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function (Shipment $shipment) {
                $images = collect($shipment->product_images ?? [])
                    ->map(fn (string $path) => asset('storage/'.$path))
                    ->values()
                    ->all();
                $travelDate = $shipment->travel_date ? Carbon::parse($shipment->travel_date) : null;

                return [
                    'id' => $shipment->id,
                    'category_id' => $shipment->category_id,
                    'category_name' => $shipment->category?->name,
                    'from_city' => $shipment->from_city,
                    'to_city' => $shipment->to_city,
                    'weight' => (float) $shipment->weight,
                    'is_urgent' => (bool) $shipment->is_urgent,
                    'description' => $shipment->description
                        ? Str::limit($shipment->description, 280)
                        : null,
                    'travel_date' => $travelDate?->toDateString(),
                    'travel_date_label' => $travelDate?->format('M d, Y'),
                    'image_count' => count($images),
                    'cover_image' => $images[0] ?? null,
                    'posted_at' => $shipment->created_at?->toIso8601String(),
                    'sender_display' => $this->senderDisplayName($shipment->sender?->name),
                ];
            })
            ->values();

        return response()->json([
            'shipments' => $shipments,
        ]);
    }

    public function urgent(Request $request): JsonResponse
    {
        $limit = min(max($request->integer('limit', 10), 1), 20);

        $shipments = Shipment::query()
            ->where('status', 'pending')
            ->where('is_urgent', true)
            ->whereDoesntHave('booking')
            ->with(['sender:id,name', 'category:id,name'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function (Shipment $shipment) {
                $images = collect($shipment->product_images ?? [])
                    ->map(fn (string $path) => asset('storage/'.$path))
                    ->values()
                    ->all();
                $travelDate = $shipment->travel_date ? Carbon::parse($shipment->travel_date) : null;

                return [
                    'id' => $shipment->id,
                    'category_id' => $shipment->category_id,
                    'category_name' => $shipment->category?->name,
                    'receiver_name' => $shipment->receiver_name,
                    'from_city' => $shipment->from_city,
                    'to_city' => $shipment->to_city,
                    'weight' => (float) $shipment->weight,
                    'is_urgent' => (bool) $shipment->is_urgent,
                    'description' => $shipment->description
                        ? Str::limit($shipment->description, 280)
                        : null,
                    'travel_date' => $travelDate?->toDateString(),
                    'travel_date_label' => $travelDate?->format('M d, Y'),
                    'image_count' => count($images),
                    'cover_image' => $images[0] ?? null,
                    'posted_at' => $shipment->created_at?->toIso8601String(),
                    'sender_display' => $this->senderDisplayName($shipment->sender?->name),
                ];
            })
            ->values();

        return response()->json([
            'shipments' => $shipments,
        ]);
    }

    private function senderDisplayName(?string $fullName): string
    {
        if (! $fullName) {
            return 'Member';
        }

        $parts = preg_split('/\s+/', trim($fullName)) ?: [];

        return $parts[0] ?? 'Member';
    }
}
