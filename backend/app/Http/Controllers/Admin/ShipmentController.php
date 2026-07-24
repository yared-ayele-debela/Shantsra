<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ShipmentController extends Controller
{
    public function index(): View
    {
        $shipments = Shipment::with('sender')->latest()->paginate(10);
        $pageItems = $shipments->getCollection();
        $activeCount = $pageItems->whereIn('status', ['accepted', 'in_transit'])->count();
        $pendingCount = $pageItems->where('status', 'pending')->count();
        $acceptedCount = $pageItems->where('status', 'accepted')->count();
        $inTransitCount = $pageItems->where('status', 'in_transit')->count();
        $deliveredCount = $pageItems->where('status', 'delivered')->count();

        return view('admin.shipments.index', compact(
            'shipments',
            'pendingCount',
            'activeCount',
            'acceptedCount',
            'inTransitCount',
            'deliveredCount',
        ));
    }

    public function show(Shipment $shipment): View
    {
        $shipment->load(['sender', 'booking.travel', 'booking.traveler']);

        return view('admin.shipments.show', compact('shipment'));
    }

    public function updateStatus(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,accepted,in_transit,delivered'],
        ]);

        $shipment->update($validated);

        return back()->with('success', 'Shipment status updated successfully.');
    }

    public function destroy(Shipment $shipment): RedirectResponse
    {
        $shipment->delete();

        return redirect()->route('admin.shipments.index')->with('success', 'Shipment deleted successfully.');
    }
}
