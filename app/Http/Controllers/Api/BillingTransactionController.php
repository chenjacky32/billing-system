<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApartmentOwner;
use App\Models\Billing;
use App\Models\BillingsCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BillingTransactionController extends Controller
{
    //
    public function fetchBillingByPeriod(Request $request){
        $phone = $request->input('phone');
        $period = $request->input('period');
        
        if (!$phone || !$period) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Phone and period are required.'
            ], 400);
        }

        if (!preg_match('/^\d{2}-\d{4}$/', $period)) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Invalid period format. Use MM-YYYY.'
            ], 400);
        }

        $date = Carbon::createFromFormat('m-Y', $period);
        $year = $date->year;
        $month = $date->month;

        $getOwnerByPhone = ApartmentOwner::where('phone', $phone)->first();

        if(!$getOwnerByPhone){
            return response()->json([
                'status' => 'fail',
                'message' => 'Owner not found.'
            ], 404);
        }

        $billingsByPeriod = Billing::where('owner_id', $getOwnerByPhone->id)
        ->whereYear('billing_date', $year)
        ->whereMonth('billing_date', $month)
        ->get();

        if (!$billingsByPeriod) {
            return response()->json([
                'status' => 'fail',
                'message' => 'No billing records found for this period.',
                'data' => []
            ], 404);
        }

        return response()->json([
            'status'=>'success',
            'message'=>'Billings by periods retreived',
            'data'=>[
                'id'=>$getOwnerByPhone->id,
                'owner_name'=> $getOwnerByPhone->owner_name,
                'email'=>$getOwnerByPhone->email,
                'identity_no'=>$getOwnerByPhone->identity_no,
                'apartment'=>[
                    'id'=>$getOwnerByPhone->apartment()->first()->id,
                    'name'=>$getOwnerByPhone->apartment()->first()->name
                ],
                'room_no'=>$getOwnerByPhone->room_no,
                'phone'=> $getOwnerByPhone->phone,
                'period'=>$period,
                'billings'=> $billingsByPeriod->map(function ($billing){
                    return [
                        'id'=>$billing->id,
                        'billing_type'=>$billing->billing_type,
                        'billing_fee'=>$billing->billing_fee,
                        'status'=>$billing->status,
                        'is_paid'=>$billing->is_paid,
                        'paid_date'=>$billing->paid_date,
                        'fine'=>$billing->fine,
                    ];
                })
                ]
            ]        
        );
    }

    public function fetchBillingById(Request $request){
        $Id = $request->input('id');
        if (!$Id) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Id is required.'
            ], 400);
        }

        $billing = Billing::find($Id);
        $ownerData = $billing->owner()->first();

        if (!$billing) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Billing record not found.'
            ], 404);
        }

        return response()->json([
            'status'=>'success',
            'message'=>'Billings by id retreived',
            'data'=>[
                "id"=>$billing->id,
                "billing_type"=>$billing->billing_type,
                "billing_date"=>$billing->billing_date,
                "meter_reading"=>$billing->meter_reading,
                "billing_fee"=>$billing->billing_fee,
                "is_paid"=>$billing->is_paid,
                "fine"=>$billing->fine,
                "due_date"=>$billing->due_date,
                "status"=>$billing->status,
                "billing_category"=>$billing->billing_category_id,
                "owner"=>[
                    "id"=>$ownerData->id,
                    "owner_name" => $ownerData->owner_name,
                    ]
                ]
        ]);
    }

    public function fetchAllBilling(Request $request){
        $billings = Billing::all();

        return response()->json([
            'status'=>'success',
            'message'=>'All Billings retreived',
            'data'=>$billings->map(function ($billing){
                return [
                    "id"=>$billing->id,
                    "billing_type"=>$billing->billing_type,
                    "billing_date"=>$billing->billing_date,
                    "meter_reading"=>$billing->meter_reading,
                    "billing_fee"=>$billing->billing_fee,
                    "is_paid"=>$billing->is_paid,
                    "fine"=>$billing->fine,
                    "due_date"=>$billing->due_date,
                    "status"=>$billing->status,
                    "billing_category"=>$billing->billing_category_id,
                    "owner"=>[
                     "id"=>$billing->owner()->first()->id,
                     "name" => $billing->owner()->first()->owner_name,
                    ],
                    "apartment"=>[
                        "id"=>$billing->apartment()->first()->id,
                        "name" => $billing->apartment()->first()->name,
                    ],
                ];
            })
        ], 200);
    }

    public function editBilling(Request $request, $id){
        $request->validate([
            'billing_type' => 'sometimes|string',
            'billing_category_id' => 'sometimes|integer|exists:billing_categories,id',
            'billing_fee' => 'sometimes|numeric',
            'start_meter' => 'sometimes|numeric',
            'end_meter' => 'sometimes|numeric',
            'unit_price' => 'sometimes|numeric',
            'minimum_charge' => 'sometimes|numeric',
            'billing_date' => 'sometimes|date',
            'owner_id' => 'sometimes|integer|exists:apartment_owners,id',
            'meter_reading' => 'sometimes|numeric',
            'is_paid' => 'sometimes|boolean',
            'paid_date' => 'nullable|date',
            'status' => 'sometimes|string',
            'fine' => 'sometimes|numeric',
            'due_date' => 'sometimes|date',
            'apartment_id' => 'sometimes|integer|exists:apartments,id',
        ]);

        if(!$id){
            return response()->json([
                'status' => 'fail',
                'message' => 'Id is required.'
            ]);
        }

        $billing = Billing::find($id);

        if (!$billing) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Billing not found'
            ], 404);
        }

        $billing->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Billing updated successfully',
            'data' => $billing->fresh()
        ], 200);
    }
}
