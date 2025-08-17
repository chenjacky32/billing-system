<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\ApartmentTower;
use App\Models\UserApartmentOkgo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Helpers\LookupCache;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\UnitOwnerList as ExportsUnitOwnerList;

class UnitOwnerApartmentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartId = $user->apartment_id;
        
        $apar = Apartment::find($apartId);

        if ($apar) {
            $apartName = $apar->name; 
        } else {
            $apartName = 'Apartment not found';
        }

        $query = UserApartmentOkgo::select(
                'id','userId','apartmentTowerId','apartmentId',
                'roomNo','active','apartmentType',
                'ownership'
            )->with(['user:id,fullname,email,phone'])
            ->where('active', 1);

        if ($role !== 'SUPER ADMIN') {
            $query->where('apartmentId', $apartId);
        }

        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->whereHas('user', fn ($q) => $q->where('fullname', 'like', "%$searchTerm%")
                                                    ->orWhere('email', 'like', "%$searchTerm%"));
            });
        }

        $userApartments = $query->orderByDesc('id')->paginate(10);
        
        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $apartmentList = LookupCache::apartmentMap($apartId, $role);
        $apartmentTowerList = LookupCache::towerList($apartId, $role);
        $apartmentTowerMap = LookupCache::apartmentTowerMap($apartId, $role);
        $apartmentMap = LookupCache::apartmentMap($apartId, $role);

        $userApartments->getCollection()->transform(function ($item) use ($apartmentTypeMap, $apartmentTowerMap, $apartmentMap) {
            $item->apartType = [
                'id' => $item->apartmentType,
                'name' => $apartmentTypeMap[$item->apartmentType] ?? 'Unknown'
            ];

            $tower = $apartmentTowerMap[$item->apartmentTowerId] ?? null;
            $apart = $apartmentMap[$item->apartmentId] ?? null;

            $item->apartmentTower = $tower ? [
                'id' => $tower->id,
                'tower_name' => $tower->tower_name,
                'apartment' => $apart ? [
                    'id' => $apart->id,
                    'name' => $apart->name
                    ] : null,
                ] : null;

            return $item;
        });

        $apartment = collect($apartmentList)->map(fn($apart) => [
            'label' => $apart->name,
            'value' => $apart->id
        ])
            ->prepend(['label' => 'Pilih Apartemen', 'value' => ''])
            ->values()
            ->toArray();
        
        $apartmentTower = collect($apartmentTowerList)
            ->prepend(['label' => 'Pilih Tower', 'value' => ''])
            ->values()
            ->toArray();

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
            'roomNo'=> 'required|string|max:20',
        ]);

        $userApartment = UserApartmentOkgo::find($id);

        if (!$userApartment) {
            return Redirect()->back()->with('error', 'User apartment not found.');
        }

        $userApartment->update([
            'apartmentTowerId' => $validatedData['apartmentTowerId'],
            'apartmentId' => $validatedData['apartmentId'],
            'roomNo' => $validatedData['roomNo'],
        ]);

        return redirect('/unit-owner-apartment')->with('success', 'Unit owner data has been updated!');
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $apartId = $user->apartment_id;

        $apartmentTypeMap = LookupCache::apartmentTypeMap();
        $apartmentTowerMap = LookupCache::apartmentTowerMap($apartId, $role);
        $apartmentMap = LookupCache::apartmentMap($apartId, $role);

        $query = UserApartmentOkgo::select(
                'id','userId','apartmentTowerId','apartmentId',
                'roomNo','active','apartmentType',
                'ownership'
            )->with(['user:id,fullname,email,phone'])
            ->where('active', 1)
            ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartmentId', $user->apartment_id);
            });

        $query->when($request->has('search'), function ($query) use ($request) {
            $searchTerm = $request->input('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->whereHas('user', fn ($q) => $q->where('fullname', 'like', "%$searchTerm%")
                                                    ->orWhere('email', 'like', "%$searchTerm%"));
            });
        });

        $data = $query->orderByDesc('id')->get();

        $data->transform(function ($item) use ($apartmentTypeMap, $apartmentTowerMap, $apartmentMap) {
            $item->apartType = (object) [
                'id' => $item->apartmentType,
                'name' => $apartmentTypeMap[$item->apartmentType] ?? 'Unknown'
            ];

            // Inject apartmentTower (include apartment if already eager loaded)
            $item->apartmentTower = $apartmentTowerMap[$item->apartmentTowerId] ?? null;

            // Inject apartment
            $item->apartment = $apartmentMap[$item->apartmentId] ?? null;

            return $item;
        });
        
        libxml_use_internal_errors(true);
        return Excel::download(new ExportsUnitOwnerList(data: $data), 'Daftar-Penghuni-Aktif.xlsx');
    }
}
