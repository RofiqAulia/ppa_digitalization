<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - PPA Digitalization</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link href="https://cdn.jsdelivr.net/npm/simple-datatables@9.0.3/dist/style.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/simple-datatables@9.0.3" type="text/javascript"></script>
    <style>
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-[#f0f4f9] text-slate-800 font-sans antialiased overflow-hidden" x-data="{ sidebarOpen: false }">

    <div class="flex flex-col h-screen overflow-hidden">

        <!-- Top Header Bar (Matching Gambar 1) -->
        <header class="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 shadow-2xs z-30 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
                <button @click="sidebarOpen = true" class="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </button>
                
                <div class="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#0284c7] flex items-center justify-center text-white font-black text-lg shadow-2xs shrink-0">
                        <img src="/images/ppa.jpg" alt="PPA" class="w-6 h-6 object-contain rounded-md" onerror="this.style.display='none'">
                    </div>
                    <div class="flex flex-col">
                        <span class="font-black text-slate-900 text-sm tracking-tight uppercase leading-none">
                            PPA <span class="text-cyan-600">Digitalization</span>
                        </span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Production Systems
                        </span>
                    </div>
                </div>
            </div>

            <!-- Right Action Pill Buttons -->
            <div class="flex items-center gap-2 sm:gap-3">
                <a href="{{ route('dashboard') }}" class="hidden sm:inline-flex items-center gap-1.5 bg-[#0284c7] hover:bg-cyan-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs transition-all text-decoration-none">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span>Admin Panel</span>
                </a>

                <a href="{{ route('iqf-logsheet.index') }}" class="hidden md:inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs transition-all text-decoration-none">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    <span>Ambil Barang</span>
                </a>

                <div class="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1.5 rounded-full text-xs font-bold">
                    <svg class="w-3.5 h-3.5 text-amber-500 fill-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clip-rule="evenodd"/></svg>
                    <span class="hidden sm:inline">Mode: Siang</span>
                </div>

                <div class="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-1 pr-3 rounded-full shadow-2xs">
                    <div class="w-7 h-7 rounded-full bg-[#0284c7] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        MR
                    </div>
                    <div class="flex flex-col text-left leading-tight hidden lg:flex">
                        <span class="text-xs font-extrabold text-slate-800 truncate">M Rofiq</span>
                        <span class="text-[9px] font-black text-cyan-600 uppercase">ADMIN</span>
                    </div>
                </div>

                <form method="POST" action="{{ route('logout') }}" class="inline">
                    @csrf
                    <button type="submit" class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-200/70 flex items-center justify-center transition-all shadow-2xs cursor-pointer" title="Logout">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    </button>
                </form>
            </div>
        </header>

        <!-- Body Layout (Padded Floating Sidebar & Main) -->
        <div class="flex flex-1 overflow-hidden p-3 gap-3">

            <!-- Mobile Backdrop -->
            <div x-show="sidebarOpen" x-transition.opacity @click="sidebarOpen = false" class="fixed inset-0 z-20 bg-slate-900/40 lg:hidden backdrop-blur-xs"></div>

            <!-- Floating White Card Sidebar -->
            <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'" class="fixed inset-y-0 left-0 z-30 w-64 bg-white rounded-3xl border border-slate-200/80 text-slate-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col shadow-2xs overflow-hidden shrink-0">
                
                <div class="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-black text-lg flex items-center justify-center shadow-2xs">
                            P
                        </div>
                        <div class="flex flex-col">
                            <span class="font-black text-slate-900 text-sm tracking-tight">Master Data</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Control Panel</span>
                        </div>
                    </div>
                </div>

                <!-- Navigation List -->
                <nav class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
                    <div class="px-2 mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">Produksi</div>

                    <a href="{{ route('logsheet-iqf.index') }}" class="group flex items-center px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all {{ request()->routeIs('logsheet-iqf.index') ? 'bg-[#0284c7] text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' }}">
                        <svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        IQF Logsheet
                    </a>
                    
                    <a href="{{ route('iqf-logsheet.history') }}" class="group flex items-center px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all {{ request()->routeIs('iqf-logsheet.history') ? 'bg-[#0284c7] text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' }}">
                        <svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        History Data
                    </a>

                    <div class="px-2 mb-1 mt-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">Operator</div>

                    <a href="{{ route('iqf-logsheet.kiosk') }}" target="_blank" class="group flex items-center px-3.5 py-2.5 text-xs font-bold rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                        <svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        Terminal Kiosk
                    </a>
                </nav>
                
                <!-- Bottom Pink Callout Alert Card (Gambar 1 style) -->
                <div class="m-3 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-950 shadow-2xs space-y-2">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5 font-black text-xs text-rose-700">
                            <svg class="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                            <span>Perhatian Stok!</span>
                        </div>
                        <span class="text-[11px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">226</span>
                    </div>
                    <p class="text-[11px] text-rose-800 font-medium leading-tight">
                        Terdapat 226 item stok menipis.
                    </p>
                    <a href="{{ route('dashboard') }}#deteksi-anomali-section" class="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all text-decoration-none">
                        <span>Buka Deteksi Stok</span>
                    </a>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main class="flex-1 overflow-auto custom-scrollbar rounded-3xl bg-transparent">
                @yield('content')
            </main>
            
        </div>
    </div>

</body>
</html>
