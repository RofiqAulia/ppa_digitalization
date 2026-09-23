import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function TableOnly({ logsheets }) {
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState('10');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40 inline-block" />;
        }
        return sortDirection === 'asc' 
            ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-cyan-600 inline-block font-bold" />
            : <ArrowDown className="w-3.5 h-3.5 ml-1 text-cyan-600 inline-block font-bold" />;
    };

    // Client-side filtering and sorting without modifying underlying logic
    const filtered = useMemo(() => {
        if (!logsheets) return [];

        let list = logsheets.filter(s => 
            (s.date && s.date.includes(search)) || 
            (s.machine && s.machine.toLowerCase().includes(search.toLowerCase())) || 
            (s.product_type && s.product_type.toLowerCase().includes(search.toLowerCase())) ||
            (s.status && s.status.toLowerCase().includes(search.toLowerCase()))
        );

        list.sort((a, b) => {
            let valA = a[sortField] ?? '';
            let valB = b[sortField] ?? '';

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return list.slice(0, parseInt(rows));
    }, [logsheets, search, rows, sortField, sortDirection]);

    return (
        <div className="p-6 bg-white min-h-screen">
            <Head title="Data Tabel Logsheet" />
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Data Tabel Logsheet</h1>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Semua riwayat data logsheet produksi</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Show:</span>
                        <Select value={rows} onValueChange={setRows}>
                            <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Input 
                        placeholder="Search..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-48 h-8"
                    />
                    
                    <Button size="sm" variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-100">
                        <TableRow>
                            <TableHead className="w-12 text-center font-bold">No</TableHead>
                            <TableHead 
                                className="cursor-pointer select-none font-bold hover:bg-slate-200 transition-colors"
                                onClick={() => handleSort('date')}
                            >
                                Tanggal {getSortIcon('date')}
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer select-none font-bold hover:bg-slate-200 transition-colors"
                                onClick={() => handleSort('shift')}
                            >
                                Shift {getSortIcon('shift')}
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer select-none font-bold hover:bg-slate-200 transition-colors"
                                onClick={() => handleSort('product_type')}
                            >
                                Produk {getSortIcon('product_type')}
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer select-none font-bold hover:bg-slate-200 transition-colors"
                                onClick={() => handleSort('machine')}
                            >
                                Mesin {getSortIcon('machine')}
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer select-none font-bold hover:bg-slate-200 transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                Status {getSortIcon('status')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length > 0 ? filtered.map((row, i) => (
                            <TableRow key={row.id} className="hover:bg-slate-50">
                                <TableCell className="text-center font-mono text-xs text-slate-400">{i + 1}</TableCell>
                                <TableCell className="font-medium">{row.date}</TableCell>
                                <TableCell>Shift {row.shift}</TableCell>
                                <TableCell className="capitalize">{row.product_type.replace('_', ' ')}</TableCell>
                                <TableCell>{row.machine}</TableCell>
                                <TableCell>
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                        {row.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Tidak ada data ditemukan.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
