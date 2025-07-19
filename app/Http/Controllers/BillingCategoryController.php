<?php

namespace App\Http\Controllers;

use App\Helpers\LookupCache;
use App\Models\Apartment;
use App\Models\ApartmentType;
use App\Models\BillingsCategory;
use App\Models\UnitPowerCapacities;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BillingCategoryController extends Controller
{
    //
    public function index(Request $request)
    {
        
        $user = Auth::user();
        $role = $user->role;

        $query = BillingsCategory::with(['apartment','createdBy','tower'])
            ->when($role !== 'SUPER ADMIN',function($query) use ($user){
                return $query->where('apartment_id',$user->apartment_id);
            })
            ->when($request->has('search'),function($query) use ($request){
                return $query->where('category_name','like',"%".$request->input('search')."%");
            })
            ->orderByDesc('id')
            ->paginate(10)
            ;
        
        return Inertia::render('BillingCategory/BillingCategory',[
            'filters'=> $request->only('search'),
            'data' => $query
        ]);
    }

    public function add()
    {
        $user = Auth::user();
        $apartId = $user->apartment_id;
        $findApartment = Apartment::find($apartId);
        $role = $user->role;
        
        $apartmentType = ApartmentType::pluck('name', 'id')->map(function ($apartmentTypeName, $apartmentTypeId) {
            return [
                'label' => $apartmentTypeName, 'value' => $apartmentTypeId
            ];
        })
        ->values()
        ->toArray();
        
        $powerType = UnitPowerCapacities::pluck('capacity_value','id')->map(function ($powerTypeName, $powerTypeId) {
            return [
                'label' => $powerTypeName, 'value' => $powerTypeId
            ];
        })
        ->values()
        ->toArray();

        $towerData = LookupCache::towerList($apartId, $role);

        $apartTowerData = collect($towerData)            
            ->prepend(['label' => 'Pilih Tower', 'value' => ''])
            ->values()
            ->toArray();

        if ($findApartment){
            $apartmentName = $findApartment->name;
        } else {
            $apartmentName = 'Apartment not found';
        }

        $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartmentId) {
            return [
                'label' => $apartmentName, 
                'value' => $apartmentId
            ];
        })
        ->prepend(['label' => 'Pilih Apartemen', 'value' => ''])
        ->values()
        ->toArray();

        return Inertia::render('BillingCategory/AddBillingCategory',[
            'apartmentData' => $apartment,
            'apartmentName' => $apartmentName,
            'apartmentId' => $apartId,
            'apartmentType' => $apartmentType,
            'towerData'=> $apartTowerData,
            'powerCapacityData' => $powerType
        ]);

    }

    public function edit(BillingsCategory $billingCategory, Request $request)
    {
        $user = Auth::user();
        $userApartmentId = $user->apartment_id;
        $findApartment = Apartment::find($userApartmentId);
        $role = $user->role;
        
        $apartmentType = ApartmentType::pluck('name', 'id')->map(function ($apartmentTypeName, $apartmentTypeId) {
            return [
                'label' => $apartmentTypeName, 'value' => $apartmentTypeId
            ];
        })
        ->values()
        ->toArray();

        $powerType = UnitPowerCapacities::pluck('capacity_value','id')->map(function ($powerTypeName, $powerTypeId) {
            return [
                'label' => $powerTypeName, 'value' => $powerTypeId
            ];
        })
        ->values()
        ->toArray();
        
        $towerData = LookupCache::towerList($userApartmentId, $role);

        $apartTowerData = collect($towerData)            
            ->prepend(['label' => 'Pilih Tower', 'value' => ''])
            ->values()
            ->toArray();

        if ($findApartment){
            $apartName = $findApartment->name;
        } else {
            $apartName = 'Apartment not found';
        }

        $apartment = Apartment::pluck('name', 'id')
        ->map(function ($apartmentName, $apartementId) {
            return [
                'label' => $apartmentName, 
                'value' => $apartementId
            ];
        })
        ->prepend(['label' => 'Pilih Apartemen', 'value' => ''])
        ->values()
        ->toArray();
    
       
        $billingCategoryData = $billingCategory->find($request->id);
        $billingCategoryApartmentData = $billingCategoryData->apartment_id;

        if ($role === 'SUPER ADMIN') {
            return Inertia::render('BillingCategory/EditBillingCategory', [
                "billingCategoryData" => $billingCategory->find($request->id),
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
                'apartmentType' => $apartmentType,         
                'towerData'=> $apartTowerData,
                'powerCapacityData' => $powerType

            ]);
        } else if ($userApartmentId == $billingCategoryApartmentData ) {
            return Inertia::render('BillingCategory/EditBillingCategory', [
                "billingCategoryData" => $billingCategory->find($request->id),
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
                'apartmentType' => $apartmentType,
                'towerData'=> $apartTowerData,
                'powerCapacityData' => $powerType
            ]);
        } else {
            return redirect('/unauthorized');
        }
    
    }

    public function store(Request $request)
    {
        $rules = [
            'category_name' => 'required|string|max:255',
            'apartment_id' => 'required|integer|exists:apartments,id',
            'billing_type' => 'required|string|max:255',
            'unit_price' => 'required|integer|min:1|max:999999999999999',
            'minimum_charge' => 'required|integer|min:0|max:999999999999999',
        ];
        
        if ($request->input('billing_type') === 'Listrik') {
            $rules['power_capacity_value'] = 'required|integer|exists:unit_power_capacities,capacity_value';
            $rules['tower_id'] = 'required|integer|exists:apartment_tower,id';
        }

        $validateData = $request->validate($rules);
        $validateData['created_by'] = Auth::id();
        
        $billingType = $validateData['billing_type'];

        if ($billingType === 'Listrik') {
            $existing = BillingsCategory::where('apartment_id', $validateData['apartment_id'])
                    ->where('billing_type', $billingType)
                    ->where('category_name', $validateData['category_name'])
                    ->where('power_capacity_value', $validateData['power_capacity_value'])
                    ->where(function ($query) use ($validateData) {
                        if (!empty($validateData['tower_id'])) {
                            $query->where('tower_id', $validateData['tower_id']);
                        } else {
                            $query->whereNull('tower_id');
                        }
                    })
                    ->exists();

                if ($existing) {
                    return back()->withErrors([
                        'category_name' => 'Kategori listrik dengan kombinasi daya dan tower ini sudah tersedia.',
                    ])->withInput();
                }

            } elseif ($billingType === 'Maintenance') {
                $existing = BillingsCategory::where('apartment_id', $validateData['apartment_id'])
                    ->where('billing_type', $billingType)
                    ->where('category_name', $validateData['category_name'])
                    ->exists();

                if ($existing) {
                    return back()->withErrors([
                        'category_name' => 'Kategori maintenance ini sudah tersedia. Silakan gunakan nama berbeda.',
                    ])->withInput();
                }
            }

        BillingsCategory::create($validateData);
        return redirect('/billing-category')->with('success', '
                                                        Billing Category data has been created!'
                                                        );
    }

    public function update(Request $request, $id)
    {
        $billingCategory = BillingsCategory::findOrFail(id: $id);

        $rules = [
            'category_name' => 'required|string|max:255',
            'apartment_id' => 'required|integer|exists:apartments,id',
            'billing_type' => 'required|string|max:255',
            'unit_price' => 'required|integer|min:1|max:999999999999999',
            'minimum_charge' => 'required|integer|min:0|max:999999999999999',
        ];

        if ($request->input('billing_type') === 'Listrik') {
            $rules['power_capacity_value'] = 'required|integer|exists:unit_power_capacities,capacity_value';
            $rules['tower_id'] = 'required|integer|exists:apartment_tower,id';
        }

        $validateData = $request->validate($rules);
        $validateData['created_by'] = Auth::id();

        $billingType = $validateData['billing_type'];

        if ($billingType !== "Listrik") {
            $validateData['tower_id'] = NULL;
            $validateData['power_capacity_value'] = NULL;
        }

        if ($billingType === 'Listrik') {
            $existing = BillingsCategory::where('apartment_id', $validateData['apartment_id'])
                ->where('billing_type', $billingType)
                ->where('category_name', $validateData['category_name'])
                ->where('power_capacity_value', $validateData['power_capacity_value'])
                ->where(function ($query) use ($validateData) {
                    if (!empty($validateData['tower_id'])) {
                        $query->where('tower_id', $validateData['tower_id']);
                    } else {
                        $query->whereNull('tower_id');
                    }
                })
                ->where('id', '!=', value: $id)
                ->exists();

            if ($existing) {
                return back()->withErrors([
                    'category_name' => 'Kategori listrik dengan kombinasi daya dan tower ini sudah tersedia.',
                ])->withInput();
            }

        } elseif ($billingType === 'Maintenance') {
            $existing = BillingsCategory::where('apartment_id', $validateData['apartment_id'])
                ->where('billing_type', $billingType)
                ->where('category_name', $validateData['category_name'])
                ->where('id', '!=', $id)
                ->exists();

            if ($existing) {
                return back()->withErrors([
                    'category_name' => 'Kategori maintenance ini sudah tersedia. Silakan gunakan nama berbeda.',
                ])->withInput();
            }
        }

        $billingCategory->update($validateData);
        return redirect('/billing-category')->with('success', 'Billing Category data has been updated!');
    }

    public function destroy(Request $request)
    {
    try {
        $billingCategory = BillingsCategory::find($request->id);
        $billingCategory->delete();
        return redirect('/billing-category')->with('success', 'Billing Category data has been deleted!');
    } catch (\Exception $e) {
        if($e->getCode() == 23000){
            return redirect('/billing-category')->with('error', 'Kategori ini tidak bisa dihapus karena masih digunakan dalam data tagihan.');
        }
            return redirect('/billing-category')->with('error', 'Terjadi kesalahan saat menghapus kategori billing.');
        }
    }
}