import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, Layers, Printer, Activity, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function AnomalyDetectionSection({ anomalyData, title = "Deteksi Anomali & Rekap Shift IQF" }) {
    const [selectedTab, setSelectedTab] = useState('ALL'); // 'ALL', 'IQF 1', 'IQF 2'
    const [sortConfig, setSortConfig] = useState({ col: null, dir: 'asc' });

    if (!anomalyData) {
        return (
            <div className="bg-white border border-slate-200/80 shadow-xs rounded-3xl p-6 text-center text-slate-400 text-xs font-semibold">
                Memuat data deteksi anomali...
            </div>
        );
    }

    // Extract per-machine data if available
    const machineDataMap = anomalyData.by_machine || anomalyData.anomaly_detection_by_machine || {};
    const iqf1Data = machineDataMap['IQF 1'] || null;
    const iqf2Data = machineDataMap['IQF 2'] || null;

    const handlePrintAnomaly = () => {
        window.print();
    };

    const handleSort = (columnKey) => {
        setSortConfig(prev => {
            if (prev.col === columnKey) {
                return { col: columnKey, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
            }
            return { col: columnKey, dir: 'asc' };
        });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.col !== columnKey) {
            return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40 inline-block" />;
        }
        return sortConfig.dir === 'asc' 
            ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-white inline-block font-bold" />
            : <ArrowDown className="w-3.5 h-3.5 ml-1 text-white inline-block font-bold" />;
    };

    const renderMachineCard = (mName, mData) => {
        if (!mData) {
            return (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 text-center text-slate-400 text-xs font-semibold">
                    Tidak ada data untuk {mName}
                </div>
            );
        }

        const {
            active_minutes_by_product = {},
            total_active_dimsum_mins = 0,
            downtime_minutes = 0,
            total_recorded_minutes = 0,
            target_shift_minutes = 480,
            unaccounted_minutes = 0,
            status = 'normal',
            downtime_entries = [],
            matrix_rows = [],
        } = mData;

        const pentolMins = active_minutes_by_product.pentol ?? 0;
        const siomayMins = active_minutes_by_product.siomay ?? 0;
        const lumpiaMins = active_minutes_by_product.lumpia ?? 0;
        const adonanMins = active_minutes_by_product.adonan_pangsit ?? 0;

        let pentolRows = [...matrix_rows.filter(r => r.product_type === 'pentol')];
        let siomayRows = [...matrix_rows.filter(r => r.product_type === 'siomay')];
        let lumpiaRows = [...matrix_rows.filter(r => r.product_type === 'lumpia')];
        let adonanRows = [...matrix_rows.filter(r => r.product_type === 'adonan_pangsit')];
        let sortedDowntime = [...downtime_entries];

        // Apply sorting based on selected column header without modifying data logic
        if (sortConfig.col) {
            const dirMultiplier = sortConfig.dir === 'asc' ? 1 : -1;
            if (sortConfig.col === 'siomay') {
                siomayRows.sort((a, b) => (a.time || '').localeCompare(b.time || '') * dirMultiplier);
            } else if (sortConfig.col === 'pentol') {
                pentolRows.sort((a, b) => (a.time || '').localeCompare(b.time || '') * dirMultiplier);
            } else if (sortConfig.col === 'lumpia') {
                lumpiaRows.sort((a, b) => (a.time || '').localeCompare(b.time || '') * dirMultiplier);
            } else if (sortConfig.col === 'adonan') {
                adonanRows.sort((a, b) => (a.time || '').localeCompare(b.time || '') * dirMultiplier);
            } else if (sortConfig.col === 'downtime') {
                sortedDowntime.sort((a, b) => ((a.dur_mins ?? 0) - (b.dur_mins ?? 0)) * dirMultiplier);
            }
        }

        const maxRowsCount = Math.max(
            siomayRows.length,
            pentolRows.length,
            lumpiaRows.length,
            adonanRows.length,
            sortedDowntime.length,
            1
        );

        const isAnomaly = status === 'anomaly' || unaccounted_minutes > 30;
        const isWarning = status === 'warning' || (unaccounted_minutes > 0 && unaccounted_minutes <= 30);

        return (
            <div key={mName} className="bg-white border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden print-machine-block">
                {/* Header Card Per Mesin */}
                <div className="bg-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 ${
                            isAnomaly ? 'bg-rose-600 shadow-xs' : isWarning ? 'bg-amber-600 shadow-xs' : 'bg-emerald-600 shadow-xs'
                        }`}>
                            {mName}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-white m-0 tracking-tight">{mName} - Deteksi Anomali</h4>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                    isAnomaly ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                                    isWarning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}>
                                    {isAnomaly ? 'Anomali' : isWarning ? 'Perhatian' : 'Normal'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
                        <span>Target: <strong className="text-white">{target_shift_minutes}m</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">Cover: <strong className="text-emerald-300">{total_recorded_minutes}m</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className={unaccounted_minutes > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-300'}>
                            Selisih: <strong className={unaccounted_minutes > 0 ? 'text-rose-300' : 'text-white'}>{unaccounted_minutes}m</strong>
                        </span>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Status Alert Callout */}
                    {isAnomaly ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-xs font-black text-rose-900 m-0 uppercase">
                                    🛑 ANOMALI {mName}: SELISIH {unaccounted_minutes} MENIT (LOSS TIME)
                                </h5>
                                <p className="text-xs text-rose-800 font-medium leading-relaxed mt-0.5 mb-0">
                                    Total input dimsum ({total_active_dimsum_mins}m) + downtime ({downtime_minutes}m) = <strong>{total_recorded_minutes}m</strong> dari target <strong>{target_shift_minutes}m</strong>.
                                </p>
                            </div>
                        </div>
                    ) : isWarning ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-xs font-black text-amber-900 m-0 uppercase">
                                    ⚠️ PERHATIAN {mName}: SELISIH {unaccounted_minutes} MENIT
                                </h5>
                                <p className="text-xs text-amber-800 font-medium leading-relaxed mt-0.5 mb-0">
                                    Terdapat gap {unaccounted_minutes} menit jam kerja belum ter-log pada {mName}.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 px-4 flex items-center gap-2.5 text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs font-bold m-0">
                                ✅ Jam kerja {mName} ter-cover 100% tanpa anomali (Total {total_recorded_minutes}m).
                            </p>
                        </div>
                    )}

                    {/* Ringkasan Menit per Produk & Downtime (KPI Cards) */}
                    <div>
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                            ⏱️ Ringkasan Durasi Menit per Produk & Downtime ({mName})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div className="bg-[#e0f2fe] border border-[#0284c7]/30 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-[#0369a1] block">🥟 SIOMAY</span>
                                <span className="text-lg font-black text-[#0c4a6e] block mt-0.5">
                                    {siomayMins} <span className="text-xs font-medium text-slate-600">mnt</span>
                                </span>
                                <span className="text-[10px] text-[#0369a1] font-semibold block mt-0.5">
                                    {siomayRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-[#ffe4e6] border border-[#f43f5e]/30 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-[#be123c] block">🧆 PENTOL</span>
                                <span className="text-lg font-black text-[#881337] block mt-0.5">
                                    {pentolMins} <span className="text-xs font-medium text-slate-600">mnt</span>
                                </span>
                                <span className="text-[10px] text-[#be123c] font-semibold block mt-0.5">
                                    {pentolRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-[#ecfeff] border border-[#06b6d4]/30 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-[#0891b2] block">🥢 LUMPIA</span>
                                <span className="text-lg font-black text-[#155e75] block mt-0.5">
                                    {lumpiaMins} <span className="text-xs font-medium text-slate-600">mnt</span>
                                </span>
                                <span className="text-[10px] text-[#0891b2] font-semibold block mt-0.5">
                                    {lumpiaRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-[#fdf4ff] border border-[#d946ef]/30 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-[#a21caf] block">🫙 ADONAN PANGSIT</span>
                                <span className="text-lg font-black text-[#701a75] block mt-0.5">
                                    {adonanMins} <span className="text-xs font-medium text-slate-600">mnt</span>
                                </span>
                                <span className="text-[10px] text-[#a21caf] font-semibold block mt-0.5">
                                    {adonanRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-[#fef2f2] border border-rose-300 rounded-2xl p-3 text-center shadow-2xs col-span-2 sm:col-span-1">
                                <span className="text-[11px] font-black text-[#b71c1c] block">🛑 UNPLANNED STOP</span>
                                <span className="text-lg font-black text-[#7f1d1d] block mt-0.5">
                                    {downtime_minutes} <span className="text-xs font-medium text-slate-600">mnt</span>
                                </span>
                                <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                                    {sortedDowntime.length} kejadian
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* DATATABLE MATRIX SPREADSHEET LOGSHEET TEMPLATE WITH SORTING */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                                📊 Matriks Logsheet & Rekap Menit Produk ({mName})
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium italic">
                                Klik header kolom untuk mengurutkan (Sort Data)
                            </span>
                        </div>

                        <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-center border-collapse text-xs md:text-sm">
                                    <thead>
                                        {/* Header Utama Blok Produk dengan Sorting */}
                                        <tr className="text-white font-extrabold text-xs uppercase border-b border-slate-300 select-none">
                                            <th 
                                                className="py-2.5 px-3 bg-slate-800 border-r border-slate-700 text-left w-12 cursor-pointer hover:bg-slate-700 transition-colors"
                                                onClick={() => handleSort('index')}
                                                title="Urutkan No Baris"
                                            >
                                                # {getSortIcon('index')}
                                            </th>
                                            <th 
                                                className="py-2.5 px-3 border-r border-cyan-700 font-black tracking-wide cursor-pointer hover:brightness-110 transition-all" 
                                                style={{ backgroundColor: '#0284c7' }}
                                                onClick={() => handleSort('siomay')}
                                                title="Urutkan Data Siomay"
                                            >
                                                SIOMAY {getSortIcon('siomay')}
                                            </th>
                                            <th 
                                                className="py-2.5 px-3 border-r border-rose-700 font-black tracking-wide cursor-pointer hover:brightness-110 transition-all" 
                                                style={{ backgroundColor: '#e11d48' }}
                                                onClick={() => handleSort('pentol')}
                                                title="Urutkan Data Pentol"
                                            >
                                                PENTOL {getSortIcon('pentol')}
                                            </th>
                                            <th 
                                                className="py-2.5 px-3 border-r border-teal-700 font-black tracking-wide cursor-pointer hover:brightness-110 transition-all" 
                                                style={{ backgroundColor: '#0d9488' }}
                                                onClick={() => handleSort('lumpia')}
                                                title="Urutkan Data Lumpia"
                                            >
                                                LUMPIA {getSortIcon('lumpia')}
                                            </th>
                                            <th 
                                                className="py-2.5 px-3 border-r border-purple-700 font-black tracking-wide cursor-pointer hover:brightness-110 transition-all" 
                                                style={{ backgroundColor: '#9333ea' }}
                                                onClick={() => handleSort('adonan')}
                                                title="Urutkan Data Adonan Pangsit"
                                            >
                                                ADONAN PANGSIT {getSortIcon('adonan')}
                                            </th>
                                            <th 
                                                className="py-2.5 px-3 font-black tracking-wide cursor-pointer hover:brightness-110 transition-all" 
                                                style={{ backgroundColor: '#b71c1c' }}
                                                onClick={() => handleSort('downtime')}
                                                title="Urutkan Data Unplanned Stop"
                                            >
                                                UNPLANNED STOP {getSortIcon('downtime')}
                                            </th>
                                        </tr>

                                        {/* Baris Paling Atas: Jumlah Menit Masing-Masing Kolom */}
                                        <tr className="text-slate-900 font-black border-b border-slate-300 text-xs">
                                            <td className="py-2.5 px-3 border-r border-slate-300 text-left font-bold italic bg-slate-100 text-slate-600">
                                                Jumlah Menit
                                            </td>
                                            <td className="py-2.5 px-3 border-r border-slate-300 text-[#0369a1] font-black bg-[#e0f2fe]">
                                                {siomayMins} menit
                                            </td>
                                            <td className="py-2.5 px-3 border-r border-slate-300 text-[#be123c] font-black bg-[#ffe4e6]">
                                                {pentolMins} menit
                                            </td>
                                            <td className="py-2.5 px-3 border-r border-slate-300 text-[#0891b2] font-black bg-[#ecfeff]">
                                                {lumpiaMins} menit
                                            </td>
                                            <td className="py-2.5 px-3 border-r border-slate-300 text-[#a21caf] font-black bg-[#fdf4ff]">
                                                {adonanMins} menit
                                            </td>
                                            <td className="py-2.5 px-3 text-[#b71c1c] font-black bg-[#fef2f2]">
                                                {downtime_minutes} menit ({sortedDowntime.length} kendala)
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-700">
                                        {Array.from({ length: maxRowsCount }).map((_, idx) => {
                                            const rowIdx = sortConfig.col === 'index' && sortConfig.dir === 'desc'
                                                ? maxRowsCount - 1 - idx
                                                : idx;

                                            const siomayItem  = siomayRows[rowIdx];
                                            const pentolItem  = pentolRows[rowIdx];
                                            const lumpiaItem  = lumpiaRows[rowIdx];
                                            const adonanItem  = adonanRows[rowIdx];
                                            const dtItem      = sortedDowntime[rowIdx];

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-2 px-3 border-r border-slate-200 text-left font-mono font-bold text-slate-400 bg-slate-50/50">
                                                        {rowIdx + 1}
                                                    </td>
                                                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-cyan-900 bg-cyan-50/20 font-bold">
                                                        {siomayItem ? `${siomayItem.time} (${siomayItem.tray_count ?? 0} tray)` : '-'}
                                                    </td>
                                                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-rose-900 bg-rose-50/20 font-bold">
                                                        {pentolItem ? `${pentolItem.time} (${pentolItem.tray_count ?? 0} tray)` : '-'}
                                                    </td>
                                                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-teal-900 bg-teal-50/20 font-bold">
                                                        {lumpiaItem ? `${lumpiaItem.time} (${lumpiaItem.tray_count ?? 0} pack)` : '-'}
                                                    </td>
                                                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-purple-900 bg-purple-50/20 font-bold">
                                                        {adonanItem ? `${adonanItem.time} (${adonanItem.tray_count ?? 0} pack)` : '-'}
                                                    </td>
                                                    <td className="py-2 px-3 text-rose-700 font-semibold bg-rose-50/40 text-left">
                                                        {dtItem ? `${dtItem.text} (⏱ ${dtItem.dur_mins ?? 0}m)` : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div id="deteksi-anomali-section" className="space-y-4 select-none">
            {/* Stylesheet Print CSS untuk cetak A4 */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #deteksi-anomali-section, #deteksi-anomali-section * { visibility: visible !important; }
                    #deteksi-anomali-section {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 10mm !important;
                        background: white !important;
                    }
                    .no-print-anomaly { display: none !important; }
                    .print-machine-block { page-break-inside: avoid !important; margin-bottom: 20px !important; }
                }
            `}</style>

            {/* Section Main Header Bar */}
            <div className="bg-white border border-slate-200/80 shadow-xs rounded-3xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 m-0 tracking-tight">{title}</h3>
                        <p className="text-xs font-semibold text-slate-400 m-0">
                            Analisis durasi input aktif produk, downtime kendala, dan loss time terpisah untuk IQF 1 & IQF 2
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 no-print-anomaly">
                    {/* Tab Switcher */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
                        {['ALL', 'IQF 1', 'IQF 2'].map(tab => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setSelectedTab(tab)}
                                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all border-0 ${
                                    selectedTab === tab
                                        ? 'bg-[#0284c7] text-white shadow-2xs font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab === 'ALL' ? 'Semua Mesin' : tab}
                            </button>
                        ))}
                    </div>

                    {/* Print Button */}
                    <button
                        type="button"
                        onClick={handlePrintAnomaly}
                        className="h-9 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer border-0 shrink-0"
                        title="Cetak Laporan Anomali"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Laporan</span>
                    </button>
                </div>
            </div>

            {/* Grid Display for IQF 1 & IQF 2 */}
            <div className="space-y-6">
                {(selectedTab === 'ALL' || selectedTab === 'IQF 1') && renderMachineCard('IQF 1', iqf1Data || anomalyData)}
                {(selectedTab === 'ALL' || selectedTab === 'IQF 2') && renderMachineCard('IQF 2', iqf2Data || anomalyData)}
            </div>
        </div>
    );
}
