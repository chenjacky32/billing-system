<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApartementController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UnitOwnerController;
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
Route::middleware(['auth', 'verified', 'role:SUPER ADMIN'])->group(function () {
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


Route::middleware('auth')->group(function () {

    // !Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');


    // !Apartement
    Route::get('/apartement/{id}/edit', [ApartementController::class, 'edit'])->name('apartement.edit');
    Route::post('/apartement/{id}/update', [ApartementController::class, 'update'])->name('apartement.update');


    // !Unit Owner
    Route::get('/unit-owner/add', [UnitOwnerController::class, 'add'])->name('unitowner.add');
    Route::get('/unit-owner', [UnitOwnerController::class, 'index'])->name('unitowner.index');
    Route::post('/unit-owner/store', [UnitOwnerController::class, 'store'])->name('unitowner.store');
    Route::get('/unit-owner/{id}/edit', [UnitOwnerController::class, 'edit'])->name('unitowner.edit');
    Route::post('/unit-owner/{id}/update', [UnitOwnerController::class, 'update'])->name('unitowner.update');


    // !Billing
    Route::get('/billing/add', [BillingController::class, 'add'])->name('billing.add');
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing/store', [BillingController::class, 'store'])->name('billing.store');
    Route::get('/billing/{id}/edit', [BillingController::class, 'edit'])->name('billing.edit');
    Route::post('/billing/{id}/update', [BillingController::class, 'update'])->name('billing.update');
    Route::post('/billing/delete', [BillingController::class, 'destroy'])->name('billing.delete');
    Route::post('/billing/count-billing', [BillingController::class, 'countBilling'])->name('billing.count');

    // !Report
    Route::get('/paid-billing-report', [ReportController::class, 'showPaid'])->name('billing.paid.index');
    Route::get('/unpaid-billing-report', [ReportController::class, 'showUnpaid'])->name('billing.unpaid.index');
    Route::get('/billing-with-penalty-report', [ReportController::class, 'showPenalties'])->name('billing.penalties.index');
    Route::get('/owner-report', [ReportController::class, 'ownerReport'])->name('owner.report.index');
    Route::get('/owner-report/{id}/show', [ReportController::class, 'show'])->name('owner.report.show');


    // !Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
