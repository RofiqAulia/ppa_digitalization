<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;

#[Signature('sync:google-sheets {--reset : Hapus seluruh RAW_DATA dan sync ulang dari awal}')]
#[Description('Sync IQF production data to Google Sheets incrementally')]
class SyncIqfToGoogleSheets extends Command
{
    // Nama sheet RAW_DATA di Google Sheets
    const RAW_DATA_SHEET = 'RAW_DATA';

    // Header kolom RAW_DATA
    const HEADERS = ['TGL', 'SHIFT', 'JENIS', 'NO_IQF', 'WAKTU', 'JAM', 'JUMLAH'];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting sync to Google Sheets...');

        // 1. Validasi Kredensial Google
        $credentialsPath = config('services.google.sheets_credentials_path');
        $spreadsheetId   = config('services.google.spreadsheet_id');

        if (!$credentialsPath || !$spreadsheetId) {
            $this->error('Google Sheets credentials or spreadsheet ID not configured.');
            return 1;
        }

        $fullPath = base_path($credentialsPath);
        if (!file_exists($fullPath)) {
            $this->error("Google Sheets credentials file not found at: {$fullPath}");
            return 1;
        }

        // 2. Inisialisasi Google Sheets Client
        try {
            $client = new Client();
            $client->setApplicationName('PPA Digitalization');
            $client->setScopes([Sheets::SPREADSHEETS]);
            $client->setAuthConfig($fullPath);
            $client->setAccessType('offline');

            $service = new Sheets($client);
        } catch (\Exception $e) {
            $this->error("Failed to initialize Google Sheets client: " . $e->getMessage());
            Log::error("SyncIqfToGoogleSheets - Client Error: " . $e->getMessage());
            return 1;
        }

        // 3. Jika --reset: hapus semua data di RAW_DATA dan reset last_synced_id
        if ($this->option('reset')) {
            $this->warn('Reset mode: Clearing all data from RAW_DATA sheet...');
            try {
                $clearRange = self::RAW_DATA_SHEET . '!A:G';
                $service->spreadsheets_values->clear($spreadsheetId, $clearRange, new \Google\Service\Sheets\ClearValuesRequest());
                DB::table('sync_states')->where('entity', 'iqf_logsheets')->update(['last_synced_id' => 0]);
                $this->info('RAW_DATA cleared and sync state reset to 0.');
            } catch (\Exception $e) {
                $this->error("Failed to clear RAW_DATA: " . $e->getMessage());
                return 1;
            }
        }

        // 4. Cek Last Synced ID
        $syncState    = DB::table('sync_states')->where('entity', 'iqf_logsheets')->first();
        $lastSyncedId = $syncState ? $syncState->last_synced_id : 0;

        $this->info("Last synced ID: {$lastSyncedId}");

        // 5. Jika ini initial sync (ID = 0), tulis header dulu
        if ($lastSyncedId == 0) {
            try {
                $headerBody = new ValueRange(['values' => [self::HEADERS]]);
                $service->spreadsheets_values->append(
                    $spreadsheetId,
                    self::RAW_DATA_SHEET . '!A:G',
                    $headerBody,
                    ['valueInputOption' => 'RAW']
                );
                $this->info('Header row written to RAW_DATA.');
            } catch (\Exception $e) {
                $this->error("Failed to write header: " . $e->getMessage());
                return 1;
            }
        }

        // 6. Ambil data baru dari MySQL menggunakan koneksi read-only
        try {
            $newData = DB::connection('mysql_readonly')
                ->table('iqf_logsheet_details as d')
                ->join('iqf_logsheets as h', 'd.iqf_logsheet_id', '=', 'h.id')
                ->select(
                    'd.id',
                    'h.date',
                    'h.shift',
                    'h.product_type',
                    'h.machine',
                    'd.time',
                    'd.tray_count'
                )
                ->where('d.id', '>', $lastSyncedId)
                ->orderBy('d.id', 'asc')
                ->limit(500)
                ->get();
        } catch (\Exception $e) {
            $this->error("Failed to connect to Read-Only database: " . $e->getMessage());
            Log::error("SyncIqfToGoogleSheets - DB Error: " . $e->getMessage());
            return 1;
        }

        if ($newData->isEmpty()) {
            $this->info('No new data to sync.');
            return 0;
        }

        $this->info("Found {$newData->count()} new records to sync.");

        // 7. Transform Data
        $values     = [];
        $highestId  = $lastSyncedId;

        foreach ($newData as $row) {
            // Pembulatan jam: 20:05:30 → 20:00
            $waktu = $row->time ?? '';
            $jam   = '00:00';
            if ($waktu) {
                $parts = explode(':', $waktu);
                $jam   = str_pad($parts[0], 2, '0', STR_PAD_LEFT) . ':00';
            }

            // Normalisasi data agar cocok dengan format di REPORT sheet
            $tgl      = $row->date;                                    // "2026-07-28" → Google akan parse sebagai date
            $shift    = (int) $row->shift;                             // pastikan integer
            $jenis    = strtoupper($row->product_type);                // "siomay" → "SIOMAY"
            $no_iqf   = (int) str_replace('IQF ', '', trim($row->machine)); // "IQF 1" → 1
            $jumlah   = (int) $row->tray_count;

            $values[] = [$tgl, $shift, $jenis, $no_iqf, $waktu, $jam, $jumlah];

            if ($row->id > $highestId) {
                $highestId = $row->id;
            }
        }

        // 8. Kirim ke Google Sheets (batch append)
        try {
            $body = new ValueRange(['values' => $values]);

            $service->spreadsheets_values->append(
                $spreadsheetId,
                self::RAW_DATA_SHEET . '!A:G',
                $body,
                ['valueInputOption' => 'USER_ENTERED']
            );
        } catch (\Exception $e) {
            $this->error("Failed to push to Google Sheets API: " . $e->getMessage());
            Log::error("SyncIqfToGoogleSheets - API Error: " . $e->getMessage());
            return 1;
        }

        // 9. Update Last Synced ID
        DB::table('sync_states')->updateOrInsert(
            ['entity' => 'iqf_logsheets'],
            ['last_synced_id' => $highestId, 'updated_at' => now()]
        );

        $this->info("Successfully synced up to ID: {$highestId}");
        return 0;
    }
}
