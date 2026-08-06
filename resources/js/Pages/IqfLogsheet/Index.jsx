import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import DataTable from './Components/DataTable';

export default function Index({ logsheets }) {
    return (
        <AppLayout>
            <Head title="IQF Logsheet" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Formulir IQF &amp; Freezing (Hari Ini)</h2>
                    <p className="text-muted-foreground text-sm font-medium">List of today's production logsheet records</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/iqf-logsheet/history">
                        <Button variant="outline" className="bg-pink-500 hover:bg-pink-600 text-white hover:text-white border-0 shadow-sm">
                            History Data
                        </Button>
                    </Link>
                    {/* <a href="/iqf-kiosk" target="_blank">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            Terminal Operator
                        </Button>
                    </a> */}
                </div>
            </div>

            <div className="min-h-[calc(100vh-160px)] md:h-[calc(100vh-160px)]">
                <DataTable logsheets={logsheets} />
            </div>
        </AppLayout>
    );
}
