@php($pageHeading = 'Website settings')
@php($title = 'Website settings')
@php($pageSubtitle = 'Branding, SEO text, logo, favicon, and social links shown on the public site.')
@extends('layouts.admin')

@section('content')
<div class="row g-4">
    <div class="col-12 col-xl-8">
        <div class="card content-card">
            <div class="card-body p-4 p-md-5">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Public website</h5>
                    </div>
                </div>

                <form method="post" action="{{ route('admin.settings.website.update') }}" enctype="multipart/form-data" class="needs-validation">
                    @csrf
                    @method('PUT')

                    <div class="mb-4">
                        <label class="form-label fw-semibold">Site name</label>
                        <input type="text" name="site_name" class="form-control" required maxlength="120"
                               value="{{ old('site_name', $settings->site_name) }}">
                        @error('site_name')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold">Tagline</label>
                        <input type="text" name="site_tagline" class="form-control" maxlength="255"
                               placeholder="Short line under the logo"
                               value="{{ old('site_tagline', $settings->site_tagline) }}">
                        @error('site_tagline')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold">Description</label>
                        <textarea name="site_description" class="form-control" rows="4" maxlength="8000"
                                  placeholder="Hero / about text and meta description for search engines">{{ old('site_description', $settings->site_description) }}</textarea>
                        @error('site_description')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold">Meta keywords <span class="text-muted fw-normal">(optional)</span></label>
                        <input type="text" name="meta_keywords" class="form-control" maxlength="500"
                               placeholder="Comma-separated keywords"
                               value="{{ old('meta_keywords', $settings->meta_keywords) }}">
                        @error('meta_keywords')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                    </div>

                    <hr class="my-4 opacity-25">

                    <div class="row g-4 mb-2">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Logo</label>
                            <p class="small text-muted mb-2">PNG, JPG, WebP · max 3&nbsp;MB. Shown in the public header when set.</p>
                            @if ($settings->logoPublicUrl())
                                <div class="mb-3 p-3 rounded-4 border" style="border-color: var(--admin-border) !important; background: var(--brand-50);">
                                    <img src="{{ $settings->logoPublicUrl() }}" alt="Current logo" class="img-fluid" style="max-height: 64px;">
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" name="remove_logo" id="remove_logo" value="1" @checked(old('remove_logo'))>
                                    <label class="form-check-label small" for="remove_logo">Remove current logo</label>
                                </div>
                            @endif
                            <input type="file" name="logo" class="form-control" accept="image/*">
                            @error('logo')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Favicon</label>
                            <p class="small text-muted mb-2">ICO, PNG, SVG · max 1&nbsp;MB. Updates the browser tab icon on the SPA.</p>
                            @if ($settings->faviconPublicUrl())
                                <div class="mb-3 p-3 rounded-4 border d-flex align-items-center gap-3" style="border-color: var(--admin-border) !important;">
                                    <img src="{{ $settings->faviconPublicUrl() }}" alt="Favicon" width="32" height="32" class="rounded">
                                    <span class="small text-muted">Current favicon</span>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" name="remove_favicon" id="remove_favicon" value="1" @checked(old('remove_favicon'))>
                                    <label class="form-check-label small" for="remove_favicon">Remove current favicon</label>
                                </div>
                            @endif
                            <input type="file" name="favicon" class="form-control" accept=".ico,.png,.svg,.jpg,.jpeg,.webp,image/*">
                            @error('favicon')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <hr class="my-4 opacity-25">

                    <h6 class="fw-semibold mb-3">Social links</h6>
                    <p class="small text-muted mb-4">Full URLs (https://…). Leave blank to hide.</p>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Facebook</label>
                            <input type="url" name="social_facebook" class="form-control" placeholder="https://facebook.com/…"
                                   value="{{ old('social_facebook', $settings->social_facebook) }}">
                            @error('social_facebook')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">X (Twitter)</label>
                            <input type="url" name="social_twitter" class="form-control" placeholder="https://x.com/…"
                                   value="{{ old('social_twitter', $settings->social_twitter) }}">
                            @error('social_twitter')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Instagram</label>
                            <input type="url" name="social_instagram" class="form-control" placeholder="https://instagram.com/…"
                                   value="{{ old('social_instagram', $settings->social_instagram) }}">
                            @error('social_instagram')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">LinkedIn</label>
                            <input type="url" name="social_linkedin" class="form-control" placeholder="https://linkedin.com/…"
                                   value="{{ old('social_linkedin', $settings->social_linkedin) }}">
                            @error('social_linkedin')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">YouTube</label>
                            <input type="url" name="social_youtube" class="form-control" placeholder="https://youtube.com/…"
                                   value="{{ old('social_youtube', $settings->social_youtube) }}">
                            @error('social_youtube')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="d-flex flex-wrap gap-2 pt-2">
                        <button type="submit" class="btn btn-primary px-4">Save settings</button>
                        <a href="{{ route('admin.dashboard') }}" class="btn btn-outline-secondary rounded-4">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

   
</div>
@endsection
