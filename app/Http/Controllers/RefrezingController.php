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
        
        if ($hour >= 8 && $hour < 16) {
            $shift = 1;
            $date = $now->format('Y-m-d');
        } elseif ($hour >= 16 && $hour <= 23) {
            $shift = 2;
            $date = $now->format('Y-m-d');
        } else {
            // 00:00 to 07:59 is Shift 3 of the previous day
            $shift = 3;
            $date = clone $now;
            $date = $date->subDay()->format('Y-m-d');
        }

        return compact('shift', 'date');
    }

    private function getComboKey($logsheet)
    {
        if (!$logsheet) return null;
        $jenis = strtoupper($logsheet->product_type);
        $jenis = preg_replace('/_[TW]$/', '', $jenis);
        if ($jenis === 'ADONAN_PANGSIT') $jenis = 'ADONAN';
        $machineNum = (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT);
        return $logsheet->date . '|' . $jenis . '|' . $machineNum . '|' . $logsheet->shift;
    }

    private function dispatchSyncBackground($options = [])
    {
        // Jalankan secara langsung (synchronous) agar tidak terpengaruh oleh 
        // limitasi LiteSpeed (app()->terminating diblokir) atau fungsi exec() yang dimatikan di Hostinger.
        try {
            Artisan::call('sync:google-sheets', $options);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Real-time sync error (Refrezing): ' . $e->getMessage());
        }
    }

    public function dashboardStats(Request $request)
    {
        extract($this->getCurrentShiftAndDate());

        $fromTime = $request->get('from_time', '00:00');
        $toTime   = $request->get('to_time',   '23:59');
        $queryDate = $request->get('date', $date);

        $products = ['siomay', 'pentol', 'lumpia', 'adonan_pangsit'];
        $machines = ['Refrezing 1', 'Refrezing 2', 'Refrezing 3']; // or just get distinct machines from DB

        // Wait, for Refrezing, the machine names could be anything, but we'll adapt later. 
        // Let's get distinct machines from DB that match the date
        $machines = \Illuminate\Support\Facades\DB::table('refrezing_logsheets')
            ->where('date', $queryDate)
            ->distinct()->pluck('machine')->toArray();
        if (empty($machines)) $machines = ['Refrezing 1', 'Refrezing 2'];

        $byMachine   = [];
        $grandTotal  = array_fill_keys($products, 0);

        foreach ($machines as $m) {
            $byMachine[$m] = array_fill_keys($products, 0);
        }

        $rows = \Illuminate\Support\Facades\DB::table('refrezing_logsheets as h')
            ->join('refrezing_logsheet_details as d', 'd.refrezing_logsheet_id', '=', 'h.id')
            ->select('h.machine', 'h.product_type', \Illuminate\Support\Facades\DB::raw('SUM(d.tray_count) as total'))
            ->where('h.date', $queryDate)
            ->where('d.time', '>=', $fromTime . ':00')
            ->where('d.time', '<=', $toTime . ':59')
            ->groupBy('h.machine', 'h.product_type')
            ->get();

        foreach ($rows as $row) {
            $pt = strtolower($row->product_type);
            $pt = str_replace('_t', '', $pt);
            $mc = $row->machine;
            if (isset($byMachine[$mc][$pt])) {
                $byMachine[$mc][$pt] += (int) $row->total;
                $grandTotal[$pt]    += (int) $row->total;
            } else if (isset($byMachine[$mc]) && !isset($byMachine[$mc][$pt])) {
                $byMachine[$mc][$pt] += (int) $row->total;
                $grandTotal[$pt] = ($grandTotal[$pt] ?? 0) + (int) $row->total;
            }
        }

        // Get unplanned stops for today
        $unplannedStops = [];
        $logsheetsWithStops = RefrezingLogsheet::where('date', $queryDate)
            ->whereNotNull('unplanned_stop')
            ->where('unplanned_stop', '!=', '-')
            ->where('unplanned_stop', '!=', '')
            ->with('details')
            ->get();

        foreach ($logsheetsWithStops as $ls) {
            $stops = array_filter(array_map('trim', explode(',', $ls->unplanned_stop)));
            $sortedDetails = $ls->details->sortBy('created_at')->values();

            foreach ($stops as $stopText) {
                $durationStr = 'Belum Selesai';
                if (preg_match('/^(\d{1,2}):(\d{2})/', $stopText, $matches)) {
                    $stopMin = (int)$matches[1] * 60 + (int)$matches[2];
                    $nextDetail = $sortedDetails->first(function ($d) use ($stopMin) {
                        $dt = new Carbon($d->created_at);
                        $dt->setTimezone('Asia/Jakarta');
                        $dm = (int)$dt->format('H') * 60 + (int)$dt->format('i');
                        $diff = $dm >= $stopMin ? $dm - $stopMin : $dm + 1440 - $stopMin;
                        return $diff >= 0 && $diff < 720;
                    });
                    if ($nextDetail) {
                        $parts = explode(':', $nextDetail->time);
                        if (count($parts) >= 2) {
                            $nextMin = (int)$parts[0] * 60 + (int)$parts[1];
                            $dur = $nextMin >= $stopMin ? $nextMin - $stopMin : $nextMin + 1440 - $stopMin;
                            $durationStr = $dur . ' menit';
                        }
                    }
                }
                
                $unplannedStops[] = [
                    'text' => $stopText,
                    'machine' => $ls->machine,
                    'shift' => $ls->shift,
                    'pic' => $ls->details->first()->pic ?? 'Unknown',
                    'duration' => $durationStr
                ];
            }
        }

        return response()->json([
            'by_machine' => $byMachine,
            'grand_total' => $grandTotal,
            'unplanned_stops' => $unplannedStops,
        ]);
    }

    public function adminIndex(Request $request)
    {
        extract($this->getCurrentShiftAndDate());
        $productionDate = $date;
        
        $logsheets = RefrezingLogsheet::with('details')
                        ->where('date', '>=', $productionDate)
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();
                        
        return Inertia::render('RefrezingLogsheet/Index', ['logsheets' => $logsheets]);
    }

    public function adminHistory(Request $request)
    {
        extract($this->getCurrentShiftAndDate());
        $productionDate = $date;
        
        $logsheets = RefrezingLogsheet::with('details')
                        ->where('date', '<', $productionDate)
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();
                        
        return Inertia::render('RefrezingLogsheet/History', ['logsheets' => $logsheets]);
    }

    public function updateDetail(Request $request, $id)
    {
        $detail = \App\Models\RefrezingLogsheetDetail::findOrFail($id);

        $request->validate([
            'tray_count' => 'required|integer|min:1',
            'time'       => 'nullable|string|max:8',
        ]);

        $timeValue = $detail->time;
        if ($request->filled('time')) {
            $t = $request->time;
            $timeValue = strlen($t) === 5 ? $t . ':00' : $t;
        }

        $oldCombo = $this->getComboKey($detail->refrezingLogsheet);

        $detail->update([
            'tray_count' => $request->tray_count,
            'time'       => $timeValue,
        ]);

        $options = [];
        if ($oldCombo) {
            $options['--force-recalc'] = [$oldCombo];
        }

        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Data berhasil diubah.');
    }

    public function destroyDetail($id)
    {
        if ($id < 0) {
            $logsheet = RefrezingLogsheet::find(abs($id));
            if ($logsheet) {
                $logsheet->update(['unplanned_stop' => null]);
                if ($logsheet->details()->count() === 0) {
                    $logsheet->delete();
                }
            }
            return redirect()->back()->with('success', 'Kendala berhasil dihapus.');
        }

        $detail = \App\Models\RefrezingLogsheetDetail::find($id);
        if (!$detail) {
            return redirect()->back()->with('error', 'Data tidak ditemukan.');
        }
        $comboKey = $this->getComboKey($detail->refrezingLogsheet);

        $logsheet = $detail->refrezingLogsheet;
        $detail->delete();

        if ($logsheet && $logsheet->details()->count() === 0 && (empty($logsheet->unplanned_stop) || $logsheet->unplanned_stop === '-')) {
            $logsheet->delete();
        }

        $options = [];
        if ($comboKey) {
            $options['--force-recalc'] = [$comboKey];
        }

        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Entri berhasil dihapus.');
    }

    public function operatorUpdateDetail(Request $request, $id)
    {
        $detail = \App\Models\RefrezingLogsheetDetail::findOrFail($id);

        $request->validate([
            'tray_count'   => 'required|integer|min:1',
            'batch_number' => 'nullable|integer|min:1',
            'rak'          => 'nullable|integer|min:1',
            'machine'      => 'nullable|string',
        ]);

        $oldCombo = $this->getComboKey($detail->refrezingLogsheet);

        $detail->update([
            'tray_count' => $request->tray_count,
            'rak'        => $request->filled('rak') ? $request->rak : $detail->rak,
        ]);

        // Update batch_number and/or machine on parent logsheet if provided
        if ($detail->refrezingLogsheet) {
            $parentUpdates = [];
            if ($request->filled('batch_number')) $parentUpdates['batch_number'] = $request->batch_number;
            if ($request->filled('machine'))      $parentUpdates['machine']      = $request->machine;
            if (!empty($parentUpdates)) $detail->refrezingLogsheet->update($parentUpdates);
        }

        $detail->refresh();
        $newCombo = $this->getComboKey($detail->refrezingLogsheet);

        $recalcs = array_unique(array_filter([$oldCombo, $newCombo]));
        $options = [];
        if (!empty($recalcs)) {
            $options['--force-recalc'] = array_values($recalcs);
        }

        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Data berhasil diubah.');
    }

    public function operatorDestroyDetail($id)
    {
        if ($id < 0) {
            $logsheet = RefrezingLogsheet::find(abs($id));
            if ($logsheet) {
                $logsheet->update(['unplanned_stop' => null]);
                if ($logsheet->details()->count() === 0) {
                    $logsheet->delete();
                }
            }
            return redirect()->back()->with('success', 'Kendala berhasil dihapus.');
        }

        $detail = \App\Models\RefrezingLogsheetDetail::find($id);
        if (!$detail) {
            return redirect()->back()->with('error', 'Data tidak ditemukan.');
        }
        $comboKey = $this->getComboKey($detail->refrezingLogsheet);

        $logsheet = $detail->refrezingLogsheet;
        $detail->delete();

        if ($logsheet && $logsheet->details()->count() === 0 && (empty($logsheet->unplanned_stop) || $logsheet->unplanned_stop === '-')) {
            $logsheet->delete();
        }

        $options = [];
        if ($comboKey) {
            $options['--force-recalc'] = [$comboKey];
        }

        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Entri berhasil dihapus.');
    }

    public function operatorLogsheet()
    {
        extract($this->getCurrentShiftAndDate());

        $logsheets = \App\Models\RefrezingLogsheet::with('details')
            ->where('date', $date)
            ->orderBy('shift')
            ->orderBy('machine')
            ->get();

        return Inertia::render('Operator/RefrezingLogsheet', ['logsheets' => $logsheets]);
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
            'batch_number' => $request->batch_number,
        ], [
            'planning_qty' => 0,
            'status' => 'ongoing'
        ]);

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
        $comboKey = $this->getComboKey($logsheet);
        $options = $comboKey ? ['--force-recalc' => [$comboKey]] : [];
        $this->dispatchSyncBackground($options);

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

        $logsheet = RefrezingLogsheet::where('date', $date)
            ->where('shift', $shift)
            ->where('product_type', $request->product_type)
            ->where('machine', $request->machine)
            ->latest('id')
            ->first();

        if (!$logsheet) {
            $logsheet = RefrezingLogsheet::create([
                'date' => $date,
                'shift' => $shift,
                'product_type' => $request->product_type,
                'machine' => $request->machine,
                'batch_number' => $request->batch_number ?? 1,
                'planning_qty' => 0,
                'status' => 'ongoing'
            ]);
        }

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
