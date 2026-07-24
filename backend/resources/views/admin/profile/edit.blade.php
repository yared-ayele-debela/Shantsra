@php($pageHeading = 'Admin Profile')
@php($title = 'Profile')
@php($pageEyebrow = 'Account Settings')
@php($pageSubtitle = 'Manage your account information, profile photo, and password from one place.')
@extends('layouts.admin')

@section('content')
<div class="row g-4">
    <div class="col-lg-4">
        <div class="card content-card">
            <div class="card-body text-center p-4">
                @if ($admin->profilePhotoUrl())
                    <img src="{{ $admin->profilePhotoUrl() }}" alt="Admin profile photo" class="rounded-circle border mb-3" style="width: 120px; height: 120px; object-fit: cover;">
                @else
                    <div class="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center mb-3" style="width: 120px; height: 120px; font-size: 2rem; font-weight: 700;">
                        {{ strtoupper(substr($admin->name, 0, 1)) }}
                    </div>
                @endif
                <h5 class="mb-1">{{ $admin->name }}</h5>
                <p class="text-muted mb-0">{{ $admin->email }}</p>
                <div class="mt-4 row g-3 text-start">
                    <div class="col-12">
                        <div class="detail-card p-3">
                            <div class="text-muted small mb-1">Phone</div>
                            <div class="fw-semibold">{{ $admin->phone ?: 'Not added yet' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card content-card">
            <div class="card-body p-4">
                <div class="panel-heading">
                    <div>
                        <h5 class="mb-1">Update Profile</h5>
                        <p>Refresh your profile information and keep your admin credentials secure.</p>
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

                <form method="POST" action="{{ route('admin.profile.update') }}" enctype="multipart/form-data">
                    @csrf
                    @method('PATCH')

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="name" class="form-control" value="{{ old('name', $admin->name) }}" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control" value="{{ old('email', $admin->email) }}" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Phone</label>
                            <input type="text" name="phone" class="form-control" value="{{ old('phone', $admin->phone) }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Profile Photo</label>
                            <input type="file" name="profile_photo" class="form-control" accept="image/*">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">New Password</label>
                            <input type="password" name="password" class="form-control" placeholder="Leave blank to keep current">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Confirm Password</label>
                            <input type="password" name="password_confirmation" class="form-control">
                        </div>
                    </div>

                    <div class="mt-4">
                        <button class="btn btn-dark px-4">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
