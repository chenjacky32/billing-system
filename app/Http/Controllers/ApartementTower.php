<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\ApartmentTower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApartementTower extends Controller
{
    //
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $userApartId = $user->apartment_id;
        $ApartmentId = Apartment::find($userApartId);
        
        $query = ApartmentTower::with(['apartment','createdBy'])
        ->when($role !== 'SUPER ADMIN',function($query) use ($user){
            return $query->where('apartment_id',$user->apartment_id);
        })
        ->when($request->has('search'),function($query) use ($request){
            return $query->where('tower_name','like',"%".$request->input('search')."%");
        })
        ->orderByDesc('id')
        ->paginate(10)
        ;
        
        return Inertia::render('ApartmentTower/ApartmentTower',[
            'filters'=> $request->only('search'),
            'data' => $query,
            'apartmentId' => $ApartmentId,
        ]);
    }

    public function add()
    {
        $user = Auth::user();
        $apartId = $user->apartment_id;
        $findApartment = Apartment::find($apartId);


        if ($findApartment){
            $apartmentName = $findApartment->name;
        } else {
            $apartmentName = 'Apartment not found';
        }

        $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartmentId) {
            return ['label' => $apartmentName, 'value' => $apartmentId];
        })->prepend(['label' => 'Pilih Apartemen', 'value' => ''])->values()->toArray();

        return Inertia::render('ApartmentTower/AddApartmentTower',[
            'apartmentData' => $apartment,
            'apartmentName' => $apartmentName,
            'apartmentId' => $apartId,
        ]);

    }
    
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'tower_name' => 'required|string|max:255',
            'total_room'=> 'required|integer|min:1|max:999999999999999',
            'apartment_id' => 'required|integer|exists:apartments,id',
        ]);

        $validateData['created_by'] = Auth::id();

        ApartmentTower::create($validateData);
        return redirect('/apartement-tower')->with('success', 'Apartment Tower data has been created!');
    }

    public function edit(ApartmentTower $apartmentTower, Request $request)
    {
        $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartementId) {
            return ['label' => $apartmentName, 'value' => $apartementId];
        })->prepend(['label' => 'Pilih Apartemen', 'value' => ''])->values()->toArray();
      
        $user = Auth::user();
        $apartmentTowerData = $apartmentTower->find($request->id);
        $apartmentId = $apartmentTowerData->apartment_id;
    
        $userApartmentId = $user->apartment_id;
        $role = $user->role;

        $apartId = $user->apartment_id;
        $findApartment = Apartment::find($apartId);
     
        if ($findApartment){
            $apartName = $findApartment->name;
        } else {
            $apartName = 'Apartment not found';
        }
        
    
        if ($role === 'SUPER ADMIN') {
            return Inertia::render('ApartmentTower/EditApartmentTower', [
                "apartmentTowerData" => $apartmentTowerData,
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
            ]);
        } else if ($userApartmentId == $apartmentId ) {
            return Inertia::render('ApartmentTower/EditApartmentTower', [
                "apartmentTowerData" => $apartmentTowerData,
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
            ]);
        }else {
            return redirect('/unauthorized');
        }
    

    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartmentTower = ApartmentTower::findOrFail($id);
    
        $validatedData = $request->validate([
            'tower_name'=> 'required|string|max:255',
            'total_room'=> 'required|integer|min:1|max:999999999999999',
            'apartment_id' => 'required|integer|exists:apartments,id',
        ]);
        $validatedData['created_by'] = Auth::id();
    
        $apartmentTower->update($validatedData);
        return redirect('/apartement-tower')->with('success', 'Apartment Tower data has been updated!');
    }

    public function destroy(Request $request)
    {
        $apartmentTower = ApartmentTower::findOrFail($request->id);
        $apartmentTower->delete();
        return redirect('/apartement-tower')->with('success', 'Apartment Tower data has been deleted!');
    
    }


}
