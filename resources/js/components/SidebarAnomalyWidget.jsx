import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, ShieldAlert, ChevronRight, Activity } from 'lucide-react';

export function SidebarAnomalyWidget({ isCollapsed }) {
    const [anomalyData, setAnomalyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnomalyStats = async () => {
        try {
            const res = await axios.get('/dashboard/stats');
            if (res.data && res.data.anomaly_detection) {
                setAnomalyData(res.data.anomaly_detection);
            }
        } catch (e) {
            // Quiet fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnomalyStats();
        const interval = setInterval(fetchAnomalyStats, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !anomalyData) return null;

    const {
        active_minutes_by_product = {},
        downtime_minutes = 0,
        total_recorded_minutes = 0,
        target_shift_minutes = 480,
        unaccounted_minutes = 0,
        status = 'normal',
    } = anomalyData;

    const isAnomaly = status === 'anomaly' || unaccounted_minutes > 30;
    const isWarning = status === 'warning' || (unaccounted_minutes > 0 && unaccounted_minutes <= 30);

    const scrollToAnomalySection = () => {
        const elem = document.getElementById('deteksi-anomali-section');
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/dashboard#deteksi-anomali-section';
        }
    };

    if (isCollapsed) {
        return (
            <div className="px-2 py-2">
                <button
                    type="button"
                    onClick={scrollToAnomalySection}
                    title={`Deteksi Anomali Shift: ${unaccounted_minutes}m Selisih`}
                    className={`w-full h-10 rounded-xl flex items-center justify-center transition-all ${
                        isAnomaly 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
                            : isWarning 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                >
                    {isAnomaly ? '⚠️' : isWarning ? '⚡' : '✅'}
                </button>
            </div>
        );
    }

    return (
        <div className="mx-2.5 my-2 p-3 rounded-2xl bg-[#222a42] border border-slate-700/80 text-white shadow-md space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-extrabold tracking-tight text-slate-100">Deteksi Anomali</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    isAnomaly 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                        : isWarning 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}>
                    {isAnomaly ? 'Anomali' : isWarning ? 'Perhatian' : 'Normal'}
                </span>
            </div>

            {/* Micro Breakdown */}
            <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold text-slate-300 bg-[#161c2e] p-2 rounded-xl border border-slate-800">
                <div>🧆 Pentol: <span className="text-amber-300 font-bold">{active_minutes_by_product.pentol ?? 0}m</span></div>
                <div>🥟 Siomay: <span className="text-blue-300 font-bold">{active_minutes_by_product.siomay ?? 0}m</span></div>
                <div>🥢 Lumpia: <span className="text-emerald-300 font-bold">{active_minutes_by_product.lumpia ?? 0}m</span></div>
                <div>🫙 Adonan: <span className="text-purple-300 font-bold">{active_minutes_by_product.adonan_pangsit ?? 0}m</span></div>
                <div className="col-span-2 pt-1 border-t border-slate-800/80 flex justify-between items-center text-slate-400">
                    <span>🛑 Downtime: <strong className="text-rose-400">{downtime_minutes}m</strong></span>
                    <span>Total: <strong className="text-white">{total_recorded_minutes}/{target_shift_minutes}m</strong></span>
                </div>
            </div>

            {/* Anomaly Result Tag & Action */}
            <button
                type="button"
                onClick={scrollToAnomalySection}
                className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer border-0 ${
                    isAnomaly
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30'
                        : isWarning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/30'
                        : 'bg-indigo-600/80 hover:bg-indigo-600 text-white'
                }`}
            >
                <span className="truncate">
                    {isAnomaly ? `🛑 ${unaccounted_minutes}m Loss Time` : isWarning ? `⚠️ ${unaccounted_minutes}m Selisih` : `✅ Shift Ter-cover 100%`}
                </span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
            </button>
        </div>
    );
}
