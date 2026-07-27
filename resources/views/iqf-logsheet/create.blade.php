@extends('layouts.app')

@section('content')
<div class="px-4 py-8 max-w-4xl mx-auto">
    <div class="flex items-center mb-6">
        <a href="{{ route('iqf-logsheet.index') }}" class="mr-4 text-gray-500 hover:text-gray-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
        <div>
            <h2 class="text-3xl font-black text-gray-800 tracking-tight">Buat Logsheet IQF Baru</h2>
            <p class="text-sm text-gray-500 mt-1">Isi data awal logsheet oleh SPV.</p>
        </div>
    </div>

    <form action="{{ route('iqf-logsheet.store') }}" method="POST" class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-6">
        @csrf
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                <input type="date" name="date" value="{{ date('Y-m-d') }}" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
            </div>
            
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Shift</label>
                <select name="shift" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                    <option value="1">Shift 1</option>
                    <option value="2">Shift 2</option>
                    <option value="3">Shift 3</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Jenis Produk</label>
                <select name="product_type" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                    <option value="siomay">Siomay</option>
                    <option value="pentol">Pentol</option>
                    <option value="lumpia">Lumpia</option>
                    <option value="adonan_pangsit">Adonan Pangsit</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Mesin IQF</label>
                <select name="machine" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                    <option value="IQF 1">IQF 1</option>
                    <option value="IQF 2">IQF 2</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">No. Batch</label>
                <input type="number" name="batch_number" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition">
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Planning Qty</label>
                <input type="number" name="planning_qty" min="0" value="0" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-cyan focus:ring-primary-cyan transition" required>
                <p class="text-xs text-gray-500 mt-1">Target total (satuan loyang/keranjang) untuk shift ini.</p>
            </div>
        </div>

        <div class="mt-8 flex justify-end">
            <button type="submit" class="bg-primary-cyan text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 font-bold shadow-md transition">
                Simpan & Buat Logsheet
            </button>
        </div>
    </form>
</div>
@endsection
