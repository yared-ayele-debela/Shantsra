<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactConversation;
use App\Models\ContactMessage;
use App\Models\Shipment;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $conversations = ContactConversation::query()
            ->where(function ($query) use ($user) {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->orderByDesc('updated_at')
            ->limit(80)
            ->get();

        $otherIds = $conversations->map(fn (ContactConversation $c) => $c->otherUserId($user->id))->unique()->filter();
        $users = User::query()->whereIn('id', $otherIds)->get()->keyBy('id');

        $payload = $conversations->map(function (ContactConversation $c) use ($user, $users) {
            $last = ContactMessage::query()
                ->where('contact_conversation_id', $c->id)
                ->orderByDesc('id')
                ->first();

            $otherId = $c->otherUserId($user->id);
            $other = $users->get($otherId);

            return [
                'id' => $c->id,
                'other_user' => [
                    'id' => $otherId,
                    'name' => $other?->name ?? 'User',
                ],
                'listing' => $this->listingSummaryFromIds($c->listable_type, $c->listable_id),
                'last_message' => $last ? [
                    'body' => $last->body,
                    'created_at' => $last->created_at?->toIso8601String(),
                    'from_me' => (int) $last->user_id === (int) $user->id,
                ] : null,
            ];
        });

        return response()->json([
            'conversations' => $payload,
        ]);
    }

    public function show(Request $request, ContactConversation $conversation): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $this->authorizeParticipant($conversation, (int) $user->id);

        $messages = ContactMessage::query()
            ->where('contact_conversation_id', $conversation->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (ContactMessage $m) => [
                'id' => $m->id,
                'body' => $m->body,
                'created_at' => $m->created_at?->toIso8601String(),
                'from_me' => (int) $m->user_id === (int) $user->id,
            ]);

        $otherId = $conversation->otherUserId((int) $user->id);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'other_user' => [
                    'id' => $otherId,
                    'name' => User::query()->find($otherId)?->name ?? 'User',
                ],
                'listing' => $this->listingSummaryFromIds($conversation->listable_type, $conversation->listable_id),
            ],
            'messages' => $messages,
        ]);
    }

    public function storeMessage(Request $request, ContactConversation $conversation): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $this->authorizeParticipant($conversation, (int) $user->id);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $message = $this->appendMessage($conversation, (int) $user->id, $validated['message']);

        return response()->json([
            'message' => [
                'id' => $message->id,
                'body' => $message->body,
                'created_at' => $message->created_at?->toIso8601String(),
                'from_me' => true,
            ],
        ], 201);
    }

    public function start(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'travel_id' => ['nullable', 'integer', 'exists:travel,id'],
            'shipment_id' => ['nullable', 'integer', 'exists:shipments,id'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        if (empty($validated['travel_id']) && empty($validated['shipment_id'])) {
            return response()->json([
                'message' => 'Choose a traveler trip or an open shipment.',
            ], 422);
        }

        if (! empty($validated['travel_id']) && ! empty($validated['shipment_id'])) {
            return response()->json([
                'message' => 'Send only one listing reference.',
            ], 422);
        }

        if (! empty($validated['travel_id'])) {
            $travel = Travel::query()->with('traveler')->findOrFail($validated['travel_id']);
            $recipient = (int) $travel->traveler_id;

            if (! $travel->traveler || $travel->traveler->status !== 'active') {
                return response()->json([
                    'message' => 'This traveler account is not available.',
                ], 422);
            }

            if ($travel->status !== 'approved') {
                return response()->json([
                    'message' => 'This trip is not available for contact.',
                ], 422);
            }

            if (Carbon::parse($travel->departure_date)->toDateString() < now()->toDateString()) {
                return response()->json([
                    'message' => 'This trip has already departed.',
                ], 422);
            }

            if ($recipient === (int) $user->id) {
                return response()->json([
                    'message' => 'You cannot contact your own trip listing.',
                ], 422);
            }

            [$one, $two] = ContactConversation::orderedUserPair((int) $user->id, $recipient);

            $conversation = DB::transaction(function () use ($one, $two, $travel, $user, $validated) {
                $conversation = ContactConversation::query()->firstOrCreate(
                    [
                        'user_one_id' => $one,
                        'user_two_id' => $two,
                        'listable_type' => Travel::class,
                        'listable_id' => $travel->id,
                    ],
                );

                $this->appendMessage($conversation, (int) $user->id, $validated['message']);

                return $conversation;
            });

            return response()->json([
                'conversation_id' => $conversation->id,
                'message' => 'Your message was sent.',
            ], 201);
        }

        $shipment = Shipment::query()->findOrFail($validated['shipment_id']);
        $recipient = (int) $shipment->sender_id;

        if ($shipment->status !== 'pending') {
            return response()->json([
                'message' => 'This shipment is no longer open.',
            ], 422);
        }

        if ($shipment->booking()->exists()) {
            return response()->json([
                'message' => 'This shipment already has a booking.',
            ], 422);
        }

        if ($recipient === (int) $user->id) {
            return response()->json([
                'message' => 'You cannot contact your own shipment.',
            ], 422);
        }

        [$one, $two] = ContactConversation::orderedUserPair((int) $user->id, $recipient);

        $conversation = DB::transaction(function () use ($one, $two, $shipment, $user, $validated) {
            $conversation = ContactConversation::query()->firstOrCreate(
                [
                    'user_one_id' => $one,
                    'user_two_id' => $two,
                    'listable_type' => Shipment::class,
                    'listable_id' => $shipment->id,
                ],
            );

            $this->appendMessage($conversation, (int) $user->id, $validated['message']);

            return $conversation;
        });

        return response()->json([
            'conversation_id' => $conversation->id,
            'message' => 'Your message was sent.',
        ], 201);
    }

    private function appendMessage(ContactConversation $conversation, int $senderId, string $body): ContactMessage
    {
        $message = ContactMessage::query()->create([
            'contact_conversation_id' => $conversation->id,
            'user_id' => $senderId,
            'body' => $body,
        ]);

        $conversation->touch();

        return $message;
    }

    private function authorizeParticipant(ContactConversation $conversation, int $userId): void
    {
        if (! $conversation->involvesUser($userId)) {
            abort(403);
        }
    }

    /**
     * @return array{type: string, summary: string}
     */
    private function listingSummaryFromIds(string $listableType, int $listableId): array
    {
        if ($listableType === Travel::class) {
            $travel = Travel::query()->find($listableId);
            if (! $travel) {
                return ['type' => 'travel', 'summary' => 'Trip'];
            }
            $d = Carbon::parse($travel->departure_date)->format('M d, Y');

            return [
                'type' => 'travel',
                'summary' => "{$travel->from_city} → {$travel->to_city} • {$d}",
            ];
        }

        if ($listableType === Shipment::class) {
            $shipment = Shipment::query()->find($listableId);
            if (! $shipment) {
                return ['type' => 'shipment', 'summary' => 'Shipment'];
            }

            return [
                'type' => 'shipment',
                'summary' => "{$shipment->from_city} → {$shipment->to_city} • {$shipment->weight} kg",
            ];
        }

        return ['type' => 'unknown', 'summary' => 'Listing'];
    }
}
