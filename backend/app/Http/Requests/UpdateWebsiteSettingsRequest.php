<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebsiteSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('admin')->check();
    }

    protected function prepareForValidation(): void
    {
        $social = [
            'social_facebook',
            'social_twitter',
            'social_instagram',
            'social_linkedin',
            'social_youtube',
        ];

        $merge = [];
        foreach ($social as $key) {
            if ($this->input($key) === '' || $this->input($key) === null) {
                $merge[$key] = null;
            }
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:120'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'site_description' => ['nullable', 'string', 'max:8000'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'max:30072'],
            'favicon' => ['nullable', 'file', 'max:10204', 'mimes:ico,png,svg,jpg,jpeg,webp,x-icon'],
            'remove_logo' => ['sometimes', 'boolean'],
            'remove_favicon' => ['sometimes', 'boolean'],
            'social_facebook' => ['nullable', 'string', 'max:500', 'url'],
            'social_twitter' => ['nullable', 'string', 'max:500', 'url'],
            'social_instagram' => ['nullable', 'string', 'max:500', 'url'],
            'social_linkedin' => ['nullable', 'string', 'max:500', 'url'],
            'social_youtube' => ['nullable', 'string', 'max:500', 'url'],
        ];
    }

    public function messages(): array
    {
        return [
            'social_facebook.url' => 'Facebook must be a valid URL.',
            'social_twitter.url' => 'X / Twitter must be a valid URL.',
            'social_instagram.url' => 'Instagram must be a valid URL.',
            'social_linkedin.url' => 'LinkedIn must be a valid URL.',
            'social_youtube.url' => 'YouTube must be a valid URL.',
        ];
    }
}
