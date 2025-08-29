<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\BillingTransaction;
use App\Models\DeleteVaLog;
use App\Models\ApartmentCorpCode;
use App\Services\BRIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Log\Logger;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class VAMonitoringController extends Controller
{
    protected $bri;

    public function __construct(BRIService $bri){
        $this->bri = $bri;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;
        $userApartmentId = $user->apartment_id;

        $apartment = Apartment::find($userApartmentId);

        $search = $request->input('search');

        // Ambil billingTransaction duluan dengan filter virtualAccount
        $billingTransactions = DB::connection('okgo')->table('billingTransaction')
            ->where('isDeleted', 0)
            ->when($search, function ($query) use ($search) {
                $query->where('virtualAccount', 'like', "%$search%");
            })
            ->get()
            ->groupBy('billingId');

        $filteredBillingIds = array_keys($billingTransactions->toArray());

        // Ambil hanya billing yg ada di hasil transaksi
        $billings = DB::table('billings')
            ->select(
                'billings.id',
                'billings.period',
                'billings.total_amount',
                'billings.status',
                'billings.residence_id',
                'billings.created_at',
                'billings.apartment_id',
                'billings.is_paid',
                'apartments.name as apartment_name',
                'billings.paid_date',
                'billings.billing_type'
            )
            ->join('apartments', 'billings.apartment_id', '=', 'apartments.id')
            ->when($role !== 'SUPER ADMIN', function ($query) use ($userApartmentId) {
                $query->where('billings.apartment_id', '=', $userApartmentId);
            })
            ->whereIn('billings.id', $filteredBillingIds)
            ->orderByDesc('billings.id')
            ->get();

        $results = [];
            foreach ($billings as $billing) {
                foreach ($billingTransactions[$billing->id] as $bt) {
                    $results[] = [
                        'id'=> $bt->id,
                        'billingId' => $billing->id,
                        'period' => $billing->period,
                        'total_amount' => $billing->total_amount,
                        'status' => $bt->isUsedForPayment,
                        'is_paid' => $billing->is_paid,
                        'residence_id' => $billing->residence_id,
                        'created_at' => $billing->created_at,
                        'isExpired' => $bt->isExpired,
                        'apartmentName'=> $billing->apartment_name,
                        'billingType' => $billing->billing_type,
                        'paidDate' => $billing->paid_date,
                        'virtualAccount' => $bt->virtualAccount,
                        'responseMessage' => $bt->responseMessage,
                        'transactionDate' => $bt->transactionDate,
                    ];
                }
            }

        $page = $request->input('page', 1);
        $perPage = 10;
        $total = count($results);
        $slicedResults = array_slice($results, ($page - 1) * $perPage, $perPage);

        $currentUrl = $request->url();
        $queryParams = $request->except('page');

        $buildPageUrl = function ($page) use ($currentUrl, $queryParams) {
            return $currentUrl . '?' . http_build_query(array_merge($queryParams,['page' => $page]));
        };

        $prevPage = $page > 1 ? $buildPageUrl($page - 1) : null;
        $nextPage = $page < ceil($total / $perPage) ? $buildPageUrl($page + 1) : null;

        return Inertia::render('VAMonitoring/Index', [
            'apartment' => $apartment,
            'vaData' => $slicedResults,
            'filters' => $request->only('search'),
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'prev_page_url' => $prevPage,
                'next_page_url' => $nextPage,
            ]
        ]);
    }

    public function patchExpiredVA(Request $request, $id)
    {
        try {
            $billingTransaction = BillingTransaction::findOrFail($id);
            $billingTransaction->isExpired = 1;
            $billingTransaction->save();
            return redirect()->back()->with('success', 'VA: ' . $billingTransaction->virtualAccount . ' Telah di Expiredkan!');;
        } catch (\Exception $e){
            dd($e);
            return redirect()->back()->with('error', 'Terjadi Kesalahan!');
        }
    }

    public function deleteExpiredVA(Request $request, $id)
    {
        try {
            $billingTransaction = BillingTransaction::findOrFail($id);

            if (!$billingTransaction) {
                return redirect()->back()->with('error', 'Data VA tidak ditemukan');
            }

            $resMessage = json_decode($billingTransaction->responseMessage);
            $billingId = $billingTransaction->billingId;
            $partnerServiceId = $resMessage->virtualAccountData->partnerServiceId;
            $virtualAccountNo = $billingTransaction->virtualAccount;
            $customerNo = $resMessage->virtualAccountData->customerNo;

            $timestamp = $this->bri->formatTimestamp();
            $getAccessToken = $this->bri->getAccessToken($timestamp);

            if ($getAccessToken) {
                $accesTokenBRI = $getAccessToken['accessToken'];
                Log::info('accesTokenBRI', ['accesTokenBRI' => $accesTokenBRI]);
                $body = [
                    'partnerServiceId' => $partnerServiceId,
                    'customerNo' => $customerNo,
                    'virtualAccountNo' => $virtualAccountNo
                ];

                Log::info('Request Body',[
                    'partnerServiceId' => $partnerServiceId,
                    'customerNo' => $customerNo, 
                    'virtualAccountNo' => $virtualAccountNo
                ]);

                $getSignature = $this->bri->createSignatureTxn('DELETE', '/snap/v1.0/transfer-va/delete-va', $accesTokenBRI, $body, $timestamp);
                
                Log::info('Signature and timestamp', [
                    'signature' => $getSignature,
                    'timestamp' => $timestamp
                ]);

                $responseBRI = Http::withHeaders([
                    'Authorization'=>'Bearer ' . $accesTokenBRI,
                    'X-Timestamp'=> $timestamp,
                    'X-Signature'=> $getSignature,
                    'content-type'=>'application/json',
                    'X-PARTNER-ID'=>'MANSYUR',
                    'CHANNEL-ID'=>'00008',
                    'X-EXTERNAL-ID'=> $this->bri->generateExternalId(),
                ])->delete('https://partner.api.bri.co.id/snap/v1.0/transfer-va/delete-va', $body);

                Log::info('BRI API Response', [
                    'status' => $responseBRI->status(),
                    'body' => $responseBRI->body()
                ]);

                if ($responseBRI->successful()) {
                    try {
                        DB::beginTransaction();
                        $billingTransaction->isExpired = 1;
                        $billingTransaction->isDeleted = 1;
                        $billingTransaction->save();
                        Log::info('billingTransaction', ['billingTransaction' => $billingTransaction]);


                        $logDelete = DeleteVaLog::create([
                            'billingTransactionId' => $id,
                            'billingId' => $billingId,
                            'virtualAccount'=> $virtualAccountNo,
                            'responseMessage' => json_encode($responseBRI->json()),
                            'deletedBy' => Auth::user()->id,
                            'deletedAt' => Carbon::now(),
                        ]);

                        Log::info('DeleteVaLog', ['DeleteVaLog' => $logDelete]);
                        DB::commit();

                        return redirect()->back()->with('success', 'VA: ' . $billingTransaction->virtualAccount . ' Telah di Hapus!');
                    } catch (\Exception $e) {
                        DB::rollBack();
                        Log::error('Error Delete Va Transaction', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
                        return redirect()->back()->with('error', 'Terjadi Kesalahan Sistem: ' . $e->getMessage());
                    }
                } else {
                    Log::error('BRI API Error', [
                        'status' => $responseBRI->status(),
                        'body' => $responseBRI->body()
                    ]);
                    return redirect()->back()->with('error', 'Gagal menghapus VA: ' . json_decode($responseBRI->body())->responseMessage);
                } 
            } else {
                Log::error('No access token returned');
                return redirect()->back()->with('error', 'Gagal mendapatkan token akses BRI');
            }        
        } catch (\Exception $e){
            Log::error('Unexpected error in deleteExpiredVA', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return redirect()->back()->with('error', 'Terjadi Kesalahan Sistem: ' . $e->getMessage());
        }
    }

    public function reportVaReport(Request $request)
    {   
        $user = Auth::user();
        $role = $user->role;    
        $apartId = $user->apartment_id;

        $corpCodeOption = [];

        if ($role !== 'SUPER ADMIN') {
            $corpCode = ApartmentCorpCode::where('apartmentId', $apartId)
                ->where('isActive', true)
                ->get();
        } else {
            $corpCode = ApartmentCorpCode::where('isActive', true)
                ->get();
        }
        
        $corpCodeOption = $corpCode->map(function ($item) {
            return [
                'label' => $item->partnerServiceId . ' - ' . $item->apartment->name,
                'value' => (string) $item->partnerServiceId,
            ];
        });

        return Inertia::render('VAMonitoring/VaReport',[
            'corpCode' => $corpCodeOption,
        ]);
    }

    public function getHistoryVATransaction(Request $request){
    
        $rules = [
            'corp_code' => 'required|string|digits:5',
            'start_date' => 'required|date|date_format:Y-m-d',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'timezone' => 'required|string',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'statusCode' => 422,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        $timestamp = $this->bri->formatTimestamp();
        $getAccessToken = $this->bri->getAccessToken($timestamp);

        if (!$getAccessToken) {
            return response()->json(['statusCode' => 500,'message' => 'Gagal mendapatkan akses token BRI'],500);
        }

        $accesTokenBRI = $getAccessToken['accessToken'];

        $body = [
            'partnerServiceId'=> str_pad(trim($validatedData['corp_code']), 8, " ", STR_PAD_LEFT),
            'startDate' => $validatedData['start_date'],
            'startTime' => $validatedData['start_time'],
            'endTime' => $validatedData['end_time'],
        ];

        $getSignature = $this->bri->createSignatureTxn('POST',
                                                        '/snap/v1.0/transfer-va/report', 
                                                        $accesTokenBRI, 
                                                        $body, 
                                                        $timestamp
                                                    );

        try {
            $responseBRI = Http::withHeaders([
                'Authorization' =>  'Bearer ' . $accesTokenBRI,
                'X-Timestamp'   =>  $timestamp,
                'X-Signature'   =>  $getSignature,
                'Content-Type'  =>  'application/json',
                'X-PARTNER-ID'  =>  'MANSYUR',
                'CHANNEL-ID'    =>  '00008',
                'X-EXTERNAL-ID' =>  $this->bri->generateExternalId(),
            ])->post('https://partner.api.bri.co.id/snap/v1.0/transfer-va/report', $body);
        } catch (\Exception $e){
            return response()->json([
                'statusCode' => 500 ,
                'message' => $e->getMessage()
            ],500);
        }

        if ($responseBRI->successful()) {
            return response()->json([
                'statusCode' => $responseBRI->status(),
                'message' => 'Success',
                'data' => $responseBRI->json(),
            ], $responseBRI->status());
        } else {
            return response()->json([
                'statusCode' => $responseBRI->status(),
                'message' => $responseBRI->json()['responseMessage'],
                'errors' => $responseBRI->json(),
            ], $responseBRI->status());
        }
    }

    public function getReconcileVA()
    {
        $user = Auth::user();
        $role = $user->role;    
        $apartId = $user->apartment_id;

        $corpCodeOption = [];

        if ($role !== 'SUPER ADMIN') {
            $corpCode = ApartmentCorpCode::where('apartmentId', $apartId)
                ->where('isActive', true)
                ->get();
        } else {
            $corpCode = ApartmentCorpCode::where('isActive', true)
                ->get();
        }
        
        $corpCodeOption = $corpCode->map(function ($item) {
            return [
                'label' => $item->partnerServiceId . ' - ' . $item->apartment->name,
                'value' => (string) $item->partnerServiceId,
            ];
        });

        return Inertia::render('VAMonitoring/VaReconcile',[
            'corpCode' => $corpCodeOption,
        ]);
    }

    public function getSignatureVATransaction($body)
    {   
        $secretKey = env('OKGO_IMAGE_SECRET');
        $rawPayload = $secretKey . json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $result = hash('sha256', $rawPayload);

        return $result;
    }

    public function getReconcileVATransaction(Request $request)
    {
        $rules = [
            'corp_code' => 'required|string|digits:5',
            'start_date' => 'required|date|date_format:Y-m-d',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'timezone' => 'required|string',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'statusCode' => 422,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        $body = [
            'partnerServiceId'=> str_pad(trim($validatedData['corp_code']), 8, " ", STR_PAD_LEFT),
            'startDate' => $validatedData['start_date'],
            'startTime' => $validatedData['start_time'],
            'endTime' => $validatedData['end_time'],
        ];

        $getSignature = $this->getSignatureVATransaction($body);

        try {
            $responseReconcile = Http::withHeaders([
                'X-Signature'   => $getSignature,
                'Content-Type'  =>  'application/json',
            ])->post('https://apis.okgo.co.id/apartment/billing/payment/reconcile', $body);
        } catch (\Exception $e){
            return response()->json([
                'statusCode' => 500 ,
                'message' => $e->getMessage()
            ],500);
        }

        if ($responseReconcile->successful()) {
            return response()->json([
                'statusCode' => $responseReconcile->status(),
                'message' => 'Success',
                'data' => $responseReconcile->json(),
            ], $responseReconcile->status());
        } else {
            return response()->json([
                'statusCode' => $responseReconcile->status(),
                'message' => $responseReconcile->json('message'),
            ], $responseReconcile->status());
        }
    }
}
