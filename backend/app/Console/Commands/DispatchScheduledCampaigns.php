<?php

namespace App\Console\Commands;

use App\Jobs\DispatchEmailCampaignJob;
use App\Models\EmailCampaign;
use Illuminate\Console\Command;

class DispatchScheduledCampaigns extends Command
{
    protected $signature = 'campaigns:dispatch-scheduled';

    protected $description = 'Queue all scheduled email campaigns that are due to be sent.';

    public function handle(): int
    {
        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\EmailCampaign> $campaigns */
        $campaigns = EmailCampaign::query()
            ->where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($campaigns as $campaign) {
            $campaign->update([
                'status' => 'processing',
            ]);

            DispatchEmailCampaignJob::dispatch($campaign->id);
        }

        $this->info("Queued {$campaigns->count()} scheduled campaign(s).");

        return self::SUCCESS;
    }
}
