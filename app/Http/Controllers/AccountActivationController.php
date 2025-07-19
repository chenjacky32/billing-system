<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\ApartmentTower;
use App\Models\ApartmentType;
use App\Models\UserApartmentOkgo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use App\Helpers\LookupCache;

class AccountActivationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartId = $user->apartment_id;

        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $apartmentTowerMap = LookupCache::apartmentTowerMap($apartId, $role);
        $apartmentMap = LookupCache::apartmentMap($apartId, $role);

        $query = UserApartmentOkgo::select(
                    'id', 'userId', 'apartmentTowerId', 'apartmentId', 
                    'roomNo', 'identityImage', 'userImage', 'active', 
                    'apartmentType', 'ownership'
                )->with(['user:id,fullname,email,phone']);

        if ($role !== 'SUPER ADMIN') {
            $query->where('apartmentId', $apartId);
        }

        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->whereHas('user', fn ($q) => $q->where('fullname', 'like', "%$searchTerm%")
                                                    ->orWhere('email', 'like', "%$searchTerm%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('active', $request->status);
        }

        $userApartments = $query->orderByDesc('id')->paginate(10);

        $userApartments->getCollection()->transform(function ($item) use ($apartmentTypeMap, $apartmentTowerMap, $apartmentMap) {
            // Inject apartType
            $item->apartType = [
                'id' => $item->apartmentType,
                'name' => $apartmentTypeMap[$item->apartmentType] ?? 'Unknown'
            ];

            // Inject apartmentTower (include apartment if already eager loaded)
            $item->apartmentTower = $apartmentTowerMap[$item->apartmentTowerId] ?? null;

            // Inject apartment
            $item->apartment = $apartmentMap[$item->apartmentId] ?? null;

            return $item;
        });

        return Inertia::render('PendingAccount/Index', [
            'filters' => $request->only('search', 'active'),
            'data' => $userApartments,
        ]);
    }
    
    public function edit(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartId = $user->apartment_id;

        $userApartment = UserApartmentOkgo::with(['user:id,fullname,email,phone'])->find($request->id);

        if (!$userApartment) {
            return Redirect::route('pending-account.index')->with('error', 'User apartment not found.');
        }

        $unitCapacitiesMap = LookupCache::unitPowerCapacitiesMap();
        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $apartmentList = LookupCache::apartmentMap($apartId, $role);
        $apartmentTowerList = LookupCache::towerList($apartId, $role);
        $apartmentTowerMap = LookupCache::apartmentTowerMap($apartId, $role);
        $apartmentMap = LookupCache::apartmentMap($apartId, $role);

        $userApartment->apartType = isset($apartmentTypeMap[$userApartment->apartmentType]) 
            ? [
                'id' => $userApartment->apartmentType,
                'name' => $apartmentTypeMap[$userApartment->apartmentType],
            ] : null;
        
        $apartmentTower = $apartmentTowerMap[$userApartment->apartmentTowerId] ?? null;
        
        if ($apartmentTower && isset($apartmentMap[$userApartment->apartmentId])){
            $apartmentTower->apartment = $apartmentMap[$userApartment->apartmentId];
        }

        $apartment = collect($apartmentList)->map(fn($apart) => ['label' => $apart->name, 'value' => $apart->id])
            ->prepend(['label'=> 'Pilih Apartemen', 'value' => ''])
            ->values()
            ->toArray();

        $apartTowerData = collect($apartmentTowerList)
            ->prepend(['label' => 'Pilih Tower', 'value' => ''])
            ->values()
            ->toArray();
        
        $unitCapacitiesOptions = collect($unitCapacitiesMap)
            ->map(function($value, $id){
                return [
                    'label' => $value, 
                    'value' => $id
                ];
            })
            ->values()
            ->toArray()
            ;

        return Inertia::render('PendingAccount/Edit', [
            'userApartment' => $userApartment,
            'apartmentTower' => $apartmentTower,
            'apartId' => $apartId,
            'apartmenetData' => $apartment,
            'apartTowerData' => $apartTowerData,
            'unitCapacitiesOptions' => $unitCapacitiesOptions
        ]);
    }

    public function update(Request $request, $id){
        $validatedData = $request->validate([
            'active' => 'required|integer|min:0|max:1',
            'apartmentId' => 'required|integer|min:1|max:999999999999999',
            'apartmentTowerId' => 'required|integer|min:1|max:999999999999999',
            'powerCapacityId' => 'required|integer|min:1|max:999999999999999',
        ]);

        $userApartment = UserApartmentOkgo::find($id);
        $userApartment->active = $validatedData['active'];
        $userApartment->apartmentId = $validatedData['apartmentId'];
        $userApartment->apartmentTowerId = $validatedData['apartmentTowerId'];
        $userApartment->powerCapacityId = $validatedData['powerCapacityId'];
        $userApartment->save();

        return redirect('/account-management')->with('success', 'Account status updated successfully.');
    }
}
