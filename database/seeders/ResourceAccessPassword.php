<?php

namespace Database\Seeders;

use App\Models\ResourceAccessPassword as ModelsResourceAccessPassword;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ResourceAccessPassword extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ModelsResourceAccessPassword::create([
            'password' => Hash::make('Password123'),
            'apartment_id' => 4,
        ]);

        ModelsResourceAccessPassword::create([
            'password' => Hash::make('Password321'), 
            'apartment_id' => 5,
        ]);
    }
}
