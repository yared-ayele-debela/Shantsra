<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TelegramBotListen extends Command
{
    protected $signature = 'telegram:bot-listen
                            {--once : Process pending updates once and exit}
                            {--setup-commands : Register bot slash commands (/packages, /urgent, /search, /help)}
                            {--set-webhook : Register the production webhook (https://api.shantasra.com/api/telegram/webhook)}
                            {--delete-webhook : Remove the webhook to use local long-polling}';

    protected $description = 'Listen for incoming Telegram Bot (@Shantasra_bot) commands via long polling';

    public function handle(TelegramService $telegramService): int
    {
        if (! $telegramService->isConfigured()) {
            $this->error('Telegram bot token is not configured in .env (TELEGRAM_BOT_TOKEN).');
            return self::FAILURE;
        }

        $token = config('services.telegram.bot_token');

        if ($this->option('set-webhook')) {
            $webhookUrl = config('services.telegram.webhook_url', 'https://api.shantasra.com/api/telegram/webhook');
            $res = Http::timeout(15)->post("https://api.telegram.org/bot{$token}/setWebhook", [
                'url' => $webhookUrl,
                'allowed_updates' => json_encode(['message', 'callback_query']),
            ])->json();

            if (! empty($res['ok'])) {
                $this->info("✅ Production webhook set to: {$webhookUrl}");
                return self::SUCCESS;
            }

            $this->error('❌ Failed to set webhook: ' . json_encode($res));
            return self::FAILURE;
        }

        if ($this->option('delete-webhook')) {
            $res = Http::timeout(15)->post("https://api.telegram.org/bot{$token}/deleteWebhook")->json();
            if (! empty($res['ok'])) {
                $this->info('✅ Webhook removed. You can now use local polling.');
                return self::SUCCESS;
            }
            $this->error('❌ Failed to remove webhook: ' . json_encode($res));
            return self::FAILURE;
        }

        if ($this->option('setup-commands')) {
            $res = $telegramService->registerBotCommands();
            if (! empty($res['ok'])) {
                $this->info('✅ Registered bot slash commands (/packages, /urgent, /search, /help) on @Shantasra_bot.');
            } else {
                $this->error('❌ Failed to register commands: ' . json_encode($res));
            }
            if ($this->option('once')) {
                return self::SUCCESS;
            }
        }

        $token = config('services.telegram.bot_token');
        $offset = 0;

        $this->info('🤖 Listening for @Shantasra_bot commands (/start, /packages, /urgent, /search)...');

        do {
            try {
                $response = Http::timeout(25)->get("https://api.telegram.org/bot{$token}/getUpdates", [
                    'offset' => $offset,
                    'timeout' => $this->option('once') ? 1 : 20,
                    'allowed_updates' => json_encode(['message', 'callback_query']),
                ]);

                if ($response->successful() && $response->json('ok')) {
                    $updates = $response->json('result', []);
                    foreach ($updates as $update) {
                        $offset = $update['update_id'] + 1;
                        $telegramService->handleUpdate($update);
                        $this->line('Processed update #' . $update['update_id']);
                    }
                }
            } catch (\Throwable $e) {
                $this->warn('Polling error: ' . $e->getMessage());
                sleep(3);
            }
        } while (! $this->option('once'));

        return self::SUCCESS;
    }
}
