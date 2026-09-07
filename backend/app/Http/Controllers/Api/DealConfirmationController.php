<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DealConfirmation;
use App\Models\Shipment;
use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealConfirmationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $deals = DealConfirmation::with(['shipment', 'partner:id,name,phone', 'travel'])
            ->where('user_id', $user->id)
            ->orWhere('partner_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'deals' => $deals,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipment_id' => ['required', 'exists:shipments,id'],
            'partner_id' => ['nullable', 'exists:users,id'],
            'travel_id' => ['nullable', 'exists:travel,id'],
            'agreed_price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:deal_made,no_deal,pending'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        $shipment = Shipment::findOrFail($validated['shipment_id']);

        $deal = DealConfirmation::updateOrCreate(
            [
                'shipment_id' => $shipment->id,
                'user_id' => $user->id,
            ],
            [
                'partner_id' => $validated['partner_id'] ?? null,
                'travel_id' => $validated['travel_id'] ?? null,
                'agreed_price' => $validated['agreed_price'] ?? null,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        if ($validated['status'] === 'deal_made') {
            $shipment->update(['deal_status' => 'confirmed']);

            // Notify Admin of successful deal made between members
            AdminNotification::create([
                'shipment_id' => $shipment->id,
                'user_id' => $user->id,
                'type' => 'deal_confirmed',
                'title' => "Deal Confirmed: {$shipment->from_city} ➔ {$shipment->to_city}",
                'message' => "User {$user->name} confirmed a successful deal for package '{$shipment->receiver_name}' (" . ($validated['agreed_price'] ? "\${$validated['agreed_price']}" : "Agreed") . ").",
                'is_read' => false,
            ]);
        } elseif ($validated['status'] === 'no_deal') {
            $shipment->update([
                'deal_status' => 'pending',
                'is_paused_by_inquiries' => false,
                'inquiry_count' => 0,
            ]);
        }

        $deal->load(['shipment', 'partner:id,name,phone', 'travel']);

        return response()->json([
            'message' => $validated['status'] === 'deal_made' ? 'Deal confirmed successfully!' : 'Status updated.',
            'deal' => $deal,
        ], 201);
    }
}
