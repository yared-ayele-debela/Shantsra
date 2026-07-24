<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Shipment;
use App\Models\SubscriptionPlan;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\View\View;

class AdminDashboardController extends Controller
{
    public function index(): View
    {
        $stats = [
            'users' => User::count(),
            'shipments' => Shipment::count(),
            'travels' => Travel::count(),
            'bookings' => Booking::count(),
            'subscription_plans' => SubscriptionPlan::count(),
        ];

        $recentShipments = Shipment::with('sender')->latest()->take(5)->get();
        $recentBookings = Booking::with(['sender', 'traveler', 'shipment'])->latest()->take(5)->get();

        $shipmentStatusCounts = Shipment::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $travelStatusCounts = Travel::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $bookingStatusCounts = Booking::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $dates = collect(range(6, 0))->map(
            fn (int $days) => Carbon::today()->subDays($days)
        )->push(Carbon::today());

        $dateLabels = $dates->map(fn (Carbon $date) => $date->format('M d'));
        $shipmentTrend = $dates->map(fn (Carbon $date) => Shipment::whereDate('created_at', $date)->count());
        $bookingTrend = $dates->map(fn (Carbon $date) => Booking::whereDate('created_at', $date)->count());
        $travelTrend = $dates->map(fn (Carbon $date) => Travel::whereDate('created_at', $date)->count());

        $chartData = [
            'shipmentStatusLabels' => ['Pending', 'Accepted', 'In Transit', 'Delivered'],
            'shipmentStatusValues' => [
                $shipmentStatusCounts['pending'] ?? 0,
                $shipmentStatusCounts['accepted'] ?? 0,
                $shipmentStatusCounts['in_transit'] ?? 0,
                $shipmentStatusCounts['delivered'] ?? 0,
            ],
            'travelStatusLabels' => ['Pending', 'Approved', 'Rejected'],
            'travelStatusValues' => [
                $travelStatusCounts['pending'] ?? 0,
                $travelStatusCounts['approved'] ?? 0,
                $travelStatusCounts['rejected'] ?? 0,
            ],
            'bookingStatusLabels' => ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
            'bookingStatusValues' => [
                $bookingStatusCounts['pending'] ?? 0,
                $bookingStatusCounts['confirmed'] ?? 0,
                $bookingStatusCounts['cancelled'] ?? 0,
                $bookingStatusCounts['completed'] ?? 0,
            ],
            'activityLabels' => $dateLabels->values(),
            'shipmentTrend' => $shipmentTrend->values(),
            'bookingTrend' => $bookingTrend->values(),
            'travelTrend' => $travelTrend->values(),
        ];

        return view('admin.dashboard.index', compact('stats', 'recentShipments', 'recentBookings', 'chartData'));
    }
}
