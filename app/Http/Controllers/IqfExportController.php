<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Font;
use Carbon\Carbon;

class IqfExportController extends Controller
{
    // Mapping jam → kolom spreadsheet (A=0, G=6, ..., AD=29, AE=30)
    const HOUR_COLUMNS = [
        '08:00' => 6,  '09:00' => 7,  '10:00' => 8,  '11:00' => 9,
        '12:00' => 10, '13:00' => 11, '14:00' => 12, '15:00' => 13,
        '16:00' => 14, '17:00' => 15, '18:00' => 16, '19:00' => 17,
        '20:00' => 18, '21:00' => 19, '22:00' => 20, '23:00' => 21,
        '00:00' => 22, '01:00' => 23, '02:00' => 24, '03:00' => 25,
        '04:00' => 26, '05:00' => 27, '06:00' => 28, '07:00' => 29,
    ];

    const JENIS_ORDER   = ['SIOMAY', 'PENTOL', 'LUMPIA', 'ADONAN'];
    const MACHINE_ORDER = [1, 2];
    const SHIFT_ORDER   = [1, 2, 3];

    // Warna blok per shift (ARGB)
    const SHIFT_COLORS = [
        1 => 'FFD9EAD3', // Hijau muda
        2 => 'FFFFF2CC', // Kuning muda
        3 => 'FFFCE5CD', // Orange muda
    ];

    // Warna header
    const HEADER_COLOR = 'FF9FC2E7'; // Biru seperti di spreadsheet

    public function download()
    {
        // Ambil semua tanggal unik dari database
        $dates = DB::table('iqf_logsheets')
            ->orderBy('date')
            ->pluck('date')
            ->unique()
            ->values()
            ->toArray();

        // Ambil semua data logsheet beserta detailnya
        $allLogsheets = DB::table('iqf_logsheets as h')
            ->join('iqf_logsheet_details as d', 'd.iqf_logsheet_id', '=', 'h.id')
            ->select('h.date', 'h.product_type', 'h.machine', 'h.shift', 'd.time', DB::raw('SUM(d.tray_count) as total'))
            ->groupBy('h.date', 'h.product_type', 'h.machine', 'h.shift', DB::raw('HOUR(d.time)'))
            ->get();

        // Susun data ke dalam struktur [date][jenis][machine][shift][hour] => total
        $data = [];
        foreach ($allLogsheets as $row) {
            $jenis   = strtoupper($row->product_type);
            $jenis   = preg_replace('/_[TW]$/', '', $jenis);
            if ($jenis === 'ADONAN_PANGSIT') {
                $jenis = 'ADONAN';
            }
            $machine = (int) filter_var($row->machine, FILTER_SANITIZE_NUMBER_INT);
            $shift   = (int) $row->shift;
            $hour    = (int) explode(':', $row->time)[0];
            $hourKey = sprintf('%02d:00', $hour);

            if (isset(self::HOUR_COLUMNS[$hourKey])) {
                $data[$row->date][$jenis][$machine][$shift][$hourKey] =
                    ($data[$row->date][$jenis][$machine][$shift][$hourKey] ?? 0) + $row->total;
            }
        }

        // Buat spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('REPORT IQF DIMSUM');

        // ── HEADER ROW (baris 2, sama seperti di Google Sheets) ─────────────
        $headers = ['SPV', 'TGL', 'Jenis Dimsum', 'NO. IQF', 'SHIFT'];
        $col = 1;
        foreach ($headers as $h) {
            $sheet->setCellValueByColumnAndRow($col, 2, $h);
            $col++;
        }

        // Kolom jam (G=6 sampai AD=29 → col 6-29 relative to 1-indexed = 6 onwards)
        // Kolom A=1, B=2, C=3, D=4, E=5, F=6, G=7 ... 
        // Spreadsheet: G=6:00, H=7:00... tapi di array 1-indexed maka G=kol 7
        foreach (self::HOUR_COLUMNS as $jamStr => $idx0) {
            $colNum = $idx0 + 1; // 1-indexed
            $sheet->setCellValueByColumnAndRow($colNum, 2, $jamStr);
        }
        // Kolom AE (Total) = idx 30 + 1 = 31
        $sheet->setCellValueByColumnAndRow(31, 2, 'TOTAL');

        // Style header row
        $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(31);
        $headerRange = "A2:{$lastCol}2";
        $sheet->getStyle($headerRange)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color'    => ['argb' => self::HEADER_COLOR],
            ],
            'font' => [
                'bold' => true,
                'size' => 10,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['argb' => 'FFB0C4D8'],
                ],
            ],
        ]);

        // ── BARIS DATA ────────────────────────────────────────────────────────
        $currentRow = 3;

        foreach ($dates as $date) {
            $ts = strtotime($date);
            $bulanIndo = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei',
                'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            $tglFormatted = date('d', $ts) . ' ' . $bulanIndo[(int) date('n', $ts)] . ' ' . date('Y', $ts);

            foreach (self::SHIFT_ORDER as $shift) {
                foreach (self::JENIS_ORDER as $jenis) {
                    foreach (self::MACHINE_ORDER as $machine) {
                        // Kolom A: SPV (kosong)
                        $sheet->setCellValueByColumnAndRow(1, $currentRow, '');
                        // Kolom B: Tanggal
                        $sheet->setCellValueByColumnAndRow(2, $currentRow, $tglFormatted);
                        // Kolom C: Jenis Dimsum
                        $jenisLabel = ucfirst(strtolower($jenis));
                        $sheet->setCellValueByColumnAndRow(3, $currentRow, $jenisLabel);
                        // Kolom D: NO. IQF (nomor mesin, 1 atau 2)
                        $sheet->setCellValueByColumnAndRow(4, $currentRow, $machine);
                        // Kolom E: NO. IQF kedua (kosong seperti di sheets)
                        $sheet->setCellValueByColumnAndRow(5, $currentRow, '');
                        // Kolom F: SHIFT
                        $sheet->setCellValueByColumnAndRow(6, $currentRow, $shift);

                        // Kolom jam G–AD
                        $total = 0;
                        foreach (self::HOUR_COLUMNS as $jamStr => $idx0) {
                            $colNum = $idx0 + 1;
                            $val = $data[$date][$jenis][$machine][$shift][$jamStr] ?? '';
                            $sheet->setCellValueByColumnAndRow($colNum, $currentRow, $val !== '' ? (int)$val : '');
                            if ($val !== '') $total += (int)$val;
                        }

                        // Kolom AE: Total
                        $sheet->setCellValueByColumnAndRow(31, $currentRow, $total > 0 ? $total : '');

                        // ── Warna blok baris berdasarkan shift ──────────────
                        $argb = self::SHIFT_COLORS[$shift] ?? 'FFFFFFFF';
                        $rowRange = "A{$currentRow}:{$lastCol}{$currentRow}";
                        $sheet->getStyle($rowRange)->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'color'    => ['argb' => $argb],
                            ],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical'   => Alignment::VERTICAL_CENTER,
                            ],
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color'       => ['argb' => 'FFD0D0D0'],
                                ],
                            ],
                        ]);

                        $currentRow++;
                    }
                }
            }
        }

        // ── Lebar kolom ──────────────────────────────────────────────────────
        $sheet->getColumnDimensionByColumn(1)->setWidth(12); // SPV
        $sheet->getColumnDimensionByColumn(2)->setWidth(18); // TGL
        $sheet->getColumnDimensionByColumn(3)->setWidth(16); // Jenis
        $sheet->getColumnDimensionByColumn(4)->setWidth(9);  // IQF
        $sheet->getColumnDimensionByColumn(5)->setWidth(9);  // IQF 2
        $sheet->getColumnDimensionByColumn(6)->setWidth(8);  // SHIFT
        for ($c = 7; $c <= 30; $c++) {
            $sheet->getColumnDimensionByColumn($c)->setWidth(7);
        }
        $sheet->getColumnDimensionByColumn(31)->setWidth(10); // TOTAL

        // Freeze header row
        $sheet->freezePane('A3');

        // ── Download ─────────────────────────────────────────────────────────
        $filename = 'Report_IQF_' . now('Asia/Jakarta')->format('Ymd_His') . '.xlsx';

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'max-age=0',
        ]);
    }
}
