<?php

namespace App\Http\Controllers;

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

        $query = BillingsCategory::with(['apartment'])
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

    public function add(){
        return Inertia::render('BillingCategory/BillingCategory');
    }
}
