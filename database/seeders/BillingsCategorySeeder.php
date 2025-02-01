<?php

namespace Database\Seeders;

use App\Models\BillingsCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BillingsCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        $billingCategories = [
            [
                'billing_type' => 'Maintenance',
                'category_name' => 'Studio',
                'apartment_id' => 2,
                'unit_price' => 396000,
                'created_by' => 3
            ],
            [
                'billing_type' => 'Maintenance',
                'category_name' => '2 BR',
                'apartment_id' => 2,
                'unit_price' => 792000,
                'created_by' => 3
            ],
            [
                'billing_type' => 'Parkir',
                'category_name' => 'Sepeda Motor',
                'apartment_id' => 2,
                'unit_price' => 150000,
                'created_by' => 3
            ],
            [
                'billing_type' => 'Parkir',
                'category_name' => 'Mobil',
                'apartment_id' => 2,
                'unit_price' => 300000,
                'created_by' => 3
            ],
        ];

        foreach ($billingCategories as $category) {
            BillingsCategory::create($category);
        }
    }
}
