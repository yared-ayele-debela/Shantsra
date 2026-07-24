@php($pageHeading = 'Campaign Details')
@php($title = 'Campaign Details')
@php($pageEyebrow = 'Campaign Analytics')
@php($pageSubtitle = 'Monitor the campaign content, audience, delivery status, and per-recipient results.')
@extends('layouts.admin')

@section('content')
<div class="row g-4 mb-4">
    <div class="col-lg-8">
        <div class="card content-card h-100">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">{{ $campaign->title }}</h5>
                        <p>{{ $campaign->subject }}</p>
                    </div>
                    <span class="status-badge {{ match($campaign->status) {
                        'sent' => 'bg-success-subtle text-success-emphasis',
                        'scheduled' => 'bg-info-subtle text-info-emphasis',
                        'processing' => 'bg-warning-subtle text-warning-emphasis',
                        'failed' => 'bg-danger-subtle text-danger-emphasis',
                        'cancelled' => 'bg-secondary-subtle text-secondary-emphasis',
                        default => 'bg-primary-subtle text-primary-emphasis',
                    } }}">
                        {{ str($campaign->status)->headline() }}
                    </span>
                </div>

                @if ($campaign->image_url)
                    <div class="mb-4 overflow-hidden rounded-4 border">
                        <img src="{{ $campaign->image_url }}" alt="Campaign hero" class="w-100" style="max-height: 280px; object-fit: cover;">
                    </div>
                @endif

                <div class="detail-card p-4">
                    <div class="text-muted small mb-2">Email body</div>
                    <div class="text-muted summernote-content">{!! $campaign->body !!}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card content-card mb-4">
            <div class="card-body p-4">
                <h5 class="mb-3">Campaign Metadata</h5>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Audience</div>
                    <div class="fw-semibold">{{ $campaign->audienceLabel() }}</div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Created by</div>
                    <div class="fw-semibold">{{ $campaign->creator?->name ?? 'System' }}</div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Scheduled at</div>
                    <div class="fw-semibold">{{ $campaign->scheduled_at?->format('M d, Y h:i A') ?? 'Not scheduled' }}</div>
                </div>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Sent at</div>
                    <div class="fw-semibold">{{ $campaign->sent_at?->format('M d, Y h:i A') ?? 'Not sent yet' }}</div>
                </div>
                @if ($campaign->cta_text && $campaign->cta_url)
                    <div class="detail-card p-3">
                        <div class="text-muted small mb-1">CTA</div>
                        <div class="fw-semibold">{{ $campaign->cta_text }}</div>
                        <a href="{{ $campaign->cta_url }}" target="_blank" rel="noreferrer" class="small">{{ $campaign->cta_url }}</a>
                    </div>
                @endif
            </div>
        </div>

        <div class="card content-card">
            <div class="card-body p-4">
                <h5 class="mb-3">Actions</h5>
                <div class="d-grid gap-2">
                    @if (! in_array($campaign->status, ['sent', 'processing', 'cancelled'], true))
                        <form method="POST" action="{{ route('admin.campaigns.send', $campaign) }}">
                            @csrf
                            <button class="btn btn-dark w-100">Queue Send Now</button>
                        </form>
                    @endif

                    @if (in_array($campaign->status, ['draft', 'scheduled'], true))
                        <form method="POST" action="{{ route('admin.campaigns.cancel', $campaign) }}">
                            @csrf
                            @method('PATCH')
                            <button class="btn btn-outline-danger w-100">Cancel Campaign</button>
                        </form>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <div class="col-md-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Queued</p>
                <h3 class="mb-0">{{ $recipientStats['queued'] }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Sent</p>
                <h3 class="mb-0">{{ $recipientStats['sent'] }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Failed</p>
                <h3 class="mb-0">{{ $recipientStats['failed'] }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Skipped</p>
                <h3 class="mb-0">{{ $recipientStats['skipped'] }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1">Recent Delivery Log</h5>
                <p>Track the latest recipient outcomes for this campaign.</p>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table admin-table align-middle">
                <thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Sent</th>
                    <th>Error</th>
                </tr>
                </thead>
                <tbody>
                @forelse($recentRecipients as $recipient)
                    <tr>
                        <td>{{ $recipient->user?->name ?? 'Unknown user' }}</td>
                        <td>{{ $recipient->email }}</td>
                        <td>
                            <span class="status-badge {{ match($recipient->status) {
                                'sent' => 'bg-success-subtle text-success-emphasis',
                                'failed' => 'bg-danger-subtle text-danger-emphasis',
                                'skipped' => 'bg-secondary-subtle text-secondary-emphasis',
                                default => 'bg-info-subtle text-info-emphasis',
                            } }}">
                                {{ str($recipient->status)->headline() }}
                            </span>
                        </td>
                        <td>{{ $recipient->sent_at?->format('M d, Y h:i A') ?? 'Pending' }}</td>
                        <td class="text-muted small">{{ $recipient->error_message ?: 'None' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="text-muted">No recipient logs yet.</td>
                    </tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
