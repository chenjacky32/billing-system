<?php

namespace Tests\Feature\Billings;

use App\Events\BillingCreated;
use App\Models\ApartmentTower;
use App\Models\Billing;
use App\Models\BillingsCategory;
use App\Models\User;
use App\Models\UserApartmentOkgo;
use App\Models\Apartment;
use App\Models\BillingFineRules;
use App\Models\UserOkgo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Carbon\Carbon;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

class BillingControllerTest extends TestCase
{

    /**
     * A basic feature test example.
     *
     * @return void
     */
    
    use RefreshDatabase;
    
    protected User $user;

    public function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        
        Carbon::setTestNow(Carbon::now());
        Storage::fake('public');

        Event::fake(BillingCreated::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        // Clear the mocked time after each test
        Carbon::setTestNow(null);
    }

    /**
     * Positive Case
     */

    // it should validates and returns start meter for air type()
    public function test_it_should_validates_and_returns_start_meter_for_air_type()
    {    
        $apartment = Apartment::factory()->create([ 'id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 10, 'billing_type' => 'Air', 'apartment_id' => 5, 'created_by' => $this->user->id]);

        $owner = UserApartmentOkgo::factory()->create([
            'id'=> 26928,
            'apartmentId' => 5,
        ]);
        
        Billing::factory()->create([
            'id'=>'1',
            'billing_type' => 'Air',
            'residence_id' => $owner->id,
            'tower_id' => $tower->id,
            'period' => now()->subMonth()->startOfMonth(),
            'billing_fee'=> 396000,
            'billing_category_id' => $billCategory->id,
            'end_meter' => '1083',
            'created_by'=> $this->user->id,
        ]);

        $response = $this->post(route('billing.previousMeter'), [
            'billing_type' => 'Air',
            'period' => now()->startOfMonth()->format('Y-m-d'),
            'owner_id' => $owner->id,
            'room_no' => $owner->id,
            'tower_id' => $tower->id,
            'water_type' => $billCategory->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['new_start_meter' => 1083]);
    }
    
    // it should validates and returns start meter for listrik type()
    public function test_it_should_validates_and_returns_start_meter_for_listrik_type()
    {   
        $apartment = Apartment::factory()->create([ 'id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 2, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 11, 'billing_type' => 'Listrik', 'apartment_id' => 5, 'created_by' => $this->user->id]);

        $owner = UserApartmentOkgo::factory()->create([
            'id'=> 26930,
            'apartmentId' => 5,
        ]);
        
        Billing::factory()->create([
            'id'=>'2',
            'billing_type' => 'Listrik',
            'residence_id' => $owner->id,
            'tower_id' => $tower->id,
            'period' => now()->subMonth()->startOfMonth(),
            'billing_fee'=> 600000,
            'billing_category_id' => $billCategory->id,
            'end_meter' => '2323',
            'created_by'=> $this->user->id,
        ]);

        $response = $this->post(route('billing.previousMeter'), [
            'billing_type' => 'Listrik',
            'period' => now()->startOfMonth()->format('Y-m-d'),
            'owner_id' => $owner->id,
            'room_no' => $owner->id,
            'tower_id' => $tower->id,
            'electric_type' => $billCategory->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['new_start_meter' => 2323]);
    }
    
    // it should counts billing for air and listrik type
    public function test_it_should_counts_billing_for_air_and_listrik_type_when_previous_billing_is_didnt_paid()
    {   
        $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 10, 'billing_type' => 'Air', 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billFineRules = BillingFineRules::factory()->create(['id'=>1,'billing_type'=>'Air','apartment_id'=>5,
                                                                            'fine_rate_per_day'=> 5000,
                                                                            'max_fine'=>50000, 'percentage'=>0.00, 
                                                                            'due_date'=>10,'created_by'=>$this->user->id
                                                                        ]);

        $owner = UserApartmentOkgo::factory()->create([
            'id' => 2930,
            'userId'=> 111,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);

        $billingDate = now()->subMonth()->startOfMonth(); // misal: 2025-04-01
        $dueInDays = $billFineRules->due_date;
        $dueDate = $billingDate->copy()->addDays($dueInDays);


        $billing = Billing::factory()->create([
                        'id'=>'2',
                        'billing_type' => 'Air',
                        'billing_date'=> $billingDate->format('Y-m-d'),
                        'period'=> $billingDate->format('Y-m-d'),
                        'residence_id' => $owner->id,
                        'tower_id' => $tower->id,
                        'billing_fee'=> 400000,
                        'billing_category_id' => $billCategory->id,
                        'created_by'=> $this->user->id,
                        'fine' => 0,
                        'status'=> 'Pending',
                        'apartment_id'=> $apartment->id,
                        'paid_date'=> null,
                        'due_date'=> $dueDate->format('Y-m-d'),
                    ]);

        $data = [
            'billing_type' => 'Air',
            'apartment_id' => $apartment->id,
            'billing_date' => now()->format('Y-m-d'),
            'period' => now()->format('Y-m-d'),
            'owner_id' => $owner->id,
            'tower_id' => $tower->id,
            'room_no' => $owner->id,
            'start_meter' => 1247,
            'end_meter' => 1452,
            'unit_price' => 6000,
            'minimum_charge' => 0,
        ];

        $response = $this->post(route('billing.count'), $data);

        $response->assertStatus(200);
        $response->assertJson([
                        "statusCode"=> 200,
                        "message"=> "Tagihan berhasil dihitung.",
                        "billing_fee"=> 1230000,
                        "meter_reading"=> 205,
                        "fine"=> 50000,
                        "total_amount"=> 1280000
                    ]);
    }

    // it should count billing for maintenance type
    public function test_it_should_counts_billing_for_maintenance_type_when_previous_billing_is_didnt_paid(){
        $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 12, 'billing_type' => 'Maintenance', 'apartment_id' => 5, 'category_name' => 'Studio', 'unit_price' => 396000, 'created_by' => $this->user->id]);
        $billFineRules = BillingFineRules::factory()->create(['id'=>1,'billing_type'=>'Maintenance','apartment_id'=> 5,
                                                                            'fine_rate_per_day'=> 0,
                                                                            'max_fine'=>0, 'percentage'=>0.03, 
                                                                            'due_date'=>10,'created_by'=>$this->user->id
                                                                        ]);

        $owner = UserApartmentOkgo::factory()->create([
            'id' => 2935,
            'userId'=> 112,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);

        $billingDate = now()->subMonth()->startOfMonth(); // misal: 2025-04-01
        $dueInDays = $billFineRules->due_date;
        $dueDate = $billingDate->copy()->addDays($dueInDays);

        $billing = Billing::factory()->create([
                        'id'=>'5',
                        'billing_type' => 'Maintenance',
                        'billing_date'=> $billingDate->format('Y-m-d'),
                        'period'=> $billingDate->format('Y-m-d'),
                        'residence_id' => $owner->id,
                        'tower_id' => $tower->id,
                        'billing_fee'=> 396000,
                        'billing_category_id' => $billCategory->id,
                        'created_by'=> $this->user->id,
                        'fine' => 0,
                        'status'=> 'Pending',
                        'apartment_id'=> $apartment->id,
                        'paid_date'=> null,
                        'due_date'=> $dueDate->format('Y-m-d'),
                    ]);

        $data = [
            'billing_type' => 'Maintenance',
            'apartment_id' => $apartment->id,
            'billing_date' => now()->format('Y-m-d'),
            'period' => now()->format('Y-m-d'),
            'owner_id' => $owner->id,
            'tower_id' => $tower->id,
            'room_no' => $owner->id,
            'maintenance_type'=> $billCategory->id,
        ];

        $response = $this->post(route('billing.count'), $data);

        $response->assertStatus(200);
        $response->assertJson([
                        "statusCode"=> 200,
                        "message"=> "Tagihan berhasil dihitung.",
                        "billing_fee"=> 396000,
                        "fine"=> 11880,
                        "total_amount"=> 407880
                    ]);
    }
    
    // it should store new billing entry with billingType Air
    public function test_it_should_store_new_billing_entry_with_billingType_Air()
    {
        $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 12, 'billing_type' => 'Air', 'apartment_id' => 5, 'category_name' => 'Air', 'unit_price' => 6000, 'created_by' => $this->user->id]);

        $userOkgo = UserOkgo::factory()->create([
            'id' => 111992,
            'fullname' => 'Admin Mansyur Residence',
            'phone'=> '081234567892',
            'email' => 'test@example.com',
        ]);
        $owner = UserApartmentOkgo::factory()->create([
            'id' => 2936,
            'userId'=> $userOkgo->id,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);
        $billingDate = Carbon::now()->format('Y-m-d'); 
        $periodDate = Carbon::now()->format('Y-m-d'); 
        $dueInDays = 10;
        $dueDate = Carbon::now()->addDays($dueInDays)->format('Y-m-d');

        $startMeter = 300;
        $endMeter = 400;
        $meterReading = $endMeter - $startMeter;
        $billingFee = $meterReading * $billCategory->unit_price;

        $fakeImage = UploadedFile::fake()->image('meter_image.jpg');

        $expectedExtension = $fakeImage->extension(); // Ambil ekstensi dari fake image
        $expectedTimestamp = Carbon::now()->timestamp; // Gunakan timestamp dari waktu yang sudah di-setTestNow
        $expectedImagePath = 'end-meter-image/' . $expectedTimestamp . '.' . $expectedExtension;

        $data = [
            'billing_date' => $billingDate,
            'due_date' => $dueDate,
            'fine' => 0,
            'billing_type' => 'Air',
            'billing_fee' => $billingFee,
            'owner_id' => $owner->id,
            'room_no' => $owner->id,
            'period' => $periodDate,
            'tower_id' => $tower->id,
            'start_meter' => $startMeter,
            'end_meter' => $endMeter,
            'meter_reading' => $meterReading,
            'unit_price' => $billCategory->unit_price,
            'minimum_charge' => $billCategory->minimum_charge,
            'end_meter_image_path' => $fakeImage,
            'water_type' => $billCategory->id,
        ];

        $response = $this->post(route('billing.store'), $data);

        $response->assertRedirect('/billing');
        $response->assertSessionHas('success', 'New Billing has been created!');
        $this->assertDatabaseHas('billings', [
            'billing_date' => $billingDate,
            'due_date' => $dueDate,
            'fine' => 0,
            'billing_type' => 'Air',
            'billing_fee' => $billingFee,
            'residence_id' => $owner->id,
            'period' => $periodDate,
            'tower_id' => $tower->id,
            'billing_category_id' => $billCategory->id,
            'created_by' => $this->user->id,
            'start_meter' => $startMeter,
            'end_meter' => $endMeter,
            'meter_reading' => $meterReading,
            'unit_price' => $billCategory->unit_price,
            'total_amount' => $billingFee + 0,
            'minimum_charge' => $billCategory->minimum_charge,
            'end_meter_image_path' => $expectedImagePath,
        ]);
    }

    // it should store new billing entry with billingType Listrik
    public function test_it_should_store_new_billing_entry_with_billingType_Listrik()
    {
        $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 12, 'billing_type' => 'Listrik', 'apartment_id' => 5, 'category_name' => 'Studio', 'unit_price' => 2000, 'created_by' => $this->user->id]);

        $userOkgo = UserOkgo::factory()->create([
            'id' => 111991,
            'fullname' => 'Admin Mansyur Residence',
            'phone'=> '081234567891',
            'email' => 'test1@example.com',
        ]);
        $owner = UserApartmentOkgo::factory()->create([
            'id' => 2937,
            'userId'=> $userOkgo->id,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);
    
        $billingDate = Carbon::now()->format('Y-m-d'); // Ini akan menggunakan waktu yang sudah di-setTestNow
        $periodDate = Carbon::now()->format('Y-m-d');   // Ini akan menggunakan waktu yang sudah di-setTestNow
        $dueInDays = 10;
        $dueDate = Carbon::now()->addDays($dueInDays)->format('Y-m-d'); // Ini juga akan menggunakan waktu yang sudah di-setTestNow

        $startMeter = 300;
        $endMeter = 500;
        $meterReading = $endMeter - $startMeter;
        $billingFee = $meterReading * $billCategory->unit_price;

        // Buat file palsu
        $fakeImage = UploadedFile::fake()->image('meter_image.jpg'); // Beri nama yang jelas

        
        $expectedExtension = $fakeImage->extension(); // Ambil ekstensi dari fake image
        $expectedTimestamp = Carbon::now()->timestamp; // Gunakan timestamp dari waktu yang sudah di-setTestNow
        $expectedImagePath = 'end-meter-image/' . $expectedTimestamp . '.' . $expectedExtension;

        $data = [
            'billing_date' => $billingDate,
            'due_date' => $dueDate,
            'fine' => 0,
            'billing_type' => 'Listrik',
            'billing_fee' => $billingFee,
            'owner_id' => $owner->id,
            'room_no' => $owner->id,
            'period' => $periodDate,
            'tower_id' => $tower->id,
            'start_meter' => $startMeter,
            'end_meter' => $endMeter,
            'meter_reading' => $meterReading,
            'unit_price' => $billCategory->unit_price,
            'minimum_charge' => $billCategory->minimum_charge,
            'end_meter_image_path' => $fakeImage,
            'electric_type' => $billCategory->id,
        ];

        $response = $this->post(route('billing.store'), $data);

        $response->assertRedirect('/billing');
        $response->assertSessionHas('success', 'New Billing has been created!');
        $this->assertDatabaseHas('billings', [
            'billing_date' => $billingDate,
            'due_date' => $dueDate,
            'fine' => 0,
            'billing_type' => 'Listrik',
            'billing_fee' => $billingFee,
            'residence_id' => $owner->id,
            'period' => $periodDate,
            'tower_id' => $tower->id,
            'billing_category_id' => $billCategory->id,
            'created_by' => $this->user->id,
            'start_meter' => $startMeter,
            'end_meter' => $endMeter,
            'meter_reading' => $meterReading,
            'unit_price' => $billCategory->unit_price,
            'total_amount' => $billingFee + 0,
            'minimum_charge' => $billCategory->minimum_charge,
            'end_meter_image_path' => $expectedImagePath,
        ]);
    }

    // it should store new billing entry with billingType Maintenance
    public function test_it_should_store_new_billing_entry_with_billingType_Maintenance()
    {
         $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 12, 'billing_type' => 'Maintenance', 'apartment_id' => 5, 'category_name' => 'Studio', 'unit_price' => 396000, 'created_by' => $this->user->id]);

        $userOkgo = UserOkgo::factory()->create([
            'id' => 111984,
            'fullname' => 'Admin Mansyur Residence',
            'phone'=> '081234567437',
            'email' => 'test12@example.com',
        ]);
        $owner = UserApartmentOkgo::factory()->create([
            'id' => 2988,
            'userId'=> $userOkgo->id,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);
        $billingDate = now()->subMonth()->startOfMonth();
        $dueInDays = 10;
        $dueDate = $billingDate->copy()->addDays($dueInDays);

        $data = [
            'billing_date' => now()->format('Y-m-d'),
            'due_date' => $dueDate->format('Y-m-d'),
            'fine' => 0,
            'billing_type' => 'Maintenance',
            'billing_fee' => $billCategory->unit_price,
            'owner_id' => $owner->id,
            'room_no' => $owner->id,
            'period' => now()->format('Y-m-d'),
            'tower_id' => $tower->id,
            'maintenance_type' => $billCategory->id,
        ];

        $response = $this->post(route('billing.store'), $data);

        $response->assertRedirect('/billing');
        $response->assertSessionHas('success', 'New Billing has been created!');
        $this->assertDatabaseHas('billings', [
            'billing_date' => now()->format('Y-m-d'),
            'due_date' => $dueDate->format('Y-m-d'),
            'fine' => 0,
            'billing_type' => 'Maintenance',
            'billing_fee' => $billCategory->unit_price,
            'residence_id' => $owner->id,
            'period' => now()->format('Y-m-d'),
            'tower_id' => $tower->id,
            'billing_category_id' => $billCategory->id,
            'created_by' => $this->user->id,
            'total_amount' => $billCategory->unit_price,
        ]);
    }

    // it should update existing billingType for Air type
    public function test_it_should_updates_existing_billingType_for_Air_type()
    {
        $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 12, 'billing_type' => 'Air', 'apartment_id' => 5, 'category_name' => 'Air', 'unit_price' => 6000, 'created_by' => $this->user->id]);

        $userOkgo = UserOkgo::factory()->create([
            'id' => 2221992,
            'fullname' => 'Admin Mansyur Residence',
            'phone'=> '081234567892',
            'email' => 'testt1@example.com',
        ]);
        $owner = UserApartmentOkgo::factory()->create([
            'id' => 29361,
            'userId'=> $userOkgo->id,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);
        $billingDate = Carbon::now()->format('Y-m-d'); 
        $periodDate = Carbon::now()->format('Y-m-d'); 
        $dueInDays = 10;
        $dueDate = Carbon::now()->addDays($dueInDays)->format('Y-m-d');

        $startMeter = 3300;
        $endMeter = 4200;
        $meterReading = $endMeter - $startMeter;
        $billingFee = $meterReading * $billCategory->unit_price;

        $fakeImage = UploadedFile::fake()->image('meter_image.jpg');

        $expectedExtension = $fakeImage->extension(); // Ambil ekstensi dari fake image
        $expectedTimestamp = Carbon::now()->timestamp; // Gunakan timestamp dari waktu yang sudah di-setTestNow
        $expectedImagePath = 'end-meter-image/' . $expectedTimestamp . '.' . $expectedExtension;

        $data = [
            'billing_type' => 'Air',
            'billing_category_id' => $billCategory->id,
            'billing_fee' => $billingFee,
            'billing_date' => $billingDate,
            'period' => $periodDate,
            'meter_reading' => $meterReading,
            'fine' => 0,
            'total_amount' => $billingFee + 0,
            'due_date' => $dueDate,
            'created_by' => $this->user->id,    
            'apartment_id' => $apartment->id,
            'residence_id' => $owner->id,
            'tower_id' => $tower->id,
            'start_meter' => $startMeter,
            'end_meter' => $endMeter,
            'unit_price' => $billCategory->unit_price,
            'minimum_charge' => $billCategory->minimum_charge,
            'end_meter_image_path' => $fakeImage,
        ];

        $existingBilling = Billing::factory()->create($data);
        
        $updatedData = [
            'billing_date' => $billingDate,
            'due_date' => $dueDate,
            'billing_type' => 'Air',
            'owner_id' => $owner->id,
            'water_type' => $billCategory->id,
            'room_no' => $owner->id,
            'period' => $periodDate,
            'tower_id' => $tower->id,
            'status' => 'Success',
            'is_paid' => 1,
            'paid_date' => Carbon::now()->format('Y-m-d'),
            'start_meter' => 123123,
            'end_meter' => 123222,
            'meter_reading' => 99,
            'unit_price' => 3200,
            'minimum_charge' => 50000,
            'billing_fee' => 316800,
            'fine' => 20000,
            'total_amount' => 336800,
        ];

        $response = $this->post(route('billing.update',$existingBilling['id']), $updatedData);
        
        $response->assertRedirect('/billing');
        $response->assertSessionHas('success', 'Billing data has been updated!');
        $this->assertDatabaseHas('billings', [
            'id' => $existingBilling['id'],
            'billing_type' => 'Air',
            'billing_category_id' => $billCategory->id,
            'billing_fee' => $updatedData['billing_fee'],
            'billing_date'=> $billingDate,
            'period'=> $periodDate,
            'meter_reading'=> $updatedData['meter_reading'],
            'is_paid'=> $updatedData['is_paid'],
            'paid_date'=> $updatedData['paid_date'],
            'fine'=> $updatedData['fine'],
            'total_amount'=> $updatedData['total_amount'],
            'due_date'=> $dueDate,
            'status'=> $updatedData['status'],
            'created_by'=> $this->user->id,
            'apartment_id'=> $apartment->id,
            'residence_id'=> $owner->id,
            'tower_id'=> $tower->id,
            'start_meter'=> $updatedData['start_meter'],
            'end_meter'=> $updatedData['end_meter'],
            'unit_price'=> $updatedData['unit_price'],
            'minimum_charge'=> $updatedData['minimum_charge'],
        ]);
    }

    // it should update existing billingType for Listrik type
    public function test_it_should_updates_existing_billingType_for_Listrik_type()
    {
        $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 13, 'billing_type' => 'Listrik', 'apartment_id' => 5, 'category_name' => 'Studio', 'unit_price' => 2000, 'created_by' => $this->user->id]);

        $userOkgo = UserOkgo::factory()->create([
            'id' => 2231932,
            'fullname' => 'Admin Mansyur Residence',
            'phone'=> '081245597895',
            'email' => 'testt144@example.com',
        ]);
        $owner = UserApartmentOkgo::factory()->create([
            'id' => 296321,
            'userId'=> $userOkgo->id,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);
        $billingDate = Carbon::now()->format('Y-m-d'); 
        $periodDate = Carbon::now()->format('Y-m-d'); 
        $dueInDays = 10;
        $dueDate = Carbon::now()->addDays($dueInDays)->format('Y-m-d');

        $startMeter = 3340;
        $endMeter = 4210;
        $meterReading = $endMeter - $startMeter;
        $billingFee = $meterReading * $billCategory->unit_price;

        $fakeImage = UploadedFile::fake()->image('meter_image.jpg');

        $expectedExtension = $fakeImage->extension(); // Ambil ekstensi dari fake image
        $expectedTimestamp = Carbon::now()->timestamp; // Gunakan timestamp dari waktu yang sudah di-setTestNow
        $expectedImagePath = 'end-meter-image/' . $expectedTimestamp . '.' . $expectedExtension;

        $data = [
            'billing_type' => 'Listrik',
            'billing_category_id' => $billCategory->id,
            'billing_fee' => $billingFee,
            'billing_date' => $billingDate,
            'period' => $periodDate,
            'meter_reading' => $meterReading,
            'fine' => 0,
            'total_amount' => $billingFee + 0,
            'due_date' => $dueDate,
            'created_by' => $this->user->id,    
            'apartment_id' => $apartment->id,
            'residence_id' => $owner->id,
            'tower_id' => $tower->id,
            'start_meter' => $startMeter,
            'end_meter' => $endMeter,
            'unit_price' => $billCategory->unit_price,
            'minimum_charge' => $billCategory->minimum_charge,
            'end_meter_image_path' => $fakeImage,
        ];

        $existingBilling = Billing::factory()->create($data);
        
        $updatedData = [
            'billing_date' => $billingDate,
            'due_date' => $dueDate,
            'billing_type' => 'Listrik',
            'owner_id' => $owner->id,
            'electric_type' => $billCategory->id,
            'room_no' => $owner->id,
            'period' => $periodDate,
            'tower_id' => $tower->id,
            'status' => 'Success',
            'is_paid' => 1,
            'paid_date' => Carbon::now()->format('Y-m-d'),
            'start_meter' => 123123,
            'end_meter' => 123222,
            'meter_reading' => 99,
            'unit_price' => 3200,
            'minimum_charge' => 50000,
            'billing_fee' => 316800,
            'fine' => 25000,
            'total_amount' => 341800,
        ];

        $response = $this->post(route('billing.update',$existingBilling['id']), $updatedData);
        
        $response->assertRedirect('/billing');
        $response->assertSessionHas('success', 'Billing data has been updated!');
        $this->assertDatabaseHas('billings', [
            'id' => $existingBilling['id'],
            'billing_type' => 'Listrik',
            'billing_category_id' => $billCategory->id,
            'billing_fee' => $updatedData['billing_fee'],
            'billing_date'=> $billingDate,
            'period'=> $periodDate,
            'meter_reading'=> $updatedData['meter_reading'],
            'is_paid'=> $updatedData['is_paid'],
            'paid_date'=> $updatedData['paid_date'],
            'fine'=> $updatedData['fine'],
            'total_amount'=> $updatedData['total_amount'],
            'due_date'=> $dueDate,
            'status'=> $updatedData['status'],
            'created_by'=> $this->user->id,
            'apartment_id'=> $apartment->id,
            'residence_id'=> $owner->id,
            'tower_id'=> $tower->id,
            'start_meter'=> $updatedData['start_meter'],
            'end_meter'=> $updatedData['end_meter'],
            'unit_price'=> $updatedData['unit_price'],
            'minimum_charge'=> $updatedData['minimum_charge'],
        ]);
    }

    // it should update existing billingType for Maintenance type
    public function test_it_should_updates_existing_billingType_for_Maintenance_type()
    {
        $apartment = Apartment::factory()->create(['id' => 5,
                        'name' => 'Mansyur Residence',
                        'address' => 'Jl Dr. Mansyur No.165, Tanjung Rejo, Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
                        'total_room' => 587,
                        'created_by' => $this->user->id,
                    ]);
        $tower = ApartmentTower::factory()->create(['id' => 1, 'apartment_id' => 5, 'created_by' => $this->user->id]);
        $billCategory = BillingsCategory::factory()->create(['id' => 15, 'billing_type' => 'Maintenance', 'apartment_id' => 5, 'category_name' => 'Studio', 'unit_price' => 396000, 'created_by' => $this->user->id]);

        $userOkgo = UserOkgo::factory()->create([
            'id' => 2211762,
            'fullname' => 'Admin Mansyur Residence',
            'phone'=> '081287654321',
            'email' => 'testt14@example.com',
        ]);
        $owner = UserApartmentOkgo::factory()->create([
            'id' => 203328,
            'userId'=> $userOkgo->id,
            'apartmentId' => 5,
            'apartmentTowerId' => 1
        ]);
        $billingDate = Carbon::now()->format('Y-m-d'); 
        $periodDate = Carbon::now()->format('Y-m-d'); 
        $dueInDays = 10;
        $dueDate = Carbon::now()->addDays($dueInDays)->format('Y-m-d');

        $billingFee = $billCategory->unit_price;

        $fakeImage = UploadedFile::fake()->image('meter_image.jpg');

        $expectedExtension = $fakeImage->extension(); // Ambil ekstensi dari fake image
        $expectedTimestamp = Carbon::now()->timestamp; // Gunakan timestamp dari waktu yang sudah di-setTestNow
        $expectedImagePath = 'end-meter-image/' . $expectedTimestamp . '.' . $expectedExtension;

        $data = [
            'billing_type' => 'Maintenance',
            'billing_category_id' => $billCategory->id,
            'billing_fee' => $billingFee,
            'billing_date' => $billingDate,
            'period' => $periodDate,
            'fine' => 24330,
            'total_amount' => $billingFee + 24330,
            'due_date' => $dueDate,
            'created_by' => $this->user->id,    
            'apartment_id' => $apartment->id,
            'residence_id' => $owner->id,
            'tower_id' => $tower->id,
        ];

        $existingBilling = Billing::factory()->create($data);
        
        $updatedData = [
            'billing_date' => $billingDate,
            'due_date' => $dueDate,
            'billing_type' => 'Maintenance',
            'owner_id' => $owner->id,
            'maintenance_type' => $billCategory->id,
            'room_no' => $owner->id,
            'period' => $periodDate,
            'tower_id' => $tower->id,
            'status' => 'Success',
            'is_paid' => 1,
            'paid_date' => Carbon::now()->format('Y-m-d'),
            'minimum_charge' => 0,
            'billing_fee' => $billingFee,
            'fine' => 20000,
            'total_amount' => 416000,
        ];

        $response = $this->post(route('billing.update',$existingBilling['id']), $updatedData);
        
        $response->assertRedirect('/billing');
        $response->assertSessionHas('success', 'Billing data has been updated!');
        $this->assertDatabaseHas('billings', [
            'id' => $existingBilling['id'],
            'billing_type' => 'Maintenance',
            'billing_category_id' => $billCategory->id,
            'billing_fee' => $updatedData['billing_fee'],
            'billing_date'=> $billingDate,
            'period'=> $periodDate,
            'is_paid'=> $updatedData['is_paid'],
            'paid_date'=> $updatedData['paid_date'],
            'fine'=> $updatedData['fine'],
            'total_amount'=> $updatedData['total_amount'],
            'due_date'=> $dueDate,
            'status'=> $updatedData['status'],
            'created_by'=> $this->user->id,
            'apartment_id'=> $apartment->id,
            'residence_id'=> $owner->id,
            'tower_id'=> $tower->id,
        ]);
    }

}

