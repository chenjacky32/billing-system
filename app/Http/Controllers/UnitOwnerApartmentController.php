<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\ApartmentTower;
use App\Models\UserApartmentOkgo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UnitOwnerApartmentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;

        $userApartmentsQuery = UserApartmentOkgo::with(['user'])->where('active', 1);

        $apartId = $user->apartment_id;
        $apar = Apartment::find($apartId);

        $apartmentTower = ApartmentTower::Query();
        if($role !== 'SUPER ADMIN'){
            $apartmentTowerIds = ApartmentTower::where('apartment_id', $apartId)
            ->pluck('id')
            ->toArray();

            $userApartmentsQuery->whereIn('apartmentTowerId', $apartmentTowerIds);
        }

        $apartmentTower = $apartmentTower->get()->map(function ($apartmentTower) {
            return [
                'label' => $apartmentTower->tower_name,
                'value' => $apartmentTower->id
            ];
        })->prepend(['label' => 'Pilih Tower', 'value' => ''])->values()->toArray();

        if ($apar) {
            $apartName = $apar->name; 
        } else {
            $apartName = 'Apartment not found';
        }

        $userApartments = $userApartmentsQuery
        ->when($request->has('search'), function ($query) use ($request) {
            $searchTerm = $request->input('search');
            $query->whereHas('user', function ($subQuery) use ($searchTerm) {
                $subQuery->where('fullname', 'like', "%$searchTerm%")
                    ->orWhere('email', 'like', "%$searchTerm%")
                    ->orWhere('roomNo', 'like', "%$searchTerm%");
            });
        })
        ->orderByDesc('id')
        ->paginate(10);

        $apartmentTowers = ApartmentTower::with('apartment')->get()->keyBy('id');

        $userApartments->getCollection()->transform(function ($userApartment) use ($apartmentTowers) {
            if (isset($apartmentTowers[$userApartment->apartmentTowerId])) {
                $userApartment->apartmentTower = $apartmentTowers[$userApartment->apartmentTowerId];
            } else {
                $userApartment->apartmentTower = null; 
            }
            return $userApartment;
        });

        $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartementId) {
            return ['label' => $apartmentName, 'value' => $apartementId];
        })->prepend(['label' => 'Pilih Apartemen', 'value' => ''])->values()->toArray();

        return Inertia::render('UnitOwnerApartment/Index', [
            'userApartments' => $userApartments,
            'filters'=> $request->only('search'),
            'apartmentName'=> $apartName, 
            'apartmentTower' => $apartmentTower,
            'apartmenetData' => $apartment,
            'apartId'=> $apartId
        ]);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'apartmentTowerId'=> 'required|exists:apartment_tower,id',
            'apartmentId'=> 'required|exists:apartments,id',
            'roomNo'=> 'required|integer|min:1|max:999999999999999',
        ]);

        $userApartment = UserApartmentOkgo::find($id);

        if(!$userApartment) {
            return Redirect()->back()->with('error', 'User apartment not found.');
        }

        $userApartment->update([
            'apartmentTowerId' => $validatedData['apartmentTowerId'],
            'apartmentId' => $validatedData['apartmentId'],
            'roomNo' => $validatedData['roomNo'],
        ]);

        return redirect('/unit-owner-apartment')->with('success', 'Unit owner data has been updated!');
    }


}
