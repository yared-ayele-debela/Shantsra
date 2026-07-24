@php($pageHeading = 'Shipment Details')
@php($title = 'Shipment Details')
@extends('layouts.admin')

@section('content')
<div class="row g-4">
    <div class="col-lg-8">
        <div class="card content-card mb-4">
            <div class="card-body p-4">
                <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                    <div>
                        <div class="text-uppercase text-muted small fw-semibold mb-2">Shipment Overview</div>
                        <h4 class="mb-2">{{ $shipment->from_city }} → {{ $shipment->to_city }}</h4>
                        <p class="text-muted mb-0">
                            Submitted {{ $shipment->created_at?->diffForHumans() ?? 'recently' }}
                            @if ($shipment->travel_date)
                                • Preferred travel date {{ $shipment->travel_date->format('M d, Y') }}
                            @endif
                        </p>
                    </div>
                    <div>
                        <span
                            class="badge {{ match ($shipment->status) {
                                'accepted' => 'bg-primary-subtle text-primary',
                                'in_transit' => 'bg-warning-subtle text-warning-emphasis',
                                'delivered' => 'bg-success-subtle text-success',
                                default => 'bg-secondary-subtle text-secondary-emphasis',
                            } }} px-3 py-2 fs-6"
                        >
                            {{ str($shipment->status)->headline() }}
                        </span>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-sm-6">
                        <div class="border rounded-4 p-3 h-100 bg-light-subtle">
                            <div class="text-muted small mb-1">Sender</div>
                            <div class="fw-semibold">{{ $shipment->sender?->name ?? 'N/A' }}</div>
                            <div class="small text-muted">{{ $shipment->sender?->email ?? 'No email available' }}</div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="border rounded-4 p-3 h-100 bg-light-subtle">
                            <div class="text-muted small mb-1">Receiver</div>
                            <div class="fw-semibold">{{ $shipment->receiver_name }}</div>
                            <div class="small text-muted">{{ $shipment->receiver_phone ?: 'No receiver phone provided' }}</div>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="border rounded-4 p-3 h-100">
                            <div class="text-muted small mb-1">Weight</div>
                            <div class="fw-semibold">{{ number_format($shipment->weight, 2) }} kg</div>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="border rounded-4 p-3 h-100">
                            <div class="text-muted small mb-1">Images</div>
                            <div class="fw-semibold">{{ count($shipment->product_images ?? []) }}</div>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="border rounded-4 p-3 h-100">
                            <div class="text-muted small mb-1">Booking</div>
                            <div class="fw-semibold">{{ $shipment->booking ? 'Matched' : 'Not matched yet' }}</div>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="border rounded-4 p-3 h-100">
                            <div class="text-muted small mb-1">Priority</div>
                            <div class="fw-semibold">{{ $shipment->is_urgent ? 'Urgent' : 'Standard' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card content-card mb-4">
            <div class="card-body p-4">
                <h5 class="mb-3">Package Description</h5>
                <div class="rounded-4 border bg-light-subtle p-3">
                    <p class="mb-0 text-muted">
                        {{ $shipment->description ?: 'No shipment description provided.' }}
                    </p>
                </div>
            </div>
        </div>

        <div class="card content-card">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
                    <div>
                        <h5 class="mb-1">Product Images</h5>
                        <p class="text-muted mb-0 small">Uploaded images attached to this shipment request.</p>
                    </div>
                </div>

                @if (! empty($shipment->product_images))
                    <div class="row g-3">
                        @foreach ($shipment->product_images as $image)
                            <div class="col-md-6 col-xl-4">
                                <a href="{{ asset('storage/'.$image) }}" target="_blank" rel="noreferrer" class="text-decoration-none">
                                    <div class="border rounded-4 overflow-hidden bg-white h-100 shadow-sm">
                                        <img
                                            src="{{ asset('storage/'.$image) }}"
                                            alt="Shipment product image"
                                            class="w-100"
                                            style="height: 220px; object-fit: cover;"
                                        >
                                        <div class="p-3">
                                            <div class="small text-muted">Product image</div>
                                            <div class="fw-semibold text-dark">Open full size</div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="border rounded-4 p-4 text-center text-muted bg-light-subtle">
                        No product images were uploaded for this shipment.
                    </div>
                @endif
            </div>
        </div>
    </div>
    <div class="col-lg-4">
        <div class="card content-card mb-4">
            <div class="card-body p-4">
                <h5 class="mb-3">Routing & Match</h5>
                <div class="rounded-4 border p-3 mb-3">
                    <div class="text-muted small mb-1">Route</div>
                    <div class="fw-semibold">{{ $shipment->from_city }} → {{ $shipment->to_city }}</div>
                </div>
                <div class="rounded-4 border p-3 mb-3">
                    <div class="text-muted small mb-1">Preferred travel date</div>
                    <div class="fw-semibold">{{ $shipment->travel_date?->format('M d, Y') ?? 'Not specified' }}</div>
                </div>
                <div class="rounded-4 border p-3">
                    <div class="text-muted small mb-1">Assigned traveler</div>
                    <div class="fw-semibold">{{ $shipment->booking?->traveler?->name ?? 'No traveler assigned yet' }}</div>
                    @if ($shipment->booking)
                        <div class="small text-muted mt-1">
                            Booking #{{ $shipment->booking->id }} • {{ str($shipment->booking->status)->headline() }}
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="card content-card mb-4">
            <div class="card-body p-4">
                <h5 class="mb-3">Update Status</h5>
                <form method="POST" action="{{ route('admin.shipments.update-status', $shipment) }}">
                    @csrf
                    @method('PATCH')
                    <select name="status" class="form-select mb-3">
                        @foreach (['pending', 'accepted', 'in_transit', 'delivered'] as $status)
                            <option value="{{ $status }}" @selected($shipment->status === $status)>
                                {{ str($status)->headline() }}
                            </option>
                        @endforeach
                    </select>
                    <button class="btn btn-dark w-100">Save Status</button>
                </form>
            </div>
        </div>

        <div class="card content-card">
            <div class="card-body p-4">
                <h5 class="mb-3 text-danger">Danger Zone</h5>
                <form method="POST" action="{{ route('admin.shipments.destroy', $shipment) }}" onsubmit="return confirm('Delete this shipment?')">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-outline-danger w-100">Delete Shipment</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
