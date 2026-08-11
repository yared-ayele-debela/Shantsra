@php
    $unreadAdminNotifications = \App\Models\AdminNotification::with(['user', 'shipment'])->unread()->latest()->take(6)->get();
    $topbarUnreadCount = \App\Models\AdminNotification::unread()->count();
@endphp
<div class="admin-topbar mb-4">
    <div class="admin-topbar-inner">
        <div class="admin-topbar-titles">
            <h1 class="admin-page-title mb-1">{{ $pageHeading ?? 'Dashboard' }}</h1>
            <p class="admin-page-subtitle mb-0">{{ $pageSubtitle ?? 'Manage users, shipments, travels, bookings, and reviews.' }}</p>
        </div>

        <div class="d-flex align-items-center gap-2.5">
            <!-- Notifications Bell Dropdown -->
            <div class="dropdown px-2">
                <button class="btn btn-light position-relative border rounded-circle p-0 d-flex align-items-center justify-content-center shadow-xs"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        aria-label="Admin Notifications"
                        style="width: 44px; height: 44px;">
                    <i class="bi bi-bell fs-5 text-dark"></i>
                    @if($topbarUnreadCount > 0)
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style="font-size: 0.7rem;">
                            {{ $topbarUnreadCount > 9 ? '9+' : $topbarUnreadCount }}
                        </span>
                    @endif
                </button>
                <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-0 rounded-4" style="width: 350px; max-width: 90vw;">
                    <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light-subtle rounded-top-4">
                        <div class="fw-bold text-dark flex-grow-1">New Package Notifications</div>
                        @if($topbarUnreadCount > 0)
                            <form method="POST" action="{{ route('admin.notifications.mark-all-read') }}" class="m-0">
                                @csrf
                                <button type="submit" class="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold small">Mark all read</button>
                            </form>
                        @endif
                    </div>

                    <div class="list-group list-group-flush overflow-auto" style="max-height: 320px;">
                        @forelse($unreadAdminNotifications as $notif)
                            <form method="POST" action="{{ route('admin.notifications.read', $notif) }}" class="m-0 border-bottom">
                                @csrf
                                @method('PATCH')
                                <button type="submit" class="list-group-item list-group-item-action p-3 text-start border-0 bg-transparent">
                                    <div class="d-flex gap-2.5">
                                        <div class="rounded-circle bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5" style="width: 34px; height: 34px;">
                                            <i class="bi bi-box-seam fs-6"></i>
                                        </div>
                                        <div class="min-w-0 flex-grow-1">
                                            <div class="fw-bold small text-dark truncate mb-0.5">{{ $notif->title }}</div>
                                            <div class="text-muted small leading-tight mb-1" style="font-size: 0.82rem;">{{ $notif->message }}</div>
                                            <div class="text-muted" style="font-size: 0.72rem;">{{ $notif->created_at->diffForHumans() }}</div>
                                        </div>
                                    </div>
                                </button>
                            </form>
                        @empty
                            <div class="p-4 text-center text-muted small">
                                <i class="bi bi-bell-slash fs-4 d-block mb-1 text-muted"></i>
                                No unread package notifications.
                            </div>
                        @endforelse
                    </div>

                    <div class="p-2.5 text-center border-top bg-light-subtle rounded-bottom-4">
                        <a href="{{ route('admin.notifications.index') }}" class="text-decoration-none fw-bold small text-primary">
                            View All Notifications <i class="bi bi-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Admin User Profile Menu -->
            <div class="dropdown admin-user-menu">
                <button class="admin-user-trigger dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Account menu">
                    <div class="d-flex align-items-center gap-2 text-start">
                        @if (auth('admin')->user()?->profilePhotoUrl())
                            <img src="{{ auth('admin')->user()?->profilePhotoUrl() }}" alt="" class="admin-avatar border">
                        @else
                            <div class="admin-avatar d-flex align-items-center justify-content-center text-white fw-semibold">
                                {{ strtoupper(substr(auth('admin')->user()?->name ?? 'A', 0, 1)) }}
                            </div>
                        @endif
                        <div class="d-none d-sm-block min-w-0">
                            <div class="admin-menu-name text-truncate">{{ auth('admin')->user()?->name }}</div>
                            <div class="admin-menu-meta">Administrator</div>
                        </div>
                        <i class="bi bi-chevron-down admin-chevron"></i>
                    </div>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 py-2 admin-dropdown">
                    <li>
                        <a class="dropdown-item rounded-2 mx-1" href="{{ route('admin.dashboard') }}">
                            <i class="bi bi-speedometer2 me-2 text-brand-icon"></i>Dashboard
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item rounded-2 mx-1" href="{{ route('admin.notifications.index') }}">
                            <i class="bi bi-bell me-2 text-brand-icon"></i>Notifications
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item rounded-2 mx-1" href="{{ route('admin.profile.edit') }}">
                            <i class="bi bi-person-circle me-2 text-brand-icon"></i>Profile
                        </a>
                    </li>
                    <li><hr class="dropdown-divider my-2"></li>
                    <li>
                        <form method="POST" action="{{ route('admin.logout') }}">
                            @csrf
                            <button type="submit" class="dropdown-item rounded-2 mx-1 text-danger">
                                <i class="bi bi-box-arrow-right me-2"></i>Log out
                            </button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
