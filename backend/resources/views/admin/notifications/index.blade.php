@php($pageHeading = 'Admin Notifications')
@php($title = 'Notifications')
@php($pageEyebrow = 'System Alerts')
@php($pageSubtitle = 'Real-time alerts for new user package postings and status updates.')
@extends('layouts.admin')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
    <div>
        <h4 class="mb-1 fw-bold">Package Alerts Center</h4>
        <p class="text-muted small mb-0 font-medium">Review new package submissions requiring admin review or approval.</p>
    </div>
    @if($unreadCount > 0)
        <form method="POST" action="{{ route('admin.notifications.mark-all-read') }}">
            @csrf
            <button type="submit" class="btn btn-outline-primary btn-sm px-3 fw-bold">
                <i class="bi bi-check2-all me-1"></i> Mark All as Read
            </button>
        </form>
    @endif
</div>

<div class="card content-card">
    <div class="card-body p-4">
        @forelse($notifications as $notif)
            <div class="border rounded-4 p-3 mb-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 {{ $notif->is_read ? 'bg-light-subtle opacity-75' : 'bg-white border-warning-subtle shadow-xs' }}">
                <div class="d-flex gap-3 align-items-start">
                    <div class="rounded-circle {{ $notif->is_read ? 'bg-secondary-subtle text-secondary' : 'bg-warning-subtle text-warning-emphasis' }} d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style="width: 42px; height: 42px;">
                        <i class="bi bi-box-seam fs-5"></i>
                    </div>
                    <div>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <h6 class="mb-0 fw-bold text-dark">{{ $notif->title }}</h6>
                            @if(! $notif->is_read)
                                <span class="badge bg-warning text-dark font-bold px-2 py-0.5" style="font-size: 0.7rem;">NEW UNREAD</span>
                            @endif
                        </div>
                        <p class="text-muted small mb-1 mt-0.5">{{ $notif->message }}</p>
                        <div class="text-muted small">
                            <i class="bi bi-clock me-1"></i> Received {{ $notif->created_at->diffForHumans() }} ({{ $notif->created_at->format('M d, Y H:i') }})
                        </div>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                    @if($notif->shipment_id)
                        <form method="POST" action="{{ route('admin.notifications.read', $notif) }}" class="m-0">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="btn btn-sm btn-primary px-3 font-bold">
                                <i class="bi bi-eye me-1"></i> View Package
                            </button>
                        </form>
                    @endif

                    <form method="POST" action="{{ route('admin.notifications.destroy', $notif) }}" class="m-0" onsubmit="return confirm('Delete this notification?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger px-2" title="Delete notification">
                            <i class="bi bi-trash"></i>
                        </button>
                    </form>
                </div>
            </div>
        @empty
            <div class="py-5 text-center text-muted">
                <i class="bi bi-bell-slash fs-1 d-block mb-2 text-muted"></i>
                <h6 class="fw-bold">No Notifications Found</h6>
                <p class="small text-muted mb-0">Whenever users post new package requests, alerts will appear here.</p>
            </div>
        @endforelse

        <div class="mt-4">
            {{ $notifications->links() }}
        </div>
    </div>
</div>
@endsection
