<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class AdminProfileController extends Controller
{
    public function edit(): View
    {
        return view('admin.profile.edit', [
            'admin' => auth('admin')->user(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = auth('admin')->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:admins,email,'.$admin->id],
            'phone' => ['nullable', 'string', 'max:50'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'password' => ['nullable', 'confirmed', 'min:8'],
        ]);

        if ($request->hasFile('profile_photo')) {
            if ($admin->profile_photo_path) {
                Storage::disk('public')->delete($admin->profile_photo_path);
            }

            $validated['profile_photo_path'] = $request->file('profile_photo')->store('admins', 'public');
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        unset($validated['profile_photo']);

        $admin->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }
}
