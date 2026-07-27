@extends('layouts.app')

@section('content')
<div class="px-4 py-8 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div class="flex items-center">
            <a href="{{ route('iqf-logsheet.index') }}" class="mr-4 text-gray-500 hover:text-gray-700 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <div>
                <h2 class="text-3xl font-black text-gray-800 tracking-tight">Logsheet IQF Operator</h2>
                <p class="text-sm text-gray-500 mt-1">Input data aktual secara real-time.</p>
            </div>
        </div>
        
        <div class="bg-primary-cyan text-white px-6 py-3 rounded-lg shadow-md font-mono text-xl font-bold flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span id="realtimeClock">00:00:00</span>
        </div>
    </div>

    <!-- Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Informasi Logsheet</p>
            <p class="text-lg font-bold text-gray-800 mt-1">{{ $iqfLogsheet->date }} | Shift {{ $iqfLogsheet->shift }}</p>
            <p class="text-sm text-gray-600 capitalize">{{ str_replace('_', ' ', $iqfLogsheet->product_type) }} - {{ $iqfLogsheet->machine }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Planning Qty</p>
            <p class="text-2xl font-black text-primary-cyan mt-1" id="planningQty">{{ $iqfLogsheet->planning_qty }}</p>
            <p class="text-xs text-gray-400">{{ in_array($iqfLogsheet->product_type, ['lumpia', 'adonan_pangsit']) ? 'pack' : 'loyang' }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 border-l-4 border-l-green-500">
            <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Achieve</p>
            <p class="text-2xl font-black text-green-600 mt-1" id="totalAchieve">{{ $iqfLogsheet->details->sum('tray_count') }}</p>
            <p class="text-xs text-green-500 font-semibold" id="persentaseVal">0% dari Planning</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Konversi Resep</p>
            <p class="text-2xl font-black text-purple-600 mt-1" id="konversiResep">0</p>
            <p class="text-xs text-gray-400">Achieve / 150</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Input Form -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Input Data Masuk</h3>
                
                <div id="alertError" class="hidden mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-800 font-medium"></div>
                <div id="alertSuccess" class="hidden mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded text-sm text-green-800 font-medium"></div>

                <form id="logsheetForm" onsubmit="submitLogsheet(event)">
                    @csrf
                    <div class="mb-3 grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Suhu Panel</label>
                            <input type="text" id="suhu_panel" name="suhu_panel" class="w-full text-center border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Suhu Produk</label>
                            <input type="text" id="suhu_produk" name="suhu_produk" class="w-full text-center border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan">
                        </div>
                    </div>
                    <div class="mb-4 grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">{{ in_array($iqfLogsheet->product_type, ['lumpia', 'adonan_pangsit']) ? 'Rongga' : 'Rak' }}</label>
                            <input type="number" id="rak" name="rak" class="w-full text-center font-bold text-lg border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Qty {{ in_array($iqfLogsheet->product_type, ['lumpia', 'adonan_pangsit']) ? 'Pack' : 'Loyang' }}</label>
                            <input type="number" id="tray_count" name="tray_count" min="1" class="w-full font-bold text-lg text-center border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan" required>
                        </div>
                    </div>
                    <button type="submit" id="submitBtn" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Catat Sekarang
                    </button>
                </form>
            </div>
        </div>

        <!-- History Table -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-800">Riwayat Input Hari Ini</h3>
                </div>
                <div class="overflow-x-auto max-h-[600px] custom-scrollbar">
                    <table class="w-full text-left border-collapse" id="historyTable">
                        <thead class="bg-white sticky top-0 shadow-sm">
                            <tr>
                                <th class="px-3 py-3 text-xs font-bold text-gray-600 uppercase border-b">Jam</th>
                                <th class="px-3 py-3 text-xs font-bold text-gray-600 uppercase border-b text-center">{{ in_array($iqfLogsheet->product_type, ['lumpia', 'adonan_pangsit']) ? 'Rongga' : 'Rak' }}</th>
                                <th class="px-3 py-3 text-xs font-bold text-gray-600 uppercase border-b text-center">Suhu Panel</th>
                                <th class="px-3 py-3 text-xs font-bold text-gray-600 uppercase border-b text-center">Suhu Produk</th>
                                <th class="px-3 py-3 text-xs font-bold text-gray-600 uppercase border-b text-right">Qty</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100" id="historyBody">
                            @foreach($iqfLogsheet->details->sortByDesc('time') as $detail)
                                <tr class="hover:bg-gray-50 transition">
                                    <td class="px-3 py-2 text-sm font-mono text-gray-900">{{ $detail->time }}</td>
                                    <td class="px-3 py-2 text-sm font-bold text-gray-900 text-center">{{ $detail->rak }}</td>
                                    <td class="px-3 py-2 text-sm text-gray-600 text-center">{{ $detail->suhu_panel }}</td>
                                    <td class="px-3 py-2 text-sm text-gray-600 text-center">{{ $detail->suhu_produk }}</td>
                                    <td class="px-3 py-2 text-sm font-bold text-emerald-700 text-right">{{ $detail->tray_count }}</td>
                                </tr>
                            @endforeach
                            @if($iqfLogsheet->details->isEmpty())
                                <tr id="emptyRow">
                                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">Belum ada data input.</td>
                                </tr>
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Realtime Clock
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
        document.getElementById('realtimeClock').innerText = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Initial Calculation
    const planningQty = {{ $iqfLogsheet->planning_qty }};
    let totalAchieve = {{ $iqfLogsheet->details->sum('tray_count') }};
    
    function updateCalculations() {
        document.getElementById('totalAchieve').innerText = totalAchieve;
        
        // Konversi Resep = Achieve / 150
        const konversi = (totalAchieve / 150).toFixed(2);
        document.getElementById('konversiResep').innerText = konversi;

        // Persentase
        if(planningQty > 0) {
            const persentase = ((totalAchieve / planningQty) * 100).toFixed(1);
            document.getElementById('persentaseVal').innerText = persentase + '% dari Planning';
        } else {
            document.getElementById('persentaseVal').innerText = 'Planning 0';
        }
    }
    updateCalculations();

    // AJAX Form Submission
    async function submitLogsheet(e) {
        e.preventDefault();
        
        const btn = document.getElementById('submitBtn');
        const trayCount = document.getElementById('tray_count').value;
        const suhuPanel = document.getElementById('suhu_panel').value;
        const suhuProduk = document.getElementById('suhu_produk').value;
        const rak = document.getElementById('rak').value;
        const alertErr = document.getElementById('alertError');
        const alertSucc = document.getElementById('alertSuccess');
        
        btn.disabled = true;
        btn.innerHTML = 'Menyimpan...';
        alertErr.classList.add('hidden');
        alertSucc.classList.add('hidden');

        try {
            const response = await fetch("{{ route('iqf-logsheet.storeDetail', $iqfLogsheet->id) }}", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    tray_count: trayCount,
                    suhu_panel: suhuPanel,
                    suhu_produk: suhuProduk,
                    rak: rak
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Terjadi kesalahan saat menyimpan data.');
            }

            // Success
            alertSucc.innerText = data.success;
            alertSucc.classList.remove('hidden');
            document.getElementById('tray_count').value = '';
            document.getElementById('rak').value = '';
            
            // Update Data
            totalAchieve = data.total_achieve;
            updateCalculations();

            // Add to Table
            const tbody = document.getElementById('historyBody');
            const emptyRow = document.getElementById('emptyRow');
            if(emptyRow) emptyRow.remove();

            const newRow = `
                <tr class="hover:bg-gray-50 transition bg-green-50">
                    <td class="px-3 py-2 text-sm font-mono text-gray-900">${data.detail.time}</td>
                    <td class="px-3 py-2 text-sm font-bold text-gray-900 text-center">${data.detail.rak || '-'}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 text-center">${data.detail.suhu_panel || '-'}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 text-center">${data.detail.suhu_produk || '-'}</td>
                    <td class="px-3 py-2 text-sm font-bold text-emerald-700 text-right">${data.detail.tray_count}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('afterbegin', newRow);
            
            // Re-enable after short delay
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Catat Sekarang';
            }, 1000);

        } catch (error) {
            alertErr.innerText = error.message;
            alertErr.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Coba Lagi';
        }
    }
</script>
@endsection
