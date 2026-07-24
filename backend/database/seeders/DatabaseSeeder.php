<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Shipment;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            PackageCategorySeeder::class,
            SubscriptionPlanSeeder::class,
        ]);

        Admin::updateOrCreate(
            ['email' => 'admin@peerbridge.test'],
            [
                'name' => 'Platform Admin',
                'phone' => '+971500000999',
                'password' => Hash::make('password'),
            ],
        );

        $senderProfiles = [
            ['Mimi Tesfaye', 'Dubai'],
            ['Samrawit Bekele', 'Abu Dhabi'],
            ['Dawit Alemu', 'Sharjah'],
            ['Rahel Solomon', 'Dubai'],
            ['Biruk Tadesse', 'Ajman'],
            ['Eyerusalem Kassa', 'Dubai'],
            ['Natnael Abebe', 'Abu Dhabi'],
            ['Lulit Hailu', 'Sharjah'],
            ['Henok Girma', 'Dubai'],
            ['Mahlet Fekadu', 'Ajman'],
        ];

        $travelerProfiles = [
            ['Hana Mekonnen', 'Dubai'],
            ['Yosef Ali', 'Abu Dhabi'],
            ['Rahel Gebru', 'Sharjah'],
            ['Fitsum Desta', 'Dubai'],
            ['Sara Nuru', 'Abu Dhabi'],
            ['Abel Kassahun', 'Sharjah'],
            ['Bethlehem Yonas', 'Dubai'],
            ['Amanuel Zerihun', 'Abu Dhabi'],
            ['Selamawit Teka', 'Sharjah'],
            ['Meron Daniel', 'Dubai'],
        ];

        $extraSenderProfiles = [
            ['Elsa Tadesse', 'Dubai'],
            ['Robel Kassa', 'Abu Dhabi'],
            ['Amanda Petros', 'Sharjah'],
            ['Nahom Bekele', 'Ajman'],
            ['Solomon Esayas', 'Dubai'],
        ];

        $extraTravelerProfiles = [
            ['Tigabu Mulugeta', 'Sharjah'],
            ['Hirut Fikru', 'Dubai'],
            ['Beza Alemayehu', 'Abu Dhabi'],
            ['Getnet Zewde', 'Ajman'],
            ['Almaz Kebede', 'Dubai'],
        ];

        $senders = collect($senderProfiles)->map(function (array $profile, int $index) {
            return User::updateOrCreate(
                ['email' => 'sender'.($index + 1).'@peerbridge.test'],
                [
                    'name' => $profile[0],
                    'phone' => '+9715000010'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'role' => 'sender',
                    'status' => 'active',
                    'city' => $profile[1],
                    'country' => 'UAE',
                    'marketing_opt_in' => true,
                    'unsubscribe_token' => Str::random(40),
                    'password' => Hash::make('password'),
                ],
            );
        });

        $travelers = collect($travelerProfiles)->map(function (array $profile, int $index) {
            return User::updateOrCreate(
                ['email' => 'traveler'.($index + 1).'@peerbridge.test'],
                [
                    'name' => $profile[0],
                    'phone' => '+9715000020'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'role' => 'traveler',
                    'status' => 'active',
                    'city' => $profile[1],
                    'country' => 'UAE',
                    'marketing_opt_in' => true,
                    'unsubscribe_token' => Str::random(40),
                    'password' => Hash::make('password'),
                ],
            );
        });

        foreach ($extraSenderProfiles as $index => $profile) {
            User::updateOrCreate(
                ['email' => 'extrasender'.($index + 1).'@peerbridge.test'],
                [
                    'name' => $profile[0],
                    'phone' => '+9715000030'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'role' => 'sender',
                    'status' => 'active',
                    'city' => $profile[1],
                    'country' => 'UAE',
                    'marketing_opt_in' => true,
                    'unsubscribe_token' => Str::random(40),
                    'password' => Hash::make('password'),
                ],
            );
        }

        foreach ($extraTravelerProfiles as $index => $profile) {
            User::updateOrCreate(
                ['email' => 'extratraveler'.($index + 1).'@peerbridge.test'],
                [
                    'name' => $profile[0],
                    'phone' => '+9715000040'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'role' => 'traveler',
                    'status' => 'active',
                    'city' => $profile[1],
                    'country' => 'UAE',
                    'marketing_opt_in' => true,
                    'unsubscribe_token' => Str::random(40),
                    'password' => Hash::make('password'),
                ],
            );
        }

        $senderIds = User::query()->where('role', 'sender')->orderBy('id')->pluck('id');
        $travelerIds = User::query()->where('role', 'traveler')->orderBy('id')->pluck('id');

        $uaeCities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain'];
        $ethiopiaCities = ['Addis Ababa', 'Dire Dawa', 'Adama', 'Bahir Dar', 'Mekelle', 'Hawassa', 'Jimma', 'Gondar'];

        $descriptions = [
            'Documents and small electronics',
            'Clothes and personal items',
            'Phone accessories and gifts',
            'Medication and papers',
            'Shoes and family package',
            'Laptop accessories',
            'Important business documents',
            'Baby items and clothing',
            'Books and chargers',
            'Cosmetics and gifts',
            'Household items and textiles',
            'Sports equipment',
            'Art supplies',
            'Spare parts',
            'Food items (non-perishable)',
            'Care package for family',
        ];

        $receiverNames = [
            'Alem Kassa', 'Meron T.', 'Bereket H.', 'Genet A.', 'Kidist B.',
            'Tigist M.', 'Mulugeta F.', 'Dagmawi T.', 'Ruth H.', 'Samuel G.',
            'Yared T.', 'Eden M.', 'Kidan A.', 'Selam B.', 'Noah G.',
            'Hanna L.', 'Elias R.', 'Marta S.', 'Petros K.', 'Liya D.',
            'Daniel W.', 'Marta H.', 'Yonas T.', 'Helen A.', 'Biniam C.',
            'Saba M.', 'Omar F.', 'Nardos K.', 'Tewodros B.', 'Mihret A.',
        ];

        $travelStatuses = ['pending', 'approved', 'rejected'];
        $shipmentStatuses = ['pending', 'accepted', 'in_transit', 'delivered'];

        for ($i = 0; $i < 30; $i++) {
            $fromCity = $uaeCities[$i % count($uaeCities)];
            $toCity = $ethiopiaCities[$i % count($ethiopiaCities)];
            $travelDate = Carbon::now()->addDays(2 + $i);

            $travelerId = $travelerIds[$i % $travelerIds->count()];
            $senderId = $senderIds[$i % $senderIds->count()];

            $travel = Travel::create([
                'traveler_id' => $travelerId,
                'from_city' => $fromCity,
                'to_city' => $toCity,
                'departure_date' => $travelDate,
                'available_weight' => round(4 + ($i % 20) + 0.5, 2),
                'price_per_kg' => 28 + ($i % 25),
                'status' => $travelStatuses[$i % 3],
                'notes' => 'Sample route #'.($i + 1).' — flexible meetup; WhatsApp confirmation preferred.',
            ]);

            $shipment = Shipment::create([
                'sender_id' => $senderId,
                'receiver_name' => $receiverNames[$i],
                'receiver_phone' => '+251900'.str_pad((string) (1000 + $i), 4, '0', STR_PAD_LEFT),
                'from_city' => $fromCity,
                'to_city' => $toCity,
                'weight' => round(1 + ($i % 12) * 0.75, 2),
                'description' => $descriptions[$i % count($descriptions)],
                'travel_date' => $travelDate,
                'status' => $shipmentStatuses[$i % 4],
            ]);

            if ($i < 10) {
                $booking = Booking::create([
                    'shipment_id' => $shipment->id,
                    'travel_id' => $travel->id,
                    'sender_id' => $senderId,
                    'traveler_id' => $travelerId,
                    'price' => $travel->price_per_kg * $shipment->weight,
                    'commission' => 5 + ($i % 8),
                    'status' => match ($i % 4) {
                        0 => 'pending',
                        1 => 'confirmed',
                        2 => 'completed',
                        default => 'cancelled',
                    },
                ]);

                Review::updateOrCreate(
                    ['booking_id' => $booking->id],
                    [
                        'reviewer_id' => $senderId,
                        'reviewed_user_id' => $travelerId,
                        'rating' => ($i % 2 === 0) ? 5 : 4,
                        'comment' => 'Sample review #'.($i + 1).' for a trusted cross-border delivery experience.',
                    ],
                );
            }
        }
    }
}
