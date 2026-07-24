@php($pageHeading = 'Travel Details')
@php($title = 'Travel Details')
@php($pageEyebrow = 'Listing Review')
@php($pageSubtitle = 'Inspect traveler route information, pricing, and moderation status in one place.')
@extends('layouts.admin')

@section('content')
<div class="row g-4">
    <div class="col-lg-8">
        <div class="card content-card">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Travel Information</h5>
                        <p>Key route and pricing information for this traveler listing.</p>
                    </div>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="detail-card p-3 h-100">
                            <div class="text-muted small mb-1">Traveler</div>
                            <div class="fw-semibold">{{ $travel->traveler?->name }}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="detail-card p-3 h-100">
                            <div class="text-muted small mb-1">Route</div>
                            <div class="fw-semibold">{{ $travel->from_city }} → {{ $travel->to_city }}</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="detail-card p-3 h-100">
                            <div class="text-muted small mb-1">Departure Date</div>
                            <div class="fw-semibold">{{ $travel->departure_date?->format('M d, Y') }}</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="detail-card p-3 h-100">
                            <div class="text-muted small mb-1">Available Weight</div>
                            <div class="fw-semibold">{{ number_format($travel->available_weight, 2) }} kg</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="detail-card p-3 h-100">
                            <div class="text-muted small mb-1">Price per KG</div>
                            <div class="fw-semibold">${{ number_format($travel->price_per_kg, 2) }}</div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="detail-card p-3">
                            <div class="text-muted small mb-1">Notes</div>
                            <div class="text-muted">{{ $travel->notes ?: 'N/A' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-4">
        <div class="card content-card">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Approve / Reject</h5>
                        <p>Update moderation status for this listing.</p>
                    </div>
                </div>
                <form method="POST" action="{{ route('admin.travels.update-status', $travel) }}">
                    @csrf
                    @method('PATCH')
                    <select name="status" class="form-select mb-3">
                        @foreach(['pending', 'approved', 'rejected'] as $status)
                            <option value="{{ $status }}" @selected($travel->status === $status)>{{ str($status)->headline() }}</option>
                        @endforeach
                    </select>
                    <button class="btn btn-dark w-100">Update Travel Status</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
