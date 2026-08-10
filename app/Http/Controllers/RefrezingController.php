<?php

namespace App\Http\Controllers;

use App\Models\RefrezingLogsheet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class RefrezingController extends Controller
{
    private function getCurrentShiftAndDate()
    {
        $now = Carbon::now('Asia/Jakarta');
        $hour = (int) $now->format('H');
        
        if ($hour >= 6 && $hour < 14) {
            $shift = 1;
            $date = $now->format('Y-m-d');
        } elseif ($hour >= 14 && $hour < 22) {
            $shift = 2;
            $date = $now->format('Y-m-d');
        } elseif ($hour >= 22) {
            $shift = 3;
            $date = $now->format('Y-m-d');
        } else {
            // 00:00 to 05:59 is still Shift 3 of the previous day
            $shift = 3;
            $date = clone $now;
            $date = $date->subDay()->format('Y-m-d');
        }

        return compact('shift', 'date');
    }

    private function dispatchSyncBackground($options = [])
    {
        $cmd = 'app:sync-iqf-to-google-sheets';
        foreach ($options as $key => $values) {
            if (is_array($values)) {
                foreach ($values as $val) {
                    $cmd .= ' ' . escapeshellarg($key . '=' . $val);
                }
            } else {
                $cmd .= ' ' . escapeshellarg($key . '=' . $values);
            }
        }

        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            pclose(popen('start /B php ' . base_path('artisan') . ' ' . $cmd . ' > NUL 2>&1', 'r'));
        } else {
            exec('php ' . base_path('artisan') . ' ' . $cmd . ' > /dev/null 2>&1 &');
        }
    }

    public function kiosk()
    {
        return Inertia::render('Operator/RefrezingLanding');
    }

    public function storeKiosk(Request $request)
    {
        $request->validate([
            'product_type' => 'required|string',
            'machine' => 'required|string',
            'tray_count' => 'required|integer|min:1',
        ]);

        extract($this->getCurrentShiftAndDate());

        // Find or create logsheet automatically so operator is not blocked
        $logsheet = RefrezingLogsheet::firstOrCreate([
            'date' => $date,
            'shift' => $shift,
            'product_type' => $request->product_type,
            'machine' => $request->machine,
        ], [
            'batch_number' => $request->batch_number,
            'planning_qty' => 0,
            'status' => 'ongoing'
        ]);

        if ($request->batch_number && $logsheet->batch_number != $request->batch_number) {
            $logsheet->update(['batch_number' => $request->batch_number]);
        }

        if ($request->has('unplanned_stop') && $request->unplanned_stop !== null) {
            $logsheet->update(['unplanned_stop' => $request->unplanned_stop]);
        }

        // Get current time
        $time = now('Asia/Jakarta')->format('H:i:s');

        // Create detail logsheet (rack entry)
        $detail = $logsheet->details()->create([
            'time' => $time,
            'suhu_panel' => $request->suhu_panel,
            'suhu_produk' => $request->suhu_produk,
            'rak' => $request->rak,
            'tray_count' => $request->tray_count,
            'pic' => session('operator_name', 'Unknown'),
        ]);

        // Trigger sync ke Google Sheets secara real-time
        $this->dispatchSyncBackground();

        // Calculate total achieve for this logsheet (current product)
        $totalAchieve = $logsheet->details()->sum('tray_count');

        // Calculate totals per product_type for current date, shift, machine
        $allLogsheets = RefrezingLogsheet::where('date', $date)
            ->where('shift', $shift)
            ->where('machine', $request->machine)
            ->with('details')
            ->get();

        $totalsByProduct = [
            'siomay'        => 0,
            'pentol'        => 0,
            'lumpia'        => 0,
            'adonan_pangsit'=> 0,
        ];
        foreach ($allLogsheets as $ls) {
            if (array_key_exists($ls->product_type, $totalsByProduct)) {
                $totalsByProduct[$ls->product_type] += $ls->details->sum('tray_count');
            }
        }

        return response()->json([
            'success' => 'Berhasil ditambahkan!',
            'detail' => $detail,
            'total_achieve' => $totalAchieve,
            'totals_by_product' => $totalsByProduct,
            'kalkulasi' => number_format($totalAchieve / 150, 2)
        ]);
    }

    public function storeUnplannedStop(Request $request)
    {
        $request->validate([
            'product_type' => 'required|string',
            'machine' => 'required|string',
            'unplanned_stop' => 'required|string',
        ]);

        extract($this->getCurrentShiftAndDate());

        $logsheet = RefrezingLogsheet::firstOrCreate([
            'date' => $date,
            'shift' => $shift,
            'product_type' => $request->product_type,
            'machine' => $request->machine,
        ], [
            'batch_number' => $request->batch_number ?? '',
            'planning_qty' => 0,
            'status' => 'ongoing'
        ]);

        $existingStop = $logsheet->unplanned_stop;
        $newStop = $request->unplanned_stop;

        if ($request->has('is_update') && $request->is_update && $existingStop) {
            if ($request->has('old_text') && $request->old_text && str_contains($existingStop, $request->old_text)) {
                $updatedStop = str_replace($request->old_text, $newStop, $existingStop);
                $logsheet->update(['unplanned_stop' => $updatedStop]);
            } else {
                $logsheet->update(['unplanned_stop' => $existingStop . ', ' . $newStop]);
            }
        } else {
            if ($existingStop) {
                if (!str_contains($existingStop, $newStop)) {
                    $logsheet->update(['unplanned_stop' => $existingStop . ', ' . $newStop]);
                }
            } else {
                $logsheet->update(['unplanned_stop' => $newStop]);
            }
        }

        return response()->json(['success' => true]);
    }
}
