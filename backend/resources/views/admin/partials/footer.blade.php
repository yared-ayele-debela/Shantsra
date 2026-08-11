<footer class="admin-footer mt-auto text-center p-4">
    <div class="admin-footer-inner d-flex justify-content-center text-center">
        <span class="admin-footer-brand">{{ $siteSettings->site_name ?? 'PeerBridge' }}</span>
        @if (!empty($siteSettings?->site_tagline))
            <span class="admin-footer-dot d-none d-sm-inline" aria-hidden="true">·</span>
            <span class="text-muted d-none d-sm-inline">{{ $siteSettings->site_tagline }}</span>
        @endif
        <span class="admin-footer-dot d-none d-sm-inline" aria-hidden="true">·</span>
        <a href="{{ url('/') }}" class="admin-footer-link d-none d-sm-inline">View site</a>
    </div>
</footer>
