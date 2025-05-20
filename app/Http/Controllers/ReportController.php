<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\ApartmentOwner;
use App\Models\ApartmentTower;
use App\Models\ApartmentType;
use App\Models\UserApartmentOkgo;
use Illuminate\Http\Request;
use App\Models\Billing;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function showPaid(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;

        $queryBySuccess = Billing::where('status', 'success');
        $towerQuery = ApartmentTower::query();
        $apartmentType = ApartmentType::query();

        if($role !== 'SUPER ADMIN'){
            $queryBySuccess->where('apartment_id', $user->apartment_id);
            $towerQuery->where('apartment_id', $apartmentId);
        }
        $totalCountSuccess = $queryBySuccess->count();
        $totalBillingFee = $queryBySuccess->sum('total_amount');
        $totalFine = $queryBySuccess->sum('fine');
    
        $tower_data = $towerQuery->get()->map( function ($tower) {
            return [
                'label' => $tower->tower_name,
                'value' => $tower->id
            ];
            })->values()->toArray();
        
        $apartmentTypeData = $apartmentType->get()->map(function ($apartmentType) {
            return [
                'label' => $apartmentType->name,
                'value' => $apartmentType->id
            ];
        })->values()->toArray();

        return Inertia::render('Report/PaidReport', [
            'filters' => $request->only('search','period','towerId','unitType','billingType'),
            'data' => Billing::with(['owner', 'createdBy','tower', 'residence.user','apartment'])
                ->where('status', 'success')  // Only include records where status is "success"
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->when($request->has('search'), function ($query) use ($request) {
                    $searchTerm = $request->input('search');

                    $matchingResidenceIds = UserApartmentOkgo::whereHas('user', function ($q) use ($searchTerm) {
                        $q->where('fullname', 'like', "%$searchTerm%");
                    })
                    ->orWhere('roomNo', 'like', "%$searchTerm%")
                    ->pluck('id') // Ambil hanya kolom `id`
                    ->toArray();
            
                $query->whereIn('residence_id', $matchingResidenceIds);
                })
                ->when($request->filled('period'), function($query) use ($request){
                    $period = $request->input('period');
                    $query->where('period','like',"%$period%");
                })
                ->when($request->filled('billingType'), function($query) use ($request){
                        $billingType = $request->input('billingType');
                        $query->where('billing_type','like',"%$billingType%");
                })->when($request->filled('towerId'), function($query) use ($request){
                        $tower = $request->input('towerId');
                        $query->where('tower_id','like',"%$tower%");
                })->when($request->filled('unitType'), function($query) use ($request){
                        $unitType = $request->input('unitType');
                        $matchingResidenceIds = UserApartmentOkgo::where('apartmentType', $unitType)
                            ->pluck('id') // Ambil hanya kolom `id`
                            ->toArray();
                        $query->whereIn('residence_id', $matchingResidenceIds);
                })
                ->orderByDesc('id')
                ->paginate(10),
            'totalBillingIsPaid' => $totalBillingFee,
            'totalCountSuccess' => $totalCountSuccess,
            'totalFine' => $totalFine,
            'towerData' => $tower_data,
            'apartmentType' => $apartmentTypeData
        ]);
    }

    public function showUnpaid(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;

        $queryByPending = Billing::where('status', 'pending')->where('due_date', '>=', today());
        $towerQuery = ApartmentTower::query();
        $apartmentType = ApartmentType::query();

        if($role !== 'SUPER ADMIN'){
            $queryByPending->where('apartment_id', $user->apartment_id);
            $towerQuery->where('apartment_id', $apartmentId);
        }
        $totalCountPending = $queryByPending->count();
        $totalBillingFee = $queryByPending->sum('total_amount');
        $totalFine = $queryByPending->sum('fine');

        $tower_data = $towerQuery->get()->map( function ($tower) {
            return [
                'label' => $tower->tower_name,
                'value' => $tower->id
            ];
        })->values()->toArray();
        
        $apartmentTypeData = $apartmentType->get()->map(function ($apartmentType) {
            return [
                'label' => $apartmentType->name,
                'value' => $apartmentType->id
            ];
        })->values()->toArray();

        return Inertia::render('Report/UnpaidReport', [
            'filters' => $request->only('search','period','towerId','unitType','billingType'),  // Remove 'status' from the filters
            'data' => Billing::with(['owner', 'createdBy', 'tower', 'residence.user','apartment'])
                ->where('status', 'pending')  // Only include records where status is "pending"
                ->where('due_date', '>=', today()) // Only include records where due_date is today or in the future
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->when($request->has('search'), function ($query) use ($request) {
                    $searchTerm = $request->input('search');
                    
                    $matchingResidenceIds = UserApartmentOkgo::whereHas('user', function ($q) use ($searchTerm) {
                        $q->where('fullname', 'like', "%$searchTerm%");
                    })
                    ->orWhere('roomNo', 'like', "%$searchTerm%")
                    ->pluck('id') // Ambil hanya kolom `id`
                    ->toArray();
            
                $query->whereIn('residence_id', $matchingResidenceIds);
                })
                ->when($request->filled('period'), function($query) use ($request){
                        $period = $request->input('period');
                        $query->where('period','like',"%$period%");
                })
                ->when($request->filled('billingType'), function($query) use ($request){
                        $billingType = $request->input('billingType');
                        $query->where('billing_type','like',"%$billingType%");
                })->when($request->filled('towerId'), function($query) use ($request){
                        $tower = $request->input('towerId');
                        $query->where('tower_id','like',"%$tower%");
                })->when($request->filled('unitType'), function($query) use ($request){
                        $unitType = $request->input('unitType');
                        $matchingResidenceIds = UserApartmentOkgo::where('apartmentType', $unitType)
                            ->pluck('id') // Ambil hanya kolom `id`
                            ->toArray();
                    $query->whereIn('residence_id', $matchingResidenceIds);
            })
                ->orderByDesc('id')
                ->paginate(10),
                
            'totalBillingIsUnpaid' => $totalBillingFee,
            'totalCountPending' => $totalCountPending,
            'totalFine'=> $totalFine,
            'towerData' => $tower_data,
            'apartmentType' => $apartmentTypeData
        ]);
    }

    public function showPenalties(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;

        $queryByPenalties = Billing::where('status', 'pending')->where('due_date', '<', today());
        $towerQuery = ApartmentTower::query();
        $apartmentType = ApartmentType::query();


        if($role !== 'SUPER ADMIN'){
            $queryByPenalties->where('apartment_id', $user->apartment_id);
            $towerQuery->where('apartment_id', $apartmentId);
        }
        $totalBillingWithPenalties = $queryByPenalties->count();
        $totalBillingFee = $queryByPenalties->sum('total_amount');
        $totalFine = $queryByPenalties->sum('fine');

        $tower_data = $towerQuery->get()->map( function ($tower) {
            return [
                'label' => $tower->tower_name,
                'value' => $tower->id
            ];
            })->values()->toArray();
        
        $apartmentTypeData = $apartmentType->get()->map(function ($apartmentType) {
            return [
                'label' => $apartmentType->name,
                'value' => $apartmentType->id
            ];
        })->values()->toArray();
    
        return Inertia::render('Report/PenaltiesReport', [
            'filters' => $request->only('search','period','towerId','unitType','billingType'),  // Remove 'status' from the filters
            'data' => Billing::with(['owner', 'createdBy','tower','residence.user','apartment'])
                ->where('status', 'pending')  // Only include records where status is "pending"
                ->where('due_date', '<', today()) // Only include records where due_date is today or in the future
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->when($request->has('search'), function ($query) use ($request) {
                    $searchTerm = $request->input('search');
                    
                    $matchingResidenceIds = UserApartmentOkgo::whereHas('user', function ($q) use ($searchTerm) {
                        $q->where('fullname', 'like', "%$searchTerm%");
                    })
                    ->orWhere('roomNo', 'like', "%$searchTerm%")
                    ->pluck('id') // Ambil hanya kolom `id`
                    ->toArray();
            
                $query->whereIn('residence_id', $matchingResidenceIds);
                })
                ->when($request->filled('period'), function($query) use ($request){
                    $period = $request->input('period');
                    $query->where('period','like',"%$period%");
                })
                ->when($request->filled('billingType'), function($query) use ($request){
                        $billingType = $request->input('billingType');
                        $query->where('billing_type','like',"%$billingType%");
                })->when($request->filled('towerId'), function($query) use ($request){
                        $tower = $request->input('towerId');
                        $query->where('tower_id','like',"%$tower%");
                })->when($request->filled('unitType'), function($query) use ($request){
                        $unitType = $request->input('unitType');
                        $matchingResidenceIds = UserApartmentOkgo::where('apartmentType', $unitType)
                            ->pluck('id') // Ambil hanya kolom `id`
                            ->toArray();
                    $query->whereIn('residence_id', $matchingResidenceIds);
                })
                ->orderByDesc('id')
                ->paginate(10),

            'BillingFee' => $totalBillingFee,
            'BillingWithPenalties' => $totalBillingWithPenalties,
            'totalFine' => $totalFine,
            'towerData' => $tower_data,
            'apartmentType' => $apartmentTypeData
        ]);
    }

    public function ownerReport(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
    
        $userApartmentsQuery = UserApartmentOkgo::with(['user'])
            ->where('active', 1);
    
        if ($role !== 'SUPER ADMIN') {
            $userApartmentsQuery->where('apartmentId', $user->apartment_id);
        }

        if ($request->has('search')) {
            $searchTerm = "%" . $request->input('search') . "%";
            $userApartmentsQuery->whereHas('user', function ($query) use ($searchTerm) {
                $query->where('fullname', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm);
            })->orWhere('roomNo', 'like', $searchTerm);
        }
    
        $userApartments = $userApartmentsQuery->orderByDesc('id')->paginate(10);
    
        $apartmentTowers = ApartmentTower::get()->keyBy('id');
        $apartments = Apartment::get()->keyBy('id');
    
    
        $userApartments->getCollection()->transform(function ($userApartment) use ($apartmentTowers, $apartments) {
            $userApartment->apartmentTower = $apartmentTowers[$userApartment->apartmentTowerId] ?? null;
            $userApartment->apartment = $apartments[$userApartment->apartmentId] ?? null;
            return $userApartment;
        });
    
        return Inertia::render('Report/OwnerReport', [
            'filters' => $request->only('search'),
            'data' => $userApartments,
        ]);
    }

    public function show(Request $request)
    {
        // Retrieve the user_id from the request
        $userId = $request->id;

        // Fetch the owner name based on the user_id
        $ownerName = UserApartmentOkgo::with('user')
            ->where('id', $userId)
            ->first()
            ->user
            ->fullname ?? null;

        $user = Auth::user();
        $role = $user->role;
        $apartemntId = $user->apartment_id;

        $ownerApartId = UserApartmentOkgo::where('id', $userId)->value('apartmentId');
        $towerQuery = ApartmentTower::query();
        $apartmentType = ApartmentType::query();

        $query = Billing::with([
            'tower',                   // Relasi ke Tower
            'residence.user',          // Relasi ke Residence & User
             // Relasi ke ApartmentTypeData
        ])->where('residence_id', $userId)
        ->orderBy('billing_date', 'desc');
          
        // $query = DB::table('billings')
        //         ->where('residence_id', $userId)
        //         ->orderBy('billing_date', 'desc');

        // Parse from_date and until_date from request
        // $fromDate = $request->from_date ? date('Y-m-d', strtotime($request->from_date)) : null;
        // $untilDate = $request->until_date ? date('Y-m-d', strtotime($request->until_date)) : null;

        // Apply date range filter if provided
        // if ($fromDate && $untilDate) {
        //     $query->whereBetween('billing_date', [$fromDate, $untilDate]);
        // } elseif ($fromDate) {
        //     $query->whereDate('billing_date', '>=', $fromDate);
        // } elseif ($untilDate) {
        //     $query->whereDate('billing_date', '<=', $untilDate);
        // } else {
        //     // If neither from_date nor until_date provided, use default range
        //     $defaultFromDate = now()->subMonths(12)->toDateString();
        //     $query->whereDate('billing_date', '>=', $defaultFromDate)
        //         ->whereDate('billing_date', '<=', now()->endOfDay());
        // }

        // Apply status filter if provided

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('billingType')) {
            $query->where('billing_type', $request->billingType);
        }

        if($request->filled('period')) {
            $period = $request->period;
            $query->where('period', 'like', "%$period%");
        }

        // Fetch data with pagination
        $data = $query->paginate(10);

        $tower_data = $towerQuery->get()->map( function ($tower) {
            return [
                'label' => $tower->tower_name,
                'value' => $tower->id
            ];
            })->values()->toArray();
        
        $apartmentTypeData = $apartmentType->get()->map(function ($apartmentType) {
            return [
                'label' => $apartmentType->name,
                'value' => $apartmentType->id
            ];
        })->values()->toArray();


        if ($role === 'SUPER ADMIN') {
            // Pass the fetched data to the Inertia component
            return Inertia::render('Report/OwnerBillingHistory', [
                "data" => $data,
                'filters' => $request->only('search', 'period', 'status', 'billingType'),
                // 'filters' => $request->only('status', 'from_date', 'until_date'),
                'ownerId' => $userId,
                'ownerName' => $ownerName,
                'towerData' => $tower_data,
                'apartmentType' => $apartmentTypeData
            ]);
        } else {
            if ($apartemntId == $ownerApartId) {
                // Pass the fetched data to the Inertia component
                return Inertia::render('Report/OwnerBillingHistory', [
                    "data" => $data,
                    'filters' => $request->only('search', 'period', 'status', 'billingType'),
                    // 'filters' => $request->only('status', 'from_date', 'until_date'),
                    'ownerId' => $userId,
                    'ownerName' => $ownerName,
                    'towerData' => $tower_data,
                    'apartmentType' => $apartmentTypeData
                ]);
            } else {
                return redirect('/unauthorized');
            }
        }
    }
}
