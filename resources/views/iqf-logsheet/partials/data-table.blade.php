
        @if(session('success'))
            <div class="mb-4 bg-cyan-50 border border-cyan-200 text-cyan-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{{ session('success') }}</span>
                </div>
                <button onclick="this.parentElement.remove()" class="text-cyan-600 hover:text-cyan-900 font-bold">&times;</button>
            </div>
        @endif

        @php
            $grouped = collect($logsheets)
                ->groupBy('date')
                ->map(function($dateGroup) {
                    return $dateGroup->groupBy('shift')->map(function($shiftGroup) {
                        return $shiftGroup->groupBy('machine');
                    });
                });
        @endphp

        @if($logsheets->isEmpty())
            <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center my-auto max-w-md mx-auto">
                <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 class="text-lg font-extrabold text-slate-700">Belum Ada Data Logsheet</h3>
                <p class="text-xs text-slate-500 mt-1">Silakan lakukan pengisian melalui Terminal Operator Kiosk.</p>
            </div>
        @else
            <!-- Clean Light Minimal Matrix Spreadsheet Table -->
            <div class="flex-1 overflow-auto w-full custom-scrollbar rounded-xl border border-slate-200/80 bg-white">
                <table class="w-max min-w-full text-center border-collapse whitespace-nowrap text-xs select-none exportable-table" id="masterTable">
                    <thead class="sticky top-0 z-30 bg-slate-100 border-b border-slate-200 text-[11px] font-semibold">
                        <!-- Category Block Group Headers -->
                        <tr>
                            <th rowspan="2" class="w-10 px-3 py-3 border-b border-slate-200 border-r border-r-slate-200 text-slate-500 font-bold text-center bg-slate-100">#</th>
                            <th rowspan="2" class="px-4 py-3 border-b border-slate-200 border-r border-r-slate-200 text-slate-700 font-bold bg-slate-100">PIC</th>
                            <th rowspan="2" class="px-4 py-3 border-b border-slate-200 border-r border-r-slate-200 text-slate-700 font-bold bg-slate-100">Tanggal</th>
                            <th rowspan="2" class="px-4 py-3 border-b border-slate-200 border-r border-r-slate-200 text-slate-700 font-bold bg-slate-100">Shift</th>
                            <th rowspan="2" class="px-4 py-3 border-b border-slate-200 border-r border-r-slate-200 text-slate-700 font-bold bg-slate-100">IQF</th>
                            
                            <th colspan="6" class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 font-black tracking-wide uppercase" style="background-color: #e0f2fe; color: #0369a1;">SIOMAY</th>
                            <th colspan="6" class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 font-black tracking-wide uppercase" style="background-color: #ffe4e6; color: #be123c;">PENTOL</th>
                            <th colspan="6" class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 font-black tracking-wide uppercase" style="background-color: #ecfeff; color: #0891b2;">LUMPIA</th>
                            <th colspan="6" class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 font-black tracking-wide uppercase" style="background-color: #fdf4ff; color: #a21caf;">ADONAN PANGSIT</th>
                            <th rowspan="2" class="px-4 py-3 border-b border-slate-200 font-bold min-w-[200px]" style="background-color: #fef2f2; color: #dc2626;">UNPLANNED STOP</th>
                        </tr>
                        <!-- Sub Column Headers -->
                        <tr class="text-[10px] font-semibold border-b border-slate-200 bg-slate-50">
                            <!-- Siomay -->
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rak</th>
                            <th class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 text-cyan-700 font-bold w-[80px]">Loyang</th>
                            <!-- Pentol -->
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rak</th>
                            <th class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 text-pink-700 font-bold w-[80px]">Loyang</th>
                            <!-- Lumpia -->
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rongga</th>
                            <th class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 text-sky-700 font-bold w-[85px]">Pack</th>
                            <!-- Adonan -->
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th class="px-3 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rongga</th>
                            <th class="px-3 py-2 border-b border-slate-200 border-r border-r-slate-200 text-fuchsia-700 font-bold w-[85px]">Pack</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700" id="tableBody">
                        @php
                            $tot_s_loyang = 0;
                            $tot_p_loyang = 0;
                            $tot_l_loyang = 0;
                            $tot_a_loyang = 0;
                            $rowCounter = 1;
                        @endphp

                        @foreach($grouped as $date => $shifts)
                            @foreach($shifts as $shift => $machines)
                                @foreach($machines as $machine => $machineLogsheets)
                                    @php
                                        $siomay = $machineLogsheets->where('product_type', 'siomay')->first();
                                        $pentol = $machineLogsheets->where('product_type', 'pentol')->first();
                                        $lumpia = $machineLogsheets->where('product_type', 'lumpia')->first();
                                        $adonan = $machineLogsheets->where('product_type', 'adonan_pangsit')->first();
                                        
                                        $unplannedStops = $machineLogsheets->pluck('unplanned_stop')
                                            ->filter(fn($val) => !empty(trim($val)))
                                            ->unique()
                                            ->implode(', ');

                                        $raks = collect([]);
                                        foreach([$siomay, $pentol, $lumpia, $adonan] as $ls) {
                                            if ($ls && $ls->details) {
                                                $raks = $raks->concat($ls->details->pluck('rak')->map(fn($r) => $r ?: 1));
                                            }
                                        }
                                        $maxRak = $raks->max() ?? 0;
                                        if ($maxRak == 0) $maxRak = 1;
                                    @endphp

                                    @for($rak = 1; $rak <= $maxRak; $rak++)
                                        @php
                                            $s_detail = $siomay ? $siomay->details->filter(fn($d) => ($d->rak ?: 1) == $rak)->last() : null;
                                            $p_detail = $pentol ? $pentol->details->filter(fn($d) => ($d->rak ?: 1) == $rak)->last() : null;
                                            $l_detail = $lumpia ? $lumpia->details->filter(fn($d) => ($d->rak ?: 1) == $rak)->last() : null;
                                            $a_detail = $adonan ? $adonan->details->filter(fn($d) => ($d->rak ?: 1) == $rak)->last() : null;
                                            
                                            $s_val = $s_detail ? $s_detail->tray_count : 0;
                                            $p_val = $p_detail ? $p_detail->tray_count : 0;
                                            $l_val = $l_detail ? $l_detail->tray_count : 0;
                                            $a_val = $a_detail ? $a_detail->tray_count : 0;

                                            $tot_s_loyang += $s_val;
                                            $tot_p_loyang += $p_val;
                                            $tot_l_loyang += $l_val;
                                            $tot_a_loyang += $a_val;
                                        @endphp
                                        <tr class="hover:bg-slate-50 transition-colors duration-150 bg-white data-row"
                                            data-siomay="{{ $s_val }}"
                                            data-pentol="{{ $p_val }}"
                                            data-lumpia="{{ $l_val }}"
                                            data-adonan="{{ $a_val }}">
                                            <!-- Row Number -->
                                            <td class="px-3 py-3 font-mono text-[10px] text-center text-slate-400 border-b border-slate-100 border-r border-r-slate-100">{{ $rowCounter++ }}</td>
                                            
                                            <!-- General Data -->
                                            <td class="px-4 py-3 font-medium text-slate-500 border-b border-slate-100 border-r border-r-slate-100">--</td>
                                            <td class="px-4 py-3 font-mono font-medium text-slate-700 border-b border-slate-100 border-r border-r-slate-100">{{ \Carbon\Carbon::parse($date)->format('d/m/Y') }}</td>
                                            <td class="px-4 py-3 border-b border-slate-100 border-r border-r-slate-100">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">Shift {{ $shift }}</span>
                                            </td>
                                            <td class="px-4 py-3 border-b border-slate-100 border-r border-r-slate-200">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black bg-pink-50 text-primary-pink border border-pink-200/60">{{ $machine }}</span>
                                            </td>
                                            
                                            <!-- Siomay -->
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700">{{ $s_detail ? ($siomay->batch_number ?? '') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $s_detail ? $s_detail->suhu_panel : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $s_detail ? $s_detail->suhu_produk : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-mono text-slate-600">{{ $s_detail ? \Carbon\Carbon::parse($s_detail->time)->format('H:i') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-bold text-slate-800">{{ $s_detail ? $rak : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 border-r border-r-slate-200">
                                                @if($s_detail)
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200/60">{{ $s_detail->tray_count }} Loyang</span>
                                                @endif
                                            </td>
                                            
                                            <!-- Pentol -->
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700">{{ $p_detail ? ($pentol->batch_number ?? '') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $p_detail ? $p_detail->suhu_panel : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $p_detail ? $p_detail->suhu_produk : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-mono text-slate-600">{{ $p_detail ? \Carbon\Carbon::parse($p_detail->time)->format('H:i') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-bold text-slate-800">{{ $p_detail ? $rak : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 border-r border-r-slate-200">
                                                @if($p_detail)
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200/60">{{ $p_detail->tray_count }} Loyang</span>
                                                @endif
                                            </td>
                                            
                                            <!-- Lumpia -->
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700">{{ $l_detail ? ($lumpia->batch_number ?? '') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $l_detail ? $l_detail->suhu_panel : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $l_detail ? $l_detail->suhu_produk : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-mono text-slate-600">{{ $l_detail ? \Carbon\Carbon::parse($l_detail->time)->format('H:i') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-bold text-slate-800">{{ $l_detail ? $rak : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 border-r border-r-slate-200">
                                                @if($l_detail)
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200/60">{{ $l_detail->tray_count }} Keranjang</span>
                                                @endif
                                            </td>
                                            
                                            <!-- Adonan Pangsit -->
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700">{{ $a_detail ? ($adonan->batch_number ?? '') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $a_detail ? $a_detail->suhu_panel : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 text-slate-700" style="mso-number-format:'\@';">{{ $a_detail ? $a_detail->suhu_produk : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-mono text-slate-600">{{ $a_detail ? \Carbon\Carbon::parse($a_detail->time)->format('H:i') : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 font-bold text-slate-800">{{ $a_detail ? $rak : '' }}</td>
                                            <td class="px-3 py-3 border-b border-slate-100 border-r border-r-slate-200">
                                                @if($a_detail)
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60">{{ $a_detail->tray_count }} Keranjang</span>
                                                @endif
                                            </td>
                                            
                                            <!-- Unplanned Stop -->
                                            <td class="px-4 py-3 border-b border-slate-100 text-red-600 font-semibold text-xs whitespace-normal max-w-[200px]">
                                                @if($unplannedStops)
                                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">{{ $unplannedStops }}</span>
                                                @else
                                                    <span class="text-slate-300">-</span>
                                                @endif
                                            </td>
                                        </tr>
                                    @endfor
                                @endforeach
                            @endforeach
                        @endforeach
                    </tbody>
                    <!-- Excel-Style Footer Total Row (Matching exact user spreadsheet design) -->
                    <tfoot class="sticky bottom-0 z-30 font-black bg-slate-50 text-slate-800 border-t-2 border-slate-300 shadow-xs text-xs">
                        <tr>
                            <!-- 1-5: #, PIC, Tanggal, Shift, IQF -->
                            <td class="px-3 py-2.5 border-t border-slate-200 border-r border-r-slate-200 bg-slate-100 font-bold text-slate-400">Total</td>
                            <td class="px-4 py-2.5 border-t border-slate-200 border-r border-r-slate-200 bg-slate-100"></td>
                            <td class="px-4 py-2.5 border-t border-slate-200 border-r border-r-slate-200 bg-slate-100"></td>
                            <td class="px-4 py-2.5 border-t border-slate-200 border-r border-r-slate-200 bg-slate-100"></td>
                            <td class="px-4 py-2.5 border-t border-slate-200 border-r border-r-slate-200 bg-slate-100"></td>
                            
                            <!-- SIOMAY (6 cols) -->
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 font-bold text-slate-700 bg-cyan-50/90 text-center">Total</td>
                            <td class="px-3 py-2.5 border-t border-slate-200 border-r border-r-slate-200 font-black text-cyan-900 bg-cyan-100/90 font-mono text-sm" id="totSiomayCell" data-formula="sum-siomay">{{ $tot_s_loyang ?: 0 }}</td>
                            
                            <!-- PENTOL (6 cols) -->
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 font-bold text-slate-700 bg-rose-50/90 text-center">Total</td>
                            <td class="px-3 py-2.5 border-t border-slate-200 border-r border-r-slate-200 font-black text-rose-900 bg-rose-100/90 font-mono text-sm" id="totPentolCell" data-formula="sum-pentol">{{ $tot_p_loyang ?: 0 }}</td>
                            
                            <!-- LUMPIA (6 cols) -->
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 font-bold text-slate-700 bg-sky-50/90 text-center">Total</td>
                            <td class="px-3 py-2.5 border-t border-slate-200 border-r border-r-slate-200 font-black text-sky-900 bg-sky-100/90 font-mono text-sm" id="totLumpiaCell" data-formula="sum-lumpia">{{ $tot_l_loyang ?: 0 }}</td>
                            
                            <!-- ADONAN PANGSIT (6 cols) -->
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 bg-slate-50"></td>
                            <td class="px-3 py-2.5 border-t border-slate-200 font-bold text-slate-700 bg-fuchsia-50/90 text-center">Total</td>
                            <td class="px-3 py-2.5 border-t border-slate-200 border-r border-r-slate-200 font-black text-fuchsia-900 bg-fuchsia-100/90 font-mono text-sm" id="totAdonanCell" data-formula="sum-adonan">{{ $tot_a_loyang ?: 0 }}</td>
                            
                            <!-- UNPLANNED STOP -->
                            <td class="px-4 py-2.5 border-t border-slate-200 bg-slate-100"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        @endif

        <!-- Document List Style Dynamic Pagination Footer -->
        <div class="mt-3 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs text-slate-500 font-medium">
            <div id="paginationInfoText">Showing 0 to 0 of 0 entries</div>
            <div class="flex items-center gap-1.5" id="paginationNavContainer">
                <!-- Dynamic Page Buttons render here via JS -->
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/gh/linways/table-to-excel@v1.0.4/dist/tableToExcel.js"></script>
<script>
    let currentPage = 1;
    let pageSize = 10;

    function changeRowsPerPage() {
        let select = document.getElementById("rowsPerPageSelect");
        if (select) {
            pageSize = parseInt(select.value) || 10;
        }
        currentPage = 1;
        renderTablePagination();
    }

    function clearSearch() {
        let input = document.getElementById("searchInput");
        if (input) {
            input.value = "";
        }
        filterTable();
    }

    function filterTable() {
        let input = document.getElementById("searchInput");
        let clearBtn = document.getElementById("clearSearchBtn");
        
        if (input && clearBtn) {
            if (input.value.trim().length > 0) {
                clearBtn.classList.remove("hidden");
            } else {
                clearBtn.classList.add("hidden");
            }
        }

        currentPage = 1;
        renderTablePagination();
    }

    function renderTablePagination() {
        let input = document.getElementById("searchInput");
        let rawQuery = input ? input.value.toLowerCase().trim() : "";
        let table = document.getElementById("masterTable");
        if (!table) return;

        let tbody = document.getElementById("tableBody");
        if (!tbody) return;

        let allRows = Array.from(tbody.querySelectorAll("tr.data-row"));
        
        // Split query into multi-token terms (tokenized search)
        let terms = rawQuery.split(/\s+/).filter(t => t.length > 0);

        // Filter matching rows
        let matchingRows = allRows.filter(row => {
            let rowText = row.textContent.toLowerCase();
            return terms.every(term => rowText.includes(term));
        });

        // Calculate dynamic sum for matching rows
        let sumS = 0, sumP = 0, sumL = 0, sumA = 0;
        matchingRows.forEach(row => {
            sumS += parseInt(row.getAttribute("data-siomay") || 0);
            sumP += parseInt(row.getAttribute("data-pentol") || 0);
            sumL += parseInt(row.getAttribute("data-lumpia") || 0);
            sumA += parseInt(row.getAttribute("data-adonan") || 0);
        });

        // Update footer cells dynamically
        let cellS = document.getElementById("totSiomayCell");
        if (cellS) cellS.textContent = sumS;
        let cellP = document.getElementById("totPentolCell");
        if (cellP) cellP.textContent = sumP;
        let cellL = document.getElementById("totLumpiaCell");
        if (cellL) cellL.textContent = sumL;
        let cellA = document.getElementById("totAdonanCell");
        if (cellA) cellA.textContent = sumA;

        // Hide all rows initially
        allRows.forEach(row => row.style.display = "none");

        // Remove old empty state row if present
        let emptyRow = document.getElementById("emptySearchResultRow");
        if (emptyRow) emptyRow.remove();

        let totalEntries = matchingRows.length;

        if (totalEntries === 0 && rawQuery.length > 0) {
            let noResult = document.createElement("tr");
            noResult.id = "emptySearchResultRow";
            noResult.innerHTML = `<td colspan="30" class="py-12 text-center text-slate-400 font-medium">
                <svg class="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span>Tidak ada data logsheet yang cocok dengan "${rawQuery}"</span>
            </td>`;
            tbody.appendChild(noResult);
        }

        let totalPages = Math.ceil(totalEntries / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize, totalEntries);

        // Show current page rows
        for (let i = startIndex; i < endIndex; i++) {
            if (matchingRows[i]) {
                matchingRows[i].style.display = "";
            }
        }

        // Update info text
        let infoText = document.getElementById("paginationInfoText");
        if (infoText) {
            if (totalEntries === 0) {
                infoText.textContent = "Showing 0 to 0 of 0 entries";
            } else {
                infoText.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;
            }
        }

        // Render page buttons
        let navContainer = document.getElementById("paginationNavContainer");
        if (navContainer) {
            let html = '';
            
            // Previous button
            if (currentPage > 1) {
                html += `<button onclick="goToPage(${currentPage - 1})" class="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-semibold transition">Previous</button>`;
            } else {
                html += `<button class="px-2.5 py-1 text-slate-300 cursor-not-allowed font-medium" disabled>Previous</button>`;
            }

            // Page numbers
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }

            for (let p = startPage; p <= endPage; p++) {
                if (p === currentPage) {
                    html += `<button class="px-3 py-1 bg-primary-cyan text-white rounded-lg font-black shadow-2xs">${p}</button>`;
                } else {
                    html += `<button onclick="goToPage(${p})" class="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition">${p}</button>`;
                }
            }

            // Next button
            if (currentPage < totalPages) {
                html += `<button onclick="goToPage(${currentPage + 1})" class="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-semibold transition">Next</button>`;
            } else {
                html += `<button class="px-2.5 py-1 text-slate-300 cursor-not-allowed font-medium" disabled>Next</button>`;
            }

            navContainer.innerHTML = html;
        }
    }

    function goToPage(page) {
        currentPage = page;
        renderTablePagination();
    }

    document.addEventListener("DOMContentLoaded", function() {
        renderTablePagination();
    });

    function exportAllTables() {
        let table = document.getElementById('masterTable');
        if (!table) {
            alert('Tidak ada data untuk diexport.');
            return;
        }

        let clone = table.cloneNode(true);
        let date = new Date().toISOString().slice(0,10);
        let filename = 'MasterData_IQF_' + date;

        TableToExcel.convert(clone, {
            name: filename + ".xlsx",
            sheet: {
                name: "Logsheet"
            }
        });
    }
</script>
