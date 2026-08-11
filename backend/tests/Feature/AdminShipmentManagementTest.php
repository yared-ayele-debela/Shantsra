<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\PackageCategory;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminShipmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_shipment_list_with_first_photo(): void
    {
        $admin = Admin::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $user = User::factory()->create();

        $shipment = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'Jane Smith',
            'receiver_phone' => '251911998877',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 4.5,
            'description' => 'Electronics and clothes',
            'product_images' => ['shipments/sample.jpg'],
            'travel_date' => '2026-08-25',
            'status' => 'pending',
        ]);

        $this->assertEquals(asset('storage/shipments/sample.jpg'), $shipment->first_photo_url);

        $response = $this->actingAs($admin, 'admin')->get(route('admin.shipments.index'));
        $response->assertStatus(200);
        $response->assertSee('Addis Ababa to Dubai');
        $response->assertSee(asset('storage/shipments/sample.jpg'));
    }

    public function test_admin_can_edit_and_update_user_shipment(): void
    {
        $admin = Admin::create([
            'name' => 'Admin User',
            'email' => 'admin2@example.com',
            'password' => Hash::make('password'),
        ]);

        $user = User::factory()->create();
        $category = PackageCategory::create(['name' => 'Electronics', 'is_active' => true]);

        $shipment = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'Old Name',
            'receiver_phone' => '1111111111',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 2.0,
            'description' => 'Original description',
            'travel_date' => '2026-08-15',
            'status' => 'pending',
        ]);

        // Access edit form
        $response = $this->actingAs($admin, 'admin')->get(route('admin.shipments.edit', $shipment));
        $response->assertStatus(200);
        $response->assertSee('Old Name');

        // Update shipment details
        $updateResponse = $this->actingAs($admin, 'admin')->put(route('admin.shipments.update', $shipment), [
            'receiver_name' => 'Updated Receiver Name',
            'receiver_phone' => '999888777',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Abu Dhabi',
            'weight' => 8.5,
            'category_id' => $category->id,
            'description' => 'Updated description by admin',
            'travel_date' => '2026-09-01',
            'is_urgent' => true,
            'status' => 'accepted',
        ]);

        $updateResponse->assertRedirect(route('admin.shipments.show', $shipment));

        $this->assertDatabaseHas('shipments', [
            'id' => $shipment->id,
            'receiver_name' => 'Updated Receiver Name',
            'receiver_phone' => '999888777',
            'to_city' => 'Abu Dhabi',
            'weight' => 8.5,
            'category_id' => $category->id,
            'description' => 'Updated description by admin',
            'is_urgent' => true,
            'status' => 'accepted',
        ]);
    }

    public function test_admin_can_use_advanced_filters_on_shipments(): void
    {
        $admin = Admin::create([
            'name' => 'Admin Filter Test',
            'email' => 'admin_filter@example.com',
            'password' => Hash::make('password'),
        ]);

        $user = User::factory()->create();

        // Shipment 1: Addis -> Dubai, pending, 5kg
        $shipment1 = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'Target Match Package',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'weight' => 5.0,
            'status' => 'pending',
            'is_urgent' => true,
            'travel_date' => '2026-08-20',
        ]);

        // Shipment 2: Nairobi -> London, delivered, 15kg
        $shipment2 = Shipment::create([
            'sender_id' => $user->id,
            'receiver_name' => 'Unmatched Package',
            'from_city' => 'Nairobi',
            'to_city' => 'London',
            'weight' => 15.0,
            'status' => 'delivered',
            'is_urgent' => false,
            'travel_date' => '2026-09-10',
        ]);

        // Filter by keyword search
        $res = $this->actingAs($admin, 'admin')->get(route('admin.shipments.index', ['search' => 'Target Match']));
        $res->assertStatus(200);
        $res->assertSee('Target Match Package');
        $res->assertDontSee('Unmatched Package');

        // Filter by status & route
        $res2 = $this->actingAs($admin, 'admin')->get(route('admin.shipments.index', [
            'status' => 'pending',
            'from_city' => 'Addis Ababa',
            'to_city' => 'Dubai',
            'max_weight' => 10.0,
            'is_urgent' => '1',
        ]));
        $res2->assertStatus(200);
        $res2->assertSee('Target Match Package');
        $res2->assertDontSee('Unmatched Package');
    }
}
