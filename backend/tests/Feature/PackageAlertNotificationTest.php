<?php

namespace Tests\Feature;

use App\Mail\PackageAlertMatchedMail;
use App\Models\PackageAlert;
use App\Models\PackageNotification;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PackageAlertNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_package_alert(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/package-alerts', [
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'start_date' => now()->subDays(5)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'email_notify' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('alert.from_city', 'Addis Ababa')
            ->assertJsonPath('alert.to_city', 'Dubai');

        $this->assertDatabaseHas('package_alerts', [
            'user_id' => $user->id,
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
        ]);
    }

    public function test_posting_matching_package_triggers_email_and_notification(): void
    {
        Mail::fake();

        // User A sets up route alert
        $userA = User::factory()->create(['email' => 'userA@example.com']);
        $alert = PackageAlert::create([
            'user_id' => $userA->id,
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'start_date' => now()->subDays(5)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'email_notify' => true,
            'is_active' => true,
        ]);

        // User B posts a matching package
        $userB = User::factory()->create(['email' => 'userB@example.com']);

        $response = $this->actingAs($userB, 'sanctum')->postJson('/api/shipments', [
            'receiver_name' => 'John Doe',
            'receiver_phone' => '251911223344',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 5.5,
            'description' => 'Coffee beans and gifts',
            'travel_date' => now()->addDays(5)->toDateString(),
        ]);

        $response->assertStatus(201);

        // Verify Mail was sent to User A
        Mail::assertSent(PackageAlertMatchedMail::class, function ($mail) use ($userA) {
            return $mail->hasTo('userA@example.com');
        });

        // Verify PackageNotification was created in DB for User A
        $this->assertDatabaseHas('package_notifications', [
            'user_id' => $userA->id,
            'package_alert_id' => $alert->id,
        ]);
    }
}
