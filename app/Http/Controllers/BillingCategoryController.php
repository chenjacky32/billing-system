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

    public function edit()
    {
        return Inertia::render('BillingCategory/EditBillingCategory');
    }

    public function store(Request $request)
    {

        $validateData = $request->validate([
            'category_name' => 'required|string|max:255',
            'apartment_id' => 'required|integer|exists:apartments,id',
            'billing_type' => 'required|string|max:255',
            'unit_price' => 'required|integer|min:1|max:999999999999999',
        ]);

        $validateData['created_by'] = Auth::id();

        BillingsCategory::create($validateData);
        return redirect('/billing-category')->with('success', 'Billing Category data has been created!');
    }
}
