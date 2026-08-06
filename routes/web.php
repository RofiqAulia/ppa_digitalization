<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==========================================
// OPERATOR ROUTES (Public)
// ==========================================
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

// Operator logsheet (today only, no admin layout)
Route::get('/logsheet-operator', [\App\Http\Controllers\IqfLogsheetController::class, 'operatorLogsheet'])->name('operator.logsheet');

// Operator can see logsheet today (admin view - kept for compatibility)
Route::get('/logsheet-iqf', [\App\Http\Controllers\IqfLogsheetController::class, 'index'])->name('logsheet-iqf.index');


// ==========================================
// ADMIN ROUTES (Protected by Auth)
// ==========================================
Route::middleware('auth')->group(function () {
    
    // Redirect /dashboard to IQF Dashboard
    Route::get('/dashboard', function () {
        return redirect()->route('iqf-logsheet.dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Prepare Produksi
    Route::resource('prepare-produksi', \App\Http\Controllers\PrepareProductionController::class)->except(['destroy']);
    Route::post('/prepare-produksi/{prepareProduksi}/update', [\App\Http\Controllers\PrepareProductionController::class, 'update'])->name('prepare-produksi.update');
    Route::delete('/prepare-produksi/{prepareProduksi}', [\App\Http\Controllers\PrepareProductionController::class, 'destroy'])->name('prepare-produksi.destroy');

    // IQF Logsheet (Admin Only)
    Route::get('/iqf-logsheet/dashboard', function () {
        return Inertia::render('IqfLogsheet/Dashboard');
    })->name('iqf-logsheet.dashboard');
    
    Route::get('/iqf-logsheet/history', [\App\Http\Controllers\IqfLogsheetController::class, 'history'])->name('iqf-logsheet.history');

    Route::resource('iqf-logsheet', \App\Http\Controllers\IqfLogsheetController::class)->except(['index']); // index is public at /logsheet-iqf
    
    Route::post('/iqf-logsheet/{iqfLogsheet}/detail', [\App\Http\Controllers\IqfLogsheetController::class, 'storeDetail'])->name('iqf-logsheet.storeDetail');
    Route::put('/iqf-logsheet-detail/{id}', [\App\Http\Controllers\IqfLogsheetController::class, 'updateDetail'])->name('iqf-logsheet.updateDetail');
    Route::delete('/iqf-logsheet-detail/{id}', [\App\Http\Controllers\IqfLogsheetController::class, 'destroyDetail'])->name('iqf-logsheet.destroyDetail');

    // Export Excel Route
    Route::get('/iqf-logsheet/export-excel', [\App\Http\Controllers\IqfExportController::class, 'download'])->name('iqf-logsheet.export');

    // Admin User Management
    Route::get('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'index'])->name('admin.users.index');
    Route::post('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'store'])->name('admin.users.store');
    Route::delete('/admin/users/{user}', [\App\Http\Controllers\AdminUserController::class, 'destroy'])->name('admin.users.destroy');
});

require __DIR__.'/auth.php';
