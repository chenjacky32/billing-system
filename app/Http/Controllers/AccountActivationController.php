<?php

namespace App\Http\Controllers;

use App\Models\ApartmentTower;
use App\Models\UserApartmentOkgo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class AccountActivationController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;

        $userApartmentsQuery = UserApartmentOkgo::with(['user']);

        if ($role !== 'SUPER ADMIN') {
            $apartmentTowerIds = ApartmentTower::where('apartment_id', $user->apartment_id)
                ->pluck('id')
                ->toArray();

            $userApartmentsQuery->whereIn('apartmentTowerId', $apartmentTowerIds);
        }

        $userApartments = $userApartmentsQuery
            ->when($request->has('search'), function ($query) use ($request) {
                $searchTerm = $request->input('search');
                $query->whereHas('user', function ($subQuery) use ($searchTerm) {
                    $subQuery->where('fullname', 'like', "%$searchTerm%")
                        ->orWhere('email', 'like', "%$searchTerm%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $status = $request->input('status');
                $query->where('active', $status);
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

        return Inertia::render('PendingAccount/Index', [
            'filters' => $request->only('search', 'active'),
            'data' => $userApartments,
        ]);
    }
    
    public function edit(Request $request)
    {
        $user = Auth::user();
        $userApartment = UserApartmentOkgo::with(['user'])->find($request->id);

        if (!$userApartment) {
            return Redirect::route('pending-account.index')->with('error', 'User apartment not found.');
        }
        $apartmentTower = ApartmentTower::with('apartment')->find($userApartment->apartmentTowerId);
        
        if (!$apartmentTower) {
            return Redirect::route('pending-account.index')->with('error', 'Apartment Tower not found.');
        }

        return Inertia::render('PendingAccount/Edit', [
            'userApartment' => $userApartment,
            'user' => $user,
            'apartmentTower' => $apartmentTower
        ]);
    }

    public function update(Request $request, $id){
        $validatedData = $request->validate([
            'active' => 'required|integer|min:0|max:1',
        ]);

        $userApartment = UserApartmentOkgo::find($id);
        $userApartment->active = $validatedData['active'];
        $userApartment->save();

        return redirect('/account-pending')->with('success', 'Account has been activated successfully.');
    }
}
