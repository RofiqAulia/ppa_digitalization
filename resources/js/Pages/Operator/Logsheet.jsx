import React from 'react';
import { Head, Link } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';

const PRODUCT_LABELS = {
    siomay: 'Siomay',
    pentol: 'Pentol',
    lumpia: 'Lumpia',
    adonan_pangsit: 'Adonan Pangsit',
};

const SHIFT_LABELS = {
    1: 'Shift 1 (06:00 - 14:00)',
    2: 'Shift 2 (14:00 - 22:00)',
    3: 'Shift 3 (22:00 - 06:00)',
};

export default function OperatorLogsheet({ logsheets }) {
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'Asia/Jakarta',
    });

    return (
        <OperatorLayout>
            <Head title="Logsheet Hari Ini" />

            {/* Full white background for this page */}
            <div className="min-h-screen bg-white">
                <div className="max-w-5xl mx-auto px-4 py-10">
                    
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-widest mb-1">
                                Logsheet Hari Ini
                            </h1>
                            <p className="text-sm font-bold text-slate-500">{today}</p>
                        </div>
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-6 py-3 bg-cyan-100 hover:bg-cyan-200 text-slate-800 font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-sm"
                        >
                            <span>←</span> Kembali ke Terminal
                        </Link>
                    </div>

                    {/* Table */}
                    {logsheets && logsheets.length > 0 ? (
                        <div className="overflow-x-auto rounded-3xl border-2 border-pink-100 shadow-xl shadow-pink-500/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-pink-500 to-pink-400 text-white">
                                        <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-xs rounded-tl-3xl">Mesin</th>
                                        <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-xs">Produk</th>
                                        <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-xs">Shift</th>
                                        <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-xs">No. Batch</th>
                                        <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-xs">Detail Entri</th>
                                        <th className="px-4 py-4 text-right font-black uppercase tracking-widest text-xs rounded-tr-3xl">Total Loyang</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pink-50">
                                    {logsheets.map((ls, i) => {
                                        const totalTrays = ls.details?.reduce((s, d) => s + (parseInt(d.tray_count) || 0), 0) ?? 0;
                                        return (
                                            <tr key={ls.id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'} hover:bg-cyan-50/50`}>
                                                <td className="px-4 py-3 font-black text-slate-800">{ls.machine}</td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-pink-100 text-pink-700 font-black text-xs px-3 py-1 rounded-full uppercase">
                                                        {PRODUCT_LABELS[ls.product_type] || ls.product_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 font-bold text-xs">{SHIFT_LABELS[ls.shift] || `Shift ${ls.shift}`}</td>
                                                <td className="px-4 py-3 font-mono font-black text-slate-700">{ls.batch_number ?? '-'}</td>
                                                <td className="px-4 py-3">
                                                    {ls.details && ls.details.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {ls.details.map((d, di) => (
                                                                <span key={di} className="bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                                                    Rak {d.rak ?? '-'}: {d.tray_count} loy
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs font-bold italic">Belum ada detail</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="bg-pink-500 text-white font-black text-sm px-4 py-1.5 rounded-full shadow-sm">
                                                        {totalTrays}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="text-6xl mb-6">📋</div>
                            <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest mb-2">Belum Ada Data</h3>
                            <p className="text-sm font-bold text-slate-400">Logsheet hari ini masih kosong. Silakan mulai pencatatan dari Terminal.</p>
                            <Link href="/" className="mt-8 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full shadow-md transition-all">
                                Ke Terminal
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </OperatorLayout>
    );
}
