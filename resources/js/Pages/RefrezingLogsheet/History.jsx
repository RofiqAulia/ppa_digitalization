import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList, FileDown } from 'lucide-react';
import DataTable from './Components/DataTable';

export default function History({ logsheets }) {
    return (
        <AppLayout>
            <Head title="Riwayat Refrezing Logsheet" />

            {/* ── Premium Page Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4 no-print">
                <div className="flex items-center gap-4">
                    {/* Icon badge */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                        <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Riwayat Logsheet</h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200 uppercase tracking-wider">Refrezing Production</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">History of previous production logsheet records</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    <Link href="/refrezing/logsheet">
                        <Button variant="outline" className="text-slate-600 border-slate-300 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300 shadow-sm transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Hari Ini
                        </Button>
                    </Link>
                </div>
            </div>

            <div>
                <DataTable logsheets={logsheets} />
            </div>
        </AppLayout>
    );
}
