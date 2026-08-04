import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, TrendingUp, Activity } from 'lucide-react';

const PRODUCTS = [
    {
        key: 'siomay',
        label: 'Siomay',
        unit: 'L',
        emoji: '🥟',
        gradient: 'from-amber-400 to-orange-500',
        gradientSoft: 'from-amber-50 to-orange-50',
        border: 'border-amber-200',
        text: 'text-amber-600',
        textDark: 'text-amber-700',
        numColor: 'text-amber-500',
        glow: 'shadow-amber-200',
        barBg: 'bg-amber-100',
        bar: 'bg-gradient-to-r from-amber-400 to-orange-400',
        badge: 'bg-amber-100 text-amber-700 border-amber-300',
    },
    {
        key: 'pentol',
        label: 'Pentol',
        unit: 'L',
        emoji: '🧆',
        gradient: 'from-blue-400 to-indigo-500',
        gradientSoft: 'from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        textDark: 'text-blue-700',
        numColor: 'text-blue-500',
        glow: 'shadow-blue-200',
        barBg: 'bg-blue-100',
        bar: 'bg-gradient-to-r from-blue-400 to-indigo-400',
        badge: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    {
        key: 'lumpia',
        label: 'Lumpia',
        unit: 'K',
        emoji: '🥢',
        gradient: 'from-emerald-400 to-teal-500',
        gradientSoft: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        textDark: 'text-emerald-700',
        numColor: 'text-emerald-500',
        glow: 'shadow-emerald-200',
        barBg: 'bg-emerald-100',
        bar: 'bg-gradient-to-r from-emerald-400 to-teal-400',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    },
    {
        key: 'adonan_pangsit',
        label: 'Adonan',
        unit: 'K',
        emoji: '🫙',
        gradient: 'from-purple-400 to-pink-500',
        gradientSoft: 'from-purple-50 to-pink-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        textDark: 'text-purple-700',
        numColor: 'text-purple-500',
        glow: 'shadow-purple-200',
        barBg: 'bg-purple-100',
        bar: 'bg-gradient-to-r from-purple-400 to-pink-400',
        badge: 'bg-purple-100 text-purple-700 border-purple-300',
    },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');

const SHIFT_PRESETS = [
    { label: 'Shift 1', from: '06:00', to: '13:00', color: 'from-green-500 to-emerald-600' },
    { label: 'Shift 2', from: '14:00', to: '21:00', color: 'from-amber-500 to-orange-600' },
    { label: 'Shift 3', from: '22:00', to: '05:00', color: 'from-violet-500 to-purple-600' },
    { label: 'Semua',   from: '00:00', to: '23:00', color: 'from-slate-500 to-slate-700' },
];

// Animated number counter
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

    return <>{displayed}</>;
}

export default function IqfDashboard() {
    const [stats,        setStats]        = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [fromTime,     setFromTime]     = useState('00:00');
    const [toTime,       setToTime]       = useState('23:00');
    const [lastUpdate,   setLastUpdate]   = useState(null);
    const [activePreset, setActivePreset] = useState('Semua');
    const [pulse,        setPulse]        = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get('/iqf-kiosk/stats', { params: { from_time: fromTime, to_time: toTime } });
            setStats(res.data);
            setLastUpdate(new Date().toLocaleTimeString('id-ID', { hour12: false }));
            setPulse(true);
            setTimeout(() => setPulse(false), 600);
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

    const maxVal = stats
        ? Math.max(1, ...PRODUCTS.map(p =>
            Math.max(stats.by_machine['IQF 1']?.[p.key] ?? 0, stats.by_machine['IQF 2']?.[p.key] ?? 0)
          ))
        : 1;

    const totalAll = stats
        ? PRODUCTS.reduce((s, p) => s + (stats.grand_total?.[p.key] ?? 0), 0)
        : 0;

    return (
        <div className="mb-6 select-none">
            {/* ── HEADER CARD ─────────────────────────────── */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 mb-4 shadow-xl relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Title block */}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-base tracking-tight leading-none">
                                Dashboard Produksi
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${pulse ? 'animate-ping' : 'animate-pulse'}`} />
                                <p className="text-blue-300 text-xs font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lastUpdate ? `Live · ${lastUpdate}` : 'Memuat...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filter row */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Shift preset pills */}
                        {SHIFT_PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => applyPreset(p)}
                                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                                    activePreset === p.label
                                        ? `bg-gradient-to-r ${p.color} text-white shadow-md scale-105`
                                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}

                        {/* Custom time selectors */}
                        <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 backdrop-blur-sm">
                            <select
                                value={fromTime}
                                onChange={e => { setFromTime(e.target.value); setActivePreset('Custom'); }}
                                className="text-xs font-semibold text-white bg-transparent outline-none cursor-pointer"
                            >
                                {HOURS.map(h => <option key={h} value={h} className="text-slate-900">{h}</option>)}
                            </select>
                            <span className="text-white/40 text-xs font-bold">→</span>
                            <select
                                value={toTime}
                                onChange={e => { setToTime(e.target.value); setActivePreset('Custom'); }}
                                className="text-xs font-semibold text-white bg-transparent outline-none cursor-pointer"
                            >
                                {HOURS.map(h => <option key={h} value={h} className="text-slate-900">{h}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-300' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Mini total strip */}
                {stats && (
                    <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                        {PRODUCTS.map(p => {
                            const val = stats.grand_total?.[p.key] ?? 0;
                            return (
                                <div key={p.key} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 border border-white/10">
                                    <span className="text-sm">{p.emoji}</span>
                                    <span className="text-white/70 text-xs font-semibold">{p.label}:</span>
                                    <span className="text-white font-black text-sm"><AnimatedNumber value={val} /></span>
                                    <span className="text-white/50 text-[10px]">{p.unit}</span>
                                </div>
                            );
                        })}
                        <div className="flex items-center gap-1.5 bg-blue-500/30 rounded-full px-3 py-1 border border-blue-400/30">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
                            <span className="text-blue-200 text-xs font-semibold">Total:</span>
                            <span className="text-white font-black text-sm"><AnimatedNumber value={totalAll} /></span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── MESIN CARDS ─────────────────────────────── */}
            {loading && !stats ? (
                <div className="flex items-center justify-center h-40 rounded-2xl bg-slate-50 border border-slate-200">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400 mr-2" />
                    <span className="text-sm font-semibold text-slate-400">Memuat data produksi...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {[
                            { key: 'IQF 1', gradient: 'from-blue-600 to-blue-800', accent: 'bg-blue-500' },
                            { key: 'IQF 2', gradient: 'from-violet-600 to-indigo-800', accent: 'bg-violet-500' },
                        ].map(({ key: machine, gradient, accent }) => (
                            <div key={machine} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Machine header */}
                                <div className={`bg-gradient-to-r ${gradient} px-5 py-3.5 flex items-center justify-between`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                                            <span className="text-base">🏭</span>
                                        </div>
                                        <span className="font-black text-white text-sm tracking-widest uppercase">{machine}</span>
                                    </div>
                                    <div className="bg-white/20 rounded-full px-2.5 py-0.5">
                                        <span className="text-white text-xs font-bold">
                                            {PRODUCTS.reduce((s, p) => s + (stats?.by_machine[machine]?.[p.key] ?? 0), 0)} Total
                                        </span>
                                    </div>
                                </div>

                                {/* Product rows */}
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    {PRODUCTS.map(p => {
                                        const val = stats?.by_machine[machine]?.[p.key] ?? 0;
                                        const pct = Math.round((val / maxVal) * 100);
                                        return (
                                            <div key={p.key} className={`rounded-xl border ${p.border} bg-gradient-to-br ${p.gradientSoft} p-3.5 flex flex-col gap-2`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-base">{p.emoji}</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${p.textDark}`}>{p.label}</span>
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${p.badge}`}>{p.unit}</span>
                                                </div>
                                                {/* Progress */}
                                                <div className={`h-2 ${p.barBg} rounded-full overflow-hidden`}>
                                                    <div
                                                        className={`h-full rounded-full ${p.bar} transition-all duration-700`}
                                                        style={{ width: `${pct}%`, minWidth: val > 0 ? '6px' : '0' }}
                                                    />
                                                </div>
                                                {/* Big number */}
                                                <div className={`text-4xl font-black font-mono leading-none ${p.numColor}`}>
                                                    <AnimatedNumber value={val} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── GRAND TOTAL ──────────────────────────── */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Grand Total — IQF 1 + IQF 2
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {PRODUCTS.map(p => {
                                const val = stats?.grand_total?.[p.key] ?? 0;
                                const pct = totalAll > 0 ? Math.round((val / totalAll) * 100) : 0;
                                return (
                                    <div key={p.key} className={`relative bg-white rounded-2xl border-2 ${p.border} p-4 flex flex-col items-center gap-1 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
                                        {/* Background gradient accent */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${p.gradientSoft} opacity-60`} />
                                        <div className="relative z-10 flex flex-col items-center gap-1 w-full">
                                            <span className="text-2xl">{p.emoji}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${p.textDark} opacity-80`}>
                                                {p.label}
                                            </span>
                                            {/* HUGE number */}
                                            <span className={`text-6xl font-black font-mono leading-none ${p.numColor} mt-1`}>
                                                <AnimatedNumber value={val} />
                                            </span>
                                            <span className={`text-xs font-bold ${p.text} opacity-70 mt-0.5`}>
                                                {p.unit === 'L' ? 'Loyang' : 'Keranjang'}
                                            </span>
                                            {/* Mini percentage bar */}
                                            <div className={`w-full h-1.5 ${p.barBg} rounded-full mt-2 overflow-hidden`}>
                                                <div
                                                    className={`h-full ${p.bar} rounded-full transition-all duration-1000`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className={`text-[9px] font-semibold ${p.text} opacity-60`}>{pct}% dari total</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
