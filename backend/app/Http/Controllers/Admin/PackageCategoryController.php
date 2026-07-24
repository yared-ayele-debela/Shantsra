<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PackageCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class PackageCategoryController extends Controller
{
    public function index(): View
    {
        $categories = PackageCategory::query()->latest()->paginate(15);

        return view('admin.package-categories.index', compact('categories'));
    }

    public function store(Request $request): RedirectResponse
    {
        PackageCategory::create($this->validatedData($request));

        return redirect()->route('admin.package-categories.index')
            ->with('success', 'Package category created successfully.');
    }

    public function update(Request $request, PackageCategory $packageCategory): RedirectResponse
    {
        $packageCategory->update($this->validatedData($request, $packageCategory));

        return redirect()->route('admin.package-categories.index')
            ->with('success', 'Package category updated successfully.');
    }

    public function destroy(PackageCategory $packageCategory): RedirectResponse
    {
        $packageCategory->delete();

        return redirect()->route('admin.package-categories.index')
            ->with('success', 'Package category deleted successfully.');
    }

    /**
     * @return array{name: string, description: ?string, is_active: bool}
     */
    private function validatedData(Request $request, ?PackageCategory $packageCategory = null): array
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('package_categories', 'name')->ignore($packageCategory),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $data['name'] = trim($data['name']);
        $data['description'] = filled($data['description'] ?? null) ? trim($data['description']) : null;

        return $data;
    }
}
