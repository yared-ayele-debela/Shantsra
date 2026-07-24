@php($pageHeading = 'Travel Management')
@php($title = 'Travels')
@php($pageEyebrow = 'Route Listings')
@php($pageSubtitle = 'Inspect traveler availability, review route details, and moderate listing approvals.')

@extends('layouts.admin')

@section('content')
<div class="page-summary-grid">
    <div class="summary-tile">
        <div class="summary-tile-label">Total Listings</div>
        <div class="summary-tile-value">{{ $travels->total() }}</div>
        <p class="summary-tile-note">Traveler routes currently visible in the moderation queue.</p>
    </div>
    <div class="summary-tile">
        <div class="summary-tile-label">Pending Review</div>
        <div class="summary-tile-value">{{ $pendingCount }}</div>
        <p class="summary-tile-note">Listings waiting for an approval decision on this page.</p>
    </div>
    <div class="summary-tile">
        <div class="summary-tile-label">Upcoming Departures</div>
        <div class="summary-tile-value">{{ $upcomingCount }}</div>
        <p class="summary-tile-note">{{ $approvedCount }} approved listings are ready for matching.</p>
    </div>
</div>

<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1">Traveler Listings</h5>
                <p>Review departure schedules, capacity, and pricing with a layout optimized for desktop and mobile.</p>
            </div>
        </div>

        <div class="d-none d-md-block">
            <div class="table-responsive">
                <table class="table admin-table listing-table align-middle">
                    <thead>
                    <tr>
                        <th>Traveler</th>
                        <th>Route</th>
                        <th>Departure</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th class="text-end">Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($travels as $travel)
                        <tr>
                            <td>
                                <div class="table-person">
                                    <div class="table-person-avatar">
                                        {{ strtoupper(substr($travel->traveler?->name ?? 'T', 0, 1)) }}
                                    </div>
                                    <div>
                                        <div class="table-person-name">{{ $travel->traveler?->name ?? 'Unknown traveler' }}</div>
                                        <div class="table-person-meta">{{ $travel->traveler?->email ?? 'No email available' }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="route-pill">
                                    <i class="bi bi-airplane"></i>
                                    <span>{{ $travel->from_city }} to {{ $travel->to_city }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="listing-kicker">Scheduled</div>
                                <div class="listing-metric">{{ $travel->departure_date?->format('M d, Y') ?? 'Not scheduled' }}</div>
                                <div class="table-muted">{{ $travel->departure_date?->format('l') ?? 'Date pending' }}</div>
                            </td>
                            <td>
                                <div class="listing-kicker">Available Weight</div>
                                <div class="listing-metric">{{ number_format($travel->available_weight, 2) }} kg</div>
                                <div class="table-muted">${{ number_format($travel->price_per_kg, 2) }} per kg</div>
                            </td>
                            <td>
                                <span class="status-badge {{ $travel->status === 'approved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis' }}">
                                    {{ str($travel->status)->headline() }}
                                </span>
                            </td>
                            <td class="text-end">
                                <a href="{{ route('admin.travels.show', $travel) }}" class="btn btn-sm btn-outline-primary px-3">View Listing</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="py-5 text-center text-muted">No travels available.</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="d-md-none">
            @forelse($travels as $travel)
                <div class="listing-mobile-card p-3">
                    <div class="listing-mobile-header mb-3">
                        <div>
                            <div class="table-person-name mb-1">{{ $travel->traveler?->name ?? 'Unknown traveler' }}</div>
                            <p class="listing-mobile-subtitle">{{ $travel->traveler?->email ?? 'No email available' }}</p>
                        </div>
                        <span class="status-badge {{ $statusClasses[$travel->status] ?? 'bg-secondary-subtle text-secondary-emphasis' }}">
                            {{ str($travel->status)->headline() }}
                        </span>
                    </div>

                    <div class="route-pill mb-3">
                        <i class="bi bi-airplane"></i>
                        <span>{{ $travel->from_city }} to {{ $travel->to_city }}</span>
                    </div>

                    <div class="listing-mobile-grid mb-3">
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Departure</div>
                            <div class="listing-mobile-value">{{ $travel->departure_date?->format('M d, Y') ?? 'Not scheduled' }}</div>
                        </div>
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Available Weight</div>
                            <div class="listing-mobile-value">{{ number_format($travel->available_weight, 2) }} kg</div>
                        </div>
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Price</div>
                            <div class="listing-mobile-value">${{ number_format($travel->price_per_kg, 2) }} per kg</div>
                        </div>
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Notes</div>
                            <div class="listing-mobile-value">{{ $travel->notes ? \Illuminate\Support\Str::limit($travel->notes, 70) : 'No notes added' }}</div>
                        </div>
                    </div>

                    <div class="listing-mobile-actions">
                        <div class="table-muted">Updated {{ $travel->updated_at?->diffForHumans() ?? 'recently' }}</div>
                        <a href="{{ route('admin.travels.show', $travel) }}" class="btn btn-outline-primary w-100">View Listing</a>
                    </div>
                </div>
            @empty
                <div class="listing-mobile-card p-4 text-center text-muted">
                    No travels available.
                </div>
            @endforelse
        </div>

        <div class="mt-4">
            {{ $travels->links() }}
        </div>
    </div>
</div>
@endsection
