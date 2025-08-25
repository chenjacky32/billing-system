<?php

use App\Exports\UnitOwnerList;
use App\Http\Controllers\AccountActivationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApartementController;
use App\Http\Controllers\ApartementTower;
use App\Http\Controllers\BillingCategoryController;
use App\Http\Controllers\BillingFineRules;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\BillingFineRulesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UnitOwnerApartmentController;
use App\Http\Controllers\UnitOwnerController;
use App\Http\Controllers\UserApartmentController;
use App\Http\Controllers\VAMonitoringController;
use App\Http\Controllers\VerifyAccessPasswordController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/', function () {
    return redirect(route('login'));
});

Route::fallback(function () {
    return Inertia::render('NotFoundPage');
});

Route::get('/unauthorized', function () {
    return Inertia::render('UnauthorizedPage');
})->name('unauthorized');


// ! SUPER ADMIN ROUTES:
Route::middleware(['auth','verify.session', 'verified', 'role:SUPER ADMIN'])->group(function () {
    // !Apartment
    Route::get('/apartement', [ApartementController::class, "index"])->name('apartement.index');
    Route::get('/apartement/add', function () {
        return Inertia::render('Apartement/AddApartement');
    })->name('apartement.add');
    Route::post('/apartement/store', [ApartementController::class, 'store'])->name('apartement.store');

    // !Admin 
    Route::get('/admin/add', [AdminController::class, 'add'])->name('admin.add');
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
    Route::post('/admin/store', [AdminController::class, 'store'])->name('admin.store');
    Route::get('/admin/{id}/edit', [AdminController::class, 'edit'])->name('admin.edit');
    Route::post('/admin/{id}/update', [AdminController::class, 'update'])->name('admin.update');
    Route::post('/admin-reset-password', [AdminController::class, "resetPassword"])->middleware(['auth', 'verified'])->name('admin.reset');
});


Route::middleware(['auth','verify.session'])->group(function () {

    // !Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // !Apartement
    Route::get('/apartement/{id}/edit', [ApartementController::class, 'edit'])->name('apartement.edit');
    Route::post('/apartement/{id}/update', [ApartementController::class, 'update'])->name('apartement.update');

    // !Apartement Tower
    Route::get('/apartement-tower', [ApartementTower::class, 'index'])->name('apartementTower.index');
    Route::get('/apartement-tower/add',[ApartementTower::class,'add'])->name('apartementTower.add');
    Route::get('/apartement-tower/{id}/edit', [ApartementTower::class, 'edit'])->name('apartementTower.edit');
    Route::post('/apartement-tower/store', [ApartementTower::class, 'store'])->name('apartementTower.store');
    Route::post('/apartement-tower/{id}/update', [ApartementTower::class, 'update'])->name('apartementTower.update');
    Route::post('/apartement-tower/delete', [ApartementTower::class, 'destroy'])->name('apartementTower.delete');

    // !Unit Owner
    Route::get('/unit-owner/add', [UnitOwnerController::class, 'add'])->name('unitowner.add');
    Route::get('/unit-owner', [UnitOwnerController::class, 'index'])->name('unitowner.index');
    Route::post('/unit-owner/store', [UnitOwnerController::class, 'store'])->name('unitowner.store');
    Route::get('/unit-owner/{id}/edit', [UnitOwnerController::class, 'edit'])->name('unitowner.edit');
    Route::post('/unit-owner/{id}/update', [UnitOwnerController::class, 'update'])->name('unitowner.update');

    //!Unit Owner List Apartment
    Route::get('/unit-owner-apartment', [UnitOwnerApartmentController::class, 'index'])->name('unitOwnerApartment.index');
    Route::post('/unit-owner-apartment/{id}/update', [UnitOwnerApartmentController::class, 'update'])->name('unitOwnerApartment.update');

    //!Verify ResourceAccessPassword
    Route::post('/verify-resource-access',[VerifyAccessPasswordController::class,'verifyAccessPassword'])->name('resourceAccess.verify');

    //!Billing Category
    Route::get('/billing-category',[BillingCategoryController::class,'index'])->name('billingCategory.index');
    Route::get('/billing-category/add',[BillingCategoryController::class,'add'])->name('billingCategory.add');
    Route::get('/billing-category/{id}/edit', [BillingCategoryController::class, 'edit'])->name('billingCategory.edit');
    Route::post('/billing-category/store', [BillingCategoryController::class, 'store'])->name('billingCategory.store');
    Route::post('/billing-category/delete', [BillingCategoryController::class, 'destroy'])->name('billingCategory.delete');
    Route::post('/billing-category/{id}/update', [BillingCategoryController::class, 'update'])->name('billingCategory.update');

    //!Billing Fine Rules
    Route::get('/billing-fine-rules', [BillingFineRulesController::class, 'index'])->name('billingFineRules.index');
    Route::get('/billing-fine-rules/add', [BillingFineRulesController::class, 'add'])->name('billingFineRules.add');
    Route::get('/billing-fine-rules/{id}/edit', [BillingFineRulesController::class, 'edit'])->name('billingFineRules.edit');
    Route::post('/billing-fine-rules/store', [BillingFineRulesController::class, 'store'])->name('billingFineRules.store');
    Route::post('/billing-fine-rules/delete', [BillingFineRulesController::class, 'destroy'])->name('billingFineRules.delete');
    Route::post('/billing-fine-rules/{id}/update', [BillingFineRulesController::class, 'update'])->name('billingFineRules.update');

    // !Account Activation
    Route::get('/account-management', [AccountActivationController::class, 'index'])->name('accountActivation.index');
    Route::get('/account-management/{id}/edit', [AccountActivationController::class, 'edit'])->name('accountActivation.edit');
    Route::post('/account-management/{id}/update', [AccountActivationController::class, 'update'])->name('accountActivation.update');
    Route::post('/account-management/delete', [AccountActivationController::class, 'destroy'])->name('accountActivation.delete');

    // !Billing
    Route::get('/billing/add', [BillingController::class, 'add'])->name('billing.add');
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing/store', [BillingController::class, 'store'])->name('billing.store');
    Route::get('/billing/{id}/edit', [BillingController::class, 'edit'])->name('billing.edit');
    Route::post('/billing/{id}/update', [BillingController::class, 'update'])->name('billing.update');
    Route::post('/billing/delete', [BillingController::class, 'destroy'])->name('billing.delete');
    Route::post('/billing/count-billing', [BillingController::class, 'countBilling'])->name('billing.count');
    Route::post('/billing/previous-meter',[BillingController::class,'getStartMeter'])->name('billing.previousMeter');

    // !Virtual Account 
    Route::get('/va-monitoring', [VAMonitoringController::class, 'index'])->name('VAMonitoring.index');
    Route::patch('/va-monitoring/{id}/update', [VAMonitoringController::class, 'patchExpiredVA'])->name('VAMonitoring.update');
    Route::post('/va-monitoring/{id}/delete',[VAMonitoringController::class, 'deleteExpiredVA'])->name('VAMonitoring.delete');
    Route::get('/va-monitoring/report', [VAMonitoringController::class, 'reportVaReport'])->name('VAMonitoring.report');
    Route::post('/va-monitoring/history', [VAMonitoringController::class, 'getHistoryVATransaction'])->name('VAMonitoring.historyTransaction');

    // !Export Data
    Route::get('/billing/export', [BillingController::class, 'export'])->name('billing.export');
    Route::get('/account-management/export', [AccountActivationController::class, 'export'])->name('accountManagement.export');
    Route::get('/unit-owner-apartment/export', [UnitOwnerApartmentController::class, 'export'])->name('unitOwnerApartment.export');

    // !Report
    Route::get('/paid-billing-report', [ReportController::class, 'showPaid'])->name('billing.paid.index');
    Route::get('/unpaid-billing-report', [ReportController::class, 'showUnpaid'])->name('billing.unpaid.index');
    Route::get('/overdue-billing-report', [ReportController::class, 'showPenalties'])->name('billing.penalties.index');
    Route::get('/owner-report', [ReportController::class, 'ownerReport'])->name('owner.report.index');
    Route::get('/owner-report/{id}/show', [ReportController::class, 'show'])->name('owner.report.show');

    // !Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
