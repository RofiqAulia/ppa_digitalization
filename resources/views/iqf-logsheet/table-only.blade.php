@extends('layouts.minimal')

@section('content')
<div class="w-full flex flex-col font-sans text-slate-800 overflow-hidden bg-white p-3 sm:p-5 min-h-screen">
    <!-- Header & Search Toolbar -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 shrink-0">
        <div>
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Data Tabel Logsheet</h1>
            <p class="text-xs text-slate-400 font-medium mt-0.5">Semua riwayat data logsheet produksi</p>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <!-- Rows Per Page Selector (10, 50, 100, 1000) -->
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span class="text-slate-400">Show:</span>
                <select id="rowsPerPageSelect" onchange="changeRowsPerPage()" class="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-700 font-bold shadow-2xs outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="10" selected>10 rows</option>
                    <option value="50">50 rows</option>
                    <option value="100">100 rows</option>
                    <option value="1000">1000 rows</option>
                </select>
            </div>

            <!-- Enhanced Smart Search Box with Clear & Go Button -->
            <div class="relative flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
                <input type="text" id="searchInput" oninput="filterTable()" onkeydown="if(event.key==='Enter'){event.preventDefault();filterTable();}" placeholder="search..." class="pl-3.5 pr-7 py-1.5 text-xs text-slate-700 outline-none bg-transparent w-44 sm:w-60 font-medium" />
                <button id="clearSearchBtn" onclick="clearSearch()" class="hidden absolute right-12 text-slate-400 hover:text-slate-600 font-bold text-xs px-1">&times;</button>
                <button onclick="filterTable()" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-3 py-1.5 text-xs border-l border-slate-200 flex items-center gap-1 transition-colors">
                    <span>Go</span>
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>

            <!-- Action Buttons -->
            <button type="button" onclick="exportAllTables()" class="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 transform hover:-translate-y-0.5 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
            </button>
        </div>
    </div>

    @include('iqf-logsheet.partials.data-table')
</div>
@endsection
