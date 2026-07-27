<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>IQF Operator Terminal</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        /* Hide arrows from number input */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
        input[type=number] {
            -moz-appearance: textfield;
        }
        @keyframes shine {
            100% { left: 200%; }
        }
        .animate-shine {
            animation: shine 1.5s infinite;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased overflow-hidden h-screen w-screen flex flex-col relative" 
      x-data="operatorTerminal()">
    
    <!-- Ambient Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-pink-300/40 blur-[120px]"></div>
        <div class="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-300/40 blur-[120px]"></div>
    </div>

    <!-- Top Bar -->
    <div class="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sm:px-8 flex justify-between items-center shrink-0 z-10 shadow-sm">
        <div class="flex items-center gap-4">
            <div class="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                <img src="/images/ppa.jpg" alt="PPA" class="h-8 object-contain" onerror="this.style.display='none'">
            </div>
            <div>
                <h1 class="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-wider leading-none drop-shadow-sm">IQF <span class="text-pink-600">KIOSK</span></h1>
                <p class="text-xs sm:text-sm font-semibold text-slate-500 mt-1" x-text="currentTime"></p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <!-- Unplanned Stop Controls -->
            <div x-show="step === 2" style="display: none;" class="flex relative">
                <!-- Dropdown Trigger -->
                <button x-show="!isMachineStopped" @click="showStopDropdown = !showStopDropdown" class="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Lapor Masalah</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200" :class="showStopDropdown ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                <!-- Dropdown Menu (Direct 1-Click Quick Action Buttons) -->
                <div x-show="!isMachineStopped && showStopDropdown" 
                     @click.outside="showStopDropdown = false"
                     x-transition 
                     class="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[9999]"
                     style="display: none;">
                    
                    <!-- Header -->
                    <div class="p-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                        <div>
                            <span class="text-xs font-black text-rose-800 uppercase tracking-wider block">Lapor Kendala (1-Klik Instan)</span>
                            <span class="text-[10px] text-rose-600 font-medium">Tekan salah satu tombol kendala di bawah</span>
                        </div>
                        <button @click="showStopDropdown = false" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-rose-100/50 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    <!-- Quick Action 1-Click Buttons -->
                    <div class="p-2.5 space-y-2">
                        <template x-for="reason in unplannedStopReasons" :key="reason">
                            <button @click="quickReportStop(reason)"
                                    class="w-full text-left px-4 py-3 bg-white hover:bg-rose-50 hover:border-rose-400 border border-slate-200 rounded-xl transition-all font-bold text-xs text-slate-700 hover:text-rose-700 uppercase tracking-wider flex items-center justify-between group shadow-sm active:scale-98">
                                <div class="flex items-center gap-2.5">
                                    <span class="text-rose-500 font-black" x-text="reason === 'lain lain' ? '✏️' : '⚡'"></span>
                                    <span x-text="reason"></span>
                                </div>
                                <svg class="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </template>
                    </div>
                </div>
                
                <div x-show="isMachineStopped" class="flex items-center gap-3 bg-rose-100 border border-rose-300 rounded-xl p-1 pr-4 shadow-sm">
                    <button @click="endMachineStop()" class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Mesin Digunakan Kembali
                    </button>
                    <div class="text-rose-800 text-xs font-bold leading-tight flex flex-col font-mono">
                        <span x-text="stopReason === 'lain lain' ? otherReason : stopReason" class="uppercase"></span>
                        <span class="text-[10px] text-rose-600">Mulai: <span x-text="stopStartTime"></span></span>
                    </div>
                </div>
            </div>

            <button @click="resetContext()" x-show="step === 2" style="display: none;" class="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span class="hidden sm:inline">Ganti Pilihan</span>
            </button>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 z-10 relative">
        <div class="min-h-full flex flex-col items-center justify-center py-4">

        <!-- STEP 1: SELECT CONTEXT -->
        <div x-show="step === 1" 
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 translate-y-8"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 -translate-y-8"
             class="w-full max-w-4xl mt-auto mb-auto">
            
            <div class="text-center mb-10">
                <h2 class="text-3xl sm:text-4xl font-black text-slate-800 mb-2 tracking-tight">Pilih Konteks Shift</h2>
                <p class="text-slate-500 font-medium">Pilih jenis produk dan mesin sebelum memulai pencatatan.</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <!-- Produk Selection -->
                <div class="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-cyan-100 p-2 rounded-lg text-cyan-600 shadow-sm border border-cyan-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wider">Jenis Produk</h3>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 flex-1">
                        <template x-for="p in products">
                            <button @click="selectProduct(p)" 
                                    :class="product === p ? 'bg-cyan-500 text-white border-cyan-500 shadow-[0_10px_20px_rgba(6,182,212,0.3)] scale-105 z-10' : 'bg-white text-slate-600 border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-cyan-600'"
                                    class="border-2 rounded-2xl py-4 px-2 font-bold text-sm transition-all duration-200 text-center uppercase tracking-wide flex items-center justify-center">
                                <span x-text="p.replace('_', ' ')"></span>
                            </button>
                        </template>
                    </div>
                </div>

                <!-- Mesin Selection -->
                <div class="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-pink-100 p-2 rounded-lg text-pink-600 shadow-sm border border-pink-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wider">Mesin IQF</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-3 flex-1">
                        <template x-for="m in machines">
                            <button @click="selectMachine(m)" 
                                    :class="machine === m ? 'bg-pink-500 text-white border-pink-500 shadow-[0_10px_20px_rgba(236,72,153,0.3)] scale-105 z-10' : 'bg-white text-slate-600 border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-pink-600'"
                                    class="border-2 rounded-2xl py-4 px-4 font-bold text-lg transition-all duration-200 text-center uppercase tracking-widest flex items-center justify-center">
                                <span x-text="m"></span>
                            </button>
                        </template>
                    </div>
                </div>

                <!-- Batch Number Selection -->
                <div class="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-indigo-100 p-2 rounded-lg text-indigo-600 shadow-sm border border-indigo-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wider">No. Batch</h3>
                    </div>
                    <div class="flex-1 flex flex-col">
                        <input type="number" 
                               x-model="batchNumber" 
                               pattern="[0-9]*" 
                               inputmode="numeric"
                               @keyup.enter="checkContext()"
                               class="w-full flex-1 text-center text-4xl sm:text-5xl font-black text-slate-800 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner placeholder-slate-300 min-h-[120px]" 
                               placeholder="Angka">
                    </div>
                </div>
            </div>

            <br>
            <div class="mt-16 sm:mt-24 text-center" x-show="product && machine && batchNumber" x-transition.opacity>
                <button @click="proceedToStep2()" style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; border: none; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.5);" class="font-black px-12 py-5 rounded-full transition-all transform hover:scale-105 active:scale-95 text-xl uppercase tracking-[0.15em] flex items-center gap-3 mx-auto">
                    Mulai Pencatatan
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </div>
        </div>

        <!-- STEP 2: INPUT LOYANG -->
        <div x-show="step === 2" 
             x-transition:enter="transition ease-out duration-300 delay-200"
             x-transition:enter-start="opacity-0 translate-y-8"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 -translate-y-8"
             class="w-full max-w-lg mt-auto mb-auto" style="display: none;">
            
            <div class="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white overflow-hidden relative">
                
                <!-- Glowing Top Accent -->
                <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 to-pink-500"></div>

                <!-- Context Info -->
                <div class="bg-slate-50/80 p-6 flex justify-between items-center border-b border-slate-100">
                    <div>
                        <span class="block text-[10px] text-cyan-600 font-bold uppercase tracking-widest mb-1">Produk</span>
                        <span class="block text-xl font-black text-slate-800 uppercase tracking-wide" x-text="product ? product.replace('_', ' ') : ''"></span>
                    </div>
                    <div class="text-right">
                        <span class="block text-[10px] text-pink-600 font-bold uppercase tracking-widest mb-1">Mesin</span>
                        <span class="block text-xl font-black text-slate-800 uppercase tracking-wide" x-text="machine"></span>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="p-6 sm:p-10">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs text-center">No. <span x-text="product === 'lumpia' || product === 'adonan_pangsit' ? 'Rongga' : 'Rak'"></span></label>
                            <input type="number" x-model="rak" @focus="$event.target.select()" pattern="[0-9]*" inputmode="numeric" class="w-full text-center text-6xl font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 py-6 transition-all" placeholder="0">
                        </div>
                        <div>
                            <label class="block text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs text-center">Jml <span x-text="product === 'lumpia' || product === 'adonan_pangsit' ? 'Pack' : 'Loyang'"></span></label>
                            <input type="number" x-model="trayCount" @focus="$event.target.select()" @keyup.enter="submitData()" pattern="[0-9]*" inputmode="numeric" class="w-full text-center text-6xl font-black text-emerald-600 bg-emerald-50 border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 py-6 transition-all shadow-inner" placeholder="0">
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="p-6 sm:p-8 pt-0">
                    <button @click="submitData()" 
                            :disabled="loading || !trayCount || trayCount <= 0"
                            :class="(loading || !trayCount || trayCount <= 0) ? 'opacity-60 cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 active:translate-y-0'"
                            class="w-full font-black text-2xl py-6 rounded-2xl transition-all duration-200 uppercase tracking-widest relative overflow-hidden group">
                        
                        <!-- Shine effect -->
                        <div class="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-30 group-hover:animate-shine"></div>

                        <span x-show="!loading" class="relative z-10 flex items-center justify-center gap-3 drop-shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            CATAT SEKARANG
                        </span>
                        
                        <span x-show="loading" class="relative z-10 flex justify-center items-center gap-3 drop-shadow-sm">
                            <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            MENCATAT...
                        </span>
                    </button>
                </div>
            </div>
            
            <!-- Total Info -->
            <div x-show="totalAchieve !== null" x-transition.opacity class="mt-8 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 text-center flex justify-between items-center">
                <div class="text-left">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Sementara</p>
                    <p class="text-xs text-slate-500 font-medium">Di Shift Ini</p>
                </div>
                <div class="text-right flex items-baseline gap-2">
                    <span class="text-4xl font-black text-emerald-500 font-mono" x-text="totalAchieve"></span>
                    <span class="text-sm font-bold text-slate-400 uppercase tracking-wider" x-text="product === 'lumpia' || product === 'adonan_pangsit' ? 'Pack' : 'Loyang'"></span>
                </div>
            </div>
            
        </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div x-show="toast.show" 
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 translate-y-10 scale-95"
         x-transition:enter-end="opacity-100 translate-y-0 scale-100"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-y-0 scale-100"
         x-transition:leave-end="opacity-0 translate-y-10 scale-95"
         class="fixed bottom-10 left-0 right-0 flex justify-center px-4 pointer-events-none z-50"
         style="display: none;">
        <div :class="toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'" 
             class="text-slate-800 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-2 flex items-center gap-4 backdrop-blur-md">
            
            <div :class="toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'" class="p-2 rounded-xl shadow-sm">
                <svg x-show="toast.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <svg x-show="toast.type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            
            <div>
                <h4 class="font-black text-lg leading-tight uppercase tracking-wider" :class="toast.type === 'success' ? 'text-emerald-700' : 'text-rose-700'" x-text="toast.title"></h4>
                <p class="text-sm font-semibold opacity-80 mt-0.5" x-text="toast.message"></p>
            </div>
        </div>
    </div>

    <style>
        @keyframes shine {
            100% { left: 200%; }
        }
        .animate-shine {
            animation: shine 1.5s infinite;
        }
    </style>

    <script>
        function operatorTerminal() {
            return {
                step: 1,
                products: ['siomay', 'pentol', 'lumpia', 'adonan_pangsit'],
                machines: ['IQF 1', 'IQF 2'],
                product: null,
                machine: null,
                batchNumber: '',
                isMachineStopped: false,
                stopStartTime: '',
                stopReason: '',
                otherReason: '',
                ongoingStopText: '',
                selectedReasons: [],
                showStopDropdown: false,
                showOtherInput: false,
                unplannedStopReasons: ['trouble kipas', 'trouble sensor', 'trouble menunggu dimsum', 'temperatur naik', 'conveyor mati', 'lain lain'],
                trayCount: '',
                loading: false,
                totalAchieve: null,
                currentTime: '',
                toast: {
                    show: false,
                    type: '',
                    title: '',
                    message: ''
                },

                init() {
                    this.updateTime();
                    setInterval(() => this.updateTime(), 1000);
                    
                    let savedProduct = localStorage.getItem('iqf_product');
                    let savedMachine = localStorage.getItem('iqf_machine');
                    let savedBatch = localStorage.getItem('iqf_batchNumber');

                    if (savedProduct && savedMachine && savedBatch) {
                        this.product = savedProduct;
                        this.machine = savedMachine;
                        this.batchNumber = savedBatch;
                        this.step = 2;
                    }

                    if (localStorage.getItem('iqf_isMachineStopped') === 'true') {
                        this.isMachineStopped = true;
                        this.stopStartTime = localStorage.getItem('iqf_stopStartTime') || '';
                        this.stopReason = localStorage.getItem('iqf_stopReason') || '';
                        this.otherReason = localStorage.getItem('iqf_otherReason') || '';
                        this.ongoingStopText = localStorage.getItem('iqf_ongoingStopText') || '';
                        try {
                            this.selectedReasons = JSON.parse(localStorage.getItem('iqf_selectedReasons')) || [];
                        } catch (e) {}
                    }
                },

                updateTime() {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
                    const dateString = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    this.currentTime = `${dateString} | ${timeString} WIB`;
                },

                batchNumber: localStorage.getItem('iqf_batchNumber') || '',
                suhuPanel: '',
                suhuProduk: '',
                rak: 0,
                trayCount: 0,
                totalAchieve: null,
                
                selectProduct(p) {
                    this.product = p;
                },
                
                selectMachine(m) {
                    this.machine = m;
                },

                checkContext() {
                    if (this.product && this.machine && this.batchNumber) {
                        this.proceedToStep2();
                    }
                },

                proceedToStep2() {
                    localStorage.setItem('iqf_product', this.product);
                    localStorage.setItem('iqf_machine', this.machine);
                    localStorage.setItem('iqf_batchNumber', this.batchNumber);
                    this.step = 2;
                },

                resetContext() {
                    this.product = null;
                    this.machine = null;
                    this.batchNumber = '';
                    localStorage.removeItem('iqf_product');
                    localStorage.removeItem('iqf_machine');
                    localStorage.removeItem('iqf_batchNumber');
                    this.step = 1;
                },

                showToast(type, title, text) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: type,
                        title: title,
                        text: text,
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        background: type === 'success' ? '#f0fdf4' : '#fef2f2',
                        color: type === 'success' ? '#166534' : '#991b1b',
                        iconColor: type === 'success' ? '#22c55e' : '#ef4444',
                    });
                },

                async submitData() {
                    if(this.loading || !this.trayCount || this.trayCount <= 0 || !this.rak) {
                        this.showToast('error', 'Gagal', (this.product === 'lumpia' || this.product === 'adonan_pangsit' ? 'Rongga' : 'Rak') + ' dan Jumlah harus diisi dengan benar');
                        return;
                    }
                    
                    this.loading = true;
                    
                    try {
                        const response = await fetch('{{ route("iqf-logsheet.storeKiosk") }}', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                product_type: this.product,
                                machine: this.machine,
                                batch_number: this.batchNumber,
                                rak: this.rak,
                                tray_count: this.trayCount
                            })
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(data.error || 'Terjadi kesalahan sistem.');
                        }

                        this.totalAchieve = data.total_achieve;
                        this.showToast('success', 'Berhasil Dicatat!', `${this.product === 'lumpia' || this.product === 'adonan_pangsit' ? 'Rongga' : 'Rak'} ${this.rak} - ${this.trayCount} ${this.product === 'lumpia' || this.product === 'adonan_pangsit' ? 'Pack' : 'Loyang'} dimasukkan.`);
                        
                        this.trayCount = 0;
                        this.rak = 0;
                        
                    } catch (error) {
                        this.showToast('error', 'Gagal Mencatat', error.message);
                    } finally {
                        this.loading = false;
                    }
                },

                async quickReportStop(reason) {
                    let finalReason = reason;

                    if (reason === 'lain lain') {
                        const { value: customText } = await Swal.fire({
                            title: 'Ketik Alasan Kendala Spesifik',
                            input: 'text',
                            inputPlaceholder: 'Contoh: Mati listrik, perbaikan conveyor...',
                            showCancelButton: true,
                            confirmButtonText: 'Simpan Kendala',
                            cancelButtonText: 'Batal',
                            confirmButtonColor: '#e11d48',
                            inputValidator: (value) => {
                                if (!value || !value.trim()) {
                                    return 'Alasan kendala tidak boleh kosong!';
                                }
                            }
                        });

                        if (!customText) return;
                        finalReason = customText.trim();
                    }

                    let now = new Date();
                    let h = String(now.getHours()).padStart(2, '0');
                    let m = String(now.getMinutes()).padStart(2, '0');
                    this.stopStartTime = `${h}.${m}`;
                    this.stopReason = finalReason;
                    
                    this.isMachineStopped = true;
                    this.showStopDropdown = false;
                    this.ongoingStopText = `${this.stopStartTime} (${finalReason})`;

                    // Persist downtime timer in localStorage
                    localStorage.setItem('iqf_isMachineStopped', 'true');
                    localStorage.setItem('iqf_stopStartTime', this.stopStartTime);
                    localStorage.setItem('iqf_stopReason', finalReason);
                    localStorage.setItem('iqf_ongoingStopText', this.ongoingStopText);

                    // Save immediately to database so UNPLANNED STOP column in master table updates instantly
                    try {
                        await fetch('{{ route("iqf-logsheet.storeUnplannedStop") }}', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                product_type: this.product,
                                machine: this.machine,
                                batch_number: this.batchNumber,
                                unplanned_stop: this.ongoingStopText
                            })
                        });
                    } catch(e) {}

                    this.showToast('error', 'Kendala Dicatat!', `Mulai: ${this.stopStartTime} [${finalReason.toUpperCase()}]`);
                },
                
                async endMachineStop() {
                    let now = new Date();
                    let h = String(now.getHours()).padStart(2, '0');
                    let m = String(now.getMinutes()).padStart(2, '0');
                    let stopEndTime = `${h}.${m}`;
                    
                    let textResult = `${this.stopStartTime} - ${stopEndTime} (${this.stopReason})`;
                    let oldText = this.ongoingStopText || `${this.stopStartTime} (${this.stopReason})`;
                    
                    this.loading = true;
                    try {
                        const response = await fetch('{{ route("iqf-logsheet.storeUnplannedStop") }}', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                product_type: this.product,
                                machine: this.machine,
                                batch_number: this.batchNumber,
                                unplanned_stop: textResult,
                                is_update: true,
                                old_text: oldText
                            })
                        });

                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan.');

                        this.showToast('success', 'Mesin Digunakan Kembali!', `Downtime: ${textResult}`);
                        
                        this.isMachineStopped = false;
                        this.stopStartTime = '';
                        this.stopReason = '';
                        this.selectedReasons = [];
                        this.otherReason = '';
                        this.ongoingStopText = '';

                        // Clear localStorage stop state
                        localStorage.removeItem('iqf_isMachineStopped');
                        localStorage.removeItem('iqf_stopStartTime');
                        localStorage.removeItem('iqf_stopReason');
                        localStorage.removeItem('iqf_selectedReasons');
                        localStorage.removeItem('iqf_otherReason');
                        localStorage.removeItem('iqf_ongoingStopText');
                    } catch (error) {
                        this.showToast('error', 'Gagal', error.message);
                    } finally {
                        this.loading = false;
                    }
                }
            }
        }
    </script>
</body>
</html>
