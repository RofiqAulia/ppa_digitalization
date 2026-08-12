import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, FileDown, Edit2, Save, Printer, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import * as XLSX from 'xlsx-js-style';

const HOURS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'
];

export default function DataTable({ logsheets }) {
    // 3 days ago to today as default filter
    const [filterDateFrom, setFilterDateFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d.toLocaleDateString('sv-SE');
    });
    const [filterDateTo, setFilterDateTo] = useState(() => new Date().toLocaleDateString('sv-SE'));
    const [filterShift, setFilterShift] = useState('ALL');
    const [filterMachine, setFilterMachine] = useState('ALL');
    const [filterProduct, setFilterProduct] = useState('ALL');

    const [editData, setEditData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    // Inject simple print CSS
    useMemo(() => {
        if (typeof document !== 'undefined' && !document.getElementById('iqf-print-style')) {
            const el = document.createElement('style');
            el.id = 'iqf-print-style';
            el.textContent = `
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
              body > * { display: none !important; }
              .print-container, .print-container * { display: block !important; }
              .no-print { display: none !important; }
              #iqf-spt { display: table !important; width: 100%; border-collapse: collapse; font-size: 8px; margin-top: 20px;}
              #iqf-spt th, #iqf-spt td { border: 1px solid #000; padding: 3px; text-align: center; }
              #iqf-spt th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              #iqf-spt .sticky { position: static !important; }
            }
            `;
            document.head.appendChild(el);
        }
    }, []);

    // Helper for Unplanned Stop
    const timeToMinutes = t => {
        if (!t) return null;
        const [h, m] = t.split(':');
        return parseInt(h) * 60 + parseInt(m);
    };

    const calcDurationMinutes = (start, end) => {
        if (start === null || end === null) return null;
        let diff = end - start;
        if (diff < 0) diff += 1440; // cross midnight
        return diff;
    };

    const parseUnplannedStop = (ls, logsheets) => {
        const stopText = ls.unplanned_stop;
        if (!stopText || stopText === '-') return '-';
        const stops = stopText.split(',').map(s => s.trim()).filter(Boolean);

        const machineLogsheets = (logsheets || [])
            .filter(l => l.machine === ls.machine)
            .sort((a, b) => {
                if (a.date !== b.date) return a.date < b.date ? -1 : 1;
                return a.shift - b.shift;
            });

        const idx = machineLogsheets.findIndex(l => l.id === ls.id);
        let relevantDetails = [];
        if (idx !== -1) {
            for (let i = idx; i < machineLogsheets.length; i++) {
                relevantDetails.push(...(machineLogsheets[i].details || []));
            }
        }

        const sortedDetails = relevantDetails
            .filter(d => d.created_at && d.time)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return stops.map(st => {
            const timeMatch = st.match(/^(\d{1,2}):(\d{2})/);
            if (!timeMatch) return st;

            const stopMin = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
            const nextDetail = sortedDetails.find(d => {
                const dmTime = timeToMinutes(d.time);
                if (dmTime === null) return false;
                const diff = calcDurationMinutes(stopMin, dmTime);
                return diff > 0 && diff < 720;
            });

            if (nextDetail) {
                const duration = calcDurationMinutes(stopMin, timeToMinutes(nextDetail.time));
                return `${st} (⏱ ${duration} mnt)`;
            } else {
                return `${st} (🔴 Blm Selesai)`;
            }
        }).join(', ');
    };

    const filteredLogsheets = useMemo(() => {
        return (logsheets || []).filter(ls => {
            if (filterDateFrom && ls.date < filterDateFrom) return false;
            if (filterDateTo && ls.date > filterDateTo) return false;
            if (filterShift !== 'ALL' && String(ls.shift) !== String(filterShift)) return false;
            if (filterMachine !== 'ALL' && ls.machine !== filterMachine) return false;
            if (filterProduct !== 'ALL' && !ls.product_type.includes(filterProduct)) return false;
            return true;
        }).map(ls => {
            const hourly = {};
            HOURS.forEach(h => hourly[h] = ''); // default
            let achieve = 0;
            
            // Sort by time so we process chronologically
            const sortedDetails = [...(ls.details || [])].sort((a,b) => a.time.localeCompare(b.time));
            sortedDetails.forEach(d => {
                const hourPrefix = d.time.substring(0,2) + ':00';
                if (hourly.hasOwnProperty(hourPrefix)) {
                    hourly[hourPrefix] = d.tray_count;
                }
                achieve += Number(d.tray_count) || 0;
            });
            
            
            const parsedStop = parseUnplannedStop(ls, logsheets);

            return {
                ...ls,
                hourly,
                achieve,
                parsedStop
            };
        });
    }, [logsheets, filterDateFrom, filterDateTo, filterShift, filterMachine, filterProduct]);

    const paginatedLogsheets = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredLogsheets.slice(start, start + rowsPerPage);
    }, [filteredLogsheets, currentPage]);

    const totalPages = Math.ceil(filteredLogsheets.length / rowsPerPage);

    const handleEditClick = (ls) => {
        setEditData({
            id: ls.id,
            spv: ls.spv || '',
            batch_number: ls.batch_number || '',
            refrezing: ls.refrezing || '',
            hourly: { ...ls.hourly }
        });
    };

    const handleSave = () => {
        if (!editData) return;
        setIsSaving(true);
        router.put(route('iqf-logsheet.updateRow', editData.id), editData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setEditData(null);
            },
            onError: () => {
                setIsSaving(false);
                alert("Gagal menyimpan data!");
            }
        });
    };

    const handleHourlyChange = (hour, value) => {
        setEditData(prev => ({
            ...prev,
            hourly: {
                ...prev.hourly,
                [hour]: value
            }
        }));
    };

    const exportToExcel = () => {
        if (filteredLogsheets.length === 0) {
            alert("Tidak ada data untuk di export.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const wsData = [
            ['SPV', 'TGL', 'JENIS DIMSUM', 'SHIFT', 'BATCH', ...HOURS, 'Achieve', 'REFREZING', 'KENDALA (DURASI)']
        ];

        filteredLogsheets.forEach(ls => {
            const row = [
                ls.spv || '',
                ls.date,
                String(ls.product_type).toUpperCase(),
                ls.shift,
                ls.batch_number || '',
                ...HOURS.map(h => ls.hourly[h] || ''),
                ls.achieve,
                ls.refrezing || '',
                ls.parsedStop || '-'
            ];
            wsData.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Add minimal styling
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
            const addr = XLSX.utils.encode_cell({r: 0, c: c});
            if (ws[addr]) {
                ws[addr].s = {
                    fill: { fgColor: { rgb: "E0E0E0" } },
                    font: { bold: true },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} }
                };
            }
        }
        
        XLSX.utils.book_append_sheet(wb, ws, "Logsheet");
        XLSX.writeFile(wb, `Logsheet_IQF_${filterDateFrom}_${filterDateTo}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col gap-4 print-container">
            {/* Toolbar */}
            <div className="no-print bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                        Dari Tanggal
                        <input type="date" className="h-9 border border-slate-200 rounded-md px-2 focus:ring-2 focus:ring-indigo-300" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1); }} />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                        Sampai
                        <input type="date" className="h-9 border border-slate-200 rounded-md px-2 focus:ring-2 focus:ring-indigo-300" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1); }} />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                        Shift
                        <select className="h-9 border border-slate-200 rounded-md px-2 focus:ring-2 focus:ring-indigo-300 outline-none" value={filterShift} onChange={e => { setFilterShift(e.target.value); setCurrentPage(1); }}>
                            <option value="ALL">Semua Shift</option>
                            <option value="1">Shift 1</option>
                            <option value="2">Shift 2</option>
                            <option value="3">Shift 3</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                        Mesin IQF
                        <select className="h-9 border border-slate-200 rounded-md px-2 focus:ring-2 focus:ring-indigo-300 outline-none" value={filterMachine} onChange={e => { setFilterMachine(e.target.value); setCurrentPage(1); }}>
                            <option value="ALL">Semua Mesin</option>
                            <option value="IQF 1">IQF 1</option>
                            <option value="IQF 2">IQF 2</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                        Jenis Dimsum
                        <select className="h-9 border border-slate-200 rounded-md px-2 focus:ring-2 focus:ring-indigo-300 outline-none" value={filterProduct} onChange={e => { setFilterProduct(e.target.value); setCurrentPage(1); }}>
                            <option value="ALL">Semua Jenis</option>
                            <option value="siomay">Siomay</option>
                            <option value="pentol">Pentol</option>
                            <option value="lumpia">Lumpia</option>
                            <option value="adonan_pangsit">Adonan Pangsit</option>
                        </select>
                    </label>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={exportToExcel}>
                        <FileDown className="w-4 h-4 mr-2" /> Export Excel
                    </Button>
                    <Button variant="outline" className="h-9 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto w-full">
                <table className="w-full text-[10px] text-left border-collapse min-w-[1500px]" id="iqf-spt">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border-r border-slate-300 text-center sticky left-0 bg-slate-200 shadow-[1px_0_0_0_#cbd5e1] z-20 w-16">SPV</th>
                            <th className="p-2 border-r border-slate-300 text-center whitespace-nowrap w-24">TGL</th>
                            <th className="p-2 border-r border-slate-300 text-center w-32">JENIS DIMSUM</th>
                            <th className="p-2 border-r border-slate-300 text-center w-12">SH</th>
                            <th className="p-2 border-r border-slate-300 text-center w-16">BATCH</th>
                            <th className="p-2 border-r border-slate-300 text-center w-12">AKSI</th>
                            {HOURS.map(h => (
                                <th key={h} className="p-1 border-r border-slate-300 text-center whitespace-nowrap w-10 text-[9px]">{h}</th>
                            ))}
                            <th className="p-2 border-r border-slate-300 text-center bg-indigo-100 w-16">Achieve</th>
                            <th className="p-2 border-r border-slate-300 text-center w-24">REFREZING</th>
                            <th className="p-2 text-center w-40">KENDALA (DURASI)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paginatedLogsheets.length > 0 ? paginatedLogsheets.map(ls => (
                            <tr key={ls.id} className="hover:bg-slate-50 transition-colors bg-white">
                                <td className="p-2 border-r border-slate-200 text-center sticky left-0 bg-white shadow-[1px_0_0_0_#e2e8f0] font-bold text-slate-700">{ls.spv || '-'}</td>
                                <td className="p-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600 font-medium">{ls.date}</td>
                                <td className="p-2 border-r border-slate-200 font-black text-slate-700 text-center">{String(ls.product_type).toUpperCase()}</td>
                                <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-800 bg-slate-50">{ls.shift}</td>
                                <td className="p-2 border-r border-slate-200 text-center font-semibold text-slate-700">{ls.batch_number || '-'}</td>
                                <td className="p-1 border-r border-slate-200 text-center no-print">
                                    <button onClick={() => handleEditClick(ls)} className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                                {HOURS.map(h => (
                                    <td key={h} className="p-1 border-r border-slate-200 text-center text-slate-800 font-medium">{ls.hourly[h] || ''}</td>
                                ))}
                                <td className="p-2 border-r border-slate-200 text-center font-black bg-indigo-50/50 text-indigo-700 text-[11px]">{ls.achieve}</td>
                                <td className="p-2 border-r border-slate-200 text-center text-slate-700 font-medium">{ls.refrezing || '-'}</td>
                                <td className="p-2 text-center text-red-600 font-medium">{ls.parsedStop !== '-' ? ls.parsedStop : '-'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={10 + HOURS.length} className="p-12 text-center text-slate-500 font-medium">
                                    Belum ada data untuk filter tersebut.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="no-print flex items-center justify-between px-2 text-sm text-slate-500 font-medium">
                    <div>
                        Menampilkan {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, filteredLogsheets.length)} dari {filteredLogsheets.length} data
                    </div>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="flex items-center px-4 font-bold text-slate-700 bg-white border border-slate-200 rounded-md">
                            {currentPage} / {totalPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 no-print">
                    <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-indigo-600" />
                            Edit Data Logsheet & Input Jam
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        {editData && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supervisor (SPV)</Label>
                                        <Input 
                                            value={editData.spv} 
                                            onChange={e => setEditData(prev => ({...prev, spv: e.target.value}))} 
                                            placeholder="Nama SPV"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. Batch</Label>
                                        <Input 
                                            type="number"
                                            value={editData.batch_number} 
                                            onChange={e => setEditData(prev => ({...prev, batch_number: e.target.value}))} 
                                            placeholder="No Batch"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Refrezing</Label>
                                        <Input 
                                            value={editData.refrezing} 
                                            onChange={e => setEditData(prev => ({...prev, refrezing: e.target.value}))} 
                                            placeholder="Refrezing Info"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-indigo-500" /> 
                                        Input Tray Count Per Jam
                                    </Label>
                                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {HOURS.map(h => (
                                            <div key={h} className="flex flex-col gap-1.5 bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-400">
                                                <Label className="text-[10px] text-slate-500 font-bold text-center">{h}</Label>
                                                <input 
                                                    type="number"
                                                    className="w-full text-center text-sm font-bold text-slate-800 outline-none placeholder-slate-300"
                                                    value={editData.hourly[h] || ''}
                                                    onChange={e => handleHourlyChange(h, e.target.value)}
                                                    placeholder="-"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 italic text-center">*Kosongkan jika tidak ada input pada jam tersebut.</p>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 sm:justify-between shrink-0">
                        <Button variant="outline" onClick={() => setEditData(null)}>Batal</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                            {isSaving ? 'Menyimpan...' : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
