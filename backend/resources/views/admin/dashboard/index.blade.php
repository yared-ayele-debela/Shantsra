@php($pageHeading = 'Dashboard Overview')
@php($title = 'Dashboard')
@php($pageEyebrow = 'Executive Summary')
@php($pageSubtitle = 'Track performance, recent activity, and operational health across the platform.')
@extends('layouts.admin')

@section('content')
<!-- Website Identity & Settings Information Card -->
<div class="card content-card mb-4 border-0 shadow-sm overflow-hidden" style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 251, 241, 0.75)); border: 1px solid var(--admin-border) !important;">
    <div class="card-body p-4">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pb-3 mb-3 border-bottom">
            <div class="d-flex align-items-center gap-3">
                <div class="p-2 rounded-3 bg-white border shadow-xs d-flex align-items-center justify-content-center" style="width: 56px; height: 56px; min-width: 56px;">
                    @if ($siteSettings?->logoPublicUrl())
                        <img src="{{ $siteSettings->logoPublicUrl() }}" alt="{{ $siteSettings->site_name }}" style="max-height: 40px; max-width: 44px; object-fit: contain;">
                    @else
                        <div class="fw-bold text-primary fs-4">{{ strtoupper(substr($siteSettings->site_name ?? 'PB', 0, 2)) }}</div>
                    @endif
                </div>
                <div>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <h4 class="mb-0 fw-bold text-dark">{{ $siteSettings->site_name ?? 'PeerBridge' }}</h4>
                        <span class="badge bg-success-subtle text-success-emphasis rounded-pill px-2.5 py-1 small fw-semibold">
                            <i class="bi bi-patch-check-fill me-1"></i> Live Settings Info
                        </span>
                    </div>
                    @if ($siteSettings?->site_tagline)
                        <p class="text-muted small mb-0 mt-0.5 fw-medium">{{ $siteSettings->site_tagline }}</p>
                    @endif
                </div>
            </div>
            <div>
                <a href="{{ route('admin.settings.website.edit') }}" class="btn btn-outline-primary rounded-3 btn-sm fw-semibold shadow-xs d-inline-flex align-items-center gap-1.5">
                    <i class="bi bi-sliders"></i>
                    <span>Manage Settings</span>
                </a>
            </div>
        </div>

        <div class="row g-3">
            <div class="col-md-6 col-lg-4">
                <div class="p-3 rounded-3 bg-white border h-100 shadow-xs">
                    <div class="text-uppercase small fw-bold text-muted mb-1" style="font-size: 0.72rem; letter-spacing: 0.05em;">Site Description</div>
                    <p class="small mb-0 text-secondary" style="line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        {{ $siteSettings?->site_description ?: 'No site description set yet. Click manage to add metadata.' }}
                    </p>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="p-3 rounded-3 bg-white border h-100 shadow-xs">
                    <div class="text-uppercase small fw-bold text-muted mb-1" style="font-size: 0.72rem; letter-spacing: 0.05em;">Brand Assets</div>
                    <div class="d-flex align-items-center gap-3 mt-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="small text-muted fw-medium">Logo:</span>
                            @if ($siteSettings?->logoPublicUrl())
                                <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">Uploaded</span>
                            @else
                                <span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">Default Mark</span>
                            @endif
                        </div>
                        <div class="vr"></div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="small text-muted fw-medium">Favicon:</span>
                            @if ($siteSettings?->faviconPublicUrl())
                                <img src="{{ $siteSettings->faviconPublicUrl() }}" alt="Favicon" width="20" height="20" class="rounded">
                                <span class="badge bg-success-subtle text-success-emphasis rounded-pill">Set</span>
                            @else
                                <span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">None</span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-12 col-lg-4">
                <div class="p-3 rounded-3 bg-white border h-100 shadow-xs">
                    <div class="text-uppercase small fw-bold text-muted mb-1.5" style="font-size: 0.72rem; letter-spacing: 0.05em;">Social Channels</div>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        @if ($siteSettings?->social_facebook)
                            <a href="{{ $siteSettings->social_facebook }}" target="_blank" class="btn btn-sm btn-light border text-primary px-2 py-1" title="Facebook">
                                <i class="bi bi-facebook"></i>
                            </a>
                        @endif
                        @if ($siteSettings?->social_twitter)
                            <a href="{{ $siteSettings->social_twitter }}" target="_blank" class="btn btn-sm btn-light border text-dark px-2 py-1" title="X / Twitter">
                                <i class="bi bi-twitter-x"></i>
                            </a>
                        @endif
                        @if ($siteSettings?->social_instagram)
                            <a href="{{ $siteSettings->social_instagram }}" target="_blank" class="btn btn-sm btn-light border text-danger px-2 py-1" title="Instagram">
                                <i class="bi bi-instagram"></i>
                            </a>
                        @endif
                        @if ($siteSettings?->social_linkedin)
                            <a href="{{ $siteSettings->social_linkedin }}" target="_blank" class="btn btn-sm btn-light border text-info px-2 py-1" title="LinkedIn">
                                <i class="bi bi-linkedin"></i>
                            </a>
                        @endif
                        @if ($siteSettings?->social_youtube)
                            <a href="{{ $siteSettings->social_youtube }}" target="_blank" class="btn btn-sm btn-light border text-danger px-2 py-1" title="YouTube">
                                <i class="bi bi-youtube"></i>
                            </a>
                        @endif
                        @if (!$siteSettings?->social_facebook && !$siteSettings?->social_twitter && !$siteSettings?->social_instagram && !$siteSettings?->social_linkedin && !$siteSettings?->social_youtube)
                            <span class="small text-muted italic">No social media links connected yet.</span>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="card content-card mb-4 border-0 shadow-sm">
    <div class="card-body p-4">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
            <div>
                <h5 class="mb-1">System tools</h5>
                <p class="text-muted small mb-0">Check service health or run common Laravel maintenance commands.</p>
            </div>
            <button type="button" class="btn btn-outline-success rounded-3 btn-sm fw-semibold system-tool-button"
                    data-tool-url="{{ route('admin.tools.health') }}" data-tool-method="GET" data-tool-label="Run health check">
                <i class="bi bi-heart-pulse me-1"></i>Run health check
            </button>
        </div>

        <div class="row g-2">
            @foreach([
                'optimize-clear' => ['Optimize clear', 'bi-stars'],
                'cache-clear' => ['Cache clear', 'bi-lightning-charge'],
                'config-clear' => ['Config clear', 'bi-sliders'],
                'route-clear' => ['Route clear', 'bi-signpost-split'],
                'storage-link' => ['Storage link', 'bi-folder-symlink'],
                'view-clear' => ['View clear', 'bi-file-earmark-code'],
            ] as $command => [$label, $icon])
                <div class="col-6 col-md-4 col-xl-2">
                    <button type="button" class="btn btn-light border rounded-3 w-100 h-100 py-2 system-tool-button"
                            data-tool-url="{{ route('admin.tools.run', $command) }}" data-tool-method="POST" data-tool-label="{{ $label }}">
                        <i class="bi {{ $icon }} d-block mb-1 text-primary"></i>
                        <span class="small fw-semibold">{{ $label }}</span>
                    </button>
                </div>
            @endforeach
        </div>

        <div id="system-tools-feedback" class="alert d-none mt-3 mb-0 rounded-3" role="status" aria-live="polite"></div>
    </div>
</div>

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
                <div class="metric-icon mb-3"><i class="bi bi-hand-thumbs-up text-success"></i></div>
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Confirmed Deals</p>
                <h3 class="mb-1">{{ $stats['deals_confirmed'] ?? 0 }}</h3>
                <p class="text-muted small mb-0">Successful deals agreed by members</p>
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

    document.querySelectorAll('.system-tool-button').forEach((button) => {
        button.addEventListener('click', async () => {
            const feedback = document.getElementById('system-tools-feedback');
            const originalContent = button.innerHTML;

            document.querySelectorAll('.system-tool-button').forEach((toolButton) => {
                toolButton.disabled = true;
            });
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Running...';
            feedback.className = 'alert alert-info mt-3 mb-0 rounded-3';
            feedback.textContent = `${button.dataset.toolLabel} is running...`;

            try {
                const response = await fetch(button.dataset.toolUrl, {
                    method: button.dataset.toolMethod,
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    },
                });
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || result.output || `${button.dataset.toolLabel} failed.`);
                }

                const details = result.output ? ` ${result.output}` : '';
                feedback.className = 'alert alert-success mt-3 mb-0 rounded-3';
                feedback.textContent = `${button.dataset.toolLabel} completed successfully.${details}`;
            } catch (error) {
                feedback.className = 'alert alert-danger mt-3 mb-0 rounded-3';
                feedback.textContent = error.message || `${button.dataset.toolLabel} failed.`;
            } finally {
                button.innerHTML = originalContent;
                document.querySelectorAll('.system-tool-button').forEach((toolButton) => {
                    toolButton.disabled = false;
                });
            }
        });
    });

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
