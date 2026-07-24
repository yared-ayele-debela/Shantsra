<div class="admin-sidebar-caption">Main navigation</div>
<nav class="nav flex-column gap-1 admin-sidebar-nav">
    <a href="{{ route('admin.dashboard') }}" class="admin-nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
        <i class="bi bi-speedometer2"></i>
        <span>Dashboard</span>
    </a>
    <a href="{{ route('admin.users.index') }}" class="admin-nav-link {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
        <i class="bi bi-people"></i>
        <span>Users</span>
    </a>
    <a href="{{ route('admin.shipments.index') }}" class="admin-nav-link {{ request()->routeIs('admin.shipments.*') ? 'active' : '' }}">
        <i class="bi bi-box-seam"></i>
        <span>Shipments</span>
    </a>
    <a href="{{ route('admin.package-categories.index') }}" class="admin-nav-link {{ request()->routeIs('admin.package-categories.*') ? 'active' : '' }}">
        <i class="bi bi-tags"></i>
        <span>Package Categories</span>
    </a>
    <a href="{{ route('admin.subscription-plans.index') }}" class="admin-nav-link {{ request()->routeIs('admin.subscription-plans.*') ? 'active' : '' }}">
        <i class="bi bi-credit-card-2-front"></i>
        <span>Subscription Packages</span>
    </a>
    <a href="{{ route('admin.travels.index') }}" class="admin-nav-link {{ request()->routeIs('admin.travels.*') ? 'active' : '' }}">
        <i class="bi bi-airplane"></i>
        <span>Travels</span>
    </a>
    <a href="{{ route('admin.bookings.index') }}" class="admin-nav-link {{ request()->routeIs('admin.bookings.*') ? 'active' : '' }}">
        <i class="bi bi-journal-check"></i>
        <span>Bookings</span>
    </a>
    <a href="{{ route('admin.campaigns.index') }}" class="admin-nav-link {{ request()->routeIs('admin.campaigns.*') ? 'active' : '' }}">
        <i class="bi bi-megaphone"></i>
        <span>Campaigns</span>
    </a>
    <a href="{{ route('admin.reviews.index') }}" class="admin-nav-link {{ request()->routeIs('admin.reviews.*') ? 'active' : '' }}">
        <i class="bi bi-star"></i>
        <span>Reviews</span>
    </a>
    <div class="admin-sidebar-caption mt-4">Configuration</div>
    <a href="{{ route('admin.settings.website.edit') }}" class="admin-nav-link {{ request()->routeIs('admin.settings.*') ? 'active' : '' }}">
        <i class="bi bi-globe2"></i>
        <span>Website</span>
    </a>
</nav>
