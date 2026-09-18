import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, Layers } from 'lucide-react';

export default function AnomalyDetectionSection({ anomalyData, title = "Deteksi Anomali & Rekap Shift" }) {
    if (!anomalyData) {
        return (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 text-center text-slate-400 text-xs font-semibold">
                Memuat data deteksi anomali...
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
        messages = [],
        downtime_entries = [],
        matrix_rows = [],
    } = anomalyData;

    const pentolMins = active_minutes_by_product.pentol ?? 0;
    const siomayMins = active_minutes_by_product.siomay ?? 0;
    const lumpiaMins = active_minutes_by_product.lumpia ?? 0;
    const adonanMins = active_minutes_by_product.adonan_pangsit ?? 0;

    const pentolRows = matrix_rows.filter(r => r.product_type === 'pentol');
    const siomayRows = matrix_rows.filter(r => r.product_type === 'siomay');
    const lumpiaRows = matrix_rows.filter(r => r.product_type === 'lumpia');
    const adonanRows = matrix_rows.filter(r => r.product_type === 'adonan_pangsit');

    const maxRowsCount = Math.max(
        pentolRows.length,
        siomayRows.length,
        lumpiaRows.length,
        adonanRows.length,
        downtime_entries.length,
        1
    );

    const isAnomaly = status === 'anomaly' || unaccounted_minutes > 30;
    const isWarning = status === 'warning' || (unaccounted_minutes > 0 && unaccounted_minutes <= 30);

    return (
        <div id="deteksi-anomali-section" className="bg-white border border-slate-200/80 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden select-none">
            {/* Header - Compact for Mobile */}
            <div className="bg-[#1a2035] text-white px-4 py-3.5 md:px-6 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-black text-base md:text-lg shrink-0 ${
                        isAnomaly 
                            ? 'bg-rose-600 shadow-md shadow-rose-600/30' 
                            : isWarning 
                            ? 'bg-amber-600 shadow-md shadow-amber-600/30' 
                            : 'bg-emerald-600 shadow-md shadow-emerald-600/30'
                    }`}>
                        {isAnomaly ? '⚠️' : isWarning ? '⚡' : '✅'}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm md:text-base font-extrabold tracking-tight text-white m-0">{title}</h3>
                            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                isAnomaly 
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                    : isWarning 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                                {isAnomaly ? 'Anomali' : isWarning ? 'Perhatian' : 'Normal'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#252d47] px-2.5 py-1 rounded-xl text-[11px] font-bold border border-white/10 self-stretch sm:self-auto justify-between sm:justify-end">
                    <span className="text-slate-300">Target: <strong className="text-white">{target_shift_minutes}m</strong></span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400">Cover: <strong className="text-emerald-300">{total_recorded_minutes}m</strong></span>
                    <span className="text-slate-500">•</span>
                    <span className={unaccounted_minutes > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-300'}>
                        Selisih: <strong className={unaccounted_minutes > 0 ? 'text-rose-300' : 'text-white'}>{unaccounted_minutes}m</strong>
                    </span>
                </div>
            </div>

            <div className="p-3.5 sm:p-5 md:p-6 space-y-4">
                {/* Alert Box - Simple & Clean */}
                {isAnomaly ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 sm:p-4 flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-black text-rose-900 m-0 uppercase">
                                🛑 ANOMALI: SELISIH {unaccounted_minutes} MENIT (LOSS TIME)
                            </h4>
                            <p className="text-[11px] sm:text-xs text-rose-800 font-medium leading-snug m-0">
                                Total input dimsum ({total_active_dimsum_mins}m) + downtime ({downtime_minutes}m) = <strong>{total_recorded_minutes}m</strong> dari target <strong>{target_shift_minutes}m</strong>.
                            </p>
                        </div>
                    </div>
                ) : isWarning ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-black text-amber-900 m-0 uppercase">
                                ⚠️ PERHATIAN: SELISIH {unaccounted_minutes} MENIT
                            </h4>
                            <p className="text-[11px] sm:text-xs text-amber-800 font-medium leading-snug m-0">
                                Terdapat gap {unaccounted_minutes} menit jam kerja belum ter-log.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 px-3.5 flex items-center gap-2 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-xs font-bold m-0">
                            ✅ Jam kerja shift ter-cover 100% (Total {total_recorded_minutes}m).
                        </p>
                    </div>
                )}

                {/* Micro Metric Grid for Mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-amber-700 block">🧆 PENTOL</span>
                        <span className="text-base sm:text-lg font-black text-amber-900 block">{pentolMins} <span className="text-[10px] font-normal">mnt</span></span>
                    </div>
                    <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-blue-700 block">🥟 SIOMAY</span>
                        <span className="text-base sm:text-lg font-black text-blue-900 block">{siomayMins} <span className="text-[10px] font-normal">mnt</span></span>
                    </div>
                    <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-emerald-700 block">🥢 LUMPIA</span>
                        <span className="text-base sm:text-lg font-black text-emerald-900 block">{lumpiaMins} <span className="text-[10px] font-normal">mnt</span></span>
                    </div>
                    <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-purple-700 block">🫙 ADONAN</span>
                        <span className="text-base sm:text-lg font-black text-purple-900 block">{adonanMins} <span className="text-[10px] font-normal">mnt</span></span>
                    </div>
                    <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-rose-700 block">🛑 DOWNTIME</span>
                        <span className="text-base sm:text-lg font-black text-rose-900 block">{downtime_minutes} <span className="text-[10px] font-normal">mnt</span></span>
                    </div>
                    <div className="bg-slate-900 text-white rounded-xl p-2.5 text-center border border-slate-800 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-amber-400 block">TOTAL {target_shift_minutes}m</span>
                        <span className="text-base sm:text-lg font-black text-white block">{total_recorded_minutes} <span className="text-[10px] font-normal text-slate-300">mnt</span></span>
                    </div>
                </div>

                {/* MOBILE VIEW (Simple Card Breakdown for Handphones) */}
                <div className="block md:hidden space-y-2.5 pt-1">
                    <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>📱 Ringkasan Durasi Shift</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{matrix_rows.length} inputan</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                        {/* Pentol Card */}
                        {pentolRows.length > 0 && (
                            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="font-extrabold text-amber-900 text-xs">🧆 Pentol ({pentolMins} mnt)</span>
                                    <div className="text-[10px] text-amber-800/80 font-mono">
                                        {pentolRows.map(r => r.time).join(', ')}
                                    </div>
                                </div>
                                <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                                    {pentolRows.length}x
                                </span>
                            </div>
                        )}

                        {/* Siomay Card */}
                        {siomayRows.length > 0 && (
                            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="font-extrabold text-blue-900 text-xs">🥟 Siomay ({siomayMins} mnt)</span>
                                    <div className="text-[10px] text-blue-800/80 font-mono">
                                        {siomayRows.map(r => r.time).join(', ')}
                                    </div>
                                </div>
                                <span className="text-xs font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-lg">
                                    {siomayRows.length}x
                                </span>
                            </div>
                        )}

                        {/* Lumpia Card */}
                        {lumpiaRows.length > 0 && (
                            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="font-extrabold text-emerald-900 text-xs">🥢 Lumpia ({lumpiaMins} mnt)</span>
                                    <div className="text-[10px] text-emerald-800/80 font-mono">
                                        {lumpiaRows.map(r => r.time).join(', ')}
                                    </div>
                                </div>
                                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                                    {lumpiaRows.length}x
                                </span>
                            </div>
                        )}

                        {/* Adonan Pangsit Card */}
                        {adonanRows.length > 0 && (
                            <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="font-extrabold text-purple-900 text-xs">🫙 Adonan Pangsit ({adonanMins} mnt)</span>
                                    <div className="text-[10px] text-purple-800/80 font-mono">
                                        {adonanRows.map(r => r.time).join(', ')}
                                    </div>
                                </div>
                                <span className="text-xs font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-lg">
                                    {adonanRows.length}x
                                </span>
                            </div>
                        )}

                        {/* DownTime Card */}
                        {downtime_entries.length > 0 && (
                            <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3 space-y-1">
                                <div className="flex items-center justify-between text-xs font-extrabold text-rose-900">
                                    <span>🛑 DownTime Kendala ({downtime_minutes} mnt)</span>
                                    <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded-lg text-rose-800">{downtime_entries.length} kejadian</span>
                                </div>
                                <div className="space-y-0.5 text-[10px] text-rose-800">
                                    {downtime_entries.map((dt, i) => (
                                        <div key={i} className="flex justify-between">
                                            <span>{dt.text}</span>
                                            <span className="font-bold">{dt.dur_mins ?? 0}m</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loss Time Summary Card */}
                        {unaccounted_minutes > 0 && (
                            <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between border border-slate-800">
                                <div>
                                    <span className="text-[10px] font-bold text-rose-400 block uppercase">Selisih Belum Ter-log</span>
                                    <span className="text-xs font-medium text-slate-300">Loss Time / Unaccounted</span>
                                </div>
                                <span className="text-base font-black text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded-lg">
                                    {unaccounted_minutes} mnt
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DESKTOP TABLE VIEW (Full Yellow Table for Larger Screens) */}
                <div className="hidden md:block border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse text-xs md:text-sm">
                            <thead>
                                <tr className="bg-[#fbbf24] text-slate-900 font-extrabold border-b border-slate-400">
                                    <th className="py-2.5 px-3 border-r border-slate-400 text-left">Jenis Dimsum</th>
                                    <th className="py-2.5 px-3 border-r border-slate-400">Pentol</th>
                                    <th className="py-2.5 px-3 border-r border-slate-400">Siomay</th>
                                    <th className="py-2.5 px-3 border-r border-slate-400">Lumpia</th>
                                    <th className="py-2.5 px-3 border-r border-slate-400">Adonan Pangsit</th>
                                    <th className="py-2.5 px-3 border-r border-slate-400 bg-amber-300">DownTime</th>
                                    <th className="py-2.5 px-3 bg-amber-400">Total {target_shift_minutes} menit</th>
                                </tr>
                                <tr className="bg-[#fef08a] text-slate-900 font-black border-b border-slate-400 text-xs">
                                    <td className="py-2 px-3 border-r border-slate-400 text-left font-bold italic">Durasi Input</td>
                                    <td className="py-2 px-3 border-r border-slate-400 text-amber-900 font-black">{pentolMins} menit</td>
                                    <td className="py-2 px-3 border-r border-slate-400 text-blue-900 font-black">{siomayMins} menit</td>
                                    <td className="py-2 px-3 border-r border-slate-400 text-emerald-900 font-black">{lumpiaMins} menit</td>
                                    <td className="py-2 px-3 border-r border-slate-400 text-purple-900 font-black">{adonanMins} menit</td>
                                    <td className="py-2 px-3 border-r border-slate-400 text-rose-900 font-black bg-amber-200">{downtime_minutes} menit</td>
                                    <td className="py-2 px-3 font-black text-slate-900 bg-amber-300">{total_recorded_minutes}</td>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-700">
                                {Array.from({ length: maxRowsCount }).map((_, idx) => {
                                    const pentolItem  = pentolRows[idx];
                                    const siomayItem  = siomayRows[idx];
                                    const lumpiaItem  = lumpiaRows[idx];
                                    const adonanItem  = adonanRows[idx];
                                    const dtItem      = downtime_entries[idx];

                                    let leadLabel = "";
                                    if (pentolItem) leadLabel = "Pentol";
                                    else if (siomayItem) leadLabel = "Siomay";
                                    else if (lumpiaItem) leadLabel = "Lumpia";
                                    else if (adonanItem) leadLabel = "Adonan Pangsit";
                                    else if (dtItem) leadLabel = "DownTime";

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-1.5 px-3 border-r border-slate-200 text-left font-bold text-slate-600 bg-slate-50/50">
                                                {leadLabel}
                                            </td>
                                            <td className="py-1.5 px-3 border-r border-slate-200 font-mono text-amber-800">
                                                {pentolItem ? pentolItem.time : ''}
                                            </td>
                                            <td className="py-1.5 px-3 border-r border-slate-200 font-mono text-blue-800">
                                                {siomayItem ? siomayItem.time : ''}
                                            </td>
                                            <td className="py-1.5 px-3 border-r border-slate-200 font-mono text-emerald-800">
                                                {lumpiaItem ? lumpiaItem.time : ''}
                                            </td>
                                            <td className="py-1.5 px-3 border-r border-slate-200 font-mono text-purple-800">
                                                {adonanItem ? adonanItem.time : ''}
                                            </td>
                                            <td className="py-1.5 px-3 border-r border-slate-200 text-rose-700 font-semibold bg-rose-50/30">
                                                {dtItem ? `${dtItem.text} (${dtItem.dur_mins ?? 0}m)` : ''}
                                            </td>
                                            <td className="py-1.5 px-3 bg-slate-50/30 text-slate-400">
                                                {idx === 0 ? `${total_recorded_minutes} mnt` : ''}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {maxRowsCount === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-4 text-center text-slate-400 font-semibold">
                                            Belum ada data rincian inputan aktif atau kendala untuk periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
