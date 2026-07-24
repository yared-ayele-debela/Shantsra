@php($pageHeading = 'Shipment Management')
@php($title = 'Shipments')
@php($pageEyebrow = 'Delivery Operations')
@php($pageSubtitle = 'Review sender shipment requests, inspect route details, and manage fulfillment progress.')
@extends('layouts.admin')

@section('content')
<div class="page-summary-grid">
    <div class="summary-tile">
        <div class="summary-tile-label">Package Requests</div>
        <div class="summary-tile-value">{{ $shipments->total() }}</div>
        <p class="summary-tile-note">Active shipment records currently visible in this review page.</p>
    </div>
    <div class="summary-tile">
        <div class="summary-tile-label">Needs Review</div>
        <div class="summary-tile-value">{{ $pendingCount }}</div>
        <p class="summary-tile-note">{{ $activeCount }} packages are already moving through fulfillment.</p>
    </div>
    <div class="summary-tile">
        <div class="summary-tile-label">Delivered</div>
        <div class="summary-tile-value">{{ $deliveredCount }}</div>
        <p class="summary-tile-note">Completed deliveries captured in the current pagination set.</p>
    </div>
</div>

<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1">Package Listings</h5>
                <p>Track sender, receiver, route, and delivery status with a cleaner responsive layout.</p>
            </div>
        </div>

        <div class="d-none d-md-block">
            <div class="table-responsive">
                <table class="table admin-table listing-table align-middle">
                    <thead>
                    <tr>
                        <th>Sender</th>
                        <th>Route</th>
                        <th>Receiver</th>
                        <th>Package</th>
                        <th>Status</th>
                        <th class="text-end">Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($shipments as $shipment)
                        <tr>
                            <td>
                                <div class="table-person">
                                    <div class="table-person-avatar">
                                        {{ strtoupper(substr($shipment->sender?->name ?? 'S', 0, 1)) }}
                                    </div>
                                    <div>
                                        <div class="table-person-name">{{ $shipment->sender?->name ?? 'Unknown sender' }}</div>
                                        <div class="table-person-meta">{{ $shipment->sender?->email ?? 'No email available' }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="route-pill">
                                    <i class="bi bi-box-seam"></i>
                                    <span>{{ $shipment->from_city }} to {{ $shipment->to_city }}</span>
                                </div>
                                <div class="table-muted mt-2">
                                    Preferred {{ $shipment->travel_date?->format('M d, Y') ?? 'date not set' }}
                                </div>
                            </td>
                            <td>
                                <div class="listing-kicker">Receiver</div>
                                <div class="listing-metric">{{ $shipment->receiver_name ?: 'Not provided' }}</div>
                                <div class="table-muted">{{ $shipment->receiver_phone ?: 'No phone available' }}</div>
                            </td>
                            <td>
                                <div class="listing-kicker">Weight</div>
                                <div class="listing-metric">{{ number_format($shipment->weight, 2) }} kg</div>
                                <div class="table-muted">{{ count($shipment->product_images ?? []) }} image(s)</div>
                            </td>
                            <td>
                                <div class="d-flex flex-column gap-2 align-items-start">
                                    <span class="status-badge {{ $shipment->status === 'accepted' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-emphasis' }}">
                                        {{ $shipment->status === 'accepted' ? 'Accepted' : 'In Transit' }}
                                    </span>
                                    <span class="status-badge {{ $shipment->is_urgent ? 'bg-danger-subtle text-danger-emphasis' : 'bg-secondary-subtle text-secondary-emphasis' }}">
                                        {{ $shipment->is_urgent ? 'Urgent' : 'Standard' }}
                                    </span>
                                </div>
                            </td>
                            <td class="text-end">
                                <a href="{{ route('admin.shipments.show', $shipment) }}" class="btn btn-sm btn-outline-primary px-3">View Shipment</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="py-5 text-center text-muted">No shipments available.</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="d-md-none">
            @forelse($shipments as $shipment)
                <div class="listing-mobile-card p-3">
                    <div class="listing-mobile-header mb-3">
                        <div>
                            <div class="table-person-name mb-1">{{ $shipment->sender?->name ?? 'Unknown sender' }}</div>
                            <p class="listing-mobile-subtitle">Receiver: {{ $shipment->receiver_name ?: 'Not provided' }}</p>
                        </div>
                        <div class="d-flex flex-column gap-2 align-items-end">
                            <span class="status-badge {{ $shipment->status === 'accepted' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-emphasis' }}">
                                {{ str($shipment->status)->headline() }}
                            </span>
                            <span class="status-badge {{ $shipment->is_urgent ? 'bg-danger-subtle text-danger-emphasis' : 'bg-secondary-subtle text-secondary-emphasis' }}">
                                {{ $shipment->is_urgent ? 'Urgent' : 'Standard' }}
                            </span>
                        </div>
                    </div>

                    <div class="route-pill mb-3">
                        <i class="bi bi-box-seam"></i>
                        <span>{{ $shipment->from_city }} to {{ $shipment->to_city }}</span>
                    </div>

                    <div class="listing-mobile-grid mb-3">
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Preferred Date</div>
                            <div class="listing-mobile-value">{{ $shipment->travel_date?->format('M d, Y') ?? 'Not specified' }}</div>
                        </div>
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Weight</div>
                            <div class="listing-mobile-value">{{ number_format($shipment->weight, 2) }} kg</div>
                        </div>
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Receiver Phone</div>
                            <div class="listing-mobile-value">{{ $shipment->receiver_phone ?: 'No phone available' }}</div>
                        </div>
                        <div class="listing-mobile-item">
                            <div class="listing-mobile-label">Description</div>
                            <div class="listing-mobile-value">{{ $shipment->description ? \Illuminate\Support\Str::limit($shipment->description, 70) : 'No package description' }}</div>
                        </div>
                    </div>

                    <div class="listing-mobile-actions">
                        <div class="table-muted">{{ count($shipment->product_images ?? []) }} image(s) attached</div>
                        <a href="{{ route('admin.shipments.show', $shipment) }}" class="btn btn-outline-primary w-100">View Shipment</a>
                    </div>
                </div>
            @empty
                <div class="listing-mobile-card p-4 text-center text-muted">
                    No shipments available.
                </div>
            @endforelse
        </div>

        <div class="mt-4">
            {{ $shipments->links() }}
        </div>
    </div>
</div>
@endsection
