<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'description' => 'Best for new users who post a small number of packages.',
                'monthly_post_limit' => 10,
                'yearly_post_limit' => 120,
                'monthly_price' => 9.99,
                'yearly_price' => 99.99,
                'is_active' => true,
            ],
            [
                'name' => 'Standard',
                'description' => 'For active users who post packages regularly.',
                'monthly_post_limit' => 30,
                'yearly_post_limit' => 360,
                'monthly_price' => 24.99,
                'yearly_price' => 249.99,
                'is_active' => true,
            ],
            [
                'name' => 'Premium',
                'description' => 'For heavy users with the highest monthly and yearly limits.',
                'monthly_post_limit' => 50,
                'yearly_post_limit' => 600,
                'monthly_price' => 39.99,
                'yearly_price' => 399.99,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $plan['name']],
                $plan,
            );
        }
    }
}
