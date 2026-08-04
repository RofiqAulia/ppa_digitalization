<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/logsheet-iqf');
});

Route::resource('prepare-produksi', \App\Http\Controllers\PrepareProductionController::class)->except(['destroy']);

Route::post('/prepare-produksi/{prepareProduksi}/update', [\App\Http\Controllers\PrepareProductionController::class, 'update'])->name('prepare-produksi.update');
Route::delete('/prepare-produksi/{prepareProduksi}', [\App\Http\Controllers\PrepareProductionController::class, 'destroy'])->name('prepare-produksi.destroy');

// IQF Logsheet Routes
Route::get('/logsheet-iqf', [App\Http\Controllers\IqfLogsheetController::class, 'index'])->name('logsheet-iqf.index');
Route::get('/iqf-logsheet/history', [App\Http\Controllers\IqfLogsheetController::class, 'history'])->name('iqf-logsheet.history');
Route::resource('iqf-logsheet', App\Http\Controllers\IqfLogsheetController::class);
Route::post('/iqf-logsheet/{iqfLogsheet}/detail', [App\Http\Controllers\IqfLogsheetController::class, 'storeDetail'])->name('iqf-logsheet.storeDetail');
Route::put('/iqf-logsheet-detail/{id}', [App\Http\Controllers\IqfLogsheetController::class, 'updateDetail'])->name('iqf-logsheet.updateDetail');
Route::delete('/iqf-logsheet-detail/{id}', [App\Http\Controllers\IqfLogsheetController::class, 'destroyDetail'])->name('iqf-logsheet.destroyDetail');

// Export Excel Route
Route::get('/iqf-logsheet/export-excel', [App\Http\Controllers\IqfExportController::class, 'download'])->name('iqf-logsheet.export');

// Kiosk Routes
Route::get('/iqf-kiosk', [App\Http\Controllers\IqfLogsheetController::class, 'kiosk'])->name('iqf-logsheet.kiosk');
Route::post('/iqf-kiosk/store', [App\Http\Controllers\IqfLogsheetController::class, 'storeKiosk'])->name('iqf-logsheet.storeKiosk');
Route::post('/iqf-kiosk/unplanned-stop', [App\Http\Controllers\IqfLogsheetController::class, 'storeUnplannedStop'])->name('iqf-logsheet.storeUnplannedStop');


