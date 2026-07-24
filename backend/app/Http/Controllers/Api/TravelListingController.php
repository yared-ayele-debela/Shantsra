<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Travel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TravelListingController extends Controller
{
    public function mine(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $travels = Travel::query()
            ->where('traveler_id', $user->id)
            ->orderByDesc('departure_date')
            ->get()
            ->map(fn (Travel $travel) => $this->serializeTravel($travel));

        return response()->json([
            'travels' => $travels,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_city' => ['required', 'string', 'max:255'],
            'to_city' => ['required', 'string', 'max:255'],
            'departure_date' => ['required', 'date', 'after_or_equal:today'],
            'available_weight' => ['required', 'numeric', 'min:0.1', 'max:500'],
            'price_per_kg' => ['required', 'numeric', 'min:0', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Only active accounts can post a trip.',
            ], 422);
        }

        $travel = Travel::create([
            'traveler_id' => $user->id,
            'from_city' => $validated['from_city'],
            'to_city' => $validated['to_city'],
            'departure_date' => $validated['departure_date'],
            'available_weight' => $validated['available_weight'],
            'price_per_kg' => $validated['price_per_kg'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Trip listing submitted for review.',
            'travel' => $this->serializeTravel($travel),
        ], 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTravel(Travel $travel): array
    {
        $departure = Carbon::parse($travel->departure_date);

        return [
            'id' => $travel->id,
            'from_city' => $travel->from_city,
            'to_city' => $travel->to_city,
            'departure_date' => $departure->toDateString(),
            'available_weight' => (float) $travel->available_weight,
            'price_per_kg' => (float) $travel->price_per_kg,
            'notes' => $travel->notes,
            'status' => $travel->status,
        ];
    }
}
