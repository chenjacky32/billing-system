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

class AccountActivationController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;

        $userApartmentsQuery = UserApartmentOkgo::with(['user']);

        if ($role !== 'SUPER ADMIN') {
            $apartmentTowerIds = ApartmentTower::where('apartment_id', $user->apartment_id)
                ->pluck('id')
                ->toArray();

            $userApartmentsQuery->whereIn('apartmentTowerId', $apartmentTowerIds);
        }

        $userApartments = $userApartmentsQuery
            ->when($request->has('search'), function ($query) use ($request) {
                $searchTerm = $request->input('search');
                $query->whereHas('user', function ($subQuery) use ($searchTerm) {
                    $subQuery->where('fullname', 'like', "%$searchTerm%")
                        ->orWhere('email', 'like', "%$searchTerm%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $status = $request->input('status');
                $query->where('active', $status);
            })
            ->orderByDesc('id')
            ->paginate(10);


        $apartmentTypes = ApartmentType::pluck('name', 'id')->toArray();

        $userApartments->getCollection()->transform(function ($userApartment) use ($apartmentTypes) {
            $userApartment->apartType = [
                'id' =>$userApartment->apartmentType,
                'name' => $apartmentTypes[$userApartment->apartmentType] ?? 'Unknown',
            ];
            return $userApartment;
        });


        $apartmentTowers = ApartmentTower::with('apartment')->get()->keyBy('id');
    
        $userApartments->getCollection()->transform(function ($userApartment) use ($apartmentTowers) {
            if (isset($apartmentTowers[$userApartment->apartmentTowerId])) {
                $userApartment->apartmentTower = $apartmentTowers[$userApartment->apartmentTowerId];
            } else {
                $userApartment->apartmentTower = null; 
            }
            return $userApartment;
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

        $userApartment = UserApartmentOkgo::with(['user'])->find($request->id);
        $apartTower = ApartmentTower::query();

        if (!$userApartment) {
            return Redirect::route('pending-account.index')->with('error', 'User apartment not found.');
        }

        $apartmentTower = ApartmentTower::with('apartment')->find($userApartment->apartmentTowerId);
        
        $apartmentType = ApartmentType::find($userApartment->apartmentType);
        $userApartment->apartType = $apartmentType ? [
            'id' => $apartmentType->id,
            'name' => $apartmentType->name,
        ] : null;

        $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartementId) {
            return ['label' => $apartmentName, 'value' => $apartementId];
        })->prepend(['label' => 'Pilih Apartemen', 'value' => ''])->values()->toArray();

        $apartTowerData = $apartTower->get()->map(function ($apartmentTower) {
            return [
                'label' => $apartmentTower->tower_name,
                'value' => $apartmentTower->id
            ];
        })->prepend(['label' => 'Pilih Tower', 'value' => ''])->values()->toArray();


        return Inertia::render('PendingAccount/Edit', [
            'userApartment' => $userApartment,
            'apartmentTower' => $apartmentTower,
            'apartId' => $apartId,
            'apartmenetData' => $apartment,
            'apartTowerData' => $apartTowerData
        ]);
    }

    public function update(Request $request, $id){
        $validatedData = $request->validate([
            'active' => 'required|integer|min:0|max:1',
            'apartmentId' => 'required|integer|min:1|max:999999999999999',
            'apartmentTowerId' => 'required|integer|min:1|max:999999999999999',
        ]);

        $userApartment = UserApartmentOkgo::find($id);
        $userApartment->active = $validatedData['active'];
        $userApartment->apartmentId = $validatedData['apartmentId'];
        $userApartment->apartmentTowerId = $validatedData['apartmentTowerId'];
        $userApartment->save();

        return redirect('/account-pending')->with('success', 'Account has been activated successfully.');
    }
}
