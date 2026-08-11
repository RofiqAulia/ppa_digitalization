import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';

/* ─── Constants ─────────────────────────────────────────── */
const PRODUCT_LABELS = {
    siomay: 'Siomay',
    pentol: 'Pentol',
    lumpia: 'Lumpia',
    adonan_pangsit: 'Adonan Pangsit',
};

const THEMES = {
    siomay: { pill: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    pentol: { pill: 'bg-blue-100 text-blue-700 border-blue-200' },
    lumpia: { pill: 'bg-amber-100 text-amber-700 border-amber-200' },
    adonan_pangsit: { pill: 'bg-purple-100 text-purple-700 border-purple-200' },
    default: { pill: 'bg-slate-100 text-slate-700 border-slate-200' }
};

const getCurrentShift = () => {
    const now = new Date();
    const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const hour = wib.getHours();
    if (hour >= 6 && hour < 14) return '1';
    if (hour >= 14 && hour < 22) return '2';
    return '3';
};

/* ─── DetailEditRow component ────────────────────────────── */
function DetailEditRow({ detail, index, isLastInBatch, batchTotal, unplannedStop, isAnomaly }) {
    const [editing, setEditing]       = useState(false);
    const [confirmDel, setConfirmDel] = useState(false);
    const [saving, setSaving]         = useState(false);
    const [deleting, setDeleting]     = useState(false);
    const [form, setForm]             = useState({
        tray_count:   detail.tray_count,
        batch_number: detail.batch_number,
        rak:          detail.rak || '',
        machine:      detail.machine || '',
    });

    const handleSave = () => {
        setSaving(true);
        router.put(`/operator/logsheet-detail/${detail.id}`, form, {
            preserveScroll: true,
            only: ['logsheets'],
            onSuccess: () => { setSaving(false); setEditing(false); },
            onError:   () => setSaving(false),
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/operator/logsheet-detail/${detail.id}`, {
            preserveScroll: true,
            only: ['logsheets'],
            onSuccess: () => setDeleting(false),
            onError:   () => setDeleting(false),
        });
    };

    const handleCancel = () => {
        setForm({
            tray_count:   detail.tray_count,
            batch_number: detail.batch_number,
            rak:          detail.rak || '',
            machine:      detail.machine || '',
        });
        setEditing(false);
        setConfirmDel(false);
    };

    const theme = THEMES[detail.product_type] || THEMES.default;
    const isPack = detail.product_type === 'lumpia' || detail.product_type === 'adonan_pangsit';
    const unit = isPack ? 'K' : 'L';

    let rowBg;
    if (editing || confirmDel) {
        rowBg = 'bg-slate-100';
    } else if (isAnomaly) {
        rowBg = 'bg-red-50 hover:bg-red-100 transition-colors';
    } else {
        rowBg = 'bg-white hover:bg-slate-50 transition-colors';
    }

    return (
        <tr className={`border-b border-slate-100 text-[11px] font-semibold text-slate-700 text-center ${rowBg}`}>
            {/* # */}
            <td className="py-2.5 px-2 w-8">
                <span className={isAnomaly ? 'text-red-500 font-black' : 'text-slate-400'}>{index}</span>
                {isAnomaly && <span title="Anomali: urutan rak tidak sesuai" className="ml-0.5 text-red-400">!</span>}
            </td>

            {/* Aksi */}
            <td className="py-2.5 px-2 w-28">
                {editing ? (
                    <div className="flex items-center justify-center gap-1">
                        <button onClick={handleSave} disabled={saving} className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-50">
                            {saving ? '...' : '✓ Simpan'}
                        </button>
                        <button onClick={handleCancel} className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-300">Batal</button>
                    </div>
                ) : confirmDel ? (
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-rose-500 font-bold">Yakin hapus?</span>
                        <div className="flex gap-1">
                            <button onClick={handleDelete} disabled={deleting} className="px-2 py-0.5 bg-rose-500 text-white font-bold text-[9px] rounded hover:bg-rose-600 disabled:opacity-50">
                                {deleting ? '...' : 'Ya'}
                            </button>
                            <button onClick={() => setConfirmDel(false)} className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-[9px] rounded hover:bg-slate-300">Batal</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(true)} title="Edit" className="p-1 text-slate-500 hover:text-indigo-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setConfirmDel(true)} title="Hapus" className="p-1 text-slate-500 hover:text-rose-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                )}
            </td>

            {/* PIC */}
            <td className="py-2.5 px-2 text-left whitespace-nowrap">{detail.pic || '-'}</td>

            {/* Jenis Produk */}
            <td className="py-2.5 px-2">
                <span className={`inline-block px-2.5 py-0.5 rounded border ${theme.pill} font-bold text-[10px] uppercase tracking-wider`}>
                    {PRODUCT_LABELS[detail.product_type] || detail.product_type}
                </span>
            </td>

            {/* Mesin — editable select */}
            <td className="py-2.5 px-2">
                {editing ? (
                    <select
                        value={form.machine}
                        onChange={e => setForm(p => ({ ...p, machine: e.target.value }))}
                        className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold text-center focus:outline-none focus:ring-1 focus:ring-indigo-400 mx-auto block bg-white"
                    >
                        <option value="IQF 1">IQF 1</option>
                        <option value="IQF 2">IQF 2</option>
                    </select>
                ) : (
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px]">
                        {detail.machine}
                    </span>
                )}
            </td>

            {/* No Batch — editable */}
            <td className="py-2.5 px-2 font-bold">
                {editing ? (
                    <input
                        type="number"
                        min="1"
                        value={form.batch_number}
                        onChange={e => setForm(p => ({ ...p, batch_number: e.target.value }))}
                        className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold w-14 text-center focus:outline-none focus:ring-1 focus:ring-indigo-400 mx-auto block"
                    />
                ) : (
                    detail.batch_number
                )}
            </td>

            {/* Waktu — read-only */}
            <td className="py-2.5 px-2">
                <span className="font-bold text-indigo-800 text-xs">
                    {detail.time ? detail.time.substring(0, 5) : '-'}
                </span>
            </td>

            {/* Rak/Rongga — editable */}
            <td className="py-2.5 px-2 font-bold">
                {editing ? (
                    <input
                        type="number"
                        min="1"
                        value={form.rak}
                        onChange={e => setForm(p => ({ ...p, rak: e.target.value }))}
                        className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold w-14 text-center focus:outline-none focus:ring-1 focus:ring-indigo-400 mx-auto block"
                    />
                ) : (
                    detail.rak || '-'
                )}
            </td>

            {/* Jumlah */}
            <td className="py-2.5 px-2">
                {editing ? (
                    <input
                        type="number"
                        min="1"
                        value={form.tray_count}
                        onChange={e => setForm(p => ({ ...p, tray_count: e.target.value }))}
                        className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold w-12 text-center focus:outline-none focus:ring-1 focus:ring-indigo-400 mx-auto block"
                    />
                ) : (
                    <span className="inline-block px-2.5 py-0.5 border border-indigo-200 text-indigo-700 bg-indigo-50/50 rounded font-bold text-[10px]">
                        {detail.tray_count}
                    </span>
                )}
            </td>

            {/* Total (subtotal per batch, shown on last row) */}
            <td className="py-2.5 px-2">
                {isLastInBatch && batchTotal > 0 ? (
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold text-[10px]">
                        {batchTotal} {unit}
                    </span>
                ) : (
                    <span className="text-slate-300">—</span>
                )}
            </td>

            {/* Unplanned Stop */}
            <td className="py-2.5 px-2 text-left max-w-[150px] truncate" title={unplannedStop}>
                {isLastInBatch && unplannedStop && unplannedStop !== '-' ? (
                    <span className="text-orange-600 font-medium text-[10px]">{unplannedStop}</span>
                ) : (
                    <span className="text-slate-300">-</span>
                )}
            </td>

            {/* Aksi — removed here, now at position 2 */}
        </tr>
    );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function OperatorLogsheet({ logsheets }) {
    const [filterShift, setFilterShift] = useState(getCurrentShift());

    const uniqueShifts = [...new Set((logsheets || []).map(l => l.shift))];

    const filteredData = useMemo(() => {
        let data = logsheets || [];
        if (filterShift !== 'ALL') data = data.filter(d => d.shift.toString() === filterShift);
        return data;
    }, [logsheets, filterShift]);

    // Group by Date + Shift only (all machines combined)
    const groups = useMemo(() => {
        const grouped = {};

        filteredData.forEach(ls => {
            const groupKey = `${ls.date}|${ls.shift}`;
            if (!grouped[groupKey]) {
                grouped[groupKey] = {
                    date: ls.date,
                    shift: ls.shift,
                    details: [],
                    totalsByProduct: {}
                };
            }
            const g = grouped[groupKey];

            if (ls.details) {
                ls.details.forEach(d => {
                    const count = parseInt(d.tray_count) || 0;
                    if (!g.totalsByProduct[ls.product_type]) g.totalsByProduct[ls.product_type] = 0;
                    g.totalsByProduct[ls.product_type] += count;

                    g.details.push({
                        ...d,
                        parent_id: ls.id,
                        batch_number: ls.batch_number || '-',
                        machine: ls.machine,
                        product_type: ls.product_type,
                        date: ls.date,
                        shift: ls.shift,
                        unplanned_stop: ls.unplanned_stop || '-',
                    });
                });
            }
        });

        Object.values(grouped).forEach(g => {
            g.details.sort((a, b) => {
                const timeA = a.time || '';
                const timeB = b.time || '';
                if (timeA !== timeB) return timeB.localeCompare(timeA);
                return b.id - a.id;
            });

            const batchTracker = {};
            g.details.forEach(d => {
                const batchKey = `${d.machine}_${d.product_type}_${d.batch_number}`;
                if (!batchTracker[batchKey]) batchTracker[batchKey] = { count: 0, oldestId: d.id };
                batchTracker[batchKey].count += (parseInt(d.tray_count) || 0);
                batchTracker[batchKey].oldestId = d.id;
            });
            g.details.forEach(d => {
                const batchKey = `${d.machine}_${d.product_type}_${d.batch_number}`;
                d.batchTotal = batchTracker[batchKey].count;
                d.isLastInBatch = (d.id === batchTracker[batchKey].oldestId);
            });

            // ── Anomaly Detection: rak harus naik seiring waktu ──────────
            // Kelompokkan per product_type saja (karena sudah di dalam grup Shift+Tanggal yg sama),
            // urutkan ascending waktu, tandai baris yang raknya < rak sebelumnya sebagai anomali.
            const anomalyGroups = {};
            g.details.forEach(d => {
                const key = d.product_type;
                if (!anomalyGroups[key]) anomalyGroups[key] = [];
                anomalyGroups[key].push(d);
            });
            Object.values(anomalyGroups).forEach(entries => {
                // Sort ascending by time to check rak order chronologically
                const sorted = [...entries].sort((a, b) => {
                    const tA = a.time || '';
                    const tB = b.time || '';
                    if (tA !== tB) return tA.localeCompare(tB);
                    return a.id - b.id;
                });
                let prevRak = -Infinity;
                sorted.forEach(d => {
                    const curRak = parseInt(d.rak) || 0;
                    d.isAnomaly = curRak > 0 && curRak < prevRak;
                    if (curRak > 0) prevRak = curRak;
                });
            });
        });

        return Object.values(grouped).sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return b.shift - a.shift;
        });
    }, [filteredData]);

    const PillTab = ({ active, onClick, label, colorClass = 'bg-slate-800 text-white' }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all duration-200 border ${
                active
                    ? `${colorClass} border-transparent shadow-sm`
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
        >
            {label}
        </button>
    );

    return (
        <OperatorLayout>
            <Head title="Laporan IQF" />

            <div className="min-h-screen bg-slate-50/50">
                <div className="max-w-[1500px] mx-auto px-4 py-6">

                    {/* Compact Header & Filters */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-6 flex-wrap">
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-widest">LOGSHEET IQF</h1>
                            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Shift:</span>
                                <PillTab active={filterShift === 'ALL'} onClick={() => setFilterShift('ALL')} label="Semua" />
                                {['1', '2', '3'].filter(s => uniqueShifts.includes(parseInt(s))).map(s => (
                                    <PillTab key={s} active={filterShift === s} onClick={() => setFilterShift(s)} label={`Shift ${s}`} colorClass="bg-blue-600 text-white" />
                                ))}
                            </div>
                        </div>
                        <Link href="/" className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-widest rounded-full transition-all shadow-sm">
                            ← Ke Terminal
                        </Link>
                    </div>

                    {/* Tables */}
                    <div className="space-y-6">
                        {groups.length > 0 ? groups.map((group, idx) => {
                            const totalsArr = [];
                            if (group.totalsByProduct['siomay'])       totalsArr.push(<span key="sio" className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded font-bold text-[10px]">Sio: {group.totalsByProduct['siomay']}L</span>);
                            if (group.totalsByProduct['pentol'])        totalsArr.push(<span key="pen" className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold text-[10px]">Pen: {group.totalsByProduct['pentol']}L</span>);
                            if (group.totalsByProduct['lumpia'])        totalsArr.push(<span key="lum" className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px]">Lum: {group.totalsByProduct['lumpia']}K</span>);
                            if (group.totalsByProduct['adonan_pangsit'])totalsArr.push(<span key="ado" className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold text-[10px]">Ado: {group.totalsByProduct['adonan_pangsit']}K</span>);

                            const dParts = group.date.split('-');
                            const formattedDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : group.date;

                            return (
                                <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                            <span className="text-sm font-black text-slate-800">IQF</span>
                                            <span className="text-slate-300">|</span>
                                            <span>{formattedDate}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">Shift {group.shift}</span>
                                            <span className="text-slate-400 font-medium ml-2">{group.details.length} entri</span>
                                        </div>
                                        <div className="flex items-center gap-2">{totalsArr}</div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-[#1e293b] text-white text-[10px] uppercase tracking-wider font-bold">
                                                    <th className="py-2.5 px-2 text-center w-8">#</th>
                                                    <th className="py-2.5 px-2 text-center">Aksi</th>
                                                    <th className="py-2.5 px-2 text-left">PIC</th>
                                                    <th className="py-2.5 px-2 text-center">Jenis Produk</th>
                                                    <th className="py-2.5 px-2 text-center">Mesin</th>
                                                    <th className="py-2.5 px-2 text-center">No Batch</th>
                                                    <th className="py-2.5 px-2 text-center">Waktu</th>
                                                    <th className="py-2.5 px-2 text-center">Rak/Rongga</th>
                                                    <th className="py-2.5 px-2 text-center">Jumlah (Loyang/Keranjang)</th>
                                                    <th className="py-2.5 px-2 text-center bg-[#0f766e]">Total</th>
                                                    <th className="py-2.5 px-2 text-left">Unplanned Stop</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.details.map((detail, dIdx) => (
                                                    <DetailEditRow
                                                        key={detail.id}
                                                        detail={detail}
                                                        index={dIdx + 1}
                                                        isLastInBatch={detail.isLastInBatch}
                                                        batchTotal={detail.batchTotal}
                                                        unplannedStop={detail.unplanned_stop}
                                                        isAnomaly={detail.isAnomaly || false}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                                <span className="text-5xl mb-4 opacity-30">📭</span>
                                <h3 className="text-base font-black text-slate-700 uppercase tracking-widest mb-1">Tidak Ada Data</h3>
                                <p className="text-slate-400 font-medium text-xs">Ubah filter shift untuk melihat data lain.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </OperatorLayout>
    );
}
