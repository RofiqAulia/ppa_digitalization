<?php

namespace App\Http\Controllers;

use App\Models\IqfLogsheet;
use App\Models\IqfLogsheetDetail;
use App\Models\User;
use App\Jobs\PushIqfLogsheetToGoogleSheets;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IqfLogsheetController extends Controller
{
    public function dashboardStats(Request $request)
    {
        extract($this->getCurrentShiftAndDate());

        $fromTime = $request->get('from_time', '00:00');
        $toTime   = $request->get('to_time',   '23:59');
        $queryDate = $request->get('date', $date);

        $products = ['siomay', 'pentol', 'lumpia', 'adonan_pangsit'];
        $machines = ['IQF 1', 'IQF 2'];

        $byMachine   = [];
        $grandTotal  = array_fill_keys($products, 0);

        foreach ($machines as $m) {
            $byMachine[$m] = array_fill_keys($products, 0);
        }

        $rows = DB::table('iqf_logsheets as h')
            ->join('iqf_logsheet_details as d', 'd.iqf_logsheet_id', '=', 'h.id')
            ->select('h.machine', 'h.product_type', DB::raw('SUM(d.tray_count) as total'))
            ->where('h.date', $queryDate)
            ->where('d.time', '>=', $fromTime . ':00')
            ->where('d.time', '<=', $toTime . ':59')
            ->groupBy('h.machine', 'h.product_type')
            ->get();

        foreach ($rows as $row) {
            $pt = strtolower($row->product_type);
            $mc = $row->machine;
            if (isset($byMachine[$mc][$pt])) {
                $byMachine[$mc][$pt] = (int) $row->total;
                $grandTotal[$pt]    += (int) $row->total;
            }
        }

        $unplannedStopsData = [];
        $stopsQuery = IqfLogsheet::with('details')
            ->where('date', $queryDate)
            ->whereNotNull('unplanned_stop')
            ->where('unplanned_stop', '!=', '')
            ->where('unplanned_stop', '!=', '-')
            ->get();

        // Pre-load ALL details for this date grouped by machine
        // so we can find the "next input" across different product logsheets on the same machine
        $allLogsheetsByMachine = IqfLogsheet::with('details')
            ->where('date', $queryDate)
            ->get()
            ->groupBy('machine');

        // Build a flat sorted list of details per machine
        $detailsByMachine = [];
        foreach ($allLogsheetsByMachine as $machine => $logsheets) {
            $allDetails = collect();
            foreach ($logsheets as $ls) {
                foreach ($ls->details as $d) {
                    if ($d->created_at && $d->time) {
                        $allDetails->push($d);
                    }
                }
            }
            $detailsByMachine[$machine] = $allDetails->sortBy('created_at')->values();
        }

        foreach ($stopsQuery as $ls) {
            $stops = array_filter(array_map('trim', explode(',', $ls->unplanned_stop)));

            // Use all details for this machine (across all logsheets on same date)
            $machineSortedDetails = $detailsByMachine[$ls->machine] ?? collect();

            // Also keep same-logsheet details as fallback for PIC when stop has no resolution
            $sameLogsheetDetails = $ls->details->filter(fn($d) => $d->created_at && $d->time)
                                                ->sortBy('created_at')->values();

            foreach ($stops as $stopText) {
                if (preg_match('/^(\d{1,2}):(\d{2})/', $stopText, $matches)) {
                    $stopMin = (int)$matches[1] * 60 + (int)$matches[2];

                    // Find the first detail on THIS MACHINE (any logsheet) entered AFTER the stop time
                    $nextDetail = $machineSortedDetails->first(function($d) use ($stopMin) {
                        $wibTime = $d->created_at->setTimezone('Asia/Jakarta')->format('H:i');
                        [$h, $m] = explode(':', $wibTime);
                        $dmCreated = (int)$h * 60 + (int)$m;
                        $diff = $dmCreated >= $stopMin ? $dmCreated - $stopMin : $dmCreated + 1440 - $stopMin;
                        return $diff >= 0 && $diff < 720;
                    });

                    $duration = null;
                    if ($nextDetail) {
                        // Use the `time` field (operator-entered time) for duration calculation
                        [$th, $tm] = explode(':', substr($nextDetail->time, 0, 5));
                        $nextMin = (int)$th * 60 + (int)$tm;
                        $diffMin = $nextMin >= $stopMin ? $nextMin - $stopMin : $nextMin + 1440 - $stopMin;
                        $duration = $diffMin . ' menit';
                    } else {
                        $duration = 'Belum Selesai';
                    }

                    $pic = 'Unknown';
                    if ($nextDetail && $nextDetail->pic) {
                        $pic = $nextDetail->pic;
                    } else if ($sameLogsheetDetails->count() > 0) {
                        $pic = $sameLogsheetDetails->last()->pic;
                    }

                    $unplannedStopsData[] = [
                        'shift'    => $ls->shift,
                        'machine'  => $ls->machine,
                        'pic'      => $pic,
                        'text'     => $stopText,
                        'duration' => $duration,
                    ];
                }
            }
        }

        return response()->json([
            'date'        => $queryDate,
            'shift'       => $shift,
            'from_time'   => $fromTime,
            'to_time'     => $toTime,
            'by_machine'  => $byMachine,
            'grand_total' => $grandTotal,
            'unplanned_stops' => $unplannedStopsData,
        ]);
    }

    public function index(Request $request)
    {
        extract($this->getCurrentShiftAndDate());
        $productionDate = $date;
        
        $logsheets = IqfLogsheet::with('details')
                        ->where('date', '>=', $productionDate)
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();
                        
        return Inertia::render('IqfLogsheet/Index', ['logsheets' => $logsheets]);
    }

    public function operatorLogsheet(Request $request)
    {
        extract($this->getCurrentShiftAndDate());
        $productionDate = $date;

        $logsheets = IqfLogsheet::with('details')
                        ->where('date', '>=', $productionDate)
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();

        return Inertia::render('Operator/Logsheet', ['logsheets' => $logsheets]);
    }

    public function tableOnly(Request $request)
    {
        $logsheets = IqfLogsheet::with('details')
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();
                        
        return Inertia::render('IqfLogsheet/TableOnly', ['logsheets' => $logsheets]);
    }

    public function history(Request $request)
    {
        extract($this->getCurrentShiftAndDate());
        $productionDate = $date;
        
        $logsheets = IqfLogsheet::with('details')
                        ->where('date', '<', $productionDate)
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();
                        
        return Inertia::render('IqfLogsheet/History', ['logsheets' => $logsheets]);
    }

    public function adminIndex(Request $request)
    {
        extract($this->getCurrentShiftAndDate());
        $productionDate = $date;
        
        $logsheets = IqfLogsheet::with('details')
                        ->where('date', '>=', $productionDate)
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();
                        
        return Inertia::render('IqfLogsheet/Index', ['logsheets' => $logsheets]);
    }

    public function adminHistory(Request $request)
    {
        extract($this->getCurrentShiftAndDate());
        $productionDate = $date;
        
        $logsheets = IqfLogsheet::with('details')
                        ->where('date', '<', $productionDate)
                        ->orderBy('date', 'desc')
                        ->orderBy('shift', 'desc')
                        ->orderBy('machine', 'asc')
                        ->get();
                        
        return Inertia::render('IqfLogsheet/History', ['logsheets' => $logsheets]);
    }

    public function create()
    {
        return Inertia::render('IqfLogsheet/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'shift' => 'required|integer|in:1,2,3',
            'product_type' => 'required|string',
            'machine' => 'required|string|in:IQF 1,IQF 2',
            'batch_number' => 'nullable|integer',
            'planning_qty' => 'required|integer|min:0',
        ]);

        IqfLogsheet::create($request->all());

        return redirect()->route('logsheet-iqf.index')->with('success', 'Logsheet berhasil dibuat.');
    }

    public function show(IqfLogsheet $iqfLogsheet)
    {
        $iqfLogsheet->load('details');
        return Inertia::render('IqfLogsheet/Show', ['iqfLogsheet' => $iqfLogsheet]);
    }

    public function storeDetail(Request $request, IqfLogsheet $iqfLogsheet)
    {
        $request->validate([
            'tray_count' => 'required|integer|min:1',
        ]);

        // Validation removed for new rack-based format
        $trayCount = $request->tray_count;

        $detail = $iqfLogsheet->details()->create([
            'time' => Carbon::now('Asia/Jakarta')->format('H:i:s'),
            'suhu_panel' => $request->suhu_panel,
            'suhu_produk' => $request->suhu_produk,
            'rak' => $request->rak,
            'tray_count' => $trayCount,
            'pic' => session('operator_name', 'Unknown'),
        ]);

        // Trigger sync ke Google Sheets secara real-time
        $this->dispatchSyncBackground();

        return response()->json([
            'success' => 'Data berhasil disimpan.',
            'detail' => $detail,
            'total_achieve' => $iqfLogsheet->details()->sum('tray_count')
        ]);
    }

    public function updateDetail(Request $request, $id)
    {
        $detail = IqfLogsheetDetail::findOrFail($id);
        
        $detail->update([
            'time' => $request->time ?? $detail->time,
            'suhu_panel' => $request->suhu_panel,
            'suhu_produk' => $request->suhu_produk,
            'rak' => $request->rak,
            'tray_count' => $request->tray_count,
        ]);

        $logsheet = $detail->iqfLogsheet;
        $comboKey = null;
        if ($logsheet) {
            $comboKey = $logsheet->date . '|' . strtoupper($logsheet->product_type) . '|' . (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $logsheet->shift;
            
            $logsheet->update([
                'batch_number' => $request->batch_number,
                'unplanned_stop' => $request->unplanned_stop,
            ]);

            // Bulk update PIC for all details with same date, shift, machine
            if ($request->has('pic')) {
                $logsheetIds = IqfLogsheet::where('date', $logsheet->date)
                                        ->where('shift', $logsheet->shift)
                                        ->where('machine', $logsheet->machine)
                                        ->pluck('id');
                IqfLogsheetDetail::whereIn('iqf_logsheet_id', $logsheetIds)
                                 ->update(['pic' => $request->pic]);
            }
        }

        // Trigger sync ke Google Sheets secara real-time
        $options = [];
        if ($comboKey) {
            $options['--force-recalc'] = [$comboKey];
        }
        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Detail baris berhasil diupdate.');
    }

    public function destroyDetail($id)
    {
        $detail = IqfLogsheetDetail::findOrFail($id);
        $logsheet = $detail->iqfLogsheet;
        $comboKey = null;

        if ($logsheet && !$logsheet->canBeEdited()) {
            return redirect()->back()->with('error', 'Data ini tidak bisa diedit karena sudah lebih dari 24 jam sejak diinputkan.');
        }

        if ($logsheet) {
            $comboKey = $logsheet->date . '|' . strtoupper($logsheet->product_type) . '|' . (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $logsheet->shift;
        }

        $detail->delete();

        // Trigger sync ke Google Sheets secara real-time
        $options = [];
        if ($comboKey) {
            $options['--force-recalc'] = [$comboKey];
        }
        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Detail baris berhasil dihapus.');
    }

    public function kiosk()
    {
        return Inertia::render('IqfLogsheet/Kiosk');
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
        $logsheet = IqfLogsheet::firstOrCreate([
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

        $trayCount = $request->tray_count;
        // Validation removed for new rack-based format

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
        $allLogsheets = IqfLogsheet::where('date', $date)
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

    public function edit(IqfLogsheet $iqfLogsheet)
    {
        if (!$iqfLogsheet->canBeEdited()) {
            return redirect()->route('logsheet-iqf.index')->with('error', 'Data ini tidak bisa diedit karena sudah lebih dari 24 jam sejak diinputkan.');
        }

        return Inertia::render('IqfLogsheet/Edit', ['iqfLogsheet' => $iqfLogsheet]);
    }

    public function update(Request $request, IqfLogsheet $iqfLogsheet)
    {
        if (!$iqfLogsheet->canBeEdited()) {
            return back()->withInput()->with('error', 'Data ini tidak bisa diedit karena sudah lebih dari 24 jam sejak diinputkan.');
        }

        $request->validate([
            'date' => 'required|date',
            'shift' => 'required|integer|in:1,2,3',
            'product_type' => 'required|string',
            'machine' => 'required|string|in:IQF 1,IQF 2',
            'batch_number' => 'nullable|string',
            'planning_qty' => 'required|integer|min:0',
            'unplanned_stop' => 'nullable|string',
            'status' => 'required|string|in:ongoing,completed'
        ]);

        $oldCombo = $iqfLogsheet->date . '|' . strtoupper($iqfLogsheet->product_type) . '|' . (int) filter_var($iqfLogsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $iqfLogsheet->shift;

        $iqfLogsheet->update($request->all());

        $newCombo = $iqfLogsheet->date . '|' . strtoupper($iqfLogsheet->product_type) . '|' . (int) filter_var($iqfLogsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $iqfLogsheet->shift;

        $recalcs = [];
        if ($oldCombo) $recalcs[] = $oldCombo;
        if ($newCombo && $newCombo !== $oldCombo) $recalcs[] = $newCombo;

        $options = [];
        if (!empty($recalcs)) {
            $options['--force-recalc'] = $recalcs;
        }
        $this->dispatchSyncBackground($options);

        return redirect()->route('logsheet-iqf.index')->with('success', 'Logsheet berhasil diupdate.');
    }

    public function storeUnplannedStop(Request $request)
    {
        $request->validate([
            'product_type' => 'required|string',
            'machine' => 'required|string',
            'unplanned_stop' => 'required|string',
        ]);

        extract($this->getCurrentShiftAndDate());

        $logsheet = IqfLogsheet::firstOrCreate([
            'date' => $date,
            'shift' => $shift,
            'product_type' => $request->product_type,
            'machine' => $request->machine,
            'batch_number' => $request->batch_number ?? '',
        ], [
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
                // Avoid duplicating exact same string
                if (!str_contains($existingStop, $newStop)) {
                    $logsheet->update(['unplanned_stop' => $existingStop . ', ' . $newStop]);
                }
            } else {
                $logsheet->update(['unplanned_stop' => $newStop]);
            }
        }

        return response()->json(['success' => true]);
    }

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

    public function operatorLogin(Request $request)
    {
        return Inertia::render('Operator/Login');
    }

    public function operatorAuthenticate(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user && $user->role === 'operator') {
            session(['operator_name' => $user->name]);
            return redirect()->route('operator.landing');
        }

        if ($user && $user->role === 'admin') {
            return back()->withErrors(['email' => 'Akun ini adalah akun Admin Panel. Silakan login melalui /login.']);
        }

        return back()->withErrors(['email' => 'Email tidak ditemukan di sistem.']);
    }

    public function operatorUpdateDetail(Request $request, $id)
    {
        $detail = IqfLogsheetDetail::findOrFail($id);

        $request->validate([
            'tray_count'   => 'required|integer|min:1',
            'batch_number' => 'nullable|integer|min:1',
            'rak'          => 'nullable|integer|min:1',
            'machine'      => 'nullable|string|in:IQF 1,IQF 2',
        ]);

        $detail->update([
            'tray_count' => $request->tray_count,
            'rak'        => $request->filled('rak') ? $request->rak : $detail->rak,
        ]);

        // Update batch_number and/or machine on parent logsheet if provided
        if ($detail->iqfLogsheet) {
            $parentUpdates = [];
            if ($request->filled('batch_number')) $parentUpdates['batch_number'] = $request->batch_number;
            if ($request->filled('machine'))      $parentUpdates['machine']      = $request->machine;
            if (!empty($parentUpdates)) $detail->iqfLogsheet->update($parentUpdates);
        }

        $this->dispatchSyncBackground();

        return redirect()->back()->with('success', 'Data berhasil diubah.');
    }

    public function operatorDestroyDetail($id)
    {
        $detail = IqfLogsheetDetail::findOrFail($id);
        $logsheet = $detail->iqfLogsheet;

        $detail->delete();

        // Trigger sync
        if ($logsheet) {
            $comboKey = $logsheet->date . '|' . strtoupper($logsheet->product_type) . '|' . (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $logsheet->shift;
            $this->dispatchSyncBackground(['--force-recalc' => [$comboKey]]);
        } else {
            $this->dispatchSyncBackground();
        }

        return redirect()->back()->with('success', 'Entri berhasil dihapus.');
    }

    public function operatorLogout(Request $request)
    {
        session()->forget('operator_name');
        return redirect()->route('operator.login');
    }

    private function dispatchSyncBackground($options = [])
    {
        // Jalankan secara langsung (synchronous) agar tidak terpengaruh oleh 
        // limitasi LiteSpeed (app()->terminating diblokir) atau fungsi exec() yang dimatikan di Hostinger.
        try {
            \Illuminate\Support\Facades\Artisan::call('sync:google-sheets', $options);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Real-time sync error: ' . $e->getMessage());
        }
    }
}
