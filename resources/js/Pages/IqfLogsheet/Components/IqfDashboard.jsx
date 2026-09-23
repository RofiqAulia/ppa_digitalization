import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, Clock, Activity, Users, ShieldAlert, Cpu, Zap, Layers, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import AnomalyDetectionSection from '@/components/AnomalyDetectionSection';

const PRODUCTS = [
    {
        key: 'siomay',
        label: 'Siomay',
        unit: 'Loyang',
        emoji: '🥟',
        badgeBg: 'bg-amber-500',
        badgeText: 'text-amber-700 bg-amber-50 border-amber-200',
        iconGrad: 'from-amber-400 to-amber-600 shadow-amber-500/20',
        cardBg: 'from-amber-50/30 via-white to-white hover:border-amber-300',
        barColor1: 'from-amber-500 to-amber-600',
    },
    {
        key: 'pentol',
        label: 'Pentol',
        unit: 'Loyang',
        emoji: '🧆',
        badgeBg: 'bg-blue-500',
        badgeText: 'text-blue-700 bg-blue-50 border-blue-200',
        iconGrad: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
        cardBg: 'from-blue-50/30 via-white to-white hover:border-blue-300',
        barColor1: 'from-blue-500 to-indigo-600',
    },
    {
        key: 'lumpia',
        label: 'Lumpia',
        unit: 'Keranjang',
        emoji: '🥢',
        badgeBg: 'bg-emerald-500',
        badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        iconGrad: 'from-emerald-400 to-teal-600 shadow-emerald-500/20',
        cardBg: 'from-emerald-50/30 via-white to-white hover:border-emerald-300',
        barColor1: 'from-emerald-400 to-teal-600',
    },
    {
        key: 'adonan_pangsit',
        label: 'Adonan Pangsit',
        unit: 'Keranjang',
        emoji: '🫙',
        badgeBg: 'bg-purple-500',
        badgeText: 'text-purple-700 bg-purple-50 border-purple-200',
        iconGrad: 'from-purple-500 to-indigo-600 shadow-purple-500/20',
        cardBg: 'from-purple-50/30 via-white to-white hover:border-purple-300',
        barColor1: 'from-purple-500 to-indigo-600',
    },
];

const HOURS = [
    ...Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00'),
    '23:59'
];

const SHIFT_PRESETS = [
    { label: 'Shift 1', from: '08:00', to: '16:00' },
    { label: 'Shift 2', from: '16:00', to: '00:00' },
    { label: 'Shift 3', from: '00:00', to: '08:00' },
    { label: 'Semua',   from: '00:00', to: '23:59' },
];

/** Detect which shift preset matches the current WIB time */
function getCurrentShiftPreset() {
    const now  = new Date();
    const wib  = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const hour = wib.getHours();
    if (hour >= 8 && hour < 16) return SHIFT_PRESETS[0];  // Shift 1
    if (hour >= 16)             return SHIFT_PRESETS[1];  // Shift 2
    return SHIFT_PRESETS[2];                              // Shift 3 (00–07)
}

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
    const initPreset = getCurrentShiftPreset();

    const [stats,        setStats]        = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [fromTime,     setFromTime]     = useState(initPreset.from);
    const [toTime,       setToTime]       = useState(initPreset.to);
    const [activePreset, setActivePreset] = useState(initPreset.label);

    const paramsRef = useRef({ fromTime: initPreset.from, toTime: initPreset.to });
    useEffect(() => { paramsRef.current = { fromTime, toTime }; }, [fromTime, toTime]);

    const fetchStats = useCallback(async (from, to) => {
        const f = from ?? paramsRef.current.fromTime;
        const t = to   ?? paramsRef.current.toTime;
        setLoading(true);
        try {
            const res = await axios.get('/dashboard/stats', { params: { from_time: f, to_time: t } });
            setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(fromTime, toTime); }, []); // eslint-disable-line
    useEffect(() => { fetchStats(fromTime, toTime); }, [fromTime, toTime]); // eslint-disable-line

    useEffect(() => {
        const interval = setInterval(() => {
            const currentPreset = getCurrentShiftPreset();
            const active = paramsRef.current;
            const matched = SHIFT_PRESETS.find(
                p => p.from === active.fromTime && p.to === active.toTime
            );
            if (matched && matched.label !== 'Semua') {
                setFromTime(currentPreset.from);
                setToTime(currentPreset.to);
                setActivePreset(currentPreset.label);
                fetchStats(currentPreset.from, currentPreset.to);
            } else {
                fetchStats();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, []); // eslint-disable-line

    const applyPreset = (preset) => {
        setActivePreset(preset.label);
        setFromTime(preset.from);
        setToTime(preset.to);
    };

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
        <div className="space-y-6 select-none max-w-[1400px] mx-auto pb-12">
            
            {/* ── HEADER BANNER (Matching Gambar 1) ─────────────────────────────── */}
            <div className="relative overflow-hidden bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
                <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
                    {/* Title + Status Badge */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0284c7] rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0">
                            <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200/80">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                    IQF PRODUCTION • Live Monitoring
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1 mb-0">
                                Dashboard Produksi IQF
                            </h2>
                            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                                Kelola seluruh logsheet harian, durasi shift, pencarian data, dan deteksi anomali real-time.
                            </p>
                        </div>
                    </div>

                    {/* Filter & Action Controls (Matching Gambar 1 Pill Group) */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                        {/* Shift Presets Pill */}
                        <div className="grid grid-cols-4 sm:flex sm:items-center bg-slate-100 p-1 rounded-full w-full sm:w-auto border border-slate-200">
                            {SHIFT_PRESETS.map(p => {
                                const isActive = activePreset === p.label;
                                return (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all border-0 text-center ${
                                            isActive
                                            ? 'bg-[#0284c7] text-white shadow-2xs font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Time Range Selector Pill */}
                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200 w-full sm:w-auto text-xs font-bold text-slate-700">
                            <select
                                value={fromTime}
                                onChange={e => { setFromTime(e.target.value); setActivePreset('Custom'); }}
                                className="bg-transparent text-slate-900 text-xs font-bold border-0 p-0 shadow-none cursor-pointer focus:outline-none"
                            >
                                {HOURS.map(h => <option key={h} value={h} className="text-slate-900 bg-white">{h}</option>)}
                            </select>
                            <span className="text-cyan-600 font-bold">→</span>
                            <select
                                value={toTime}
                                onChange={e => { setToTime(e.target.value); setActivePreset('Custom'); }}
                                className="bg-transparent text-slate-900 text-xs font-bold border-0 p-0 shadow-none cursor-pointer focus:outline-none"
                            >
                                {HOURS.map(h => <option key={h} value={h} className="text-slate-900 bg-white">{h}</option>)}
                            </select>
                        </div>

                        {/* Refresh Button Pill (Gambar 1 style) */}
                        <button
                            type="button"
                            onClick={fetchStats}
                            disabled={loading}
                            title="Refresh Data Dashboard"
                            className="h-9 px-3.5 flex items-center justify-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>

                        {/* Action Pill Buttons (+ Input Logsheet & Cetak Laporan) */}
                        <a
                            href="/logsheet-iqf"
                            className="h-9 px-4 flex items-center justify-center gap-1.5 rounded-full bg-[#0284c7] hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-all text-decoration-none shrink-0"
                        >
                            <span>+ Input Logsheet</span>
                        </a>

                        <a
                            href="/iqf-logsheet/export-excel"
                            className="h-9 px-4 flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all text-decoration-none shrink-0"
                        >
                            <span>Cetak Laporan</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* ── TOP KPI SUMMARY GRID (4 Main Products Output) ─────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {PRODUCTS.map(p => {
                    const val = stats?.grand_total?.[p.key] ?? 0;
                    return (
                        <div
                            key={p.key}
                            className={`bg-gradient-to-b ${p.cardBg} border border-slate-200/90 shadow-sm rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
                        >
                            {/* Decorative Accent Glow */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.iconGrad} flex items-center justify-center text-white text-2xl shadow-md border border-white/30 shrink-0 group-hover:scale-110 transition-transform`}>
                                    {p.emoji}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${p.badgeText}`}>
                                    {p.unit}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Total {p.label}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight m-0">
                                        <AnimatedNumber value={val} />
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400">
                                        {p.unit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── WORK TIME ANALYSIS SECTION (EMPLOYEE RUNTIME & EFFICIENCY) ── */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl overflow-hidden">
                <div className="bg-slate-50/80 px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 text-lg font-bold">
                            ⏱️
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">Analisis Jam Kerja Karyawan</h3>
                            <p className="text-xs font-semibold text-slate-400 m-0">Breakdown Efisiensi Durasi Input Aktif, Downtime Kendala, Pergantian Dimsum & Loss Time per Mesin</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {['IQF 1', 'IQF 2'].map(mName => {
                            const effData = stats?.efficiency_by_machine?.[mName] || {
                                total_shift_minutes: 480,
                                active_minutes: 0,
                                changeover_minutes: 0,
                                changeover_count: 0,
                                unplanned_minutes: 0,
                                loss_minutes: 0,
                            };

                            const totalMins = effData.elapsed_shift_minutes && effData.elapsed_shift_minutes < effData.total_shift_minutes
                                ? effData.elapsed_shift_minutes
                                : effData.total_shift_minutes || 480;

                            const activePct  = Math.min(100, Math.round((effData.active_minutes / totalMins) * 100)) || 0;
                            const changePct  = Math.min(100, Math.round((effData.changeover_minutes / totalMins) * 100)) || 0;
                            const stopPct    = Math.min(100, Math.round((effData.unplanned_minutes / totalMins) * 100)) || 0;
                            const lossPct    = Math.max(0, 100 - (activePct + changePct + stopPct));

                            return (
                                <div key={mName} className="bg-slate-50/60 border border-slate-200 rounded-3xl p-5 md:p-6 flex flex-col justify-between space-y-5 hover:border-indigo-300 transition-colors">
                                    {/* Card Machine Title Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-3 h-3 rounded-full bg-indigo-600 shadow" />
                                            <h4 className="text-base font-black text-slate-800 uppercase tracking-wide m-0">{mName}</h4>
                                        </div>
                                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                                            {effData.elapsed_shift_minutes && effData.elapsed_shift_minutes < effData.total_shift_minutes
                                                ? `Shift Berjalan: ${effData.elapsed_shift_minutes} / ${effData.total_shift_minutes} mnt`
                                                : `Total Shift: ${effData.total_shift_minutes} mnt`}
                                        </span>
                                    </div>

                                    {/* Visual Distribution Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                            <span>Distribusi Durasi Shift</span>
                                            <span className="text-emerald-600 font-extrabold">{activePct}% Efektif</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                                            <div style={{ width: `${activePct}%` }} title={`Input Aktif: ${effData.active_minutes} mnt (${activePct}%)`} className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" />
                                            <div style={{ width: `${changePct}%` }} title={`Pergantian Dimsum: ${effData.changeover_minutes} mnt (${changePct}%)`} className="bg-amber-500 h-full transition-all duration-500" />
                                            <div style={{ width: `${stopPct}%` }} title={`Kendala: ${effData.unplanned_minutes} mnt (${stopPct}%)`} className="bg-rose-500 h-full transition-all duration-500" />
                                            <div style={{ width: `${lossPct}%` }} title={`Loss Time (Idle): ${effData.loss_minutes ?? 0} mnt (${lossPct}%)`} className="bg-purple-500 h-full rounded-r-full transition-all duration-500" />
                                        </div>
                                    </div>

                                    {/* Metric Badges Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                                        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase m-0 flex items-center justify-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Input Aktif
                                            </p>
                                            <p className="text-sm font-black text-emerald-600 mt-1 mb-0">
                                                {effData.active_minutes} <span className="text-[10px] font-medium text-slate-400">mnt</span>
                                            </p>
                                        </div>

                                        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase m-0 flex items-center justify-center gap-1 truncate">
                                                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pergantian
                                            </p>
                                            <p className="text-sm font-black text-amber-600 mt-1 mb-0">
                                                {effData.changeover_minutes} <span className="text-[10px] font-medium text-slate-400">mnt ({effData.changeover_count}x)</span>
                                            </p>
                                        </div>

                                        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase m-0 flex items-center justify-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-500" /> Kendala
                                            </p>
                                            <p className="text-sm font-black text-rose-600 mt-1 mb-0">
                                                {effData.unplanned_minutes} <span className="text-[10px] font-medium text-slate-400">mnt</span>
                                            </p>
                                        </div>

                                        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase m-0 flex items-center justify-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-purple-500" /> Loss Time
                                            </p>
                                            <p className="text-sm font-black text-purple-600 mt-1 mb-0">
                                                {effData.loss_minutes ?? 0} <span className="text-[10px] font-medium text-slate-400">mnt</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── PYRAMID COMPARISON CHART (IQF 1 vs IQF 2) ─────────────────── */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 sm:p-8">
                <div className="text-center mb-8">
                    <h3 className="text-lg font-black text-slate-800 m-0">Perbandingan Output Mesin Produksi</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1 mb-0">Visualisasi komparatif hasil produksi IQF 1 dan IQF 2</p>

                    {/* Legend Indicator */}
                    <div className="flex items-center justify-center gap-8 mt-5">
                        <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xs" />
                            <span className="font-extrabold text-indigo-900 text-xs sm:text-sm">IQF 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-r from-emerald-400 to-teal-500 shadow-xs" />
                            <span className="font-extrabold text-teal-800 text-xs sm:text-sm">IQF 2</span>
                        </div>
                    </div>
                </div>

                {/* Chart Rows */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {PRODUCTS.map(p => {
                        const val1 = stats?.by_machine?.['IQF 1']?.[p.key] ?? 0;
                        const val2 = stats?.by_machine?.['IQF 2']?.[p.key] ?? 0;

                        const pct1 = Math.max(0, Math.min(100, (val1 / maxMachineVal) * 100));
                        const pct2 = Math.max(0, Math.min(100, (val2 / maxMachineVal) * 100));

                        return (
                            <div key={p.key} className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                                {/* Left Side (IQF 1) */}
                                <div className="flex-1 w-full md:w-auto flex items-center justify-end gap-3 md:border-r-2 border-slate-200/80 pr-0 md:pr-6">
                                    <span className="text-xs sm:text-sm font-black text-indigo-900 w-16 text-right font-mono">
                                        <AnimatedNumber value={val1} />
                                    </span>
                                    <div className="flex-1 md:w-48 xl:w-64 flex justify-end h-8 bg-slate-100/80 rounded-r-md md:rounded-r-none md:rounded-l-lg overflow-hidden p-0.5">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-l-md transition-all duration-700 ease-out shadow-xs"
                                            style={{ width: `${pct1}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Center Product Label */}
                                <div className="w-full md:w-36 shrink-0 flex items-center justify-center gap-1.5 py-1 md:py-0">
                                    <span className="text-base">{p.emoji}</span>
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{p.label}</span>
                                </div>

                                {/* Right Side (IQF 2) */}
                                <div className="flex-1 w-full md:w-auto flex items-center justify-start gap-3 md:border-l-2 border-slate-200/80 pl-0 md:pl-6">
                                    <div className="flex-1 md:w-48 xl:w-64 h-8 bg-slate-100/80 rounded-l-md md:rounded-l-none md:rounded-r-lg overflow-hidden p-0.5">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-r-md transition-all duration-700 ease-out shadow-xs"
                                            style={{ width: `${pct2}%` }}
                                        />
                                    </div>
                                    <span className="text-xs sm:text-sm font-black text-teal-900 w-16 text-left font-mono">
                                        <AnimatedNumber value={val2} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── UNPLANNED STOPS TABLE SECTION ─────────────────────────────── */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl overflow-hidden">
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-base border border-rose-200">
                            🛑
                        </div>
                        <h3 className="text-base font-black text-slate-800 m-0">Rekapan Kendala (Unplanned Stop)</h3>
                    </div>
                    {stats?.unplanned_stops?.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-xs font-black px-3 py-1 rounded-full border border-rose-200">
                            {stats.unplanned_stops.length} Kejadian
                        </span>
                    )}
                </div>

                <div className="p-0 overflow-x-auto">
                    {(!stats || !stats.unplanned_stops || stats.unplanned_stops.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl mb-2 border border-emerald-200">
                                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                            </div>
                            <p className="text-slate-700 font-extrabold text-sm mb-0">Tidak ada kendala pada periode ini.</p>
                            <p className="text-slate-400 text-xs mt-0.5">Semua mesin berjalan normal tanpa hambatan.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-slate-100/70 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-5 py-3.5 w-12 text-center">#</th>
                                    <th className="px-5 py-3.5">Jenis Kendala</th>
                                    <th className="px-5 py-3.5">Mulai</th>
                                    <th className="px-5 py-3.5">Mesin</th>
                                    <th className="px-5 py-3.5">Shift</th>
                                    <th className="px-5 py-3.5">PIC</th>
                                    <th className="px-5 py-3.5 text-right">Durasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
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
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3.5 text-center text-slate-400 font-bold font-mono">{idx + 1}</td>
                                            <td className="px-5 py-3.5 font-bold text-slate-800">{descString}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-600 font-bold">{timeString}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
                                                    {stop.machine}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
                                                    Shift {stop.shift}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-slate-700">{stop.pic}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${isUnfinished ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                                    {isUnfinished ? '🔴' : '⏱'} {stop.duration}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── ANOMALY DETECTION & SHIFT RECAP SECTION ─────────────────── */}
            <AnomalyDetectionSection
                anomalyData={stats?.anomaly_detection}
                title="Deteksi Anomali & Rekap Shift IQF"
            />

        </div>
    );
}
