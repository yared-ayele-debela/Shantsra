<?php

namespace Tests\Feature;

use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_shell_contains_crawlable_metadata_and_content(): void
    {
        $this->get('/faq')
            ->assertOk()
            ->assertSee('<title>Frequently asked questions | Shantasra</title>', false)
            ->assertSee('name="description"', false)
            ->assertSee('rel="canonical"', false)
            ->assertSee('hreflang="am"', false)
            ->assertSee('application/ld+json', false)
            ->assertSee('data-seo-content', false);
    }

    public function test_sitemap_and_robots_are_public_and_include_required_rules(): void
    {
        $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $this->get('/robots.txt')
            ->assertOk()
            ->assertSee('Disallow: /admin')
            ->assertSee('Disallow: /api')
            ->assertSee('Sitemap:');
    }

    public function test_unknown_public_routes_are_real_404s(): void
    {
        $this->get('/does-not-exist')->assertNotFound();
    }

    public function test_expired_approved_shipments_are_gone(): void
    {
        $shipment = Shipment::create([
            'sender_id' => User::factory()->create()->id,
            'receiver_name' => 'Package recipient',
            'from_city' => 'Dubai',
            'to_city' => 'Addis Ababa',
            'description' => 'Expired package',
            'weight' => 1,
            'approval_status' => 'approved',
            'travel_date' => now()->subDay(),
        ]);

        $this->get("/packages/{$shipment->id}-".\Illuminate\Support\Str::slug($shipment->description ?: "Package from {$shipment->from_city} to {$shipment->to_city}"))
            ->assertStatus(410);
    }

    public function test_private_contact_data_is_not_rendered_in_public_package_html(): void
    {
        $shipment = Shipment::create([
            'sender_id' => User::factory()->create()->id,
            'receiver_name' => 'Package recipient',
            'from_city' => 'Dubai',
            'to_city' => 'Addis Ababa',
            'weight' => 1,
            'approval_status' => 'approved',
            'travel_date' => now()->addDays(3),
            'description' => 'Coffee delivery contact 251911223344 or private@example.com',
        ]);

        $response = $this->followingRedirects()->get("/packages/{$shipment->id}-coffee-delivery-contact-private-contact-removed");
        $response->assertOk()
            ->assertDontSee('251911223344')
            ->assertDontSee('private@example.com');
    }

    public function test_private_routes_send_noindex_header(): void
    {
        $this->get('/dashboard')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertSee('name="robots" content="noindex,follow"', false);
    }
}
