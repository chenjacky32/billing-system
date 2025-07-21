<?php

namespace App\Http\Controllers;

use App\Events\BillingCreated;
use App\Events\GenerateInvoiceRequested;
use App\Events\BillingPaid;
use App\Exports\Billing as ExportsBilling;
use App\Models\Apartment;
use App\Models\ApartmentOwner;
use App\Models\ApartmentTower;
use App\Models\ApartmentType;
use App\Models\Billing;
use App\Models\BillingFineRules;
use App\Models\BillingsCategory;
use App\Models\UserApartmentOkgo;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Contracts\Support\ValidatedData;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\LookupCache;
use Illuminate\Support\Facades\Validator;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $userApartId = $user->apartment_id;
        $ApartmentId = Apartment::find($userApartId);

        $tower_data = LookupCache::towerList($userApartId, $role);
        $apartmentTypeData = LookupCache::apartmentTypeList();
        $apartmentTypeMap = LookupCache::apartmentTypeMap();

        $query = Billing::select('id','billing_type','billing_fee','billing_date','period',
            'paid_date','fine','total_amount','due_date','status','apartment_id','residence_id',
            'tower_id','created_by')
                ->with([
                    'createdBy:id,name,role,apartment_id',      
                    'tower:id,tower_name,apartment_id,total_room,created_by,created_at,updated_at',
                    'residence:id,userId,apartmentTowerId,apartmentId,roomNo,apartmentType',
                    'residence.user:id,fullname'
                ]);

        if ($role !== 'SUPER ADMIN') {
            $query->where('apartment_id', $userApartId);
        }

        // Filters
        $query->when($request->has('search'), function ($query) use ($request) {
            $searchTerm = $request->input('search');
            $matchingResidenceIds = UserApartmentOkgo::whereHas('user', function ($q) use ($searchTerm) {
                    $q->where('fullname', 'like', "%$searchTerm%");
                })
                ->orWhere('roomNo', 'like', "%$searchTerm%")
                ->pluck('id')
                ->toArray();

            $query->whereIn('residence_id', $matchingResidenceIds);
        });

        $query->when($request->filled('status'), fn ($q) =>
            $q->where('status', $request->status)
        );

        $query->when($request->filled('period'), fn ($q) =>
            $q->where('period', $request->period)    
        );

        $query->when($request->filled('billingType'), fn ($q) =>
            $q->where('billing_type', $request->billingType)
        );

        $query->when($request->filled('towerId'), fn ($q) =>
            $q->where('tower_id', $request->towerId)
        );

        $query->when($request->filled('unitType'), function ($q) use ($request) {
            $unitType = $request->unitType;
            $residenceIds = UserApartmentOkgo::where('apartmentType', $unitType)
                ->pluck('id')
                ->toArray();
            $q->whereIn('residence_id', $residenceIds);
        });

        $data = $query->orderByDesc('id')->paginate(10);

        $data->getCollection()->transform(function ($billing) use ($apartmentTypeMap) {
            if ($billing->residence) {
                $res = $billing->residence;

                $aptTypeId = $res->apartmentType;
                $res->apartmentTypeData = isset($apartmentTypeMap[$aptTypeId])
                    ? [
                        'id' => $aptTypeId,
                        'name' => $apartmentTypeMap[$aptTypeId]
                    ]
                    : null;
            }

            return $billing;
        });

        return Inertia::render('Billing/Billing', [
            'apartmentId' => $ApartmentId,
            'towerData' => $tower_data,
            'apartmentType' => $apartmentTypeData,
            'filters' => $request->only('search', 'status', 'period', 'billingType', 'towerId', 'unitType'),
            'data' => $data,
        ]);
    }

    public function add()
    {
        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;

        $unitCapacitiesMap = LookupCache::unitPowerCapacitiesMap();
        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $towerData = LookupCache::towerList($apartmentId, $role);
        $fineRules = LookupCache::billingFineRules($apartmentId, $role);
        $categories = LookupCache::billingCategory($apartmentId, $role);

        $waterPrice = $categories->first(fn ($category) => $category->billing_type === 'Air' && strtoupper($category->category_name) === 'AIR');

        if (!$waterPrice) {
            return back()->with('error', "Harga Air Tidak Ditemukan di Master Billing Category...");
        }

        $userApartmentsQuery = UserApartmentOkgo::select(
                                'id','userId','apartmentTowerId',
                                'roomNo','apartmentType','apartmentId',
                                'powerCapacityId',
                                'active'
                                )
                            ->with(['user:id,fullname,phone,email'])
                            ->where('active', 1);

        if ($role !== 'SUPER ADMIN') {
            $towerIds = collect($towerData)->pluck('value')->filter()->toArray();
            $userApartmentsQuery->whereIn("apartmentTowerId", $towerIds);
        }

        $roomsNumber = $userApartmentsQuery->get()->map(function ($unit) use ($apartmentTypeMap, $unitCapacitiesMap) {
            $capacity = $unitCapacitiesMap[$unit->powerCapacityId] ?? null;

            return [
                'ownerName' => $unit->user->fullname,
                'apartmentId'=> $unit->apartmentId,
                'apartmentTowerId'=> $unit->apartmentTowerId,
                'label' => $unit->roomNo,
                'value' => $unit->id,
                'unitPowerCapacity' => [
                    'id' => $unit->powerCapacityId ?? '-',
                    'capacity' => $capacity ?? '-',
                    ],
                'apartmentTypeId' => $unit->apartmentType,
                'apartType' => [
                    'id' => $unit->apartmentType,
                    'name' => $apartmentTypeMap[$unit->apartmentType] ?? null,
                    ],
                ];
            })->prepend([
                'label' => 'Pilih Nomor Unit',
                'value' => '',
            ])->values()->toArray();

        $categoryBilling = $categories
            ->groupBy('billing_type')
            ->map(function ($items, $billingType) {
                return [
                    'billing_type' => $billingType,
                    'categories' => $items->map(function ($item) {
                        return [
                            'label' => $item->category_name,
                            'value' => $item->id,
                            'price' => $item->unit_price,
                            'apartment_id' => $item->apartment_id ?? "",
                            'tower_id' => $item->tower_id ?? "",
                            'power_capacity'=> $item->power_capacity_value ?? "",
                            'minimum_charge' => $item->minimum_charge,
                        ];
                    })->values(),
                ];
            })->values()
            ->prepend(['billing_type' => 'Pilih Kategori', 'categories' => []])
            ->toArray();

        $towerList = collect($towerData)
            ->prepend(['label' => 'Pilih Tower', 'value' => ''])
            ->values()
            ->toArray();

        $dueDays = $fineRules->groupBy('apartment_id')->map(function ($items, $apartmentId) {
            return [
                'apartmentId' => $apartmentId,
                'billingTypeRules' => $items->map(function ($item) {
                        return [
                            'billingType' => $item->billing_type,
                            'due_days' => $item->due_date,
                        ];
                    })->values()->toArray(),
                ];
            })->values()->toArray();
        
        
        if ($role === "SUPER ADMIN") {
            return Inertia::render("Billing/AddBilling", [
                'roomNumber' => $roomsNumber,
                'billingCategory' => $categoryBilling,
                'towerData' => $towerList,
                'billingDueDays' => $dueDays,
            ]);
        } else {
            return Inertia::render("Billing/AddBilling", [
                'roomNumber' => $roomsNumber,
                'billingCategory' => $categoryBilling,
                'towerData' => $towerList,
                'WaterPriceData' => $waterPrice->unit_price,
                'WaterPriceMinimumCharge' => $waterPrice->minimum_charge,
                'waterPriceId' => $waterPrice->id,
                'apartmentId' => $apartmentId,
                'billingDueDays' => $dueDays,
            ]);
        }
    }

    public function store(Request $request)
    {
        $billingType = $request->input('billing_type');

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

        // Conditionally add start_meter, end_meter, unit_price, minimum_charge if billing_type is Air or Listrik
        if (in_array($billingType, ['Listrik','Air'])) {
            $rules['meter_reading'] = 'required|integer|min:1|max:999999999999999';
            $rules['start_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['end_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['unit_price'] = 'required|integer|min:1|max:999999999999999';
            $rules['minimum_charge'] = 'required|integer|min:0|max:999999999999999';
            $rules['end_meter_image_path'] = 'required|image|mimes:jpeg,png,jpg,webp|max:2048';
        }

        if (in_array($billingType, ['Listrik'])) {
            $rules['electric_type']= 'required|integer|min:1|max:999999999999999';
        }

        if (in_array($billingType, ['Air'])) {
            $rules['water_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if (in_array($billingType, ['Maintenance'])) {
            $rules['maintenance_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if (in_array($billingType, ['Parkir'])) {
            $rules['vehicle_type_parking'] = 'required|integer|min:1|max:999999999999999';
        }

        // Validate the incoming data with the dynamically adjusted rules
        $validatedData = $request->validate($rules);

        // Retrieve the owner_id
        $ownerId = $request->input('owner_id');  
        $ownerApartment =  UserApartmentOkgo::findOrFail($ownerId);
        $apartmentId = $ownerApartment->apartmentId;

        // Retrieve the billing category ID based on billing_type
        $billingCategory = match ($billingType) {
            'Air' => BillingsCategory::where('billing_type', 'Air')->find($validatedData['water_type']),
            'Listrik' => BillingsCategory::where('billing_type', 'Listrik')->find($validatedData['electric_type']),
            'Maintenance' => BillingsCategory::where('billing_type', 'Maintenance')->find($validatedData['maintenance_type']),
            'Parkir' => BillingsCategory::where('billing_type', 'Parkir')->find($validatedData['vehicle_type_parking']),
            default => null
        };

        // Check if billing category exists
        if (in_array($billingType, ['Maintenance', 'Parkir']) && !$billingCategory) {
            return back()->with('error', 'Billing Category tidak ditemukan.');
        }

        $billingCategoryId = $billingCategory ? $billingCategory->id : null;

        // Check for duplicate billing
        $existingBilling = Billing::where([
                'billing_type' => $billingType,
                'billing_category_id' => $billingCategoryId,
                'period' => $validatedData['period'],
                'apartment_id' => $apartmentId,
                'residence_id' => $ownerId,
                'tower_id' => $validatedData['tower_id']
            ])->first();

        if ($existingBilling) {
            return back()->with('error', 'Data billing untuk periode ini sudah pernah diinput sebelumnya. Silakan periksa kembali data yang akan diinput.');
        }

        $validatedData['created_by'] = Auth::id();
        $validatedData['billing_category_id'] = $billingCategoryId;
        $validatedData['apartment_id'] = $apartmentId;
        $validatedData['residence_id'] = $ownerId;
        $validatedData['total_amount'] = $validatedData['billing_fee'] + $validatedData['fine'];
        $validatedData['owner_id'] = NULL;

        if (in_array($billingType, ['Air', 'Listrik'])) {
            if ($request->hasFile('end_meter_image_path')) {
                // generate file img name
                $fileName = 'end-meter-image/' . time() . '.' . $request->file('end_meter_image_path')->extension();
                
                // save new end meter image
                $request->file('end_meter_image_path')->storeAs('public', $fileName);
                $validatedData['end_meter_image_path'] = $fileName;
            }
        }
        
        // Store the validated data in the billing table
        $billing = Billing::create($validatedData);

        event(new GenerateInvoiceRequested($billing));
        return redirect('/billing')->with('success', 'New Billing has been created!');
    }

    public function edit(Billing $billing, Request $request)
    {

        $user = Auth::user();
        $role = $user->role;
        $apartment_id = $user->apartment_id;
        $billingData = $billing->find($request->id);
        $billingApartmentId = $billingData->apartment_id;

        $unitCapacitiesMap = LookupCache::unitPowerCapacitiesMap();
        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $towerData = LookupCache::towerList($apartment_id, $role);
        $fineRules = LookupCache::billingFineRules($apartment_id, $role);
        $categories = LookupCache::billingCategory($apartment_id, $role);

        $waterPrice = $categories->first(fn($category)=> $category->billing_type === 'Air' && strtoupper($category->category_name) === 'AIR');
        
        if (!$waterPrice) {
            return back()->with('error', "Harga Air Tidak Ditemukan di Master Billing Category...");
        }

        $userApartmentsQuery = UserApartmentOkgo::select(
                                'id','userId','apartmentTowerId',
                                'roomNo','apartmentType','apartmentId',
                                'powerCapacityId',
                                'active'
                                )
                            ->with(['user:id,fullname,phone,email'])
                            ->where('active', 1);


        if ($role !== 'SUPER ADMIN') {
            $towerIds = collect($towerData)->pluck('value')->filter()->toArray();
            $userApartmentsQuery->whereIn('apartmentTowerId', $towerIds);
        }

        $roomsNumber = $userApartmentsQuery->get()->map(function ($unit) use ($apartmentTypeMap, $unitCapacitiesMap) {
            $capacity = $unitCapacitiesMap[$unit->powerCapacityId] ?? null;
            
            return [
                'ownerName'=> $unit->user->fullname,
                'apartmentId'=> $unit->apartmentId,
                'apartmentTowerId'=> $unit->apartmentTowerId,
                'label' => $unit->roomNo,
                'value' => $unit->id,
                'unitPowerCapacity' => [
                    'id' => $unit->powerCapacityId ?? '-',
                    'capacity' => $capacity ?? '-',
                    ],
                'apartmentTypeId' => $unit->apartmentType,
                    'apartType' => [
                        'id'=> $unit->apartmentType,
                        'name'=> $apartmentTypeMap[$unit->apartmentType] ?? null,
                    ],
                ];                                      
            })->prepend([
                'label' => 'Pilih Nomor Unit',
                'value' => '',
            ])->values()->toArray();
        
        $categoryBilling = $categories
            ->groupBy('billing_type')
            ->map(function ($items, $billingType) {
                return [
                    'billing_type' => $billingType,
                    'categories'=> $items->map(function ($item) {
                        return [
                            'label' => $item->category_name,
                            'value' => $item->id,
                            'price' => $item->unit_price,
                            'apartment_id' => $item->apartment_id ?? "",
                            'tower_id' => $item->tower_id ?? "",
                            'power_capacity'=> $item->power_capacity_value ?? "",
                            'minimum_charge' => $item->minimum_charge
                        ];
                    })->values(),
                ];
            })->values()
            ->prepend(['billing_type' => 'Pilih Kategori', 'categories' => []])
            ->toArray();

        $towerList = collect($towerData)
            ->prepend(['label' => 'Pilih Tower', 'value' => ''])
            ->values()
            ->toArray();
        
        $dueDays = $fineRules->groupBy('apartment_id')->map(function ($items, $apartmentId) {
            return [
                'apartmentId' => $apartmentId,
                'billingTypeRules'=> $items->map(function ($item) {
                    return [
                        'billing_type' => $item->billing_type,
                        'due_days' => $item->due_date,
                    ];
                })->values()->toArray(),
            ];
        })->values()->toArray();
        
        if ($role === 'SUPER ADMIN') {
            return Inertia::render('Billing/EditBilling', [
                'roomNumber' => $roomsNumber,
                'billingCategory' => $categoryBilling,
                "billingData" => $billing->find($request->id),
                'towerData' => $towerList,
                'billingDueDays' => $dueDays
            ]);
        } else {
            if ($apartment_id == $billingApartmentId) {
                return Inertia::render('Billing/EditBilling', [
                    'roomNumber' => $roomsNumber,
                    'billingCategory' => $categoryBilling,
                    "billingData" => $billing->find($request->id),
                    'apartmentId' => $apartment_id,
                    'towerData' => $towerList,
                    'WaterPriceData'=>$waterPrice->unit_price,
                    'WaterPriceMinimumCharge'=>$waterPrice->minimum_charge,
                    'waterPriceId' => $waterPrice->id,
                    'billingDueDays' => $dueDays
                ]);
            } else {
                return redirect('/unauthorized');
            }
        }
    }

    public function update(Request $request, $id)
    {
        $billing = Billing::findOrFail($id);
        $billingType = $request->input('billing_type');

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

        // Conditionally add start_meter, end_meter, unit_price, minimum_charge if billing_type is Listrik
        if (in_array($billingType, ['Listrik','Air'])){
            $rules['meter_reading'] = 'required|integer|min:1|max:999999999999999';
            $rules['start_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['end_meter'] = 'required|integer|min:1|max:999999999999999';
            $rules['unit_price'] = 'required|integer|min:1|max:999999999999999';
            $rules['minimum_charge'] = 'required|integer|min:0|max:999999999999999';
            
            if ($request->hasFile('end_meter_image_path')) {
                $rules['end_meter_image_path'] = 'image|mimes:jpeg,png,jpg,webp|max:2048';
            }
        }

        if (in_array($request->input('billing_type'), ['Listrik'])) {
            $rules['electric_type']= 'required|integer|min:1|max:999999999999999';
        }

        if (in_array($request->input('billing_type'), ['Air'])) {
            $rules['water_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if (in_array($request->input('billing_type'), ['Maintenance'])) {
            $rules['maintenance_type'] = 'required|integer|min:1|max:999999999999999';
        }

        if (in_array($request->input('billing_type'), ['Parkir'])) {
            $rules['vehicle_type_parking'] = 'required|integer|min:1|max:999999999999999';
        }

        // Conditionally add the paid_date validation if status is Success
        if ($request->input('status') === 'Success') {
            $rules['paid_date'] = 'required|date';
        }

        // Validate the incoming data with the dynamically adjusted rules
        $validatedData = $request->validate($rules);

        $ownerId = $request->input('owner_id');
        $ownerApartment = UserApartmentOkgo::findOrFail($ownerId);
        $apartmentId = $ownerApartment->apartmentId;
        
        // Retrieve the billing category ID based on billing_type
        $billingCategory = match ($billingType) {
            'Air' => BillingsCategory::where('billing_type', 'Air')->find($validatedData['water_type']),
            'Listrik' => BillingsCategory::where('billing_type', 'Listrik')->find($validatedData['electric_type']),
            'Maintenance' => BillingsCategory::where('billing_type', 'Maintenance')->find($validatedData['maintenance_type']),
            'Parkir' => BillingsCategory::where('billing_type', 'Parkir')->find($validatedData['vehicle_type_parking']),
            default => null
        };

        // Check if billing category exists
        if (in_array($request->input('billing_type'), ['Maintenance', 'Parkir']) && !$billingCategory) {
            return back()->with('error', 'Billing Category tidak ditemukan.');
        }

        $billingCategoryId = $billingCategory ? $billingCategory->id : null;

        $existingBilling = Billing::where([
                'billing_type' => $billingType,
                'billing_category_id' => $billingCategoryId,
                'period' => $validatedData['period'],
                'apartment_id' => $apartmentId,
                'residence_id' => $ownerId,
                'tower_id' => $validatedData['tower_id']
            ])
            ->where('id', '!=', $id) // Exclude current record being updated
            ->first();

        if ($existingBilling) {
            return back()->with('error', 'Data billing untuk periode ini sudah pernah diinput sebelumnya. Silakan periksa kembali data yang akan diupdate.');
        }

        // Set meter_reading to null if billing_type is Parkir or Maintenance
        if (in_array($request->input('billing_type'), ['Parkir', 'Maintenance'])) {
            if ($billing->end_meter_image_path) {
                Storage::delete('public/' . $billing->end_meter_image_path);
                $validatedData['end_meter_image_path'] = null;
            }
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

        if (in_array($request->input('billing_type'),['Air', 'Listrik'])) {
            if ($request->hasFile('end_meter_image_path')) {
                if ($billing->end_meter_image_path){
                    Storage::delete('public/'.$billing->end_meter_image_path);
                }

                // generate file img name
                $fileName = 'end-meter-image/' . time() . '.' . $request->file('end_meter_image_path')->extension();
                
                // save new end meter image
                $request->file('end_meter_image_path')->storeAs('public', $fileName);
                $validatedData['end_meter_image_path'] = $fileName;
            } else {
                $validatedData['end_meter_image_path'] = $billing->end_meter_image_path;
            }
        }

        $validatedData['billing_category_id'] = $billingCategory ? $billingCategory->id : null;

        $validatedData['apartment_id'] = $apartmentId;
        $validatedData['residence_id'] = $ownerId;
        $validatedData['owner_id'] = NULL;
        $validatedData['total_amount'] = $validatedData['billing_fee'] + $validatedData['fine'];

        // Update the billing record
        $billing->update($validatedData);

        if ($request->input('status') === 'Success') {
            event(new BillingPaid($billing));
        }

        return redirect('/billing')->with('success', 'Billing data has been updated!');
    }

    public function destroy(Request $request)
    {
        $billing = Billing::find($request->id);
        if (!$billing) {
            return redirect('/billing')->with('error', 'Billing data not found!');
        }
    
        if ($billing->end_meter_image_path) {
            $filePath = 'public/' . $billing->end_meter_image_path;
    
            if (Storage::exists($filePath)) {
                Storage::delete($filePath); 
            }
        }
    
        $billing->delete();
        return redirect()->back()->with('success', 'Billing data has been deleted!');
    }

    public function calculateFine(Request $request, $billingType, $ownerId) {
        if (!in_array($billingType, ['Air', 'Listrik','Maintenance'])) {
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
            

        if (!$previousBilling) {
            return 0;
        }

        $today = Carbon::parse($request->input('billing_date'));

        $dueDate = Carbon::parse($previousBilling->due_date);

        if ($previousBilling->status === 'Success' && $previousBilling->paid_date > $previousBilling->due_date) {
            $paidDate = Carbon::parse($previousBilling->paid_date);
            $dayLate = $paidDate->diffInDays($dueDate);
        } else {
            if ($today->lessThanOrEqualTo($dueDate)) {
                return 0;
            }
            $dayLate = $today->diffInDays($dueDate);
        }


        $fineRules = BillingFineRules::where('billing_type', $request->billing_type)
            ->where('apartment_id', $request->apartment_id)
            ->first();
        
        if (!$fineRules) {
            return 0;   
        }

        $dueDate = $fineRules->due_date;
        
        if ($billingType === 'Maintenance') {
            $fine = $fineRules->percentage * $previousBilling->billing_fee;
        } elseif (in_array($billingType, ['Air', 'Listrik'])) {
            $fine = $fineRules->fine_rate_per_day * $dayLate;
        } else {
            $fine = 0;
        }

        return ($fineRules->max_fine > 0) ? min($fine, $fineRules->max_fine) : $fine;
    }

    public function calculateBill(Request $request) {
        $validator = Validator::make($request->all(), [
            'start_meter' => 'required|integer|min:1|max:999999999999999',
            'end_meter' => 'required|integer|gte:start_meter|max:999999999999999',
            'unit_price' => 'required|integer|min:1|max:999999999999999',
            'minimum_charge' => 'required|numeric|min:0|max:999999999999999',
            'owner_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'statusCode' => 422,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();
    
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
        
        return response()->json([
            'statusCode' => 200,
            'message' => 'Tagihan berhasil dihitung.',
            'billing_fee' => $billingFee,
            'meter_reading' => $meterDifference,
            'fine' => $fine,
            'total_amount' => $billingFee + $fine,
        ], 200);
    }

    public function fetchBillingFee(Request $request,$id){
        
        $billingCategory = BillingsCategory::find($id);
        
        if (!$billingCategory) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Kategori tidak ditemukan',
            ], 404);
        }

        $fine = $this->calculateFine($request, $billingCategory->billing_type, $request->input('owner_id'));
        $totalAmount =  $billingCategory->unit_price + $fine;

        return response()->json([
            'statusCode' => 200,
            'message' => 'Tagihan berhasil dihitung.',
            'billing_fee' => $billingCategory ? $billingCategory->unit_price : 0,
            'fine' => $fine,
            'total_amount'=> $totalAmount ?? 0,
        ],200);
    }

    public function countBilling(Request $request){
        
        $billingType = $request->input('billing_type');
    
        // Base validation rules
        $rules = [
            'period' => 'required|date',
            'billing_type' => 'required|string|in:Air,Listrik,Parkir,Maintenance',
            'billing_date' => 'required|date',
            'owner_id' => 'required|integer',
            'tower_id' => 'required|integer|exists:apartment_tower,id',
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
        
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'statusCode' => 422,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ],422);
        }

        $data = $validator->validated();
    
        // Lanjut ke perhitungan berdasarkan billingType
        switch($billingType) {
            case 'Air':
            case 'Listrik':
                return $this->calculateBill($request);
    
            case 'Maintenance':
                return $this->fetchBillingFee($request, $data['maintenance_type']);
    
            case 'Parkir':
                return $this->fetchBillingFee($request, $data['vehicle_type_parking']);
    
            default:
                return response()->json([
                    'statusCode' => 400,
                    'message' => 'Invalid billing type.',
                ],400);
        }
    }

    public function getStartMeter(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'billing_type' => 'required|string|in:Air,Listrik',
            'period'=>'required|date',
            'owner_id' => 'required|integer',
            'room_no' => 'required|integer|min:1|max:999999999999999',
            'tower_id' => 'required|integer|exists:apartment_tower,id',
            'water_type' => 'nullable|integer|min:1|max:999999999999999',
            'electric_type' => 'nullable|integer|min:1|max:999999999999999',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'statusCode' => 422,
                'errors' => $validator->errors(),
                'message' => 'Validasi gagal',
            ], 422);
        }

        $validatedData = $validator->validated();


        if ($validatedData['billing_type'] === 'Air') {
            $billingCategoryId = $validatedData['water_type'] ?? null;
        } elseif ($validatedData['billing_type'] === 'Listrik') {
            $billingCategoryId = $validatedData['electric_type'] ?? null;
        }

        if (!$billingCategoryId) {
            return response()->json([
                'statusCode' => 422,
                'message' => 'Kategori billing tidak valid atau tidak dikirim',
            ], 422);
        }

        $currentPeriod = Carbon::parse($validatedData['period']);
        $previousPeriod = $currentPeriod->copy()->subMonth()->format('Y-m-01');

        $previousBilling = Billing::select('id', 'billing_type','residence_id','tower_id','period','billing_category_id','end_meter')
            ->where('billing_type', $validatedData['billing_type'])
            ->where('residence_id', $validatedData['owner_id'])
            ->where('tower_id', $validatedData['tower_id'])
            ->where('period', $previousPeriod)
            ->where('billing_category_id',$billingCategoryId)
            ->orderBy('id', 'desc')
            ->first();

        if ($previousBilling) {
            return response()->json([
                'statusCode' => 200,
                'new_start_meter' => $previousBilling->end_meter,
                'message' => 'Meteran Periode Sebelumnya ditemukan',
            ],200);
        } else {
            return response()->json([
                'statusCode' => 404,
                'new_start_meter' => 0,
                'message' => 'Meteran periode sebelumnya tidak ditemukan',
            ], 404);
        }
    }

    public function export(Request $request)
    {       
            $user = Auth::user();
            $role = $user->role;

            $apartmentTypeMap = LookupCache::apartmentTypeMap();

            // Query dasar dengan kondisi apartment_id
            $query = Billing::select('id','billing_type','billing_fee','billing_date',
                                    'period','paid_date','fine','total_amount','due_date','status',
                                    'apartment_id','residence_id','tower_id','created_by'
                                    )->with([
                                        'createdBy:id,name,role,apartment_id', 
                                        'tower:id,tower_name,apartment_id', 
                                        'residence:id,userId,apartmentTowerId,apartmentId,roomNo,apartmentType',
                                        'residence.user:id,fullname'
                                    ])->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                                            return $query->where('apartment_id', $user->apartment_id);
                                        });
            
            
            
            // Terapkan filter yang sama seperti di method index
            $query->when($request->has('search'), function ($query) use ($request){
                $searchTerm = $request->input('search');
                $matchingResidenceIds = UserApartmentOkgo::whereHas('user', function ($q) use ($searchTerm) {
                        $q->where('fullname', 'like', "%$searchTerm%");
                })
                ->orWhere('roomNo', 'like', "%$searchTerm%")
                ->pluck('id')
                ->toArray();
                
                $query->whereIn('residence_id', $matchingResidenceIds);
            });

            $query->when($request->filled('status'), fn ($q) =>
                $q->where('status', $request->status)
            );

            $query->when($request->filled('period'), fn ($q) =>
                $q->where('period', $request->period)    
            );

            $query->when($request->filled('billingType'), fn ($q) =>
                $q->where('billing_type', $request->billingType)
            );

            $query->when($request->filled('towerId'), fn ($q) =>
                $q->where('tower_id', $request->towerId)
            );

            $query->when($request->filled('unitType'), function ($q) use ($request) {
                $unitType = $request->unitType;
                $residenceIds = UserApartmentOkgo::where('apartmentType', $unitType)
                    ->pluck('id')
                    ->toArray();
                $q->whereIn('residence_id', $residenceIds);
            });
        
            // Ambil semua data tanpa pagination
            $data = $query->orderByDesc('id')->get();

            // Inject Apartment Types
            $data->transform(function ($billing) use ($apartmentTypeMap) {
                if ($billing->residence) {
                    $res = $billing->residence;

                    $aptTypeId = $res->apartmentType;
                    $res->apartmentTypeData = isset($apartmentTypeMap[$aptTypeId])
                        ? (object)[
                            'id' => $aptTypeId,
                            'name' => $apartmentTypeMap[$aptTypeId]
                        ]
                        : (object)[
                            'id' => '',
                            'name' => '',
                        ];
                }

                return $billing;
            });
            
            return Excel::download(new ExportsBilling(data: $data), 'billing.xlsx');
    }
}