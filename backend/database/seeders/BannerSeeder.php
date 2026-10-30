<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Send with confidence between Ethiopia and the UAE',
                'badge' => 'Welcome to PeerBridge',
                'description' => 'Connect with verified travelers carrying approved packages on their planned trips.',
                'bg_gradient' => 'linear-gradient(135deg, #14532D, #0F3F22)',
                'cta_text' => 'Send a package',
                'cta_link' => '/packages',
                'placement' => 'home',
                'sort_order' => 1,
            ],
            [
                'title' => 'Travelers can earn from available space',
                'badge' => 'For travelers',
                'description' => 'Share your planned route and help deliver approved items while offsetting your travel costs.',
                'bg_gradient' => 'linear-gradient(135deg, #E6EFE9, #F6EAD0)',
                'cta_text' => 'Become a traveler',
                'cta_link' => '/travelers',
                'placement' => 'home',
                'sort_order' => 2,
            ],
            [
                'title' => 'Save on your next delivery',
                'badge' => 'Special offer',
                'description' => 'Browse available travelers and find a convenient route for your package.',
                'bg_gradient' => 'linear-gradient(135deg, #1F6B43, #14532D)',
                'cta_text' => 'Find a traveler',
                'cta_link' => '/travelers',
                'placement' => 'packages',
                'sort_order' => 1,
            ],
            [
                'title' => 'Turn your next trip into extra income',
                'badge' => 'For travelers',
                'description' => 'Post your planned route and help deliver approved items while offsetting travel costs.',
                'bg_gradient' => 'linear-gradient(135deg, #14532D, #2E8B57)',
                'cta_text' => 'Post your trip',
                'cta_link' => '/dashboard',
                'placement' => 'travelers',
                'sort_order' => 1,
            ],
            [
                'title' => 'Your delivery journey starts here',
                'badge' => 'Quick start',
                'description' => 'Review your activity, manage listings, and keep every delivery organized in one place.',
                'bg_gradient' => 'linear-gradient(135deg, #0F3F22, #14532D)',
                'cta_text' => 'Open dashboard',
                'cta_link' => '/dashboard',
                'placement' => 'dashboard',
                'sort_order' => 1,
            ],
            [
                'title' => 'Safe, approved, and transparent',
                'badge' => 'Our promise',
                'description' => 'Learn how verification, approved-item policies, and secure payments protect every journey.',
                'bg_gradient' => 'linear-gradient(135deg, #14532D, #1F6B43)',
                'cta_text' => 'Learn more',
                'cta_link' => '/safety',
                'placement' => 'safety',
                'sort_order' => 1,
            ],
            [
                'title' => 'New routes, trusted connections',
                'badge' => 'PeerBridge',
                'description' => 'Discover a simpler way to send packages with people already traveling your route.',
                'bg_gradient' => 'linear-gradient(135deg, #0F3F22, #14532D)',
                'cta_text' => 'Explore PeerBridge',
                'cta_link' => '/',
                'placement' => 'all',
                'sort_order' => 10,
                'start_date' => Carbon::now()->subDay(),
                'end_date' => Carbon::now()->addMonths(3),
            ],
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(
                [
                    'title' => $banner['title'],
                    'placement' => $banner['placement'],
                ],
                array_merge([
                    'is_active' => true,
                    'start_date' => null,
                    'end_date' => null,
                ], $banner),
            );
        }
    }
}
