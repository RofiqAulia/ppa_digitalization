import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, Activity, Users } from 'lucide-react';

const PRODUCTS = [
    {
        key: 'siomay',
        label: 'Siomay',
        unit: 'Loyang',
        emoji: '🥟',
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-50',
    },
    {
        key: 'pentol',
        label: 'Pentol',
        unit: 'Loyang',
        emoji: '🧆',
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-50',
    },
    {
        key: 'lumpia',
        label: 'Lumpia',
        unit: 'Keranjang',
        emoji: '🥢',
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-50',
    },
    {
        key: 'adonan_pangsit',
        label: 'Adonan',
        unit: 'Keranjang',
        emoji: '🫙',
        colorClass: 'text-purple-500',
        bgClass: 'bg-purple-50',
    },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');

const SHIFT_PRESETS = [
    { label: 'Shift 1', from: '06:00', to: '13:00' },
    { label: 'Shift 2', from: '14:00', to: '21:00' },
    { label: 'Shift 3', from: '22:00', to: '05:00' },
    { label: 'Semua',   from: '00:00', to: '23:00' },
];

function AnimatedNumber({ value }) {
    const [displayed, setDisplayed] = useState(value);
    const prev = useRef(value);

    useEffect(() => {
        if (value === prev.current) return;
        const diff = value - prev.current;
        const steps = 20;
        let step = 0;
        const interval = setInterval(() => {
            step++;
            setDisplayed(Math.round(prev.current + (diff * step) / steps));
            if (step >= steps) {
                setDisplayed(value);
                prev.current = value;
                clearInterval(interval);
            }
        }, 20);
        return () => clearInterval(interval);
    }, [value]);

    return <>{displayed.toLocaleString('id-ID')}</>;
}

function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return <span>{time.toLocaleTimeString('id-ID').replace(/:/g, '.')}</span>;
}

export default function IqfDashboard() {
    const [stats,        setStats]        = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [fromTime,     setFromTime]     = useState('00:00');
    const [toTime,       setToTime]       = useState('23:00');
    const [activePreset, setActivePreset] = useState('Semua');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/iqf-kiosk/stats', { params: { from_time: fromTime, to_time: toTime } });
            setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [fromTime, toTime]);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => {
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const applyPreset = (preset) => {
        setActivePreset(preset.label);
        setFromTime(preset.from);
        setToTime(preset.to);
    };

    // Calculate max value for the pyramid chart bars
    let maxMachineVal = 100;
    if (stats) {
        let max = 0;
        PRODUCTS.forEach(p => {
            const iqf1 = stats.by_machine?.['IQF 1']?.[p.key] ?? 0;
            const iqf2 = stats.by_machine?.['IQF 2']?.[p.key] ?? 0;
            if (iqf1 > max) max = iqf1;
            if (iqf2 > max) max = iqf2;
        });
        if (max > 0) maxMachineVal = max;
    }

    return (
        <div className="space-y-6 select-none max-w-[1400px] mx-auto pb-10">
            {/* HEADER - Dark Style */}
            <div className="bg-[#1a2035] rounded-3xl p-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-indigo-900/10">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-bold tracking-tight">Dashboard Produksi</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-indigo-200 text-sm font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Live · <LiveClock />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
                    <div className="flex bg-[#272f48] p-1 rounded-xl">
                        {SHIFT_PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => applyPreset(p)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                    activePreset === p.label 
                                    ? 'bg-blue-500 text-white shadow-sm' 
                                    : 'text-indigo-200 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-[#272f48] rounded-xl px-4 py-2 border border-white/5">
                        <select
                            value={fromTime}
                            onChange={e => { setFromTime(e.target.value); setActivePreset('Custom'); }}
                            className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer"
                        >
                            {HOURS.map(h => <option key={h} value={h} className="text-slate-900">{h}</option>)}
                        </select>
                        <span className="text-indigo-300/50">→</span>
                        <select
                            value={toTime}
                            onChange={e => { setToTime(e.target.value); setActivePreset('Custom'); }}
                            className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer"
                        >
                            {HOURS.map(h => <option key={h} value={h} className="text-slate-900">{h}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#272f48] hover:bg-[#323b56] transition-colors border border-white/5 text-indigo-200 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            {/* UNPLANNED STOPS SECTION */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-500 flex items-center justify-center text-base">🛑</span>
                    <h3 className="text-base font-bold text-slate-800">Rekapan Kendala (Unplanned Stop)</h3>
                    {stats?.unplanned_stops?.length > 0 && (
                        <span className="ml-auto bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-full">
                            {stats.unplanned_stops.length} kejadian
                        </span>
                    )}
                </div>

                {(!stats || !stats.unplanned_stops || stats.unplanned_stops.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <span className="text-3xl mb-2">✅</span>
                        <p className="text-slate-400 font-semibold text-sm">Tidak ada kendala pada periode ini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-5 py-3 text-left">#</th>
                                    <th className="px-5 py-3 text-left">Jenis Kendala</th>
                                    <th className="px-5 py-3 text-left">Mulai</th>
                                    <th className="px-5 py-3 text-left">Mesin</th>
                                    <th className="px-5 py-3 text-left">Shift</th>
                                    <th className="px-5 py-3 text-left">PIC</th>
                                    <th className="px-5 py-3 text-left">Durasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.unplanned_stops.map((stop, idx) => {
                                    let timeString = "-";
                                    let descString = stop.text;
                                    const timeMatch = stop.text.match(/^(\d{1,2}:\d{2})\s*-\s*(.*)/);
                                    if (timeMatch) {
                                        timeString = timeMatch[1];
                                        descString = timeMatch[2];
                                    }
                                    const isUnfinished = stop.duration === 'Belum Selesai';
                                    return (
                                        <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3.5 text-slate-400 font-bold">{idx + 1}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-semibold text-slate-800">{descString}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {timeString}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                                                    {stop.machine}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                    Shift {stop.shift}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                                    {stop.pic}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isUnfinished ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {isUnfinished ? '🔴' : '⏱'} {stop.duration}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* GRAND TOTAL CARDS (4 Squares) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {PRODUCTS.map(p => {
                    const val = stats?.grand_total?.[p.key] ?? 0;
                    return (
                        <div key={p.key} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl ${p.bgClass} flex items-center justify-center text-2xl`}>
                                    {p.emoji}
                                </div>
                                {/* Small decorative badge / dot */}
                                <div className={`w-2 h-2 rounded-full ${p.bgClass.replace('50', '400')}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Total {p.label}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                                        <AnimatedNumber value={val} />
                                    </h3>
                                    <span className="text-sm font-semibold text-slate-400">
                                        {p.unit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* PYRAMID CHART - IQF 1 vs IQF 2 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="text-center mb-8">
                    <h3 className="text-lg font-bold text-slate-800">Perbandingan Mesin Produksi</h3>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-12 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="font-black text-blue-600 text-sm">IQF 1</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="font-black text-emerald-500 text-sm">IQF 2</div>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="max-w-4xl mx-auto space-y-6 md:space-y-4">
                    {PRODUCTS.map(p => {
                        const val1 = stats?.by_machine?.['IQF 1']?.[p.key] ?? 0;
                        const val2 = stats?.by_machine?.['IQF 2']?.[p.key] ?? 0;
                        
                        const pct1 = Math.max(0, Math.min(100, (val1 / maxMachineVal) * 100));
                        const pct2 = Math.max(0, Math.min(100, (val2 / maxMachineVal) * 100));

                        return (
                            <div key={p.key} className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 group relative">
                                
                                {/* Background hover effect */}
                                <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity -z-10 -m-2" />

                                {/* Left Side (IQF 1) */}
                                <div className="flex-1 w-full md:w-auto flex items-center justify-end gap-3 md:border-r-2 border-slate-100 pr-0 md:pr-6">
                                    {/* Number label on left of bar */}
                                    <span className="text-sm font-bold text-slate-500 w-12 text-right">
                                        <AnimatedNumber value={val1} />
                                    </span>
                                    {/* Bar growing right-to-left */}
                                    <div className="flex-1 md:w-48 xl:w-64 flex justify-end h-7 md:h-10 bg-slate-50 md:bg-transparent rounded-r-md md:rounded-r-none md:rounded-l-sm overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
                                            style={{ width: `${pct1}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* Center (Product Label) */}
                                <div className="w-full md:w-32 shrink-0 flex flex-col items-center justify-center py-2 md:py-0">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{p.label}</span>
                                </div>

                                {/* Right Side (IQF 2) */}
                                <div className="flex-1 w-full md:w-auto flex items-center justify-start gap-3 md:border-l-2 border-slate-100 pl-0 md:pl-6">
                                    {/* Bar growing left-to-right */}
                                    <div className="flex-1 md:w-48 xl:w-64 h-7 md:h-10 bg-slate-50 md:bg-transparent rounded-l-md md:rounded-l-none md:rounded-r-sm overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-400 transition-all duration-1000 ease-out" 
                                            style={{ width: `${pct2}%` }} 
                                        />
                                    </div>
                                    {/* Number label on right of bar */}
                                    <span className="text-sm font-bold text-slate-500 w-12 text-left">
                                        <AnimatedNumber value={val2} />
                                    </span>
                                </div>

                            </div>
                        );
                    })}

                    {/* X-axis scale indicators (optional, decorative) */}
                    <div className="hidden md:flex justify-between items-center text-xs font-bold text-slate-300 border-t border-slate-100 pt-4 mt-8 px-8">
                        <span>100%</span>
                        <span>50%</span>
                        <span>0</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
