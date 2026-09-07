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
        $perPage = min(max($request->integer('per_page', 20), 1), 50);

        $paginator = Shipment::query()
            ->where('approval_status', 'approved')
            // ->where('status', 'pending')
            ->where(function ($q) {
                $q->where('deal_status', '!=', 'confirmed')
                  ->orWhereNull('deal_status');
            })
            ->whereDoesntHave('booking')
            ->where(function ($q) {
                $q->whereNull('travel_date')
                  ->orWhereDate('travel_date', '>=', Carbon::today());
            })
            ->where('is_paused_by_inquiries', false)
            ->when($request->filled('from_city'), fn ($query) => $query->where('from_city', $request->input('from_city')))
            ->when($request->filled('to_city'), fn ($query) => $query->where('to_city', $request->input('to_city')))
            ->when($request->boolean('is_urgent'), fn ($query) => $query->where('is_urgent', true))
            ->when($request->filled('category_id'), function ($query) use ($request) {
                $categoryIds = collect(explode(',', $request->input('category_id')))
                    ->map(fn (string $id) => trim($id))
                    ->filter()
                    ->values()
                    ->all();

                if (! empty($categoryIds)) {
                    $query->whereIn('category_id', $categoryIds);
                }
            })
            ->with([
                'sender' => fn ($query) => $query
                    ->select(['id', 'name', 'photo'])
                    ->withCount('reviewsReceived')
                    ->withAvg('reviewsReceived', 'rating'),
                'category:id,name',
            ])
            ->latest()
            ->paginate($perPage);

        $shipments = $paginator->getCollection()
            ->map(function (Shipment $shipment) {
                $images = collect($shipment->product_images ?? [])
                    ->map(fn (string $path) => (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:') || str_starts_with($path, '/assets')) ? $path : asset('storage/'.$path))
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
                    'status' => $shipment->status,
                    'deal_status' => $shipment->deal_status ?? 'pending',
                    'description' => $shipment->description
                        ? Str::limit($shipment->description, 280)
                        : null,
                    'travel_date' => $travelDate?->toDateString(),
                    'travel_date_label' => $travelDate?->format('M d, Y'),
                    'image_count' => count($images),
                    'cover_image' => $images[0] ?? null,
                    'posted_at' => $shipment->created_at?->toIso8601String(),
                    'sender_display' => $this->senderDisplayName($shipment->sender?->name),
                    'sender_photo' => $shipment->sender?->photo_url,
                    'sender_rating' => ($shipment->sender?->reviews_received_count ?? 0) > 0
                        ? round((float) $shipment->sender->reviews_received_avg_rating, 1)
                        : null,
                    'sender_review_count' => $shipment->sender?->reviews_received_count ?? 0,
                    'receiver_phone' => $shipment->receiver_phone,
                ];
            })
            ->values();

        $paginator->setCollection($shipments);

        return response()->json([
            'shipments' => $shipments,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    public function urgent(Request $request): JsonResponse
    {
        $limit = min(max($request->integer('limit', 10), 1), 20);

        $shipments = Shipment::query()
            ->where('approval_status', 'approved')
            // ->where('status', 'pending')
            ->where('is_urgent', true)
            ->where(function ($q) {
                $q->where('deal_status', '!=', 'confirmed')
                  ->orWhereNull('deal_status');
            })
            ->whereDoesntHave('booking')
            ->where(function ($q) {
                $q->whereNull('travel_date')
                  ->orWhereDate('travel_date', '>=', Carbon::today());
            })
            ->where('is_paused_by_inquiries', false)
            ->when($request->filled('category_id'), function ($query) use ($request) {
                $categoryIds = collect(explode(',', $request->input('category_id')))
                    ->map(fn (string $id) => trim($id))
                    ->filter()
                    ->values()
                    ->all();

                if (! empty($categoryIds)) {
                    $query->whereIn('category_id', $categoryIds);
                }
            })
            ->with([
                'sender' => fn ($query) => $query
                    ->select(['id', 'name', 'photo'])
                    ->withCount('reviewsReceived')
                    ->withAvg('reviewsReceived', 'rating'),
                'category:id,name',
            ])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function (Shipment $shipment) {
                $images = collect($shipment->product_images ?? [])
                    ->map(fn (string $path) => (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:') || str_starts_with($path, '/assets')) ? $path : asset('storage/'.$path))
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
                    'sender_photo' => $shipment->sender?->photo_url,
                    'sender_rating' => ($shipment->sender?->reviews_received_count ?? 0) > 0
                        ? round((float) $shipment->sender->reviews_received_avg_rating, 1)
                        : null,
                    'sender_review_count' => $shipment->sender?->reviews_received_count ?? 0,
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
