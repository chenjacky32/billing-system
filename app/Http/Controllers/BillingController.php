<?php

namespace App\Http\Controllers;

use App\Events\BillingCreated;
use App\Events\BillingPaid;
use App\Models\Apartment;
use App\Models\ApartmentOwner;
use App\Models\ApartmentTower;
use App\Models\Billing;
use App\Models\BillingFineRules;
use App\Models\BillingsCategory;
use App\Models\UserApartmentOkgo;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class BillingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $userApartId = $user->apartment_id;
        $ApartmentId = Apartment::find($userApartId);

        return Inertia::render('Billing/Billing', [
            'apartmentId'=> $ApartmentId,
            'filters' => $request->only('search', 'status'),  // Include 'status' in the filters
            'data' => Billing::with(['owner', 'createdBy','tower', 'residence.user'])
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->when($request->has('search'), function ($query) use ($request) {
                    $searchTerm = $request->input('search');
                
                    $matchingResidenceIds = UserApartmentOkgo::whereHas('user', function ($q) use ($searchTerm) {
                            $q->where('fullname', 'like', "%$searchTerm%");
                        })
                        ->orWhere('roomNo', 'like', "%$searchTerm%")
                        ->pluck('id') // Ambil hanya kolom `id`
                        ->toArray();
                
                    $query->whereIn('residence_id', $matchingResidenceIds);
                })
                ->when($request->filled('status'), function ($query) use ($request) {  // Check if 'status' is not only present but also filled
                    $status = $request->input('status');
                    $query->where('status', $status);
                })
                ->orderByDesc('id')
                ->paginate(10),
        ]);
    }

    public function add()
    {

        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;

        // query to get the water price
        $WaterPrice = BillingsCategory::where('apartment_id', $apartmentId)
        ->where('billing_type','Air')
        ->where('category_name','PDAM')
        ->first();

        if($WaterPrice){
            $WaterPriceData = $WaterPrice->unit_price ?? null;
            $waterPriceId = $WaterPrice->id ?? null;
            $WaterPriceMinimumCharge = $WaterPrice->minimum_charge ?? null;
        } else{
            $WaterPriceData = 'Price Water not found';
        }


        // $ownerQuery = ApartmentOwner::query();
        $categoryBillingQuery = BillingsCategory::query();
        $towerQuery = ApartmentTower::query();
        $userApartmentsQuery = UserApartmentOkgo::with(['user'])->where('active', 1);
        $billingFineRules = BillingFineRules::query();
        
        if ($role !== 'SUPER ADMIN') {
            // $ownerQuery->where('apartment_id', $apartmentId);
            $categoryBillingQuery->where('apartment_id', $apartmentId);
            $towerQuery->where('apartment_id', $apartmentId);
            
            $apartmentTowerIds = ApartmentTower::where('apartment_id', $user->apartment_id)
            ->pluck('id')
            ->toArray();

            $userApartmentsQuery->whereIn('apartmentTowerId', $apartmentTowerIds);
            $billingFineRules->where('apartment_id', $apartmentId);
        }

        // $owner_data = $ownerQuery->pluck('owner_name', 'id')
        //     ->map(function ($ownerName, $ownerId) {
        //         return ['label' => $ownerName, 'value' => $ownerId];
        //     })
        //     ->prepend(['label' => 'Pilih Owner', 'value' => ''])
        //     ->values()
        //     ->toArray();

        // $room_number = $ownerQuery->get()->map( function ($owner) {
        //     return [
        //         'label' => $owner->room_no,
        //         'value' => $owner->id,
        //     ];
        // })->prepend([
        //     'label' => 'Pilih Room Number',
        //     'value' => '',
        // ])->values()->toArray();

        $room_number = $userApartmentsQuery->get()->map(function ($userApartment) {
            return [
                'ownerName' => $userApartment->user->fullname,
                'apartmentTowerId'=> $userApartment->apartmentTowerId,
                'label' => $userApartment->roomNo,
                'value' => $userApartment->id
            ];
        })->prepend([
            'label' => 'Pilih Nomor Unit',
            'value' => '',
        ])->values()->toArray();

        $category_billing_data = $categoryBillingQuery
            ->get(['id','billing_type','category_name','unit_price','minimum_charge'])
            ->groupBy('billing_type')
            ->map(function ($categories, $billingType) {
                return [
                    'billing_type' => $billingType,
                    'categories' => $categories->map(function ($category) {
                        return [
                            'label' => $category->category_name,
                            'value' => $category->id,
                            'price' => $category->unit_price,
                            'minimum_charge' => $category->minimum_charge
                            ];
                })->values(),
            ];
        })
        ->values()
        ->prepend(['billing_type' => 'Pilih Kategori', 'categories' => []]) // Elemen default
        ->toArray();

       $tower_data = $towerQuery->get()->map( function ($tower) {
        return [
            'label' => $tower->tower_name,
            'value' => $tower->id
        ];
        })->prepend([
            'label' => 'Pilih Tower',
            'value' => '',
        ])->values()->toArray();

        $getBillingTypeDueDays = $billingFineRules->get()->groupBy('apartment_id')->map(function ($items, $apartmentId) {
            return [
                'apartmentId' => $apartmentId,
                'billingTypeRules' => $items->map(function ($item) {
                    return [
                        'billingType' => $item->billing_type,
                        'due_days' => $item->due_date, 
                    ];
                })->values()->toArray(),
            ];
        })
        ->values()
        ->toArray();

        // $userOkgo = $userApartmentsQuery->get()->map(function ($userApartment) {
        //     return [
        //         'label' => $userApartment->user->fullname,
        //         'value' => $userApartment->id
        //     ];
        // })->prepend([
        //     'label' => 'Pilih Residence',
        //     'value' => '',
        // ])->values()->toArray();
        

        if($role === "SUPER ADMIN") {
            return Inertia::render("Billing/AddBilling", [
                // 'ownerData' => $owner_data,
                // 'residenceData'=>$userOkgo,
                'roomNumber' => $room_number,
                'billingCategory'=>$category_billing_data,
                'towerData' => $tower_data,
                'billingDueDays'=>$getBillingTypeDueDays,
            ]);
        } else {
            return Inertia::render("Billing/AddBilling", [
                // 'ownerData' => $owner_data,
                // 'residenceData'=>$userOkgo,
                'roomNumber' => $room_number,
                'billingCategory'=>$category_billing_data,
                'towerData' => $tower_data,
                'WaterPriceData'=>$WaterPriceData,
                'WaterPriceMinimumCharge'=>$WaterPriceMinimumCharge,
                'waterPriceId' => $waterPriceId,
                'apartmentId' => $apartmentId,
                'billingDueDays'=>$getBillingTypeDueDays,
        ]);
            }
    }

    public function store(Request $request)
    {
        // Define the base validation rules
        $rules = [
            'billing_date' => 'required|date',
            'due_date' => 'required|date',
            'fine' => 'required|integer|min:0|max:999999999999999',
            'billing_type' => 'required|string|in:Air,Listrik,Parkir,Maintenance',
            'billing_fee' => 'required|integer|min:1|max:999999999999999',
            'owner_id' => 'required|integer',
            'room_no' => 'required|integer|min:1|max:999999999999999',
            'period' => 'required|date',
            'tower_id' => 'required|integer|exists:apartment_tower,id',
        ];

        // Log::info("Request ALL",[$request->all()]);

        // Conditionally add start_meter, end_meter, unit_price, minimum_charge if billing_type is Air or Listrik
        if(in_array($request->input('billing_type'), ['Listrik','Air'])) {
            $rules['meter_reading'] = 'required|integer|min:1|max:999999999999999';
            $rules['start_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['end_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['unit_price'] = 'required|integer|min:1|max:999999999999999';
            $rules['minimum_charge'] = 'required|integer|min:0|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Listrik'])) {
            $rules['electric_type']= 'required|integer|min:1|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Air'])) {
            $rules['water_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Maintenance'])) {
            $rules['maintenance_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Parkir'])) {
            $rules['vehicle_type_parking'] = 'required|integer|min:1|max:999999999999999';
        }

        // Validate the incoming data with the dynamically adjusted rules
        $validatedData = $request->validate($rules);

        // Add user_id to the validated data from the authenticated user
        $validatedData['created_by'] = Auth::id();
        
        // Retrieve the billing category ID based on billing_type
        if($request->input('billing_type') === 'Air') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Air',
                'id' => $request->input('water_type')
            ])->first();
        } 
        elseif ($request->input('billing_type') === 'Listrik') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Listrik',
                'id' => $request->input('electric_type')
            ])->first();
        } 
        elseif ($request->input('billing_type') === 'Maintenance') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Maintenance',
                'id' => $request->input('maintenance_type')
            ])->first();
        } 
        elseif ($request->input('billing_type') === 'Parkir') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Parkir',
                'id' => $request->input('vehicle_type_parking')
            ])->first();
        } else {
            $billingCategory = null;
        }

         // Check if billing category exists
        if (in_array($request->input('billing_type'), ['Maintenance', 'Parkir']) && !$billingCategory) {
            return back()->with('error', 'Billing Category not found.');
        }

        $validatedData['billing_category_id'] = $billingCategory ? $billingCategory->id : null;

        $ownerId = $request->input('owner_id');  
        $ownerApartment =  UserApartmentOkgo::findOrFail($ownerId);
        $apartmentId = $ownerApartment->apartmentId;
        $validatedData['apartment_id'] = $apartmentId;
        $validatedData['residence_id'] = $ownerId;
        $validatedData['owner_id'] = NULL;
        // $owner = ApartmentOwner::findOrFail($ownerId);
        // $apartmentId = $owner->apartment_id;
        // $validatedData['apartment_id'] = $apartmentId;

        // Store the validated data in the billing table
        $billing = Billing::create($validatedData);

        // $pdf = Pdf::loadView('pdf.invoice', compact('billing'));
        // $pdfPath = storage_path("app/temp/invoice_{$billing->id}.pdf");
        // $pdf->save($pdfPath);
        
        // event(new BillingCreated($billing,$pdfPath));
        return redirect('/billing')->with('success', 'New Billing has been created!');
    }

    public function edit(Billing $billing, Request $request)
    {

        $user = Auth::user();
        $role = $user->role;
        $apartment_id = $user->apartment_id;
        $billingData = $billing->find($request->id);
        $billingApartmentId = $billingData->apartment_id;

                // query to get the water price
        $WaterPrice = BillingsCategory::where('apartment_id', $apartment_id)
        ->where('billing_type','Air')
        ->where('category_name','PDAM')
        ->first();
        
        if($WaterPrice){
            $WaterPriceData = $WaterPrice->unit_price ?? null;
            $waterPriceId = $WaterPrice->id ?? null;
            $WaterPriceMinimumCharge = $WaterPrice->minimum_charge ?? null;
        } else{
            $WaterPriceData = 'Price Water not found';
        }
        
        // $ownerQuery = ApartmentOwner::query();
        $categoryBillingQuery = BillingsCategory::query();
        $towerQuery = ApartmentTower::query();
        $userApartmentsQuery = UserApartmentOkgo::with(['user'])->where('active', 1);
        $billingFineRules = BillingFineRules::query();


        if ($role !== 'SUPER ADMIN') {
            // $ownerQuery->where('apartment_id', $apartment_id);
            $categoryBillingQuery->where('apartment_id', $apartment_id);
            $towerQuery->where('apartment_id', $apartment_id);
            
            $apartmentTowerIds = ApartmentTower::where('apartment_id', $user->apartment_id)
            ->pluck('id')
            ->toArray();

            $userApartmentsQuery->whereIn('apartmentTowerId', $apartmentTowerIds);
            $billingFineRules->where('apartment_id', $apartment_id);
        }

        // $owner_data = $ownerQuery->pluck('owner_name', 'id')
        //     ->map(function ($ownerName, $ownerId) {
        //         return ['label' => $ownerName, 'value' => $ownerId];
        //     })
        //     ->prepend(['label' => 'Pilih Owner', 'value' => ''])
        //     ->values()
        //     ->toArray();

        //     $room_number = $ownerQuery->get()->map( function ($owner) {
        //         return [
        //             'label' => $owner->room_no,
        //             'value' => $owner->id,
        //         ];
        //     })->prepend([
        //         'label' => 'Pilih Room Number',
        //         'value' => '',
        //     ])->values()->toArray();

        $room_number = $userApartmentsQuery->get()->map(function ($userApartment) {
            return [
                'ownerName' => $userApartment->user->fullname,
                'apartmentTowerId'=> $userApartment->apartmentTowerId,
                'label' => $userApartment->roomNo,
                'value' => $userApartment->id
            ];
        })->prepend([
            'label' => 'Pilih Nomor Unit',
            'value' => '',
        ])->values()->toArray();

            $category_billing_data = $categoryBillingQuery
            ->get(['id','billing_type','category_name','unit_price','minimum_charge'])
            ->groupBy('billing_type')
            ->map(function ($categories, $billingType) {
                return [
                    'billing_type' => $billingType,
                    'categories' => $categories->map(function ($category) {
                        return [
                            'label' => $category->category_name,
                            'value' => $category->id,
                            'price' => $category->unit_price,
                            'minimum_charge' => $category->minimum_charge
                        ];
                    })->values(),
                ];
            })
            ->values()
            ->prepend(['billing_type' => 'Pilih Kategori', 'categories' => []]) // Elemen default
            ->toArray();

            $tower_data = $towerQuery->get()->map( function ($tower) {
                return [
                    'label' => $tower->tower_name,
                    'value' => $tower->id
                ];
            })->prepend([
                'label' => 'Pilih Tower',
                'value' => '',
            ])->values()->toArray();

            $userOkgo = $userApartmentsQuery->get()->map(function ($userApartment) {
                return [
                    'label' => $userApartment->user->fullname,
                    'value' => $userApartment->id
                ];
            })->prepend([
                'label' => 'Pilih Residence',
                'value' => '',
            ])->values()->toArray();
    

        if ($role === 'SUPER ADMIN') {
            return Inertia::render('Billing/EditBilling', [
                // 'ownerData' => $owner_data,
                // 'residenceData'=>$userOkgo,
                "billingData" => $billing->find($request->id),
                'billingCategory' => $category_billing_data,
                'roomNumber' => $room_number,
                'towerData' => $tower_data,
            ]);
        } else {
            if ($apartment_id == $billingApartmentId) {
                return Inertia::render('Billing/EditBilling', [
                    // 'ownerData' => $owner_data,
                    // 'residenceData'=>$userOkgo,
                    'roomNumber' => $room_number,
                    "billingData" => $billing->find($request->id),
                    'billingCategory' => $category_billing_data,
                    'towerData' => $tower_data,
                    'apartmentId' => $apartment_id,
                    'WaterPriceData'=>$WaterPriceData,
                    'WaterPriceMinimumCharge'=>$WaterPriceMinimumCharge,
                    'waterPriceId' => $waterPriceId
                ]);
            } else {
                return redirect('/unauthorized');
            }
        }
    }

    public function update(Request $request, $id)
    {
        $billing = Billing::findOrFail($id);
        // Define the base validation rules
        $rules = [
            'billing_date' => 'required|date',
            'due_date' => 'required|date',
            'fine' => 'required|integer|min:0|max:999999999999999',
            'billing_type' => 'required|string|in:Air,Listrik,Parkir,Maintenance',
            'billing_fee' => 'required|integer|min:1|max:999999999999999',
            'owner_id' => 'required|integer',
            'room_no' => 'required|integer|min:1|max:999999999999999',
            'status' => 'required|string|in:Success,Cancel,Pending',
            'period' => 'required|date',
            'tower_id' => 'required|integer|exists:apartment_tower,id',
        ];

        // Log::info('Request ALL', [$request->all()]);

        // Conditionally add start_meter, end_meter, unit_price, minimum_charge if billing_type is Listrik
        if(in_array($request->input('billing_type'), ['Listrik','Air'])){
            $rules['meter_reading'] = 'required|integer|min:1|max:999999999999999';
            $rules['start_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['end_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['unit_price'] = 'required|integer|min:1|max:999999999999999';
            $rules['minimum_charge'] = 'required|integer|min:0|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Listrik'])) {
            $rules['electric_type']= 'required|integer|min:1|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Air'])) {
            $rules['water_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Maintenance'])) {
            $rules['maintenance_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if(in_array($request->input('billing_type'), ['Parkir'])) {
            $rules['vehicle_type_parking'] = 'required|integer|min:1|max:999999999999999';
        }

        // Conditionally add the paid_date validation if status is Success
        if ($request->input('status') === 'Success') {
            $rules['paid_date'] = 'required|date';
        }

        // Validate the incoming data with the dynamically adjusted rules
        $validatedData = $request->validate($rules);

        // Set meter_reading to null if billing_type is Parkir or Maintenance
        if (in_array($request->input('billing_type'), ['Parkir', 'Maintenance'])) {
            $validatedData['meter_reading'] = null;
            $validatedData['start_meter'] = null;
            $validatedData['end_meter'] = null;
            $validatedData['unit_price'] = null;
            $validatedData['minimum_charge'] = 0;
        }

        if ($request->input('status') !== 'Success') {
            $validatedData['paid_date'] = null;
            $validatedData['is_paid'] = 0;
        } else {
            $validatedData['is_paid'] = 1;
        }

        // Retrieve the billing category ID based on billing_type
        if($request->input('billing_type') === 'Air') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Air',
                'id' => $request->input('water_type')
            ])->first();
        } 
        elseif ($request->input('billing_type') === 'Listrik') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Listrik',
                'id' => $request->input('electric_type')
            ])->first();
        } 
        elseif ($request->input('billing_type') === 'Maintenance') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Maintenance',
                'id' => $request->input('maintenance_type')
            ])->first();
        } elseif ($request->input('billing_type') === 'Parkir') {
            $billingCategory = BillingsCategory::where([
                'billing_type' => 'Parkir',
                'id' => $request->input('vehicle_type_parking')
            ])->first();
        } else {
            $billingCategory = null;
        }

         // Check if billing category exists
        if (in_array($request->input('billing_type'), ['Maintenance', 'Parkir']) && !$billingCategory) {
            return back()->with('error', 'Billing Category not found.');
        }

        $validatedData['billing_category_id'] = $billingCategory ? $billingCategory->id : null;

        $ownerId = $request->input('owner_id');
        $ownerApartment = UserApartmentOkgo::findOrFail($ownerId);
        $apartmentId = $ownerApartment->apartmentId;
        $validatedData['apartment_id'] = $apartmentId;
        $validatedData['residence_id'] = $ownerId;
        $validatedData['owner_id'] = NULL;
        // $owner = ApartmentOwner::findOrFail($ownerId);
        // $apartment_id = $owner->apartment_id;
        // $validatedData['apartment_id'] = $apartment_id;

        // Update the billing record
        $billing->update($validatedData);

        // if ($request->input('status') === 'Success') {
        //     event(new BillingPaid($billing));
        // }

        return redirect('/billing')->with('success', 'Billing data has been updated!');
    }

    public function destroy(Request $request)
    {
        $billing = Billing::find($request->id);
        $billing->delete();
        return redirect('/billing')->with('success', 'Billing data has been deleted!');
    }

    public function calculateFine(Request $request, $billingType, $ownerId) {
        // Log::info('Calculating fine', ['billingType' => $billingType, 'ownerId' => $ownerId]);

        if (!in_array($billingType, ['Air', 'Listrik','Maintenance'])) {
            // Log::info('Billing type not eligible for fine calculation', ['billingType' => $billingType]);
            return 0;
        }

        $previousPeriod = Carbon::parse($request->period)->subMonth()->format('Y-m-01');

        $previousBilling = Billing::where('residence_id', $ownerId)
        ->where('billing_type', $billingType)
        ->where('apartment_id', $request->apartment_id)
        ->where('period', $previousPeriod) // Ambil periode 1 bulan sebelumnya
        ->where(function ($query) {
            $query->where('status', 'Pending')
                  ->orWhere(function($query){
                    $query->where('status','Success')
                        ->whereColumn('paid_date', '>', 'due_date');
                });
        })
        ->orderBy('id', 'desc')  // Jika ada lebih dari satu, ambil yang terbaru
        ->first(); // Mengambil 1 data terakhir
        
        // Log::info('previous Billing',[
        //     'Previous Billing' => $previousBilling
        // ]);

        if (!$previousBilling) {
            // Log::info('No previous billing found', ['ownerId' => $ownerId, 'billingType' => $billingType]);
            return 0;
        }
        // $today = now();
        $today = Carbon::parse($request->input('billing_date'));
        // Log::info('Today', ['today' => $today]);

        $dueDate = Carbon::parse($previousBilling->due_date);

        if($previousBilling->status === 'Success' && $previousBilling->paid_date > $previousBilling->due_date) {
            $paidDate = Carbon::parse($previousBilling->paid_date);
            $dayLate = $paidDate->diffInDays($dueDate);
            // Log::info('Days late(Success with Late Payment)', ['dayLate' => $dayLate, 'paidDate' => $paidDate, 'dueDate' => $dueDate]);
        }else{
            if ($today->lessThanOrEqualTo($dueDate)) {
            // Log::info('Due date has not passed', ['dueDate' => $dueDate]);
            return 0;
            }
            $dayLate = $today->diffInDays($dueDate);
            // Log::info('Days late', ['dayLate' => $dayLate]);
        }


        $fineRules = BillingFineRules::where('billing_type', $request->billing_type)
            ->where('apartment_id', $request->apartment_id)
            ->first();
        
        // Log::info('fineRulesQuery',['data'=>$fineRules]);

        if (!$fineRules) {
            // Log::info('No fine rules found', ['billingType' => $request->billing_type, 'apartmentId' => $request->apartment_id]);
            return 0;   
        }

        $maximumFine = $fineRules->max_fine;
        $dueDate = $fineRules->due_date;
        
        if($billingType === 'Maintenance'){
            $fine = $fineRules->percentage * $previousBilling->billing_fee;
        }

        if($billingType === 'Air' || $billingType === 'Listrik'){
            $fineRatePerDays = $fineRules->fine_rate_per_day;
            $fine = $fineRatePerDays * $dayLate;
            // Log::info('Fine rules retrieved', ['fineRatePerDays' => $fineRatePerDays, 'maximumFine' => $maximumFine]);
        }
        // Log::info('Calculated fine', ['fine' => $fine, 'maximumFine' => $maximumFine]);
        
        if ($maximumFine <= 0) {
            // Log::info('max_fine is invalid, returning fine without limit', ['fine' => $fine]);
            return $fine;
        }
        
        return min($fine, $maximumFine);
    }

    public function calculateBill(Request $request) {
        $validatedData = $request->validate([
            'start_meter' => 'required|integer|min:1|max:999999999999999',
            'end_meter' => 'required|integer|gte:start_meter|max:999999999999999',
            'unit_price' => 'required|integer|min:1|max:999999999999999',
            'minimum_charge' => 'required|numeric|min:0|max:999999999999999',
            'owner_id' => 'required|integer',
        ]);
    
        $startMeter = $validatedData['start_meter'];
        $endMeter = $validatedData['end_meter'];
        $unitPrice = $validatedData['unit_price'];
        $minimumCharge = $validatedData['minimum_charge'];
    
        // Hitung selisih meteran
        $meterDifference = $endMeter - $startMeter;
        $totalCharge = $meterDifference * $unitPrice;
        $billingFee = $totalCharge < $minimumCharge ? $minimumCharge : $totalCharge;
    
        // Hitung denda jika ada
        $fine = $this->calculateFine($request, $request->input('billing_type'), $request->input('owner_id'));
        // Log::info('finalFine', ['finalFine' => $fine]);
    
        return redirect()->back()->with([
            'billing_fee' => $billingFee,
            'meter_reading' => $meterDifference,
            'fine' => $fine,
            'total_amount' => $billingFee + $fine,
        ]);
    }

    public function fetchBillingFee(Request $request,$id){
        $billingCategory = BillingsCategory::find($id);
        
        $fine = $this->calculateFine($request, $billingCategory->billing_type, $request->input('owner_id'));
        // Log::info('finalFine', ['finalFine' => $fine]);
        $totalAmount =  $billingCategory->unit_price + $fine;

        return redirect()->back()->with([
            'billing_fee' => $billingCategory ? $billingCategory->unit_price : 0,
            'fine' => $fine,
            'total_amount'=> $totalAmount ?? 0,
        ]);

    }

    public function countBilling(Request $request){
        $billingType = $request->input('billing_type');
    
        // Base validation rules
        $rules = [
            'period' => 'required|date',
            'billing_type' => 'required|string|in:Air,Listrik,Parkir,Maintenance',
            'billing_date' => 'required|date',
            'owner_id' => 'required|integer',
            'room_no' => 'required|integer|min:1|max:999999999999999',
        ];
    
        // Tambahkan validasi spesifik berdasarkan billing_type
        if (in_array($billingType, ['Air', 'Listrik'])) {
            $rules = array_merge($rules, [
                'start_meter' => 'required|integer|min:1|max:999999999999999',
                'end_meter' => 'required|integer|min:1|max:999999999999999',
                'unit_price' => 'required|integer|min:1|max:999999999999999',
                'minimum_charge' => 'required|numeric|min:0|max:999999999999999',
            ]);
        }

        if ($billingType === 'Listrik') {
            $rules['electric_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if ($billingType === 'Maintenance') {
            $rules['maintenance_type'] = 'required|integer';
        }

        if ($billingType === 'Parkir') {
            $rules['vehicle_type_parking'] = 'required|integer';
        }

        // Validasi semua input dalam satu langkah
        $validatedData = $request->validate($rules);
    
        // Lanjut ke perhitungan berdasarkan billingType
        switch($billingType) {
            case 'Air':
            case 'Listrik':
                return $this->calculateBill($request);
    
            case 'Maintenance':
                return $this->fetchBillingFee($request,$validatedData['maintenance_type']);
    
            case 'Parkir':
                return $this->fetchBillingFee($request,$validatedData['vehicle_type_parking']);
    
            default:
                return back()->with('error', 'Invalid billing type.');
        }
    }

    // public function calculateFine($billing){
    // $fineRules = BillingFineRules::where('billing_type', $billing->billing_type)
    //     ->where('apartment_id', $billing->apartment_id)
    //     ->first();

    // if (!$fineRules) {
    //     return 0;
    // }

    // // Cari tagihan periode sebelumnya yang belum dibayar atau terlambat dibayar
    // $previousPeriod = Carbon::parse($billing->period)->subMonth()->format('Y-m-d');
    // $previousBill = Billing::where('owner_id', $billing->owner_id)
    //     ->where('billing_type', $billing->billing_type)
    //     ->where('period', $previousPeriod)
    //     ->where(function ($query) {
    //         $query->where('status', 'Pending')
    //               ->orWhere('paid_date', '>', 'due_date')
    //               ->orWhereNull('paid_date');
    //     })
    //     ->get();

    // if (!$previousBill) {
    //     return 0;
    // }
    

    // $dueDate = Carbon::parse($previousBill->due_date);
    // $currentDate = Carbon::now();
    // $daysLate = $currentDate->diffInDays($dueDate);

    // Log::info('dueDate', ['dueDate' => $dueDate]);
    // Log::info('currentDate', ['currentDate' => $currentDate]);
    // Log::info('daysLate', ['daysLate' => $daysLate]);
    // Log::info('previousBill', ['previousBill' => $previousBill]);

    // // Hitung denda
    // $calculatedFine = $daysLate * $fineRules->fine_rate_per_day;
    // $appliedFine = min($calculatedFine, $fineRules->max_fine);

    // Log::info('Fine Calculation', [
    //     'daysLate' => $daysLate,
    //     'fineRatePerDay' => $fineRules->fine_rate_per_day,
    //     'calculatedFine' => $calculatedFine,
    //     'maxFine' => $fineRules->max_fine,
    //     'appliedFine' => $appliedFine,
    // ]);

    // return $appliedFine;

    // }
}