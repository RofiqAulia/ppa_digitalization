<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==========================================
// OPERATOR ROUTES (Public)
// ==========================================
Route::get('/operator/login', [\App\Http\Controllers\IqfLogsheetController::class, 'operatorLogin'])->name('operator.login');
Route::post('/operator/login', [\App\Http\Controllers\IqfLogsheetController::class, 'operatorAuthenticate'])->name('operator.authenticate');
Route::post('/operator/logout', [\App\Http\Controllers\IqfLogsheetController::class, 'operatorLogout'])->name('operator.logout');

Route::middleware(\App\Http\Middleware\OperatorAuth::class)->group(function () {
    Route::get('/', function () {
        return Inertia::render('Operator/Landing');
    })->name('operator.landing');

    Route::get('/kendala', function () {
        return Inertia::render('Operator/Kendala');
    })->name('operator.kendala');

    // Kiosk API Routes
    Route::get('/iqf-kiosk', [\App\Http\Controllers\IqfLogsheetController::class, 'kiosk'])->name('iqf-logsheet.kiosk');
    Route::post('/iqf-kiosk/store', [\App\Http\Controllers\IqfLogsheetController::class, 'storeKiosk'])->name('iqf-logsheet.storeKiosk');
    Route::post('/iqf-kiosk/unplanned-stop', [\App\Http\Controllers\IqfLogsheetController::class, 'storeUnplannedStop'])->name('iqf-logsheet.storeUnplannedStop');
    Route::get('/iqf-kiosk/stats', [\App\Http\Controllers\IqfLogsheetController::class, 'dashboardStats'])->name('iqf-logsheet.stats');

    // Refrezing API Routes
    Route::get('/refrezing-kiosk', [\App\Http\Controllers\RefrezingController::class, 'kiosk'])->name('refrezing.kiosk');
    Route::post('/refrezing-kiosk/store', [\App\Http\Controllers\RefrezingController::class, 'storeKiosk'])->name('refrezing.storeKiosk');
    Route::post('/refrezing-kiosk/unplanned-stop', [\App\Http\Controllers\RefrezingController::class, 'storeUnplannedStop'])->name('refrezing.storeUnplannedStop');

    // Operator logsheet (today only, no admin layout)
    Route::get('/logsheet-operator', [\App\Http\Controllers\IqfLogsheetController::class, 'operatorLogsheet'])->name('operator.logsheet');
    Route::get('/logsheet-refrezing', [\App\Http\Controllers\RefrezingController::class, 'operatorLogsheet'])->name('refrezing.logsheet');

    // Operator edit/delete detail baris (untuk koreksi jumlah & waktu)
    Route::put('/operator/logsheet-detail/{id}', [\App\Http\Controllers\IqfLogsheetController::class, 'operatorUpdateDetail'])->name('operator.detail.update');
    Route::delete('/operator/logsheet-detail/{id}', [\App\Http\Controllers\IqfLogsheetController::class, 'operatorDestroyDetail'])->name('operator.detail.destroy');

    // Refrezing Operator edit/delete detail
    Route::put('/operator/refrezing-logsheet-detail/{id}', [\App\Http\Controllers\RefrezingController::class, 'operatorUpdateDetail'])->name('refrezing.operator.detail.update');
    Route::delete('/operator/refrezing-logsheet-detail/{id}', [\App\Http\Controllers\RefrezingController::class, 'operatorDestroyDetail'])->name('refrezing.operator.detail.destroy');
});

// Operator can see logsheet today (admin view - kept for compatibility)

Route::get('/logsheet-iqf', [\App\Http\Controllers\IqfLogsheetController::class, 'index'])->name('logsheet-iqf.index');


// ==========================================
// ADMIN ROUTES (Protected by Auth)
// ==========================================
Route::middleware('auth')->group(function () {
    
    // IQF Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('IqfLogsheet/Dashboard');
    })->name('dashboard');

    // Dashboard stats API (admin-accessible version of /iqf-kiosk/stats)
    Route::get('/dashboard/stats', [\App\Http\Controllers\IqfLogsheetController::class, 'dashboardStats'])->name('dashboard.stats');

    // Refrezing Dashboard
    Route::get('/refrezing/dashboard', function () {
        return Inertia::render('RefrezingLogsheet/Dashboard');
    })->name('refrezing.dashboard');

    // Refrezing Dashboard stats API
    Route::get('/refrezing/dashboard/stats', [\App\Http\Controllers\RefrezingController::class, 'dashboardStats'])->name('refrezing.dashboard.stats');
    
    // Refrezing History
    Route::get('/refrezing/history', [\App\Http\Controllers\RefrezingController::class, 'adminHistory'])->name('refrezing-logsheet.history');

    // Refrezing Edit/Delete Details (Admin)
    Route::put('/refrezing-logsheet-detail/{id}', [\App\Http\Controllers\RefrezingController::class, 'updateDetail'])->name('refrezing-logsheet.updateDetail');
    Route::delete('/refrezing-logsheet-detail/{id}', [\App\Http\Controllers\RefrezingController::class, 'destroyDetail'])->name('refrezing-logsheet.destroyDetail');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Prepare Produksi
    Route::resource('prepare-produksi', \App\Http\Controllers\PrepareProductionController::class)->except(['destroy']);
    Route::post('/prepare-produksi/{prepareProduksi}/update', [\App\Http\Controllers\PrepareProductionController::class, 'update'])->name('prepare-produksi.update');
    Route::delete('/prepare-produksi/{prepareProduksi}', [\App\Http\Controllers\PrepareProductionController::class, 'destroy'])->name('prepare-produksi.destroy');
    
    Route::get('/iqf-logsheet/history', [\App\Http\Controllers\IqfLogsheetController::class, 'history'])->name('iqf-logsheet.history');

    Route::resource('iqf-logsheet', \App\Http\Controllers\IqfLogsheetController::class)->except(['index']); // index is public at /logsheet-iqf
    
    Route::post('/iqf-logsheet/{iqfLogsheet}/detail', [\App\Http\Controllers\IqfLogsheetController::class, 'storeDetail'])->name('iqf-logsheet.storeDetail');
    Route::put('/iqf-logsheet-detail/{id}', [\App\Http\Controllers\IqfLogsheetController::class, 'updateDetail'])->name('iqf-logsheet.updateDetail');
    Route::delete('/iqf-logsheet-detail/{id}', [\App\Http\Controllers\IqfLogsheetController::class, 'destroyDetail'])->name('iqf-logsheet.destroyDetail');
    Route::put('/iqf-logsheet/{logsheet}/row', [\App\Http\Controllers\IqfLogsheetController::class, 'updateRow'])->name('iqf-logsheet.updateRow');

    // Export Excel Route
    Route::get('/iqf-logsheet/export-excel', [\App\Http\Controllers\IqfExportController::class, 'download'])->name('iqf-logsheet.export');

    // Admin User Management
    Route::get('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'index'])->name('admin.users.index');
    Route::post('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{user}', [\App\Http\Controllers\AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [\App\Http\Controllers\AdminUserController::class, 'destroy'])->name('admin.users.destroy');
});

// Refrezing Admin Routes (Public Index)
Route::get('/refrezing/logsheet', [\App\Http\Controllers\RefrezingController::class, 'adminIndex'])->name('refrezing-logsheet.index');

require __DIR__.'/auth.php';
