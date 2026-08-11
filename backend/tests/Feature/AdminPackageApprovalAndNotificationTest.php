<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\AdminNotification;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminPackageApprovalAndNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_posting_package_sets_approval_status_pending_and_creates_admin_notification(): void
    {
        $user = User::factory()->create(['name' => 'Alice Sender']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/shipments', [
            'receiver_name' => 'Bob Receiver',
            'receiver_phone' => '251911223344',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 6.0,
            'description' => 'Coffee beans parcel',
            'travel_date' => '2026-08-30',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('shipment.approval_status', 'pending');

        $shipmentId = $response->json('shipment.id');

        // Check AdminNotification in DB
        $this->assertDatabaseHas('admin_notifications', [
            'shipment_id' => $shipmentId,
            'user_id' => $user->id,
            'type' => 'new_package',
            'is_read' => false,
        ]);

        // Pending approval shipment MUST NOT be visible on open public API endpoint
        $openRes = $this->getJson('/api/shipments/open');
        $openRes->assertStatus(200);
        $this->assertEmpty($openRes->json('shipments'));
    }

    public function test_admin_can_approve_package_making_it_visible_to_frontend_open_api(): void
    {
        $admin = Admin::create([
            'name' => 'Admin Boss',
            'email' => 'admin_boss@example.com',
            'password' => Hash::make('password'),
        ]);

        $user = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'John Doe',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 3.5,
            'status' => 'pending',
            'approval_status' => 'pending',
            'travel_date' => '2026-08-28',
        ]);

        AdminNotification::create([
            'shipment_id' => $shipment->id,
            'user_id' => $user->id,
            'type' => 'new_package',
            'title' => 'New Package Posted: Addis Ababa ➔ Dubai',
            'message' => 'User posted new package',
            'is_read' => false,
        ]);

        // Prior to approval: hidden from public open shipments
        $openBefore = $this->getJson('/api/shipments/open');
        $this->assertEmpty($openBefore->json('shipments'));

        // Admin approves shipment
        $approveResponse = $this->actingAs($admin, 'admin')->patch(route('admin.shipments.approve', $shipment));
        $approveResponse->assertRedirect();

        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'approval_status' => 'approved',
        ]);

        // After approval: visible on public open shipments endpoint!
        $openAfter = $this->getJson('/api/shipments/open');
        $openAfter->assertStatus(200);
        $this->assertCount(1, $openAfter->json('shipments'));
        $this->assertEquals($shipment->id, $openAfter->json('shipments.0.id'));
    }

    public function test_admin_can_reject_package_keeping_it_hidden(): void
    {
        $admin = Admin::create([
            'name' => 'Admin Boss',
            'email' => 'admin_boss@example.com',
            'password' => Hash::make('password'),
        ]);

        $user = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'Jane Smith',
            'from_city' => 'Dubai',
            'to_city' => 'Addis Ababa',
            'weight' => 4.0,
            'status' => 'pending',
            'approval_status' => 'pending',
            'travel_date' => '2026-08-29',
        ]);

        $rejectResponse = $this->actingAs($admin, 'admin')->patch(route('admin.shipments.reject', $shipment));
        $rejectResponse->assertRedirect();

        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'approval_status' => 'rejected',
        ]);

        $openAfter = $this->getJson('/api/shipments/open');
        $this->assertEmpty($openAfter->json('shipments'));
    }

    public function test_open_shipments_endpoint_returns_pagination_metadata(): void
    {
        $user = User::factory()->create();

        foreach (range(1, 21) as $index) {
            Shipment::create([
                'sender_id' => $user->id,
                'receiver_name' => "Receiver {$index}",
                'from_city' => 'Addis Ababa',
                'to_city' => 'Dubai',
                'weight' => 1.0,
                'status' => 'pending',
                'approval_status' => 'approved',
                'deal_status' => 'pending',
            ]);
        }

        $firstPage = $this->getJson('/api/shipments/open?per_page=20');
        $firstPage->assertOk()
            ->assertJsonCount(20, 'shipments')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.total', 21)
            ->assertJsonPath('meta.has_more', true);

        $secondPage = $this->getJson('/api/shipments/open?per_page=20&page=2');
        $secondPage->assertOk()
            ->assertJsonCount(1, 'shipments')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.has_more', false);
    }

    public function test_open_shipments_endpoint_filters_by_route_and_urgency(): void
    {
        $user = User::factory()->create();
        $addisToDubai = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'Dubai Receiver',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 1.0,
            'status' => 'pending',
            'approval_status' => 'approved',
            'deal_status' => 'pending',
            'is_urgent' => false,
        ]);
        $urgentDubaiToAddis = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'Addis Receiver',
            'from_city' => 'Dubai',
            'to_city' => 'Addis Ababa',
            'weight' => 1.0,
            'status' => 'pending',
            'approval_status' => 'approved',
            'deal_status' => 'pending',
            'is_urgent' => true,
        ]);

        $routeResponse = $this->getJson('/api/shipments/open?from_city=Addis%20Ababa&to_city=Dubai');
        $routeResponse->assertOk()
            ->assertJsonCount(1, 'shipments')
            ->assertJsonPath('shipments.0.id', $addisToDubai->id);

        $urgentResponse = $this->getJson('/api/shipments/open?is_urgent=1');
        $urgentResponse->assertOk()
            ->assertJsonCount(1, 'shipments')
            ->assertJsonPath('shipments.0.id', $urgentDubaiToAddis->id);
    }
}
