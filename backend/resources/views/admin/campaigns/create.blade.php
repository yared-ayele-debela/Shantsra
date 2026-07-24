@php($pageHeading = 'Create Email Campaign')
@php($title = 'Create Campaign')
@php($pageEyebrow = 'Campaign Composer')
@php($pageSubtitle = 'Build a branded email with images, a clear CTA, audience targeting, and queue-based delivery.')
@extends('layouts.admin')

@section('content')
<div class="row g-4">
    <div class="col-lg-8">
        <div class="card content-card">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Compose Campaign</h5>
                        <p>Use public image URLs for banners or product shots. Emails will be delivered through the configured Laravel mailer.</p>
                    </div>
                </div>

                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0 ps-3">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('admin.campaigns.store') }}" class="row g-3">
                    @csrf

                    <div class="col-12">
                        <label class="form-label">Email subject</label>
                        <input type="text" name="subject" class="form-control" value="{{ old('subject') }}" placeholder="PeerBridge launch update for trusted delivery" required>
                    </div>

                    <div class="col-12">
                        <label class="form-label">Campaign title</label>
                        <input type="text" name="title" class="form-control" value="{{ old('title') }}" placeholder="New feature launch" required>
                    </div>

                    <div class="col-12">
                        <label class="form-label">Message body</label>
                        <textarea id="summernote" name="body" rows="10" class="form-control" placeholder="Write the announcement, key benefits, and next action for users." required>{{ old('body') }}</textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Hero image URL</label>
                        <input type="url" name="image_url" class="form-control" value="{{ old('image_url') }}" placeholder="https://cdn.example.com/campaigns/launch-banner.png">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Audience</label>
                        <select name="audience_filter" class="form-select" required>
                            @foreach($audienceOptions as $value => $label)
                                <option value="{{ $value }}" @selected(old('audience_filter') === $value)>{{ $label }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">CTA button text</label>
                        <input type="text" name="cta_text" class="form-control" value="{{ old('cta_text') }}" placeholder="Explore Travelers">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">CTA button URL</label>
                        <input type="url" name="cta_url" class="form-control" value="{{ old('cta_url') }}" placeholder="https://peerbridge.example.com/travelers">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Schedule delivery</label>
                        <input type="datetime-local" name="scheduled_at" class="form-control" value="{{ old('scheduled_at') }}">
                    </div>

                    <div class="col-12 d-flex flex-column flex-md-row gap-2 pt-2">
                        <button type="submit" name="action" value="draft" class="btn btn-outline-dark">Save Draft</button>
                        <button type="submit" name="action" value="schedule" class="btn btn-outline-primary">Schedule Campaign</button>
                        <button type="submit" name="action" value="send_now" class="btn btn-dark">Queue Send Now</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card content-card mb-4">
            <div class="card-body p-4">
                <h5 class="mb-3">Delivery Best Practices</h5>
                <div class="detail-card p-3 mb-3">
                    <div class="text-muted small mb-1">Configured mailer</div>
                    <div class="fw-semibold">{{ $defaultMailer }}</div>
                </div>
                <ul class="text-muted small ps-3 mb-0">
                    <li>Only opted-in users are targeted.</li>
                    <li>Images should be hosted publicly.</li>
                    <li>Keep one clear CTA per campaign.</li>
                    <li>All campaign sends are queued in batches.</li>
                    <li>Each email includes an unsubscribe link.</li>
                </ul>
            </div>
        </div>
        <div class="card content-card">
            <div class="card-body p-4">
                <h5 class="mb-3">Suggested campaign types</h5>
                <div class="d-flex flex-wrap gap-2">
                    <span class="status-badge bg-primary-subtle text-primary-emphasis">Product Announcement</span>
                    <span class="status-badge bg-success-subtle text-success-emphasis">Promotion</span>
                    <span class="status-badge bg-info-subtle text-info-emphasis">Feature Launch</span>
                    <span class="status-badge bg-warning-subtle text-warning-emphasis">Reminder</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            $('#campaignBody').summernote({
                height: 320,
                placeholder: 'Write a professional marketing email with headings, formatted text, links, and images hosted on your CDN or server.',
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'clear']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['insert', ['link', 'picture', 'hr']],
                    ['view', ['codeview']],
                ],
            });
        });
    </script>
@endpush
