<?php

namespace Tests\Feature;

use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShipmentInquiryAndAutoPauseTest extends TestCase
{
    use RefreshDatabase;

    public function test_traveler_inquiry_increments_inquiry_count(): void
    {
        $sender = User::factory()->create();
        $traveler = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $sender->id,
            'receiver_name' => 'John Doe',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 2.0,
            'status' => 'pending',
            'approval_status' => 'approved',
            'deal_status' => 'pending',
            'inquiry_count' => 0,
            'is_paused_by_inquiries' => false,
            'travel_date' => now()->addDays(5)->toDateString(),
        ]);

        $response = $this->actingAs($traveler, 'sanctum')->postJson("/api/shipments/{$shipment->id}/inquire", [
            'contact_type' => 'whatsapp',
        ]);

        $response->assertOk()
            ->assertJsonPath('inquiry_count', 1)
            ->assertJsonPath('is_paused', false);

        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'inquiry_count' => 1,
            'is_paused_by_inquiries' => false,
        ]);

        $this->assertDatabaseHas('shipment_inquiries', [
            'shipment_id' => $shipment->id,
            'user_id' => $traveler->id,
            'contact_type' => 'whatsapp',
        ]);
    }

    public function test_duplicate_inquiries_by_same_traveler_do_not_inflate_count(): void
    {
        $sender = User::factory()->create();
        $traveler = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $sender->id,
            'receiver_name' => 'John Doe',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 2.0,
            'status' => 'pending',
            'approval_status' => 'approved',
            'deal_status' => 'pending',
            'inquiry_count' => 0,
            'is_paused_by_inquiries' => false,
            'travel_date' => now()->addDays(5)->toDateString(),
        ]);

        // First click
        $this->actingAs($traveler, 'sanctum')->postJson("/api/shipments/{$shipment->id}/inquire", ['contact_type' => 'whatsapp']);
        // Second click
        $this->actingAs($traveler, 'sanctum')->postJson("/api/shipments/{$shipment->id}/inquire", ['contact_type' => 'call']);
        // Third click
        $response = $this->actingAs($traveler, 'sanctum')->postJson("/api/shipments/{$shipment->id}/inquire", ['contact_type' => 'copy']);

        $response->assertOk()->assertJsonPath('inquiry_count', 1);

        $this->assertEquals(1, Shipment::find($shipment->id)->inquiry_count);
    }

    public function test_five_inquiries_auto_pauses_shipment_and_hides_from_directory(): void
    {
        $sender = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $sender->id,
            'receiver_name' => 'John Doe',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 2.0,
            'status' => 'pending',
            'approval_status' => 'approved',
            'deal_status' => 'pending',
            'inquiry_count' => 0,
            'is_paused_by_inquiries' => false,
            'travel_date' => now()->addDays(5)->toDateString(),
        ]);

        // 5 distinct travelers inquire
        foreach (range(1, 5) as $i) {
            $traveler = User::factory()->create();
            $this->actingAs($traveler, 'sanctum')->postJson("/api/shipments/{$shipment->id}/inquire", [
                'contact_type' => 'whatsapp',
            ]);
        }

        $freshShipment = $shipment->fresh();
        $this->assertEquals(5, $freshShipment->inquiry_count);
        $this->assertTrue((bool) $freshShipment->is_paused_by_inquiries);

        // Verify hidden from public open directory
        $openResponse = $this->getJson('/api/shipments/open');
        $openResponse->assertOk();
        $this->assertEmpty($openResponse->json('shipments'));
    }

    public function test_sender_can_reactivate_paused_shipment(): void
    {
        $sender = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $sender->id,
            'receiver_name' => 'John Doe',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 2.0,
            'status' => 'pending',
            'approval_status' => 'approved',
            'deal_status' => 'pending',
            'inquiry_count' => 5,
            'is_paused_by_inquiries' => true,
            'travel_date' => now()->addDays(5)->toDateString(),
        ]);

        // Prior to reactivation: hidden from public open directory
        $openBefore = $this->getJson('/api/shipments/open');
        $this->assertEmpty($openBefore->json('shipments'));

        // Sender reactivates
        $reactivateRes = $this->actingAs($sender, 'sanctum')->postJson("/api/shipments/{$shipment->id}/reactivate");
        $reactivateRes->assertOk()
            ->assertJsonPath('shipment.inquiry_count', 0)
            ->assertJsonPath('shipment.is_paused_by_inquiries', false);

        $freshShipment = $shipment->fresh();
        $this->assertEquals(0, $freshShipment->inquiry_count);
        $this->assertFalse((bool) $freshShipment->is_paused_by_inquiries);

        // After reactivation: visible on public open directory
        $openAfter = $this->getJson('/api/shipments/open');
        $openAfter->assertOk();
        $this->assertCount(1, $openAfter->json('shipments'));
        $this->assertEquals($shipment->id, $openAfter->json('shipments.0.id'));
    }

    public function test_confirming_no_deal_reactivates_paused_shipment(): void
    {
        $sender = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $sender->id,
            'receiver_name' => 'John Doe',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 2.0,
            'status' => 'pending',
            'approval_status' => 'approved',
            'deal_status' => 'pending',
            'inquiry_count' => 5,
            'is_paused_by_inquiries' => true,
            'travel_date' => now()->addDays(5)->toDateString(),
        ]);

        $response = $this->actingAs($sender, 'sanctum')->postJson('/api/deals/confirm', [
            'shipment_id' => $shipment->id,
            'status' => 'no_deal',
        ]);

        $response->assertStatus(201);

        $fresh = $shipment->fresh();
        $this->assertEquals(0, $fresh->inquiry_count);
        $this->assertFalse((bool) $fresh->is_paused_by_inquiries);

        // Open directory now displays the shipment
        $openAfter = $this->getJson('/api/shipments/open');
        $openAfter->assertOk();
        $this->assertCount(1, $openAfter->json('shipments'));
    }
}
