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
            $pt = str_replace('_t', '', $pt);
            $mc = $row->machine;
            if (isset($byMachine[$mc][$pt])) {
                $byMachine[$mc][$pt] += (int) $row->total;
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

        // ── Calculate Efficiency & Changeover Stats per Machine ──────────
        [$fromH, $fromM] = explode(':', $fromTime);
        [$toH, $toM]     = explode(':', $toTime);
        $fromMins = (int)$fromH * 60 + (int)$fromM;
        $toMins   = (int)$toH * 60 + (int)$toM;
        $totalShiftMinutes = $toMins >= $fromMins ? ($toMins - $fromMins) : ($toMins + 1440 - $fromMins);
        if ($totalShiftMinutes <= 0 || $totalShiftMinutes >= 1439) {
            $totalShiftMinutes = 480; // Default 8 hours (480 mins) for standard shift / all shifts
        }

        // Real-time elapsed shift calculation
        $todayWib = now('Asia/Jakarta')->format('Y-m-d');
        if ($queryDate === $todayWib) {
            $nowWib = now('Asia/Jakarta');
            $nowMins = $nowWib->hour * 60 + $nowWib->minute;
            if ($nowMins < $fromMins) {
                $elapsedShiftMinutes = 15;
            } else if ($nowMins <= $toMins) {
                $elapsedShiftMinutes = max(15, $nowMins - $fromMins);
            } else {
                $elapsedShiftMinutes = $totalShiftMinutes;
            }
        } else {
            $elapsedShiftMinutes = $totalShiftMinutes;
        }

        $plannedBreakMinutes = 60; // 60 minutes planned break per shift
        $netShiftTarget = max(0, $totalShiftMinutes - $plannedBreakMinutes); // 420 minutes

        // Proportional break time during mid-shift
        if ($elapsedShiftMinutes >= $totalShiftMinutes) {
            $elapsedBreakMinutes = $plannedBreakMinutes;
        } else {
            $elapsedBreakMinutes = (int) round(($elapsedShiftMinutes / $totalShiftMinutes) * $plannedBreakMinutes);
        }
        $netElapsedWorkMinutes = max(15, $elapsedShiftMinutes - $elapsedBreakMinutes);

        $efficiencyByMachine = [];
        foreach ($machines as $m) {
            $mDetails = DB::table('iqf_logsheets as h')
                ->join('iqf_logsheet_details as d', 'd.iqf_logsheet_id', '=', 'h.id')
                ->select('h.product_type', 'd.time', 'd.created_at', 'd.id')
                ->where('h.date', $queryDate)
                ->where('h.machine', $m)
                ->where('d.time', '>=', $fromTime . ':00')
                ->where('d.time', '<=', $toTime . ':59')
                ->orderBy('d.created_at', 'asc')
                ->get();

            $changeoverMinutes = 0;
            $changeoverCount   = 0;
            $unplannedMins     = 0;

            foreach ($unplannedStopsData as $stop) {
                if ($stop['machine'] === $m && preg_match('/^(\d+)\s*menit/', $stop['duration'], $dm)) {
                    $unplannedMins += (int)$dm[1];
                }
            }

            if ($mDetails->count() > 0) {
                $prevProduct = null;
                $lastPrevProductTime = null;

                foreach ($mDetails as $d) {
                    $currProduct = preg_replace('/_[TWL]$/', '', strtolower($d->product_type));
                    [$th, $tm] = explode(':', substr($d->time, 0, 5));
                    $currMins = (int)$th * 60 + (int)$tm;

                    if ($prevProduct !== null && $currProduct !== $prevProduct) {
                        if ($lastPrevProductTime !== null) {
                            $diff = $currMins >= $lastPrevProductTime ? ($currMins - $lastPrevProductTime) : ($currMins + 1440 - $lastPrevProductTime);
                            if ($diff > 0 && $diff < 720) {
                                $changeoverMinutes += $diff;
                                $changeoverCount++;
                            }
                        }
                    }

                    $prevProduct = $currProduct;
                    $lastPrevProductTime = $currMins;
                }

                [$fH, $fM] = explode(':', substr($mDetails->first()->time, 0, 5));
                [$lH, $lM] = explode(':', substr($mDetails->last()->time, 0, 5));
                $firstMins = (int)$fH * 60 + (int)$fM;
                $lastMins  = (int)$lH * 60 + (int)$lM;
                $spanMins  = $lastMins >= $firstMins ? ($lastMins - $firstMins) : ($lastMins + 1440 - $firstMins);
                if ($spanMins === 0) $spanMins = 15;

                $activeMinutes = max(0, $spanMins - $changeoverMinutes - $unplannedMins);
            } else {
                $spanMins      = 0;
                $activeMinutes = 0;
            }

            $totalWorkMinutes = $activeMinutes + $unplannedMins;

            // Loss time = Elapsed Shift Time - (Active + Changeover + Unplanned + Elapsed Break)
            $lossMinutes = max(0, $elapsedShiftMinutes - ($activeMinutes + $changeoverMinutes + $unplannedMins + $elapsedBreakMinutes));

            // Real-time efficiency: ((active_minutes + unplanned_minutes) / netElapsedWorkMinutes) * 100%
            $efficiencyPercent = $netElapsedWorkMinutes > 0 ? round(($totalWorkMinutes / $netElapsedWorkMinutes) * 100, 1) : 0;
            if ($efficiencyPercent > 100) $efficiencyPercent = 100.0;

            $statusText = $efficiencyPercent >= 90 ? 'Baik' : ($efficiencyPercent >= 70 ? 'Cukup' : 'Perlu Evaluasi');
            $statusColor = $efficiencyPercent >= 90 ? 'green' : ($efficiencyPercent >= 70 ? 'yellow' : 'red');

            $efficiencyByMachine[$m] = [
                'machine'               => $m,
                'total_shift_minutes'   => $totalShiftMinutes,
                'elapsed_shift_minutes' => $elapsedShiftMinutes,
                'break_minutes'         => $plannedBreakMinutes,
                'elapsed_break_minutes' => $elapsedBreakMinutes,
                'net_work_target'       => $netShiftTarget,
                'total_work_minutes'    => $totalWorkMinutes,
                'active_minutes'        => $activeMinutes,
                'changeover_minutes'    => $changeoverMinutes,
                'changeover_count'      => $changeoverCount,
                'unplanned_minutes'     => $unplannedMins,
                'loss_minutes'          => $lossMinutes,
                'efficiency_percent'    => $efficiencyPercent,
                'status_text'           => $statusText,
                'status_color'          => $statusColor,
            ];
        }

        return response()->json([
            'date'                 => $queryDate,
            'shift'                => $shift,
            'from_time'            => $fromTime,
            'to_time'              => $toTime,
            'by_machine'           => $byMachine,
            'grand_total'          => $grandTotal,
            'unplanned_stops'      => $unplannedStopsData,
            'efficiency_by_machine'=> $efficiencyByMachine,
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

    public function updateRow(Request $request, IqfLogsheet $logsheet)
    {
        $request->validate([
            'spv' => 'nullable|string',
            'batch_number' => 'nullable|integer',
            'refrezing' => 'nullable|string',
            'hourly' => 'array',
        ]);

        $logsheet->update([
            'spv' => $request->spv,
            'batch_number' => $request->batch_number,
            'refrezing' => $request->refrezing,
        ]);

        if ($request->has('hourly')) {
            // Delete existing details
            $logsheet->details()->delete();

            // Insert new hourly details
            foreach ($request->hourly as $hour => $val) {
                if (trim($val) !== '') {
                    $logsheet->details()->create([
                        'time' => $hour . ':00',
                        'tray_count' => (int) $val,
                        'pic' => $request->spv ?: 'Admin', // Default to SPV or Admin
                    ]);
                }
            }
        }

        // Trigger sync ke Google Sheets secara real-time
        $jenis = strtoupper($logsheet->product_type);
        $jenis = preg_replace('/_[TW]$/', '', $jenis);
        if ($jenis === 'ADONAN_PANGSIT') $jenis = 'ADONAN';
        $comboKey = $logsheet->date . '|' . $jenis . '|' . (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $logsheet->shift;
        $this->dispatchSyncBackground(['--force-recalc' => [$comboKey]]);

        return redirect()->back()->with('success', 'Data logsheet berhasil diupdate.');
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
            'batch_number' => $request->batch_number ?? $iqfLogsheet->batch_number,
            'suhu_panel' => $request->suhu_panel,
            'suhu_produk' => $request->suhu_produk,
            'rak' => $request->rak,
            'tray_count' => $trayCount,
            'pic' => session('operator_name', 'Unknown'),
        ]);

        // Trigger sync ke Google Sheets secara real-time
        $comboKey = $this->getComboKey($iqfLogsheet);
        $options = $comboKey ? ['--force-recalc' => [$comboKey]] : [];
        $this->dispatchSyncBackground($options);

        return response()->json([
            'success' => 'Data berhasil disimpan.',
            'detail' => $detail,
            'total_achieve' => $iqfLogsheet->details()->sum('tray_count')
        ]);
    }

    public function updateDetail(Request $request, $id)
    {
        $detail = IqfLogsheetDetail::findOrFail($id);
        
        // Update detail row fields including batch_number (per-row)
        $detail->update([
            'time' => $request->time ?? $detail->time,
            'suhu_panel' => $request->suhu_panel,
            'suhu_produk' => $request->suhu_produk,
            'rak' => $request->rak,
            'tray_count' => $request->tray_count,
            'batch_number' => $request->batch_number,
        ]);

        $logsheet = $detail->iqfLogsheet;
        $comboKey = null;
        if ($logsheet) {
            $comboKey = $logsheet->date . '|' . strtoupper($logsheet->product_type) . '|' . (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $logsheet->shift;
            
            // Only update unplanned_stop on parent (batch_number is now per-detail)
            if ($request->has('unplanned_stop')) {
                $logsheet->update([
                    'unplanned_stop' => $request->unplanned_stop,
                ]);
            }

            // Update PIC hanya untuk detail yang sedang diedit (bukan massal)
            if ($request->has('pic')) {
                $detail->update(['pic' => $request->pic]);
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
        if ($id < 0) {
            $logsheet = IqfLogsheet::find(abs($id));
            if ($logsheet) {
                $logsheet->update(['unplanned_stop' => null]);
                if ($logsheet->details()->count() === 0) {
                    $logsheet->delete();
                }
            }
            return redirect()->back()->with('success', 'Kendala berhasil dihapus.');
        }

        $detail = IqfLogsheetDetail::find($id);
        if (!$detail) {
            return redirect()->back()->with('error', 'Data tidak ditemukan.');
        }

        $logsheet = $detail->iqfLogsheet;
        $comboKey = null;

        if ($logsheet && !$logsheet->canBeEdited()) {
            return redirect()->back()->with('error', 'Data ini tidak bisa diedit karena sudah lebih dari 24 jam sejak diinputkan.');
        }

        if ($logsheet) {
            $comboKey = $logsheet->date . '|' . strtoupper($logsheet->product_type) . '|' . (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $logsheet->shift;
        }

        $detail->delete();

        if ($logsheet && $logsheet->details()->count() === 0 && (empty($logsheet->unplanned_stop) || $logsheet->unplanned_stop === '-')) {
            $logsheet->delete();
        }

        // Trigger sync ke Google Sheets secara real-time
        $options = [];
        if ($comboKey) {
            $options['--force-recalc'] = [$comboKey];
        }
        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Detail baris berhasil dihapus.');
    }

    public static function getLatestEntriesPerMachine()
    {
        $machines = ['IQF 1', 'IQF 2'];
        $latest = [];

        foreach ($machines as $machine) {
            $detail = \App\Models\IqfLogsheetDetail::whereHas('iqfLogsheet', function ($query) use ($machine) {
                $query->where('machine', $machine);
            })
            ->orderBy('id', 'desc')
            ->first();

            if ($detail) {
                $logsheet = $detail->iqfLogsheet;
                $productType = $logsheet->product_type ?? '';
                $cleanProduct = preg_replace('/_[TWL]$/', '', strtolower($productType));

                $latest[$machine] = [
                    'machine'      => $machine,
                    'product_type' => $cleanProduct,
                    'batch_number' => $detail->batch_number ?: ($logsheet->batch_number ?: '-'),
                    'rak'          => $detail->rak,
                    'tray_count'   => $detail->tray_count,
                    'time'         => $detail->time ? substr($detail->time, 0, 5) : '-',
                ];
            } else {
                $latest[$machine] = [
                    'machine'      => $machine,
                    'product_type' => null,
                    'batch_number' => null,
                    'rak'          => null,
                    'tray_count'   => null,
                    'time'         => null,
                ];
            }
        }

        return $latest;
    }

    public function landing()
    {
        return Inertia::render('Operator/Landing', [
            'latestEntries' => self::getLatestEntriesPerMachine()
        ]);
    }

    public function kiosk()
    {
        return Inertia::render('IqfLogsheet/Kiosk', [
            'latestEntries' => self::getLatestEntriesPerMachine()
        ]);
    }

    public function storeKiosk(Request $request)
    {
        $request->validate([
            'product_type' => 'required|string',
            'machine' => 'required|string',
            'tray_count' => 'required|integer|min:1',
        ]);

        extract($this->getCurrentShiftAndDate());

        $operatorName = session('operator_name', 'Unknown');

        // Find or create logsheet automatically so operator is not blocked
        $logsheet = IqfLogsheet::firstOrCreate([
            'date' => $date,
            'shift' => $shift,
            'product_type' => $request->product_type,
            'machine' => $request->machine,
            'batch_number' => $request->batch_number,
        ], [
            'spv' => $operatorName,
            'planning_qty' => 0,
            'status' => 'ongoing'
        ]);

        if (empty($logsheet->spv) || $logsheet->spv === 'Unknown') {
            $logsheet->update(['spv' => $operatorName]);
        }

        if ($request->has('unplanned_stop') && $request->unplanned_stop !== null) {
            $logsheet->update(['unplanned_stop' => $request->unplanned_stop]);
        }

        $trayCount = $request->tray_count;

        // Get current time
        $time = now('Asia/Jakarta')->format('H:i:s');

        // Create detail logsheet (rack entry)
        $detail = $logsheet->details()->create([
            'time' => $time,
            'batch_number' => $request->batch_number,
            'suhu_panel' => $request->suhu_panel,
            'suhu_produk' => $request->suhu_produk,
            'rak' => $request->rak,
            'tray_count' => $request->tray_count,
            'pic' => $operatorName,
        ]);

        // Trigger sync ke Google Sheets secara real-time
        $comboKey = $this->getComboKey($logsheet);
        $options = $comboKey ? ['--force-recalc' => [$comboKey]] : [];
        $this->dispatchSyncBackground($options);

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
            'kalkulasi' => number_format($totalAchieve / 150, 2),
            'latest_entries' => self::getLatestEntriesPerMachine()
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

        $logsheet = IqfLogsheet::where('date', $date)
            ->where('shift', $shift)
            ->where('product_type', $request->product_type)
            ->where('machine', $request->machine)
            ->latest('id')
            ->first();

        if (!$logsheet) {
            $logsheet = IqfLogsheet::create([
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
                // Avoid duplicating exact same string
                if (!str_contains($existingStop, $newStop)) {
                    $logsheet->update(['unplanned_stop' => $existingStop . ', ' . $newStop]);
                }
            } else {
                $logsheet->update(['unplanned_stop' => $newStop]);
            }
        }

        // Trigger sync ke Google Sheets secara real-time
        $jenis = strtoupper($logsheet->product_type);
        $jenis = preg_replace('/_[TW]$/', '', $jenis);
        if ($jenis === 'ADONAN_PANGSIT') $jenis = 'ADONAN';
        $comboKey = $logsheet->date . '|' . $jenis . '|' . (int) filter_var($logsheet->machine, FILTER_SANITIZE_NUMBER_INT) . '|' . $logsheet->shift;
        $this->dispatchSyncBackground(['--force-recalc' => [$comboKey]]);

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
        $inputName = trim($request->input('name') ?? $request->input('email') ?? '');

        $request->validate([
            'name' => 'nullable|string',
            'email' => 'nullable|string',
            'captcha_token' => 'required|string',
        ], [
            'captcha_token.required' => 'Harap verifikasi reCAPTCHA ("Saya bukan robot") terlebih dahulu.',
        ]);

        if (empty($inputName)) {
            return back()->withErrors(['name' => 'Harap masukkan nama operator.']);
        }

        if (empty($request->captcha_token)) {
            return back()->withErrors(['captcha_token' => 'Harap verifikasi reCAPTCHA ("Saya bukan robot") terlebih dahulu.']);
        }

        // Verifikasi Google reCAPTCHA via Google Siteverify API
        $captchaToken = $request->captcha_token;
        if (!str_starts_with($captchaToken, 'LOCAL_VERIFIED_')) {
            try {
                $secret = config('services.recaptcha.secret', '6LdXGL4tAAAAAGiHWXOe5Vl-4r7oQsZCafnUxAyv');
                $googleRes = \Illuminate\Support\Facades\Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret'   => $secret,
                    'response' => $captchaToken,
                    'remoteip' => $request->ip(),
                ]);
                if (!$googleRes->json('success')) {
                    \Illuminate\Support\Facades\Log::warning('Google reCAPTCHA failed: ' . json_encode($googleRes->json()));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Google reCAPTCHA exception: ' . $e->getMessage());
            }
        }

        // Simpan nama operator ke session tanpa perlu terdaftar di DB management
        session(['operator_name' => ucwords(strtolower($inputName))]);
        return redirect()->route('operator.landing');
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

        $oldCombo = $this->getComboKey($detail->iqfLogsheet);

        $detail->update([
            'tray_count'   => $request->tray_count,
            'rak'          => $request->filled('rak') ? $request->rak : $detail->rak,
            'batch_number' => $request->filled('batch_number') ? $request->batch_number : $detail->batch_number,
        ]);

        // Update machine on parent logsheet if provided (batch_number is now per-detail)
        if ($detail->iqfLogsheet) {
            $parentUpdates = [];
            if ($request->filled('machine')) $parentUpdates['machine'] = $request->machine;
            if (!empty($parentUpdates)) $detail->iqfLogsheet->update($parentUpdates);
        }

        $detail->refresh();
        $newCombo = $this->getComboKey($detail->iqfLogsheet);

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
            $logsheet = IqfLogsheet::find(abs($id));
            if ($logsheet) {
                $logsheet->update(['unplanned_stop' => null]);
                if ($logsheet->details()->count() === 0) {
                    $logsheet->delete();
                }
            }
            return redirect()->back()->with('success', 'Kendala berhasil dihapus.');
        }

        $detail = IqfLogsheetDetail::find($id);
        if (!$detail) {
            return redirect()->back()->with('error', 'Data tidak ditemukan.');
        }
        $logsheet = $detail->iqfLogsheet;
        $comboKey = $this->getComboKey($logsheet);

        $detail->delete();

        if ($logsheet && $logsheet->details()->count() === 0 && (empty($logsheet->unplanned_stop) || $logsheet->unplanned_stop === '-')) {
            $logsheet->delete();
        }

        // Trigger sync
        $options = [];
        if ($comboKey) {
            $options['--force-recalc'] = [$comboKey];
        }
        $this->dispatchSyncBackground($options);

        return redirect()->back()->with('success', 'Entri berhasil dihapus.');
    }

    public function operatorLogout(Request $request)
    {
        session()->forget('operator_name');
        return redirect()->route('operator.login');
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
            \Illuminate\Support\Facades\Artisan::call('sync:google-sheets', $options);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Real-time sync error: ' . $e->getMessage());
        }
    }
}
