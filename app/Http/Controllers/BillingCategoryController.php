<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\BillingsCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class BillingCategoryController extends Controller
{
    //
    public function index(Request $request)
    {
        
        $user = Auth::user();
        $role = $user->role;

        $query = BillingsCategory::with(['apartment','createdBy'])
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


        if ($findApartment){
            $apartmentName = $findApartment->name;
        } else {
            $apartmentName = 'Apartment not found';
        }

        $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartmentId) {
            return ['label' => $apartmentName, 'value' => $apartmentId];
        })->prepend(['label' => 'Pilih Apartemen', 'value' => ''])->values()->toArray();

        return Inertia::render('BillingCategory/AddBillingCategory',[
            'apartmentData' => $apartment,
            'apartmentName' => $apartmentName,
            'apartmentId' => $apartId,
        ]);

    }

    public function edit(BillingsCategory $billingCategory, Request $request)
    {
      $apartment = Apartment::pluck('name', 'id')->map(function ($apartmentName, $apartementId) {
            return ['label' => $apartmentName, 'value' => $apartementId];
        })->prepend(['label' => 'Pilih Apartemen', 'value' => ''])->values()->toArray();
      
        $user = Auth::user();
        $billingCategoryData = $billingCategory->find($request->id);
        $billingCategoryApartmentData = $billingCategoryData->apartment_id;
    
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
            return Inertia::render('BillingCategory/EditBillingCategory', [
                "billingCategoryData" => $billingCategory->find($request->id),
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
            ]);
        } else if ($userApartmentId == $billingCategoryApartmentData ) {
            return Inertia::render('BillingCategory/EditBillingCategory', [
                "billingCategoryData" => $billingCategory->find($request->id),
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
            'category_name' => 'required|string|max:255',
            'apartment_id' => 'required|integer|exists:apartments,id',
            'billing_type' => 'required|string|max:255',
            'unit_price' => 'required|integer|min:1|max:999999999999999',
            'minimum_charge' => 'required|integer|min:0|max:999999999999999',
        ]);

        $validateData['created_by'] = Auth::id();

        BillingsCategory::create($validateData);
        return redirect('/billing-category')->with('success', 'Billing Category data has been created!');
    }

    public function update(Request $request, $id)
    {
        $billingCategory = BillingsCategory::findOrFail($id);

        $validatedData = $request->validate([
            'billing_type'=>'required|string|max:255',
            'category_name'=>'required|string|max:255',
            'unit_price'=>'required|integer|min:1|max:999999999999999',
            'apartment_id' => 'required|integer|exists:apartments,id',
            'minimum_charge' => 'required|integer|min:0|max:999999999999999',
        ]);
        $validatedData['created_by'] = Auth::id();

        $billingCategory->update($validatedData);
        return redirect('/billing-category')->with('success', 'Billing Category data has been updated!');
    }


    public function destroy(Request $request)
    {
     $billingCategory = BillingsCategory::find($request->id);
     $billingCategory->delete();
     return redirect('/billing-category')->with('success', 'Billing Category data has been deleted!');
    }
}