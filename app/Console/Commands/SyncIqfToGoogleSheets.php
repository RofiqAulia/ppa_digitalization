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

#[Signature('sync:google-sheets')]
#[Description('Sync IQF production data to Google Sheets incrementally')]
class SyncIqfToGoogleSheets extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting sync to Google Sheets...');

        // 1. Get Google Credentials
        $credentialsPath = config('services.google.sheets_credentials_path');
        $spreadsheetId = config('services.google.spreadsheet_id');

        if (!$credentialsPath || !$spreadsheetId) {
            $this->error('Google Sheets credentials or spreadsheet ID not configured.');
            return 1;
        }

        $fullPath = base_path($credentialsPath);
        if (!file_exists($fullPath)) {
            $this->error("Google Sheets credentials file not found at: {$fullPath}");
            return 1;
        }

        // 2. Get Last Synced ID
        $syncState = DB::table('sync_states')->where('entity', 'iqf_logsheets')->first();
        $lastSyncedId = $syncState ? $syncState->last_synced_id : 0;
        
        $this->info("Last synced ID: {$lastSyncedId}");

        // 3. Fetch Data using Read-Only Connection
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

        // 4. Transform Data
        $values = [];
        $highestId = $lastSyncedId;

        foreach ($newData as $row) {
            $waktu = $row->time;
            $jam = '00:00';
            
            if ($waktu) {
                // Round down to the start of the hour (e.g., 20:05 -> 20:00)
                $parts = explode(':', $waktu);
                if (count($parts) > 0) {
                    $jam = $parts[0] . ':00';
                }
            }

            $values[] = [
                $row->id,
                $row->date,
                $row->shift,
                $row->product_type,
                $row->machine,
                $row->time,
                $jam,
                $row->tray_count
            ];

            if ($row->id > $highestId) {
                $highestId = $row->id;
            }
        }

        // 5. Send to Google Sheets
        try {
            $client = new Client();
            $client->setApplicationName('PPA Digitalization');
            $client->setScopes([Sheets::SPREADSHEETS]);
            $client->setAuthConfig($fullPath);
            $client->setAccessType('offline');

            $service = new Sheets($client);

            $body = new ValueRange([
                'values' => $values
            ]);

            $params = [
                'valueInputOption' => 'USER_ENTERED'
            ];

            // Append to RAW_DATA sheet
            $range = 'RAW_DATA!A:H';
            $service->spreadsheets_values->append($spreadsheetId, $range, $body, $params);

        } catch (\Exception $e) {
            $this->error("Failed to push to Google Sheets API: " . $e->getMessage());
            Log::error("SyncIqfToGoogleSheets - API Error: " . $e->getMessage());
            return 1;
        }

        // 6. Update Last Synced ID
        DB::table('sync_states')->updateOrInsert(
            ['entity' => 'iqf_logsheets'],
            [
                'last_synced_id' => $highestId,
                'updated_at' => now()
            ]
        );

        $this->info("Successfully synced up to ID: {$highestId}");
        return 0;
    }
}
