<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\BillingFineRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BillingFineRulesController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $userApartId = $user->apartment_id;
        $ApartmentId = Apartment::find($userApartId);

        $query = BillingFineRules::with(['apartment','createdBy'])
        ->when($role !== 'SUPER ADMIN',function($query) use ($user){
            return $query->where('apartment_id',$user->apartment_id);
        })
        ->when($request->has('search'),function($query) use ($request){
            return $query->where('billing_type','like',"%".$request->input('search')."%");
        })
        ->orderByDesc('id')
        ->paginate(10)
        ;
        
        return Inertia::render('BillingFineRules/Index',[
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

        return Inertia::render('BillingFineRules/Add',[
            'apartmentData' => $apartment,
            'apartmentName' => $apartmentName,
            'apartmentId' => $apartId,
        ]);
    }
    public function edit(BillingFineRules $billingFineRules,Request $request)
    {
        $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartementId) {
            return ['label' => $apartmentName, 'value' => $apartementId];
        })->prepend(['label' => 'Pilih Apartemen', 'value' => ''])->values()->toArray();
      
        $user = Auth::user();
        $fineRulesData = $billingFineRules->find($request->id);
        $apartmentId = $fineRulesData->apartment_id;
    
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
            return Inertia::render('BillingFineRules/Edit', [
                "fineRulesData" => $fineRulesData,
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
            ]);
        } else if ($userApartmentId == $apartmentId ) {
            return Inertia::render('BillingFineRules/Edit', [
                "fineRulesData" => $fineRulesData,
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
            ]);
        }else {
            return redirect('/unauthorized');
        }
    
    }
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'apartment_id' => 'required|integer|exists:apartments,id',
            'billing_type' => 'required|string|max:255',
            'max_fine' => 'nullable|integer|min:0|max:999999999999999',
            'percentage' => 'nullable|integer|min:0|max:999999999999999',
            'due_date' => 'nullable|integer|min:0|max:999999999999999',
            'fine_rate_per_day' => 'nullable|integer|min:0|max:999999999999999',
        ]);

        $validateData['created_by'] = Auth::id();

        
        if (!isset($validatedData['fine_rate_per_day'])) {
            $validatedData['fine_rate_per_day'] = 0;
        }

        if (isset($validateData['percentage'])) {
            $validateData['percentage'] = $validateData['percentage'] / 100;
        } else {
            $validateData['percentage'] = 0; // Default value jika tidak diisi
        }
        BillingFineRules::create($validateData);
        return redirect('/billing-fine-rules')->with('success', 'Billing Fine Rules data has been created!');
    }
    public function update(Request $request, $id)
    {
        $billingFineRules = BillingFineRules::findOrFail($id);

        $validatedData = $request->validate([
            'apartment_id' => 'required|integer|exists:apartments,id',
            'billing_type' => 'required|string|max:255',
            'max_fine' => 'nullable|integer|min:0|max:999999999999999',
            'percentage' => 'nullable|integer|min:0|max:999999999999999',
            'due_date' => 'nullable|integer|min:0|max:999999999999999',
            'fine_rate_per_day' => 'nullable|integer|min:0|max:999999999999999',
        ]);

        $validatedData['created_by'] = Auth::id();

        if (!isset($validatedData['max_fine'])) {
            $validatedData['max_fine'] = 0;
        }

        if (!isset($validatedData['fine_rate_per_day'])) {
            $validatedData['fine_rate_per_day'] = 0;
        }

        if (isset($validatedData['percentage'])) {
            $validatedData['percentage'] = $validatedData['percentage'] / 100;
        } else {
            $validatedData['percentage'] = 0; // Default value jika tidak diisi
        }
        $billingFineRules->update($validatedData);
        return redirect('/billing-fine-rules')->with('success', 'Billing Fine Rules data has been updated!');
    
    }
    public function destroy(Request $request)
    {
        $billingFineRules = BillingFineRules::findOrFail($request->id);
        $billingFineRules->delete();
        return redirect('/billing-fine-rules')->with('success', 'Billing Fine Rules data has been deleted!');
    }
}
