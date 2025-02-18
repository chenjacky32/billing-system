<?php

namespace App\Http\Controllers;

use App\Events\BillingCreated;
use App\Events\BillingPaid;
use App\Models\ApartmentOwner;
use App\Models\Billing;
use App\Models\BillingsCategory;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        return Inertia::render('Billing/Billing', [
            'filters' => $request->only('search', 'status'),  // Include 'status' in the filters
            'data' => Billing::with(['owner', 'createdBy'])
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->when($request->has('search'), function ($query) use ($request) {
                    $searchTerm = $request->input('search');
                    $query->whereHas('owner', function ($subQuery) use ($searchTerm) {
                        $subQuery->where('owner_name', 'like', "%$searchTerm%")
                        ->orWhere('room_no', 'like', "%$searchTerm%");
                    });
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

        $ownerQuery = ApartmentOwner::query();
        $categoryBillingQuery = BillingsCategory::query();
        
        if ($role !== 'SUPER ADMIN') {
            $ownerQuery->where('apartment_id', $apartmentId);
            $categoryBillingQuery->where('apartment_id', $apartmentId);
        }

        $owner_data = $ownerQuery->pluck('owner_name', 'id')
            ->map(function ($ownerName, $ownerId) {
                return ['label' => $ownerName, 'value' => $ownerId];
            })
            ->prepend(['label' => 'Pilih Owner', 'value' => ''])
            ->values()
            ->toArray();

        $room_number = $ownerQuery->pluck('room_no', 'id')
            ->map(function ($roomNumber, $ownerId) {
                return ['label' => $roomNumber, 'value' => $ownerId];
            })
            ->prepend(['label' => 'Pilih Room Number', 'value' => ''])
            ->values()
            ->toArray();

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

        return Inertia::render("Billing/AddBilling", [
            'ownerData' => $owner_data,
            'billingCategory'=>$category_billing_data,
            'roomNumber' => $room_number
        ]);
    }

    public function store(Request $request)
    {
        // Define the base validation rules
        $rules = [
            'billing_date' => 'required|date',
            'due_date' => 'required|date',
            'fine' => 'required|integer|min:1|max:999999999999999',
            'billing_type' => 'required|string|in:Air,Listrik,Parkir,Maintenance',
            'billing_fee' => 'required|integer|min:1|max:999999999999999',
            'owner_id' => 'required|integer',
            'room_no' => 'required|integer|min:1|max:999999999999999',
        ];

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
        $owner = ApartmentOwner::findOrFail($ownerId);

        $apartmentId = $owner->apartment_id;
        $validatedData['apartment_id'] = $apartmentId;

        // Store the validated data in the billing table
        $billing = Billing::create($validatedData);

        $pdf = Pdf::loadView('pdf.invoice', compact('billing'));
        $pdfPath = storage_path("app/temp/invoice_{$billing->id}.pdf");
        $pdf->save($pdfPath);
        
        event(new BillingCreated($billing,$pdfPath));
        return redirect('/billing')->with('success', 'New Billing has been created!');
    }

    public function edit(Billing $billing, Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartment_id = $user->apartment_id;
        $billingData = $billing->find($request->id);
        $billingApartmentId = $billingData->apartment_id;

        $ownerQuery = ApartmentOwner::query();
        $categoryBillingQuery = BillingsCategory::query();

        if ($role !== 'SUPER ADMIN') {
            $ownerQuery->where('apartment_id', $apartment_id);
            $categoryBillingQuery->where('apartment_id', $apartment_id);
        }

        $owner_data = $ownerQuery->pluck('owner_name', 'id')
            ->map(function ($ownerName, $ownerId) {
                return ['label' => $ownerName, 'value' => $ownerId];
            })
            ->prepend(['label' => 'Pilih Owner', 'value' => ''])
            ->values()
            ->toArray();
        
        $room_number = $ownerQuery->pluck('room_no', 'id')
            ->map(function ($roomNumber, $ownerId) {
                return ['label' => $roomNumber, 'value' => $ownerId];
            })
            ->prepend(['label' => 'Pilih Room Number', 'value' => ''])
            ->values()
            ->toArray();

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

        

        if ($role === 'SUPER ADMIN') {
            return Inertia::render('Billing/EditBilling', [
                "billingData" => $billing->find($request->id),
                'ownerData' => $owner_data,
                'billingCategory' => $category_billing_data,
                'roomNumber' => $room_number,
            ]);
        } else {
            if ($apartment_id == $billingApartmentId) {
                return Inertia::render('Billing/EditBilling', [
                    "billingData" => $billing->find($request->id),
                    'ownerData' => $owner_data,
                    'billingCategory' => $category_billing_data,
                    'roomNumber' => $room_number,
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
            'fine' => 'required|integer|min:1|max:999999999999999',
            'billing_type' => 'required|string|in:Air,Listrik,Parkir,Maintenance',
            'billing_fee' => 'required|integer|min:1|max:999999999999999',
            'owner_id' => 'required|integer',
            'room_no' => 'required|integer|min:1|max:999999999999999',
            'status' => 'required|string|in:Success,Cancel,Pending',
        ];

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
        $owner = ApartmentOwner::findOrFail($ownerId);
        $apartment_id = $owner->apartment_id;
        $validatedData['apartment_id'] = $apartment_id;

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
        $billing->delete();
        return redirect('/billing')->with('success', 'Billing data has been deleted!');
    }

    //count electric and water bill
    public function calculateBill(Request $request){
        $request->validate ([
                'start_meter' => 'required|integer|min:1|max:999999999999999',
                'end_meter' => 'required|integer|min:1|max:999999999999999',
                'unit_price' => 'required|integer|min:1|max:999999999999999',
                'minimum_charge'=>'required|numeric|min:0|max:999999999999999',
        ]);

        $startMeter = $request->input('start_meter');
        $endMeter = $request->input('end_meter');
        $unitPrice = $request->input('unit_price');
        $minimumCharge = $request->input('minimum_charge');

        if($startMeter > $endMeter){
            return back()->with('error', 'Meter reading end must be greater than start meter.');
        }

        $meterDifference = $endMeter - $startMeter;

        $totalCharge = $meterDifference * $unitPrice;
        $billingFee =  $totalCharge < $minimumCharge ? $minimumCharge : $totalCharge;
        return back()->with([
            'billing_fee' => $billingFee,
            'meter_reading' => $meterDifference
        ]);
    }

    //get billing fee category from billing_category
    public function fetchBillingFee($id){
        $billingCategory = BillingsCategory::find($id);

        return back()->with([
            'billing_fee' => $billingCategory ? $billingCategory->unit_price : 0
        ]);
    }

    public function countBilling(Request $request){
        $billingType = $request->input('billing_type');
        $maintenanceId = $request->input('maintenance_type');
        $vehicleId = $request->input('vehicle_type_parking');

        // basic rules validation
        $request->validate([
            'billing_type' => 'required|string|in:Air,Listrik,Parkir,Maintenance',
        ]);

        switch($billingType){
            case 'Air':
                return $this->calculateBill($request);
            case 'Listrik':
                return $this->calculateBill($request);
            case 'Maintenance':
                $request->validate(['maintenance_type' => 'required|integer']);
                return $this->fetchBillingFee($maintenanceId);
            case 'Parkir':
                $request->validate(['vehicle_type_parking' => 'required|integer']);
                return $this->fetchBillingFee($vehicleId);
            default:
                return back();
        }
    }
}