<?php

namespace App\Http\Controllers;

use App\Models\ResourceAccessPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class VerifyAccessPasswordController extends Controller
{
    public function verifyAccessPassword(Request $request)
    {
        $validatedData = $request->validate([
            'password'=> 'required|string|min:8',
            'apartmentId'=> 'required|exists:apartments,id',
        ]);

        $resourceAccessPassword = ResourceAccessPassword::where('apartment_id', $validatedData['apartmentId'])->first();
    
        if (!$resourceAccessPassword) {
            return response()->json([
                'success' => false,
                'message' => 'Resource Access Password not found.',
                'errors' => ['password' => 'Resource Access Password not found.'],
            ], 404);
        }

        $isPasswordCorrect = Hash::check($validatedData['password'], $resourceAccessPassword->password);
        Log::info($request->all());
        Log::info('isPasswordCorrect',['isPasswordCorrect'=> $isPasswordCorrect]);

        if ($isPasswordCorrect) {
            return response()->json([
                'success' => true,
                'message' => 'Access Granted',
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password, please try again.',
                'errors' => ['password' => 'Incorrect password, please try again.'],
            ], 401);
        }
    }
}
