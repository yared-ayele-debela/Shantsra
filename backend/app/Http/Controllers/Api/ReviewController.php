<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DealConfirmation;
use App\Models\Review;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $reviewsSubmitted = Review::with(['shipment', 'reviewedUser:id,name,email'])
            ->where('reviewer_id', $user->id)
            ->latest()
            ->get();

        $reviewsReceived = Review::with(['shipment', 'reviewer:id,name,email'])
            ->where('reviewed_user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'submitted' => $reviewsSubmitted,
            'received' => $reviewsReceived,
        ]);
    }

    public function show(Shipment $shipment, Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $review = Review::where('shipment_id', $shipment->id)
            ->where('reviewer_id', $user->id)
            ->first();

        return response()->json([
            'review' => $review,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipment_id' => ['required', 'exists:shipments,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
            'reviewed_user_id' => ['nullable', 'exists:users,id'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $shipment = Shipment::findOrFail($validated['shipment_id']);

        // Determine reviewed user if not explicitly passed
        $reviewedUserId = $validated['reviewed_user_id'] ?? null;
        if (! $reviewedUserId) {
            $deal = DealConfirmation::where('shipment_id', $shipment->id)->first();
            if ($deal) {
                $reviewedUserId = ($deal->user_id === $user->id) ? $deal->partner_id : $deal->user_id;
            }
            if (! $reviewedUserId) {
                $reviewedUserId = ($shipment->sender_id === $user->id) ? null : $shipment->sender_id;
            }
        }

        // Default reviewed user to sender if reviewer is not sender, or leave null if self-review attempt
        if ($reviewedUserId === $user->id) {
            $reviewedUserId = null;
        }

        $review = Review::updateOrCreate(
            [
                'shipment_id' => $shipment->id,
                'reviewer_id' => $user->id,
            ],
            [
                'reviewed_user_id' => $reviewedUserId,
                'rating' => $validated['rating'],
                'comment' => $validated['notes'] ?? $validated['comment'] ?? null,
            ]
        );

        $review->load(['shipment', 'reviewer:id,name', 'reviewedUser:id,name']);

        return response()->json([
            'message' => 'Thank you! Your package deal review has been submitted.',
            'review' => $review,
        ], 201);
    }
}
