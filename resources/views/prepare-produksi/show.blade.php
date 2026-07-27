@extends('layouts.app')

@section('content')
<div class="w-full min-h-screen bg-gray-200 py-8 flex flex-col items-center font-sans">
    
    <!-- Action Buttons -->
    <div class="w-full max-w-[210mm] flex justify-end gap-3 mb-6 print:hidden">
        <a href="{{ route('prepare-produksi.index') }}" class="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 font-bold rounded border border-gray-300 hover:bg-gray-50 transition shadow-sm text-sm" style="text-decoration: none;">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali
        </a>
        <button onclick="window.print()" class="inline-flex items-center justify-center px-4 py-2 text-white font-bold rounded shadow-sm text-sm" style="background-color: #1f2937; border: none; cursor: pointer;">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Cetak
        </button>
        <button onclick="downloadPDF()" class="inline-flex items-center justify-center px-4 py-2 text-white font-bold rounded shadow-sm text-sm" style="background-color: #dc2626; border: none; cursor: pointer;">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Download
        </button>
    </div>

    <!-- A4 Paper Container -->
    <div id="printable-area" class="a4-container">
        
        <!-- Header / Letterhead -->
        <div style="display: flex; align-items: center; margin-bottom: 5px; min-height: 55px;">
            <div style="flex: 0 0 auto; display: flex; align-items: center;">
                <img src="{{ asset('images/ppa.jpg') }}" alt="Logo PPA" style="height: 50px; margin-right: 10px;">
                <img src="{{ asset('images/LogoMieGacoan.png') }}" alt="Logo Gacoan" style="height: 50px;">
            </div>
            <div style="flex: 1 1 auto; text-align: center;">
                <div class="company-name">PT PESTA PORA ABADI</div>
                <div class="document-title" style="white-space: nowrap;">LAPORAN LOGSHEET PREPARE PRODUKSI</div>
            </div>
        </div>
        <div class="header-line"></div>

        @php
            $siomay = $header->productDetails->where('product_type', 'siomay')->first();
            $pentol = $header->productDetails->where('product_type', 'pentol')->first();
            $lumpia = $header->productDetails->where('product_type', 'lumpia')->first();
            
            $r_siomay = $header->returDetails->where('product_type', 'siomay')->first();
            $r_pentol = $header->returDetails->where('product_type', 'pentol')->first();
            $r_lumpia = $header->returDetails->where('product_type', 'lumpia')->first();
            $topping = $header->toppings->first();

            $w_plastik = $header->wasteLogs->where('waste_type', 'plastik')->first();
            $w_ham = $header->wasteLogs->where('waste_type', 'ham_adonan')->first();
            $w_bowl = $header->wasteLogs->where('waste_type', 'bowlcutter_dimsum')->first();

            $k_siomay = $header->skinMaterials->where('material_type', 'kulit_siomay')->first();
            $k_tahu = $header->skinMaterials->where('material_type', 'kulit_tahu')->first();
        @endphp

        <!-- Meta Information -->
        <table class="meta-table">
            <tr>
                <td style="width: 25%;">
                    <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #555;">Tanggal</div>
                    <div style="font-weight: bold; margin-top: 2px;">{{ \Carbon\Carbon::parse($header->date)->locale('id')->translatedFormat('d F Y') }}</div>
                </td>
                <td style="width: 25%;">
                    <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #555;">Shift</div>
                    <div style="font-weight: bold; margin-top: 2px;">{{ $header->shift }}</div>
                </td>
                <td style="width: 25%;">
                    <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #555;">Supervisor</div>
                    <div style="font-weight: bold; margin-top: 2px;">{{ $header->spv_name }}</div>
                </td>
                <td style="width: 25%;">
                    <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #555;">Total Resep Plan</div>
                    <div style="font-weight: bold; margin-top: 2px;">{{ $header->total_recipe_plan }} batch</div>
                </td>
            </tr>
        </table>

        <!-- 1. Detail Produksi -->
        <div class="section-title">1. RINCIAN PRODUKSI</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Produk</th>
                    <th>Plan</th>
                    <th>Real</th>
                    <th>Dikichi</th>
                    <th>Adonan Akhir</th>
                    <th>Adonan Masuk</th>
                    <th>Selisih</th>
                    <th>Waste (gr)</th>
                    <th>Retur (gr)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Siomay</strong></td>
                    <td class="text-center">{{ $siomay?->recipe_plan ?? '-' }}</td>
                    <td class="text-center font-bold">{{ $siomay?->recipe_real ?? '-' }}</td>
                    <td class="text-center">{{ $siomay?->dikichi ?? '-' }}</td>
                    <td class="text-center">{{ $siomay?->adonan_akhir_gr ?? '-' }}</td>
                    <td class="text-center">{{ $siomay?->adonan_masuk_gr ?? '-' }}</td>
                    <td class="text-center font-bold">{{ isset($siomay?->recipe_plan, $siomay?->recipe_real) ? ($siomay->recipe_real - $siomay->recipe_plan) : '-' }}</td>
                    <td class="text-center">{{ $siomay?->waste_gr ?? '-' }}</td>
                    <td class="text-center">{{ $siomay?->retur_gr ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Pentol</strong></td>
                    <td class="text-center">{{ $pentol?->recipe_plan ?? '-' }}</td>
                    <td class="text-center font-bold">{{ $pentol?->recipe_real ?? '-' }}</td>
                    <td class="text-center">{{ $pentol?->dikichi ?? '-' }}</td>
                    <td class="text-center">{{ $pentol?->adonan_akhir_gr ?? '-' }}</td>
                    <td class="text-center">{{ $pentol?->adonan_masuk_gr ?? '-' }}</td>
                    <td class="text-center font-bold">{{ isset($pentol?->recipe_plan, $pentol?->recipe_real) ? ($pentol->recipe_real - $pentol->recipe_plan) : '-' }}</td>
                    <td class="text-center">{{ $pentol?->waste_gr ?? '-' }}</td>
                    <td class="text-center">{{ $pentol?->retur_gr ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Lumpia</strong></td>
                    <td class="text-center">{{ $lumpia?->recipe_plan ?? '-' }}</td>
                    <td class="text-center font-bold">{{ $lumpia?->recipe_real ?? '-' }}</td>
                    <td class="text-center">{{ $lumpia?->dikichi ?? '-' }}</td>
                    <td class="text-center">{{ $lumpia?->adonan_akhir_gr ?? '-' }}</td>
                    <td class="text-center">{{ $lumpia?->adonan_masuk_gr ?? '-' }}</td>
                    <td class="text-center font-bold">{{ isset($lumpia?->recipe_plan, $lumpia?->recipe_real) ? ($lumpia->recipe_real - $lumpia->recipe_plan) : '-' }}</td>
                    <td class="text-center">{{ $lumpia?->waste_gr ?? '-' }}</td>
                    <td class="text-center">{{ $lumpia?->retur_gr ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Total Realisasi</strong></td>
                    <td colspan="8" class="font-bold">
                        {{ $header->total_recipe_real ?? '-' }} batch
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 2 & 3 side by side -->
        <table class="layout-table">
            <tr>
                <td style="width: 50%; padding-right: 15px; vertical-align: top;">
                    <div class="section-title">2. SERAH TERIMA (gr)</div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Topping</td>
                                <td class="text-center font-bold">{{ $topping?->topping_weight_gr ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td>Siomay (Retur)</td>
                                <td class="text-center font-bold">{{ $r_siomay?->serah_terima_retur_gr ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td>Pentol (Retur)</td>
                                <td class="text-center font-bold">{{ $r_pentol?->serah_terima_retur_gr ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td>Lumpia (Retur)</td>
                                <td class="text-center font-bold">{{ $r_lumpia?->serah_terima_retur_gr ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td>Prepare to Prod (Retur)</td>
                                <td class="text-center font-bold">{{ $r_siomay?->retur_prepare_to_produksi_gr ?? '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td style="width: 50%; padding-left: 15px; vertical-align: top;">
                    <div class="section-title">3. PENCATATAN WASTE (gr)</div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Jenis Waste</th>
                                <th>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Plastik</td>
                                <td class="text-center font-bold">{{ $w_plastik?->weight_gr ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td>Ham Adonan</td>
                                <td class="text-center font-bold">{{ $w_ham?->weight_gr ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td>Bowlcutter Dimsum</td>
                                <td class="text-center font-bold">{{ $w_bowl?->weight_gr ?? '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>

        <!-- 4. Kulit -->
        <div class="section-title">4. PENGGUNAAN BAHAN KULIT</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Jenis Kulit</th>
                    <th>Masuk</th>
                    <th>Sisa Pack</th>
                    <th>Sisa Unit</th>
                    <th>W. Manual (gr)</th>
                    <th>W. Tandon (gr)</th>
                    <th>Retur Pro-WH</th>
                    <th>Retur WH-Pro</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Kulit Siomay</strong></td>
                    <td class="text-center">{{ $k_siomay?->masuk ?? '-' }}</td>
                    <td class="text-center">{{ $k_siomay?->sisa_pack ?? '-' }}</td>
                    <td class="text-center">{{ $k_siomay?->sisa_unit ?? '-' }}</td>
                    <td class="text-center">{{ $k_siomay?->waste_manual_gr ?? '-' }}</td>
                    <td class="text-center">{{ $k_siomay?->waste_tandon_gr ?? '-' }}</td>
                    <td class="text-center">{{ $k_siomay?->retur_pro_wh ?? '-' }}</td>
                    <td class="text-center">{{ $k_siomay?->retur_wh_pro ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Kulit Tahu</strong></td>
                    <td class="text-center">{{ $k_tahu?->masuk ?? '-' }}</td>
                    <td class="text-center">{{ $k_tahu?->sisa_pack ?? '-' }}</td>
                    <td class="text-center">{{ $k_tahu?->sisa_unit ?? '-' }}</td>
                    <td class="text-center">{{ $k_tahu?->waste_manual_gr ?? '-' }}</td>
                    <td class="text-center">-</td>
                    <td class="text-center">{{ $k_tahu?->retur_pro_wh ?? '-' }}</td>
                    <td class="text-center">{{ $k_tahu?->retur_wh_pro ?? '-' }}</td>
                </tr>
            </tbody>
        </table>

        <!-- 5. Catatan -->
        <div class="section-title">5. CATATAN / KETERANGAN</div>
        <div class="notes-box">
            {!! nl2br(e($header->notes ?? 'Tidak ada catatan tambahan.')) !!}
        </div>

        <!-- E-Signature Section -->
        <div style="text-align: right; margin-bottom: 5px; margin-top: 15px;">
            Malang, {{ \Carbon\Carbon::parse($header->created_at)->locale('id')->translatedFormat('d F Y') }}
        </div>
        <table class="signature-table" style="margin-top: 5px;">
            <tr>
                <td style="width: 33.33%; text-align: center;">
                    <div class="signature-box" style="margin: 0 auto;">
                        <p style="margin: 0;">Dibuat Oleh,</p>
                        <p style="margin: 0 0 5px 0;"><strong>Admin Produksi</strong></p>
                        
                        <div class="signature-space dashed-box">
                            <span style="color: #999; font-size: 10pt; font-family: Arial, sans-serif;">Menunggu Validasi</span>
                        </div>

                        <p style="margin: 0;"><strong>&nbsp;</strong></p>
                    </div>
                </td>
                <td style="width: 33.33%; text-align: center;">
                    <div class="signature-box" style="margin: 0 auto;">
                        <p style="margin: 0;">Diperiksa Oleh,</p>
                        <p style="margin: 0 0 5px 0;"><strong>SPV Prepare Produksi</strong></p>
                        
                        <div class="signature-space">
                            <span class="font-signature">{{ $header->spv_name }}</span>
                            <div class="verified-badge">✓ Verified</div>
                        </div>

                        <p style="margin: 0;"><strong>{{ strtoupper($header->spv_name) }}</strong></p>
                    </div>
                </td>
                <td style="width: 33.33%; text-align: center;">
                    <div class="signature-box" style="margin: 0 auto;">
                        <p style="margin: 0;">Diketahui Oleh,</p>
                        <p style="margin: 0 0 5px 0;"><strong>Manager Produksi</strong></p>
                        
                        <div class="signature-space dashed-box">
                            <span style="color: #999; font-size: 10pt; font-family: Arial, sans-serif;">Menunggu Validasi</span>
                        </div>

                        <p style="margin: 0;"><strong>&nbsp;</strong></p>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

    /* Global Print Settings */
    :root {
        --margin-tb: 10mm;
        --margin-lr: 30mm;
    }

    /* A4 Container */
    .a4-container {
        width: 210mm;
        min-height: 297mm;
        padding: var(--margin-tb) var(--margin-lr);
        margin: 0 auto;
        background: #ffffff;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.15;
        color: #000000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        box-sizing: border-box;
    }

    /* Typography */
    .company-name, .document-title {
        font-size: 14pt;
        font-weight: bold;
        text-transform: uppercase;
        margin: 0;
    }
    .document-title {
        margin-top: 4px;
    }
    .section-title {
        font-size: 12pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
        margin-top: 10px;
    }

    /* Tables */
    table {
        width: 100%;
        border-collapse: collapse;
    }
    .header-table {
        margin-bottom: 5px;
    }
    .header-line {
        border-bottom: 3px double #000;
        margin-bottom: 15px;
    }
    .meta-table {
        margin-bottom: 15px;
    }
    .meta-table td {
        padding-bottom: 5px;
    }
    .data-table {
        margin-bottom: 8px;
    }
    .data-table th, .data-table td {
        border: 1px solid #000;
        padding: 3px 5px;
        font-size: 12pt;
    }
    .data-table th {
        text-align: center;
        font-weight: bold;
    }
    .layout-table {
        margin-bottom: 8px;
    }
    .list-table {
        border: 1px solid #000;
    }
    .list-table td {
        padding: 3px 6px;
        border-bottom: 1px solid #eee;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }

    /* Notes */
    .notes-box {
        border: 1px solid #000;
        padding: 6px;
        min-height: 50px;
        font-style: italic;
    }

    /* Signatures */
    .signature-table {
        margin-top: 15px;
        page-break-inside: avoid;
    }
    .signature-box {
        width: 200px;
        text-align: center;
    }
    .signature-space {
        height: 70px;
        border: 1px solid #ccc;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
    }
    .dashed-box {
        border: 1px dashed #999;
    }
    .font-signature {
        font-family: 'Dancing Script', cursive;
        font-size: 22pt;
        color: #000;
        transform: rotate(-5deg);
    }
    .verified-badge {
        position: absolute;
        bottom: 2px;
        right: 2px;
        font-size: 8pt;
        color: green;
        font-weight: bold;
        font-family: Arial, sans-serif;
    }

    /* Print Specific */
    @media print {
        body * {
            visibility: hidden;
        }
        #printable-area, #printable-area * {
            visibility: visible;
        }
        #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
        .a4-container {
            width: 100%;
            padding: var(--margin-tb) var(--margin-lr);
            margin: 0;
            box-shadow: none;
            min-height: auto;
            background: #ffffff;
        }
        @page {
            size: A4 portrait;
            margin: 0;
        }
    }
</style>

<!-- Load html2pdf.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
    function downloadPDF() {
        const element = document.getElementById('printable-area');
        
        // Hide shadows/borders briefly for a cleaner PDF look if desired
        element.style.boxShadow = 'none';

        const opt = {
            margin:       0, // Handled by padding in CSS (30mm)
            filename:     'Logsheet_Prepare_{{ \Carbon\Carbon::parse($header->date)->format("Ymd") }}_{{ $header->shift }}.pdf',
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            element.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
    }
</script>
@endsection
