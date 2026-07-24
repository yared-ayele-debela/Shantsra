@php($pageHeading = 'Booking Management')
@php($title = 'Bookings')
@php($pageEyebrow = 'Transaction Flow')
@php($pageSubtitle = 'Monitor booking outcomes, review pricing, and update booking status without leaving the list.')
@extends('layouts.admin')

@section('content')
<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1">Bookings Pipeline</h5>
                <p>{{ $bookings->total() }} bookings are currently visible in the admin workspace.</p>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table admin-table align-middle">
                <thead>
                <tr><th>Sender</th><th>Traveler</th><th>Price</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                @forelse($bookings as $booking)
                    <tr>
                        <td class="fw-semibold">{{ $booking->sender?->name }}</td>
                        <td>{{ $booking->traveler?->name }}</td>
                        <td>${{ number_format($booking->price, 2) }}</td>
                        <td><span class="status-badge bg-secondary-subtle text-secondary-emphasis">{{ str($booking->status)->headline() }}</span></td>
                        <td>
                            <form method="POST" action="{{ route('admin.bookings.update-status', $booking) }}" class="row g-2 align-items-center">
                                @csrf
                                @method('PATCH')
                                <div class="col-md-8">
                                    <select name="status" class="form-select form-select-sm">
                                        @foreach(['pending', 'confirmed', 'cancelled', 'completed'] as $status)
                                            <option value="{{ $status }}" @selected($booking->status === $status)>{{ str($status)->headline() }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <button class="btn btn-sm btn-dark w-100">Save</button>
                                </div>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="text-muted">No bookings available.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">
            {{ $bookings->links() }}
        </div>
    </div>
</div>
@endsection
