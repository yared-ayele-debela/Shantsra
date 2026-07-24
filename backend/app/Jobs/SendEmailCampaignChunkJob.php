<?php

namespace App\Jobs;

use App\Mail\MarketingCampaignMail;
use App\Models\EmailCampaign;
use App\Models\EmailCampaignRecipient;
use App\Models\User;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendEmailCampaignChunkJob implements ShouldQueue
{
    use Batchable, Queueable;

    public function __construct(
        public int $campaignId,
        public array $userIds,
    ) {
    }

    public function handle(): void
    {
        if ($this->batch()?->cancelled()) {
            return;
        }

        $campaign = EmailCampaign::find($this->campaignId);

        if (! $campaign || in_array($campaign->status, ['cancelled', 'failed'], true)) {
            return;
        }

        User::query()
            ->whereIn('id', $this->userIds)
            ->get()
            ->each(function (User $user) use ($campaign): void {
                $recipient = EmailCampaignRecipient::firstOrCreate(
                    [
                        'email_campaign_id' => $campaign->id,
                        'user_id' => $user->id,
                    ],
                    [
                        'email' => $user->email,
                    ],
                );

                if (! $user->marketing_opt_in || ! $user->unsubscribe_token) {
                    $recipient->update([
                        'status' => 'skipped',
                        'error_message' => 'User is unsubscribed from marketing emails.',
                    ]);

                    return;
                }

                try {
                    Mail::to($user->email)->send(new MarketingCampaignMail($campaign, $user));

                    $recipient->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                        'failed_at' => null,
                        'error_message' => null,
                    ]);
                } catch (\Throwable $exception) {
                    $recipient->update([
                        'status' => 'failed',
                        'failed_at' => now(),
                        'error_message' => $exception->getMessage(),
                    ]);
                }
            });
    }
}
