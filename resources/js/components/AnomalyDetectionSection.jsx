import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, Layers, Printer, Activity } from 'lucide-react';

export default function AnomalyDetectionSection({ anomalyData, title = "Deteksi Anomali & Rekap Shift IQF" }) {
    const [selectedTab, setSelectedTab] = useState('ALL'); // 'ALL', 'IQF 1', 'IQF 2'

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

        const pentolRows = matrix_rows.filter(r => r.product_type === 'pentol');
        const siomayRows = matrix_rows.filter(r => r.product_type === 'siomay');
        const lumpiaRows = matrix_rows.filter(r => r.product_type === 'lumpia');
        const adonanRows = matrix_rows.filter(r => r.product_type === 'adonan_pangsit');

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

                    {/* Ringkasan Menit per Produk & Downtime (Fokus Utama) */}
                    <div>
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
                            ⏱️ Menit Input Aktif per Produk & Downtime ({mName})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-amber-800 block">🧆 PENTOL</span>
                                <span className="text-lg font-black text-amber-950 block mt-0.5">
                                    {pentolMins} <span className="text-xs font-medium text-slate-500">mnt</span>
                                </span>
                                <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                                    {pentolRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-blue-800 block">🥟 SIOMAY</span>
                                <span className="text-lg font-black text-blue-950 block mt-0.5">
                                    {siomayMins} <span className="text-xs font-medium text-slate-500">mnt</span>
                                </span>
                                <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                                    {siomayRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-emerald-800 block">🥢 LUMPIA</span>
                                <span className="text-lg font-black text-emerald-950 block mt-0.5">
                                    {lumpiaMins} <span className="text-xs font-medium text-slate-500">mnt</span>
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                                    {lumpiaRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-purple-50/90 border border-purple-200/90 rounded-2xl p-3 text-center shadow-2xs">
                                <span className="text-[11px] font-black text-purple-800 block">🫙 ADONAN PANGSIT</span>
                                <span className="text-lg font-black text-purple-950 block mt-0.5">
                                    {adonanMins} <span className="text-xs font-medium text-slate-500">mnt</span>
                                </span>
                                <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">
                                    {adonanRows.length} kali input
                                </span>
                            </div>

                            <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-3 text-center shadow-2xs col-span-2 sm:col-span-1">
                                <span className="text-[11px] font-black text-rose-800 block">🛑 DOWNTIME KENDALA</span>
                                <span className="text-lg font-black text-rose-950 block mt-0.5">
                                    {downtime_minutes} <span className="text-xs font-medium text-slate-500">mnt</span>
                                </span>
                                <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                                    {downtime_entries.length} kejadian
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rincian DownTime Kendala Unplanned Stop (jika ada) */}
                    {downtime_entries.length > 0 && (
                        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 space-y-2">
                            <h5 className="text-xs font-black text-rose-900 uppercase tracking-wide m-0 flex items-center gap-1.5">
                                <span>🛑 Rekapan Kendala Unplanned Stop ({mName})</span>
                            </h5>
                            <div className="divide-y divide-rose-200/60 text-xs">
                                {downtime_entries.map((dt, idx) => (
                                    <div key={idx} className="py-2 flex items-center justify-between text-rose-950">
                                        <span className="font-semibold">{dt.text}</span>
                                        <span className="font-extrabold bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full text-rose-800">
                                            ⏱ {dt.dur_mins ?? 0} menit ({dt.duration})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
