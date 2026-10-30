<div class="modal fade" id="{{ $modalId }}" tabindex="-1" aria-labelledby="{{ $modalId }}Label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <form method="post" action="{{ $action }}" enctype="multipart/form-data" class="modal-content">
            @csrf
            @if($method === 'PUT') @method('PUT') @endif
            <div class="modal-header">
                <h5 class="modal-title" id="{{ $modalId }}Label">{{ $title }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3">
                    <div class="col-md-8">
                        <label class="form-label">Title</label>
                        <input name="title" value="{{ old('title', $banner?->title) }}" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Badge</label>
                        <input name="badge" value="{{ old('badge', $banner?->badge) }}" class="form-control" placeholder="Limited offer">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Description</label>
                        <textarea name="description" rows="2" class="form-control">{{ old('description', $banner?->description) }}</textarea>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Image</label>
                        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" class="form-control">
                        <small class="text-muted">Optional, max 5 MB.</small>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Background gradient</label>
                        <input name="bg_gradient" value="{{ old('bg_gradient', $banner?->bg_gradient ?? 'linear-gradient(135deg, #14532D, #0F3F22)') }}" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">CTA text</label>
                        <input name="cta_text" value="{{ old('cta_text', $banner?->cta_text) }}" class="form-control" placeholder="Learn more">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">CTA link</label>
                        <input name="cta_link" value="{{ old('cta_link', $banner?->cta_link) }}" class="form-control" placeholder="/packages or https://...">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Placement</label>
                        <select name="placement" class="form-select" required>
                            @foreach(['all' => 'All pages', 'hero' => 'Homepage hero', 'home' => 'Home banners', 'packages' => 'Packages', 'travelers' => 'Travelers', 'dashboard' => 'Dashboard', 'safety' => 'Safety'] as $value => $label)
                                <option value="{{ $value }}" @selected(old('placement', $banner?->placement ?? 'all') === $value)>{{ $label }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Sort order</label>
                        <input type="number" min="0" max="9999" name="sort_order" value="{{ old('sort_order', $banner?->sort_order ?? 0) }}" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Status</label>
                        <select name="is_active" class="form-select" required>
                            <option value="1" @selected(old('is_active', (int) ($banner?->is_active ?? true)) == 1)>Active</option>
                            <option value="0" @selected(old('is_active', (int) ($banner?->is_active ?? true)) == 0)>Inactive</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Start date</label>
                        <input type="datetime-local" name="start_date" value="{{ old('start_date', $banner?->start_date?->format('Y-m-d\TH:i')) }}" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">End date</label>
                        <input type="datetime-local" name="end_date" value="{{ old('end_date', $banner?->end_date?->format('Y-m-d\TH:i')) }}" class="form-control">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">{{ $method === 'PUT' ? 'Save Changes' : 'Create Banner' }}</button>
            </div>
        </form>
    </div>
</div>
