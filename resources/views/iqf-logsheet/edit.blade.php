@extends('layouts.app')

@section('content')
<div class="px-4 py-8 max-w-4xl mx-auto">
    <div class="flex items-center mb-6">
        <a href="{{ route('iqf-logsheet.index') }}" class="mr-4 text-gray-500 hover:text-gray-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
        <div>
            <h2 class="text-3xl font-black text-gray-800 tracking-tight">Edit Logsheet IQF</h2>
            <p class="text-sm text-gray-500 mt-1">Ubah data awal logsheet oleh SPV.</p>
        </div>
    </div>

    <form action="{{ route('iqf-logsheet.update', $iqfLogsheet->id) }}" method="POST" class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-6">
        @csrf
        @method('PUT')
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                <input type="date" name="date" value="{{ $iqfLogsheet->date }}" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
            </div>
            
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Shift</label>
                <select name="shift" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                    <option value="1" {{ $iqfLogsheet->shift == 1 ? 'selected' : '' }}>Shift 1</option>
                    <option value="2" {{ $iqfLogsheet->shift == 2 ? 'selected' : '' }}>Shift 2</option>
                    <option value="3" {{ $iqfLogsheet->shift == 3 ? 'selected' : '' }}>Shift 3</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Jenis Produk</label>
                <select name="product_type" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                    <option value="siomay" {{ $iqfLogsheet->product_type == 'siomay' ? 'selected' : '' }}>Siomay</option>
                    <option value="pentol" {{ $iqfLogsheet->product_type == 'pentol' ? 'selected' : '' }}>Pentol</option>
                    <option value="lumpia" {{ $iqfLogsheet->product_type == 'lumpia' ? 'selected' : '' }}>Lumpia</option>
                    <option value="adonan_pangsit" {{ $iqfLogsheet->product_type == 'adonan_pangsit' ? 'selected' : '' }}>Adonan Pangsit</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Mesin IQF</label>
                <select name="machine" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                    <option value="IQF 1" {{ $iqfLogsheet->machine == 'IQF 1' ? 'selected' : '' }}>IQF 1</option>
                    <option value="IQF 2" {{ $iqfLogsheet->machine == 'IQF 2' ? 'selected' : '' }}>IQF 2</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Planning Qty</label>
                <input type="number" name="planning_qty" min="0" value="{{ $iqfLogsheet->planning_qty }}" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                <p class="text-xs text-gray-500 mt-1">Target total (satuan loyang/keranjang) untuk shift ini.</p>
            </div>
        </div>

        <hr class="my-8 border-gray-200">
        
        <div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">Edit Data Aktual Per Jam (Loyang)</h3>
            <p class="text-sm text-gray-500 mb-6">Kosongkan jika belum ada data untuk jam tersebut.</p>
            
            @php
                $shiftHours = [];
                if ($iqfLogsheet->shift == 1) {
                    $shiftHours = [6, 7, 8, 9, 10, 11, 12, 13];
                } elseif ($iqfLogsheet->shift == 2) {
                    $shiftHours = [14, 15, 16, 17, 18, 19, 20, 21];
                } else {
                    $shiftHours = [22, 23, 0, 1, 2, 3, 4, 5];
                }
            @endphp
            
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                @foreach($shiftHours as $hour)
                    <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                        <label class="block text-sm font-bold text-gray-700 mb-2">{{ sprintf('%02d:00', $hour) }}</label>
                        <input type="number" 
                               name="hourly_data[{{ $hour }}]" 
                               min="0"
                               value="{{ $hourlyDetails[$hour] ?? '' }}" 
                               class="w-full text-center border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" 
                               placeholder="-">
                    </div>
                @endforeach
            </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
            <a href="{{ route('iqf-logsheet.index') }}" class="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 font-bold transition">Batal</a>
            <button type="submit" class="bg-primary-cyan text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 font-bold shadow-md transition">
                Simpan Perubahan
            </button>
        </div>
    </form>
</div>
@endsection
