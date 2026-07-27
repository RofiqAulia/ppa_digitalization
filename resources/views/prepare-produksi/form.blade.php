@extends('layouts.app')

@section('content')
@php
    $isEdit = $header->exists;
    $actionUrl = $isEdit ? route('prepare-produksi.update', $header->id) : route('prepare-produksi.store');
@endphp

<div class="px-4 sm:px-0" x-data="formLogic()">
    <div class="mb-4">
        <a href="{{ route('prepare-produksi.index') }}" class="text-primary-cyan hover:underline">&larr; Kembali ke Daftar</a>
    </div>

    @if($errors->any())
        <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong class="font-bold">Oops! Ada kesalahan.</strong>
            <ul class="mt-2 list-disc list-inside text-sm">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif
    @if(session('error'))
        <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong class="font-bold">Error!</strong> {{ session('error') }}
        </div>
    @endif

    <div class="bg-white shadow sm:rounded-lg mb-8">
        <!-- Tabs Header -->
        <div class="border-b border-gray-200">
            <nav class="flex -mb-px" aria-label="Tabs">
                <template x-for="(tab, index) in tabs" :key="index">
                    <button type="button" 
                        @click="activeTab = index"
                        :class="activeTab === index ? 'border-primary-pink text-primary-pink' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                        class="w-full sm:w-auto py-4 px-4 text-center border-b-2 font-medium text-sm transition-colors duration-150"
                        x-text="tab">
                    </button>
                </template>
            </nav>
        </div>

        <form action="{{ $actionUrl }}" method="POST" id="mainForm" novalidate>
            @csrf
            @if($isEdit)
                @method('PUT')
            @endif

            <div class="p-6">
                <!-- Tab 1: Info Header -->
                <div x-show="activeTab === 0" x-transition.opacity>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Informasi Header (SPV)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input type="date" name="date" value="{{ old('date', $header->date) }}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-cyan focus:border-primary-cyan" {{ $isEdit ? 'readonly' : 'required' }}>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Shift</label>
                            <select name="shift" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-cyan focus:border-primary-cyan" {{ $isEdit ? 'disabled' : 'required' }}>
                                <option value="">Pilih Shift</option>
                                @foreach(['1', '2', '3'] as $shift)
                                    <option value="{{ $shift }}" {{ old('shift', $header->shift) == $shift ? 'selected' : '' }}>Shift {{ $shift }}</option>
                                @endforeach
                            </select>
                            @if($isEdit) <input type="hidden" name="shift" value="{{ $header->shift }}"> @endif
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">SPV Name</label>
                            <select name="spv_name" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-cyan focus:border-primary-cyan" {{ $isEdit ? 'disabled' : 'required' }}>
                                <option value="">Pilih SPV</option>
                                @foreach(['IS', 'ROFI', 'JERE', 'IMAN', 'MUN', 'KA', 'ABDI', 'APRI'] as $spv)
                                    <option value="{{ $spv }}" {{ old('spv_name', $header->spv_name) == $spv ? 'selected' : '' }}>{{ $spv }}</option>
                                @endforeach
                            </select>
                            @if($isEdit) <input type="hidden" name="spv_name" value="{{ $header->spv_name }}"> @endif
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Total Resep Plan</label>
                            <input type="number" step="0.01" name="total_recipe_plan" :value="totalPlan" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed focus:ring-primary-cyan focus:border-primary-cyan" readonly>
                        </div>
                        @if($isEdit)
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 text-primary-pink">Total Resep Real (Admin)</label>
                            <input type="number" step="0.01" name="total_recipe_real" value="{{ old('total_recipe_real', $header->total_recipe_real) }}" class="mt-1 block w-full border-primary-cyan rounded-md shadow-sm focus:ring-primary-pink focus:border-primary-pink" required>
                        </div>
                        @endif
                    </div>
                    <div class="mt-6 flex justify-end">
                        @if(!$isEdit)
                            <button type="button" x-show="totalPlan == 0" @click="activeTab = 1" class="bg-primary-cyan text-white px-4 py-2 rounded-md shadow hover:bg-opacity-90 transition">Selanjutnya &rarr;</button>
                            <button type="submit" x-show="totalPlan > 0" class="bg-primary-pink text-white px-6 py-2 rounded-md shadow font-bold hover:bg-opacity-90 transition transform hover:scale-105" x-cloak>Simpan Plan (SPV)</button>
                        @else
                            <button type="button" @click="activeTab = 1" class="bg-primary-cyan text-white px-4 py-2 rounded-md shadow hover:bg-opacity-90 transition">Selanjutnya &rarr;</button>
                        @endif
                    </div>
                </div>

                <!-- Tab 2: Produk Utama -->
                <div x-show="activeTab === 1" x-transition.opacity style="display: none;">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Produk Utama</h3>
                    
                    <div class="space-y-6">
                        @php
                            $products = ['siomay' => 'Siomay', 'pentol' => 'Pentol', 'lumpia' => 'Lumpia'];
                        @endphp
                        @foreach($products as $key => $label)
                        <div class="border-2 border-primary-cyan rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                            <div class="bg-primary-cyan text-white px-4 py-3 font-bold flex justify-between items-center">
                                <span class="text-lg">{{ $label }}</span>
                                @if($isEdit)
                                    <span x-text="getDiffStatus('{{ $key }}')" :class="getDiffColor('{{ $key }}')" class="bg-white px-3 py-1 rounded-full text-xs shadow-inner"></span>
                                @endif
                            </div>
                            <div class="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                @php 
                                    $detail = $isEdit ? $header->productDetails->where('product_type', $key)->first() : null; 
                                @endphp
                                
                                <!-- Plan -->
                                <div>
                                    <label class="block text-xs font-bold text-gray-700">Resep Plan</label>
                                    <input type="number" step="0.01" x-model="data.{{ $key }}.plan" name="products[{{ $key }}][recipe_plan]" value="{{ old("products.{$key}.recipe_plan", $detail?->recipe_plan ?? '') }}" class="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 shadow-sm focus:ring-primary-cyan sm:text-sm" {{ $isEdit ? 'readonly' : 'required' }} placeholder="0.00">
                                </div>

                                @if($isEdit)
                                <!-- Realization -->
                                <div>
                                    <label class="block text-xs font-bold text-primary-pink">Resep Realisasi</label>
                                    <input type="number" step="0.01" x-model="data.{{ $key }}.real" name="products[{{ $key }}][recipe_real]" value="{{ old("products.{$key}.recipe_real", $detail?->recipe_real ?? '') }}" class="mt-1 block w-full border border-primary-pink rounded-md p-2 bg-white sm:text-sm shadow-sm focus:ring-primary-pink focus:border-primary-pink" required placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-700">Dikichi (gr)</label>
                                    <input type="number" step="0.01" name="products[{{ $key }}][dikichi]" value="{{ old("products.{$key}.dikichi", $detail?->dikichi ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md bg-white sm:text-sm focus:ring-primary-cyan shadow-sm" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-700">Adonan Akhir (gr)</label>
                                    <input type="number" step="0.01" name="products[{{ $key }}][adonan_akhir_gr]" value="{{ old("products.{$key}.adonan_akhir_gr", $detail?->adonan_akhir_gr ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md bg-white sm:text-sm focus:ring-primary-cyan shadow-sm" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-700">Adonan Masuk (gr)</label>
                                    <input type="number" step="0.01" name="products[{{ $key }}][adonan_masuk_gr]" value="{{ old("products.{$key}.adonan_masuk_gr", $detail?->adonan_masuk_gr ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md bg-white sm:text-sm focus:ring-primary-cyan shadow-sm" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-700">Waste (gr)</label>
                                    <input type="number" step="0.01" name="products[{{ $key }}][waste_gr]" value="{{ old("products.{$key}.waste_gr", $detail?->waste_gr ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md bg-white sm:text-sm focus:ring-primary-cyan shadow-sm" placeholder="0.00">
                                </div>
                                <div class="md:col-span-3 lg:col-span-6 border-t pt-2 mt-2">
                                    <label class="block text-xs font-medium text-gray-700">Retur (gr)</label>
                                    <input type="number" step="0.01" name="products[{{ $key }}][retur_gr]" value="{{ old("products.{$key}.retur_gr", $detail?->retur_gr ?? '') }}" class="mt-1 block w-full lg:w-1/6 border border-gray-300 p-2 rounded-md bg-white sm:text-sm focus:ring-primary-cyan shadow-sm" placeholder="0.00">
                                </div>
                                @endif
                            </div>
                        </div>
                        @endforeach
                    </div>

                    <div class="mt-6 flex justify-between">
                        <button type="button" @click="activeTab = 0" class="text-gray-600 font-medium hover:text-primary-cyan transition">&larr; Sebelumnya</button>
                        @if($isEdit)
                        <button type="button" @click="activeTab = 2" class="bg-primary-cyan text-white px-4 py-2 rounded-md shadow hover:bg-opacity-90 transition">Selanjutnya &rarr;</button>
                        @else
                        <!-- SPV Ends here, they just save -->
                        <button type="button" @click="activeTab = 0" class="bg-primary-cyan text-white px-6 py-2 rounded-md shadow font-bold hover:bg-opacity-90 transition transform hover:scale-105">Selanjutnya (Review Total) &rarr;</button>
                        @endif
                    </div>
                </div>

                @if($isEdit)
                <!-- Tab 3: Bahan Kulit & Topping -->
                <div x-show="activeTab === 2" x-transition.opacity style="display: none;">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Bahan Kulit & Topping</h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        @php $skins = ['kulit_siomay' => 'Kulit Siomay', 'kulit_tahu' => 'Kulit Tahu']; @endphp
                        @foreach($skins as $key => $label)
                        <div class="bg-white p-5 border shadow-sm rounded-lg hover:shadow-md transition">
                            <h4 class="font-bold text-primary-cyan text-lg mb-4">{{ $label }}</h4>
                            @php $skin = $header->skinMaterials->where('material_type', $key)->first(); @endphp
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium">Masuk</label>
                                    <input type="number" step="0.01" name="skins[{{ $key }}][masuk]" value="{{ old("skins.{$key}.masuk", $skin?->masuk ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm bg-white focus:ring-primary-cyan" placeholder="0.00">
                                </div>
                                <div class="col-span-2 grid grid-cols-2 gap-3 p-3 border-2 border-dashed border-gray-200 bg-gray-50 rounded">
                                    <label class="block text-sm font-bold col-span-2 text-gray-600">Sisa</label>
                                    <div>
                                        <label class="block text-xs font-medium text-gray-700">Pack (Bulat)</label>
                                        <input type="number" name="skins[{{ $key }}][sisa_pack]" value="{{ old("skins.{$key}.sisa_pack", $skin?->sisa_pack ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md text-sm bg-white shadow-sm focus:ring-primary-cyan" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-gray-700">Unit/Lmbr (Desimal)</label>
                                        <input type="number" step="0.01" name="skins[{{ $key }}][sisa_unit]" value="{{ old("skins.{$key}.sisa_unit", $skin?->sisa_unit ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md text-sm bg-white shadow-sm focus:ring-primary-cyan" placeholder="0.00">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium">Waste Manual (gr)</label>
                                    <input type="number" step="0.01" name="skins[{{ $key }}][waste_manual_gr]" value="{{ old("skins.{$key}.waste_manual_gr", $skin?->waste_manual_gr ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md text-sm bg-white shadow-sm focus:ring-primary-cyan" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium">Waste Tandon (gr)</label>
                                    <input type="number" step="0.01" name="skins[{{ $key }}][waste_tandon_gr]" value="{{ old("skins.{$key}.waste_tandon_gr", $skin?->waste_tandon_gr ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md text-sm bg-white shadow-sm focus:ring-primary-cyan" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium">Retur PRO WH</label>
                                    <input type="number" step="0.01" name="skins[{{ $key }}][retur_pro_wh]" value="{{ old("skins.{$key}.retur_pro_wh", $skin?->retur_pro_wh ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md text-sm bg-white shadow-sm focus:ring-primary-cyan" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium">Retur WH PRO</label>
                                    <input type="number" step="0.01" name="skins[{{ $key }}][retur_wh_pro]" value="{{ old("skins.{$key}.retur_wh_pro", $skin?->retur_wh_pro ?? '') }}" class="mt-1 block w-full border border-gray-300 p-2 rounded-md text-sm bg-white shadow-sm focus:ring-primary-cyan" placeholder="0.00">
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>

                    <div class="mt-8 p-5 border shadow-sm rounded-lg bg-white">
                        <h4 class="font-bold text-primary-cyan text-lg mb-3">Topping (Jika Ada)</h4>
                        @php $topping = $header->toppings->first(); @endphp
                        <div class="w-full md:w-1/2">
                            <label class="block text-sm font-medium">Topping Weight (gr)</label>
                            <input type="number" step="0.01" name="toppings[topping_weight_gr]" value="{{ old('toppings.topping_weight_gr', $topping?->topping_weight_gr ?? '') }}" class="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white shadow-sm focus:ring-primary-cyan" placeholder="0.00">
                        </div>
                    </div>

                    <div class="mt-6 flex justify-between">
                        <button type="button" @click="activeTab = 1" class="text-gray-600 font-medium hover:text-primary-cyan transition">&larr; Sebelumnya</button>
                        <button type="button" @click="activeTab = 3" class="bg-primary-cyan text-white px-4 py-2 rounded-md shadow hover:bg-opacity-90 transition">Selanjutnya &rarr;</button>
                    </div>
                </div>

                <!-- Tab 4: Waste & Retur Umum -->
                <div x-show="activeTab === 3" x-transition.opacity style="display: none;">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Waste & Retur Tambahan</h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- General Wastes -->
                        <div class="bg-white p-5 border shadow-sm rounded-lg">
                            <h4 class="font-bold text-primary-cyan text-lg mb-4">General Wastes</h4>
                            @php $wasteTypes = ['plastik' => 'Plastik', 'ham_adonan' => 'Ham Adonan', 'bowlcutter_dimsum' => 'Bowlcutter Dimsum']; @endphp
                            @foreach($wasteTypes as $key => $label)
                            @php $waste = $header->wasteLogs->where('waste_type', $key)->first(); @endphp
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700">{{ $label }} (gr)</label>
                                <input type="number" step="0.01" name="wastes[{{ $key }}][weight_gr]" value="{{ old("wastes.{$key}.weight_gr", $waste?->weight_gr ?? '') }}" class="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white shadow-sm focus:ring-primary-cyan focus:border-primary-cyan" placeholder="0.00">
                            </div>
                            @endforeach
                        </div>

                        <!-- Serah Terima & Retur -->
                        <div class="bg-white p-5 border shadow-sm rounded-lg">
                            <h4 class="font-bold text-primary-cyan text-lg mb-4">Serah Terima & Retur Produk</h4>
                            @foreach(['siomay' => 'Siomay', 'pentol' => 'Pentol', 'lumpia' => 'Lumpia'] as $key => $label)
                            @php $retur = $header->returDetails->where('product_type', $key)->first(); @endphp
                            <div class="mb-5 pb-5 border-b last:border-b-0 last:pb-0 last:mb-0">
                                <h5 class="font-bold text-sm mb-3 text-gray-800">{{ $label }}</h5>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs text-gray-600 font-medium">Serah Terima Retur (gr)</label>
                                        <input type="number" step="0.01" name="returs[{{ $key }}][serah_terima_retur_gr]" value="{{ old("returs.{$key}.serah_terima_retur_gr", $retur?->serah_terima_retur_gr ?? '') }}" class="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-sm focus:ring-primary-cyan" placeholder="0.00">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 font-medium">Retur Prepare > Prod (gr)</label>
                                        <input type="number" step="0.01" name="returs[{{ $key }}][retur_prepare_to_produksi_gr]" value="{{ old("returs.{$key}.retur_prepare_to_produksi_gr", $retur?->retur_prepare_to_produksi_gr ?? '') }}" class="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-sm focus:ring-primary-cyan" placeholder="0.00">
                                    </div>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    </div>

                    <div class="mt-6 flex justify-between">
                        <button type="button" @click="activeTab = 2" class="text-gray-600 font-medium hover:text-primary-cyan transition">&larr; Sebelumnya</button>
                        <button type="button" @click="activeTab = 4" class="bg-primary-cyan text-white px-4 py-2 rounded-md shadow hover:bg-opacity-90 transition">Selanjutnya (Review) &rarr;</button>
                    </div>
                </div>

                <!-- Tab 5: Review & Kunci Digital -->
                <div x-show="activeTab === 4" x-transition.opacity style="display: none;">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Review & Submit</h3>
                    
                    <div class="bg-blue-50 border-l-4 border-primary-cyan p-4 mb-6 rounded">
                        <p class="text-sm text-gray-700">Harap periksa kembali semua tab sebelum menyimpan. Data yang sudah di-submit dengan PIN tidak dapat diubah kembali secara normal.</p>
                    </div>

                    <div class="mb-8">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Catatan / Keterangan (Opsional)</label>
                        <textarea name="notes" rows="3" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-cyan focus:border-primary-cyan p-3">{{ old('notes', $header->notes) }}</textarea>
                    </div>

                    <div class="bg-white border-2 border-primary-cyan p-8 rounded-xl shadow-lg text-center max-w-md mx-auto transform transition hover:scale-[1.02]">
                        <div class="mb-4 text-primary-cyan">
                            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h4 class="font-bold text-xl mb-4 text-gray-800">Otorisasi Digital Admin</h4>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Masukkan PIN (contoh: 123456)</label>
                            <input type="password" name="pin" class="block w-full text-center tracking-widest text-2xl py-3 border-gray-300 rounded-lg shadow-inner focus:ring-primary-pink focus:border-primary-pink" required placeholder="••••••">
                        </div>
                        <button type="submit" class="w-full bg-primary-pink text-white font-bold text-lg px-6 py-4 rounded-lg shadow-md hover:bg-opacity-90 hover:shadow-lg transition">
                            Kunci & Simpan Logsheet
                        </button>
                    </div>

                    <div class="mt-6 flex justify-start">
                        <button type="button" @click="activeTab = 3" class="text-gray-600 font-medium hover:text-primary-cyan transition">&larr; Sebelumnya</button>
                    </div>
                </div>
                @endif
            </div>
        </form>
    </div>
</div>

<script>
function formLogic() {
    return {
        isEdit: {{ $isEdit ? 'true' : 'false' }},
        activeTab: 0,
        tabs: {!! $isEdit ? "['Info Header', 'Produk Utama', 'Bahan Kulit', 'Waste', 'Review & Submit']" : "['Info Header', 'Produk Utama']" !!},
        data: {
            siomay: { 
                plan: {{ old('products.siomay.recipe_plan', $header->productDetails->where('product_type', 'siomay')->first()?->recipe_plan ?? 0) }}, 
                real: {{ old('products.siomay.recipe_real', $header->productDetails->where('product_type', 'siomay')->first()?->recipe_real ?? 'null') }} 
            },
            pentol: { 
                plan: {{ old('products.pentol.recipe_plan', $header->productDetails->where('product_type', 'pentol')->first()?->recipe_plan ?? 0) }}, 
                real: {{ old('products.pentol.recipe_real', $header->productDetails->where('product_type', 'pentol')->first()?->recipe_real ?? 'null') }} 
            },
            lumpia: { 
                plan: {{ old('products.lumpia.recipe_plan', $header->productDetails->where('product_type', 'lumpia')->first()?->recipe_plan ?? 0) }}, 
                real: {{ old('products.lumpia.recipe_real', $header->productDetails->where('product_type', 'lumpia')->first()?->recipe_real ?? 'null') }} 
            }
        },
        get totalPlan() {
            let s = parseFloat(this.data.siomay.plan) || 0;
            let p = parseFloat(this.data.pentol.plan) || 0;
            let l = parseFloat(this.data.lumpia.plan) || 0;
            return s + p + l;
        },
        getDiff(type) {
            let p = parseFloat(this.data[type].plan) || 0;
            let r = parseFloat(this.data[type].real) || 0;
            if(this.data[type].real === null || isNaN(this.data[type].real)) return null;
            return r - p;
        },
        getDiffStatus(type) {
            let diff = this.getDiff(type);
            if (diff === null) return 'TBD';
            return diff < 0 ? `Selisih: ${diff.toFixed(2)}` : `Selisih: +${diff.toFixed(2)}`;
        },
        getDiffColor(type) {
            let diff = this.getDiff(type);
            if (diff === null) return 'text-gray-500 bg-gray-100';
            return diff < 0 ? 'text-red-600 font-bold bg-red-50' : 'text-green-600 font-bold bg-green-50';
        }
    }
}
</script>
@endsection
