import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search, ChevronLeft, ChevronRight, FileDown, ArrowUpDown, ArrowUp, ArrowDown,
    Edit2, Save, Printer, Calendar, X, ChevronDown, ChevronUp, BarChart2, Layers, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import * as XLSX from 'xlsx-js-style';

/* ─────────────────────────────────────────────
   PRINT CSS — injected into <head> once
   Prints ONLY #iqf-single-print-target
───────────────────────────────────────────── */
const PRINT_STYLE = `
@media print {
  @page { size: A4 landscape; margin: 10mm 12mm; }

  /* Hide everything in body EXCEPT our print portal */
  body > *:not(#iqf-spt) { display: none !important; }
  #iqf-spt {
    display: block !important;
    position: static !important;  /* allow natural page flow — NOT fixed */
    width: 100%;
    background: white;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: 9px;
  }

  /* Kop surat */
  .spt-header {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #333;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
  .spt-info {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 2px 48px;
    font-size: 9px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 6px;
    margin-bottom: 10px;
  }
  .spt-lbl { font-weight: 700; display: inline-block; width: 52px; }

  /* Table — allow multi-page, repeat header each page */
  table {
    font-size: 8.5px;
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
  }
  table thead {
    display: table-header-group; /* repeat header on every page */
  }
  table tfoot {
    display: table-footer-group;
  }
  table tbody {
    page-break-inside: auto;
  }
  table th, table td { border: 1px solid #bbb; padding: 3px 5px; }
  table th {
    background: #1e3a5f !important; color: white !important;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  table tr {
    page-break-inside: avoid; /* don't split a single row across pages */
    page-break-after: auto;
  }

  .spt-th-green {
    background: #065f46 !important; color: white !important;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .spt-row-siomay td { background: #fff9e6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-row-pentol  td { background: #e8f4ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-row-lumpia  td { background: #edfff0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-row-adonan  td { background: #fdf0ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Kop surat header rows inside thead — repeat every page */
  .spt-thead-kop td {
    background: white !important;
    border: none !important;
    padding: 0 !important;
  }
  .spt-thead-info td {
    background: white !important;
    border-left: none !important;
    border-right: none !important;
    border-top: none !important;
    border-bottom: 1px solid #ccc !important;
    padding: 3px 0 4px 0 !important;
    font-size: 9px !important;
  }
  .spt-thead-printed td {
    background: white !important;
    border: none !important;
    padding: 2px 0 6px 0 !important;
    font-size: 8px !important;
    color: #666 !important;
    font-style: italic !important;
  }
}
`;


export default function DataTable({ logsheets }) {
    /* ── State ─────────────────────────────────── */
    const [search,          setSearch]         = useState('');
    const [groupsPerPage,   setGroupsPerPage]  = useState('10');
    const [currentPage,     setCurrentPage]    = useState(1);
    const [filterShift,     setFilterShift]    = useState('all');
    const [filterMachine,   setFilterMachine]  = useState('all');
    const [filterDateFrom,  setFilterDateFrom] = useState('');
    const [filterDateTo,    setFilterDateTo]   = useState('');
    const [sortConfig,      setSortConfig]     = useState({ key: 'time', direction: 'desc' });
    const [editData,        setEditData]       = useState(null);
    const [isSaving,        setIsSaving]       = useState(false);
    const [expandedGroups,  setExpandedGroups] = useState(new Set()); // collapsed by default — click to expand
    const [printGroupKey,   setPrintGroupKey]  = useState(null);       // key of group being printed
    const [printTime,       setPrintTime]      = useState('');         // timestamp captured at print click
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    /* ── Inject print CSS once ─────────────────── */
    useMemo(() => {
        if (typeof document !== 'undefined' && !document.getElementById('iqf-print-style')) {
            const el = document.createElement('style');
            el.id = 'iqf-print-style';
            el.textContent = PRINT_STYLE;
            document.head.appendChild(el);
        }
    }, []);

    /* ── Constants ─────────────────────────────── */
    const PRODUCT_ORDER  = ['siomay', 'pentol', 'lumpia', 'adonan_pangsit'];
    const PRODUCT_LABELS = { siomay: 'Siomay', pentol: 'Pentol', lumpia: 'Lumpia', adonan_pangsit: 'Adonan Pangsit' };
    const PRODUCT_BADGE  = {
        siomay:         { bg: 'bg-yellow-100',  text: 'text-yellow-800',  border: 'border-yellow-300'  },
        pentol:         { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300'    },
        lumpia:         { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300'   },
        adonan_pangsit: { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-300'  },
    };
    const PRODUCT_ROW_BG = {
        siomay:         'hover:bg-yellow-50/60',
        pentol:         'hover:bg-blue-50/60',
        lumpia:         'hover:bg-green-50/60',
        adonan_pangsit: 'hover:bg-purple-50/60',
    };
    const PRODUCT_PRINT_CLASS = {
        siomay:         'product-row-siomay',
        pentol:         'product-row-pentol',
        lumpia:         'product-row-lumpia',
        adonan_pangsit: 'product-row-adonan',
    };
    const EXCEL_COLORS = {
        siomay:         { bg: 'FFF2CC', font: '7D5A00' },
        pentol:         { bg: 'DDEEFF', font: '1A4F8A' },
        lumpia:         { bg: 'E2EFDA', font: '375623' },
        adonan_pangsit: { bg: 'EAD1DC', font: '7B2D4E' },
    };

    /* ── Flatten logsheets → flat rows ─────────── */
    const flatData = useMemo(() => {
        if (!logsheets || logsheets.length === 0) return [];
        const data = [];
        logsheets.forEach(ls => {
            if (ls.details && ls.details.length > 0) {
                const lastIdx = ls.details.length - 1;
                ls.details.forEach((d, idx) => {
                    data.push({
                        id:             d.id,
                        pic:            d.pic || '--',
                        date:           ls.date,
                        shift:          ls.shift,
                        machine:        ls.machine,
                        product_type:   ls.product_type,
                        batch_number:   ls.batch_number || '-',
                        suhu_panel:     d.suhu_panel || '-',
                        suhu_produk:    d.suhu_produk || '-',
                        time:           d.time || '-',
                        rak:            d.rak || 1,
                        tray_count:     d.tray_count || 0,
                        // Hanya baris terakhir per logsheet yang tampil unplanned_stop
                        unplanned_stop: idx === lastIdx ? (ls.unplanned_stop || '-') : '-',
                    });
                });
            }
        });
        return data;
    }, [logsheets]);


    /* ── Helpers ───────────────────────────────── */
    const sortData = (data, { key, direction }) =>
        [...data].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ?  1 : -1;
            return 0;
        });

    const sortByProductOrder = data =>
        [...data].sort((a, b) => {
            const ai = PRODUCT_ORDER.indexOf(a.product_type);
            const bi = PRODUCT_ORDER.indexOf(b.product_type);
            return ai !== bi ? ai - bi : 0;
        });

    const getLastIdxMap = rows => {
        const m = {};
        rows.forEach((r, i) => { m[r.product_type] = i; });
        return m;
    };

    const formatDate = dateStr => {
        if (!dateStr || dateStr === '-') return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });
    };

    const formatTime = t => (!t || t === '-') ? '-' : t.substring(0, 5);
    const formatProduct = t => PRODUCT_LABELS[t] || t;
    const unitLabel = pt => ['lumpia','adonan_pangsit'].includes(pt) ? 'P' : 'L';

    const handleSort = key => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const getSortIcon = col => {
        if (sortConfig.key !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp   className="w-3 h-3 ml-1 text-indigo-500" />
            : <ArrowDown className="w-3 h-3 ml-1 text-indigo-500" />;
    };

    const SortableHeader = ({ columnKey, children, className }) => (
        <th
            className={`px-3 py-2.5 text-xs font-bold text-white bg-[#1e3a5f] border-b border-[#152d4a] cursor-pointer group hover:bg-[#2a4f80] transition-colors select-none ${className || ''}`}
            onClick={() => handleSort(columnKey)}
        >
            <div className="flex items-center">{children}{getSortIcon(columnKey)}</div>
        </th>
    );

    /* ── Filter active count ───────────────────── */
    const activeFilters = [filterShift !== 'all', filterMachine !== 'all', !!filterDateFrom, !!filterDateTo, !!search]
        .filter(Boolean).length;

    const resetFilters = () => {
        setFilterShift('all'); setFilterMachine('all');
        setFilterDateFrom(''); setFilterDateTo('');
        setSearch(''); setCurrentPage(1);
    };

    /* ── Grouped & filtered data ───────────────── */
    const groupedData = useMemo(() => {
        let data = flatData;
        if (filterShift   !== 'all') data = data.filter(r => String(r.shift)   === filterShift);
        if (filterMachine !== 'all') data = data.filter(r => r.machine         === filterMachine);
        if (filterDateFrom)          data = data.filter(r => r.date >= filterDateFrom);
        if (filterDateTo)            data = data.filter(r => r.date <= filterDateTo);
        if (search) {
            const q = search.toLowerCase();
            data = data.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
        }

        const groups = {};
        data.forEach(row => {
            const key = `${row.date}|${row.shift}|${row.machine}`;
            if (!groups[key]) {
                groups[key] = { key, date: row.date, shift: row.shift, machine: row.machine,
                    rows: [], totals: { siomay: 0, pentol: 0, lumpia: 0, adonan: 0 } };
            }
            groups[key].rows.push(row);
            if (row.product_type === 'siomay')         groups[key].totals.siomay += row.tray_count || 0;
            if (row.product_type === 'pentol')         groups[key].totals.pentol += row.tray_count || 0;
            if (row.product_type === 'lumpia')         groups[key].totals.lumpia += row.tray_count || 0;
            if (row.product_type === 'adonan_pangsit') groups[key].totals.adonan += row.tray_count || 0;
        });

        return Object.values(groups)
            .sort((a, b) => {
                if (a.date    !== b.date)    return a.date    > b.date    ? -1 : 1;
                if (a.shift   !== b.shift)   return a.shift   > b.shift   ? -1 : 1;
                if (a.machine !== b.machine) return a.machine > b.machine ?  1 : -1;
                return 0;
            })
            .map(g => ({ ...g, rows: sortByProductOrder(sortData(g.rows, sortConfig)) }));
    }, [flatData, search, sortConfig, filterShift, filterMachine, filterDateFrom, filterDateTo]);

    /* ── Stats ─────────────────────────────────── */
    const stats = useMemo(() => {
        const totalLoyang = groupedData.reduce((s, g) =>
            s + g.rows.reduce((rs, r) => rs + (r.tray_count || 0), 0), 0);
        const dates = [...new Set(groupedData.map(g => g.date))].sort();
        return { groups: groupedData.length, totalLoyang, dateRange: dates };
    }, [groupedData]);

    /* ── Pagination ────────────────────────────── */
    const totalPages     = Math.ceil(groupedData.length / parseInt(groupsPerPage)) || 1;
    const paginatedGroups = groupedData.slice(
        (currentPage - 1) * parseInt(groupsPerPage),
        currentPage * parseInt(groupsPerPage)
    );

    /* ── Expand/Collapse ───────────────────────── */
    const toggleGroup = key => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };
    const expandAll   = () => setExpandedGroups(new Set(groupedData.map(g => g.key)));
    const collapseAll = () => setExpandedGroups(new Set());

    /* ── Edit modal ────────────────────────────── */
    const openEditModal  = row => setEditData({ ...row, pic: row.pic === '--' ? '' : row.pic });
    const handleEditChange = e => setEditData(p => ({ ...p, [e.target.name]: e.target.value }));
    const submitEdit = () => {
        setIsSaving(true);
        router.put(`/iqf-logsheet-detail/${editData.id}`, editData, {
            preserveScroll: true,
            onSuccess: () => { setIsSaving(false); setEditData(null); },
            onError:   () => setIsSaving(false),
        });
    };

    const handleDeleteDetail = (id) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        if (!deleteConfirmId) return;
        setIsSaving(true);
        router.delete(`/iqf-logsheet-detail/${deleteConfirmId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setDeleteConfirmId(null);
            },
            onError: () => setIsSaving(false),
        });
    };

    /* ── Print single group ─────────────────────── */
    const handlePrintGroup = useCallback((key) => {
        // Capture print timestamp at click moment
        const now = new Date();
        const ts = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                 + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        setPrintTime(ts);
        setPrintGroupKey(key);
        // small delay so React renders the portal before browser print dialog
        setTimeout(() => {
            window.print();
            // reset after print dialog closes (afterprint event)
            const cleanup = () => { setPrintGroupKey(null); window.removeEventListener('afterprint', cleanup); };
            window.addEventListener('afterprint', cleanup);
            // fallback: reset after 3s if afterprint never fires
            setTimeout(() => { setPrintGroupKey(null); }, 3000);
        }, 150);
    }, []);

    /* ── Export filename helper ────────────────── */
    const buildFilename = () => {
        const parts = ['Laporan_IQF'];
        if (filterDateFrom && filterDateTo && filterDateFrom === filterDateTo) {
            parts.push(new Date(filterDateFrom).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }).replace(' ',''));
        } else {
            if (filterDateFrom) parts.push(new Date(filterDateFrom).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }).replace(' ',''));
            if (filterDateTo)   parts.push(new Date(filterDateTo).toLocaleDateString('id-ID',   { day:'2-digit', month:'short' }).replace(' ',''));
        }
        if (filterShift   !== 'all') parts.push(`S${filterShift}`);
        if (filterMachine !== 'all') parts.push(filterMachine.replace(' ',''));
        parts.push(new Date().toISOString().slice(0, 10));
        return parts.join('_') + '.xlsx';
    };

    /* ── Export Excel ──────────────────────────── */
    const exportToExcel = () => {
        if (groupedData.length === 0) { alert('Tidak ada data untuk di-export'); return; }

        const COL_PRODUK = 'F', COL_JUMLAH = 'L', COL_TOTAL = 'M';
        const HEADER_ROW = 1, DATA_START = 2;
        const COL_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N'];
        const COL_KEYS = ['No','PIC','Tanggal','Shift','Mesin','Produk','No Batch',
                          'Suhu Panel','Suhu Produk','Jam (Mulai)','Rak / Rongga',
                          'Jumlah (Loyang/Pack)','Total','Unplanned Stop'];
        const HEADER_STYLE = {
            fill: { fgColor: { rgb: '1E3A5F' } },
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: { bottom: { style: 'medium', color: { rgb: '0A1F35' } } },
        };

        const workbook = XLSX.utils.book_new();

        groupedData.forEach((group, index) => {
            const EXPORT_ORDER = ['siomay', 'pentol', 'lumpia', 'adonan_pangsit'];
            const sortedRows = [...group.rows].sort((a, b) => {
                const ai = EXPORT_ORDER.indexOf(a.product_type);
                const bi = EXPORT_ORDER.indexOf(b.product_type);
                return ai !== bi ? ai - bi : 0;
            });

            const lastIdxByProduct = {};
            sortedRows.forEach((r, i) => { lastIdxByProduct[r.product_type] = i; });

            const dataRows = sortedRows.map((row, i) => ({
                'No': i + 1, 'PIC': row.pic, 'Tanggal': formatDate(row.date),
                'Shift': row.shift, 'Mesin': row.machine, 'Produk': formatProduct(row.product_type),
                'No Batch': row.batch_number, 'Suhu Panel': row.suhu_panel, 'Suhu Produk': row.suhu_produk,
                'Jam (Mulai)': formatTime(row.time), 'Rak / Rongga': row.rak,
                'Jumlah (Loyang/Pack)': row.tray_count, 'Total': '',
                'Unplanned Stop': row.unplanned_stop !== '-' ? row.unplanned_stop : '',
            }));

            const DATA_END = DATA_START + dataRows.length - 1;
            const worksheet = XLSX.utils.json_to_sheet(dataRows);
            worksheet['!cols'] = COL_KEYS.map(k => ({ wch: Math.max(k.length, 14) }));
            worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

            COL_LETTERS.forEach(col => {
                const addr = `${col}${HEADER_ROW}`;
                if (worksheet[addr]) worksheet[addr].s = HEADER_STYLE;
            });

            if (DATA_END >= DATA_START) {
                const sumifFormula = label =>
                    `SUMIF(${COL_PRODUK}${DATA_START}:${COL_PRODUK}${DATA_END},"${label}",${COL_JUMLAH}${DATA_START}:${COL_JUMLAH}${DATA_END})`;

                sortedRows.forEach((row, i) => {
                    const excelRow = DATA_START + i;
                    const pt = row.product_type;
                    const colors = EXCEL_COLORS[pt] || { bg: 'FFFFFF', font: '000000' };
                    const isLast = lastIdxByProduct[pt] === i;
                    const borderBottom = isLast
                        ? { style: 'medium', color: { rgb: '888888' } }
                        : { style: 'thin',   color: { rgb: 'E0E0E0' } };

                    COL_LETTERS.forEach(col => {
                        const addr = `${col}${excelRow}`;
                        if (!worksheet[addr]) worksheet[addr] = { t: 's', v: '' };
                        const isTotal = col === COL_TOTAL;
                        worksheet[addr].s = {
                            fill: { fgColor: { rgb: colors.bg } },
                            font: { color: { rgb: colors.font }, bold: isTotal && isLast, sz: 10 },
                            alignment: { vertical: 'center', horizontal: isTotal ? 'center' : 'left' },
                            border: { top: { style:'thin', color:{ rgb:'DDDDDD' } }, left: { style:'thin', color:{ rgb:'DDDDDD' } }, right: { style:'thin', color:{ rgb:'DDDDDD' } }, bottom: borderBottom },
                        };
                    });

                    if (isLast) {
                        worksheet[`${COL_TOTAL}${excelRow}`] = {
                            t: 'n', f: sumifFormula(formatProduct(pt)),
                            s: {
                                fill: { fgColor: { rgb: colors.bg } },
                                font: { bold: true, color: { rgb: colors.font }, sz: 11 },
                                alignment: { horizontal: 'center', vertical: 'center' },
                                border: { top: { style:'thin', color:{ rgb:'DDDDDD' } }, left: { style:'thin', color:{ rgb:'DDDDDD' } }, right: { style:'thin', color:{ rgb:'DDDDDD' } }, bottom: { style:'medium', color:{ rgb:'888888' } } },
                            },
                        };
                    }
                });
            }

            const dateShort = new Date(group.date).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }).replace(' ','');
            let sheetName = `${dateShort} S${group.shift} ${group.machine}`.substring(0, 31);
            if (workbook.SheetNames.includes(sheetName)) sheetName += ` (${index})`;
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        XLSX.writeFile(workbook, buildFilename());
    };

    /* ── Empty state ───────────────────────────── */
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

    /* ─────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────── */
    return (
        <div className="flex flex-col gap-0">

            {/* ── TOOLBAR (no-print) ───────────────── */}
            <div className="no-print mb-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                {/* Row 1 — date + shift + machine filters */}
                <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-b border-slate-100 sm:px-4">
                    {/* Date range */}
                    <div className="grid w-full grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2 sm:w-auto sm:flex sm:items-center sm:gap-1.5">
                        <div className="flex items-center gap-1.5 min-[380px]:col-span-2 sm:col-span-1">
                            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-slate-500 text-xs font-semibold sm:hidden">Filter tanggal</span>
                        </div>
                        <label className="min-w-0 space-y-1 sm:flex sm:items-center sm:gap-1.5 sm:space-y-0">
                            <span className="block text-[10px] font-semibold uppercase text-slate-500 sm:text-xs sm:normal-case">Dari</span>
                            <input
                                type="date" value={filterDateFrom}
                                onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                                className="h-8 w-full min-w-0 border border-slate-200 rounded-lg px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors sm:w-[132px]"
                            />
                        </label>
                        <label className="min-w-0 space-y-1 sm:flex sm:items-center sm:gap-1.5 sm:space-y-0">
                            <span className="block text-[10px] font-semibold uppercase text-slate-500 sm:text-xs sm:normal-case">Sampai</span>
                            <input
                                type="date" value={filterDateTo}
                                onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                                className="h-8 w-full min-w-0 border border-slate-200 rounded-lg px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors sm:w-[132px]"
                            />
                        </label>
                    </div>

                    <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />

                    {/* Shift */}
                    <Select value={filterShift} onValueChange={v => { setFilterShift(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[calc(50%-0.25rem)] text-xs h-8 border-slate-200 sm:w-32"><SelectValue placeholder="Semua Shift" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Shift</SelectItem>
                            <SelectItem value="1">Shift 1</SelectItem>
                            <SelectItem value="2">Shift 2</SelectItem>
                            <SelectItem value="3">Shift 3</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Machine */}
                    <Select value={filterMachine} onValueChange={v => { setFilterMachine(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[calc(50%-0.25rem)] text-xs h-8 border-slate-200 sm:w-32"><SelectValue placeholder="Semua Mesin" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Mesin</SelectItem>
                            <SelectItem value="IQF 1">IQF 1</SelectItem>
                            <SelectItem value="IQF 2">IQF 2</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Reset */}
                    {activeFilters > 0 && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors font-medium"
                        >
                            <X className="w-3 h-3" /> Reset ({activeFilters})
                        </button>
                    )}

                    <div className="ml-auto flex w-full items-center justify-end gap-1.5 sm:w-auto">
                        <button onClick={expandAll}   className="text-xs text-indigo-500 hover:underline">Buka Semua</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={collapseAll} className="text-xs text-slate-400 hover:underline">Tutup Semua</button>
                    </div>
                </div>

                {/* Row 2 — per-page + search + print + export */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Tampilkan:</span>
                        <Select value={groupsPerPage} onValueChange={v => { setGroupsPerPage(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-20 h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 Grup</SelectItem>
                                <SelectItem value="10">10 Grup</SelectItem>
                                <SelectItem value="25">25 Grup</SelectItem>
                                <SelectItem value="100">Semua</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        {/* Search */}
                        <div className="relative min-w-0 flex-1 sm:flex-none">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text" value={search} placeholder="Cari data..."
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors sm:w-44"
                            />
                        </div>



                        {/* Export Excel */}
                        <button
                            onClick={exportToExcel}
                            className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow hover:from-pink-700 hover:to-rose-600 transition-all font-medium"
                        >
                            <FileDown className="w-3.5 h-3.5" /> Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* ── STATS BAR (no-print) ─────────────── */}
            <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 shrink-0">
                {[
                    { icon: <Layers className="w-4 h-4" />, label: 'Total Grup', value: stats.groups, color: 'from-indigo-500 to-indigo-600' },
                    { icon: <BarChart2 className="w-4 h-4" />, label: 'Total Loyang/Pack', value: stats.totalLoyang, color: 'from-emerald-500 to-emerald-600' },
                    { icon: <Calendar className="w-4 h-4" />, label: 'Rentang Tanggal',
                      value: stats.dateRange.length === 0 ? '-'
                           : stats.dateRange.length === 1 ? formatDate(stats.dateRange[0])
                           : `${formatDate(stats.dateRange[0])} – ${formatDate(stats.dateRange[stats.dateRange.length-1])}`,
                      color: 'from-amber-500 to-amber-600' },
                    { icon: <Search className="w-4 h-4" />, label: 'Filter Aktif', value: activeFilters > 0 ? `${activeFilters} filter` : 'Tidak ada', color: activeFilters > 0 ? 'from-rose-500 to-rose-600' : 'from-slate-400 to-slate-500' },
                ].map(({ icon, label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3 overflow-hidden relative">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center shrink-0`}>{icon}</div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide truncate">{label}</p>
                            <p className="text-sm font-extrabold text-slate-800 truncate">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── CARDS ───────────────────────────── */}
            <div className="flex flex-col gap-4 pb-4">
                {paginatedGroups.length > 0 ? paginatedGroups.map((group, gIdx) => {
                    const isExpanded = expandedGroups.has(group.key);
                    const lastIdxMap = getLastIdxMap(group.rows);
                    const productTotals = { siomay: 0, pentol: 0, lumpia: 0, adonan_pangsit: 0 };
                    group.rows.forEach(r => { if (productTotals[r.product_type] !== undefined) productTotals[r.product_type] += r.tray_count || 0; });

                    // Unique PICs for print header
                    const uniquePics = [...new Set(group.rows.map(r => r.pic).filter(p => p && p !== '--'))].join(', ') || '-';

                    return (
                        <div key={group.key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print-group">

                            {/* ── PRINT HEADER (hidden on screen, visible on print) ── */}
                            <div className="print-header hidden flex-col border-b-2 border-slate-300 pb-3 mb-0 px-5 pt-4">
                                {/* Kop Surat */}
                                <div className="flex items-center justify-between mb-3">
                                    {/* Kiri: Logo */}
                                    <img src="/images/ppa.jpg" alt="Logo PPA" className="h-16 object-contain" />

                                    {/* Tengah: Judul */}
                                    <div className="flex-1 text-center">
                                        <p className="font-extrabold text-base tracking-widest uppercase">FORMULIR</p>
                                        <p className="font-bold text-sm tracking-wider uppercase">INPUT IQF DAN FREEZING</p>
                                    </div>

                                    {/* Kanan: spacer */}
                                    <div className="w-24" />
                                </div>

                                {/* Info Fields */}
                                <div className="print-info hidden grid grid-cols-2 gap-x-12 text-xs border-t border-slate-300 pt-2">
                                    <div className="flex gap-2 py-0.5"><span className="font-semibold w-20">Tanggal</span><span>: {formatDate(group.date)}</span></div>
                                    <div className="flex gap-2 py-0.5"><span className="font-semibold w-20">PIC</span><span>: {uniquePics}</span></div>
                                    <div className="flex gap-2 py-0.5"><span className="font-semibold w-20">IQF</span><span>: {group.machine}</span></div>
                                    <div className="flex gap-2 py-0.5"><span className="font-semibold w-20">Shift</span><span>: {group.shift}</span></div>
                                </div>
                            </div>

                            {/* ── CARD HEADER (screen only) ── */}
                            <button
                                className="no-print w-full flex items-center justify-between px-5 py-3 border-b border-slate-100 hover:bg-slate-50/60 transition-colors text-left"
                                onClick={() => toggleGroup(group.key)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${group.machine === 'IQF 1' ? 'bg-indigo-500' : 'bg-purple-500'} shadow`} />
                                    <span className="font-bold text-slate-800 text-sm">
                                        {group.machine}
                                    </span>
                                    <span className="text-slate-400 text-xs">|</span>
                                    <span className="text-slate-600 text-xs font-medium">{formatDate(group.date)}</span>
                                    <span className="text-slate-400 text-xs">|</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">Shift {group.shift}</span>
                                    <span className="text-xs text-slate-400 ml-1">{group.rows.length} entri</span>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    {/* Product badges */}
                                    {[
                                        { pt: 'siomay',         val: group.totals.siomay, unit: 'L' },
                                        { pt: 'pentol',         val: group.totals.pentol, unit: 'L' },
                                        { pt: 'lumpia',         val: group.totals.lumpia, unit: 'P' },
                                        { pt: 'adonan_pangsit', val: group.totals.adonan, unit: 'P' },
                                    ].filter(b => b.val > 0).map(({ pt, val, unit }) => {
                                        const bc = PRODUCT_BADGE[pt];
                                        return (
                                            <span key={pt} className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${bc.bg} ${bc.text} ${bc.border}`}>
                                                {PRODUCT_LABELS[pt].slice(0,3)}: {val}{unit}
                                            </span>
                                        );
                                    })}

                                    {/* Divider */}
                                    <span className="w-px h-4 bg-slate-200 mx-0.5" />

                                    {/* 🖨 Print button — per group, stops collapse toggle */}
                                    <button
                                        title={`Print ${group.machine} | ${formatDate(group.date)} | Shift ${group.shift}`}
                                        onClick={(e) => { e.stopPropagation(); handlePrintGroup(group.key); }}
                                        className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Toggle chevron */}
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        {isExpanded
                                            ? <ChevronUp   className="w-4 h-4 text-slate-400" />
                                            : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>
                            </button>

                            {/* ── TABLE (shown when expanded or always during print) ── */}
                            <div className={`overflow-x-auto min-w-0 max-w-full ${isExpanded ? '' : 'no-print hidden'}`}>
                                <table className="w-full min-w-full text-left border-collapse whitespace-normal sm:whitespace-nowrap break-words text-xs table-auto">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-2.5 text-xs font-bold text-white bg-[#1e3a5f] border-b border-[#152d4a] w-10 text-center">#</th>
                                            <SortableHeader columnKey="pic">PIC</SortableHeader>
                                            <SortableHeader columnKey="product_type">Jenis Produk</SortableHeader>
                                            <SortableHeader columnKey="batch_number">No Batch</SortableHeader>
                                            <SortableHeader columnKey="suhu_panel">Suhu Panel</SortableHeader>
                                            <SortableHeader columnKey="suhu_produk">Suhu Produk</SortableHeader>
                                            <SortableHeader columnKey="time">Waktu</SortableHeader>
                                            <SortableHeader columnKey="rak">Rak/Rongga</SortableHeader>
                                            <SortableHeader columnKey="tray_count">Jml (Loyang/Pack)</SortableHeader>
                                            <th className="px-3 py-2.5 text-xs font-bold text-emerald-100 bg-emerald-700 border-b border-emerald-800 text-center">Total</th>
                                            <SortableHeader columnKey="unplanned_stop" className="hidden lg:table-cell">Unplanned Stop</SortableHeader>
                                            <th className="no-print hidden sm:table-cell px-3 py-2.5 text-xs font-bold text-white bg-[#1e3a5f] border-b border-[#152d4a] text-center w-14">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {group.rows.map((row, idx) => {
                                            const isLastOfProd = lastIdxMap[row.product_type] === idx;
                                            const rowTotal     = productTotals[row.product_type];
                                            const pt           = row.product_type;
                                            const printClass   = PRODUCT_PRINT_CLASS[pt] || '';
                                            return (
                                                <tr key={row.id} className={`transition-colors ${PRODUCT_ROW_BG[pt] || 'hover:bg-slate-50'} ${printClass}`}>
                                                    <td className="px-3 py-1.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                                                    <td className="px-3 py-1.5 font-medium truncate max-w-[90px]">{row.pic}</td>
                                                    <td className="px-3 py-1.5 truncate max-w-[90px]">
                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${PRODUCT_BADGE[pt]?.bg} ${PRODUCT_BADGE[pt]?.text} ${PRODUCT_BADGE[pt]?.border}`}>
                                                            {formatProduct(pt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-1.5 font-mono text-slate-600 truncate max-w-[90px]">{row.batch_number}</td>
                                                    <td className="px-3 py-1.5 font-mono text-slate-600 hidden sm:table-cell">{row.suhu_panel}</td>
                                                    <td className="px-3 py-1.5 font-mono text-slate-600 hidden sm:table-cell">{row.suhu_produk}</td>
                                                    <td className="px-3 py-1.5 font-mono text-indigo-700 font-bold">{formatTime(row.time)}</td>
                                                    <td className="px-3 py-1.5 text-center font-bold text-slate-700 hidden md:table-cell">{row.rak}</td>
                                                    <td className="px-3 py-1.5 text-center">
                                                        <span className="inline-flex px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-black text-[10px]">
                                                            {row.tray_count}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-1.5 text-center bg-emerald-50/30">
                                                        {isLastOfProd ? (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-black text-[10px]">
                                                                {rowTotal}<span className="font-normal text-emerald-600">{unitLabel(pt)}</span>
                                                            </span>
                                                        ) : <span className="text-slate-200">—</span>}
                                                    </td>
                                                    <td className="hidden lg:table-cell px-3 py-1.5 text-xs">
                                                        {row.unplanned_stop !== '-' ? (
                                                            <span className="inline-flex px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-bold text-[10px]">{row.unplanned_stop}</span>
                                                        ) : <span className="text-slate-300">-</span>}
                                                    </td>
                                                    <td className="no-print hidden sm:table-cell px-3 py-1.5 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                className="h-6 w-6 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                                                                onClick={() => openEditModal(row)}
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                className="h-6 w-6 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                                                                onClick={() => handleDeleteDetail(row.id)}
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                        <tr>
                                            <td colSpan={12} className="p-0">
                                                <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-2.5 text-xs">
                                                    <span className="text-slate-400 uppercase font-medium mr-1">Rekap:</span>
                                                    {[
                                                        { label:'Siomay', val: group.totals.siomay, unit:'L', cls:'text-yellow-800 bg-yellow-100 border-yellow-300' },
                                                        { label:'Pentol', val: group.totals.pentol, unit:'L', cls:'text-blue-800 bg-blue-100 border-blue-300' },
                                                        { label:'Lumpia', val: group.totals.lumpia, unit:'P', cls:'text-green-800 bg-green-100 border-green-300' },
                                                        { label:'Adonan', val: group.totals.adonan, unit:'P', cls:'text-purple-800 bg-purple-100 border-purple-300' },
                                                    ].map(({ label, val, unit, cls }) => (
                                                        <div key={label} className="flex items-center gap-1">
                                                            <span className="text-slate-400">{label}:</span>
                                                            <span className={`border px-1.5 py-0.5 rounded font-black ${cls}`}>{val} {unit}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* collapsed hint (screen only) */}
                            {!isExpanded && (
                                <div className="no-print px-5 py-2 text-xs text-slate-400 text-center bg-slate-50/50">
                                    Klik header untuk melihat {group.rows.length} entri detail ↑
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-700">Tidak ada grup data</h3>
                        <p className="text-slate-500 text-sm mt-1">Coba ubah filter atau kata kunci pencarian.</p>
                        {activeFilters > 0 && (
                            <button onClick={resetFilters} className="mt-4 text-xs text-indigo-500 hover:underline">
                                Reset semua filter
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── PAGINATION (no-print) ─────────────── */}
            <div className="no-print flex items-center justify-between mt-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div className="text-xs text-slate-500">
                    Menampilkan {(currentPage - 1) * parseInt(groupsPerPage) + (paginatedGroups.length > 0 ? 1 : 0)}–{Math.min(currentPage * parseInt(groupsPerPage), groupedData.length)} dari <span className="font-bold text-slate-700">{groupedData.length}</span> grup
                    {activeFilters > 0 && <span className="ml-1 text-indigo-500">(difilter)</span>}
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        const p = totalPages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage >= totalPages - 3 ? totalPages - 6 + i : currentPage - 3 + i;
                        return (
                            <button key={p} onClick={() => setCurrentPage(p)}
                                className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === currentPage ? 'bg-indigo-600 text-white shadow' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                {p}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* ── EDIT MODAL ───────────────────────── */}
            <Dialog open={!!editData} onOpenChange={open => !open && setEditData(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Data Logsheet</DialogTitle>
                    </DialogHeader>
                    {editData && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Tanggal (Read-Only)</Label>
                                    <Input value={formatDate(editData.date)} disabled className="bg-slate-100 font-mono text-slate-600" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Waktu (Jam:Menit)</Label>
                                    <Input type="time" name="time" value={editData.time ? editData.time.substring(0, 5) : ''} onChange={handleEditChange} className="font-mono text-slate-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>PIC / Operator</Label>
                                <Input name="pic" value={editData.pic} onChange={handleEditChange} placeholder="Nama PIC..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>No Batch</Label>
                                    <Input name="batch_number" value={editData.batch_number} onChange={handleEditChange} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Jumlah (Loyang/Pack)</Label>
                                    <Input type="number" name="tray_count" value={editData.tray_count} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Suhu Panel</Label>
                                    <Input name="suhu_panel" value={editData.suhu_panel} onChange={handleEditChange} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Suhu Produk</Label>
                                    <Input name="suhu_produk" value={editData.suhu_produk} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Rak / Rongga</Label>
                                    <Input type="number" name="rak" value={editData.rak} onChange={handleEditChange} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Unplanned Stop</Label>
                                    <Input name="unplanned_stop" value={editData.unplanned_stop} onChange={handleEditChange} />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditData(null)}>Batal</Button>
                        <Button onClick={submitEdit} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                            {isSaving ? 'Menyimpan...' : <><Save className="w-4 h-4 mr-2" />Simpan</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* ── DELETE CONFIRM MODAL ─────────────── */}
            <Dialog open={!!deleteConfirmId} onOpenChange={open => !open && setDeleteConfirmId(null)}>
                <DialogContent className="max-w-sm sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Konfirmasi Hapus
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-slate-600">
                        Apakah Anda yakin ingin menghapus baris data ini? Aksi ini permanen dan total jumlah akan dihitung ulang.
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={isSaving}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
                            {isSaving ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── SINGLE-GROUP PRINT PORTAL ─────────────────────────────────
                Rendered directly into document.body via createPortal.
                This bypasses all parent containers so @media print CSS
                can show it alone with body>*:not(#iqf-spt){display:none}
            ─────────────────────────────────────────────────────────────── */}
            {printGroupKey && (() => {
                const pg = groupedData.find(g => g.key === printGroupKey);
                if (!pg || typeof document === 'undefined') return null;

                const pgLastIdxMap = getLastIdxMap(pg.rows);
                const pgPT = { siomay: 0, pentol: 0, lumpia: 0, adonan_pangsit: 0 };
                pg.rows.forEach(r => { if (pgPT[r.product_type] !== undefined) pgPT[r.product_type] += r.tray_count || 0; });
                const pgPics = [...new Set(pg.rows.map(r => r.pic).filter(p => p && p !== '--'))].join(', ') || '-';

                const PRINT_ROW_CLS = {
                    siomay: 'spt-row-siomay', pentol: 'spt-row-pentol',
                    lumpia: 'spt-row-lumpia', adonan_pangsit: 'spt-row-adonan',
                };

                return createPortal(
                    <div id="iqf-spt">
                        {/* Table — kop surat inside thead so it repeats every page */}
                        <table>
                            <thead>
                                {/* Row 1: Kop Surat */}
                                <tr className="spt-thead-kop">
                                    <td colSpan={10}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '6px', marginBottom: '4px' }}>
                                            <img src="/images/ppa.jpg" alt="Logo PPA" style={{ height: '50px', objectFit: 'contain' }} />
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase' }}>FORMULIR</div>
                                                <div style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>INPUT IQF DAN FREEZING</div>
                                            </div>
                                            <div style={{ width: '80px' }} />
                                        </div>
                                    </td>
                                </tr>
                                {/* Row 2: Info fields */}
                                <tr className="spt-thead-info">
                                    <td colSpan={10}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 48px', fontSize: '9px', paddingBottom: '4px' }}>
                                            <div><span style={{ fontWeight: 700, display: 'inline-block', width: '52px' }}>Tanggal</span>: {formatDate(pg.date)}</div>
                                            <div><span style={{ fontWeight: 700, display: 'inline-block', width: '52px' }}>PIC</span>: {pgPics}</div>
                                            <div><span style={{ fontWeight: 700, display: 'inline-block', width: '52px' }}>IQF</span>: {pg.machine}</div>
                                            <div><span style={{ fontWeight: 700, display: 'inline-block', width: '52px' }}>Shift</span>: {pg.shift}</div>
                                        </div>
                                    </td>
                                </tr>
                                {/* Row 3: Printed timestamp */}
                                <tr className="spt-thead-printed">
                                    <td colSpan={10} style={{ textAlign: 'right' }}>
                                        Dicetak pada: {printTime}
                                    </td>
                                </tr>
                                {/* Row 4: Column headers */}
                                <tr>
                                    <th style={{ textAlign: 'center', width: '22px' }}>#</th>
                                    <th>Jenis Produk</th>
                                    <th>No Batch</th>
                                    <th>Suhu Panel</th>
                                    <th>Suhu Produk</th>
                                    <th>Waktu</th>
                                    <th>Rak/Rongga</th>
                                    <th>Jml (Loyang/Pack)</th>
                                    <th className="spt-th-green" style={{ textAlign: 'center' }}>Total</th>
                                    <th>Unplanned Stop</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pg.rows.map((row, idx) => {
                                    const pt           = row.product_type;
                                    const isLast       = pgLastIdxMap[pt] === idx;
                                    const rowTotal     = pgPT[pt];
                                    return (
                                        <tr key={row.id} className={PRINT_ROW_CLS[pt] || ''}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td>{formatProduct(pt)}</td>
                                            <td>{row.batch_number}</td>
                                            <td>{row.suhu_panel}</td>
                                            <td>{row.suhu_produk}</td>
                                            <td>{formatTime(row.time)}</td>
                                            <td style={{ textAlign: 'center' }}>{row.rak}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{row.tray_count}</td>
                                            <td style={{ textAlign: 'center', fontWeight: isLast ? 900 : 'normal', background: isLast ? '#d1fae5' : 'transparent' }}>
                                                {isLast ? `${rowTotal} ${unitLabel(pt)}` : '—'}
                                            </td>
                                            <td>{row.unplanned_stop !== '-' ? row.unplanned_stop : ''}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={10} style={{ paddingTop: '8px', fontWeight: 700, fontSize: '9px', textAlign: 'right', borderTop: '2px solid #555' }}>
                                        Rekap Produksi:&nbsp;&nbsp;
                                        {pgPT.siomay > 0 && <span style={{ marginRight: '16px' }}>Siomay: <b>{pgPT.siomay} L</b></span>}
                                        {pgPT.pentol > 0 && <span style={{ marginRight: '16px' }}>Pentol: <b>{pgPT.pentol} L</b></span>}
                                        {pgPT.lumpia > 0 && <span style={{ marginRight: '16px' }}>Lumpia: <b>{pgPT.lumpia} P</b></span>}
                                        {pgPT.adonan_pangsit > 0 && <span>Adonan Pangsit: <b>{pgPT.adonan_pangsit} P</b></span>}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>,
                    document.body
                );
            })()}
        </div>
    );
}
