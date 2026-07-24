@php($pageHeading = 'Subscription Packages')
@php($title = 'Subscription Packages')
@php($pageEyebrow = 'Subscription Management')
@php($pageSubtitle = 'Create and maintain the packages that control user posting limits.')
@extends('layouts.admin')

@section('content')
<div class="card content-card mb-4">
    <div class="card-body p-4 p-lg-5">
        <div class="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
            <div>
                <h4 class="mb-2">Subscription Packages</h4>
                <p class="mb-0 text-muted">Manage the plans that let users post 10, 30, or 50 packages with monthly and yearly limits.</p>
            </div>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createPlanModal">
                <i class="bi bi-plus-lg me-1"></i> Add Package
            </button>
        </div>
    </div>
</div>

<div class="card content-card">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table admin-table align-middle mb-0">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Limits</th>
                    <th>Pricing</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                </tr>
                </thead>
                <tbody>
                @forelse($plans as $plan)
                    <tr>
                        <td>
                            <div class="fw-semibold">{{ $plan->name }}</div>
                            <div class="text-muted small">{{ $plan->description ? \Illuminate\Support\Str::limit($plan->description, 90) : 'No description added.' }}</div>
                        </td>
                        <td>
                            <div class="fw-semibold">{{ $plan->monthly_post_limit }} posts / month</div>
                            <div class="text-muted small">{{ $plan->yearly_post_limit }} posts / year</div>
                        </td>
                        <td>
                            <div class="fw-semibold">{{ $plan->monthly_price !== null ? '$'.number_format((float) $plan->monthly_price, 2).' / month' : 'Not set' }}</div>
                            <div class="text-muted small">{{ $plan->yearly_price !== null ? '$'.number_format((float) $plan->yearly_price, 2).' / year' : 'Not set' }}</div>
                        </td>
                        <td>
                            <span class="status-badge {{ $plan->is_active ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis' }}">
                                {{ $plan->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="text-end">
                            <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editPlanModal-{{ $plan->id }}">
                                Edit
                            </button>
                            <form method="post" action="{{ route('admin.subscription-plans.destroy', $plan) }}" class="d-inline" onsubmit="return confirm('Delete this subscription package? This cannot be undone.');">
                                @csrf
                                @method('delete')
                                <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="text-center text-muted py-5">
                            No subscription packages yet. Create the first plan to begin.
                        </td>
                    </tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($plans->hasPages())
        <div class="card-footer bg-transparent border-0 px-4 pb-4">
            {{ $plans->links() }}
        </div>
    @endif
</div>

<div class="modal fade" id="createPlanModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <form method="post" action="{{ route('admin.subscription-plans.store') }}" class="modal-content">
            @csrf
            <input type="hidden" name="plan_modal" value="create">
            <div class="modal-header">
                <h5 class="modal-title">Create Subscription Package</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                @include('admin.subscription-plans.partials.form', ['plan' => null])
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Package</button>
            </div>
        </form>
    </div>
</div>

@foreach($plans as $plan)
    <div class="modal fade" id="editPlanModal-{{ $plan->id }}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <form method="post" action="{{ route('admin.subscription-plans.update', $plan) }}" class="modal-content">
                @csrf
                @method('put')
                <input type="hidden" name="plan_modal" value="edit-{{ $plan->id }}">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Subscription Package</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    @include('admin.subscription-plans.partials.form', ['plan' => $plan])
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Package</button>
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
        const modalKey = @json(old('plan_modal'));
        const modalId = modalKey === 'create'
            ? 'createPlanModal'
            : modalKey && modalKey.startsWith('edit-')
                ? 'editPlanModal-' + modalKey.replace('edit-', '')
                : 'createPlanModal';

        const modal = document.getElementById(modalId);
        if (modal) {
            new bootstrap.Modal(modal).show();
        }
    });
</script>
@endif
@endpush
