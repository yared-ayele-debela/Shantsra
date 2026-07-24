<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class UserController extends Controller
{
    public function index(Request $request): View
    {
        $users = User::query()
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $search = $request->string('search');

                $query->where(function (Builder $builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('role'), fn (Builder $query) => $query->where('role', $request->string('role')))
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return view('admin.users.index', compact('users'));
    }

    public function show(User $user): View
    {
        $user->load(['shipments', 'travels', 'sentBookings']);

        return view('admin.users.show', compact('user'));
    }

    public function toggleStatus(User $user): RedirectResponse
    {
        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active',
        ]);

        return back()->with('success', 'User status updated successfully.');
    }

    public function updateIdDocumentStatus(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'id_document_status' => ['required', Rule::in(['pending', 'verified', 'rejected'])],
        ]);

        $user->update([
            'id_document_status' => $validated['id_document_status'],
        ]);

        return back()->with('success', 'ID document verification status updated.');
    }
}
