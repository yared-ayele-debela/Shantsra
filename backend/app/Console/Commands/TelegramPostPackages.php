<?php

namespace App\Console\Commands;

use App\Models\Shipment;
use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class TelegramPostPackages extends Command
{
    protected $signature = 'telegram:post-packages
                            {--id= : Post a specific Shipment ID}
                            {--limit=5 : Maximum number of open packages to post}
                            {--test : Send a demo package post to verify Telegram Channel connection}';

    protected $description = 'Post available approved packages to the Telegram channel (@shantasraa)';

    public function handle(TelegramService $telegramService): int
    {
        if (! $telegramService->isConfigured()) {
            $this->error('Telegram bot token is not configured in .env (TELEGRAM_BOT_TOKEN).');
            return self::FAILURE;
        }

        if ($this->option('test')) {
            $sample = new Shipment([
                'from_city' => 'Addis Ababa',
                'to_city' => 'Dubai',
                'weight' => 4.50,
                'description' => 'Traditional Ethiopian coffee & packaged gifts ready for a traveler heading to Dubai.',
                'travel_date' => Carbon::today()->addDays(5),
                'is_urgent' => true,
                'status' => 'pending',
                'approval_status' => 'approved',
            ]);
            $sample->id = 101;

            $this->info('Sending sample package card to Telegram channel...');
            $result = $telegramService->postShipmentToChannel($sample);

            if (! empty($result['ok'])) {
                $this->info('✅ Sample package posted to @shantasraa (and auto-forwarded to @shantasra_chat)!');
                return self::SUCCESS;
            }

            $this->error('❌ Failed to post sample package: ' . json_encode($result));
            return self::FAILURE;
        }

        if ($shipmentId = $this->option('id')) {
            $shipment = Shipment::with(['category', 'sender'])->find($shipmentId);
            if (! $shipment) {
                $this->error("Shipment #{$shipmentId} not found.");
                return self::FAILURE;
            }

            $result = $telegramService->postShipmentToChannel($shipment);
            if (! empty($result['ok'])) {
                $this->info("✅ Posted Shipment #{$shipment->id} ({$shipment->from_city} ➔ {$shipment->to_city}) to Telegram.");
                return self::SUCCESS;
            }

            $this->error('❌ Failed: ' . ($result['description'] ?? $result['error'] ?? 'Unknown error'));
            return self::FAILURE;
        }

        $limit = max(1, (int) $this->option('limit'));
        $shipments = $telegramService->openShipmentsQuery()->limit($limit)->get();

        if ($shipments->isEmpty()) {
            $this->warn('No open, approved packages found to post.');
            return self::SUCCESS;
        }

        $posted = 0;
        foreach ($shipments as $shipment) {
            $res = $telegramService->postShipmentToChannel($shipment);
            if (! empty($res['ok'])) {
                $posted++;
                $this->line("✅ Posted #{$shipment->id}: {$shipment->from_city} ➔ {$shipment->to_city}");
                usleep(400000); // 0.4s delay to respect Telegram rate limits
            } else {
                $this->error("❌ Failed #{$shipment->id}: " . ($res['description'] ?? $res['error'] ?? 'Error'));
            }
        }

        $this->info("Done! Posted {$posted}/{$shipments->count()} packages to Telegram.");
        return self::SUCCESS;
    }
}
