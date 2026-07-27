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
            width: 8px;
            height: 8px;
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
<body class="bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden" x-data="{ sidebarOpen: false }">

    <div class="flex h-screen overflow-hidden">

        <!-- Sidebar Backdrop (Mobile) -->
        <div x-show="sidebarOpen" 
             x-transition.opacity 
             @click="sidebarOpen = false"
             class="fixed inset-0 z-20 bg-slate-900/50 lg:hidden backdrop-blur-sm"></div>

        <!-- Sidebar -->
        <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
               class="fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col shadow-2xl">
            
            <!-- Sidebar Header -->
            <div class="flex items-center justify-center h-20 border-b border-slate-800 bg-slate-950/50 px-6 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-cyan to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-cyan/20">
                        P
                    </div>
                    <div class="flex flex-col">
                        <span class="text-white font-extrabold text-lg tracking-tight uppercase leading-tight">Admin<span class="text-primary-cyan">Panel</span></span>
                        <span class="text-[10px] font-medium text-slate-400 uppercase tracking-widest">PPA Digitalization</span>
                    </div>
                </div>
            </div>

            <!-- Sidebar Navigation -->
            <nav class="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-1.5">
                
                <div class="px-3 mb-2 mt-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Produksi</div>
                
                <a href="{{ route('admin.iqf-logsheet.index') }}" 
                   class="{{ request()->routeIs('admin.iqf-logsheet.index') ? 'bg-primary-cyan/10 text-primary-cyan' : 'hover:bg-slate-800 hover:text-white' }} group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.iqf-logsheet.index') ? 'text-primary-cyan' : 'text-slate-500 group-hover:text-slate-300' }}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    IQF Logsheet
                </a>
                
                <a href="{{ route('admin.iqf-logsheet.history') }}" 
                   class="{{ request()->routeIs('admin.iqf-logsheet.history') ? 'bg-primary-cyan/10 text-primary-cyan' : 'hover:bg-slate-800 hover:text-white' }} group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.iqf-logsheet.history') ? 'text-primary-cyan' : 'text-slate-500 group-hover:text-slate-300' }}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History Data
                </a>

                <div class="px-3 mb-2 mt-8 text-[10px] font-black tracking-widest text-slate-500 uppercase">Operator</div>

                <a href="{{ route('iqf-logsheet.kiosk') }}" target="_blank"
                   class="hover:bg-slate-800 hover:text-white group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200">
                    <svg class="mr-3 h-5 w-5 text-slate-500 group-hover:text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Terminal Kiosk
                    <svg class="ml-auto h-4 w-4 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
                
                <a href="{{ route('iqf-logsheet.index') }}" target="_blank"
                   class="hover:bg-slate-800 hover:text-white group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200">
                    <svg class="mr-3 h-5 w-5 text-slate-500 group-hover:text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Public View
                    <svg class="ml-auto h-4 w-4 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </nav>
            
            <!-- Sidebar Footer -->
            <div class="p-4 border-t border-slate-800 bg-slate-950/30">
                <div class="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User" class="w-9 h-9 rounded-full shadow-md">
                    <div class="flex flex-col">
                        <span class="text-sm font-bold text-white">Administrator</span>
                        <span class="text-[10px] font-medium text-slate-400">admin@ppa.com</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content Wrapper -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            <!-- Top Header -->
            <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm z-10">
                
                <div class="flex items-center gap-4">
                    <button @click="sidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    
                    <h2 class="text-lg font-black text-slate-800 tracking-tight hidden sm:block">
                        @yield('header_title', 'Dashboard')
                    </h2>
                </div>

                <div class="flex items-center gap-4 sm:gap-6">
                    <!-- Clock/Date Widget -->
                    <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <svg class="w-4 h-4 text-primary-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-xs font-bold text-slate-600">{{ \Carbon\Carbon::now()->translatedFormat('l, d F Y') }}</span>
                    </div>
                    
                    <!-- Notifications -->
                    <button class="relative p-2 text-slate-400 hover:text-primary-cyan transition-colors rounded-full hover:bg-cyan-50">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
                </div>
            </header>

            <!-- Main Content Area -->
            <main class="flex-1 overflow-auto custom-scrollbar p-4 sm:p-6 lg:p-8 relative">
                @yield('content')
            </main>
            
        </div>
    </div>

</body>
</html>
