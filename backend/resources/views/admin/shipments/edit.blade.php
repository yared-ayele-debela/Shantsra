@php($pageHeading = 'Edit Shipment')
@php($title = 'Edit Shipment #' . $shipment->id)
@extends('layouts.admin')

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <a href="{{ route('admin.shipments.show', $shipment) }}" class="text-decoration-none text-muted small">
                    <i class="bi bi-arrow-left"></i> Back to Shipment Details
                </a>
                <h3 class="mb-0 mt-1">Edit Shipment Request #{{ $shipment->id }}</h3>
                <p class="text-muted small">Modify sender shipment info, route locations, weight, and delivery status for user.</p>
            </div>
            <div>
                <span class="badge bg-dark px-3 py-2">
                    Sender: {{ $shipment->sender?->name ?? 'User #' . $shipment->sender_id }}
                </span>
            </div>
        </div>

        @if (session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle me-1"></i> {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        @if ($errors->any())
            <div class="alert alert-danger" role="alert">
                <ul class="mb-0">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('admin.shipments.update', $shipment) }}" enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <!-- First Photo Preview Box -->
            <div class="card content-card mb-4">
                <div class="card-body p-4">
                    <h5 class="mb-3">Shipment Photo Preview</h5>
                    <div class="d-flex align-items-center gap-4 flex-wrap">
                        @if($shipment->first_photo_url)
                            <img src="{{ $shipment->first_photo_url }}"
                                 alt="First Photo"
                                 class="rounded-4 border shadow-sm"
                                 style="width: 120px; height: 120px; object-fit: cover;"
                                 onerror="this.onerror=null;this.src='/assets/No-Image-Found-400x264.png';" />
                        @else
                            <div class="rounded-4 bg-light border d-flex align-items-center justify-content-center text-muted" style="width: 120px; height: 120px;">
                                <i class="bi bi-image fs-1"></i>
                            </div>
                        @endif

                        <div class="flex-grow-1">
                            <h6 class="mb-1">Package Images ({{ count($shipment->product_images ?? []) }} Uploaded)</h6>
                            <p class="text-muted small mb-2">Attached photos for this shipment. You can upload additional photos below.</p>
                            <input type="file" name="images[]" class="form-control form-control-sm" multiple accept="image/*">
                            <div class="form-text">Allowed formats: JPG, PNG, WEBP (max 5MB each)</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Details Card -->
            <div class="card content-card mb-4">
                <div class="card-body p-4">
                    <h5 class="mb-3">Receiver & Route Information</h5>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Receiver Name <span class="text-danger">*</span></label>
                            <input type="text" name="receiver_name" class="form-control" value="{{ old('receiver_name', $shipment->receiver_name) }}" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Receiver Phone</label>
                            <input type="text" name="receiver_phone" class="form-control" value="{{ old('receiver_phone', $shipment->receiver_phone) }}">
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Departure City (From) <span class="text-danger">*</span></label>
                            <input type="text" name="from_city" class="form-control" value="{{ old('from_city', $shipment->from_city) }}" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Destination City (To) <span class="text-danger">*</span></label>
                            <input type="text" name="to_city" class="form-control" value="{{ old('to_city', $shipment->to_city) }}" required>
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Weight (kg) <span class="text-danger">*</span></label>
                            <input type="number" step="0.01" min="0.1" name="weight" class="form-control" value="{{ old('weight', $shipment->weight) }}" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Preferred Travel Date</label>
                            <input type="date" name="travel_date" class="form-control" value="{{ old('travel_date', $shipment->travel_date?->format('Y-m-d')) }}">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Package Category</label>
                            <select name="category_id" class="form-select">
                                <option value="">-- Uncategorized --</option>
                                @foreach($categories as $cat)
                                    <option value="{{ $cat->id }}" @selected(old('category_id', $shipment->category_id) == $cat->id)>
                                        {{ $cat->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Status & Priority Card -->
            <div class="card content-card mb-4">
                <div class="card-body p-4">
                    <h5 class="mb-3">Fulfillment & Status Control</h5>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Admin Approval Status <span class="text-danger">*</span></label>
                            <select name="approval_status" class="form-select fw-bold" required>
                                <option value="pending" @selected(old('approval_status', $shipment->approval_status ?? 'pending') === 'pending')>Pending Approval</option>
                                <option value="approved" @selected(old('approval_status', $shipment->approval_status) === 'approved')>Approved (Public on Frontend)</option>
                                <option value="rejected" @selected(old('approval_status', $shipment->approval_status) === 'rejected')>Rejected (Hidden)</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Delivery Status <span class="text-danger">*</span></label>
                            <select name="status" class="form-select" required>
                                @foreach(['pending', 'accepted', 'in_transit', 'delivered'] as $st)
                                    <option value="{{ $st }}" @selected(old('status', $shipment->status) === $st)>
                                        {{ str($st)->headline() }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-12">
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" name="is_urgent" value="1" id="isUrgentSwitch" @checked(old('is_urgent', $shipment->is_urgent))>
                                <label class="form-check-input-label fw-semibold text-danger ms-1" for="isUrgentSwitch">
                                    Mark as Urgent Shipment
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="form-label fw-semibold">Package Description</label>
                        <textarea name="description" class="form-control" rows="4" placeholder="Detailed cargo description, special handling notes...">{{ old('description', $shipment->description) }}</textarea>
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-5">
                <a href="{{ route('admin.shipments.show', $shipment) }}" class="btn btn-outline-secondary px-4">Cancel</a>
                <button type="submit" class="btn btn-primary px-5 font-bold">
                    <i class="bi bi-check-circle me-1"></i> Save & Update Shipment
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
