<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Travel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TravelController extends Controller
{
    public function index(): View
    {
        $travels = Travel::with('traveler')->latest()->paginate(10);

        $pageItems = $travels->getCollection();
        $pendingCount = $pageItems->where('status', 'pending')->count();
        $approvedCount = $pageItems->where('status', 'approved')->count();
        $upcomingCount = $pageItems->filter(
            fn (Travel $travel) => $travel->departure_date && $travel->departure_date->isFuture()
        )->count();

        return view('admin.travels.index', compact(
            'travels',
            'pendingCount',
            'approvedCount',
            'upcomingCount',
        ));
    }

    public function show(Travel $travel): View
    {
        $travel->load(['traveler', 'bookings.sender']);

        return view('admin.travels.show', compact('travel'));
    }

    public function updateStatus(Request $request, Travel $travel): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $travel->update($validated);

        return back()->with('success', 'Travel listing updated successfully.');
    }
}
