@php($plan = $plan ?? null)

<div class="row g-3">
    <div class="col-md-6">
        <label for="plan-name-{{ $plan?->id ?? 'new' }}" class="form-label">Package Name</label>
        <input id="plan-name-{{ $plan?->id ?? 'new' }}" type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', $plan?->name) }}" placeholder="Starter">
        @error('name')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    <div class="col-md-6">
        <label for="plan-active-{{ $plan?->id ?? 'new' }}" class="form-label">Status</label>
        <select id="plan-active-{{ $plan?->id ?? 'new' }}" name="is_active" class="form-select @error('is_active') is-invalid @enderror">
            <option value="1" @selected(old('is_active', $plan?->is_active ?? true))>Active</option>
            <option value="0" @selected(old('is_active', $plan?->is_active ?? true) === false || old('is_active', $plan?->is_active ?? true) === '0')>Inactive</option>
        </select>
        @error('is_active')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    <div class="col-12">
        <label for="plan-description-{{ $plan?->id ?? 'new' }}" class="form-label">Description</label>
        <textarea id="plan-description-{{ $plan?->id ?? 'new' }}" name="description" class="form-control @error('description') is-invalid @enderror" rows="3" maxlength="1000" placeholder="Explain who this package is for and what it includes.">{{ old('description', $plan?->description) }}</textarea>
        @error('description')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    <div class="col-md-6">
        <label for="plan-monthly-limit-{{ $plan?->id ?? 'new' }}" class="form-label">Monthly Post Limit</label>
        <input id="plan-monthly-limit-{{ $plan?->id ?? 'new' }}" type="number" min="1" step="1" name="monthly_post_limit" class="form-control @error('monthly_post_limit') is-invalid @enderror" value="{{ old('monthly_post_limit', $plan?->monthly_post_limit) }}" placeholder="10">
        @error('monthly_post_limit')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    <div class="col-md-6">
        <label for="plan-yearly-limit-{{ $plan?->id ?? 'new' }}" class="form-label">Yearly Post Limit</label>
        <input id="plan-yearly-limit-{{ $plan?->id ?? 'new' }}" type="number" min="1" step="1" name="yearly_post_limit" class="form-control @error('yearly_post_limit') is-invalid @enderror" value="{{ old('yearly_post_limit', $plan?->yearly_post_limit) }}" placeholder="120">
        @error('yearly_post_limit')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    <div class="col-md-6">
        <label for="plan-monthly-price-{{ $plan?->id ?? 'new' }}" class="form-label">Monthly Price</label>
        <input id="plan-monthly-price-{{ $plan?->id ?? 'new' }}" type="number" min="0" step="0.01" name="monthly_price" class="form-control @error('monthly_price') is-invalid @enderror" value="{{ old('monthly_price', $plan?->monthly_price) }}" placeholder="9.99">
        @error('monthly_price')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
    <div class="col-md-6">
        <label for="plan-yearly-price-{{ $plan?->id ?? 'new' }}" class="form-label">Yearly Price</label>
        <input id="plan-yearly-price-{{ $plan?->id ?? 'new' }}" type="number" min="0" step="0.01" name="yearly_price" class="form-control @error('yearly_price') is-invalid @enderror" value="{{ old('yearly_price', $plan?->yearly_price) }}" placeholder="99.99">
        @error('yearly_price')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>
</div>
