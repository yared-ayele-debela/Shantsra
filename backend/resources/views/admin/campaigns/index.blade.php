@php($pageHeading = 'Email Campaigns')
@php($title = 'Campaigns')
@php($pageEyebrow = 'Lifecycle Marketing')
@php($pageSubtitle = 'Create branded announcement emails, target the right audience, and track campaign delivery outcomes.')
@extends('layouts.admin')

@section('content')
<div class="row g-4 mb-4">
    <div class="col-md-3">
        <div class="card stat-card h-100">
            <div class="card-body p-4">
                <div class="metric-icon mb-3"><i class="bi bi-megaphone"></i></div>
                <p class="text-muted mb-2 small text-uppercase fw-semibold">Total Campaigns</p>
                <h3 class="mb-1">{{ $campaigns->total() }}</h3>
                <p class="text-muted small mb-0">Campaigns created in the platform.</p>
            </div>
        </div>
    </div>
    <div class="col-md-9">
        <div class="card content-card h-100">
            <div class="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                    <h5 class="mb-1">Campaign Workspace</h5>
                    <p class="text-muted mb-0">Use email providers like Resend, Postmark, Mailgun, Brevo SMTP, or SES through your Laravel mail configuration.</p>
                </div>
                <a href="{{ route('admin.campaigns.create') }}" class="btn btn-dark">
                    <i class="bi bi-plus-circle me-2"></i>Create Campaign
                </a>
            </div>
        </div>
    </div>
</div>

<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1">Campaign History</h5>
                <p>Review marketing and announcement campaigns, their audience, and their delivery status.</p>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table admin-table align-middle">
                <thead>
                <tr>
                    <th>Campaign</th>
                    <th>Audience</th>
                    <th>Status</th>
                    <th>Recipients</th>
                    <th>Schedule</th>
                    <th class="text-end">Action</th>
                </tr>
                </thead>
                <tbody>
                @forelse($campaigns as $campaign)
                    <tr>
                        <td>
                            <div class="fw-semibold">{{ $campaign->title }}</div>
                            <div class="small text-muted">{{ $campaign->subject }}</div>
                        </td>
                        <td>{{ $campaign->audienceLabel() }}</td>
                        <td>
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
                        </td>
                        <td>{{ $campaign->recipients_count }}</td>
                        <td>{{ $campaign->scheduled_at?->format('M d, Y h:i A') ?? 'Send manually' }}</td>
                        <td class="text-end">
                            <a href="{{ route('admin.campaigns.show', $campaign) }}" class="btn btn-sm btn-outline-primary">Open</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="text-muted">No campaigns created yet.</td>
                    </tr>
                @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-4">
            {{ $campaigns->links() }}
        </div>
    </div>
</div>
@endsection
