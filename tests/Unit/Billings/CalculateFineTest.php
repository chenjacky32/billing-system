<?php

namespace Tests\Unit\Billings;

use App\Http\Controllers\BillingController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Billing;
use App\Models\BillingFineRules;
use App\Models\UserApartmentOkgo;
use App\Models\Apartment;
use App\Models\ApartmentTower;
use App\Models\BillingsCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Tests\TestCase;

class CalculateFineTest extends TestCase
{
    protected BillingController $controller;
    protected User $user;

    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2025-06-04'));
        $this->controller = new BillingController();
        $this->user = User::factory()->create();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        Carbon::setTestNow(); // reset time
    }

    private function createRequest(array $data): Request
    {
        return Request::create('/calculate-fine', 'POST', $data);
    }

    /** @test */
    public function it_calculates_fine_for_air_type()
    {   
        $apartment = Apartment::factory()->create([
            'name' => 'Mansyur Residence',
            'address' => 'test',
            'total_room' => 587,
            'created_by' => $this->user->id
        ]);

        $owner = UserApartmentOkgo::factory()->create([
            'apartmentId' => $apartment->id
        ]);
        
        $tower = ApartmentTower::factory()->create([
            'apartment_id' => $apartment->id,
            'created_by' => $this->user->id
        ]);

        $billCategory = BillingsCategory::factory()->create([
            'billing_type' => 'Air',
            'category_name' => 'Air',
            'unit_price' => 6000,
            'apartment_id' => $apartment->id,
            'created_by' => $this->user->id
        ]);

        Billing::factory()->create([
            'residence_id' => $owner->id,
            'apartment_id' => $apartment->id,
            'tower_id' => $tower->id,
            'billing_category_id' => $billCategory->id,
            'billing_type' => 'Air',
            'period' => '2025-05-01',
            'due_date' => '2025-05-30',
            'billing_fee' => 50000,
            'status' => 'Pending',
            'created_by' => $this->user->id
        ]);

        BillingFineRules::factory()->create([
            'billing_type' => 'Air',
            'apartment_id' => $apartment->id,
            'fine_rate_per_day' => 5000,
            'due_date' => '10',
            'max_fine' => 50000,
            'created_by' => $this->user->id
        ]);

        $fine = $this->controller->calculateFine(
            $this->createRequest([
                'period' => '2025-06-01',
                'apartment_id' => $apartment->id,
                'billing_date' => '2025-06-04',
                'billing_type' => 'Air'
            ]),
            'Air',
            $owner->id
        );

        $this->assertEquals(25000, $fine);
    }

    /** @test */
    public function it_calculates_fine_for_listrik_type()
    {   
        $apartment = Apartment::factory()->create([
            'name' => 'Mansyur Residence',
            'address' => 'test',
            'total_room' => 587,
            'created_by' => $this->user->id
        ]);

        $owner = UserApartmentOkgo::factory()->create([
            'apartmentId' => $apartment->id
        ]);
        
        $tower = ApartmentTower::factory()->create([
            'apartment_id' => $apartment->id,
            'created_by' => $this->user->id
        ]);

        $billCategory = BillingsCategory::factory()->create([
            'billing_type' => 'Listrik',
            'category_name' => 'Studio',
            'unit_price' => 2000,
            'apartment_id' => $apartment->id,
            'created_by' => $this->user->id
        ]);


        Billing::factory()->create([
            'residence_id' => $owner->id,
            'apartment_id' => $apartment->id,
            'tower_id' => $tower->id,
            'billing_category_id' => $billCategory->id,
            'billing_type' => 'Listrik',
            'period' => '2025-05-01',
            'due_date' => '2025-05-20',
            'billing_fee' => 700000,
            'status' => 'Pending',
            'created_by' => $this->user->id
        ]);

        BillingFineRules::factory()->create([
            'billing_type' => 'Listrik',
            'apartment_id' => $apartment->id,
            'fine_rate_per_day' => 5000,
            'due_date' => '10',
            'max_fine' => 100000,
            'created_by' => $this->user->id
        ]);

        $fine = $this->controller->calculateFine(
            $this->createRequest([
                'period' => '2025-06-01',
                'apartment_id' => $apartment->id,
                'billing_date' => '2025-06-04',
                'billing_type' => 'Listrik'
            ]),
            'Listrik',
            $owner->id
        );

        $this->assertEquals(75000, $fine);
    }

    /** @test */
    public function it_calculates_fine_for_maintenance_type()
    {
        $apartment = Apartment::factory()->create([
            'name' => 'Mansyur Residence',
            'address' => 'test',
            'total_room' => 587,
            'created_by' => $this->user->id
        ]);

        $owner = UserApartmentOkgo::factory()->create([
            'apartmentId' => $apartment->id
        ]);
        
        $tower = ApartmentTower::factory()->create([
            'apartment_id' => $apartment->id,
            'created_by' => $this->user->id
        ]);

        $billCategory = BillingsCategory::factory()->create([
            'billing_type' => 'Maintenance',
            'category_name' => 'Studio',
            'unit_price' => 2000,
            'apartment_id' => $apartment->id,
            'created_by' => $this->user->id
        ]);

        Billing::factory()->create([
            'residence_id' => $owner->id,
            'apartment_id' => $apartment->id,
            'tower_id' => $tower->id,
            'billing_category_id' => $billCategory->id,
            'billing_type' => 'Maintenance',
            'period' => '2025-05-01',
            'due_date' => '2025-05-30',
            'billing_fee' => 300000,
            'status' => 'Pending',
            'created_by' => $this->user->id
        ]);

        BillingFineRules::factory()->create([
            'billing_type' => 'Maintenance',
            'apartment_id' => $apartment->id,
            'fine_rate_per_day' => 0,
            'max_fine' => 100000,
            'percentage' => 0.03,
            'created_by' => $this->user->id
        ]);

        $fine = $this->controller->calculateFine(
            $this->createRequest([
                'period' => '2025-06-01',
                'apartment_id' => $apartment->id,
                'billing_date' => '2025-06-04',
                'billing_type' => 'Maintenance'
            ]),
            'Maintenance',
            $owner->id
        );

        $this->assertEquals(9000, $fine); // 3% dari 300000
    }
}
