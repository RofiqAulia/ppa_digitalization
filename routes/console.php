<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Services\IqfGoogleSheetsSyncService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
Artisan::command('iqf:sync-google-sheets {--initial : Sync dari awal dan reset last synced ID} {--dry-run : Ambil dan transform data tanpa menulis ke Google Sheets}', function (IqfGoogleSheetsSyncService $service) {
    $result = $service->sync(
        initial: (bool) $this->option('initial'),
        dryRun: (bool) $this->option('dry-run'),
    );

    $this->info('IQF Google Sheets sync selesai.');
    $this->table(
        ['Key', 'Value'],
        collect($result)->map(fn ($value, $key) => [$key, is_bool($value) ? ($value ? 'true' : 'false') : $value])->all()
    );
})->purpose('Sync data IQF dari MySQL ke Google Sheets RAW_DATA');

use Illuminate\Support\Facades\Schedule;

Schedule::command('sync:google-sheets')->everyMinute();
