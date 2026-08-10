import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/* ─── Constants ─────────────────────────────────────────── */
const PRODUCT_LABELS = {
    siomay: 'Siomay',
    pentol: 'Pentol',
    lumpia: 'Lumpia',
    adonan_pangsit: 'Adonan Pangsit',
};

const HOURS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
    '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
];

/* ─── Helpers ─────────────────────────────────────────────── */
const timeToMinutes = (t) => {
    if (!t) return null;
    const parts = t.split(':');
    if (parts.length < 2) return null;
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

const calcDurationMinutes = (stopMin, nextMin) => {
    if (nextMin === null || stopMin === null) return null;
    if (nextMin >= stopMin) return nextMin - stopMin;
    return (nextMin + 1440) - stopMin;
};

const calcStopDurations = (unplannedStopText, allMachineDetails) => {
    if (!unplannedStopText || unplannedStopText === '-') return [];

    const stops = unplannedStopText.split(',').map(s => s.trim()).filter(Boolean);
    const sortedDetails = [...(allMachineDetails || [])]
        .filter(d => d.created_at && d.time)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return stops.map(stopText => {
        const timeMatch = stopText.match(/^(\d{1,2}):(\d{2})/);
        if (!timeMatch) return { text: stopText, duration: null, resumed: false };

        const stopMin = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);

        const nextDetail = sortedDetails.find(d => {
            const date = new Date(d.created_at);
            const wibTime = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit', minute: '2-digit', hour12: false
            }).format(date);
            const [h, m] = wibTime.split(':');
            const dmCreated = parseInt(h) * 60 + parseInt(m);
            const diff = dmCreated >= stopMin ? dmCreated - stopMin : dmCreated + 1440 - stopMin;
            return diff >= 0 && diff < 720;
        });

        const duration = nextDetail
            ? calcDurationMinutes(stopMin, timeToMinutes(nextDetail.time))
            : null;

        return { text: stopText, duration, resumed: !!nextDetail };
    });
};

/* ─── DetailEditRow component ────────────────────────────── */
function DetailEditRow({ detail }) {
    const [editing, setEditing]           = useState(false);
    const [confirmDel, setConfirmDel]     = useState(false);
    const [saving, setSaving]             = useState(false);
    const [deleting, setDeleting]         = useState(false);
    const [form, setForm]                 = useState({
        tray_count: detail.tray_count,
        time: detail.time ? detail.time.substring(0, 5) : '',
    });

    const handleSave = () => {
        setSaving(true);
        router.put(`/operator/refrezing-logsheet-detail/${detail.id}`, form, {
            preserveScroll: true,
            only: ['logsheets'],
            onSuccess: () => { setSaving(false); setEditing(false); },
            onError:   () => setSaving(false),
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/operator/refrezing-logsheet-detail/${detail.id}`, {
            preserveScroll: true,
            only: ['logsheets'],
            onSuccess: () => setDeleting(false),
            onError:   () => setDeleting(false),
        });
    };

    const handleCancel = () => {
        setForm({ tray_count: detail.tray_count, time: detail.time ? detail.time.substring(0, 5) : '' });
        setEditing(false);
        setConfirmDel(false);
    };

    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group">
            {/* Aksi (Kiri) */}
            <td className="px-3 py-2 text-left w-48">
                {editing ? (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {saving ? '⏳' : '✓'} {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                ) : confirmDel ? (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-rose-500 font-bold mr-1">Yakin hapus?</span>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {deleting ? '⏳' : '🗑 Hapus'}
                        </button>
                        <button
                            onClick={() => setConfirmDel(false)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setEditing(true)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit baris ini"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setConfirmDel(true)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus baris ini"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </td>

            {/* Waktu */}
            <td className="px-3 py-2">
                {editing ? (
                    <input
                        type="time"
                        value={form.time}
                        onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                        className="border-2 border-cyan-300 rounded-lg px-2 py-1 text-xs font-mono w-24 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    />
                ) : (
                    <span className="font-mono font-bold text-slate-700 text-xs">
                        {detail.time ? detail.time.substring(0, 5) : '-'}
                    </span>
                )}
            </td>

            {/* Jumlah Loyang */}
            <td className="px-3 py-2 text-center">
                {editing ? (
                    <input
                        type="number"
                        min="1"
                        value={form.tray_count}
                        onChange={e => setForm(p => ({ ...p, tray_count: e.target.value }))}
                        className="border-2 border-cyan-300 rounded-lg px-2 py-1 text-xs font-black w-16 text-center focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    />
                ) : (
                    <span className="font-black text-slate-800 text-sm">{detail.tray_count}</span>
                )}
            </td>

            {/* Rak */}
            <td className="px-3 py-2 text-center text-xs text-slate-500 font-medium">{detail.rak || '-'}</td>

            {/* PIC */}
            <td className="px-3 py-2 text-xs text-slate-500 max-w-[100px] truncate">{detail.pic || '-'}</td>
        </tr>
    );
}

/* ─── UnplannedStopCell ─────────────────────────────────── */
function UnplannedStopCell({ stopDurations }) {
    if (!stopDurations || stopDurations.length === 0) {
        return <span className="text-slate-300 text-xs">-</span>;
    }

    return (
        <div className="flex flex-col gap-1.5">
            {stopDurations.map((stop, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-orange-600 font-bold text-xs leading-tight">{stop.text}</span>
                    {stop.resumed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 w-fit">
                            ⏱ {stop.duration} menit
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 w-fit">
                            🔴 Belum selesai
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function RefrezingLogsheet({ logsheets }) {
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'Asia/Jakarta',
    });

    const [filterJenis,  setFilterJenis]  = useState('ALL');
    const [filterShift,  setFilterShift]  = useState('ALL');
    const [filterMesin,  setFilterMesin]  = useState('ALL');
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => setExpandedRows(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const filteredData = useMemo(() => {
        let data = logsheets || [];
        if (filterJenis !== 'ALL') data = data.filter(d => d.product_type === filterJenis);
        if (filterShift !== 'ALL') data = data.filter(d => d.shift.toString() === filterShift);
        if (filterMesin !== 'ALL') data = data.filter(d => d.machine === filterMesin);
        return data;
    }, [logsheets, filterJenis, filterShift, filterMesin]);

    const rows = useMemo(() => {
        const detailsByMachine = {};
        (logsheets || []).forEach(ls => {
            if (!ls.machine) return;
            if (!detailsByMachine[ls.machine]) detailsByMachine[ls.machine] = [];
            (ls.details || []).forEach(d => detailsByMachine[ls.machine].push(d));
        });

        return filteredData.map(ls => {
            const hourData = {};
            let pic = '-';

            if (ls.details) {
                ls.details.forEach(d => {
                    if (d.pic && d.pic !== '-' && d.pic !== 'Unknown') pic = d.pic;
                    const timeParts = d.time ? d.time.split(':') : [];
                    if (timeParts.length >= 1) {
                        const hour = timeParts[0] + ':00';
                        if (!hourData[hour]) hourData[hour] = 0;
                        hourData[hour] += (parseInt(d.tray_count) || 0);
                    }
                });
            }

            const totalAchieve = ls.details?.reduce((sum, d) => sum + (parseInt(d.tray_count) || 0), 0) ?? 0;
            const allMachineDetails = detailsByMachine[ls.machine] || ls.details || [];
            const stopDurations = calcStopDurations(ls.unplanned_stop, allMachineDetails);
            const sortedDetails = [...(ls.details || [])].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

            return {
                id: ls.id,
                pic,
                shift: ls.shift,
                machine: ls.machine,
                product_type: ls.product_type,
                tgl: ls.date,
                batch: ls.batch_number || '-',
                unplanned_stop: ls.unplanned_stop || '-',
                stopDurations,
                hourData,
                achieve: totalAchieve,
                details: sortedDetails,
            };
        });
    }, [filteredData, logsheets]);

    const uniqueProducts = [...new Set((logsheets || []).map(l => l.product_type))];
    const uniqueShifts   = [...new Set((logsheets || []).map(l => l.shift))];
    const uniqueMachines = [...new Set((logsheets || []).map(l => l.machine))];

    return (
        <OperatorLayout>
            <Head title="Logsheet Refrezing Hari Ini" />

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-[1600px] mx-auto px-4 py-8 overflow-x-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full"></div>
                                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
                                    Logsheet Refrezing
                                </h1>
                            </div>
                            <p className="text-sm font-bold text-slate-500 ml-6">{today}</p>
                        </div>
                        <Link
                            href="/refrezing-kiosk"
                            className="flex items-center gap-2 px-6 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-sm"
                        >
                            <span>←</span> Kembali ke Terminal Refrezing
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="w-48">
                            <label className="text-[10px] font-black text-slate-500 mb-1 block uppercase tracking-widest">Jenis Dimsum</label>
                            <Select value={filterJenis} onValueChange={setFilterJenis}>
                                <SelectTrigger className="bg-white border-2 border-slate-200 rounded-lg shadow-sm font-bold h-10"><SelectValue placeholder="Semua" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="font-bold">SEMUA JENIS</SelectItem>
                                    {uniqueProducts.map(p => (
                                        <SelectItem key={p} value={p} className="font-bold uppercase">{PRODUCT_LABELS[p] || p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-40">
                            <label className="text-[10px] font-black text-slate-500 mb-1 block uppercase tracking-widest">Shift</label>
                            <Select value={filterShift} onValueChange={setFilterShift}>
                                <SelectTrigger className="bg-white border-2 border-slate-200 rounded-lg shadow-sm font-bold h-10"><SelectValue placeholder="Semua" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="font-bold">SEMUA SHIFT</SelectItem>
                                    {uniqueShifts.map(s => (
                                        <SelectItem key={s} value={s.toString()} className="font-bold uppercase">SHIFT {s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-40">
                            <label className="text-[10px] font-black text-slate-500 mb-1 block uppercase tracking-widest">Mesin / IQF</label>
                            <Select value={filterMesin} onValueChange={setFilterMesin}>
                                <SelectTrigger className="bg-white border-2 border-slate-200 rounded-lg shadow-sm font-bold h-10"><SelectValue placeholder="Semua" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="font-bold">SEMUA MESIN</SelectItem>
                                    {uniqueMachines.map(m => (
                                        <SelectItem key={m} value={m} className="font-bold uppercase">{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border-2 border-slate-200 rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full text-xs whitespace-nowrap">
                            <thead>
                                <tr className="bg-cyan-500 text-white font-black uppercase tracking-wider text-[11px]">
                                    <th className="px-2 py-3 border border-cyan-400/30 text-center w-8 sticky left-0 bg-cyan-500 z-10"></th>
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center sticky left-8 bg-cyan-500 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">PIC</th>
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center">Shift</th>
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center">Mesin</th>
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center">Produk</th>
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center">TGL</th>
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center">BATCH</th>
                                    {HOURS.map(h => {
                                        const d = h.startsWith('0') ? h.substring(1) : h;
                                        return <th key={h} className="px-2 py-3 border border-cyan-400/30 text-center w-12">{d}</th>;
                                    })}
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center bg-cyan-600">Achieve</th>
                                    <th className="px-4 py-3 border border-cyan-400/30 text-center bg-orange-500 min-w-[180px]">Unplanned Stop</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? rows.map((row, idx) => {
                                    const isExpanded = expandedRows.has(row.id);
                                    return (
                                        <React.Fragment key={row.id}>
                                            <tr
                                                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-cyan-50 transition-colors cursor-pointer`}
                                                onClick={() => toggleRow(row.id)}
                                            >
                                                <td className="px-2 py-2.5 border border-slate-200 text-center sticky left-0 z-10 bg-inherit">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center text-cyan-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 border border-slate-200 text-center font-black text-slate-800 sticky left-8 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-inherit">{row.pic}</td>
                                                <td className="px-4 py-2.5 border border-slate-200 text-center">
                                                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full font-black text-[10px]">Shift {row.shift}</span>
                                                </td>
                                                <td className="px-4 py-2.5 border border-slate-200 text-center font-bold text-slate-700">{row.machine}</td>
                                                <td className="px-4 py-2.5 border border-slate-200 text-center font-bold text-slate-600 capitalize">{PRODUCT_LABELS[row.product_type] || row.product_type}</td>
                                                <td className="px-4 py-2.5 border border-slate-200 text-center text-slate-500 font-semibold">{row.tgl}</td>
                                                <td className="px-4 py-2.5 border border-slate-200 text-center font-black text-slate-700">{row.batch}</td>
                                                {HOURS.map(h => (
                                                    <td key={h} className="px-2 py-2.5 border border-slate-200 text-center">
                                                        {row.hourData[h] ? (
                                                            <span className="font-black text-slate-800">{row.hourData[h]}</span>
                                                        ) : (
                                                            <span className="text-slate-200">-</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-2.5 border border-slate-200 text-center font-black text-cyan-600 bg-cyan-50/50">
                                                    {row.achieve}
                                                </td>
                                                <td className="px-4 py-2.5 border border-slate-200 text-left" onClick={e => e.stopPropagation()}>
                                                    <UnplannedStopCell stopDurations={row.stopDurations} />
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr key={`detail-${row.id}`}>
                                                    <td colSpan={HOURS.length + 9} className="p-0 border-b-2 border-cyan-200">
                                                        <div className="bg-gradient-to-r from-cyan-50 to-sky-50 border-t border-cyan-100 px-6 py-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-1.5 h-5 bg-cyan-500 rounded-full" />
                                                                <p className="text-[11px] font-black text-cyan-700 uppercase tracking-widest">
                                                                    Detail Input — {row.details.length} Entri
                                                                </p>
                                                            </div>

                                                            {row.details.length > 0 ? (
                                                                <div className="bg-white rounded-xl border border-cyan-100 overflow-hidden shadow-sm">
                                                                    <table className="w-full text-xs">
                                                                        <thead>
                                                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-500 w-48">Aksi</th>
                                                                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-500 w-28">Waktu</th>
                                                                                <th className="px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 w-24">Jumlah Loyang</th>
                                                                                <th className="px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 w-16">Rak</th>
                                                                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">PIC</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {row.details.map(d => (
                                                                                <DetailEditRow key={d.id} detail={d} />
                                                                            ))}
                                                                        </tbody>
                                                                        <tfoot>
                                                                            <tr className="bg-cyan-50 border-t-2 border-cyan-200">
                                                                                <td colSpan={2} className="px-3 py-2 text-right text-[10px] font-black text-cyan-600 uppercase">Total</td>
                                                                                <td className="px-3 py-2 text-center font-black text-cyan-700 text-sm">{row.achieve}</td>
                                                                                <td colSpan={2} />
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-6 text-slate-400 font-bold text-xs">
                                                                    Belum ada entri detail untuk logsheet ini.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={HOURS.length + 9} className="px-4 py-16 text-center">
                                            <div className="text-4xl mb-3">📭</div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">Belum ada data Refrezing hari ini</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </OperatorLayout>
    );
}
