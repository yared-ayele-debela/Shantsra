<?php

namespace App\Services;

use App\Models\Shipment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegramService
{
    protected string $botToken;
    protected string $botUsername;
    protected string $channelId;
    protected ?string $groupId;
    protected string $publicUrl;

    public function __construct()
    {
        $this->botToken = (string) config('services.telegram.bot_token', '');
        $this->botUsername = ltrim((string) config('services.telegram.bot_username', 'Shantasra_bot'), '@');
        $this->channelId = (string) config('services.telegram.channel_id', '@shantasraa');
        $this->groupId = config('services.telegram.group_id', '@shantasra_chat');
        $this->publicUrl = rtrim((string) config('services.telegram.public_url', 'https://shantasra.com'), '/');
    }

    public function isConfigured(): bool
    {
        return ! empty($this->botToken);
    }

    protected function apiUrl(string $method): string
    {
        return "https://api.telegram.org/bot{$this->botToken}/{$method}";
    }

    /**
     * Base query for open, available packages (matches OpenShipmentController).
     */
    public function openShipmentsQuery(): Builder
    {
        return Shipment::query()
            ->with(['sender:id,name', 'category:id,name'])
            ->where('approval_status', 'approved')
            ->where(function ($q) {
                $q->where('deal_status', '!=', 'confirmed')
                  ->orWhereNull('deal_status');
            })
            ->whereDoesntHave('booking')
            ->where(function ($q) {
                $q->whereNull('travel_date')
                  ->orWhereDate('travel_date', '>=', Carbon::today());
            })
            ->where('is_paused_by_inquiries', false)
            ->latest();
    }

    /**
     * Format a Shipment model into an HTML message for Telegram.
     */
    public function formatShipmentMessage(Shipment $shipment): string
    {
        $shipment->loadMissing(['category:id,name', 'sender:id,name']);

        $header = $shipment->is_urgent
            ? "🚨 <b>URGENT PACKAGE AVAILABLE</b> 🚨"
            : "📦 <b>NEW PACKAGE AVAILABLE</b>";

        $from = e($shipment->from_city);
        $to = e($shipment->to_city);
        $weight = number_format((float) $shipment->weight, 2);
        $category = $shipment->category?->name ? e($shipment->category->name) : 'General';
        $travelDate = $shipment->travel_date
            ? Carbon::parse($shipment->travel_date)->format('M d, Y')
            : 'Flexible';

        $lines = [
            $header,
            "",
            "✈️ <b>Route:</b> {$from} ➔ {$to}",
            "⚖️ <b>Weight:</b> {$weight} kg",
            "🏷️ <b>Category:</b> {$category}",
            "📅 <b>Preferred Date:</b> {$travelDate}",
        ];

        if (! empty($shipment->description)) {
            $desc = e(Str::limit(trim($shipment->description), 260));
            $lines[] = "📝 <b>Description:</b> {$desc}";
        }

        $lines[] = "";
        $lines[] = "🆔 <b>Package ID:</b> <code>#{$shipment->id}</code>";
        $lines[] = "💬 <i>Traveling on this route? Click below to view details & carry this package!</i>";

        return implode("\n", $lines);
    }

    /**
     * Build inline keyboard buttons for a Shipment post.
     */
    public function buildShipmentKeyboard(Shipment $shipment): array
    {
        $slug = Str::slug("{$shipment->from_city}-to-{$shipment->to_city}");
        $webUrl = "{$this->publicUrl}/packages/{$shipment->id}-{$slug}";
        $botDeepLink = "https://t.me/{$this->botUsername}?start=pkg_{$shipment->id}";
        $browseBotLink = "https://t.me/{$this->botUsername}?start=browse";

        // Telegram inline URL buttons require a valid non-localhost HTTP/HTTPS URL
        $isPublicWebUrl = str_starts_with($webUrl, 'https://')
            && ! str_contains($webUrl, 'localhost')
            && ! str_contains($webUrl, '127.0.0.1');

        $primaryUrl = $isPublicWebUrl ? $webUrl : $botDeepLink;

        return [
            'inline_keyboard' => [
                [
                    [
                        'text' => '📦 View / Carry This Package',
                        'url' => $primaryUrl,
                    ],
                ],
                [
                    [
                        'text' => '🤖 Browse All Packages',
                        'url' => $browseBotLink,
                    ],
                    [
                        'text' => '💬 Join Group Chat',
                        'url' => 'https://t.me/' . ltrim((string) $this->groupId, '@'),
                    ],
                ],
            ],
        ];
    }

    /**
     * Post a single shipment to the configured Telegram Channel (and Group if separate).
     */
    public function postShipmentToChannel(Shipment $shipment): array
    {
        if (! $this->isConfigured()) {
            return [
                'ok' => false,
                'error' => 'Telegram bot token is not configured.',
            ];
        }

        $caption = $this->formatShipmentMessage($shipment);
        $replyMarkup = $this->buildShipmentKeyboard($shipment);

        $channelResult = $this->sendShipmentToChat($this->channelId, $shipment, $caption, $replyMarkup);

        return $channelResult;
    }

    /**
     * Send a shipment card (with photo if available, or text message) to a specific chat_id.
     */
    public function sendShipmentToChat(string|int $chatId, Shipment $shipment, ?string $caption = null, ?array $replyMarkup = null): array
    {
        $caption ??= $this->formatShipmentMessage($shipment);
        $replyMarkup ??= $this->buildShipmentKeyboard($shipment);

        $firstImage = is_array($shipment->product_images) ? ($shipment->product_images[0] ?? null) : null;

        if ($firstImage) {
            // 1. Check if the image exists locally in storage/app/public
            $localPath = storage_path('app/public/' . ltrim($firstImage, '/'));
            if (is_file($localPath) && is_readable($localPath)) {
                $response = Http::timeout(15)
                    ->attach('photo', file_get_contents($localPath), basename($localPath))
                    ->post($this->apiUrl('sendPhoto'), [
                        'chat_id' => $chatId,
                        'caption' => $caption,
                        'parse_mode' => 'HTML',
                        'reply_markup' => json_encode($replyMarkup),
                    ]);

                if ($response->successful() && $response->json('ok')) {
                    return $response->json();
                }
            }

            // 2. Or if it's a public HTTPS URL
            if (str_starts_with($firstImage, 'https://') && ! str_contains($firstImage, 'localhost')) {
                $response = Http::timeout(15)->post($this->apiUrl('sendPhoto'), [
                    'chat_id' => $chatId,
                    'photo' => $firstImage,
                    'caption' => $caption,
                    'parse_mode' => 'HTML',
                    'reply_markup' => json_encode($replyMarkup),
                ]);

                if ($response->successful() && $response->json('ok')) {
                    return $response->json();
                }
            }
        }

        // Fallback to standard text message
        return $this->sendMessage($chatId, $caption, $replyMarkup);
    }

    /**
     * Send an HTML-formatted message to any Telegram chat_id.
     */
    public function sendMessage(string|int $chatId, string $text, ?array $replyMarkup = null, bool $disablePreview = true): array
    {
        $payload = [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => $disablePreview,
        ];

        if ($replyMarkup !== null) {
            $payload['reply_markup'] = json_encode($replyMarkup);
        }

        try {
            $response = Http::timeout(15)->post($this->apiUrl('sendMessage'), $payload);
            return $response->json() ?? ['ok' => false, 'error' => 'Invalid JSON response from Telegram'];
        } catch (\Throwable $e) {
            Log::error('Telegram sendMessage failed', ['error' => $e->getMessage(), 'chat_id' => $chatId]);
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Edit an existing message in a chat (for inline pagination).
     */
    public function editMessageText(string|int $chatId, int $messageId, string $text, ?array $replyMarkup = null): array
    {
        $payload = [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ];

        if ($replyMarkup !== null) {
            $payload['reply_markup'] = json_encode($replyMarkup);
        }

        try {
            $response = Http::timeout(15)->post($this->apiUrl('editMessageText'), $payload);
            return $response->json() ?? ['ok' => false];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Register bot commands menu in Telegram (@Shantasra_bot).
     */
    public function registerBotCommands(): array
    {
        $commands = [
            ['command' => 'packages', 'description' => '📦 Browse all available packages'],
            ['command' => 'urgent', 'description' => '🚨 View urgent packages only'],
            ['command' => 'search', 'description' => '🔍 Search packages by city (e.g. /search Dubai)'],
            ['command' => 'help', 'description' => 'ℹ️ How to use the bot & links'],
        ];

        $response = Http::timeout(15)->post($this->apiUrl('setMyCommands'), [
            'commands' => $commands,
        ]);

        return $response->json() ?? ['ok' => false];
    }

    /**
     * Handle incoming webhook or getUpdates update from Telegram.
     */
    public function handleUpdate(array $update): void
    {
        if (isset($update['callback_query'])) {
            $this->handleCallbackQuery($update['callback_query']);
            return;
        }

        $message = $update['message'] ?? null;
        if (! $message || empty($message['text'])) {
            return;
        }

        $chatId = $message['chat']['id'];
        $text = trim($message['text']);

        // Normalize commands like /packages@Shantasra_bot -> /packages
        if (str_starts_with($text, '/')) {
            $parts = explode(' ', $text, 2);
            $command = strtolower(explode('@', $parts[0])[0]);
            $argument = isset($parts[1]) ? trim($parts[1]) : '';

            match ($command) {
                '/start' => $this->handleStartCommand($chatId, $argument),
                '/packages', '/list' => $this->sendPackagesPage($chatId, 1, false),
                '/urgent' => $this->sendPackagesPage($chatId, 1, true),
                '/search' => $this->handleSearchCommand($chatId, $argument),
                '/help' => $this->handleHelpCommand($chatId),
                default => null,
            };
        }
    }

    protected function handleStartCommand(string|int $chatId, string $argument): void
    {
        if (str_starts_with($argument, 'pkg_')) {
            $shipmentId = (int) substr($argument, 4);
            $shipment = Shipment::with(['category', 'sender'])->find($shipmentId);
            if ($shipment && $shipment->approval_status === 'approved') {
                $this->sendShipmentToChat($chatId, $shipment);
                return;
            }
        }

        if ($argument === 'browse') {
            $this->sendPackagesPage($chatId, 1, false);
            return;
        }

        $channelHandle = '@' . ltrim($this->channelId, '@');
        $groupHandle = '@' . ltrim((string) $this->groupId, '@');

        $welcome = implode("\n", [
            "👋 <b>Welcome to Shantasra / PeerBridge Delivery Bot!</b>",
            "",
            "Here you can browse available packages waiting for travelers and connect with senders.",
            "",
            "📌 <b>Available Commands:</b>",
            "• /packages — List all available packages",
            "• /urgent — View urgent packages",
            "• /search <i>city</i> — Search by city (e.g. <code>/search Addis</code>)",
            "• /help — Show help & links",
            "",
            "📢 <b>Official Channel:</b> {$channelHandle}",
            "💬 <b>Community Group:</b> {$groupHandle}",
        ]);

        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '📦 View Available Packages', 'callback_data' => 'pkg_page:1:0'],
                    ['text' => '🚨 Urgent Packages', 'callback_data' => 'pkg_page:1:1'],
                ],
                [
                    ['text' => '📢 Channel', 'url' => 'https://t.me/' . ltrim($this->channelId, '@')],
                    ['text' => '💬 Group Chat', 'url' => 'https://t.me/' . ltrim((string) $this->groupId, '@')],
                ],
            ],
        ];

        $this->sendMessage($chatId, $welcome, $keyboard);
    }

    protected function handleHelpCommand(string|int $chatId): void
    {
        $this->handleStartCommand($chatId, '');
    }

    protected function handleSearchCommand(string|int $chatId, string $city): void
    {
        if ($city === '') {
            $this->sendMessage(
                $chatId,
                "🔍 Please provide a city name after <code>/search</code>.\nExample: <code>/search Dubai</code> or <code>/search Addis Ababa</code>"
            );
            return;
        }

        try {
            $shipments = $this->openShipmentsQuery()
                ->where(function ($q) use ($city) {
                    $q->where('from_city', 'like', "%{$city}%")
                      ->orWhere('to_city', 'like', "%{$city}%");
                })
                ->limit(8)
                ->get();
        } catch (\Throwable $e) {
            Log::error('Telegram search query error', ['error' => $e->getMessage()]);
            $this->sendMessage($chatId, "⚠️ Unable to fetch packages right now. Please try again shortly.");
            return;
        }

        if ($shipments->isEmpty()) {
            $this->sendMessage(
                $chatId,
                "📭 No open packages found matching <b>" . e($city) . "</b> right now.\n\nTry /packages to see all available routes."
            );
            return;
        }

        $lines = [
            "🔍 <b>Available Packages matching \"" . e($city) . "\":</b>",
            "",
        ];

        $buttons = [];
        foreach ($shipments as $shipment) {
            $urgentBadge = $shipment->is_urgent ? '🚨 ' : '📦 ';
            $date = $shipment->travel_date ? Carbon::parse($shipment->travel_date)->format('M d') : 'Flexible';
            $lines[] = "{$urgentBadge}<b>#{$shipment->id}</b>: " . e($shipment->from_city) . " ➔ " . e($shipment->to_city)
                . " • <b>" . number_format((float) $shipment->weight, 1) . "kg</b> ({$date})";

            $buttons[] = [
                'text' => "📦 View #{$shipment->id} ({$shipment->from_city} ➔ {$shipment->to_city})",
                'callback_data' => "pkg_view:{$shipment->id}",
            ];
        }

        $keyboard = [
            'inline_keyboard' => array_chunk($buttons, 1),
        ];

        $this->sendMessage($chatId, implode("\n", $lines), $keyboard);
    }

    /**
     * Send or edit a paginated list of open packages.
     */
    public function sendPackagesPage(string|int $chatId, int $page = 1, bool $urgentOnly = false, ?int $editMessageId = null): void
    {
        $perPage = 5;
        $page = max(1, $page);

        try {
            $query = $this->openShipmentsQuery();
            if ($urgentOnly) {
                $query->where('is_urgent', true);
            }

            $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        } catch (\Throwable $e) {
            Log::error('Telegram sendPackagesPage error', ['error' => $e->getMessage()]);
            $this->sendMessage($chatId, "⚠️ Unable to load packages from the database right now.");
            return;
        }

        if ($paginator->total() === 0) {
            $emptyText = $urgentOnly
                ? "📭 There are currently no urgent packages available."
                : "📭 There are currently no open packages available. Check back soon!";

            $keyboard = [
                'inline_keyboard' => [
                    [
                        ['text' => '🔄 Refresh', 'callback_data' => "pkg_page:1:" . ($urgentOnly ? '1' : '0')],
                        ['text' => $urgentOnly ? '📦 Show All Packages' : '🚨 Urgent Only', 'callback_data' => "pkg_page:1:" . ($urgentOnly ? '0' : '1')],
                    ],
                ],
            ];

            if ($editMessageId) {
                $this->editMessageText($chatId, $editMessageId, $emptyText, $keyboard);
            } else {
                $this->sendMessage($chatId, $emptyText, $keyboard);
            }
            return;
        }

        $title = $urgentOnly
            ? "🚨 <b>Urgent Available Packages</b>"
            : "📦 <b>Available Packages Ready for Delivery</b>";

        $lines = [
            "{$title} (Page {$paginator->currentPage()}/{$paginator->lastPage()} • Total: {$paginator->total()})",
            "",
        ];

        $itemButtons = [];
        foreach ($paginator->items() as $shipment) {
            $badge = $shipment->is_urgent ? '🚨' : '📦';
            $from = e($shipment->from_city);
            $to = e($shipment->to_city);
            $weight = number_format((float) $shipment->weight, 1);
            $date = $shipment->travel_date ? Carbon::parse($shipment->travel_date)->format('M d, Y') : 'Flexible';

            $lines[] = "{$badge} <b>#{$shipment->id} — {$from} ➔ {$to}</b>";
            $lines[] = "   ⚖️ {$weight} kg  |  📅 {$date}";
            if ($shipment->description) {
                $lines[] = "   📝 <i>" . e(Str::limit(trim($shipment->description), 70)) . "</i>";
            }
            $lines[] = "";

            $itemButtons[] = [
                [
                    'text' => "{$badge} View Details #{$shipment->id} ({$shipment->from_city} ➔ {$shipment->to_city})",
                    'callback_data' => "pkg_view:{$shipment->id}",
                ],
            ];
        }

        $navRow = [];
        $urgentFlag = $urgentOnly ? 1 : 0;
        if ($paginator->currentPage() > 1) {
            $prev = $paginator->currentPage() - 1;
            $navRow[] = ['text' => '⬅️ Prev', 'callback_data' => "pkg_page:{$prev}:{$urgentFlag}"];
        }
        $navRow[] = ['text' => '🔄 Refresh', 'callback_data' => "pkg_page:{$paginator->currentPage()}:{$urgentFlag}"];
        if ($paginator->hasMorePages()) {
            $next = $paginator->currentPage() + 1;
            $navRow[] = ['text' => 'Next ➡️', 'callback_data' => "pkg_page:{$next}:{$urgentFlag}"];
        }

        $filterRow = [
            [
                'text' => $urgentOnly ? '📦 Show All Packages' : '🚨 Show Urgent Only',
                'callback_data' => "pkg_page:1:" . ($urgentOnly ? '0' : '1'),
            ],
        ];

        $keyboard = [
            'inline_keyboard' => array_merge($itemButtons, [$navRow, $filterRow]),
        ];

        $text = implode("\n", $lines);

        if ($editMessageId) {
            $this->editMessageText($chatId, $editMessageId, $text, $keyboard);
        } else {
            $this->sendMessage($chatId, $text, $keyboard);
        }
    }

    protected function handleCallbackQuery(array $callbackQuery): void
    {
        $callbackId = $callbackQuery['id'];
        $data = (string) ($callbackQuery['data'] ?? '');
        $message = $callbackQuery['message'] ?? null;

        Http::timeout(5)->post($this->apiUrl('answerCallbackQuery'), [
            'callback_query_id' => $callbackId,
        ]);

        if (! $message) {
            return;
        }

        $chatId = $message['chat']['id'];
        $messageId = $message['message_id'];

        if (str_starts_with($data, 'pkg_page:')) {
            $parts = explode(':', $data);
            $page = isset($parts[1]) ? (int) $parts[1] : 1;
            $urgentOnly = isset($parts[2]) && $parts[2] === '1';
            $this->sendPackagesPage($chatId, $page, $urgentOnly, $messageId);
            return;
        }

        if (str_starts_with($data, 'pkg_view:')) {
            $shipmentId = (int) substr($data, 9);
            $shipment = Shipment::with(['category', 'sender'])->find($shipmentId);
            if ($shipment && $shipment->approval_status === 'approved') {
                $this->sendShipmentToChat($chatId, $shipment);
            } else {
                $this->sendMessage($chatId, "⚠️ This package is no longer available.");
            }
        }
    }
}
