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
use Illuminate\Support\Facades\Cache;
use App\Helpers\LookupCache;

class ReportController extends Controller
{
    public function showPaid(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;

        // Handle search & unitType → filter manual with whereIn
        $matchingResidenceIds = null;

        if ($request->has('search') || $request->filled('unitType')) {
            $residenceQuery = UserApartmentOkgo::query();

            if ($request->has('search')) {
                $searchTerm = $request->input('search');
                $residenceQuery->where(function ($q) use ($searchTerm) {
                    $q->whereHas('user', fn ($q2) =>
                        $q2->where('fullname', 'like', "%{$searchTerm}%")
                    )->orWhere('roomNo', 'like', "%{$searchTerm}%");
                });
            }

            if ($request->filled('unitType')) {
                $residenceQuery->where('apartmentType', $request->unitType);
            }

            $matchingResidenceIds = $residenceQuery->pluck('id')->toArray();
        }

        // Build query Billing
        $queryBySuccess = Billing::where('status', 'success')
            ->when($role !== 'SUPER ADMIN', fn ($query) =>
                $query->where('apartment_id', $apartmentId)
            )
            ->when($matchingResidenceIds, fn ($query) =>
                $query->whereIn('residence_id', $matchingResidenceIds)
            )
            ->when($request->filled('period'), fn ($q) =>
                $q->where('period', $request->input('period')) 
            )
            ->when($request->filled('billingType'), fn ($q) =>
                $q->where('billing_type', $request->input('billingType')) 
            )
            ->when($request->filled('towerId'), fn ($q) =>
                $q->where('tower_id', $request->input('towerId'))    
            );

        // Get Billing Data
        $data = (clone $queryBySuccess)
            ->select(
                'id',
                'period',
                'billing_type',
                'billing_fee',
                'fine',
                'total_amount',
                'residence_id',
                'tower_id',
                'apartment_id',
                'paid_date',
                'status',
            )
            ->with([
                'tower:id,tower_name',
                'residence:id,userId,apartmentTowerId,apartmentId,roomNo,apartmentType',
                'residence.user:id,fullname',
            ])
            ->orderByDesc('id')
            ->paginate(10);

        $totalCountSuccess = $data->total();
        $totalBillingFee = (clone $queryBySuccess)->sum('total_amount');
        $totalFine = (clone $queryBySuccess)->sum('fine');

        // Get Mapping apartmentType name
        $apartmentTypeMap = LookupCache::apartmentTypeMap();

        // Inject Mapping billing/residence
        $data->getCollection()->transform(function ($billing) use ($apartmentTypeMap) {
            if ($billing->residence) {
                $apartmentTypeId = $billing->residence->apartmentType;
                $billing->residence->apartmentTypeData = isset($apartmentTypeMap[$apartmentTypeId])
                    ? [
                        'id' => $apartmentTypeId,
                        'name' => $apartmentTypeMap[$apartmentTypeId],
                    ]
                    : null;
            }
            return $billing;
        });

        // Get Master Data Tower and UnitType
        $tower_data = LookupCache::towerList($apartmentId, $role);
        $apartmentTypeData = LookupCache::apartmentTypeList();

        return Inertia::render('Report/PaidReport', [
            'filters'=> $request->only('search','period','towerId','unitType','billingType'),
            'data' => $data,
            'totalBillingIsPaid' => $totalBillingFee,
            'totalCountSuccess' => $totalCountSuccess,
            'totalFine' => $totalFine,
            'towerData' => $tower_data,
            'apartmentType' => $apartmentTypeData,
        ]);
    }

    public function showUnpaid(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;

        // Handle search & unitType → filter manual with whereIn
        $matchingResidenceIds = null;

        if ($request->has('search') || $request->filled('unitType')) {
            $residenceQuery = UserApartmentOkgo::query();

            if ($request->has('search')) {
                $searchTerm = $request->input('search');
                $residenceQuery->where(function ($q) use ($searchTerm) {
                    $q->whereHas('user', fn ($q2) =>
                        $q2->where('fullname', 'like', "%{$searchTerm}%")
                    )->orWhere('roomNo', 'like', "%{$searchTerm}%");
                });
            }

            if ($request->filled('unitType')) {
                $residenceQuery->where('apartmentType', $request->unitType);
            }

            $matchingResidenceIds = $residenceQuery->pluck('id')->toArray();
        }

        // Build query Billing
        $queryByPending = Billing::where('status', 'pending')
            ->where('due_date', '>=', today())
            ->when($role !== 'SUPER ADMIN', fn ($query) =>
                $query->where('apartment_id', $apartmentId)
            )
            ->when($matchingResidenceIds, fn ($query) =>
                $query->whereIn('residence_id', $matchingResidenceIds)
            )
            ->when($request->filled('period'), fn ($q) =>
                $q->where('period', $request->input('period')) 
            )
            ->when($request->filled('billingType'), fn ($q) =>
                $q->where('billing_type', $request->input('billingType')) 
            )
            ->when($request->filled('towerId'), fn ($q) =>
                $q->where('tower_id', $request->input('towerId'))
            );

        // Get Billing Data
        $data = (clone $queryByPending)
            ->select(
                'id',
                'period',
                'billing_type',
                'billing_fee',
                'fine',
                'total_amount',
                'residence_id',
                'tower_id',
                'apartment_id',
                'paid_date',
                'status',
                'billing_date',
                'due_date',
            )
            ->with([
                'tower:id,tower_name',
                'residence:id,userId,apartmentTowerId,apartmentId,roomNo,apartmentType',
                'residence.user:id,fullname',
            ])
            ->orderByDesc('id')
            ->paginate(10);

        $totalCountPending = $data->total();
        $totalBillingFee = (clone $queryByPending)->sum('total_amount');
        $totalFine = (clone $queryByPending)->sum('fine');

        // Get Mapping apartmentType name
        $apartmentTypeMap = LookupCache::apartmentTypeMap();

        // Inject Mapping billing/residence
        $data->getCollection()->transform(function ($billing) use ($apartmentTypeMap) {
            if ($billing->residence) {
                $apartmentTypeId = $billing->residence->apartmentType;
                $billing->residence->apartmentTypeData = isset($apartmentTypeMap[$apartmentTypeId])
                    ? [
                        'id' => $apartmentTypeId,
                        'name' => $apartmentTypeMap[$apartmentTypeId],
                    ]
                    : null;
            }
            return $billing;
        });

        // Get Master Data Tower and UnitType
        $tower_data = LookupCache::towerList($apartmentId, $role);
        $apartmentTypeData = LookupCache::apartmentTypeList();

        return Inertia::render('Report/UnpaidReport', [
            'filters'=> $request->only('search','period','towerId','unitType','billingType'),
            'data' => $data,
            'totalBillingIsUnpaid' => $totalBillingFee,
            'totalCountPending' => $totalCountPending,
            'totalFine' => $totalFine,
            'towerData' => $tower_data,
            'apartmentType' => $apartmentTypeData,
        ]);
    }

    public function showPenalties(Request $request)
    {        
        $user = Auth::user();
        $role = $user->role;
        $apartmentId = $user->apartment_id;
        
        // Handle search & unitType → filter manual with whereIn
        $matchingResidenceIds = null;

        if ($request->has('search') || $request->filled('unitType')) {
            $residenceQuery = UserApartmentOkgo::query();

            if ($request->has('search')) {
                $searchTerm = $request->input('search');
                $residenceQuery->where(function ($q) use ($searchTerm) {
                    $q->whereHas('user', fn ($q2) =>
                        $q2->where('fullname', 'like', "%{$searchTerm}%")
                    )->orWhere('roomNo', 'like', "%{$searchTerm}%");
                });
            }

            if ($request->filled('unitType')) {
                $residenceQuery->where('apartmentType', $request->unitType);
            }

            $matchingResidenceIds = $residenceQuery->pluck('id')->toArray();
        }

        // Build query Billing
        $queryByPenalty = Billing::where('status', 'pending')
            ->where('due_date', '<', today())
            ->when($role !== 'SUPER ADMIN', fn ($query) =>
                $query->where('apartment_id', $apartmentId)
            )
            ->when($matchingResidenceIds, fn ($query) =>
                $query->whereIn('residence_id', $matchingResidenceIds)
            )
            ->when($request->filled('period'), fn ($q) =>
                $q->where('period', $request->input('period')) 
            )
            ->when($request->filled('billingType'), fn ($q) =>
                $q->where('billing_type', $request->input('billingType')) 
            )
            ->when($request->filled('towerId'), fn ($q) =>
                $q->where('tower_id', $request->input('towerId'))
            );

        // Get Billing Data
        $data = (clone $queryByPenalty)
            ->select(
                'id',
                'period',
                'billing_type',
                'billing_fee',
                'fine',
                'total_amount',
                'residence_id',
                'tower_id',
                'apartment_id',
                'paid_date',
                'status',
                'billing_date',
                'due_date',
            )
            ->with([
                'tower:id,tower_name',
                'residence:id,userId,apartmentTowerId,apartmentId,roomNo,apartmentType',
                'residence.user:id,fullname',
            ])
            ->orderByDesc('id')
            ->paginate(10);

        $totalBillingWithPenalties = $data->total();
        $totalBillingFee = (clone $queryByPenalty)->sum('total_amount');
        $totalFine = (clone $queryByPenalty)->sum('fine');

        // Get Mapping apartmentType name
        $apartmentTypeMap = LookupCache::apartmentTypeMap();

        // Inject Mapping billing/residence
        $data->getCollection()->transform(function ($billing) use ($apartmentTypeMap) {
            if ($billing->residence) {
                $apartmentTypeId = $billing->residence->apartmentType;
                $billing->residence->apartmentTypeData = isset($apartmentTypeMap[$apartmentTypeId])
                    ? [
                        'id' => $apartmentTypeId,
                        'name' => $apartmentTypeMap[$apartmentTypeId],
                    ]
                    : null;
            }
            return $billing;
        });

        // Get Master Data Tower and UnitType
        $tower_data = LookupCache::towerList($apartmentId, $role);
        $apartmentTypeData = LookupCache::apartmentTypeList();

        return Inertia::render('Report/PenaltiesReport', [
            'filters'=> $request->only('search','period','towerId','unitType','billingType'),
            'data' => $data,
            'BillingFee' => $totalBillingFee,
            'BillingWithPenalties' => $totalBillingWithPenalties,
            'totalFine' => $totalFine,
            'towerData' => $tower_data,
            'apartmentType' => $apartmentTypeData,
        ]);
    }

    public function ownerReport(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartId = $user->apartment_id;
    
        $userApartmentsQuery = UserApartmentOkgo::select([
            'id', 'userId', 'apartmentId', 'apartmentTowerId' ,
            'roomNo', 'apartmentType', 'active'])
        ->with(['user:id,fullname,email,phone'])
            ->where('active', 1);
    
        if ($role !== 'SUPER ADMIN') {
            $userApartmentsQuery->where('apartmentId', $apartId);
        }

        if ($request->has('search')) {
            $searchTerm = "%" . $request->input('search') . "%";
            $userApartmentsQuery->whereHas('user', function ($query) use ($searchTerm) {
                $query->where('fullname', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm);
            })->orWhere('roomNo', 'like', $searchTerm);
        }
    
        $userApartments = $userApartmentsQuery->orderByDesc('id')->paginate(10);
        
        // Lookup reference data
        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $apartmentTowers = LookupCache::apartmentTowerMap($apartId, $role);
        $apartments = LookupCache::apartmentMap($apartId, $role);

        // Transform response
        $userApartments->getCollection()->transform(function ($item) use ($apartmentTypeMap, $apartmentTowers, $apartments) {
            // Inject apartmentTypeData
            $apartmentTypeId = $item->apartmentType;
            $item->apartmentTypeData = isset($apartmentTypeMap[$apartmentTypeId])
                ? [
                    'id' => $apartmentTypeId,
                    'name' => $apartmentTypeMap[$apartmentTypeId],
                ]
                : null;

            // Tower
            if ($tower = $apartmentTowers[$item->apartmentTowerId] ?? null) {
                $item->apartmentTower = [
                    'id' => $tower->id,
                    'tower_name' => $tower->tower_name,
                ];
            }

            // Apartment
            if ($apartment = $apartments[$item->apartmentId] ?? null) {
                $item->apartment = [
                    'id' => $apartment->id,
                    'name' => $apartment->name,
                ];
            }

            // User Okgo
            if ($item->user) {
                $item->user = [
                    'id' => $item->user->id,
                    'fullname' => $item->user->fullname,
                    'email' => $item->user->email,
                    'phone' => $item->user->phone,
                    'type' => $item->user->type,
                ];
            }

            return $item;
        });
    
        return Inertia::render('Report/OwnerReport', [
            'filters' => $request->only('search'),
            'data' => $userApartments,
        ]);
    }

    public function show(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartemntId = $user->apartment_id;

        // Retrieve the user_id from the request
        $userId = $request->id;

        // Fetch the owner name based on the user_id
        $ownerRecord = UserApartmentOkgo::select('id','userId', 'apartmentId','apartmentTowerId','roomNo','active','apartmentType')
        ->with('user:id,fullname')
            ->find($userId);

        $ownerName = $ownerRecord?->user?->fullname ?? null;
        $ownerApartId = $ownerRecord?->apartmentId;

        $query = Billing::select('id','billing_type','billing_fee',
                                'billing_date','period','paid_date','fine',
                                'total_amount','due_date','status','apartment_id',
                                'residence_id','tower_id'
            )->with([
                'tower:id,tower_name', 
                'residence:id,userId,apartmentId,apartmentTowerId,roomNo,apartmentType,active',                  // Relation to Tower
                'residence.user:id,fullname',          // Relation to Residence & User
        ])->where('residence_id', $userId)
        ->orderBy('billing_date', 'desc');
        
        // Apply status filter if provided
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('billingType')) {
            $query->where('billing_type', $request->billingType);
        }

        if ($request->filled('period')) {
            $period = $request->period;
            $query->where('period', $period);
        }
        
        // Fetch data with pagination
        $data = $query->paginate(10);

        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $tower_data = LookupCache::towerList($ownerApartId, $role);
        $apartmentTypeData = LookupCache::apartmentTypeList();

        // Inject apartmentTypeData to data
        $data->getCollection()->transform(function ($billing) use ($apartmentTypeMap){

            if ($billing->residence) {
                $res = $billing->residence;

                $aptTypeId = $res->apartmentType;
                $res->apartmentTypeData = isset($apartmentTypeMap[$aptTypeId])
                ?   [
                        'id' => $aptTypeId,
                        'name' => $apartmentTypeMap[$aptTypeId],
                    ] 
                : null;
            }
            return $billing;
        });


        if ($role === 'SUPER ADMIN') {
            // Pass the fetched data to the Inertia component
            return Inertia::render('Report/OwnerBillingHistory', [
                "data" => $data,
                'filters' => $request->only('search', 'period', 'status', 'billingType'),
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
