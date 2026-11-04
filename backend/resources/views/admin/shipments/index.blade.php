@php($pageHeading = 'Shipment Management')
@php($title = 'Shipments')
@php($pageEyebrow = 'Delivery Operations')
@php($pageSubtitle = 'Review sender shipment requests, inspect route details, approve/reject package listings, and manage fulfillment.')
@extends('layouts.admin')

@section('content')
<div class="page-summary-grid">
    <div class="summary-tile">
        <div class="summary-tile-label">Pending Admin Approval</div>
        <div class="summary-tile-value text-warning-emphasis">{{ $pendingApprovalCount }}</div>
        <p class="summary-tile-note">Packages waiting for admin approval before going public on frontend.</p>
    </div>
    <div class="summary-tile">
        <div class="summary-tile-label">Approved Packages</div>
        <div class="summary-tile-value text-success">{{ $approvedCount }}</div>
        <p class="summary-tile-note">Packages approved and visible to travelers across all pages.</p>
    </div>
    <div class="summary-tile">
        <div class="summary-tile-label">Confirmed Deals</div>
        <div class="summary-tile-value text-primary">{{ $dealsConfirmedCount ?? 0 }}</div>
        <p class="summary-tile-note">Deals confirmed directly between senders and travelers.</p>
    </div>
</div>

<!-- ADVANCED FILTER CONTROL PANEL -->
<div class="card content-card mb-4">
    <div class="card-body p-4">
        <form method="GET" action="{{ route('admin.shipments.index') }}" id="adminShipmentFilterForm">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-funnel-fill text-primary fs-5"></i>
                    <h5 class="mb-0 fw-bold">Advanced Package Filter</h5>
                </div>
                <div class="d-flex gap-2">
                    @if(request()->anyFilled(['search', 'approval_status', 'deal_status', 'status', 'category_id', 'is_urgent', 'from_city', 'to_city', 'min_weight', 'max_weight', 'start_date', 'end_date', 'sort_by']))
                        <a href="{{ route('admin.shipments.index') }}" class="btn btn-sm btn-outline-danger px-3">
                            <i class="bi bi-x-circle me-1"></i> Reset Filters
                        </a>
                    @endif
                    <button type="button" class="btn btn-sm btn-outline-secondary px-3" data-bs-toggle="collapse" data-bs-target="#extendedFiltersPanel" aria-expanded="{{ request()->anyFilled(['from_city', 'to_city', 'min_weight', 'max_weight', 'start_date', 'end_date']) ? 'true' : 'false' }}">
                        <i class="bi bi-sliders me-1"></i> More Filters
                    </button>
                    <button type="submit" class="btn btn-sm btn-primary px-4 fw-bold">
                        <i class="bi bi-search me-1"></i> Apply Filters
                    </button>
                </div>
            </div>

            <!-- Primary Filters Row -->
            <div class="row g-3">
                <div class="col-lg-3 col-md-6">
                    <label class="form-label small fw-semibold text-muted mb-1">Search Keywords</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                        <input type="text" name="search" class="form-control border-start-0 ps-0" placeholder="Sender, receiver, city, description..." value="{{ request('search') }}">
                    </div>
                </div>

                <div class="col-lg-2 col-md-3 col-6">
                    <label class="form-label small fw-semibold text-muted mb-1">Admin Approval</label>
                    <select name="approval_status" class="form-select" onchange="this.form.submit()">
                        <option value="all">All Approvals</option>
                        <option value="pending" @selected(request('approval_status') === 'pending')>Pending Approval</option>
                        <option value="approved" @selected(request('approval_status') === 'approved')>Approved Only</option>
                        <option value="rejected" @selected(request('approval_status') === 'rejected')>Rejected Only</option>
                    </select>
                </div>

                <div class="col-lg-2 col-md-3 col-6">
                    <label class="form-label small fw-semibold text-muted mb-1">Deal Status</label>
                    <select name="deal_status" class="form-select" onchange="this.form.submit()">
                        <option value="all">All Deal Statuses</option>
                        <option value="confirmed" @selected(request('deal_status') === 'confirmed')>🤝 Deal Confirmed</option>
                        <option value="declined" @selected(request('deal_status') === 'declined')>✕ Deal Declined</option>
                        <option value="pending" @selected(request('deal_status') === 'pending')>⏳ Pending Deal</option>
                    </select>
                </div>

                <div class="col-lg-2 col-md-3 col-6">
                    <label class="form-label small fw-semibold text-muted mb-1">Delivery Status</label>
                    <select name="status" class="form-select" onchange="this.form.submit()">
                        <option value="all">All Delivery Statuses</option>
                        @foreach(['pending', 'accepted', 'in_transit', 'delivered'] as $st)
                            <option value="{{ $st }}" @selected(request('status') === $st)>{{ str($st)->headline() }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="col-lg-3 col-md-6 col-6">
                    <label class="form-label small fw-semibold text-muted mb-1">Sort By</label>
                    <select name="sort_by" class="form-select" onchange="this.form.submit()">
                        <option value="latest" @selected(request('sort_by', 'latest') === 'latest')>Newest First</option>
                        <option value="oldest" @selected(request('sort_by') === 'oldest')>Oldest First</option>
                        <option value="weight_desc" @selected(request('sort_by') === 'weight_desc')>Weight: High to Low</option>
                        <option value="weight_asc" @selected(request('sort_by') === 'weight_asc')>Weight: Low to High</option>
                        <option value="travel_date_asc" @selected(request('sort_by') === 'travel_date_asc')>Travel Date (Earliest)</option>
                    </select>
                </div>
            </div>

            <!-- Extended Filters Panel (Collapsible) -->
            <div class="collapse {{ request()->anyFilled(['from_city', 'to_city', 'min_weight', 'max_weight', 'start_date', 'end_date']) ? 'show' : '' }} mt-3 pt-3 border-top" id="extendedFiltersPanel">
                <div class="row g-3">
                    <div class="col-md-3 col-6">
                        <label class="form-label small fw-semibold text-muted mb-1">From City</label>
                        <input type="text" name="from_city" class="form-control" placeholder="e.g. Addis Ababa" value="{{ request('from_city') }}">
                    </div>

                    <div class="col-md-3 col-6">
                        <label class="form-label small fw-semibold text-muted mb-1">To City</label>
                        <input type="text" name="to_city" class="form-control" placeholder="e.g. Dubai" value="{{ request('to_city') }}">
                    </div>

                    <div class="col-md-3 col-6">
                        <label class="form-label small fw-semibold text-muted mb-1">Min Weight (kg)</label>
                        <input type="number" step="0.1" name="min_weight" class="form-control" placeholder="0.5" value="{{ request('min_weight') }}">
                    </div>

                    <div class="col-md-3 col-6">
                        <label class="form-label small fw-semibold text-muted mb-1">Max Weight (kg)</label>
                        <input type="number" step="0.1" name="max_weight" class="form-control" placeholder="50.0" value="{{ request('max_weight') }}">
                    </div>

                    <div class="col-md-3 col-6">
                        <label class="form-label small fw-semibold text-muted mb-1">Travel Date From</label>
                        <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}">
                    </div>

                    <div class="col-md-3 col-6">
                        <label class="form-label small fw-semibold text-muted mb-1">Travel Date To</label>
                        <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}">
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>

<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
                <h5 class="mb-1">Package Listings ({{ $shipments->total() }})</h5>
                <p class="mb-0">Track sender, receiver, photo preview, route, approval status, and update shipment details.</p>
            </div>

            @if(request()->anyFilled(['search', 'approval_status', 'status', 'category_id', 'is_urgent', 'from_city', 'to_city', 'min_weight', 'max_weight', 'start_date', 'end_date']))
                <div class="d-flex flex-wrap gap-1 align-items-center">
                    <span class="small text-muted me-1">Active filters:</span>
                    @if(request('search'))
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">"{{ request('search') }}"</span>
                    @endif
                    @if(request('approval_status') && request('approval_status') !== 'all')
                        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Approval: {{ str(request('approval_status'))->headline() }}</span>
                    @endif
                    @if(request('status') && request('status') !== 'all')
                        <span class="badge bg-info-subtle text-info border border-info-subtle">Delivery: {{ str(request('status'))->headline() }}</span>
                    @endif
                    @if(request('from_city'))
                        <span class="badge bg-secondary-subtle text-secondary border">From: {{ request('from_city') }}</span>
                    @endif
                    @if(request('to_city'))
                        <span class="badge bg-secondary-subtle text-secondary border">To: {{ request('to_city') }}</span>
                    @endif
                </div>
            @endif
        </div>

        <div class="d-none d-md-block">
            <div class="table-responsive">
                <table class="table admin-table listing-table align-middle">
                    <thead>
                    <tr>
                        <th style="width: 70px;">Photo</th>
                        <th>Sender</th>
                        <th>Route</th>
                        <th>Receiver</th>
                        <th>Package Details</th>
                        <th>Approval Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($shipments as $shipment)
                        <tr>
                            <td>
                                @if($shipment->first_photo_url)
                                    <img src="{{ $shipment->first_photo_url }}" 
                                         alt="Shipment Photo" 
                                         class="rounded-3 border shadow-xs" 
                                         style="width: 54px; height: 54px; object-fit: cover;" 
                                         onerror="this.onerror=null;this.src='/assets/No-Image-Found-400x264.png';" />
                                @else
                                    <div class="rounded-3 bg-light border d-flex align-items-center justify-content-center text-muted" style="width: 54px; height: 54px;">
                                        <i class="bi bi-image fs-5"></i>
                                    </div>
                                @endif
                            </td>
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
                                <div class="listing-kicker">Weight & Category</div>
                                <div class="listing-metric">{{ number_format($shipment->weight, 2) }} kg</div>
                                <div class="table-muted">{{ $shipment->category?->name ?? 'General Cargo' }} • {{ count($shipment->product_images ?? []) }} photo(s)</div>
                            </td>
                            <td>
                                <div class="d-flex flex-column gap-1.5 align-items-start">
                                    <span class="status-badge {{ match($shipment->approval_status ?? 'pending') {
                                        'approved' => 'bg-success-subtle text-success border border-success-subtle',
                                        'rejected' => 'bg-danger-subtle text-danger border border-danger-subtle',
                                        default => 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
                                    } }}">
                                        <i class="bi {{ match($shipment->approval_status ?? 'pending') {
                                            'approved' => 'bi-check-circle-fill me-1',
                                            'rejected' => 'bi-x-circle-fill me-1',
                                            default => 'bi-clock-history me-1',
                                        } }}"></i>
                                        {{ match($shipment->approval_status ?? 'pending') {
                                            'approved' => 'Approved',
                                            'rejected' => 'Rejected',
                                            default => 'Pending Approval',
                                        } }}
                                    </span>
                                    <span class="small text-muted">
                                        Delivery: <strong>{{ str($shipment->status)->headline() }}</strong>
                                    </span>
                                    <div class="mt-0.5">
                                        @if(($shipment->deal_status ?? 'pending') === 'confirmed')
                                            <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5" style="font-size: 0.72rem;">
                                                <i class="bi bi-hand-thumbs-up-fill me-1"></i> Deal Confirmed
                                            </span>
                                        @elseif(($shipment->deal_status ?? 'pending') === 'declined')
                                            <span class="badge bg-secondary-subtle text-secondary border rounded-pill px-2 py-0.5" style="font-size: 0.72rem;">
                                                <i class="bi bi-x-circle me-1"></i> Deal Declined
                                            </span>
                                        @else
                                            <span class="badge bg-light text-muted border rounded-pill px-2 py-0.5" style="font-size: 0.72rem;">
                                                <i class="bi bi-clock me-1"></i> Pending Deal
                                            </span>
                                        @endif
                                    </div>
                                </div>
                            </td>
                            <td class="text-end">
                                <div class="d-inline-flex gap-1 align-items-center">
                                    @if(($shipment->approval_status ?? 'pending') !== 'approved')
                                        <form method="POST" action="{{ route('admin.shipments.approve', $shipment) }}" class="d-inline">
                                            @csrf
                                            @method('PATCH')
                                            <button type="submit" class="btn btn-sm btn-success px-2.5 fw-bold" title="Approve shipment listing">
                                                <i class="bi bi-check-lg"></i> Approve
                                            </button>
                                        </form>
                                    @endif
                                    @if(($shipment->approval_status ?? 'pending') !== 'rejected')
                                        <form method="POST" action="{{ route('admin.shipments.reject', $shipment) }}" class="d-inline" onsubmit="return confirm('Reject this shipment listing?')">
                                            @csrf
                                            @method('PATCH')
                                            <button type="submit" class="btn btn-sm btn-outline-danger px-2.5 fw-bold" title="Reject shipment listing">
                                                <i class="bi bi-x-lg"></i> Reject
                                            </button>
                                        </form>
                                    @endif
                                    @if(($shipment->approval_status ?? 'pending') === 'approved')
                                        <form method="POST" action="{{ route('admin.shipments.telegram', $shipment) }}" class="d-inline">
                                            @csrf
                                            <button type="submit" class="btn btn-sm btn-outline-primary px-2.5" title="Post package to Telegram channel">
                                                <i class="bi bi-telegram"></i>
                                            </button>
                                        </form>
                                    @endif
                                    <a href="{{ route('admin.shipments.show', $shipment) }}" class="btn btn-sm btn-outline-secondary px-2.5" title="View details">
                                        <i class="bi bi-eye"></i> View
                                    </a>
                                    <a href="{{ route('admin.shipments.edit', $shipment) }}" class="btn btn-sm btn-dark px-2.5" title="Update shipment details">
                                        <i class="bi bi-pencil-square"></i> Edit
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-5 text-center text-muted">
                                <div class="py-3">
                                    <i class="bi bi-search fs-1 text-muted d-block mb-2"></i>
                                    <h6>No matching shipments found</h6>
                                    <p class="small text-muted mb-3">Try adjusting or resetting your filter criteria.</p>
                                    <a href="{{ route('admin.shipments.index') }}" class="btn btn-sm btn-outline-primary">Reset Filters</a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="d-md-none">
            @forelse($shipments as $shipment)
                <div class="listing-mobile-card p-3 mb-3">
                    <div class="d-flex gap-3 align-items-start mb-3">
                        @if($shipment->first_photo_url)
                            <img src="{{ $shipment->first_photo_url }}" 
                                 alt="Shipment Photo" 
                                 class="rounded-3 border shadow-xs flex-shrink-0" 
                                 style="width: 60px; height: 60px; object-fit: cover;" 
                                 onerror="this.onerror=null;this.src='/assets/No-Image-Found-400x264.png';" />
                        @else
                            <div class="rounded-3 bg-light border d-flex align-items-center justify-content-center text-muted flex-shrink-0" style="width: 60px; height: 60px;">
                                <i class="bi bi-image fs-4"></i>
                            </div>
                        @endif

                        <div class="flex-grow-1 min-w-0">
                            <div class="table-person-name mb-0.5 truncate">{{ $shipment->sender?->name ?? 'Unknown sender' }}</div>
                            <p class="listing-mobile-subtitle mb-1">Receiver: {{ $shipment->receiver_name ?: 'Not provided' }}</p>
                            <div class="d-flex gap-1.5 flex-wrap">
                                <span class="status-badge {{ match($shipment->approval_status ?? 'pending') {
                                    'approved' => 'bg-success-subtle text-success',
                                    'rejected' => 'bg-danger-subtle text-danger',
                                    default => 'bg-warning-subtle text-warning-emphasis',
                                } }}">
                                    {{ match($shipment->approval_status ?? 'pending') {
                                        'approved' => 'Approved',
                                        'rejected' => 'Rejected',
                                        default => 'Pending Approval',
                                    } }}
                                </span>
                            </div>
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

                    <div class="d-flex gap-2 flex-wrap">
                        @if(($shipment->approval_status ?? 'pending') !== 'approved')
                            <form method="POST" action="{{ route('admin.shipments.approve', $shipment) }}" class="flex-fill">
                                @csrf
                                @method('PATCH')
                                <button type="submit" class="btn btn-success btn-sm w-100 font-bold">Approve</button>
                            </form>
                        @endif
                        @if(($shipment->approval_status ?? 'pending') !== 'rejected')
                            <form method="POST" action="{{ route('admin.shipments.reject', $shipment) }}" class="flex-fill">
                                @csrf
                                @method('PATCH')
                                <button type="submit" class="btn btn-outline-danger btn-sm w-100 font-bold">Reject</button>
                            </form>
                        @endif
                        <a href="{{ route('admin.shipments.show', $shipment) }}" class="btn btn-outline-secondary btn-sm flex-fill">View</a>
                        <a href="{{ route('admin.shipments.edit', $shipment) }}" class="btn btn-dark btn-sm flex-fill">Edit</a>
                    </div>
                </div>
            @empty
                <div class="listing-mobile-card p-4 text-center text-muted">
                    No matching shipments available.
                </div>
            @endforelse
        </div>

        <div class="mt-4">
            {{ $shipments->links() }}
        </div>
    </div>
</div>
@endsection
