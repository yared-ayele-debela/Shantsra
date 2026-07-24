@php($pageHeading = 'User Management')
@php($title = 'Users')
@php($pageEyebrow = 'Community Directory')
@php($pageSubtitle = 'Review registered users, filter by role or status, and take action quickly.')
@extends('layouts.admin')

@section('content')
<div class="card filter-card mb-4">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1 filter-title">Filter Users</h5>
                <p>Narrow the user list by keyword, account role, or lifecycle status.</p>
            </div>
        </div>
        <form method="GET" class="row g-3">
            <div class="col-12 col-md-4">
                <input type="text" name="search" value="{{ request('search') }}" class="form-control" placeholder="Search by name, email, phone">
            </div>
            <div class="col-6 col-md-3">
                <select name="role" class="form-select">
                    <option value="">All roles</option>
                    <option value="sender" @selected(request('role') === 'sender')>Sender</option>
                    <option value="traveler" @selected(request('role') === 'traveler')>Traveler</option>
                </select>
            </div>
            <div class="col-6 col-md-3">
                <select name="status" class="form-select">
                    <option value="">All statuses</option>
                    <option value="active" @selected(request('status') === 'active')>Active</option>
                    <option value="inactive" @selected(request('status') === 'inactive')>Inactive</option>
                </select>
            </div>
            <div class="col-12 col-md-2">
                <button class="btn btn-dark w-100">Apply Filters</button>
            </div>
        </form>
    </div>
</div>

<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading">
            <div>
                <h5 class="mb-1">Registered Users</h5>
                <p>{{ $users->total() }} user accounts currently match your filters.</p>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table admin-table align-middle">
                <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th class="text-end">Actions</th></tr>
                </thead>
                <tbody>
                @forelse($users as $user)
                    <tr>
                        <td>
                            <div class="fw-semibold">{{ $user->name }}</div>
                            <div class="small text-muted">{{ $user->phone ?: 'No phone provided' }}</div>
                        </td>
                        <td>{{ $user->email }}</td>
                        <td><span class="status-badge bg-info-subtle text-info-emphasis">{{ ucfirst($user->role) }}</span></td>
                        <td>
                            <span class="status-badge {{ $user->status === 'active' ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis' }}">
                                {{ ucfirst($user->status) }}
                            </span>
                        </td>
                        <td class="text-end">
                            <div class="d-flex flex-column flex-md-row gap-2 justify-content-end">
                                <a href="{{ route('admin.users.show', $user) }}" class="btn btn-sm btn-outline-primary">View Profile</a>
                                <form method="POST" action="{{ route('admin.users.toggle-status', $user) }}" class="d-inline">
                                    @csrf
                                    @method('PATCH')
                                    <button class="btn btn-sm btn-outline-dark w-100">{{ $user->status === 'active' ? 'Deactivate' : 'Activate' }}</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="text-muted">No users found.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">
            {{ $users->links() }}
        </div>
    </div>
</div>
@endsection
