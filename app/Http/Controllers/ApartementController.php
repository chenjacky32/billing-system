<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ApartementController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Apartement/Apartement', [
            'filters' => $request->only('search'),
            'data' => Apartment::with('user') // Eager load the user relationship
                ->when($request->has('search'), function ($query) use ($request) {
                    $query->where('name', 'like', "%" . $request->input('search') . "%");
                })
                ->orderByDesc('id')
                ->paginate(10),
        ]);
    }

    public function store(Request $request)
    {
        // Validate the incoming data
        $validatedData = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'address' => [
                'required',
                'string',
                'max:100',
            ],
            'total_room' => ['required', 'integer', 'min:10', 'max:99999'],
        ]);

        // Add user_id to the validated data from the authenticated user
        $validatedData['created_by'] = Auth::id();

        // Store the validated data in the apartments table
        $apartment = Apartment::create($validatedData);

        return redirect('/apartement')->with('success', 'Apartement data has been created!');
    }

    public function edit(Apartment $apartment, Request $request)
    {
        $user = Auth::user();
        $apartmentId = $request->id;
        $userApartmentId = $user->apartment_id;
        $role = $user->role;

        if ($role === 'SUPER ADMIN') {
            return Inertia::render('Apartement/EditApartement', [
                "apartementData" => $apartment->find($request->id),
            ]);
        } else {
            if ($apartmentId == $userApartmentId) {
                return Inertia::render('Apartement/EditApartement', [
                    "apartementData" => $apartment->find($request->id),
                ]);
            } else {
                return redirect('/unauthorized');
            }
        }
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $role = $user->role;
        $apartment = Apartment::findOrFail($id);

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:100'],
            'total_room' => ['required', 'integer', 'min:10', 'max:99999'],
            // 'logo_company' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // handle image upload
        // if($request->hasFile('logo_company')) { 
        //     if($apartment->logo_company){
        //         Storage::delete('public/'.$apartment->logo_company);
        //     }

            // $fileName = time().'.'.$request->file('logo_company')->extension();  
            // $request->file->move(storage_path('public/apartments'), $fileName);
        //     $imagePath = $request->file('logo_company')->store('apartments' , 'public');
        //     $validatedData['logo_company'] = $imagePath;
        // }
        
        // $apartment->update($request->except(['logo_company']) + [
        //     'logo_company' => $apartment->logo_company,
        // ]);

        $apartment->update($validatedData);

        if ($role === 'SUPER ADMIN') {
            return redirect('/apartement')->with('success', 'Apartment data has been updated!');
        } else {
            return redirect()->back()->with('success', 'Apartment data has been updated!');
        }
    }
}
