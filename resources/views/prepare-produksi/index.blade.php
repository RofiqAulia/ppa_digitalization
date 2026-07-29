@extends('layouts.app')

@section('content')
<div class="px-4 py-8 sm:px-0 w-full max-w-full">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h2 class="text-3xl font-black text-gray-800 tracking-tight">Logsheet Adonan DIMSUM</h2>
            <p class="text-sm text-gray-500 mt-1">Kelola data plan dan realisasi produksi harian.</p>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div class="relative w-full sm:w-64">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input type="text" id="searchInput" placeholder="Cari tanggal, shift, spv..." class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-cyan focus:border-primary-cyan sm:text-sm shadow-sm transition" onkeyup="filterTable()">
            </div>
            <button onclick="exportTableToExcel('logsheetTable', 'Logsheet_Prepare_Produksi')" class="w-full sm:w-auto inline-flex items-center justify-center bg-emerald-500 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-600 font-bold shadow-md transition transform hover:-translate-y-0.5 whitespace-nowrap">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export Excel
            </button>
            <a href="{{ route('prepare-produksi.create') }}" class="w-full sm:w-auto inline-flex items-center justify-center bg-primary-pink text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 font-bold shadow-md transition transform hover:-translate-y-0.5 whitespace-nowrap">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Buat Plan (SPV)
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm">
            <span class="text-green-800 font-medium">{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <span class="text-red-800 font-medium">{{ session('error') }}</span>
        </div>
    @endif

    <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full relative z-0">
        <div class="overflow-x-auto relative w-full h-[75vh] custom-scrollbar">
            <!-- Clean Modern Table Layout -->
            <table class="w-max min-w-full text-left border-collapse whitespace-nowrap" id="logsheetTable">
                <thead class="sticky top-0 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    <!-- BARIS 1 -->
                    <tr>
                        <!-- INFO UMUM -->
                        <th rowspan="3" class="border-b border-r border-gray-100 px-4 py-3 min-w-[110px] sticky left-0 bg-white z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-middle text-gray-700">Tanggal</th>
                        <th rowspan="3" class="border-b border-r border-gray-100 px-3 py-3 min-w-[60px] align-middle text-center bg-white">Shift</th>
                        <th rowspan="3" class="border-b border-r border-gray-200 px-4 py-3 min-w-[100px] align-middle bg-white">SPV</th>
                        
                        <th colspan="2" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-slate-50 text-slate-600">Total Resep</th>
                        <th colspan="8" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-blue-50 text-blue-600">Siomay (gr)</th>
                        <th colspan="8" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-emerald-50 text-emerald-600">Pentol (gr)</th>
                        <th colspan="8" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-amber-50 text-amber-600">Lumpia (gr)</th>
                        
                        <!-- SERAH TERIMA SEPARATED -->
                        <th rowspan="3" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-purple-50 text-purple-600 align-middle">Pengambilan<br>Topping</th>
                        <th colspan="3" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-purple-50 text-purple-600">Serah Terima Retur</th>
                        <th rowspan="3" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-purple-50 text-purple-600 align-middle">Retur Prepare<br>To Produksi</th>

                        <th colspan="3" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-rose-50 text-rose-600">Waste (gr)</th>
                        <th colspan="7" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-indigo-50 text-indigo-600">Kulit Siomay</th>
                        <th colspan="6" class="border-b border-r border-gray-200 px-4 py-2 text-center bg-cyan-50 text-cyan-600">Kulit Tahu</th>
                        
                        <th rowspan="3" class="border-b border-gray-100 px-4 py-3 min-w-[180px] align-middle bg-white">Catatan</th>
                        <th rowspan="3" class="border-b px-4 py-3 min-w-[80px] sticky right-0 bg-white z-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] align-middle text-center text-gray-700">Aksi</th>
                    </tr>

                    <!-- BARIS 2 -->
                    <tr>
                        <!-- TOTAL RESEP -->
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-slate-50">Plan</th>
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-slate-50">Real</th>

                        <!-- SIOMAY -->
                        <th colspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 text-center bg-white">Resep</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Dikichi</th>
                        <th colspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 text-center bg-white">Adonan Akhir</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Selisih</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Waste</th>
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-white">Retur</th>
                        
                        <!-- PENTOL -->
                        <th colspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 text-center bg-white">Resep</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Dikichi</th>
                        <th colspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 text-center bg-white">Adonan Akhir</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Selisih</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Waste</th>
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-white">Retur</th>

                        <!-- LUMPIA -->
                        <th colspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 text-center bg-white">Resep</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Dikichi</th>
                        <th colspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 text-center bg-white">Adonan Akhir</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Selisih</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Waste</th>
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-white">Retur</th>

                        <!-- SERAH TERIMA RETUR -->
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Siomay</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Pentol</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Lumpia</th>

                        <!-- WASTE -->
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Plastik</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Ham</th>
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-white">Bowl Cutter</th>

                        <!-- KULIT SIOMAY -->
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Masuk</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Sisa Pack</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Sisa Unit</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Waste Manual</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Waste Tandon</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Retur Pro-WH</th>
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-white">Retur WH-Pro</th>

                        <!-- KULIT TAHU -->
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Masuk</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Sisa Pack</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Sisa Unit</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Waste Manual</th>
                        <th rowspan="2" class="border-b border-r border-gray-100 px-2 py-1.5 align-middle text-center bg-white">Retur Pro-WH</th>
                        <th rowspan="2" class="border-b border-r border-gray-200 px-2 py-1.5 align-middle text-center bg-white">Retur WH-Pro</th>
                    </tr>

                    <!-- BARIS 3 -->
                    <tr>
                        <!-- SIOMAY -->
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">PLAN</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">REAL</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">AKHIR</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">MASUK</th>
                        
                        <!-- PENTOL -->
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">PLAN</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">REAL</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">AKHIR</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">MASUK</th>
                        
                        <!-- LUMPIA -->
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">PLAN</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">REAL</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">AKHIR</th>
                        <th class="border-b border-r border-gray-100 px-2 py-1.5 text-center text-[9px] text-gray-400 bg-white">MASUK</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 bg-white" id="logsheetBody">
                    @forelse($headers as $h)
                    @php
                        $siomay = $h->productDetails->where('product_type', 'siomay')->first();
                        $pentol = $h->productDetails->where('product_type', 'pentol')->first();
                        $lumpia = $h->productDetails->where('product_type', 'lumpia')->first();
                        $canEdit = $h->canBeEdited();
                        
                        $r_siomay = $h->returDetails->where('product_type', 'siomay')->first();
                        $r_pentol = $h->returDetails->where('product_type', 'pentol')->first();
                        $r_lumpia = $h->returDetails->where('product_type', 'lumpia')->first();
                        $topping = $h->toppings->first();

                        $w_plastik = $h->wasteLogs->where('waste_type', 'plastik')->first();
                        $w_ham = $h->wasteLogs->where('waste_type', 'ham_adonan')->first();
                        $w_bowl = $h->wasteLogs->where('waste_type', 'bowlcutter_dimsum')->first();

                        $k_siomay = $h->skinMaterials->where('material_type', 'kulit_siomay')->first();
                        $k_tahu = $h->skinMaterials->where('material_type', 'kulit_tahu')->first();

                        // Badges and Row Colors for Shift
                        $shiftBadge = '';
                        $rowBg = 'bg-white hover:bg-slate-50';
                        $stickyBg = 'bg-white';
                        
                        if ($h->shift == '1') {
                            $shiftBadge = 'bg-emerald-100 text-emerald-700';
                            $rowBg = 'bg-emerald-50/60 hover:bg-emerald-100/50';
                            $stickyBg = 'bg-[#f4fbf7]'; // Solid approximation for sticky column
                        } elseif ($h->shift == '2') {
                            $shiftBadge = 'bg-amber-100 text-amber-700';
                            $rowBg = 'bg-amber-50/60 hover:bg-amber-100/50';
                            $stickyBg = 'bg-[#fffdf4]'; 
                        } elseif ($h->shift == '3') {
                            $shiftBadge = 'bg-rose-100 text-rose-700';
                            $rowBg = 'bg-rose-50/60 hover:bg-rose-100/50';
                            $stickyBg = 'bg-[#fff5f6]'; 
                        } else {
                            $shiftBadge = 'bg-gray-100 text-gray-700';
                        }
                    @endphp
                    <tr class="{{ $rowBg }} transition-colors duration-150 text-center text-[11px] text-gray-600">
                        <td class="border-r border-gray-100 px-4 py-2 sticky left-0 {{ $stickyBg }} z-30 font-semibold text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-gray-800">
                            {{ \Carbon\Carbon::parse($h->date)->format('d M Y') }}
                        </td>
                        <td class="border-r border-gray-100 px-3 py-2">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold {{ $shiftBadge }}">{{ $h->shift }}</span>
                        </td>
                        <td class="border-r border-gray-200 px-4 py-2 font-medium text-left text-gray-700">{{ $h->spv_name }}</td>
                        
                        <!-- TOTAL RESEP -->
                        <td class="border-r border-gray-100 px-2 py-2 font-semibold bg-slate-50/30 text-gray-800">{{ $h->total_recipe_plan }}</td>
                        <td class="border-r border-gray-200 px-2 py-2 font-semibold bg-slate-50/30 text-gray-800">{{ $h->total_recipe_real ?? '-' }}</td>

                        <!-- SIOMAY -->
                        <td class="border-r border-gray-100 px-2 py-2">{{ $siomay?->recipe_plan ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $siomay?->recipe_real ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2 font-medium text-blue-600">{{ $siomay?->dikichi ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $siomay?->adonan_akhir_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $siomay?->adonan_masuk_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2 font-semibold text-gray-600">
                            {{ isset($siomay?->recipe_plan, $siomay?->recipe_real) ? ($siomay->recipe_real - $siomay->recipe_plan) : '-' }}
                        </td>
                        <td class="border-r border-gray-100 px-2 py-2 text-rose-500">{{ $siomay?->waste_gr ?? '-' }}</td>
                        <td class="border-r border-gray-200 px-2 py-2 text-amber-500">{{ $siomay?->retur_gr ?? '-' }}</td>
                        
                        <!-- PENTOL -->
                        <td class="border-r border-gray-100 px-2 py-2">{{ $pentol?->recipe_plan ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $pentol?->recipe_real ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2 font-medium text-emerald-600">{{ $pentol?->dikichi ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $pentol?->adonan_akhir_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $pentol?->adonan_masuk_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2 font-semibold text-gray-600">
                            {{ isset($pentol?->recipe_plan, $pentol?->recipe_real) ? ($pentol->recipe_real - $pentol->recipe_plan) : '-' }}
                        </td>
                        <td class="border-r border-gray-100 px-2 py-2 text-rose-500">{{ $pentol?->waste_gr ?? '-' }}</td>
                        <td class="border-r border-gray-200 px-2 py-2 text-amber-500">{{ $pentol?->retur_gr ?? '-' }}</td>

                        <!-- LUMPIA -->
                        <td class="border-r border-gray-100 px-2 py-2">{{ $lumpia?->recipe_plan ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $lumpia?->recipe_real ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2 font-medium text-amber-600">{{ $lumpia?->dikichi ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $lumpia?->adonan_akhir_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $lumpia?->adonan_masuk_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2 font-semibold text-gray-600">
                            {{ isset($lumpia?->recipe_plan, $lumpia?->recipe_real) ? ($lumpia->recipe_real - $lumpia->recipe_plan) : '-' }}
                        </td>
                        <td class="border-r border-gray-100 px-2 py-2 text-rose-500">{{ $lumpia?->waste_gr ?? '-' }}</td>
                        <td class="border-r border-gray-200 px-2 py-2 text-amber-500">{{ $lumpia?->retur_gr ?? '-' }}</td>

                        <!-- SERAH TERIMA -->
                        <td class="border-r border-gray-100 px-2 py-2">{{ $topping?->topping_weight_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $r_siomay?->serah_terima_retur_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $r_pentol?->serah_terima_retur_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $r_lumpia?->serah_terima_retur_gr ?? '-' }}</td>
                        <td class="border-r border-gray-200 px-2 py-2">{{ $r_siomay?->retur_prepare_to_produksi_gr ?? '-' }}</td> 

                        <!-- WASTE -->
                        <td class="border-r border-gray-100 px-2 py-2">{{ $w_plastik?->weight_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $w_ham?->weight_gr ?? '-' }}</td>
                        <td class="border-r border-gray-200 px-2 py-2">{{ $w_bowl?->weight_gr ?? '-' }}</td>

                        <!-- KULIT SIOMAY -->
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_siomay?->masuk ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_siomay?->sisa_pack ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_siomay?->sisa_unit ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_siomay?->waste_manual_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_siomay?->waste_tandon_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_siomay?->retur_pro_wh ?? '-' }}</td>
                        <td class="border-r border-gray-200 px-2 py-2">{{ $k_siomay?->retur_wh_pro ?? '-' }}</td>

                        <!-- KULIT TAHU -->
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_tahu?->masuk ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_tahu?->sisa_pack ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_tahu?->sisa_unit ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_tahu?->waste_manual_gr ?? '-' }}</td>
                        <td class="border-r border-gray-100 px-2 py-2">{{ $k_tahu?->retur_pro_wh ?? '-' }}</td>
                        <td class="border-r border-gray-200 px-2 py-2">{{ $k_tahu?->retur_wh_pro ?? '-' }}</td>
                        
                        <td class="border-r border-gray-100 px-4 py-2 truncate max-w-[150px] text-left text-gray-400 text-[10px]" title="{{ $h->notes }}">{{ $h->notes ?? '-' }}</td>
                        <td class="px-2 py-2 sticky right-0 bg-white z-30 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div class="flex items-center justify-center gap-1.5">
                                @if($canEdit)
                                    <a href="{{ route('prepare-produksi.edit', $h->id) }}" title="Edit Data" class="text-gray-400 hover:text-primary-cyan transition p-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                    </a>
                                    <form action="{{ route('prepare-produksi.destroy', $h->id) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus data ini?')" class="inline">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" title="Hapus Data" class="text-gray-400 hover:text-red-500 transition p-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4" /></svg>
                                        </button>
                                    </form>
                                @else
                                    <span title="Tidak bisa diedit karena melewati 24 jam" class="text-gray-300 cursor-not-allowed p-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                    </span>
                                    <span title="Tidak bisa dihapus karena melewati 24 jam" class="text-gray-300 cursor-not-allowed p-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4" /></svg>
                                    </span>
                                @endif
                                <a href="{{ route('prepare-produksi.show', $h->id) }}" title="Lihat Data" class="text-gray-400 hover:text-slate-600 transition p-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </a>
                            </div>
                        </td>
                    </tr>
                    @empty
                        <tr>
                            <td colspan="52" class="text-center py-16 text-gray-400 font-medium text-[11px]">Belum ada data logsheet produksi.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
/* Custom styling for standard HTML table */
.custom-scrollbar::-webkit-scrollbar {
    height: 10px;
    width: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1; 
    border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1; 
    border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8; 
}
</style>

<script>
    function filterTable() {
        const input = document.getElementById("searchInput");
        const filter = input.value.toLowerCase();
        const tbody = document.getElementById("logsheetBody");
        const tr = tbody.getElementsByTagName("tr");

        for (let i = 0; i < tr.length; i++) {
            // Ignore the "empty data" row if present
            if (tr[i].children.length === 1) continue;
            
            let rowText = tr[i].textContent || tr[i].innerText;
            if (rowText.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
</script>

<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script>
    function exportTableToExcel(tableID, filename = '') {
        // Ambil elemen tabel
        let table = document.getElementById(tableID);
        
        // Buat kloning tabel untuk memanipulasi data sebelum diekspor (menghapus kolom aksi)
        let cloneTable = table.cloneNode(true);
        
        // Hapus kolom 'Aksi' (kolom terakhir) dari thead
        let theadRows = cloneTable.querySelectorAll('thead tr');
        if(theadRows.length > 0) {
            // Kolom aksi ada di baris pertama thead sebagai kolom terakhir
            let lastTh = theadRows[0].lastElementChild;
            if(lastTh && lastTh.innerText.trim().toLowerCase() === 'aksi') {
                lastTh.remove();
            }
        }

        // Hapus kolom 'Aksi' dari tbody (setiap baris, sel terakhir)
        let tbodyRows = cloneTable.querySelectorAll('tbody tr');
        tbodyRows.forEach(row => {
            // Abaikan baris "Belum ada data"
            if(row.children.length > 1) {
                row.lastElementChild.remove();
            }
        });

        // Convert tabel ke worksheet SheetJS
        let wb = XLSX.utils.table_to_book(cloneTable, {sheet: "Logsheet"});
        
        // Buat nama file dengan tanggal hari ini
        let date = new Date().toISOString().split('T')[0];
        let exportFilename = filename ? filename + '_' + date + '.xlsx' : 'Export_' + date + '.xlsx';
        
        // Download file
        XLSX.writeFile(wb, exportFilename);
    }
</script>
@endsection
