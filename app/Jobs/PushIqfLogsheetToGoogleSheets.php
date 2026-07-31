<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\IqfLogsheet;
use App\Models\IqfLogsheetDetail;
use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;
use Illuminate\Support\Facades\Log;

class PushIqfLogsheetToGoogleSheets implements ShouldQueue
{
    use Queueable;

    public $detail;
    public $logsheet;

    /**
     * Create a new job instance.
     */
    public function __construct(IqfLogsheetDetail $detail)
    {
        $this->detail = $detail;
        $this->logsheet = $detail->iqfLogsheet;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $credentialsPath = config('services.google.sheets_credentials_path');
            $spreadsheetId = config('services.google.spreadsheet_id');

            if (!$credentialsPath || !$spreadsheetId) {
                Log::warning('Google Sheets credentials or spreadsheet ID not configured.');
                return;
            }

            $fullPath = base_path($credentialsPath);
            if (!file_exists($fullPath)) {
                Log::warning("Google Sheets credentials file not found at: {$fullPath}");
                return;
            }

            $client = new Client();
            $client->setApplicationName('PPA Digitalization');
            $client->setScopes([Sheets::SPREADSHEETS]);
            $client->setAuthConfig($fullPath);
            $client->setAccessType('offline');

            $service = new Sheets($client);

            $waktu = $this->detail->time;
            $jam = '00:00';
            if ($waktu) {
                $parts = explode(':', $waktu);
                if (count($parts) > 0) {
                    $jam = $parts[0] . ':00';
                }
            }

            $values = [
                [
                    $this->detail->id,
                    $this->logsheet->date,
                    $this->logsheet->shift,
                    $this->logsheet->product_type,
                    $this->logsheet->machine,
                    $this->detail->time,
                    $jam,
                    $this->detail->tray_count
                ]
            ];

            $body = new ValueRange([
                'values' => $values
            ]);

            $params = [
                'valueInputOption' => 'USER_ENTERED'
            ];

            $range = 'RAW_DATA!A:H';

            $service->spreadsheets_values->append($spreadsheetId, $range, $body, $params);

        } catch (\Exception $e) {
            Log::error('Failed to push to Google Sheets: ' . $e->getMessage());
            throw $e;
        }
    }
}
