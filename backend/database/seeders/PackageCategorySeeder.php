<?php

namespace Database\Seeders;

use App\Models\PackageCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PackageCategorySeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $categories = [
            'All Items' => 'General category for any package type.',
            'Documents' => 'Passports, papers, certificates, and other documents.',
            'Coffee & Spices' => 'Coffee beans, ground coffee, and packaged spices.',
            'Electronics' => 'Phones, chargers, accessories, and small gadgets.',
            'Clothing & Textiles' => 'Clothes, fabrics, garments, and related textile items.',
            'Cosmetics & Beauty' => 'Skincare, makeup, and beauty products.',
            'Medicine & Healthcare' => 'Medicines, supplements, and healthcare supplies.',
            'Personal Gifts' => 'Gift items for friends, family, and special occasions.',
            'Other Items' => 'Items that do not fit into the standard categories.',
        ];

        foreach ($categories as $name => $description) {
            PackageCategory::updateOrCreate(
                ['name' => $name],
                [
                    'description' => $description,
                    'is_active' => true,
                ],
            );
        }
    }
}
