<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PPA Digitalization - Prepare Produksi</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link href="https://cdn.jsdelivr.net/npm/simple-datatables@9.0.3/dist/style.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/simple-datatables@9.0.3" type="text/javascript"></script>
    <script src="https://cdn.jsdelivr.net/gh/linways/table-to-excel@1.0.4/dist/tableToExcel.js"></script>
</head>
<body class="bg-gray-50 text-gray-800">
    <nav x-data="{ open: false }" class="sticky top-0 z-50 bg-white border-b-4 border-primary-pink shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <div class="flex items-center">
                    <img src="/images/ppa.jpg" alt="Logo PPA" class="h-12 w-auto mr-2 sm:mr-3 object-contain" onerror="this.src='https://placehold.co/50x50/B22222/FFF?text=PPA'">
                    <img src="/images/LogoMieGacoan.png" alt="Logo Gacoan" class="h-12 w-auto mr-2 sm:mr-4 object-contain" onerror="this.src='https://placehold.co/150x50/EE219A/FFF?text=MIE+GACOAN&font=Montserrat'">
                    <h1 class="text-xl sm:text-2xl font-black tracking-tight text-primary-cyan uppercase hidden sm:block">
                        Digital <span class="text-primary-pink">Logsheet</span>
                    </h1>
                </div>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex md:items-center md:space-x-8">
                    <a href="{{ route('prepare-produksi.index') }}" class="text-gray-600 hover:text-primary-cyan font-semibold transition px-3 py-2 rounded-md hover:bg-blue-50">Prepare Produksi</a>
                    <a href="{{ route('iqf-logsheet.index') }}" class="text-gray-600 hover:text-primary-cyan font-semibold transition px-3 py-2 rounded-md hover:bg-blue-50">IQF & Freezing</a>
                </div>

                <!-- Hamburger Button -->
                <div class="-mr-2 flex items-center md:hidden">
                    <button @click="open = !open" type="button" class="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-cyan" aria-controls="mobile-menu" aria-expanded="false">
                        <span class="sr-only">Open main menu</span>
                        <svg :class="{'hidden': open, 'block': !open }" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <svg :class="{'block': open, 'hidden': !open }" class="h-6 w-6 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div x-show="open" class="md:hidden border-t border-gray-200" id="mobile-menu">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-inner bg-gray-50">
                <a href="{{ route('prepare-produksi.index') }}" class="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-primary-cyan hover:bg-blue-50 transition">Prepare Produksi</a>
                <a href="{{ route('iqf-logsheet.index') }}" class="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-primary-cyan hover:bg-blue-50 transition">IQF & Freezing</a>
            </div>
        </div>
    </nav>
    <main class="w-full max-w-full p-1">
        @yield('content')
    </main>
</body>
</html>
