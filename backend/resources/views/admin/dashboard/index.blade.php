@php($pageHeading = 'Dashboard Overview')
@php($title = 'Dashboard')
@php($pageEyebrow = 'Executive Summary')
@php($pageSubtitle = 'Track performance, recent activity, and operational health across the platform.')
@extends('layouts.admin')

@section('content')
<div class="row g-4 mb-4">
    <div class="col-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <div class="metric-icon mb-3"><i class="bi bi-people"></i></div>
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Total Users</p>
                <h3 class="mb-1">{{ $stats['users'] }}</h3>
                <p class="text-muted small mb-0">Registered senders and travelers</p>
            </div>
        </div>
    </div>
    <div class="col-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <div class="metric-icon mb-3"><i class="bi bi-box-seam"></i></div>
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Shipments</p>
                <h3 class="mb-1">{{ $stats['shipments'] }}</h3>
                <p class="text-muted small mb-0">Requests currently in the system</p>
            </div>
        </div>
    </div>
    <div class="col-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <div class="metric-icon mb-3"><i class="bi bi-airplane"></i></div>
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Travels</p>
                <h3 class="mb-1">{{ $stats['travels'] }}</h3>
                <p class="text-muted small mb-0">Published traveler route listings</p>
            </div>
        </div>
    </div>
    <div class="col-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <div class="metric-icon mb-3"><i class="bi bi-journal-check"></i></div>
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Bookings</p>
                <h3 class="mb-1">{{ $stats['bookings'] }}</h3>
                <p class="text-muted small mb-0">Confirmed and pending delivery matches</p>
            </div>
        </div>
    </div>
    <div class="col-6 col-xl-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <div class="metric-icon mb-3"><i class="bi bi-credit-card-2-front"></i></div>
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Subscription Packages</p>
                <h3 class="mb-1">{{ $stats['subscription_plans'] }}</h3>
                <p class="text-muted small mb-0">Active plan templates available for users</p>
            </div>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <div class="col-xl-8">
        <div class="card content-card h-100">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Platform Activity</h5>
                        <p>Shipments, travels, and bookings created in the last 7 days.</p>
                    </div>
                </div>
                <div style="height: 320px;">
                    <canvas id="activityTrendChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-4">
        <div class="card content-card h-100">
            <div class="card-body p-4">
                <h5 class="mb-1">Shipment Status</h5>
                <p class="text-muted mb-3 small">Current shipment distribution by status.</p>
                <div style="height: 320px;">
                    <canvas id="shipmentStatusChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <div class="col-md-6">
        <div class="card content-card h-100">
            <div class="card-body p-4">
                <h5 class="mb-1">Travel Listing Status</h5>
                <p class="text-muted mb-3 small">Approval pipeline for traveler posts.</p>
                <div style="height: 280px;">
                    <canvas id="travelStatusChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card content-card h-100">
            <div class="card-body p-4">
                <h5 class="mb-1">Booking Status</h5>
                <p class="text-muted mb-3 small">Booking progress across the platform.</p>
                <div style="height: 280px;">
                    <canvas id="bookingStatusChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <div class="col-xl-6">
        <div class="card content-card h-100">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Recent Shipments</h5>
                        <p>Latest shipment requests posted by users.</p>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table admin-table align-middle">
                        <thead>
                        <tr><th>Sender</th><th>Route</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                        @forelse($recentShipments as $shipment)
                            <tr>
                                <td class="fw-semibold">{{ $shipment->sender?->name }}</td>
                                <td>{{ $shipment->from_city }} → {{ $shipment->to_city }}</td>
                                <td><span class="status-badge bg-secondary-subtle text-secondary-emphasis">{{ str($shipment->status)->headline() }}</span></td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="text-muted">No recent shipments yet.</td></tr>
                        @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-6">
        <div class="card content-card h-100">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Recent Bookings</h5>
                        <p>Monitor the newest sender and traveler matches.</p>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table admin-table align-middle">
                        <thead>
                        <tr><th>Sender</th><th>Traveler</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                        @forelse($recentBookings as $booking)
                            <tr>
                                <td class="fw-semibold">{{ $booking->sender?->name }}</td>
                                <td>{{ $booking->traveler?->name }}</td>
                                <td><span class="status-badge bg-primary-subtle text-primary-emphasis">{{ str($booking->status)->headline() }}</span></td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="text-muted">No recent bookings yet.</td></tr>
                        @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<script>
    const chartData = @json($chartData);

    const shipmentStatusCtx = document.getElementById('shipmentStatusChart');
    if (shipmentStatusCtx) {
        new Chart(shipmentStatusCtx, {
            type: 'doughnut',
            data: {
                labels: chartData.shipmentStatusLabels,
                datasets: [{
                    data: chartData.shipmentStatusValues,
                    backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'],
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                },
            }
        });
    }

    const travelStatusCtx = document.getElementById('travelStatusChart');
    if (travelStatusCtx) {
        new Chart(travelStatusCtx, {
            type: 'bar',
            data: {
                labels: chartData.travelStatusLabels,
                datasets: [{
                    label: 'Travel Listings',
                    data: chartData.travelStatusValues,
                    backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                    borderRadius: 8,
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }

    const bookingStatusCtx = document.getElementById('bookingStatusChart');
    if (bookingStatusCtx) {
        new Chart(bookingStatusCtx, {
            type: 'pie',
            data: {
                labels: chartData.bookingStatusLabels,
                datasets: [{
                    data: chartData.bookingStatusValues,
                    backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'],
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                },
            }
        });
    }

    const activityTrendCtx = document.getElementById('activityTrendChart');
    if (activityTrendCtx) {
        new Chart(activityTrendCtx, {
            type: 'line',
            data: {
                labels: chartData.activityLabels,
                datasets: [
                    {
                        label: 'Shipments',
                        data: chartData.shipmentTrend,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        tension: 0.35,
                        fill: true,
                    },
                    {
                        label: 'Travels',
                        data: chartData.travelTrend,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.10)',
                        tension: 0.35,
                        fill: true,
                    },
                    {
                        label: 'Bookings',
                        data: chartData.bookingTrend,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.10)',
                        tension: 0.35,
                        fill: true,
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }
</script>
@endpush
