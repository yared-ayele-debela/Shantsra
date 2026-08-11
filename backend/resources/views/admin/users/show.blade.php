@php($pageHeading = 'User Details')
@php($title = 'User Details')
@php($pageEyebrow = 'User Intelligence')
@php($pageSubtitle = 'Review profile information, account health, and activity volumes for this user.')
@extends('layouts.admin')

@section('content')
<div class="row g-4">
    <div class="col-lg-4">
        <div class="card content-card">
            <div class="card-body p-4">
                <div class="metric-icon mb-3"><i class="bi bi-person"></i></div>
                <h5 class="mb-3">Profile Summary</h5>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Full Name</div>
                    <div class="fw-semibold">{{ $user->name }}</div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Email Address</div>
                    <div class="fw-semibold">{{ $user->email }}</div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Phone</div>
                    <div class="fw-semibold">{{ $user->phone ?? 'N/A' }}</div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Role</div>
                    <div><span class="status-badge bg-info-subtle text-info-emphasis">{{ ucfirst($user->role) }}</span></div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Status</div>
                    <div><span class="status-badge {{ $user->status === 'active' ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis' }}">{{ ucfirst($user->status) }}</span></div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Location</div>
                    <div class="fw-semibold">{{ $user->city ?? 'N/A' }}, {{ $user->country }}</div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">ID document</div>
                    <div class="fw-semibold">{{ $user->id_document_type ? ucfirst(str_replace('_', ' ', $user->id_document_type)) : '—' }}</div>
                    @if($user->id_document_number)
                        <div class="small text-muted mt-1">Number on file</div>
                    @endif
                    <div class="mt-2">
                        @if($user->id_document_path)
                            <span class="status-badge {{ $user->id_document_status === 'verified' ? 'bg-success-subtle text-success-emphasis' : ($user->id_document_status === 'rejected' ? 'bg-danger-subtle text-danger-emphasis' : 'bg-warning-subtle text-warning-emphasis') }}">
                                {{ ucfirst($user->id_document_status ?? 'pending') }}
                            </span>
                            <a href="{{ asset('storage/'.$user->id_document_path) }}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary ms-2">View file</a>
                        @else
                            <span class="text-muted small">No file uploaded</span>
                        @endif
                    </div>
                    @if($user->id_document_comment)
                        <div class="alert alert-warning border border-warning-subtle mt-3 py-2 px-3 small mb-0 rounded-3">
                            <i class="bi bi-info-circle me-1"></i> <strong>Admin Note / Reason:</strong> {{ $user->id_document_comment }}
                        </div>
                    @endif
                </div>
                @if($user->id_document_path)
                    <form method="POST" action="{{ route('admin.users.id-document-status', $user) }}" class="detail-card p-3 mb-0">
                        @csrf
                        @method('PATCH')
                        <div class="text-muted small mb-2">Verification Action</div>
                        <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
                            <select name="id_document_status" class="form-select form-select-sm" style="max-width: 12rem;">
                                <option value="pending" @selected(($user->id_document_status ?? 'pending') === 'pending')>Pending</option>
                                <option value="verified" @selected(($user->id_document_status ?? '') === 'verified')>Verified</option>
                                <option value="rejected" @selected(($user->id_document_status ?? '') === 'rejected')>Rejected</option>
                            </select>
                            <button type="submit" class="btn btn-sm btn-primary">Update status</button>
                        </div>
                        <div>
                            <label class="form-label small text-muted mb-1">Comment / Rejection Reason</label>
                            <textarea name="id_document_comment" class="form-control form-control-sm" rows="2" placeholder="e.g. Reject reason: ID document is expired or illegible...">{{ old('id_document_comment', $user->id_document_comment) }}</textarea>
                        </div>
                    </form>
                @endif
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card stat-card h-100">
                    <div class="card-body p-4">
                        <div class="metric-icon mb-3"><i class="bi bi-box-seam"></i></div>
                        <p class="text-muted mb-2 small text-uppercase fw-semibold">Shipments</p>
                        <h3 class="mb-1">{{ $user->shipments->count() }}</h3>
                        <p class="text-muted small mb-0">Shipment requests posted.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card h-100">
                    <div class="card-body p-4">
                        <div class="metric-icon mb-3"><i class="bi bi-airplane"></i></div>
                        <p class="text-muted mb-2 small text-uppercase fw-semibold">Travels</p>
                        <h3 class="mb-1">{{ $user->travels->count() }}</h3>
                        <p class="text-muted small mb-0">Travel listings created.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card h-100">
                    <div class="card-body p-4">
                        <div class="metric-icon mb-3"><i class="bi bi-journal-check"></i></div>
                        <p class="text-muted mb-2 small text-uppercase fw-semibold">Bookings</p>
                        <h3 class="mb-1">{{ $user->sentBookings->count() }}</h3>
                        <p class="text-muted small mb-0">Bookings created.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
