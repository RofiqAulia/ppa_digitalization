import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, Layers, Printer, Activity } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import 'primereact/resources/primereact.min.css';

export default function AnomalyDetectionSection({ anomalyData, title = "Deteksi Anomali & Rekap Shift IQF" }) {
    const [selectedTab, setSelectedTab] = useState('ALL'); // 'ALL', 'IQF 1', 'IQF 2'
    const [printingMachine, setPrintingMachine] = useState(null); // null, 'IQF 1', 'IQF 2'

    if (!anomalyData) {
        return (
            <div className="bg-white border border-slate-200/80 shadow-xs rounded-3xl p-6 text-center text-slate-400 text-xs font-semibold">
                Memuat data deteksi anomali...
            </div>
        );
    }

    // Extract per-machine data if available
    const machineDataMap = anomalyData.by_machine || anomalyData.anomaly_detection_by_machine || {};
    const iqf1Data = machineDataMap['IQF 1'] || null;
    const iqf2Data = machineDataMap['IQF 2'] || null;

    const handlePrintAnomaly = () => {
        setPrintingMachine(null);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handlePrintMachine = (mName) => {
        setPrintingMachine(mName);
        setTimeout(() => {
            window.print();
            setTimeout(() => setPrintingMachine(null), 500);
        }, 150);
    };

    const renderMachineCard = (mName, mData) => {
        if (!mData) {
            return (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 text-center text-slate-400 text-xs font-semibold">
                    Tidak ada data untuk {mName}
                </div>
            );
        }

        const {
            active_minutes_by_product = {},
            total_active_dimsum_mins = 0,
            downtime_minutes = 0,
            total_recorded_minutes = 0,
            target_shift_minutes = 480,
            unaccounted_minutes = 0,
            status = 'normal',
            downtime_entries = [],
            matrix_rows = [],
        } = mData;

        const pentolMins = active_minutes_by_product.pentol ?? 0;
        const siomayMins = active_minutes_by_product.siomay ?? 0;
        const lumpiaMins = active_minutes_by_product.lumpia ?? 0;
        const adonanMins = active_minutes_by_product.adonan_pangsit ?? 0;

        let pentolRows = [...matrix_rows.filter(r => r.product_type === 'pentol')];
        let siomayRows = [...matrix_rows.filter(r => r.product_type === 'siomay')];
        let lumpiaRows = [...matrix_rows.filter(r => r.product_type === 'lumpia')];
        let adonanRows = [...matrix_rows.filter(r => r.product_type === 'adonan_pangsit')];
        let sortedDowntime = [...downtime_entries];

        const maxRowsCount = Math.max(
            siomayRows.length,
            pentolRows.length,
            lumpiaRows.length,
            adonanRows.length,
            sortedDowntime.length,
            1
        );

        const isAnomaly = status === 'anomaly' || unaccounted_minutes > 30;
        const isWarning = status === 'warning' || (unaccounted_minutes > 0 && unaccounted_minutes <= 30);

        // Prepare structured table data array for PrimeReact DataTable
        const tableValue = Array.from({ length: maxRowsCount }).map((_, idx) => {
            const siomayItem  = siomayRows[idx];
            const pentolItem  = pentolRows[idx];
            const lumpiaItem  = lumpiaRows[idx];
            const adonanItem  = adonanRows[idx];
            const dtItem      = sortedDowntime[idx];

            return {
                id: idx + 1,
                index: idx + 1,
                siomay: siomayItem ? `${siomayItem.time} (${siomayItem.tray_count ?? 0} L)` : '-',
                pentol: pentolItem ? `${pentolItem.time} (${pentolItem.tray_count ?? 0} L)` : '-',
                lumpia: lumpiaItem ? `${lumpiaItem.time} (${lumpiaItem.tray_count ?? 0} K)` : '-',
                adonan: adonanItem ? `${adonanItem.time} (${adonanItem.tray_count ?? 0} S)` : '-',
                downtime: dtItem ? (
                    (dtItem.dur_mins && dtItem.dur_mins > 0)
                        ? `${dtItem.text} (⏱ ${dtItem.dur_mins}m)`
                        : `${dtItem.text} (⏱ Belum Selesai)`
                ) : '-',
            };
        });

        const totalDimsumAndDowntime = siomayMins + pentolMins + lumpiaMins + adonanMins + downtime_minutes;

        // Helper function to get the last valid Rak number (or max rak) without falling back to tray_count
        const getRakTerakhir = (rows) => {
            if (!rows || rows.length === 0) return 0;
            for (let i = rows.length - 1; i >= 0; i--) {
                const val = Number(rows[i].rak);
                if (val && !isNaN(val) && val > 0) return val;
            }
            const validRaks = rows.map(r => Number(r.rak)).filter(v => v && !isNaN(v) && v > 0);
            return validRaks.length > 0 ? Math.max(...validRaks) : rows.length;
        };

        // Helper function to get the last valid Batch number
        const getBatchTerakhir = (rows) => {
            if (!rows || rows.length === 0) return 0;
            for (let i = rows.length - 1; i >= 0; i--) {
                const val = Number(rows[i].batch_number);
                if (val && !isNaN(val) && val > 0) return val;
            }
            const validBatches = rows.map(r => Number(r.batch_number)).filter(v => v && !isNaN(v) && v > 0);
            return validBatches.length > 0 ? Math.max(...validBatches) : rows.length;
        };

        const siomayRakTerakhir = getRakTerakhir(siomayRows);
        const pentolRakTerakhir = getRakTerakhir(pentolRows);
        const lumpiaBatchTerakhir = getBatchTerakhir(lumpiaRows);
        const adonanTotalSolid = adonanRows.reduce((sum, r) => sum + (Number(r.tray_count) || 0), 0);

        // Format to 1 decimal place if not a whole integer (e.g., 67.6 for 14 raks)
        const formatMins = (val) => {
            const num = Number(val);
            if (isNaN(num)) return '0';
            return Number.isInteger(num) ? num.toString() : num.toFixed(1);
        };

        const siomayLossMinsVal = (siomayRakTerakhir * 290) / 60;
        const pentolLossMinsVal = (pentolRakTerakhir * 290) / 60;
        const lumpiaLossMinsVal = lumpiaBatchTerakhir * 12;
        const adonanLossMinsVal = adonanTotalSolid * 71;

        const siomayLossMins = formatMins(siomayLossMinsVal);
        const pentolLossMins = formatMins(pentolLossMinsVal);
        const lumpiaLossMins = formatMins(lumpiaLossMinsVal);
        const adonanLossMins = formatMins(adonanLossMinsVal);

        const siomaySelisihVal = siomayMins - siomayLossMinsVal;
        const pentolSelisihVal = pentolMins - pentolLossMinsVal;
        const lumpiaSelisihVal = lumpiaMins - lumpiaLossMinsVal;
        const adonanSelisihVal = adonanMins - adonanLossMinsVal;

        const formatSelisih = (val) => {
            const str = formatMins(val);
            return val > 0 ? `+${str}` : str;
        };

        const siomaySelisih = formatSelisih(siomaySelisihVal);
        const pentolSelisih = formatSelisih(pentolSelisihVal);
        const lumpiaSelisih = formatSelisih(lumpiaSelisihVal);
        const adonanSelisih = formatSelisih(adonanSelisihVal);

        // Define PrimeReact ColumnGroup Header
        const headerGroup = (
            <ColumnGroup>
                <Row>
                    <Column header="NO" sortable field="index" headerStyle={{ backgroundColor: '#475569', color: '#ffffff', fontWeight: 'bold', width: '3.5rem', textAlign: 'center', borderRight: '1px solid #334155' }} />
                    <Column header="SIOMAY" sortable field="siomay" headerStyle={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: '900', textAlign: 'center', letterSpacing: '0.05em' }} />
                    <Column header="PENTOL" sortable field="pentol" headerStyle={{ backgroundColor: '#e11d48', color: '#ffffff', fontWeight: '900', textAlign: 'center', letterSpacing: '0.05em' }} />
                    <Column header="LUMPIA" sortable field="lumpia" headerStyle={{ backgroundColor: '#0d9488', color: '#ffffff', fontWeight: '900', textAlign: 'center', letterSpacing: '0.05em' }} />
                    <Column header="ADONAN PANGSIT" sortable field="adonan" headerStyle={{ backgroundColor: '#9333ea', color: '#ffffff', fontWeight: '900', textAlign: 'center', letterSpacing: '0.05em' }} />
                    <Column header="UNPLANNED STOP" sortable field="downtime" headerStyle={{ backgroundColor: '#b71c1c', color: '#ffffff', fontWeight: '900', textAlign: 'center', letterSpacing: '0.05em' }} />
                </Row>
                <Row>
                    <Column header="TOTAL MENIT" headerStyle={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JLH MENIT</span>
                            <span className="text-xs font-black mt-0.5">{siomayMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JLH MENIT</span>
                            <span className="text-xs font-black mt-0.5">{pentolMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#ffe4e6', color: '#be123c', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JLH MENIT</span>
                            <span className="text-xs font-black mt-0.5">{lumpiaMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#ecfeff', color: '#0891b2', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JLH MENIT</span>
                            <span className="text-xs font-black mt-0.5">{adonanMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#fdf4ff', color: '#a21caf', fontWeight: '900', textAlign: 'center' }} />
                    <Column rowSpan={3} header={
                        <div className="flex flex-col items-center justify-center leading-tight py-1">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JLH MENIT</span>
                            <span className="text-xs font-black mt-1">{downtime_minutes} menit</span>
                            <span className="text-[10px] font-semibold mt-0.5">({sortedDowntime.length} kendala)</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#fef9c3', color: '#854d0e', fontWeight: '900', textAlign: 'center' }} />
                </Row>
                <Row>
                    <Column header="LOSS TIME" headerStyle={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[9px] uppercase font-bold tracking-tight opacity-80">(JUMLAH RAK X 290 DETIK)/60DETIK</span>
                            <span className="text-xs font-black mt-0.5">{siomayLossMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[9px] uppercase font-bold tracking-tight opacity-80">(JUMLAH RAK X 290 DETIK)/60DETIK</span>
                            <span className="text-xs font-black mt-0.5">{pentolLossMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#ffe4e6', color: '#be123c', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[9px] uppercase font-bold tracking-tight opacity-80">JUMLAH BATCH X 12 MENIT</span>
                            <span className="text-xs font-black mt-0.5">{lumpiaLossMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#ecfeff', color: '#0891b2', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[9px] uppercase font-bold tracking-tight opacity-80">JUMLAH SOLID X 71MENIT</span>
                            <span className="text-xs font-black mt-0.5">{adonanLossMins} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#fdf4ff', color: '#a21caf', fontWeight: '900', textAlign: 'center' }} />
                </Row>
                <Row>
                    <Column header="TOTAL SELISIH" headerStyle={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JUMLAH SELISIH</span>
                            <span className="text-xs font-black mt-0.5">{siomaySelisih > 0 ? `+${siomaySelisih}` : siomaySelisih} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JUMLAH SELISIH</span>
                            <span className="text-xs font-black mt-0.5">{pentolSelisih > 0 ? `+${pentolSelisih}` : pentolSelisih} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#ffe4e6', color: '#be123c', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JUMLAH SELISIH</span>
                            <span className="text-xs font-black mt-0.5">{lumpiaSelisih > 0 ? `+${lumpiaSelisih}` : lumpiaSelisih} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#ecfeff', color: '#0891b2', fontWeight: '900', textAlign: 'center' }} />
                    <Column header={
                        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">JUMLAH SELISIH</span>
                            <span className="text-xs font-black mt-0.5">{adonanSelisih > 0 ? `+${adonanSelisih}` : adonanSelisih} menit</span>
                        </div>
                    } headerStyle={{ backgroundColor: '#fdf4ff', color: '#a21caf', fontWeight: '900', textAlign: 'center' }} />
                </Row>
            </ColumnGroup>
        );

        // Body templates for customized cell rendering
        const indexBodyTemplate = (rowData) => (
            <span className="font-mono font-bold text-slate-400">{rowData.index}</span>
        );
        const siomayBodyTemplate = (rowData) => (
            <span className="font-mono text-cyan-900 font-bold">{rowData.siomay}</span>
        );
        const pentolBodyTemplate = (rowData) => (
            <span className="font-mono text-rose-900 font-bold">{rowData.pentol}</span>
        );
        const lumpiaBodyTemplate = (rowData) => (
            <span className="font-mono text-teal-900 font-bold">{rowData.lumpia}</span>
        );
        const adonanBodyTemplate = (rowData) => (
            <span className="font-mono text-purple-900 font-bold">{rowData.adonan}</span>
        );
        const downtimeBodyTemplate = (rowData) => (
            <span className="text-rose-700 font-semibold text-left block leading-relaxed whitespace-pre-line" style={{ lineHeight: '1.5' }}>
                {rowData.downtime}
            </span>
        );

        const cardKeyClass = `machine-card-${mName.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div key={mName} className={`bg-white border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden print-machine-block ${cardKeyClass}`}>
                {/* Print-Only Professional Metadata Header Table */}
                <div className="hidden print-machine-header mb-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
                        <h4 className="text-sm font-black text-slate-900 m-0 uppercase tracking-wide">
                            FORM REKAP MATRIKS DETEKSI ANOMALI & LOGSHEET ({mName})
                        </h4>
                        <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 border ${
                            isAnomaly ? 'bg-rose-100 text-rose-900 border-rose-500' :
                            isWarning ? 'bg-amber-100 text-amber-900 border-amber-500' :
                            'bg-emerald-100 text-emerald-900 border-emerald-500'
                        }`}>
                            STATUS: {isAnomaly ? 'ANOMALI' : isWarning ? 'PERHATIAN' : 'NORMAL'}
                        </span>
                    </div>

                    <table className="w-full text-xs border-collapse border border-slate-900 mb-3 print-meta-table">
                        <tbody>
                            <tr>
                                <td className="bg-slate-100 font-bold px-3 py-1.5 border border-slate-900 w-1/6 text-slate-800">Mesin Production</td>
                                <td className="font-extrabold px-3 py-1.5 border border-slate-900 w-1/3 text-slate-900">{mName}</td>
                                <td className="bg-slate-100 font-bold px-3 py-1.5 border border-slate-900 w-1/6 text-slate-800">Target Shift</td>
                                <td className="font-extrabold px-3 py-1.5 border border-slate-900 w-1/3 text-slate-900">{target_shift_minutes} menit</td>
                            </tr>
                            <tr>
                                <td className="bg-slate-100 font-bold px-3 py-1.5 border border-slate-900 text-slate-800">Total Cover</td>
                                <td className="font-extrabold px-3 py-1.5 border border-slate-900 text-emerald-800">{total_recorded_minutes} menit</td>
                                <td className="bg-slate-100 font-bold px-3 py-1.5 border border-slate-900 text-slate-800">Selisih (Loss Time)</td>
                                <td className={`font-extrabold px-3 py-1.5 border border-slate-900 ${unaccounted_minutes > 0 ? 'text-rose-700 font-black' : 'text-slate-900'}`}>
                                    {unaccounted_minutes} menit
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Header Card Per Mesin (Web View Only) */}
                <div className="bg-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 web-machine-top-header">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 ${
                            isAnomaly ? 'bg-rose-600 shadow-xs' : isWarning ? 'bg-amber-600 shadow-xs' : 'bg-emerald-600 shadow-xs'
                        }`}>
                            {mName}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-white m-0 tracking-tight">{mName} - Deteksi Anomali</h4>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                    isAnomaly ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                                    isWarning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}>
                                    {isAnomaly ? 'Anomali' : isWarning ? 'Perhatian' : 'Normal'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
                        <span>Target: <strong className="text-white">{target_shift_minutes}m</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">Cover: <strong className="text-emerald-300">{total_recorded_minutes}m</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className={unaccounted_minutes > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-300'}>
                            Selisih: <strong className={unaccounted_minutes > 0 ? 'text-rose-300' : 'text-white'}>{unaccounted_minutes}m</strong>
                        </span>
                    </div>
                </div>

                <div className="p-5 space-y-4 web-card-body">
                    {/* Status Alert Callout */}
                    {isAnomaly ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 web-anomaly-alert">
                            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-xs font-black text-rose-900 m-0 uppercase">
                                    🛑 ANOMALI {mName}: SELISIH {unaccounted_minutes} MENIT (LOSS TIME)
                                </h5>
                                <p className="text-xs text-rose-800 font-medium leading-relaxed mt-0.5 mb-0">
                                    Total input dimsum ({total_active_dimsum_mins}m) + downtime ({downtime_minutes}m) = <strong>{total_recorded_minutes}m</strong> dari target <strong>{target_shift_minutes}m</strong>.
                                </p>
                            </div>
                        </div>
                    ) : isWarning ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 web-anomaly-alert">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-xs font-black text-amber-900 m-0 uppercase">
                                    ⚠️ PERHATIAN {mName}: SELISIH {unaccounted_minutes} MENIT
                                </h5>
                                <p className="text-xs text-amber-800 font-medium leading-relaxed mt-0.5 mb-0">
                                    Terdapat gap {unaccounted_minutes} menit jam kerja belum ter-log pada {mName}.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 px-4 flex items-center gap-2.5 text-emerald-900 web-anomaly-alert">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs font-bold m-0">
                                ✅ Jam kerja {mName} ter-cover 100% tanpa anomali (Total {total_recorded_minutes}m).
                            </p>
                        </div>
                    )}

                    {/* PRIMEREACT DATATABLE SPREADSHEET LOGSHEET TEMPLATE WITH SORTING & PRINT */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                                    📊 Matriks Logsheet PrimeReact DataTable ({mName})
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium italic hidden sm:inline">
                                    • ColumnGroup & Interaktif Sorting
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handlePrintMachine(mName)}
                                className="h-8 px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer border-0 shrink-0 no-print-anomaly"
                                title={`Cetak Form Matriks ${mName}`}
                            >
                                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Cetak Form {mName}</span>
                            </button>
                        </div>

                        <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs bg-white p-1 web-datatable-container">
                            <DataTable
                                value={tableValue}
                                headerColumnGroup={headerGroup}
                                responsiveLayout="scroll"
                                stripedRows
                                showGridlines
                                className="p-datatable-sm text-xs font-sans border-0"
                            >
                                <Column field="index" body={indexBodyTemplate} style={{ width: '3.5rem', textAlign: 'center', backgroundColor: '#f8fafc' }} />
                                <Column field="siomay" body={siomayBodyTemplate} style={{ textAlign: 'center', backgroundColor: 'rgba(224, 242, 254, 0.2)' }} />
                                <Column field="pentol" body={pentolBodyTemplate} style={{ textAlign: 'center', backgroundColor: 'rgba(255, 228, 230, 0.2)' }} />
                                <Column field="lumpia" body={lumpiaBodyTemplate} style={{ textAlign: 'center', backgroundColor: 'rgba(236, 254, 255, 0.2)' }} />
                                <Column field="adonan" body={adonanBodyTemplate} style={{ textAlign: 'center', backgroundColor: 'rgba(253, 244, 255, 0.2)' }} />
                                <Column field="downtime" body={downtimeBodyTemplate} style={{ backgroundColor: 'rgba(254, 242, 242, 0.4)' }} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const targetPrintMachine = printingMachine || selectedTab;

    return (
        <>
            {/* Render Dedicated Print Portal directly into document.body */}
            {typeof document !== 'undefined' && createPortal(
                <div id="anomaly-print-portal">
                    {/* Official Document Header (Only visible when printing) */}
                    <div className="print-document-header border-b-2 border-slate-900 pb-3 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Logo PPA di kiri */}
                                <img src="/images/ppa.jpg" alt="PPA Logo" className="h-10 w-auto object-contain rounded-sm" />
                                {/* Disusul Logo Gacoan */}
                                <img src="/images/LogoMieGacoan.png" alt="Mie Gacoan Logo" className="h-10 w-auto object-contain" />
                            </div>
                            <div className="text-right leading-tight">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight m-0">PT. PESTA PORA ABADI</h2>
                                <h3 className="text-xs font-bold text-slate-700 m-0">PPA DIGITALIZATION — PRODUCTION SYSTEMS</h3>
                                <p className="text-[10px] font-semibold text-slate-500 m-0 mt-0.5">Form Laporan Deteksi Anomali & Matriks Logsheet IQF</p>
                            </div>
                        </div>
                    </div>

                    {/* Machine Cards for Print */}
                    <div className="space-y-6">
                        {(targetPrintMachine === 'ALL' || targetPrintMachine === 'IQF 1') && renderMachineCard('IQF 1', iqf1Data || anomalyData)}
                        {(targetPrintMachine === 'ALL' || targetPrintMachine === 'IQF 2') && renderMachineCard('IQF 2', iqf2Data || anomalyData)}
                    </div>
                </div>,
                document.body
            )}

            <div id="deteksi-anomali-section" className="space-y-4 select-none">
                {/* Stylesheet Print CSS untuk cetak A4 / PDF Admin Profesional */}
                <style>{`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 8mm;
                        }

                        /* Sembunyikan SEMUA elemen di body KECUALI #anomaly-print-portal */
                        body > *:not(#anomaly-print-portal) {
                            display: none !important;
                        }

                        #anomaly-print-portal {
                            display: block !important;
                            position: static !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                        }

                        .no-print-anomaly {
                            display: none !important;
                        }

                        /* Header Dokumen Resmi Cetak */
                        .print-document-header {
                            display: block !important;
                            margin-bottom: 12px !important;
                        }
                        .print-machine-header {
                            display: block !important;
                        }

                        /* Sembunyikan elemen web card UI saat cetak */
                        .web-machine-top-header { display: none !important; }
                        .web-card-body { padding: 0 !important; }

                        /* Hilangkan Kontainer Box & Rounded Border saat Cetak */
                        .print-machine-block {
                            page-break-inside: auto !important;
                            break-inside: auto !important;
                            margin-bottom: 25px !important;
                            border: none !important;
                            border-radius: 0 !important;
                            box-shadow: none !important;
                            background: transparent !important;
                            padding: 0 !important;
                        }
                        .web-datatable-container {
                            border: none !important;
                            border-radius: 0 !important;
                            box-shadow: none !important;
                            padding: 0 !important;
                            background: transparent !important;
                        }
                        .web-anomaly-alert {
                            border-radius: 0 !important;
                            border: 1px solid #cbd5e1 !important;
                            box-shadow: none !important;
                            margin-bottom: 12px !important;
                            page-break-inside: avoid !important;
                        }

                        /* Tabel Grid Rapi Profesional dengan Solid Border */
                        .p-datatable {
                            width: 100% !important;
                            border: 1px solid #0f172a !important;
                            border-radius: 0 !important;
                        }
                        .p-datatable table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        .p-datatable .p-datatable-thead {
                            display: table-header-group !important;
                        }
                        .p-datatable .p-datatable-thead > tr > th {
                            border: 1px solid #0f172a !important;
                            border-radius: 0 !important;
                            padding: 5px 6px !important;
                            font-size: 10px !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .p-datatable .p-datatable-tbody > tr {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        .p-datatable .p-datatable-tbody > tr > td {
                            border: 1px solid #334155 !important;
                            border-radius: 0 !important;
                            padding: 4px 6px !important;
                            font-size: 10px !important;
                            color: #0f172a !important;
                        }
                        .p-datatable-wrapper {
                            overflow: visible !important;
                            border-radius: 0 !important;
                        }
                        .print-meta-table {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }

                    @media screen {
                        #anomaly-print-portal {
                            display: none !important;
                        }
                    }

                    .p-datatable .p-datatable-thead > tr > th {
                        padding: 0.6rem 0.75rem !important;
                        font-size: 0.75rem !important;
                    }
                    .p-datatable .p-datatable-tbody > tr > td {
                        padding: 0.5rem 0.75rem !important;
                        font-size: 0.75rem !important;
                    }
                    .p-column-header-content {
                        justify-content: center !important;
                    }
                `}</style>

                {/* Section Main Header Bar */}
                <div className="bg-white border border-slate-200/80 shadow-xs rounded-3xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 anomaly-main-header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 m-0 tracking-tight">{title}</h3>
                            <p className="text-xs font-semibold text-slate-400 m-0">
                                Analisis durasi input aktif produk, downtime kendala, dan loss time terpisah untuk IQF 1 & IQF 2
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 no-print-anomaly">
                        {/* Tab Switcher */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
                            {['ALL', 'IQF 1', 'IQF 2'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all border-0 ${
                                        selectedTab === tab
                                            ? 'bg-[#0284c7] text-white shadow-2xs font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {tab === 'ALL' ? 'Semua Mesin' : tab}
                                </button>
                            ))}
                        </div>

                        {/* Print Button */}
                        <button
                            type="button"
                            onClick={handlePrintAnomaly}
                            className="h-9 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer border-0 shrink-0"
                            title="Cetak Laporan Anomali"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Laporan</span>
                        </button>
                    </div>
                </div>

                {/* Grid Display for IQF 1 & IQF 2 */}
                <div className="space-y-6">
                    {(selectedTab === 'ALL' || selectedTab === 'IQF 1') && renderMachineCard('IQF 1', iqf1Data || anomalyData)}
                    {(selectedTab === 'ALL' || selectedTab === 'IQF 2') && renderMachineCard('IQF 2', iqf2Data || anomalyData)}
                </div>
            </div>
        </>
    );
}

