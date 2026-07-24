@php($isCreate = $category === null)
<div class="mb-3">
    <label for="category-name-{{ $category?->id ?? 'new' }}" class="form-label fw-semibold">Name</label>
    <input id="category-name-{{ $category?->id ?? 'new' }}" type="text" name="name" class="form-control @error('name') is-invalid @enderror" required maxlength="100" value="{{ old('name', $category?->name) }}" placeholder="e.g. Electronics">
    @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label for="category-description-{{ $category?->id ?? 'new' }}" class="form-label fw-semibold">Description <span class="text-muted fw-normal">(optional)</span></label>
    <textarea id="category-description-{{ $category?->id ?? 'new' }}" name="description" class="form-control @error('description') is-invalid @enderror" rows="3" maxlength="1000" placeholder="Briefly describe the type of packages in this category.">{{ old('description', $category?->description) }}</textarea>
    @error('description')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<input type="hidden" name="is_active" value="0">
<div class="form-check form-switch">
    <input id="category-active-{{ $category?->id ?? 'new' }}" class="form-check-input" type="checkbox" name="is_active" value="1" @checked(old('is_active', $category?->is_active ?? true))>
    <label class="form-check-label" for="category-active-{{ $category?->id ?? 'new' }}">Active and available for use</label>
</div>
