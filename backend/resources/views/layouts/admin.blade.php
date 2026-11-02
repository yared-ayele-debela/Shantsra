<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Admin Dashboard' }} | {{ $siteSettings->site_name ?? 'Shantasra' }} Admin</title>
    @if ($siteSettings?->faviconPublicUrl())
        <link rel="icon" href="{{ $siteSettings->faviconPublicUrl() }}">
    @endif
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Abyssinica+SIL&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js"></script>
    <style>
        :root {
            --brand-50: #f5fbf1;
            --brand-100: #e5f3dc;
            --brand-200: #cae3ba;
            --brand-400: #80b25d;
            --brand-500: #628f3f;
            --brand-600: #4c7330;
            --brand-700: #3a5826;
            --brand-800: #30471f;
            --accent-500: #bf8b18;
            --accent-600: #9d6f12;
            --ink: #241b14;
            --ink-muted: #5c5348;
            --admin-bg: #fcfbf6;
            --admin-surface: #ffffff;
            --admin-surface-muted: #faf7ef;
            --admin-border: rgba(98, 143, 63, 0.14);
            --admin-border-strong: rgba(98, 143, 63, 0.22);
            --admin-shadow: 0 20px 50px rgba(62, 48, 25, 0.08);
            --admin-shadow-soft: 0 10px 28px rgba(62, 48, 25, 0.06);
            --admin-text: var(--ink);
            --admin-muted: #647056;
            --admin-brand: var(--brand-600);
            --admin-brand-soft: rgba(76, 115, 48, 0.12);
            --admin-brand-glow: rgba(76, 115, 48, 0.18);
        }

        .admin-body {
            margin: 0;
            min-height: 100vh;
            color: var(--admin-text);
            font-family: "Noto Sans", "Noto Sans Ethiopic", ui-sans-serif, system-ui, sans-serif;
            background:
                radial-gradient(circle at top left, rgba(191, 139, 24, 0.12), transparent 28%),
                radial-gradient(circle at top right, rgba(98, 143, 63, 0.12), transparent 26%),
                linear-gradient(180deg, #fcfbf6 0%, #f8f6ee 45%, #f1f5ea 100%);
            -webkit-font-smoothing: antialiased;
        }

        .admin-body h1, .admin-body h2, .admin-body h3, .admin-body h4, .admin-body h5, .admin-body h6 {
            font-family: "Abyssinica SIL", "Noto Sans Ethiopic", "Noto Sans", serif;
            color: var(--ink);
        }

        /* ——— Mobile top strip ——— */
        .admin-mobile-bar {
            position: sticky;
            top: 0;
            z-index: 1030;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.92);
            border-bottom: 1px solid var(--admin-border);
            backdrop-filter: blur(12px);
        }
        .admin-mobile-bar-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        .admin-mobile-menu-btn {
            border: 1px solid var(--admin-border-strong);
            background: var(--admin-surface);
            color: var(--brand-700);
            border-radius: 1rem;
            padding: 0.45rem 0.75rem;
            line-height: 1;
        }
        .admin-mobile-menu-btn:hover {
            background: var(--brand-50);
            border-color: var(--brand-200);
        }

        /* ——— Sidebar (desktop) ——— */
        .admin-sidebar-aside {
            position: sticky;
            top: 0;
            align-self: flex-start;
            height: 100vh;
            width: 100%;
            max-width: 17.5rem;
            border-right: 1px solid var(--admin-border);
            background: rgba(255, 255, 255, 0.78);
            backdrop-filter: blur(10px);
        }
        .admin-sidebar-inner {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 1.25rem 1rem 1.5rem;
            overflow-y: auto;
        }
        .admin-sidebar-brand {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            padding: 0.85rem 1rem;
            margin-bottom: 1.5rem;
            border-radius: 1.25rem;
            border: 1px solid var(--admin-border);
            background: linear-gradient(135deg, rgba(255,255,255,.95), var(--brand-50));
            box-shadow: var(--admin-shadow-soft);
        }
        .admin-logo-mark {
            flex-shrink: 0;
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.95rem;
            color: #fff;
            background: linear-gradient(145deg, var(--brand-600), var(--brand-800));
            box-shadow: 0 8px 20px var(--admin-brand-glow);
        }
        .admin-logo-title {
            font-family: "Abyssinica SIL", "Noto Sans Ethiopic", serif;
            font-weight: 600;
            font-size: 1.05rem;
            line-height: 1.2;
            color: var(--ink);
        }
        .admin-logo-tagline {
            font-size: 0.78rem;
            color: var(--admin-muted);
            margin-top: 0.15rem;
        }
        .admin-sidebar-caption {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: var(--admin-muted);
            margin-bottom: 0.65rem;
            padding-left: 0.35rem;
        }
        .admin-nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.7rem 1rem;
            border-radius: 1rem;
            font-weight: 500;
            font-size: 0.92rem;
            color: #3d4a32;
            text-decoration: none;
            transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .admin-nav-link i {
            width: 1.25rem;
            font-size: 1.1rem;
            color: var(--brand-600);
            opacity: 0.9;
        }
        .admin-nav-link:hover {
            background: var(--brand-50);
            color: var(--brand-800);
        }
        .admin-nav-link.active {
            background: linear-gradient(135deg, var(--brand-700), var(--brand-600));
            color: #fff;
            box-shadow: 0 10px 24px var(--admin-brand-glow);
        }
        .admin-nav-link.active i {
            color: #fff;
            opacity: 1;
        }

        /* ——— Offcanvas (mobile / tablet drawer) ——— */
        .admin-offcanvas {
            width: min(20rem, 92vw) !important;
            border-right: 1px solid var(--admin-border) !important;
            background: linear-gradient(180deg, #fff 0%, var(--brand-50) 100%) !important;
        }
        .admin-offcanvas .offcanvas-header {
            border-bottom: 1px solid var(--admin-border);
            padding: 1rem 1.25rem;
        }
        .admin-offcanvas .btn-close {
            opacity: 0.55;
        }
        .admin-offcanvas .offcanvas-body {
            padding: 1rem 1rem 1.5rem;
        }

        /* ——— Main column ——— */
        .admin-main-col {
            min-width: 0;
            flex: 1 1 auto;
        }
        .admin-main {
            padding: 1rem 1rem 0;
        }
        @media (min-width: 768px) {
            .admin-main {
                padding: 1.5rem 1.75rem 0;
            }
        }
        @media (min-width: 1200px) {
            .admin-main {
                padding: 1.75rem 2rem 0;
            }
        }

        /* ——— Top bar / page header ——— */
        .admin-topbar {
            position: sticky;
            top: 0;
            z-index: 1020;
            margin-left: -0.25rem;
            margin-right: -0.25rem;
            padding: 0.65rem 0.75rem;
            margin-bottom: 1rem !important;
            border-radius: 1.25rem;
            border: 1px solid var(--admin-border);
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(12px);
            box-shadow: var(--admin-shadow-soft);
        }
        @media (min-width: 768px) {
            .admin-topbar {
                padding: 1rem 1.25rem;
            }
        }
        .admin-topbar-inner {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        @media (min-width: 768px) {
            .admin-topbar-inner {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
        }
        .admin-page-title {
            font-size: clamp(1.25rem, 2.5vw, 1.5rem);
            font-weight: 600;
            letter-spacing: -0.02em;
        }
        .admin-page-subtitle {
            color: var(--admin-muted);
            font-size: 0.92rem;
            max-width: 42rem;
            line-height: 1.45;
        }
        .admin-user-trigger {
            border: 1px solid var(--admin-border-strong);
            background: var(--admin-surface);
            border-radius: 1rem;
            padding: 0.4rem 0.65rem 0.4rem 0.5rem;
            width: 100%;
        }
        @media (min-width: 768px) {
            .admin-user-trigger {
                width: auto;
                min-width: 12rem;
            }
        }
        .admin-user-trigger::after {
            display: none;
        }
        .admin-user-trigger:hover,
        .admin-user-trigger:focus {
            border-color: var(--brand-200);
            background: var(--brand-50);
        }
        .admin-avatar {
            width: 40px;
            height: 40px;
            border-radius: 999px;
            object-fit: cover;
        }
        .admin-avatar.d-flex {
            background: linear-gradient(145deg, var(--brand-600), var(--brand-800)) !important;
            border: none !important;
        }
        .admin-menu-name {
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--ink);
            line-height: 1.15;
        }
        .admin-menu-meta {
            color: var(--admin-muted);
            font-size: 0.78rem;
        }
        .admin-chevron {
            color: var(--admin-muted);
            font-size: 0.85rem;
            margin-left: auto;
        }
        .text-brand-icon {
            color: var(--brand-600);
        }
        .admin-dropdown {
            border-radius: 1rem !important;
            padding: 0.35rem !important;
            border: 1px solid var(--admin-border) !important;
            min-width: 12rem;
        }
        .admin-dropdown .dropdown-item {
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
        }
        .admin-dropdown .dropdown-item:active {
            background: var(--brand-50);
            color: var(--brand-800);
        }

        /* ——— Footer ——— */
        .admin-footer {
            padding: 1.25rem 0 1.5rem;
            margin-top: 2rem;
            border-top: 1px solid var(--admin-border);
        }
        .admin-footer-inner {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 0.35rem 0.65rem;
            font-size: 0.82rem;
            color: var(--admin-muted);
        }
        @media (min-width: 576px) {
            .admin-footer-inner {
                justify-content: flex-start;
            }
        }
        .admin-footer-brand {
            font-weight: 700;
            color: var(--brand-700);
            font-family: "Abyssinica SIL", "Noto Sans Ethiopic", serif;
        }
        .admin-footer-dot {
            opacity: 0.45;
        }
        .admin-footer-link {
            color: var(--brand-600);
            font-weight: 600;
            text-decoration: none;
        }
        .admin-footer-link:hover {
            color: var(--brand-800);
            text-decoration: underline;
        }

        /* ——— Legacy cards & tables (brand-tinted) ——— */
        .stat-card,
        .content-card {
            border: 1px solid var(--admin-border);
            border-radius: 1.25rem;
            box-shadow: var(--admin-shadow-soft);
            background: var(--admin-surface);
        }
        .stat-card { overflow: hidden; }
        .dashboard-header {
            background:
                linear-gradient(135deg, rgba(76, 115, 48, 0.07), rgba(191, 139, 24, 0.05)),
                var(--admin-surface);
            border: 1px solid var(--admin-border);
            border-radius: 1.25rem;
            box-shadow: var(--admin-shadow-soft);
        }
        .page-eyebrow {
            color: var(--admin-brand);
            font-size: 0.74rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            margin-bottom: 0.5rem;
        }
        .page-subtitle {
            color: var(--admin-muted);
            max-width: 48rem;
        }
        .admin-table {
            --bs-table-bg: transparent;
            --bs-table-border-color: var(--admin-border);
            margin-bottom: 0;
        }
        .admin-table thead th {
            white-space: nowrap;
            font-size: 0.76rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--admin-muted);
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .admin-table tbody td {
            vertical-align: middle;
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .admin-table tbody tr:hover {
            background: rgba(245, 251, 241, 0.85);
        }
        .filter-card {
            border: 1px solid var(--admin-border);
            border-radius: 1.25rem;
            background: linear-gradient(180deg, rgba(250, 247, 239, 0.95), #fff);
        }
        .filter-title {
            color: var(--admin-text);
            font-weight: 600;
        }
        .form-control,
        .form-select {
            border-radius: 0.95rem;
            border-color: rgba(98, 143, 63, 0.22);
            min-height: 2.9rem;
            box-shadow: none !important;
        }
        .form-control:focus,
        .form-select:focus {
            border-color: rgba(76, 115, 48, 0.45);
            box-shadow: 0 0 0 0.25rem rgba(76, 115, 48, 0.12) !important;
        }
        .metric-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            background: var(--admin-brand-soft);
            color: var(--admin-brand);
        }
        .detail-card {
            border: 1px solid var(--admin-border);
            border-radius: 1rem;
            background: linear-gradient(180deg, #fff, #faf7ef);
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 600;
            padding: 0.45rem 0.8rem;
        }
        .panel-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.25rem;
        }
        .panel-heading h5,
        .panel-heading h6 {
            margin-bottom: 0.2rem;
        }
        .panel-heading p {
            margin-bottom: 0;
            color: var(--admin-muted);
            font-size: 0.92rem;
        }
        .pagination {
            margin-bottom: 0;
        }
        .page-summary-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .summary-tile {
            border: 1px solid var(--admin-border);
            border-radius: 1.2rem;
            background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(250, 247, 239, 0.95));
            padding: 1.1rem 1.15rem;
            box-shadow: var(--admin-shadow-soft);
        }
        .summary-tile-label {
            color: var(--admin-muted);
            font-size: 0.76rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 0.55rem;
        }
        .summary-tile-value {
            font-size: 1.7rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.4rem;
        }
        .summary-tile-note {
            color: var(--admin-muted);
            font-size: 0.88rem;
            margin-bottom: 0;
        }
        .listing-table td:first-child,
        .listing-table th:first-child {
            padding-left: 0.2rem;
        }
        .table-person {
            display: flex;
            align-items: center;
            gap: 0.9rem;
        }
        .table-person-avatar {
            width: 2.9rem;
            height: 2.9rem;
            border-radius: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--admin-brand-soft);
            color: var(--admin-brand);
            font-weight: 700;
            flex-shrink: 0;
        }
        .table-person-name {
            font-weight: 600;
            color: var(--admin-text);
            margin-bottom: 0.15rem;
        }
        .table-person-meta,
        .table-muted {
            color: var(--admin-muted);
            font-size: 0.84rem;
        }
        .route-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            border: 1px solid var(--admin-border);
            border-radius: 999px;
            padding: 0.45rem 0.85rem;
            background: rgba(250, 247, 239, 0.9);
            font-weight: 600;
            white-space: nowrap;
        }
        .route-pill i {
            color: var(--admin-brand);
        }
        .listing-kicker {
            color: var(--admin-muted);
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 0.4rem;
        }
        .listing-metric {
            font-weight: 700;
            font-size: 1rem;
            color: var(--admin-text);
        }
        .listing-mobile-card {
            border: 1px solid var(--admin-border);
            border-radius: 1.2rem;
            background: linear-gradient(180deg, #fff, #faf7ef);
            box-shadow: var(--admin-shadow-soft);
        }
        .listing-mobile-card + .listing-mobile-card {
            margin-top: 1rem;
        }
        .listing-mobile-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.85rem;
        }
        .listing-mobile-item {
            border: 1px solid rgba(98, 143, 63, 0.12);
            border-radius: 1rem;
            background: rgba(250, 247, 239, 0.72);
            padding: 0.85rem 0.9rem;
        }
        .listing-mobile-label {
            color: var(--admin-muted);
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 0.35rem;
        }
        .listing-mobile-value {
            color: var(--admin-text);
            font-weight: 600;
            line-height: 1.35;
        }
        .listing-mobile-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
        }
        .listing-mobile-subtitle {
            color: var(--admin-muted);
            font-size: 0.9rem;
            margin-bottom: 0;
        }
        .listing-mobile-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.85rem;
        }
        .note-editor.note-frame {
            border: 1px solid var(--admin-border);
            border-radius: 1rem;
            overflow: hidden;
        }
        .note-editor.note-frame .note-toolbar {
            background: var(--brand-50);
            border-bottom: 1px solid var(--admin-border);
        }
        .note-editor.note-frame .note-editing-area .note-editable {
            background: #fff;
            color: var(--admin-text);
            padding: 1rem 1.1rem;
        }
        .summernote-content img {
            max-width: 100%;
            height: auto;
            border-radius: 1rem;
            margin: 1rem 0;
        }
        .summernote-content p:last-child {
            margin-bottom: 0;
        }

        .btn-primary {
            --bs-btn-bg: var(--brand-700);
            --bs-btn-border-color: var(--brand-700);
            --bs-btn-hover-bg: var(--brand-800);
            --bs-btn-hover-border-color: var(--brand-800);
            --bs-btn-active-bg: var(--brand-800);
            --bs-btn-active-border-color: var(--brand-800);
            border-radius: 1rem;
            font-weight: 600;
        }
        .btn-outline-primary {
            --bs-btn-color: var(--brand-700);
            --bs-btn-border-color: rgba(76, 115, 48, 0.45);
            --bs-btn-hover-bg: var(--brand-50);
            --bs-btn-hover-border-color: var(--brand-600);
            border-radius: 1rem;
        }

        .content-wrap {
            padding-left: 0 !important;
            padding-right: 0 !important;
        }

        .admin-sidebar-wrap {
            border-right: 1px solid var(--admin-border);
        }

        .alert-admin-success {
            background: var(--brand-50) !important;
            color: var(--brand-800) !important;
            border: 1px solid var(--admin-border) !important;
        }

        @media (max-width: 767.98px) {
            .page-summary-grid {
                grid-template-columns: 1fr;
                gap: 0.85rem;
            }
            .summary-tile-value {
                font-size: 1.45rem;
            }
            .listing-mobile-grid {
                grid-template-columns: 1fr;
            }
            .listing-mobile-header,
            .listing-mobile-actions {
                flex-direction: column;
                align-items: stretch;
            }
            .table-responsive table {
                min-width: 640px;
            }
        }
    </style>
</head>
<body class="admin-body">
    <div class="admin-mobile-bar d-lg-none">
        <div class="admin-mobile-bar-inner">
            <div class="d-flex align-items-center gap-3 min-w-0">
                @if ($siteSettings?->logoPublicUrl())
                    <img src="{{ $siteSettings->logoPublicUrl() }}" alt="{{ $siteSettings->site_name }}" style="height: 38px; max-width: 100px; object-fit: contain;" class="rounded-2 flex-shrink-0">
                @else
                    <div class="admin-logo-mark flex-shrink-0">{{ strtoupper(substr($siteSettings->site_name ?? 'PB', 0, 2)) }}</div>
                @endif
                <div class="min-w-0">
                    <div class="admin-logo-title text-truncate">{{ $siteSettings->site_name ?? 'Shantasra' }}</div>
                    <div class="admin-logo-tagline text-truncate">Admin · {{ $siteSettings->site_tagline ?? 'UAE to Ethiopia' }}</div>
                </div>
            </div>
            <button class="admin-mobile-menu-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminSidebar" aria-controls="adminSidebar" aria-label="Open menu">
                <i class="bi bi-list fs-5"></i>
            </button>
        </div>
    </div>

    <div class="offcanvas offcanvas-start admin-offcanvas d-lg-none" tabindex="-1" id="adminSidebar" aria-labelledby="adminSidebarLabel">
        <div class="offcanvas-header">
            <div class="d-flex align-items-center gap-3">
                @if ($siteSettings?->logoPublicUrl())
                    <img src="{{ $siteSettings->logoPublicUrl() }}" alt="{{ $siteSettings->site_name }}" style="height: 36px; max-width: 90px; object-fit: contain;" class="rounded-2 flex-shrink-0">
                @else
                    <div class="admin-logo-mark">{{ strtoupper(substr($siteSettings->site_name ?? 'PB', 0, 2)) }}</div>
                @endif
                <div>
                    <h2 class="h5 mb-0" id="adminSidebarLabel">{{ $siteSettings->site_name ?? 'Shantasra' }}</h2>
                    <p class="small text-muted mb-0">Admin console</p>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body pt-0">
            @include('admin.partials.sidebar')
        </div>
    </div>

    <div class="container-fluid px-0">
        <div class="row g-0 flex-lg-nowrap min-vh-100 admin-row">
            <div class="col-auto d-none d-lg-block p-0 admin-sidebar-wrap">
                <aside class="admin-sidebar-aside">
                    <div class="admin-sidebar-inner">
                        <div class="admin-sidebar-brand">
                            @if ($siteSettings?->logoPublicUrl())
                                <img src="{{ $siteSettings->logoPublicUrl() }}" alt="{{ $siteSettings->site_name }}" style="height: 42px; max-width: 110px; object-fit: contain;" class="rounded-2 flex-shrink-0">
                            @else
                                <div class="admin-logo-mark">{{ strtoupper(substr($siteSettings->site_name ?? 'PB', 0, 2)) }}</div>
                            @endif
                            <div class="min-w-0">
                                <div class="admin-logo-title text-truncate">{{ $siteSettings->site_name ?? 'Shantasra' }}</div>
                                <div class="admin-logo-tagline text-truncate">Admin · {{ $siteSettings->site_tagline ?? 'UAE to Ethiopia' }}</div>
                            </div>
                        </div>
                        @include('admin.partials.sidebar')
                    </div>
                </aside>
            </div>

            <div class="col admin-main-col d-flex flex-column min-vh-100 min-w-0">
                <div class="admin-main flex-grow-1 d-flex flex-column content-wrap m-4">
                    @include('admin.partials.topbar')

                    @if (session('success'))
                        <div class="alert alert-success alert-admin-success border-0 shadow-sm rounded-4" role="alert">
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    @endif

                    @if (session('error'))
                        <div class="alert alert-danger border-0 shadow-sm rounded-4" role="alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    @endif

                    <div class="flex-grow-1">
                        @yield('content')
                    </div>

                    @include('admin.partials.footer')
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
    <script>
        $('#summernote').summernote({
          placeholder: 'Hello stand alone ui',
          tabsize: 2,
          height: 120,
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
          ]
        });
      </script>
</body>
</html>
