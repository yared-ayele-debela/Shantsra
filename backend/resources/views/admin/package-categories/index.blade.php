@php($pageHeading = 'Package Categories')
@php($title = 'Package Categories')
@php($pageEyebrow = 'Delivery Configuration')
@php($pageSubtitle = 'Create and maintain the categories available for packages.')
@extends('layouts.admin')

@section('content')
<div class="card content-card">
    <div class="card-body p-4">
        <div class="panel-heading align-items-center">
            <div>
                <h5 class="mb-1">Package Categories</h5>
                <p>Organize package types and control which ones are available.</p>
            </div>
            <button type="button" class="btn btn-primary px-3" data-bs-toggle="modal" data-bs-target="#createCategoryModal">
                <i class="bi bi-plus-lg me-1"></i> Add Category
            </button>
        </div>

        <div class="table-responsive">
            <table class="table admin-table listing-table align-middle mb-0">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                @forelse ($categories as $category)
                    <tr>
                        <td>
                            <div class="fw-semibold">{{ $category->name }}</div>
                        </td>
                        <td class="text-muted">{{ $category->description ? \Illuminate\Support\Str::limit($category->description, 100) : '—' }}</td>
                        <td>
                            <span class="badge rounded-pill {{ $category->is_active ? 'text-bg-success' : 'text-bg-secondary' }}">
                                {{ $category->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="text-muted">{{ $category->created_at->format('M d, Y') }}</td>
                        <td class="text-end text-nowrap">
                            <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editCategoryModal-{{ $category->id }}">
                                Edit
                            </button>
                            <form method="post" action="{{ route('admin.package-categories.destroy', $category) }}" class="d-inline" onsubmit="return confirm('Delete this package category? This cannot be undone.');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="py-5 text-center text-muted">
                            No package categories yet. Add your first category to get started.
                        </td>
                    </tr>
                @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-4">{{ $categories->links() }}</div>
    </div>
</div>

<div class="modal fade" id="createCategoryModal" tabindex="-1" aria-labelledby="createCategoryModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form method="post" action="{{ route('admin.package-categories.store') }}" class="modal-content">
            @csrf
            <input type="hidden" name="category_modal" value="create">
            <div class="modal-header">
                <h5 class="modal-title" id="createCategoryModalLabel">Add Package Category</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                @include('admin.package-categories.partials.form', ['category' => null])
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Category</button>
            </div>
        </form>
    </div>
</div>

@foreach ($categories as $category)
    <div class="modal fade" id="editCategoryModal-{{ $category->id }}" tabindex="-1" aria-labelledby="editCategoryModalLabel-{{ $category->id }}" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <form method="post" action="{{ route('admin.package-categories.update', $category) }}" class="modal-content">
                @csrf
                @method('PUT')
                <input type="hidden" name="category_modal" value="edit-{{ $category->id }}">
                <div class="modal-header">
                    <h5 class="modal-title" id="editCategoryModalLabel-{{ $category->id }}">Edit Package Category</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    @include('admin.package-categories.partials.form', ['category' => $category])
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
@endforeach
@endsection

@push('scripts')
@if ($errors->any())
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const modalId = @json(old('category_modal') === 'create' ? 'createCategoryModal' : 'editCategoryModal-'.str(old('category_modal'))->after('edit-'));
        const modal = document.getElementById(modalId);

        if (modal) {
            new bootstrap.Modal(modal).show();
        }
    });
</script>
@endif
@endpush
