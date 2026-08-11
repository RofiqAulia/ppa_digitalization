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
use Google\Service\Sheets\BatchUpdateValuesRequest;
use Google\Service\Sheets\Request;
use Google\Service\Sheets\BatchUpdateSpreadsheetRequest;

#[Signature('sync:google-sheets {--reset : Reset sync state dan paksa hitung ulang semua sel} {--force-recalc=* : Paksa hitung ulang untuk kombinasi tertentu (format: date|jenis|machine|shift)}')]
#[Description('Sync data IQF dari MySQL langsung ke sheet Report IQF Dimsum')]
class SyncIqfToGoogleSheets extends Command
{
    // === KONFIGURASI SHEET ===
    // Ganti dengan nama tab yang persis sama (case-sensitive)
    const REPORT_SHEET = "(form biru)REPORT IQF DIMSUM";

    // Baris header di Google Sheets (1-indexed)
    const HEADER_ROW = 2;

    // Indeks kolom (0-indexed dari A)
    const COL_SPV   = 0; // A - SPV
    const COL_TGL   = 1; // B - Tanggal
    const COL_JENIS = 2; // C - Jenis Dimsum
    const COL_IQF1  = 3; // D - IQF 1 (berisi angka 1)
    const COL_IQF2  = 4; // E - IQF 2 (berisi angka 2)
    const COL_SHIFT = 5; // F - Shift

    // Urutan jenis dimsum per baris (WAJIB sesuai urutan di sheet)
    const JENIS_ORDER   = ['SIOMAY', 'PENTOL', 'LUMPIA', 'ADONAN'];
    const MACHINE_ORDER = [1, 2];
    const SHIFT_ORDER   = [1, 2, 3];

    // Mapping JAM → indeks kolom (0-indexed)
    // Kolom G (idx 6) = 6:00 ... kolom AD (idx 29) = 5:00
    const HOUR_COLUMNS = [
        '08:00' => 6,  '09:00' => 7,  '10:00' => 8,  '11:00' => 9,
        '12:00' => 10, '13:00' => 11, '14:00' => 12, '15:00' => 13,
        '16:00' => 14, '17:00' => 15, '18:00' => 16, '19:00' => 17,
        '20:00' => 18, '21:00' => 19, '22:00' => 20, '23:00' => 21,
        '00:00' => 22, '01:00' => 23, '02:00' => 24, '03:00' => 25,
        '04:00' => 26, '05:00' => 27, '06:00' => 28, '07:00' => 29,
    ];

    public function handle(): int
    {
        $this->info('=== Sync IQF → Google Sheets Report ===');

        // 1. Validasi kredensial
        $credentialsPath = config('services.google.sheets_credentials_path');
        $spreadsheetId   = config('services.google.spreadsheet_id');

        if (!$credentialsPath || !$spreadsheetId) {
            $this->error('Kredensial Google Sheets belum dikonfigurasi di .env.');
            return 1;
        }

        $fullPath = base_path($credentialsPath);
        if (!file_exists($fullPath)) {
            $this->error("File kredensial tidak ditemukan: {$fullPath}");
            return 1;
        }

        // 2. Inisialisasi Google Sheets client
        try {
            $client = new Client();
            $client->setApplicationName('PPA Digitalization');
            $client->setScopes([Sheets::SPREADSHEETS]);
            $client->setAuthConfig($fullPath);
            $client->setAccessType('offline');
            $service = new Sheets($client);
        } catch (\Exception $e) {
            $this->error('Gagal inisialisasi Google Sheets: ' . $e->getMessage());
            Log::error('SyncIqf - Client Error: ' . $e->getMessage());
            return 1;
        }

        // 3. Ambil last_synced_id
        if ($this->option('reset')) {
            DB::table('sync_states')->where('entity', 'iqf_logsheets')
                ->update(['last_synced_id' => 0, 'updated_at' => now()]);
            $this->warn('Reset: last_synced_id di-set ke 0.');
        }

        $syncState    = DB::table('sync_states')->where('entity', 'iqf_logsheets')->first();
        $lastSyncedId = $syncState ? (int) $syncState->last_synced_id : 0;
        $this->info("Last synced IQF ID: {$lastSyncedId}");

        $refrezingState    = DB::table('sync_states')->where('entity', 'refrezing_logsheets')->first();
        $lastRefrezingSyncedId = $refrezingState ? (int) $refrezingState->last_synced_id : 0;
        $this->info("Last synced Refrezing ID: {$lastRefrezingSyncedId}");

        // 4. Ambil data BARU dari MySQL (incremental)
        try {
            $newRecords = DB::connection('mysql_readonly')
                ->table('iqf_logsheet_details as d')
                ->join('iqf_logsheets as h', 'd.iqf_logsheet_id', '=', 'h.id')
                ->select('d.id', 'h.date', 'h.shift', 'h.product_type', 'h.machine', 'd.time', 'd.tray_count')
                ->where('d.id', '>', $lastSyncedId)
                ->orderBy('d.id', 'asc')
                ->limit(500)
                ->get();

            $newRefrezingRecords = DB::connection('mysql_readonly')
                ->table('refrezing_logsheet_details as d')
                ->join('refrezing_logsheets as h', 'd.refrezing_logsheet_id', '=', 'h.id')
                ->select('d.id', 'h.date', 'h.shift', 'h.product_type', 'h.machine', 'd.tray_count')
                ->where('d.id', '>', $lastRefrezingSyncedId)
                ->orderBy('d.id', 'asc')
                ->limit(500)
                ->get();
        } catch (\Exception $e) {
            $this->error('Gagal query database: ' . $e->getMessage());
            Log::error('SyncIqf - DB Error: ' . $e->getMessage());
            return 1;
        }

        $forceRecalcs = $this->option('force-recalc') ?? [];

        if ($newRecords->isEmpty() && $newRefrezingRecords->isEmpty() && empty($forceRecalcs) && !$this->option('reset')) {
            $this->info('Tidak ada data baru. Selesai.');
            return 0;
        }

        $this->info("Ditemukan {$newRecords->count()} record IQF baru dan {$newRefrezingRecords->count()} record Refrezing baru.");

        // 5. Kumpulkan kombinasi (date, jenis, machineNum, shift) yang terpengaruh
        $affectedCombinations = [];
        $highestId = $lastSyncedId;
        $highestRefrezingId = $lastRefrezingSyncedId;

        // Tambahkan dari parameter force-recalc
        foreach ($forceRecalcs as $fr) {
            $parts = explode('|', $fr);
            if (count($parts) === 4) {
                $frDate = $parts[0];
                $frJenis = strtoupper($parts[1]);
                if ($frJenis === 'ADONAN_PANGSIT') $frJenis = 'ADONAN';
                $frMachine = (int)$parts[2];
                $frShift = (int)$parts[3];

                $key = "{$frDate}|{$frJenis}|{$frMachine}|{$frShift}";
                $affectedCombinations[$key] = [
                    'date' => $frDate,
                    'jenis' => $frJenis,
                    'machine' => $frMachine,
                    'shift' => $frShift,
                ];
            }
        }

        foreach ($newRecords as $record) {
            $date       = $record->date; // "2026-07-28"
            $jenis      = strtoupper($record->product_type); // "SIOMAY"
            if ($jenis === 'ADONAN_PANGSIT') {
                $jenis = 'ADONAN';
            }
            $machineNum = (int) filter_var(trim($record->machine), FILTER_SANITIZE_NUMBER_INT); // "IQF 1" → 1
            $shift      = (int) $record->shift;

            $key = "{$date}|{$jenis}|{$machineNum}|{$shift}";
            $affectedCombinations[$key] = [
                'date'    => $date,
                'jenis'   => $jenis,
                'machine' => $machineNum,
                'shift'   => $shift,
            ];

            if ($record->id > $highestId) {
                $highestId = $record->id;
            }
        }

        foreach ($newRefrezingRecords as $record) {
            $date       = $record->date;
            $jenis      = strtoupper($record->product_type);
            if ($jenis === 'ADONAN_PANGSIT') {
                $jenis = 'ADONAN';
            }
            $machineNum = (int) filter_var(trim($record->machine), FILTER_SANITIZE_NUMBER_INT);
            $shift      = (int) $record->shift;

            $key = "{$date}|{$jenis}|{$machineNum}|{$shift}";
            $affectedCombinations[$key] = [
                'date'    => $date,
                'jenis'   => $jenis,
                'machine' => $machineNum,
                'shift'   => $shift,
            ];

            if ($record->id > $highestRefrezingId) {
                $highestRefrezingId = $record->id;
            }
        }

        // 6. Untuk setiap kombinasi, hitung TOTAL PENUH dari MySQL (bukan hanya incremental)
        //    Ini mencegah double-count jika sync berjalan lebih dari sekali
        $fullAggregated = []; // [date][jenis][machine][shift][hour] => total
        $refrezingAggregated = []; // [date][jenis][machine][shift] => total

        foreach ($affectedCombinations as $combo) {
            // Inisialisasi semua jam dengan string kosong (agar jika data dihapus, sel akan ikut terhapus di Sheets)
            foreach (self::HOUR_COLUMNS as $jamStr => $idx) {
                $fullAggregated[$combo['date']][$combo['jenis']][$combo['machine']][$combo['shift']][$jamStr] = '';
            }

            try {
                $rows = DB::connection('mysql_readonly')
                    ->table('iqf_logsheet_details as d')
                    ->join('iqf_logsheets as h', 'd.iqf_logsheet_id', '=', 'h.id')
                    ->select('d.time', DB::raw('SUM(d.tray_count) as total'))
                    ->where('h.date', $combo['date'])
                    ->where(function($q) use ($combo) {
                        if ($combo['jenis'] === 'ADONAN') {
                            $q->whereRaw("UPPER(h.product_type) IN ('ADONAN', 'ADONAN_PANGSIT')");
                        } else {
                            $q->whereRaw("UPPER(h.product_type) = ?", [$combo['jenis']]);
                        }
                    })
                    ->where('h.machine', 'LIKE', '%' . $combo['machine'])
                    ->where('h.shift', $combo['shift'])
                    ->groupBy('d.time')
                    ->get();

                foreach ($rows as $row) {
                    $timeParts = explode(':', $row->time ?? '00:00:00');
                    $jam = str_pad($timeParts[0], 2, '0', STR_PAD_LEFT) . ':00';

                    if ($fullAggregated[$combo['date']][$combo['jenis']][$combo['machine']][$combo['shift']][$jam] === '') {
                        $fullAggregated[$combo['date']][$combo['jenis']][$combo['machine']][$combo['shift']][$jam] = 0;
                    }
                    $fullAggregated
                        [$combo['date']]
                        [$combo['jenis']]
                        [$combo['machine']]
                        [$combo['shift']]
                        [$jam] += (int) $row->total;
                }
            } catch (\Exception $e) {
                $this->warn("Gagal agregasi untuk {$combo['date']}/{$combo['jenis']}/IQF{$combo['machine']}/Shift{$combo['shift']}: " . $e->getMessage());
            }

            // Agregasi Refrezing
            try {
                $refrezingTotal = DB::connection('mysql_readonly')
                    ->table('refrezing_logsheet_details as d')
                    ->join('refrezing_logsheets as h', 'd.refrezing_logsheet_id', '=', 'h.id')
                    ->where('h.date', $combo['date'])
                    ->where(function($q) use ($combo) {
                        if ($combo['jenis'] === 'ADONAN') {
                            $q->whereRaw("UPPER(h.product_type) IN ('ADONAN', 'ADONAN_PANGSIT')");
                        } else {
                            $q->whereRaw("UPPER(h.product_type) = ?", [$combo['jenis']]);
                        }
                    })
                    ->where('h.machine', 'LIKE', '%' . $combo['machine'])
                    ->where('h.shift', $combo['shift'])
                    ->sum('d.tray_count');
                
                $refrezingAggregated[$combo['date']][$combo['jenis']][$combo['machine']][$combo['shift']] = (int) $refrezingTotal;
            } catch (\Exception $e) {
                $this->warn("Gagal agregasi Refrezing: " . $e->getMessage());
            }
        }

        // 7. Baca sheet report untuk membangun row lookup
        $sheetName = self::REPORT_SHEET;
        $sheetId = null;

        try {
            $spreadsheet = $service->spreadsheets->get($spreadsheetId);
            foreach ($spreadsheet->getSheets() as $sheet) {
                if ($sheet->getProperties()->getTitle() === $sheetName) {
                    $sheetId = $sheet->getProperties()->getSheetId();
                    break;
                }
            }

            $readRange = "'{$sheetName}'!A:F";
            $response  = $service->spreadsheets_values->get($spreadsheetId, $readRange);
            $sheetRows = $response->getValues() ?? [];
        } catch (\Exception $e) {
            $this->error('Gagal membaca sheet report: ' . $e->getMessage());
            return 1;
        }

        // 8. Bangun row lookup: "date|jenis|machine|shift" => rowNumber (1-indexed)
        $rowLookup   = [];
        $datesInSheet = [];

        foreach ($sheetRows as $idx => $row) {
            $rowNum = $idx + 1;
            if ($rowNum <= self::HEADER_ROW) continue;

            $tglRaw   = $row[self::COL_TGL]   ?? '';
            $jenisRaw = strtoupper($row[self::COL_JENIS] ?? '');
            $iqf1Raw  = trim($row[self::COL_IQF1] ?? '');
            $iqf2Raw  = trim($row[self::COL_IQF2] ?? '');
            $shiftRaw = (int) ($row[self::COL_SHIFT] ?? 0);

            if (!$tglRaw || !$jenisRaw || !$shiftRaw) continue;

            $normalDate = $this->normalizeDate($tglRaw);
            if (!$normalDate) continue;

            $datesInSheet[$normalDate] = true;

            if ($iqf1Raw !== '' && $iqf1Raw !== '0') {
                $machineNum = 1;
            } elseif ($iqf2Raw !== '' && $iqf2Raw !== '0') {
                $machineNum = 2;
            } else {
                continue;
            }

            $key = "{$normalDate}|{$jenisRaw}|{$machineNum}|{$shiftRaw}";
            $rowLookup[$key] = $rowNum;
        }

        // 9. Tambahkan baris baru untuk tanggal yang belum ada
        $datesToAdd = [];
        foreach (array_keys($fullAggregated) as $date) {
            if (!isset($datesInSheet[$date])) {
                $datesToAdd[] = $date;
            }
        }
        sort($datesToAdd); // urut dari tanggal terlama

        if (!empty($datesToAdd)) {
            $newRows = [];
            foreach ($datesToAdd as $date) {
                $ts = strtotime($date);
                $bulanIndo = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                $tglFormatted = date('d', $ts) . ' ' . $bulanIndo[(int)date('n', $ts)] . ' ' . date('Y', $ts);

                // Urutan: Shift → Jenis → Mesin
                foreach (self::SHIFT_ORDER as $shift) {
                    foreach (self::JENIS_ORDER as $jenis) {
                        foreach (self::MACHINE_ORDER as $machineNum) {
                            // Buat baris kosong (30 kolom: A-AD)
                            $baris = array_fill(0, 30, '');
                            $baris[self::COL_TGL]   = $tglFormatted;
                            $baris[self::COL_JENIS] = $jenis;
                            $baris[self::COL_SHIFT] = $shift;

                            if ($machineNum === 1) {
                                $baris[self::COL_IQF1] = 1;
                            } else {
                                $baris[self::COL_IQF2] = 2;
                            }

                            $newRows[] = $baris;
                        }
                    }
                }
            }

            try {
                $body = new ValueRange(['values' => $newRows]);
                $service->spreadsheets_values->append(
                    $spreadsheetId,
                    "'{$sheetName}'!A:AD",
                    $body,
                    ['valueInputOption' => 'USER_ENTERED']
                );

                $this->info('Ditambahkan ' . count($newRows) . ' baris baru untuk ' . count($datesToAdd) . ' tanggal.');

                // Re-baca sheet untuk update rowLookup
                $response  = $service->spreadsheets_values->get($spreadsheetId, "'{$sheetName}'!A:F");
                $sheetRows = $response->getValues() ?? [];

                // Rebuild lookup
                $rowLookup = [];
                foreach ($sheetRows as $idx => $row) {
                    $rowNum   = $idx + 1;
                    if ($rowNum <= self::HEADER_ROW) continue;

                    $tglRaw   = $row[self::COL_TGL]   ?? '';
                    $jenisRaw = strtoupper($row[self::COL_JENIS] ?? '');
                    $iqf1Raw  = trim($row[self::COL_IQF1] ?? '');
                    $iqf2Raw  = trim($row[self::COL_IQF2] ?? '');
                    $shiftRaw = (int) ($row[self::COL_SHIFT] ?? 0);

                    if (!$tglRaw || !$jenisRaw || !$shiftRaw) continue;

                    $normalDate = $this->normalizeDate($tglRaw);
                    if (!$normalDate) continue;

                    if ($iqf1Raw !== '' && $iqf1Raw !== '0') {
                        $machineNum = 1;
                    } elseif ($iqf2Raw !== '' && $iqf2Raw !== '0') {
                        $machineNum = 2;
                    } else {
                        continue;
                    }

                    $key = "{$normalDate}|{$jenisRaw}|{$machineNum}|{$shiftRaw}";
                    $rowLookup[$key] = $rowNum;
                }
                // Tulis formula =SUM(G[row]:AD[row]) di kolom AE untuk SEMUA baris baru
                $achieveBatch = [];
                foreach ($datesToAdd as $addedDate) {
                    foreach (self::SHIFT_ORDER as $addedShift) {
                        foreach (self::JENIS_ORDER as $addedJenis) {
                            foreach (self::MACHINE_ORDER as $addedMachine) {
                                $addedKey = "{$addedDate}|{$addedJenis}|{$addedMachine}|{$addedShift}";
                                $addedRow = $rowLookup[$addedKey] ?? null;
                                if (!$addedRow) continue;

                                $aeCol = $this->indexToColumn(30); // AE
                                $achieveBatch[] = new ValueRange([
                                    'range'  => "'{$sheetName}'!{$aeCol}{$addedRow}",
                                    'values' => [["=SUM(G{$addedRow}:AD{$addedRow})"]],
                                ]);
                            }
                        }
                    }
                }

                if (!empty($achieveBatch)) {
                    $service->spreadsheets_values->batchUpdate($spreadsheetId, new BatchUpdateValuesRequest([
                        'valueInputOption' => 'USER_ENTERED',
                        'data'             => $achieveBatch,
                    ]));
                    $this->info('Formula Achieve ditulis untuk ' . count($achieveBatch) . ' baris baru.');
                }

            } catch (\Exception $e) {
                $this->error('Gagal menambahkan baris baru: ' . $e->getMessage());
                return 1;
            }
        }

        // 10. Bangun batch update untuk sel-sel kolom jam
        $batchData = [];

        foreach ($fullAggregated as $date => $jenisList) {
            foreach ($jenisList as $jenis => $machineList) {
                foreach ($machineList as $machineNum => $shiftList) {
                    foreach ($shiftList as $shift => $hourList) {
                        $key       = "{$date}|{$jenis}|{$machineNum}|{$shift}";
                        $rowNumber = $rowLookup[$key] ?? null;

                        if (!$rowNumber) {
                            $this->warn("Baris tidak ditemukan untuk: {$date} | {$jenis} | IQF{$machineNum} | Shift{$shift}");
                            continue;
                        }

                        foreach ($hourList as $jam => $total) {
                            $colIdx = self::HOUR_COLUMNS[$jam] ?? null;
                            if ($colIdx === null) {
                                $this->warn("Jam tidak dikenali: {$jam}");
                                continue;
                            }

                            $colLetter = $this->indexToColumn($colIdx);
                            $range     = "'{$sheetName}'!{$colLetter}{$rowNumber}";

                            $batchData[] = new ValueRange([
                                'range'  => $range,
                                'values' => [[$total]],
                            ]);
                        }

                        // Tulis formula Achieve di kolom AE untuk baris yang memiliki data
                        $aeCol = $this->indexToColumn(30); // AE
                        $batchData[] = new ValueRange([
                            'range'  => "'{$sheetName}'!{$aeCol}{$rowNumber}",
                            'values' => [["=SUM(G{$rowNumber}:AD{$rowNumber})"]],
                        ]);

                        // Tulis total Refrezing di kolom AF (index 31)
                        $refTotal = $refrezingAggregated[$date][$jenis][$machineNum][$shift] ?? '';
                        if ($refTotal !== '') {
                            $afCol = $this->indexToColumn(31); // AF
                            $batchData[] = new ValueRange([
                                'range'  => "'{$sheetName}'!{$afCol}{$rowNumber}",
                                'values' => [[$refTotal ?: 0]],
                            ]);
                        }
                    }
                }
            }
        }

        // 10.5 Paksa format tanggal untuk SEMUA baris yang ada di spreadsheet
        foreach ($rowLookup as $key => $rowNumber) {
            $parts = explode('|', $key);
            if (count($parts) === 4) {
                $ts = strtotime($parts[0]);
                $bulanIndo = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                $tglFormatted = date('d', $ts) . ' ' . $bulanIndo[(int)date('n', $ts)] . ' ' . date('Y', $ts);
                
                $batchData[] = new ValueRange([
                    'range'  => "'{$sheetName}'!B{$rowNumber}",
                    'values' => [[$tglFormatted]],
                ]);
            }
        }

        // 11. Kirim batch update ke Google Sheets
        if (!empty($batchData)) {
            try {
                $batchBody = new BatchUpdateValuesRequest([
                    'valueInputOption' => 'USER_ENTERED',
                    'data'             => $batchData,
                ]);
                $service->spreadsheets_values->batchUpdate($spreadsheetId, $batchBody);
                $this->info('Berhasil update ' . count($batchData) . ' sel di Report.');
            } catch (\Exception $e) {
                $this->error('Gagal batch update sel: ' . $e->getMessage());
                Log::error('SyncIqf - Batch Update Error: ' . $e->getMessage());
                return 1;
            }
        } else {
            $this->info('Tidak ada sel yang perlu diupdate.');
        }

        // 11.5 Warnai SEMUA baris berdasarkan Shift
        if ($sheetId !== null) {
            $formatRequests = [];
            foreach ($rowLookup as $key => $rowNumber) {
                $parts = explode('|', $key);
                if (count($parts) === 4) {
                    $shift = (int)$parts[3];
                    $color = ['red' => 1.0, 'green' => 1.0, 'blue' => 1.0]; // default white
                    if ($shift === 1) {
                        $color = ['red' => 0.85, 'green' => 0.92, 'blue' => 0.83]; // Ijo
                    } elseif ($shift === 2) {
                        $color = ['red' => 1.0, 'green' => 0.95, 'blue' => 0.80]; // Kuning
                    } elseif ($shift === 3) {
                        $color = ['red' => 0.98, 'green' => 0.90, 'blue' => 0.80]; // Orange
                    }
                    
                    $formatRequests[] = new Request([
                        'repeatCell' => [
                            'range' => [
                                'sheetId' => $sheetId,
                                'startRowIndex' => $rowNumber - 1,
                                'endRowIndex' => $rowNumber,
                                'startColumnIndex' => 0,
                                'endColumnIndex' => 32 // Sampai kolom AF (Indeks 32 eksklusif)
                            ],
                            'cell' => [
                                'userEnteredFormat' => [
                                    'backgroundColor' => $color
                                ]
                            ],
                            'fields' => 'userEnteredFormat.backgroundColor'
                        ]
                    ]);
                }
            }

            if (!empty($formatRequests)) {
                try {
                    $batchFormatBody = new BatchUpdateSpreadsheetRequest([
                        'requests' => $formatRequests
                    ]);
                    $service->spreadsheets->batchUpdate($spreadsheetId, $batchFormatBody);
                    $this->info('Berhasil mewarnai ' . count($formatRequests) . ' baris berdasarkan shift.');
                } catch (\Exception $e) {
                    $this->warn('Gagal mewarnai baris: ' . $e->getMessage());
                }
            }
        }

        // 12. Simpan last_synced_id kembali ke DB
        if (!$this->option('force-recalc')) {
            DB::table('sync_states')->updateOrInsert(
                ['entity' => 'iqf_logsheets'],
                ['last_synced_id' => $highestId, 'updated_at' => now()]
            );
            
            DB::table('sync_states')->updateOrInsert(
                ['entity' => 'refrezing_logsheets'],
                ['last_synced_id' => $highestRefrezingId, 'updated_at' => now()]
            );
        }
        
        $this->info("Selesai. Last synced ID: {$highestId}");
        return 0;
    }

    /**
     * Normalisasi string tanggal dari berbagai format ke Y-m-d
     */
    private function normalizeDate(string $tgl): ?string
    {
        if (!$tgl) return null;

        // Terjemahkan bulan Indonesia ke Inggris agar bisa diparsing
        $bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $bulanInggris = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $tglStr = str_ireplace($bulanIndo, $bulanInggris, $tgl);

        foreach (['d F Y', 'd-M-Y', 'd-M', 'Y-m-d', 'd/m/Y'] as $fmt) {
            $dt = \DateTime::createFromFormat($fmt, $tglStr);
            if ($dt) {
                if ($fmt === 'd-M') {
                    $dt->setDate((int) date('Y'), (int) $dt->format('n'), (int) $dt->format('j'));
                }
                return $dt->format('Y-m-d');
            }
        }

        $ts = @strtotime($tglStr);
        return $ts !== false ? date('Y-m-d', $ts) : null;
    }

    /**
     * Konversi indeks kolom (0-indexed) ke huruf kolom Google Sheets
     * Contoh: 0 → A, 25 → Z, 26 → AA, 27 → AB
     */
    private function indexToColumn(int $index): string
    {
        $col = '';
        while ($index >= 0) {
            $col   = chr($index % 26 + 65) . $col;
            $index = (int) ($index / 26) - 1;
        }
        return $col;
    }
}
