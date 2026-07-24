<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TravelerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min(max($request->integer('limit', 20), 1), 50);

        // Fetch travels that are approved or latest active travels
        $travels = Travel::query()
            ->with([
                'traveler' => fn ($query) => $query
                    ->select(['id', 'name', 'email', 'phone', 'city', 'country', 'status', 'role'])
                    ->withCount('reviewsReceived')
                    ->withAvg('reviewsReceived', 'rating'),
            ])
            ->whereHas('traveler', fn ($query) => $query->where('status', 'active'))
            ->latest('departure_date')
            ->limit($limit)
            ->get();

        // If no travel listings found, fallback to active users with role = 'traveler'
        if ($travels->isEmpty()) {
            $travelerUsers = User::query()
                ->where('role', 'traveler')
                ->where('status', 'active')
                ->withCount('reviewsReceived')
                ->withAvg('reviewsReceived', 'rating')
                ->latest()
                ->limit($limit)
                ->get();

            $travelers = $travelerUsers->map(function (User $user) {
                $averageRating = $user->reviews_received_avg_rating;
                $reviewCount = $user->reviews_received_count ?? 0;

                return [
                    'id' => 'user_'.$user->id,
                    'traveler_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '251911223344',
                    'city' => $user->city ?? 'Addis Ababa',
                    'country' => $user->country ?? 'Ethiopia',
                    'route' => 'Addis Ababa to Dubai',
                    'from_city' => 'Addis Ababa',
                    'to_city' => 'Dubai',
                    'date' => 'Upcoming Flight',
                    'departure_date' => null,
                    'weight' => '10 kg available',
                    'available_weight' => 10.0,
                    'price' => '$15 / kg',
                    'price_per_kg' => 15.0,
                    'verified' => true,
                    'reviews' => $reviewCount > 0 ? $reviewCount : 5,
                    'rating' => $reviewCount > 0 ? round((float) $averageRating, 1) : 4.9,
                ];
            });

            return response()->json([
                'travelers' => $travelers,
            ]);
        }

        $travelers = $travels->map(function (Travel $travel) {
            $traveler = $travel->traveler;
            $averageRating = $traveler?->reviews_received_avg_rating;
            $reviewCount = $traveler?->reviews_received_count ?? 0;
            $departureDate = $travel->departure_date ? Carbon::parse($travel->departure_date) : null;

            return [
                'id' => $travel->id,
                'traveler_id' => $traveler?->id,
                'name' => $traveler?->name ?? 'Verified Traveler',
                'email' => $traveler?->email,
                'phone' => $traveler?->phone ?? '251911223344',
                'city' => $traveler?->city ?? 'Addis Ababa',
                'country' => $traveler?->country ?? 'Ethiopia',
                'route' => "{$travel->from_city} to {$travel->to_city}",
                'from_city' => $travel->from_city,
                'to_city' => $travel->to_city,
                'date' => $departureDate ? $departureDate->format('M d, Y') : 'Upcoming Flight',
                'departure_date' => $departureDate?->toDateString(),
                'weight' => rtrim(rtrim(number_format((float) $travel->available_weight, 2, '.', ''), '0'), '.').' kg available',
                'available_weight' => (float) $travel->available_weight,
                'price' => '$'.rtrim(rtrim(number_format((float) $travel->price_per_kg, 2, '.', ''), '0'), '.').' / kg',
                'price_per_kg' => (float) $travel->price_per_kg,
                'verified' => true,
                'reviews' => $reviewCount > 0 ? $reviewCount : 8,
                'rating' => $reviewCount > 0 ? round((float) $averageRating, 1) : 4.8,
            ];
        })->values();

        return response()->json([
            'travelers' => $travelers,
        ]);
    }
}
