<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\ApartmentType;
use App\Models\BillingsCategory;
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

        $apartmentType = ApartmentType::pluck('name', 'id')->map(function ($apartmentTypeName, $apartmentTypeId) {
            return ['label' => $apartmentTypeName, 'value' => $apartmentTypeId];
        })->values()->toArray();

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
            'apartmentType' => $apartmentType
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

        $apartmentType = ApartmentType::pluck('name', 'id')->map(function ($apartmentTypeName, $apartmentTypeId) {
            return ['label' => $apartmentTypeName, 'value' => $apartmentTypeId];
        })->values()->toArray();

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
                'apartmentType' => $apartmentType
            ]);
        } else if ($userApartmentId == $billingCategoryApartmentData ) {
            return Inertia::render('BillingCategory/EditBillingCategory', [
                "billingCategoryData" => $billingCategory->find($request->id),
                'apartmentData' => $apartment,
                'apartmentId' => $userApartmentId,
                'apartmentName' => $apartName,
                'apartmentType' => $apartmentType
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

        if($validateData['billing_type'] === "Maintenance"){
            $existingData = BillingsCategory::where('apartment_id', $validateData['apartment_id'])
                ->where('billing_type', 'Maintenance')
                ->where('category_name', $validateData['category_name'])
                ->exists();
            Log::info('existingData', ['existingData' => $existingData]);

            if ($existingData) {
                return back()->withErrors(['category_name' => 'Kategori tagihan untuk tipe apartemen ini sudah tersedia. Jika perlu melakukan perubahan, silakan edit kategori yang sudah ada atau gunakan Tipe Apartemen lain'])->withInput();
            }
        }   

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

        if($validatedData['billing_type'] === "Maintenance"){
            $existingData = BillingsCategory::where('billing_type', 'Maintenance')
                ->where('apartment_id', $validatedData['apartment_id'])
                ->where('category_name', $validatedData['category_name'])
                ->where('id', '!=', $id)
                ->exists();
            if($existingData) {
                return back()->withErrors([
                    'category_name'=>"Kategori '{$validatedData['category_name']}' untuk tipe apartemen ini sudah ada di sistem. Silakan gunakan Tipe Apartemen lain."
                ])->withInput();
            }
        }

        $validatedData['created_by'] = Auth::id();

        $billingCategory->update($validatedData);
        return redirect('/billing-category')->with('success', 'Billing Category data has been updated!');
    }


    public function destroy(Request $request)
    {
    try{
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