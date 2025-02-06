<?php

use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\BillingTransactionController;
use App\Http\Controllers\Api\UnitOwnerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/unit-owner', [UnitOwnerController::class, 'checkOwner']);
Route::get('/billing', [BillingController::class, 'getBilling']);
Route::get('/billing-history', [BillingController::class, 'billingHistory']);
Route::get('/', function () {
    return response()->json(['message' => 'Welcome to the API'], 200);
});


Route::middleware(['api','api.secret'])->group(function () {
    Route::post('/billings/by-periods',[BillingTransactionController::class, 'fetchBillingByPeriod']);
    Route::post('/billings/by-id',[BillingTransactionController::class, 'fetchBillingById']);
    Route::get('/billings',[BillingTransactionController::class, 'fetchAllBilling']);
    Route::put('/billings/{id}',[BillingTransactionController::class, 'editBilling']);
});