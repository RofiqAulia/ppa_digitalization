import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    CCard, CCardHeader, CCardBody, CRow, CCol, CBadge, CButton, CButtonGroup,
    CFormSelect, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CSpinner
} from '@coreui/react';
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

    // Keep a stable ref to the latest fetch params so the interval never goes stale
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

    // Initial fetch
    useEffect(() => { fetchStats(fromTime, toTime); }, []); // eslint-disable-line

    // Re-fetch whenever filter changes
    useEffect(() => { fetchStats(fromTime, toTime); }, [fromTime, toTime]); // eslint-disable-line

    // Auto-refresh every 60 s using stable ref — also auto-switches to the live shift at each tick
    useEffect(() => {
        const interval = setInterval(() => {
            // If user is on a shift preset, follow the live shift automatically
            const currentPreset = getCurrentShiftPreset();
            const active = paramsRef.current;
            const matched = SHIFT_PRESETS.find(
                p => p.from === active.fromTime && p.to === active.toTime
            );
            // If active filter is any shift preset (not Custom/Semua), snap to live shift
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
            {/* HEADER - CoreUI Dark Card */}
            <CCard className="bg-[#1a2035] text-white border-0 shadow-lg rounded-3xl p-4 sm:p-5 md:px-8">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white text-lg sm:text-xl font-bold tracking-tight m-0">Dashboard Produksi IQF</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-indigo-200 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Live · <LiveClock />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                        {/* Shift Presets */}
                        <div className="grid grid-cols-4 sm:flex sm:items-center bg-[#272f48] p-1 rounded-xl w-full sm:w-auto border border-white/5">
                            {SHIFT_PRESETS.map(p => {
                                const isActive = activePreset === p.label;
                                return (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all border-0 text-center ${
                                            isActive
                                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                                            : 'text-indigo-200 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Time Select */}
                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#272f48] rounded-xl px-3 py-2 border border-white/5 w-full sm:w-auto">
                            <CFormSelect
                                value={fromTime}
                                onChange={e => { setFromTime(e.target.value); setActivePreset('Custom'); }}
                                className="bg-transparent text-white text-xs sm:text-sm font-semibold border-0 p-0 shadow-none cursor-pointer focus:ring-0"
                            >
                                {HOURS.map(h => <option key={h} value={h} className="text-slate-900 bg-white">{h}</option>)}
                            </CFormSelect>
                            <span className="text-indigo-300/70 font-bold text-xs sm:text-sm">→</span>
                            <CFormSelect
                                value={toTime}
                                onChange={e => { setToTime(e.target.value); setActivePreset('Custom'); }}
                                className="bg-transparent text-white text-xs sm:text-sm font-semibold border-0 p-0 shadow-none cursor-pointer focus:ring-0"
                            >
                                {HOURS.map(h => <option key={h} value={h} className="text-slate-900 bg-white">{h}</option>)}
                            </CFormSelect>
                        </div>

                        {/* Refresh Button */}
                        <CButton
                            onClick={fetchStats}
                            disabled={loading}
                            title="Refresh Data"
                            className="h-10 px-4 sm:px-0 sm:w-10 flex items-center justify-center rounded-xl bg-[#272f48] hover:bg-[#323b56] border border-white/5 text-indigo-200 hover:text-white transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </CButton>
                    </div>
                </div>
            </CCard>

            {/* WORK TIME ANALYSIS SECTION */}
            <CCard className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                <CCardHeader className="bg-white px-6 py-4 md:px-8 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 text-lg">
                            ⏱️
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-extrabold text-slate-800 m-0">Analisis Jam Kerja Karyawan</h3>
                            <p className="text-xs font-semibold text-slate-400 m-0">Rincian Durasi Input Aktif, Downtime Kendala, Pergantian Dimsum, & Loss Time per Mesin</p>
                        </div>
                    </div>
                </CCardHeader>
                <CCardBody className="p-6 md:p-8">
                    <CRow className="g-4">
                        {['IQF 1', 'IQF 2'].map(mName => {
                            const effData = stats?.efficiency_by_machine?.[mName] || {
                                total_shift_minutes: 480,
                                active_minutes: 0,
                                changeover_minutes: 0,
                                changeover_count: 0,
                                unplanned_minutes: 0,
                                loss_minutes: 0,
                            };

                            return (
                                <CCol key={mName} md={6}>
                                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-3 h-full">
                                        <div className="flex items-center justify-between">
                                            <CBadge color="indigo" className="text-xs font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                                                {mName}
                                            </CBadge>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-200/60 text-center">
                                            <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase m-0">
                                                    {effData.elapsed_shift_minutes && effData.elapsed_shift_minutes < effData.total_shift_minutes ? 'Shift Berjalan' : 'Total Shift'}
                                                </p>
                                                <p className="text-xs font-black text-slate-700 mt-0.5 mb-0">
                                                    {effData.elapsed_shift_minutes && effData.elapsed_shift_minutes < effData.total_shift_minutes 
                                                        ? `${effData.elapsed_shift_minutes}/${effData.total_shift_minutes}`
                                                        : effData.total_shift_minutes} <span className="text-[9px] font-normal">mnt</span>
                                                </p>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase m-0">Input Aktif</p>
                                                <p className="text-xs font-black text-emerald-600 mt-0.5 mb-0">{effData.active_minutes} <span className="text-[9px] font-normal">mnt</span></p>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase m-0">Pergantian Dimsum</p>
                                                <p className="text-xs font-black text-amber-600 mt-0.5 mb-0">{effData.changeover_minutes} <span className="text-[9px] font-normal">mnt ({effData.changeover_count}x)</span></p>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase m-0">Kendala (Stop)</p>
                                                <p className="text-xs font-black text-rose-600 mt-0.5 mb-0">{effData.unplanned_minutes} <span className="text-[9px] font-normal">mnt</span></p>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase m-0">Loss Time (Idle)</p>
                                                <p className="text-xs font-black text-purple-600 mt-0.5 mb-0">{effData.loss_minutes ?? 0} <span className="text-[9px] font-normal">mnt</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </CCol>
                            );
                        })}
                    </CRow>
                </CCardBody>
            </CCard>

            {/* UNPLANNED STOPS SECTION */}
            <CCard className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                <CCardHeader className="bg-white px-6 py-4 md:px-8 border-b border-slate-100 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-500 flex items-center justify-center text-base">🛑</span>
                    <h3 className="text-base font-bold text-slate-800 m-0">Rekapan Kendala (Unplanned Stop)</h3>
                    {stats?.unplanned_stops?.length > 0 && (
                        <CBadge color="danger" className="ml-auto bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-full border-0">
                            {stats.unplanned_stops.length} kejadian
                        </CBadge>
                    )}
                </CCardHeader>
                <CCardBody className="p-0">
                    {(!stats || !stats.unplanned_stops || stats.unplanned_stops.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <span className="text-3xl mb-2">✅</span>
                            <p className="text-slate-400 font-semibold text-sm">Tidak ada kendala pada periode ini.</p>
                        </div>
                    ) : (
                        <CTable align="middle" hover responsive className="mb-0 text-sm">
                            <CTableHead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <CTableRow>
                                    <CTableHeaderCell className="px-5 py-3">#</CTableHeaderCell>
                                    <CTableHeaderCell className="px-5 py-3">Jenis Kendala</CTableHeaderCell>
                                    <CTableHeaderCell className="px-5 py-3">Mulai</CTableHeaderCell>
                                    <CTableHeaderCell className="px-5 py-3">Mesin</CTableHeaderCell>
                                    <CTableHeaderCell className="px-5 py-3">Shift</CTableHeaderCell>
                                    <CTableHeaderCell className="px-5 py-3">PIC</CTableHeaderCell>
                                    <CTableHeaderCell className="px-5 py-3">Durasi</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
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
                                        <CTableRow key={idx}>
                                            <CTableDataCell className="px-5 py-3.5 text-slate-400 font-bold">{idx + 1}</CTableDataCell>
                                            <CTableDataCell className="px-5 py-3.5 font-semibold text-slate-800">{descString}</CTableDataCell>
                                            <CTableDataCell className="px-5 py-3.5">
                                                <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {timeString}
                                                </span>
                                            </CTableDataCell>
                                            <CTableDataCell className="px-5 py-3.5">
                                                <CBadge color="indigo" className="text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-full">
                                                    {stop.machine}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className="px-5 py-3.5">
                                                <CBadge color="success" className="text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                    Shift {stop.shift}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className="px-5 py-3.5">
                                                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                                    {stop.pic}
                                                </span>
                                            </CTableDataCell>
                                            <CTableDataCell className="px-5 py-3.5">
                                                <CBadge color={isUnfinished ? 'danger' : 'warning'} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isUnfinished ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {isUnfinished ? '🔴' : '⏱'} {stop.duration}
                                                </CBadge>
                                            </CTableDataCell>
                                        </CTableRow>
                                    );
                                })}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>

            {/* GRAND TOTAL CARDS (4 Squares) */}
            <CRow className="g-4">
                {PRODUCTS.map(p => {
                    const val = stats?.grand_total?.[p.key] ?? 0;
                    return (
                        <CCol key={p.key} xs={6} md={3}>
                            <CCard className="border border-slate-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl ${p.bgClass} flex items-center justify-center text-2xl`}>
                                        {p.emoji}
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${p.bgClass.replace('50', '400')}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Total {p.label}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight m-0">
                                            <AnimatedNumber value={val} />
                                        </h3>
                                        <span className="text-sm font-semibold text-slate-400">
                                            {p.unit}
                                        </span>
                                    </div>
                                </div>
                            </CCard>
                        </CCol>
                    );
                })}
            </CRow>

            {/* PYRAMID CHART - IQF 1 vs IQF 2 */}
            <CCard className="border border-slate-100 shadow-sm rounded-3xl p-6 md:p-8">
                <div className="text-center mb-8">
                    <h3 className="text-lg font-bold text-slate-800 m-0">Perbandingan Mesin Produksi</h3>
                    
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
            </CCard>

        </div>
    );
}
