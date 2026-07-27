import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MatrixTable({ logsheets }) {
    const [search, setSearch] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState('10');
    const [currentPage, setCurrentPage] = useState(1);

    // Grouping logic (port from legacy blade)
    const rowsData = useMemo(() => {
        if (!logsheets || logsheets.length === 0) return [];
        
        const grouped = {};
        logsheets.forEach(ls => {
            if (!grouped[ls.date]) grouped[ls.date] = {};
            if (!grouped[ls.date][ls.shift]) grouped[ls.date][ls.shift] = {};
            if (!grouped[ls.date][ls.shift][ls.machine]) grouped[ls.date][ls.shift][ls.machine] = [];
            grouped[ls.date][ls.shift][ls.machine].push(ls);
        });

        const data = [];
        Object.keys(grouped).forEach(date => {
            Object.keys(grouped[date]).forEach(shift => {
                Object.keys(grouped[date][shift]).forEach(machine => {
                    const machineLogsheets = grouped[date][shift][machine];
                    
                    const siomay = machineLogsheets.find(ls => ls.product_type === 'siomay');
                    const pentol = machineLogsheets.find(ls => ls.product_type === 'pentol');
                    const lumpia = machineLogsheets.find(ls => ls.product_type === 'lumpia');
                    const adonan = machineLogsheets.find(ls => ls.product_type === 'adonan_pangsit');
                    
                    const unplannedStopsArray = machineLogsheets.map(ls => ls.unplanned_stop).filter(s => s && s.trim());
                    const unplannedStops = [...new Set(unplannedStopsArray)].join(', ');

                    let maxRak = 1;
                    [siomay, pentol, lumpia, adonan].forEach(ls => {
                        if (ls && ls.details) {
                            ls.details.forEach(d => {
                                if (d.rak > maxRak) maxRak = d.rak;
                            });
                        }
                    });

                    for (let rak = 1; rak <= maxRak; rak++) {
                        const s_detail = siomay?.details?.find(d => (d.rak || 1) == rak);
                        const p_detail = pentol?.details?.find(d => (d.rak || 1) == rak);
                        const l_detail = lumpia?.details?.find(d => (d.rak || 1) == rak);
                        const a_detail = adonan?.details?.find(d => (d.rak || 1) == rak);

                        data.push({
                            id: `${date}-${shift}-${machine}-${rak}`, // unique key
                            date,
                            shift,
                            machine,
                            unplannedStops,
                            rak,
                            siomay: { ls: siomay, detail: s_detail },
                            pentol: { ls: pentol, detail: p_detail },
                            lumpia: { ls: lumpia, detail: l_detail },
                            adonan: { ls: adonan, detail: a_detail },
                        });
                    }
                });
            });
        });
        
        return data;
    }, [logsheets]);

    // Filtering
    const filteredData = useMemo(() => {
        if (!search) return rowsData;
        const query = search.toLowerCase();
        return rowsData.filter(row => {
            return (
                row.date.includes(query) ||
                row.machine.toLowerCase().includes(query) ||
                row.unplannedStops.toLowerCase().includes(query) ||
                row.siomay.ls?.batch_number?.toString().toLowerCase().includes(query) ||
                row.pentol.ls?.batch_number?.toString().toLowerCase().includes(query) ||
                row.lumpia.ls?.batch_number?.toString().toLowerCase().includes(query) ||
                row.adonan.ls?.batch_number?.toString().toLowerCase().includes(query)
            );
        });
    }, [rowsData, search]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / parseInt(rowsPerPage)) || 1;
    const paginatedData = filteredData.slice(
        (currentPage - 1) * parseInt(rowsPerPage),
        currentPage * parseInt(rowsPerPage)
    );

    // Sum calculation for visible data (matching Blade logic)
    const totals = { siomay: 0, pentol: 0, lumpia: 0, adonan: 0 };
    filteredData.forEach(row => {
        totals.siomay += row.siomay.detail?.tray_count || 0;
        totals.pentol += row.pentol.detail?.tray_count || 0;
        totals.lumpia += row.lumpia.detail?.tray_count || 0;
        totals.adonan += row.adonan.detail?.tray_count || 0;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5); // get HH:mm
    };

    const exportToExcel = () => {
        alert("Export functionality not implemented in demo.");
    };

    if (!logsheets || logsheets.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-auto max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-700">Belum Ada Data Logsheet</h3>
                <p className="text-xs text-slate-500 mt-1">Silakan lakukan pengisian melalui Terminal Operator Kiosk.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span>Show:</span>
                    <Select value={rowsPerPage} onValueChange={v => { setRowsPerPage(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 rows</SelectItem>
                            <SelectItem value="50">50 rows</SelectItem>
                            <SelectItem value="100">100 rows</SelectItem>
                            <SelectItem value="1000">1000 rows</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            type="text"
                            placeholder="Cari data..." 
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-8 w-44 sm:w-60"
                        />
                    </div>
                    <Button onClick={exportToExcel} variant="outline" className="bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Matrix Table container with custom scrollbar */}
            <div className="flex-1 overflow-auto rounded-md border border-slate-200">
                <table className="w-max min-w-full text-center border-collapse whitespace-nowrap text-xs select-none">
                    <thead className="sticky top-0 z-30 bg-slate-100 border-b border-slate-200 text-[11px] font-semibold">
                        {/* Group Headers */}
                        <tr>
                            <th rowSpan="2" className="px-3 py-3 border-b border-r border-slate-200 text-slate-500 font-bold bg-slate-100">#</th>
                            <th rowSpan="2" className="px-4 py-3 border-b border-r border-slate-200 text-slate-700 font-bold bg-slate-100">PIC</th>
                            <th rowSpan="2" className="px-4 py-3 border-b border-r border-slate-200 text-slate-700 font-bold bg-slate-100">Tanggal</th>
                            <th rowSpan="2" className="px-4 py-3 border-b border-r border-slate-200 text-slate-700 font-bold bg-slate-100">Shift</th>
                            <th rowSpan="2" className="px-4 py-3 border-b border-r border-slate-200 text-slate-700 font-bold bg-slate-100">IQF</th>
                            
                            <th colSpan="6" className="px-3 py-2 border-b border-r border-slate-200 font-black tracking-wide uppercase bg-sky-100 text-sky-800">SIOMAY</th>
                            <th colSpan="6" className="px-3 py-2 border-b border-r border-slate-200 font-black tracking-wide uppercase bg-rose-100 text-rose-800">PENTOL</th>
                            <th colSpan="6" className="px-3 py-2 border-b border-r border-slate-200 font-black tracking-wide uppercase bg-cyan-100 text-cyan-800">LUMPIA</th>
                            <th colSpan="6" className="px-3 py-2 border-b border-r border-slate-200 font-black tracking-wide uppercase bg-fuchsia-100 text-fuchsia-800">ADONAN PANGSIT</th>
                            
                            <th rowSpan="2" className="px-4 py-3 border-b border-slate-200 font-bold min-w-[200px] bg-red-50 text-red-600 uppercase">UNPLANNED STOP</th>
                        </tr>
                        {/* Sub Headers */}
                        <tr className="text-[10px] font-semibold border-b border-slate-200 bg-slate-50">
                            {/* Siomay */}
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rak</th>
                            <th className="px-2 py-2 border-b border-r border-slate-200 text-sky-700 font-bold w-[80px]">Loyang</th>
                            
                            {/* Pentol */}
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rak</th>
                            <th className="px-2 py-2 border-b border-r border-slate-200 text-rose-700 font-bold w-[80px]">Loyang</th>
                            
                            {/* Lumpia */}
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rongga</th>
                            <th className="px-2 py-2 border-b border-r border-slate-200 text-cyan-700 font-bold w-[85px]">Pack</th>
                            
                            {/* Adonan */}
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">No Batch</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Panel</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[75px]">Suhu Produk</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[60px]">Mulai</th>
                            <th className="px-2 py-2 border-b border-slate-200 text-slate-500 w-[50px]">Rongga</th>
                            <th className="px-2 py-2 border-b border-r border-slate-200 text-fuchsia-700 font-bold w-[85px]">Pack</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {paginatedData.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors duration-150">
                                <td className="px-3 py-3 font-mono text-[10px] text-center text-slate-400 border-r border-slate-100">
                                    {(currentPage - 1) * parseInt(rowsPerPage) + idx + 1}
                                </td>
                                
                                <td className="px-4 py-3 text-slate-500 border-r border-slate-100">--</td>
                                <td className="px-4 py-3 font-mono font-medium text-slate-700 border-r border-slate-100">{formatDate(row.date)}</td>
                                <td className="px-4 py-3 border-r border-slate-100">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">Shift {row.shift}</span>
                                </td>
                                <td className="px-4 py-3 border-r border-slate-200">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black bg-pink-50 text-pink-700 border border-pink-200/60">{row.machine}</span>
                                </td>
                                
                                {/* Siomay */}
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.siomay.detail ? (row.siomay.ls?.batch_number || '') : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.siomay.detail?.suhu_panel || ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.siomay.detail?.suhu_produk || ''}</td>
                                <td className="px-2 py-3 font-mono text-slate-600 border-r border-slate-100/50">{formatTime(row.siomay.detail?.time)}</td>
                                <td className="px-2 py-3 font-bold text-slate-800 border-r border-slate-100/50">{row.siomay.detail ? row.rak : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-200">
                                    {row.siomay.detail && <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200/60">{row.siomay.detail.tray_count} L</span>}
                                </td>
                                
                                {/* Pentol */}
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.pentol.detail ? (row.pentol.ls?.batch_number || '') : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.pentol.detail?.suhu_panel || ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.pentol.detail?.suhu_produk || ''}</td>
                                <td className="px-2 py-3 font-mono text-slate-600 border-r border-slate-100/50">{formatTime(row.pentol.detail?.time)}</td>
                                <td className="px-2 py-3 font-bold text-slate-800 border-r border-slate-100/50">{row.pentol.detail ? row.rak : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-200">
                                    {row.pentol.detail && <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200/60">{row.pentol.detail.tray_count} L</span>}
                                </td>
                                
                                {/* Lumpia */}
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.lumpia.detail ? (row.lumpia.ls?.batch_number || '') : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.lumpia.detail?.suhu_panel || ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.lumpia.detail?.suhu_produk || ''}</td>
                                <td className="px-2 py-3 font-mono text-slate-600 border-r border-slate-100/50">{formatTime(row.lumpia.detail?.time)}</td>
                                <td className="px-2 py-3 font-bold text-slate-800 border-r border-slate-100/50">{row.lumpia.detail ? row.rak : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-200">
                                    {row.lumpia.detail && <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200/60">{row.lumpia.detail.tray_count} P</span>}
                                </td>
                                
                                {/* Adonan */}
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.adonan.detail ? (row.adonan.ls?.batch_number || '') : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.adonan.detail?.suhu_panel || ''}</td>
                                <td className="px-2 py-3 border-r border-slate-100/50">{row.adonan.detail?.suhu_produk || ''}</td>
                                <td className="px-2 py-3 font-mono text-slate-600 border-r border-slate-100/50">{formatTime(row.adonan.detail?.time)}</td>
                                <td className="px-2 py-3 font-bold text-slate-800 border-r border-slate-100/50">{row.adonan.detail ? row.rak : ''}</td>
                                <td className="px-2 py-3 border-r border-slate-200">
                                    {row.adonan.detail && <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60">{row.adonan.detail.tray_count} P</span>}
                                </td>
                                
                                {/* Unplanned Stop */}
                                <td className="px-4 py-3 text-red-600 font-semibold text-xs whitespace-normal max-w-[200px]">
                                    {row.unplannedStops ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">{row.unplannedStops}</span>
                                    ) : <span className="text-slate-300">-</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="sticky bottom-0 z-30 font-black bg-slate-50 text-slate-800 border-t-2 border-slate-300 shadow-xs text-xs">
                        <tr>
                            <td colSpan="5" className="px-4 py-3 text-right bg-slate-100 text-slate-400 border-r border-slate-200">Total Keseluruhan (Tampil)</td>
                            
                            <td colSpan="4" className="bg-sky-50/50 border-t border-slate-200"></td>
                            <td className="px-2 py-3 bg-sky-50 text-sky-800 text-right">Total</td>
                            <td className="px-2 py-3 bg-sky-100 text-sky-900 font-mono border-r border-slate-200">{totals.siomay}</td>
                            
                            <td colSpan="4" className="bg-rose-50/50 border-t border-slate-200"></td>
                            <td className="px-2 py-3 bg-rose-50 text-rose-800 text-right">Total</td>
                            <td className="px-2 py-3 bg-rose-100 text-rose-900 font-mono border-r border-slate-200">{totals.pentol}</td>
                            
                            <td colSpan="4" className="bg-cyan-50/50 border-t border-slate-200"></td>
                            <td className="px-2 py-3 bg-cyan-50 text-cyan-800 text-right">Total</td>
                            <td className="px-2 py-3 bg-cyan-100 text-cyan-900 font-mono border-r border-slate-200">{totals.lumpia}</td>
                            
                            <td colSpan="4" className="bg-fuchsia-50/50 border-t border-slate-200"></td>
                            <td className="px-2 py-3 bg-fuchsia-50 text-fuchsia-800 text-right">Total</td>
                            <td className="px-2 py-3 bg-fuchsia-100 text-fuchsia-900 font-mono border-r border-slate-200">{totals.adonan}</td>
                            
                            <td className="bg-red-50/20"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 shrink-0">
                <div className="text-sm text-slate-500 font-medium">
                    Menampilkan {(currentPage - 1) * parseInt(rowsPerPage) + (filteredData.length > 0 ? 1 : 0)} hingga {Math.min(currentPage * parseInt(rowsPerPage), filteredData.length)} dari {filteredData.length} data
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 border-slate-200"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium text-slate-700 min-w-[100px] text-center">
                        Hal {currentPage} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="h-8 border-slate-200"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
