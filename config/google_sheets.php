<?php

return [
    'iqf' => [
        'spreadsheet_id' => env('GOOGLE_SHEETS_IQF_SPREADSHEET_ID', '1ul3PXJZjHrV6iSPJpoONlrl-Ag2loSPI4pcIn0K3hok'),
        'raw_sheet' => env('GOOGLE_SHEETS_IQF_RAW_SHEET', 'RAW_DATA'),
        'report_sheet' => env('GOOGLE_SHEETS_IQF_REPORT_SHEET', '(form biru)REPORT IQF DIMSUM'),
        'service_account_email' => env('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        'private_key' => env('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'),
        'batch_size' => (int) env('GOOGLE_SHEETS_IQF_BATCH_SIZE', 500),
        'state_path' => storage_path('app/iqf-google-sheets-sync.json'),
    ],
];
