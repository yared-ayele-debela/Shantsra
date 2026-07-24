<?php

namespace App\Jobs;

use App\Models\EmailCampaign;
use App\Models\EmailCampaignRecipient;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Bus;

class DispatchEmailCampaignJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $campaignId,
    ) {
    }

    public function handle(): void
    {
        $campaign = EmailCampaign::find($this->campaignId);

        if (! $campaign || in_array($campaign->status, ['sent', 'cancelled'], true)) {
            return;
        }

        $campaign->update([
            'status' => 'processing',
            'sent_at' => null,
        ]);

        $jobs = [];

        $this->eligibleUsersQuery($campaign)
            ->select(['id', 'email', 'marketing_opt_in', 'unsubscribe_token'])
            ->chunkById(200, function ($users) use (&$jobs, $campaign): void {
                $userIds = $users->pluck('id')->all();

                foreach ($users as $user) {
                    EmailCampaignRecipient::updateOrCreate(
                        [
                            'email_campaign_id' => $campaign->id,
                            'user_id' => $user->id,
                        ],
                        [
                            'email' => $user->email,
                            'status' => 'queued',
                            'sent_at' => null,
                            'failed_at' => null,
                            'error_message' => null,
                        ],
                    );
                }

                if ($userIds !== []) {
                    $jobs[] = new SendEmailCampaignChunkJob($campaign->id, $userIds);
                }
            });

        if ($jobs === []) {
            $campaign->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return;
        }

        $batch = Bus::batch($jobs)
            ->name("email-campaign-{$campaign->id}")
            ->then(function () use ($campaign): void {
                $campaign->fresh()->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
            })
            ->catch(function () use ($campaign): void {
                $campaign->fresh()->update([
                    'status' => 'failed',
                ]);
            })
            ->dispatch();

        $campaign->update([
            'batch_id' => $batch->id,
        ]);
    }

    private function eligibleUsersQuery(EmailCampaign $campaign)
    {
        $query = User::query()
            ->where('marketing_opt_in', true)
            ->whereNotNull('unsubscribe_token');

        return match ($campaign->audience_filter) {
            'active' => $query->where('status', 'active'),
            'senders' => $query->where('status', 'active')->where('role', 'sender'),
            'travelers' => $query->where('status', 'active')->where('role', 'traveler'),
            'ethiopia' => $query->where('status', 'active')->where('country', 'Ethiopia'),
            'uae' => $query->where('status', 'active')->where('country', 'UAE'),
            default => $query,
        };
    }
}
