<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

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
                    'product_images' => collect($shipment->product_images ?? [])
                        ->map(fn (string $path) => asset('storage/'.$path))
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
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $imagePaths = collect($request->file('images', []))
            ->map(fn ($image) => $image->store('shipments', 'public'))
            ->values()
            ->all();

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
        ]);

        $shipment->load('category:id,name');

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
                'product_images' => collect($shipment->product_images ?? [])
                    ->map(fn (string $path) => asset('storage/'.$path))
                    ->all(),
            ],
        ], 201);
    }
}
