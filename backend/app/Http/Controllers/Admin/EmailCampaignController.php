<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DispatchEmailCampaignJob;
use App\Models\EmailCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Validation\Rule;

class EmailCampaignController extends Controller
{
    public function index(): View
    {
        $campaigns = EmailCampaign::query()
            ->with('creator')
            ->withCount('recipients')
            ->latest()
            ->paginate(10);

        return view('admin.campaigns.index', [
            'campaigns' => $campaigns,
            'audienceOptions' => EmailCampaign::AUDIENCE_OPTIONS,
        ]);
    }

    public function create(): View
    {
        return view('admin.campaigns.create', [
            'audienceOptions' => EmailCampaign::AUDIENCE_OPTIONS,
            'defaultMailer' => config('mail.default'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'cta_text' => ['nullable', 'string', 'max:255'],
            'cta_url' => ['nullable', 'url', 'max:2048', 'required_with:cta_text'],
            'audience_filter' => ['required', Rule::in(array_keys(EmailCampaign::AUDIENCE_OPTIONS))],
            'scheduled_at' => ['nullable', 'date', 'after_or_equal:now'],
            'action' => ['required', Rule::in(['draft', 'schedule', 'send_now'])],
        ]);

        $status = match ($validated['action']) {
            'schedule' => 'scheduled',
            'send_now' => 'processing',
            default => 'draft',
        };

        if ($validated['action'] === 'schedule' && empty($validated['scheduled_at'])) {
            return back()->withErrors([
                'scheduled_at' => 'Choose when this campaign should be sent.',
            ])->withInput();
        }

        $campaign = EmailCampaign::create([
            'created_by_admin_id' => auth('admin')->id(),
            'subject' => $validated['subject'],
            'title' => $validated['title'],
            'body' => $validated['body'],
            'image_url' => $validated['image_url'] ?? null,
            'cta_text' => $validated['cta_text'] ?? null,
            'cta_url' => $validated['cta_url'] ?? null,
            'audience_filter' => $validated['audience_filter'],
            'status' => $status,
            'scheduled_at' => $validated['action'] === 'schedule' ? $validated['scheduled_at'] : null,
        ]);

        if ($validated['action'] === 'send_now') {
            DispatchEmailCampaignJob::dispatch($campaign->id);

            return redirect()
                ->route('admin.campaigns.show', $campaign)
                ->with('success', 'Campaign queued for delivery.');
        }

        $message = $validated['action'] === 'schedule'
            ? 'Campaign scheduled successfully.'
            : 'Campaign saved as draft.';

        return redirect()
            ->route('admin.campaigns.show', $campaign)
            ->with('success', $message);
    }

    public function show(EmailCampaign $campaign): View
    {
        $campaign->load([
            'creator',
            'recipients.user' => fn ($query) => $query->latest(),
        ]);

        $recipientStats = [
            'queued' => $campaign->recipients()->where('status', 'queued')->count(),
            'sent' => $campaign->recipients()->where('status', 'sent')->count(),
            'failed' => $campaign->recipients()->where('status', 'failed')->count(),
            'skipped' => $campaign->recipients()->where('status', 'skipped')->count(),
        ];

        $recentRecipients = $campaign->recipients()
            ->with('user')
            ->latest()
            ->take(25)
            ->get();

        return view('admin.campaigns.show', [
            'campaign' => $campaign,
            'recipientStats' => $recipientStats,
            'recentRecipients' => $recentRecipients,
        ]);
    }

    public function send(EmailCampaign $campaign): RedirectResponse
    {
        if (in_array($campaign->status, ['sent', 'processing'], true)) {
            return back()->with('error', 'This campaign cannot be sent again right now.');
        }

        $campaign->update([
            'status' => 'processing',
            'scheduled_at' => null,
        ]);

        DispatchEmailCampaignJob::dispatch($campaign->id);

        return back()->with('success', 'Campaign queued for delivery.');
    }

    public function cancel(EmailCampaign $campaign): RedirectResponse
    {
        if (! in_array($campaign->status, ['draft', 'scheduled'], true)) {
            return back()->with('error', 'Only draft or scheduled campaigns can be cancelled.');
        }

        $campaign->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Campaign cancelled successfully.');
    }
}
