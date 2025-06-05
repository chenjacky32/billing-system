<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserApartmentOkgo>
 */
class UserApartmentOkgoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            //
        ];
    }

    public function configure()
    {
        return $this->afterMaking(function ($model) {
            $model->setConnection('okgo_testing');
        })->afterCreating(function ($model) {
            $model->setConnection('okgo_testing');
        });
    }
}
