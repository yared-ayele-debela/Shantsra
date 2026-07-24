<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateWebsiteSettingsRequest;
use App\Models\WebsiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class WebsiteSettingController extends Controller
{
    public function edit(): View
    {
        $settings = WebsiteSetting::current();

        return view('admin.settings.website', compact('settings'));
    }

    public function update(UpdateWebsiteSettingsRequest $request): RedirectResponse
    {
        $settings = WebsiteSetting::current();

        $data = $request->safe()->except(['logo', 'favicon', 'remove_logo', 'remove_favicon']);

        if ($request->boolean('remove_logo')) {
            $settings->deleteStoredLogo();
            $data['logo_path'] = null;
        }

        if ($request->boolean('remove_favicon')) {
            $settings->deleteStoredFavicon();
            $data['favicon_path'] = null;
        }

        if ($request->hasFile('logo')) {
            $settings->deleteStoredLogo();
            $data['logo_path'] = $request->file('logo')->store('site', 'public');
        }

        if ($request->hasFile('favicon')) {
            $settings->deleteStoredFavicon();
            $data['favicon_path'] = $request->file('favicon')->store('site', 'public');
        }

        $settings->update($data);

        return back()->with('success', 'Website settings saved.');
    }
}
