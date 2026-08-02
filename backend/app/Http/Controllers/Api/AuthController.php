<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:8'],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', Rule::in(['sender', 'traveler'])],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'marketing_opt_in' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            ...$validated,
            'country' => $validated['country'] ?? 'UAE',
            'marketing_opt_in' => $validated['marketing_opt_in'] ?? false,
            'unsubscribe_token' => Str::random(40),
            'status' => 'active',
        ]);

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
                'errors' => [
                    'email' => ['The provided credentials are incorrect.'],
                ],
            ], 422);
        }

        $request->session()->regenerate();

        /** @var User $user */
        $user = $request->user();

        if ($user->status !== 'active') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Your account is inactive. Please contact support.',
            ], 403);
        }

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Debug: Log all incoming data
        \Log::info('Profile update request data:', [
            'all' => $request->all(),
            'input' => $request->input(),
            'files' => $request->files->all(),
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'has_name' => $request->has('name'),
            'has_email' => $request->has('email'),
        ]);

        if ($request->input('id_document_type') === '') {
            $request->merge(['id_document_type' => null]);
        }
        if ($request->input('id_document_number') === '') {
            $request->merge(['id_document_number' => null]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'string', 'max:2048'],
            'photo_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_photo' => ['nullable', 'boolean'],
            'id_document_type' => [
                'nullable',
                'string',
                Rule::in(['passport', 'national_id', 'residence_permit']),
                'required_with:id_document_number',
            ],
            'id_document_number' => ['nullable', 'string', 'max:120', 'required_with:id_document_type'],
            'marketing_opt_in' => ['nullable', 'boolean'],
            'remove_id_document' => ['nullable', 'boolean'],
            'id_document_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        $idType = $validated['id_document_type'] ?? null;
        $idNumber = isset($validated['id_document_number']) ? trim((string) $validated['id_document_number']) : null;
        if ($idNumber === '') {
            $idNumber = null;
        }

        $updates = [
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'phone' => $validated['phone'] ?? $user->phone,
            'city' => $validated['city'] ?? $user->city,
            'country' => $validated['country'] ?? $user->country,
            'id_document_type' => $idType,
            'id_document_number' => $idNumber,
            'marketing_opt_in' => $request->boolean('marketing_opt_in'),
            'unsubscribe_token' => $user->unsubscribe_token ?: Str::random(40),
        ];

        if ($request->hasFile('photo_file')) {
            $updates['photo'] = $request->file('photo_file')->store(
                'users/'.$user->id.'/photos',
                'public'
            );
        } elseif ($request->boolean('remove_photo')) {
            $updates['photo'] = null;
        } elseif ($request->has('photo')) {
            $updates['photo'] = $validated['photo'];
        }

        if ($request->hasFile('id_document_file')) {
            $user->deleteStoredIdDocument();
            $updates['id_document_path'] = $request->file('id_document_file')->store(
                'users/'.$user->id.'/id-documents',
                'public'
            );
            $updates['id_document_status'] = 'pending';
        } elseif ($request->boolean('remove_id_document')) {
            $user->deleteStoredIdDocument();
            $updates['id_document_path'] = null;
            $updates['id_document_status'] = null;
        }

        $user->update($updates);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
