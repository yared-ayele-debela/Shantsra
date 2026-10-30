<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BannerTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_banner_endpoint_returns_only_visible_banners_for_placement(): void
    {
        Banner::create([
            'title' => 'Home promotion',
            'placement' => 'home',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        Banner::create([
            'title' => 'Inactive banner',
            'placement' => 'home',
            'is_active' => false,
        ]);
        Banner::create([
            'title' => 'Expired banner',
            'placement' => 'home',
            'is_active' => true,
            'end_date' => now()->subMinute(),
        ]);
        Banner::create([
            'title' => 'All pages banner',
            'placement' => 'all',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $this->getJson('/api/banners?placement=home')
            ->assertOk()
            ->assertJsonPath('banners.0.title', 'Home promotion')
            ->assertJsonPath('banners.1.title', 'All pages banner')
            ->assertJsonCount(2, 'banners');
    }

    public function test_public_hero_endpoint_returns_only_hero_banners(): void
    {
        Banner::create([
            'title' => 'Homepage hero',
            'placement' => 'hero',
            'image_path' => 'banners/hero.jpg',
            'is_active' => true,
        ]);
        Banner::create([
            'title' => 'All pages banner',
            'placement' => 'all',
            'image_path' => 'banners/all-pages.jpg',
            'is_active' => true,
        ]);

        $this->getJson('/api/banners?placement=hero')
            ->assertOk()
            ->assertJsonPath('banners.0.title', 'Homepage hero')
            ->assertJsonPath('banners.0.placement', 'hero')
            ->assertJsonCount(1, 'banners');
    }

    public function test_banner_management_requires_admin_authentication(): void
    {
        $this->get('/admin/banners')
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_create_a_banner_with_an_image(): void
    {
        $admin = Admin::create([
            'name' => 'Banner Admin',
            'email' => 'banner-admin@example.com',
            'password' => 'password',
        ]);

        $this->actingAs($admin, 'admin')
            ->post('/admin/banners', [
                'title' => 'Weekend delivery offer',
                'badge' => 'Limited time',
                'description' => 'Save on approved deliveries this weekend.',
                'bg_gradient' => 'linear-gradient(135deg, #14532D, #0F3F22)',
                'cta_text' => 'Browse packages',
                'cta_link' => '/packages',
                'placement' => 'home',
                'is_active' => 1,
                'sort_order' => 2,
                'start_date' => now()->format('Y-m-d H:i:s'),
                'end_date' => now()->addWeek()->format('Y-m-d H:i:s'),
            ])
            ->assertRedirect(route('admin.banners.index'));

        $this->assertDatabaseHas('banners', [
            'title' => 'Weekend delivery offer',
            'placement' => 'home',
            'is_active' => 1,
        ]);
    }
}
