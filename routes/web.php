<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('prepare-produksi.index');
});

Route::resource('prepare-produksi', \App\Http\Controllers\PrepareProductionController::class)->except(['destroy']);

Route::post('/prepare-produksi/{prepareProduksi}/update', [\App\Http\Controllers\PrepareProductionController::class, 'update'])->name('prepare-produksi.update');

// IQF Logsheet Routes
Route::get('/iqf-logsheet/history', [App\Http\Controllers\IqfLogsheetController::class, 'history'])->name('iqf-logsheet.history');
Route::resource('iqf-logsheet', App\Http\Controllers\IqfLogsheetController::class);
Route::post('/iqf-logsheet/{iqfLogsheet}/detail', [App\Http\Controllers\IqfLogsheetController::class, 'storeDetail'])->name('iqf-logsheet.storeDetail');
Route::put('/iqf-logsheet-detail/{id}', [App\Http\Controllers\IqfLogsheetController::class, 'updateDetail'])->name('iqf-logsheet.updateDetail');
Route::delete('/iqf-logsheet-detail/{id}', [App\Http\Controllers\IqfLogsheetController::class, 'destroyDetail'])->name('iqf-logsheet.destroyDetail');

// Kiosk Routes
Route::get('/iqf-kiosk', [App\Http\Controllers\IqfLogsheetController::class, 'kiosk'])->name('iqf-logsheet.kiosk');
Route::post('/iqf-kiosk/store', [App\Http\Controllers\IqfLogsheetController::class, 'storeKiosk'])->name('iqf-logsheet.storeKiosk');
Route::post('/iqf-kiosk/unplanned-stop', [App\Http\Controllers\IqfLogsheetController::class, 'storeUnplannedStop'])->name('iqf-logsheet.storeUnplannedStop');
