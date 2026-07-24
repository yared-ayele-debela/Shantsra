<div class="admin-topbar mb-4">
    <div class="admin-topbar-inner">
        <div class="admin-topbar-titles">
            <h1 class="admin-page-title mb-1">{{ $pageHeading ?? 'Dashboard' }}</h1>
            <p class="admin-page-subtitle mb-0">{{ $pageSubtitle ?? 'Manage users, shipments, travels, bookings, and reviews.' }}</p>
        </div>
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
