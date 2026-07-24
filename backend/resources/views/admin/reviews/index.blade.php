@php($pageHeading = 'Reviews Management')
@php($title = 'Reviews')
@php($pageEyebrow = 'Trust & Feedback')
@php($pageSubtitle = 'Review community feedback, audit public comments, and remove harmful content when needed.')
@extends('layouts.admin')

@section('content')
<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1">Community Reviews</h5>
                <p>{{ $reviews->total() }} customer reviews are available for moderation.</p>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table admin-table align-middle">
                <thead>
                <tr><th>Reviewer</th><th>Reviewed User</th><th>Rating</th><th>Comment</th><th class="text-end">Action</th></tr>
                </thead>
                <tbody>
                @forelse($reviews as $review)
                    <tr>
                        <td class="fw-semibold">{{ $review->reviewer?->name }}</td>
                        <td>{{ $review->reviewedUser?->name }}</td>
                        <td><span class="status-badge bg-warning-subtle text-warning-emphasis">{{ $review->rating }}/5</span></td>
                        <td class="text-muted">{{ $review->comment }}</td>
                        <td class="text-end">
                            <form method="POST" action="{{ route('admin.reviews.destroy', $review) }}" onsubmit="return confirm('Delete this review?')">
                                @csrf
                                @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="text-muted">No reviews available.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">
            {{ $reviews->links() }}
        </div>
    </div>
</div>
@endsection
