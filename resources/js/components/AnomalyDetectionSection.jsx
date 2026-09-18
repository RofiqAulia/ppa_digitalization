import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, Activity, ChevronRight } from 'lucide-react';

export default function AnomalyDetectionSection({ anomalyData, title = "Deteksi Anomali & Rekap Shift" }) {
    if (!anomalyData) {
        return (
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 text-center text-slate-400">
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

    // Group matrix rows by time index or row index for exact table rendering
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
        <div id="deteksi-anomali-section" className="bg-white border border-slate-200/80 shadow-md rounded-3xl overflow-hidden select-none">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-[#1a2035] to-slate-900 text-white px-6 py-5 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${
                        isAnomaly 
                            ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30 animate-pulse' 
                            : isWarning 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' 
                            : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                    }`}>
                        {isAnomaly ? '⚠️' : isWarning ? '⚡' : '✅'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black tracking-tight text-white m-0">{title}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                                isAnomaly 
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                    : isWarning 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                                {isAnomaly ? 'Anomali Terdeteksi' : isWarning ? 'Perlu Perhatian' : 'Status Normal'}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-300 m-0 mt-0.5">
                            Menghitung durasi inputan aktif per masing-masing dimsum + kendala (DownTime) dalam 1 shift
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 text-xs font-bold self-stretch md:self-auto justify-between md:justify-end">
                    <span className="text-slate-300 px-2">Total Target: <strong className="text-white">{target_shift_minutes}m</strong></span>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <span className="text-emerald-400 px-2">Ter-cover: <strong className="text-emerald-300">{total_recorded_minutes}m</strong></span>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <span className={`px-2 ${unaccounted_minutes > 0 ? 'text-rose-400 font-black' : 'text-slate-400'}`}>
                        Selisih: <strong className={unaccounted_minutes > 0 ? 'text-rose-300' : 'text-slate-200'}>{unaccounted_minutes}m</strong>
                    </span>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
                {/* Diagnostic Alert Banner */}
                {isAnomaly ? (
                    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 md:p-5 flex items-start gap-4">
                        <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-rose-900 m-0 uppercase tracking-wide">
                                🛑 TERDETEKSI ANOMALI DURASI JAM KERJA ({unaccounted_minutes} MENIT UNACCOUNTED / LOSS TIME)
                            </h4>
                            <p className="text-xs text-rose-800 font-medium leading-relaxed m-0">
                                Total inputan aktif dimsum (<strong>{total_active_dimsum_mins} mnt</strong>) + total kendala downtime (<strong>{downtime_minutes} mnt</strong>) baru mencapai <strong>{total_recorded_minutes} menit</strong> dari total alokasi shift <strong>{target_shift_minutes} menit</strong>. Terdapat selisih <strong>{unaccounted_minutes} menit</strong> waktu belum ter-log oleh operator.
                            </p>
                            {messages.length > 0 && (
                                <ul className="mt-2 text-xs text-rose-700 font-semibold space-y-1 pl-4 list-disc m-0">
                                    {messages.map((msg, idx) => (
                                        <li key={idx}>{msg}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ) : isWarning ? (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-amber-900 m-0 uppercase tracking-wide">
                                ⚠️ PERHATIAN: SELISIH WAKTU SEBANYAK {unaccounted_minutes} MENIT
                            </h4>
                            <p className="text-xs text-amber-800 font-medium leading-relaxed m-0">
                                Terdapat gap waktu {unaccounted_minutes} menit di mana belum ada inputan dimsum maupun catatan kendala.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 md:p-5 flex items-center gap-3 text-emerald-900">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-xs font-bold m-0">
                            ✅ Jam kerja shift ter-cover 100% tanpa anomali loss time (Total <strong>{total_recorded_minutes} menit</strong> tercatat).
                        </p>
                    </div>
                )}

                {/* Summary Metrics Row (6 Columns) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block">Pentol</span>
                        <span className="text-xl font-black text-amber-900 mt-1 block">{pentolMins} <span className="text-xs font-normal">mnt</span></span>
                    </div>

                    <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">Siomay</span>
                        <span className="text-xl font-black text-blue-900 mt-1 block">{siomayMins} <span className="text-xs font-normal">mnt</span></span>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">Lumpia</span>
                        <span className="text-xl font-black text-emerald-900 mt-1 block">{lumpiaMins} <span className="text-xs font-normal">mnt</span></span>
                    </div>

                    <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block">Adonan Pangsit</span>
                        <span className="text-xl font-black text-purple-900 mt-1 block">{adonanMins} <span className="text-xs font-normal">mnt</span></span>
                    </div>

                    <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block">DownTime</span>
                        <span className="text-xl font-black text-rose-900 mt-1 block">{downtime_minutes} <span className="text-xs font-normal">mnt</span></span>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-3.5 text-center border border-slate-800">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Total {target_shift_minutes} mnt</span>
                        <span className="text-xl font-black text-white mt-1 block">{total_recorded_minutes} <span className="text-xs font-normal text-slate-300">mnt</span></span>
                    </div>
                </div>

                {/* Exact Table Layout Matching Screenshot */}
                <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse text-xs md:text-sm">
                            <thead>
                                {/* Top Yellow Header Row */}
                                <tr className="bg-[#fbbf24] text-slate-900 font-extrabold border-b border-slate-400">
                                    <th className="py-3 px-4 border-r border-slate-400 w-36 text-left">Jenis Dimsum</th>
                                    <th className="py-3 px-4 border-r border-slate-400">Pentol</th>
                                    <th className="py-3 px-4 border-r border-slate-400">Siomay</th>
                                    <th className="py-3 px-4 border-r border-slate-400">Lumpia</th>
                                    <th className="py-3 px-4 border-r border-slate-400">Adonan Pangsit</th>
                                    <th className="py-3 px-4 border-r border-slate-400 bg-amber-300">DownTime</th>
                                    <th className="py-3 px-4 bg-amber-400">Total {target_shift_minutes} menit</th>
                                </tr>
                                {/* Duration Sub-Header Row */}
                                <tr className="bg-[#fef08a] text-slate-900 font-black border-b border-slate-400 text-xs">
                                    <td className="py-2.5 px-4 border-r border-slate-400 text-left font-bold italic">Durasi Input</td>
                                    <td className="py-2.5 px-4 border-r border-slate-400 text-amber-900 font-black">{pentolMins} menit</td>
                                    <td className="py-2.5 px-4 border-r border-slate-400 text-blue-900 font-black">{siomayMins} menit</td>
                                    <td className="py-2.5 px-4 border-r border-slate-400 text-emerald-900 font-black">{lumpiaMins} menit</td>
                                    <td className="py-2.5 px-4 border-r border-slate-400 text-purple-900 font-black">{adonanMins} menit</td>
                                    <td className="py-2.5 px-4 border-r border-slate-400 text-rose-900 font-black bg-amber-200">{downtime_minutes} menit</td>
                                    <td className="py-2.5 px-4 font-black text-slate-900 bg-amber-300">{total_recorded_minutes}</td>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-700">
                                {Array.from({ length: maxRowsCount }).map((_, idx) => {
                                    const pentolItem  = pentolRows[idx];
                                    const siomayItem  = siomayRows[idx];
                                    const lumpiaItem  = lumpiaRows[idx];
                                    const adonanItem  = adonanRows[idx];
                                    const dtItem      = downtime_entries[idx];

                                    // Determine lead label for leftmost column
                                    let leadLabel = "";
                                    if (pentolItem) leadLabel = "Pentol";
                                    else if (siomayItem) leadLabel = "Siomay";
                                    else if (lumpiaItem) leadLabel = "Lumpia";
                                    else if (adonanItem) leadLabel = "Adonan Pangsit";
                                    else if (dtItem) leadLabel = "DownTime";

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-2 px-4 border-r border-slate-200 text-left font-bold text-slate-600 bg-slate-50/50">
                                                {leadLabel}
                                            </td>
                                            <td className="py-2 px-4 border-r border-slate-200 font-mono text-amber-800">
                                                {pentolItem ? pentolItem.time : ''}
                                            </td>
                                            <td className="py-2 px-4 border-r border-slate-200 font-mono text-blue-800">
                                                {siomayItem ? siomayItem.time : ''}
                                            </td>
                                            <td className="py-2 px-4 border-r border-slate-200 font-mono text-emerald-800">
                                                {lumpiaItem ? lumpiaItem.time : ''}
                                            </td>
                                            <td className="py-2 px-4 border-r border-slate-200 font-mono text-purple-800">
                                                {adonanItem ? adonanItem.time : ''}
                                            </td>
                                            <td className="py-2 px-4 border-r border-slate-200 text-rose-700 font-semibold bg-rose-50/30">
                                                {dtItem ? `${dtItem.text} (${dtItem.dur_mins ?? 0}m)` : ''}
                                            </td>
                                            <td className="py-2 px-4 bg-slate-50/30 text-slate-400">
                                                {idx === 0 ? `${total_recorded_minutes} mnt` : ''}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {maxRowsCount === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-6 text-center text-slate-400 font-semibold">
                                            Belum ada data rincian inputan aktif atau kendala untuk periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footnote Explanation */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-extrabold text-slate-800 m-0">💡 Keterangan Perhitungan Deteksi Anomali Shift:</p>
                    <ul className="m-0 pl-4 list-disc space-y-0.5 text-slate-500 font-medium">
                        <li><strong>Input Aktif Dimsum:</strong> Total akumulasi durasi berjalannya pemprosesan per jenis dimsum (Pentol, Siomay, Lumpia, Adonan Pangsit).</li>
                        <li><strong>DownTime (Kendala):</strong> Total menit kendala atau penghentian tidak terencana yang dilaporkan oleh operator.</li>
                        <li><strong>Total Ter-cover:</strong> Penjumlahan Input Aktif + DownTime (Harus mendekati target 480 menit per shift).</li>
                        <li><strong>Selisih (Anomali):</strong> Waktu jam kerja yang belum terisi inputan maupun laporan kendala (Loss Time / Unaccounted).</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
