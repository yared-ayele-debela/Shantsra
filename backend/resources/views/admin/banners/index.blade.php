@php($pageHeading = 'Frontend Banners')
@php($title = 'Frontend Banners')
@php($pageEyebrow = 'Marketing & Announcements')
@php($pageSubtitle = 'Create responsive announcements, promotions, and route highlights for the frontend.')
@extends('layouts.admin')

@section('content')
<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading align-items-center">
            <div>
                <h5 class="mb-1">Frontend Banners</h5>
                <p>Schedule and place banners without changing frontend code.</p>
            </div>
            <button type="button" class="btn btn-primary px-3" data-bs-toggle="modal" data-bs-target="#createBannerModal">
                <i class="bi bi-plus-lg me-1"></i> Add Banner
            </button>
        </div>

        <div class="table-responsive">
            <table class="table admin-table listing-table align-middle mb-0">
                <thead>
                    <tr>
                        <th>Banner</th>
                        <th>Placement</th>
                        <th>Status</th>
                        <th>Schedule</th>
                        <th>Order</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                @forelse ($banners as $banner)
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-3">
                                @if($banner->imageUrl())
                                    <img src="{{ $banner->imageUrl() }}" alt="" style="width:64px;height:42px;object-fit:cover;border-radius:8px;">
                                @else
                                    <span class="d-inline-flex align-items-center justify-content-center bg-light text-muted" style="width:64px;height:42px;border-radius:8px;"><i class="bi bi-megaphone"></i></span>
                                @endif
                                <div>
                                    <div class="fw-semibold">{{ $banner->title }}</div>
                                    @if($banner->badge)<small class="text-muted">{{ $banner->badge }}</small>@endif
                                </div>
                            </div>
                        </td>
                        <td><span class="badge text-bg-light text-capitalize">{{ $banner->placement }}</span></td>
                        <td><span class="badge rounded-pill {{ $banner->is_active ? 'text-bg-success' : 'text-bg-secondary' }}">{{ $banner->is_active ? 'Active' : 'Inactive' }}</span></td>
                        <td class="text-muted small">
                            {{ $banner->start_date?->format('M d, Y') ?? 'Now' }} –
                            {{ $banner->end_date?->format('M d, Y') ?? 'No end' }}
                        </td>
                        <td>{{ $banner->sort_order }}</td>
                        <td class="text-end text-nowrap">
                            <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editBannerModal-{{ $banner->id }}">Edit</button>
                            <form method="post" action="{{ route('admin.banners.destroy', $banner) }}" class="d-inline" onsubmit="return confirm('Delete this banner?');">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="py-5 text-center text-muted">No banners yet. Add your first announcement.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-4">{{ $banners->links() }}</div>
    </div>
</div>

@include('admin.banners.partials.modal', ['banner' => null, 'modalId' => 'createBannerModal', 'title' => 'Add Banner', 'method' => 'POST', 'action' => route('admin.banners.store')])
@foreach($banners as $banner)
    @include('admin.banners.partials.modal', ['banner' => $banner, 'modalId' => 'editBannerModal-'.$banner->id, 'title' => 'Edit Banner', 'method' => 'PUT', 'action' => route('admin.banners.update', $banner)])
@endforeach
@endsection
