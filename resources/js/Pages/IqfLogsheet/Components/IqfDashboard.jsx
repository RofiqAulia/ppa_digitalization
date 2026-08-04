import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart2, RefreshCw, Clock } from 'lucide-react';

const PRODUCTS = [
    { key: 'siomay',         label: 'Siomay',         unit: 'L', colors: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', bar: 'bg-yellow-400' } },
    { key: 'pentol',         label: 'Pentol',         unit: 'L', colors: { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700',   badge: 'bg-blue-100   text-blue-800   border-blue-300',   bar: 'bg-blue-400'   } },
    { key: 'lumpia',         label: 'Lumpia',         unit: 'K', colors: { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-700',  badge: 'bg-green-100  text-green-800  border-green-300',  bar: 'bg-green-400'  } },
    { key: 'adonan_pangsit', label: 'Adonan Pangsit', unit: 'K', colors: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800 border-purple-300', bar: 'bg-purple-400' } },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');

const SHIFT_PRESETS = [
    { label: 'Shift 1', from: '06:00', to: '13:00' },
    { label: 'Shift 2', from: '14:00', to: '21:00' },
    { label: 'Shift 3', from: '22:00', to: '05:00' },
    { label: 'Semua',   from: '00:00', to: '23:00' },
];

export default function IqfDashboard() {
    const [stats,      setStats]      = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [fromTime,   setFromTime]   = useState('00:00');
    const [toTime,     setToTime]     = useState('23:00');
    const [lastUpdate, setLastUpdate] = useState(null);
    const [activePreset, setActivePreset] = useState('Semua');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/iqf-kiosk/stats', { params: { from_time: fromTime, to_time: toTime } });
            setStats(res.data);
            setLastUpdate(new Date().toLocaleTimeString('id-ID', { hour12: false }));
        } catch (e) {
            console.error('Dashboard stats fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [fromTime, toTime]);

    // Fetch on mount & filter change
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const applyPreset = (preset) => {
        setActivePreset(preset.label);
        setFromTime(preset.from);
        setToTime(preset.to);
    };

    // Find max value across all products & machines for bar scaling
    const maxVal = stats
        ? Math.max(1, ...PRODUCTS.map(p =>
            Math.max(
                stats.by_machine['IQF 1']?.[p.key] ?? 0,
                stats.by_machine['IQF 2']?.[p.key] ?? 0
            )
          ))
        : 1;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-800 text-sm leading-none">Dashboard Produksi Hari Ini</h3>
                        {lastUpdate && (
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Update: {lastUpdate}
                            </p>
                        )}
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Preset buttons */}
                    {SHIFT_PRESETS.map(p => (
                        <button
                            key={p.label}
                            onClick={() => applyPreset(p)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                activePreset === p.label
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}

                    {/* Custom time range */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2 py-1">
                        <select
                            value={fromTime}
                            onChange={e => { setFromTime(e.target.value); setActivePreset('Custom'); }}
                            className="text-xs font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
                        >
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-slate-400 text-xs">–</span>
                        <select
                            value={toTime}
                            onChange={e => { setToTime(e.target.value); setActivePreset('Custom'); }}
                            className="text-xs font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
                        >
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : 'text-slate-500'}`} />
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="p-5">
                {loading && !stats ? (
                    <div className="flex items-center justify-center h-32 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-sm font-semibold">Memuat data...</span>
                    </div>
                ) : (
                    <>
                        {/* 2-Column: IQF 1 | IQF 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {['IQF 1', 'IQF 2'].map(machine => (
                                <div key={machine} className="rounded-xl border border-slate-200 overflow-hidden">
                                    {/* Machine Header */}
                                    <div className={`px-4 py-2 font-extrabold text-sm uppercase tracking-widest text-white ${machine === 'IQF 1' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                                        🏭 {machine}
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {PRODUCTS.map(p => {
                                            const val = stats?.by_machine[machine]?.[p.key] ?? 0;
                                            const pct = Math.round((val / maxVal) * 100);
                                            return (
                                                <div key={p.key} className={`flex items-center gap-3 px-4 py-3 ${p.colors.bg}`}>
                                                    {/* Label */}
                                                    <div className="w-28 shrink-0">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.colors.badge}`}>
                                                            {p.label}
                                                        </span>
                                                    </div>
                                                    {/* Bar */}
                                                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${p.colors.bar}`}
                                                            style={{ width: `${pct}%`, minWidth: val > 0 ? '4px' : '0' }}
                                                        />
                                                    </div>
                                                    {/* Value — BIG FONT */}
                                                    <div className={`text-right shrink-0 w-20 ${p.colors.text}`}>
                                                        <span className="text-3xl font-black font-mono leading-none">{val}</span>
                                                        <span className="text-xs font-bold ml-1 opacity-70">{p.unit}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grand Total Row */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                                ∑ Grand Total IQF 1 + IQF 2
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {PRODUCTS.map(p => {
                                    const val = stats?.grand_total?.[p.key] ?? 0;
                                    return (
                                        <div key={p.key} className={`rounded-xl border p-3 flex flex-col items-center ${p.colors.bg} ${p.colors.border}`}>
                                            <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${p.colors.text} opacity-70`}>
                                                {p.label}
                                            </span>
                                            {/* ANGKA BESAR */}
                                            <span className={`text-5xl font-black font-mono leading-none ${p.colors.text}`}>
                                                {val}
                                            </span>
                                            <span className={`text-xs font-bold mt-1 ${p.colors.text} opacity-60`}>
                                                {p.unit === 'L' ? 'Loyang' : 'Keranjang'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
