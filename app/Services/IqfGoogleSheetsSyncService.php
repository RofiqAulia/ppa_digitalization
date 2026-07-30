<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

class IqfGoogleSheetsSyncService
{
    private const HEADERS = ['ID', 'TGL', 'SHIFT', 'JENIS', 'NO_IQF', 'WAKTU', 'JAM', 'JUMLAH', 'SYNCED_AT'];

    public function sync(bool $initial = false, bool $dryRun = false): array
    {
        $config = config('google_sheets.iqf');
        $lastSyncedId = $initial ? 0 : $this->readLastSyncedId($config['state_path']);
        $rows = $this->fetchRows($lastSyncedId, $config['batch_size']);
        $values = $rows->map(fn (object $row) => $this->transformRow($row))->values()->all();
        $maxId = $rows->max('id') ?? $lastSyncedId;

        if (!$dryRun) {
            $client = new GoogleSheetsClient(
                (string) $config['service_account_email'],
                (string) $config['private_key'],
            );

            $client->ensureSheet($config['spreadsheet_id'], $config['raw_sheet']);

            if ($initial) {
                $client->clearValues($config['spreadsheet_id'], "{$config['raw_sheet']}!A:I");
            }

            $client->updateValues($config['spreadsheet_id'], "{$config['raw_sheet']}!A1:I1", [self::HEADERS]);
            $client->appendValues($config['spreadsheet_id'], "{$config['raw_sheet']}!A:I", $values);
            $this->writeLastSyncedId($config['state_path'], (int) $maxId);
        }

        return [
            'initial' => $initial,
            'dry_run' => $dryRun,
            'last_synced_id_before' => $lastSyncedId,
            'last_synced_id_after' => (int) $maxId,
            'rows' => count($values),
        ];
    }

    private function fetchRows(int $lastSyncedId, int $limit)
    {
        return DB::table('iqf_logsheet_details as d')
            ->join('iqf_logsheets as l', 'l.id', '=', 'd.iqf_logsheet_id')
            ->select([
                'd.id',
                'l.date as production_date',
                'l.shift',
                'l.product_type',
                'l.machine',
                'd.time',
                'd.tray_count',
            ])
            ->where('d.id', '>', $lastSyncedId)
            ->orderBy('d.id')
            ->limit($limit)
            ->get();
    }

    private function transformRow(object $row): array
    {
        $time = CarbonImmutable::createFromFormat('H:i:s', (string) $row->time, 'Asia/Jakarta');

        if (!$time) {
            throw new RuntimeException("Format waktu tidak valid untuk detail ID {$row->id}.");
        }

        return [
            (int) $row->id,
            CarbonImmutable::parse($row->production_date, 'Asia/Jakarta')->format('d-M'),
            (int) $row->shift,
            $this->normalizeProduct((string) $row->product_type),
            (string) $row->machine,
            $time->format('H:i'),
            $time->minute(0)->second(0)->format('G:00'),
            (int) $row->tray_count,
            now('Asia/Jakarta')->format('Y-m-d H:i:s'),
        ];
    }

    private function normalizeProduct(string $product): string
    {
        return match ($product) {
            'siomay' => 'SIOMAY',
            'pentol' => 'PENTOL',
            'lumpia' => 'LUMPIA',
            'adonan_pangsit' => 'ADONAN',
            default => strtoupper(str_replace('_', ' ', $product)),
        };
    }

    private function readLastSyncedId(string $path): int
    {
        if (!File::exists($path)) {
            return 0;
        }

        $state = json_decode(File::get($path), true);

        return (int) ($state['last_synced_id'] ?? 0);
    }

    private function writeLastSyncedId(string $path, int $id): void
    {
        File::ensureDirectoryExists(dirname($path));
        File::put($path, json_encode([
            'last_synced_id' => $id,
            'updated_at' => now('Asia/Jakarta')->toIso8601String(),
        ], JSON_PRETTY_PRINT));
    }
}

