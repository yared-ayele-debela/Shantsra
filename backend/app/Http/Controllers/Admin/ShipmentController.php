<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PackageCategory;
use App\Models\Shipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ShipmentController extends Controller
{
    public function index(Request $request): View
    {
        $query = Shipment::with(['sender', 'category']);

        // 1. Keyword search (sender name/email, receiver name/phone, cities, description)
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('receiver_name', 'like', "%{$search}%")
                  ->orWhere('receiver_phone', 'like', "%{$search}%")
                  ->orWhere('from_city', 'like', "%{$search}%")
                  ->orWhere('to_city', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('sender', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Admin Approval status filter (pending, approved, rejected)
        if ($request->filled('approval_status') && $request->input('approval_status') !== 'all') {
            $query->where('approval_status', $request->input('approval_status'));
        }

        // 3. Deal Status filter (pending, confirmed, declined)
        if ($request->filled('deal_status') && $request->input('deal_status') !== 'all') {
            $query->where('deal_status', $request->input('deal_status'));
        }

        // 4. Delivery status filter (pending, accepted, in_transit, delivered)
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // 5. Category filter
        if ($request->filled('category_id') && $request->input('category_id') !== 'all') {
            $query->where('category_id', $request->input('category_id'));
        }

        // 6. Urgency filter
        if ($request->has('is_urgent') && $request->input('is_urgent') !== '' && $request->input('is_urgent') !== 'all') {
            $query->where('is_urgent', (bool) $request->input('is_urgent'));
        }

        // 7. From City filter
        if ($request->filled('from_city')) {
            $query->where('from_city', 'like', '%' . trim($request->input('from_city')) . '%');
        }

        // 8. To City filter
        if ($request->filled('to_city')) {
            $query->where('to_city', 'like', '%' . trim($request->input('to_city')) . '%');
        }

        // 9. Weight Range filter
        if ($request->filled('min_weight')) {
            $query->where('weight', '>=', (float) $request->input('min_weight'));
        }
        if ($request->filled('max_weight')) {
            $query->where('weight', '<=', (float) $request->input('max_weight'));
        }

        // 10. Date Range filter (travel_date)
        if ($request->filled('start_date')) {
            $query->where('travel_date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->where('travel_date', '<=', $request->input('end_date'));
        }

        // 11. Sorting
        $sortBy = $request->input('sort_by', 'latest');
        match ($sortBy) {
            'oldest' => $query->oldest(),
            'weight_desc' => $query->orderBy('weight', 'desc'),
            'weight_asc' => $query->orderBy('weight', 'asc'),
            'travel_date_asc' => $query->orderBy('travel_date', 'asc'),
            'travel_date_desc' => $query->orderBy('travel_date', 'desc'),
            default => $query->latest(),
        };

        $shipments = $query->paginate(12)->withQueryString();

        // Metrics for summary cards
        $pendingApprovalCount = Shipment::where('approval_status', 'pending')->count();
        $approvedCount = Shipment::where('approval_status', 'approved')->count();
        $rejectedCount = Shipment::where('approval_status', 'rejected')->count();
        $deliveredCount = Shipment::where('status', 'delivered')->count();
        $dealsConfirmedCount = Shipment::where('deal_status', 'confirmed')->count();
        $dealsDeclinedCount = Shipment::where('deal_status', 'declined')->count();

        $categories = PackageCategory::where('is_active', true)->get();

        return view('admin.shipments.index', compact(
            'shipments',
            'pendingApprovalCount',
            'approvedCount',
            'rejectedCount',
            'deliveredCount',
            'dealsConfirmedCount',
            'dealsDeclinedCount',
            'categories'
        ));
    }

    public function show(Shipment $shipment): View
    {
        $shipment->load(['sender', 'category', 'booking.travel', 'booking.traveler']);

        return view('admin.shipments.show', compact('shipment'));
    }

    public function edit(Shipment $shipment): View
    {
        $shipment->load(['sender', 'category']);
        $categories = PackageCategory::where('is_active', true)->get();

        return view('admin.shipments.edit', compact('shipment', 'categories'));
    }

    public function update(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'receiver_name' => ['required', 'string', 'max:255'],
            'receiver_phone' => ['nullable', 'string', 'max:50'],
            'from_city' => ['required', 'string', 'max:255'],
            'to_city' => ['required', 'string', 'max:255'],
            'weight' => ['required', 'numeric', 'min:0.1', 'max:1000'],
            'category_id' => ['nullable', 'exists:package_categories,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'travel_date' => ['nullable', 'date'],
            'is_urgent' => ['nullable', 'boolean'],
            'status' => ['required', 'in:pending,accepted,in_transit,delivered'],
            'approval_status' => ['nullable', 'in:pending,approved,rejected'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $updateData = [
            'receiver_name' => $validated['receiver_name'],
            'receiver_phone' => $validated['receiver_phone'] ?? null,
            'from_city' => $validated['from_city'],
            'to_city' => $validated['to_city'],
            'weight' => $validated['weight'],
            'category_id' => $validated['category_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'travel_date' => $validated['travel_date'] ?? null,
            'is_urgent' => $request->has('is_urgent') ? (bool) $request->input('is_urgent') : false,
            'status' => $validated['status'],
            'approval_status' => $validated['approval_status'] ?? $shipment->approval_status ?? 'pending',
        ];

        if ($request->hasFile('images')) {
            $newPaths = collect($request->file('images'))
                ->map(fn ($image) => $image->store('shipments', 'public'))
                ->all();

            $existing = $shipment->product_images ?? [];
            $updateData['product_images'] = array_merge($existing, $newPaths);
        }

        $shipment->update($updateData);

        return redirect()->route('admin.shipments.show', $shipment)->with('success', 'Shipment updated successfully.');
    }

    public function updateStatus(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,accepted,in_transit,delivered'],
        ]);

        $shipment->update($validated);

        return back()->with('success', 'Shipment status updated successfully.');
    }

    public function approve(Shipment $shipment): RedirectResponse
    {
        $shipment->update(['approval_status' => 'approved']);

        return back()->with('success', "Shipment #{$shipment->id} ({$shipment->from_city} ➔ {$shipment->to_city}) has been APPROVED!");
    }

    public function reject(Shipment $shipment): RedirectResponse
    {
        $shipment->update(['approval_status' => 'rejected']);

        return back()->with('success', "Shipment #{$shipment->id} ({$shipment->from_city} ➔ {$shipment->to_city}) has been REJECTED.");
    }

    public function destroy(Shipment $shipment): RedirectResponse
    {
        $shipment->delete();

        return redirect()->route('admin.shipments.index')->with('success', 'Shipment deleted successfully.');
    }
}
