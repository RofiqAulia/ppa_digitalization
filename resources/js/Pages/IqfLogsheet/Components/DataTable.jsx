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
  @page { size: A4 landscape; margin: 6mm 6mm; }

  body > *:not(#iqf-spt) { display: none !important; }
  #iqf-spt {
    display: block !important;
    position: static !important;
    width: 100%;
    background: white;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: 7px;
  }

  /* === MAIN HEADER === */
  .spt-main-header {
    display: flex !important;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid #222;
    padding-bottom: 5px;
    margin-bottom: 4px;
    gap: 8px;
  }
  .spt-title-block { flex: 1; text-align: center; padding-top: 4px; }
  .spt-t1 { font-weight: 900; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; }
  .spt-t2 { font-weight: 700; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }

  /* Document info table — top right */
  .spt-doc-table { border-collapse: collapse; font-size: 7px; }
  .spt-doc-table td { border: 0.5px solid #444; padding: 2px 5px; white-space: nowrap; }
  .spt-doc-label { font-weight: 700; background: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* === SUB-HEADER: Tanggal, PIC, IQF, Shift === */
  .spt-info-row {
    display: flex !important;
    gap: 16px;
    font-size: 8px;
    border-bottom: 1px solid #ccc;
    padding: 2px 0 3px;
    margin-bottom: 3px;
    flex-wrap: wrap;
  }
  .spt-info-row b { font-weight: 700; margin-right: 2px; }

  .spt-printed { font-size: 6.5px; color: #888; text-align: right; font-style: italic; margin-bottom: 2px; }

  /* === MATRIX DATA TABLE === */
  table.spt-tbl {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    page-break-inside: auto;
    font-size: 6.5px;
  }
  table.spt-tbl thead { display: table-header-group; }
  table.spt-tbl tfoot { display: table-footer-group; }
  table.spt-tbl tr { page-break-inside: avoid; }
  table.spt-tbl th, table.spt-tbl td {
    border: 0.5px solid #aaa;
    padding: 1.5px 2px;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    word-break: break-all;
  }

  /* Group header colors (top row) */
  .spt-gh-siomay { background: #e65100 !important; color: #fff !important; font-weight: 900; font-size: 7.5px; letter-spacing: 0.5px; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-gh-pentol { background: #1565c0 !important; color: #fff !important; font-weight: 900; font-size: 7.5px; letter-spacing: 0.5px; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-gh-lumpia { background: #2e7d32 !important; color: #fff !important; font-weight: 900; font-size: 7.5px; letter-spacing: 0.5px; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-gh-adonan { background: #6a1b9a !important; color: #fff !important; font-weight: 900; font-size: 7.5px; letter-spacing: 0.5px; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-gh-stop   { background: #b71c1c !important; color: #fff !important; font-weight: 900; font-size: 7.5px; letter-spacing: 0.5px; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Sub-header row per product */
  .spt-sh-siomay { background: #fff3e0 !important; font-weight: 700; font-size: 5.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-sh-pentol { background: #e3f2fd !important; font-weight: 700; font-size: 5.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-sh-lumpia { background: #e8f5e9 !important; font-weight: 700; font-size: 5.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-sh-adonan { background: #f3e5f5 !important; font-weight: 700; font-size: 5.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-sh-stop   { background: #ffebee !important; font-weight: 700; font-size: 5.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Data cell colors per product */
  .spt-d-siomay { background: #fff9f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-d-pentol { background: #f0f7ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-d-lumpia { background: #f0fff4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-d-adonan { background: #faf0ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .spt-d-stop   { background: #fff5f5 !important; vertical-align: top !important; text-align: left !important; padding: 3px !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Column width classes (used on <col>) */
  .spt-c-batch { width: 13mm; }
  .spt-c-suhu  { width: 9mm; }
  .spt-c-time  { width: 12mm; }
  .spt-c-rak   { width: 9mm; }
  .spt-c-qty   { width: 10mm; }
  .spt-c-stop  { width: 22mm; }

  /* Total / footer rows */
  .spt-total-row td { font-weight: 700; font-size: 7px; border-top: 1.5px solid #555 !important; }
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

        const machineLogsheets = logsheets
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
                return `${st} (⏱ ${duration} menit)`;
            } else {
                return `${st} (🔴 Belum Selesai)`;
            }
        }).join(', ');
    };

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
                        unplanned_stop: idx === lastIdx ? parseUnplannedStop(ls, logsheets) : '-',
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
            const ai = PRODUCT_ORDER.indexOf(getBaseProduct(a.product_type));
            const bi = PRODUCT_ORDER.indexOf(getBaseProduct(b.product_type));
            return ai !== bi ? ai - bi : 0;
        });

    const getLastIdxMap = rows => {
        const m = {};
        rows.forEach((r, i) => { m[getBaseProduct(r.product_type)] = i; });
        return m;
    };

    const getBaseProduct = pt => pt ? pt.replace('_T', '') : '';
    const isTrial = pt => pt ? pt.endsWith('_T') : false;

    const formatDate = dateStr => {
        if (!dateStr || dateStr === '-') return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });
    };

    const formatTime = t => (!t || t === '-') ? '-' : t.substring(0, 5);
    const formatProduct = pt => {
        const base = getBaseProduct(pt);
        const label = PRODUCT_LABELS[base] || base;
        return isTrial(pt) ? `${label} (T)` : label;
    };
    const unitLabel = pt => ['lumpia','adonan_pangsit'].includes(getBaseProduct(pt)) ? 'K' : 'L';

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
            const basePt = getBaseProduct(row.product_type);
            if (basePt === 'siomay')         groups[key].totals.siomay += row.tray_count || 0;
            if (basePt === 'pentol')         groups[key].totals.pentol += row.tray_count || 0;
            if (basePt === 'lumpia')         groups[key].totals.lumpia += row.tray_count || 0;
            if (basePt === 'adonan_pangsit') groups[key].totals.adonan += row.tray_count || 0;
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
                const ai = EXPORT_ORDER.indexOf(getBaseProduct(a.product_type));
                const bi = EXPORT_ORDER.indexOf(getBaseProduct(b.product_type));
                return ai !== bi ? ai - bi : 0;
            });

            const lastIdxByProduct = {};
            sortedRows.forEach((r, i) => { lastIdxByProduct[getBaseProduct(r.product_type)] = i; });

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
                    const pt = getBaseProduct(row.product_type);
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
                            t: 'n', f: sumifFormula(formatProduct(row.product_type)),
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
                <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-b border-slate-100 lg:px-4">
                    {/* Date range */}
                    <div className="w-full space-y-2 lg:hidden">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-slate-500 text-xs font-semibold">Filter tanggal</span>
                        </div>
                        <label className="block min-w-0 space-y-1">
                            <span className="block text-[10px] font-semibold uppercase text-slate-500">Dari</span>
                            <input
                                type="date" value={filterDateFrom}
                                onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                                className="block h-9 w-full max-w-full min-w-0 border border-slate-200 rounded-lg px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors"
                            />
                        </label>
                        <label className="block min-w-0 space-y-1">
                            <span className="block text-[10px] font-semibold uppercase text-slate-500">Sampai</span>
                            <input
                                type="date" value={filterDateTo}
                                onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                                className="block h-9 w-full max-w-full min-w-0 border border-slate-200 rounded-lg px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors"
                            />
                        </label>
                    </div>

                    <div className="hidden items-center gap-1.5 text-sm lg:flex">
                        <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-slate-500 text-xs font-medium">Dari:</span>
                        <input
                            type="date" value={filterDateFrom}
                            onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                            className="h-8 w-[132px] border border-slate-200 rounded-lg px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <span className="text-slate-500 text-xs font-medium">:</span>
                        <input
                            type="date" value={filterDateTo}
                            onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                            className="h-8 w-[132px] border border-slate-200 rounded-lg px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors"
                        />
                    </div>

                    <div className="w-px h-5 bg-slate-200 mx-1 hidden lg:block" />

                    {/* Shift */}
                    <Select value={filterShift} onValueChange={v => { setFilterShift(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full text-xs h-8 border-slate-200 lg:w-32"><SelectValue placeholder="Semua Shift" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Shift</SelectItem>
                            <SelectItem value="1">Shift 1</SelectItem>
                            <SelectItem value="2">Shift 2</SelectItem>
                            <SelectItem value="3">Shift 3</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Machine */}
                    <Select value={filterMachine} onValueChange={v => { setFilterMachine(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full text-xs h-8 border-slate-200 lg:w-32"><SelectValue placeholder="Semua Mesin" /></SelectTrigger>
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
                            className="flex w-full items-center justify-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors font-medium lg:w-auto"
                        >
                            <X className="w-3 h-3" /> Reset ({activeFilters})
                        </button>
                    )}

                    <div className="ml-auto flex w-full items-center justify-end gap-1.5 lg:w-auto">
                        <button onClick={expandAll}   className="text-xs text-indigo-500 hover:underline">Buka Semua</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={collapseAll} className="text-xs text-slate-400 hover:underline">Tutup Semua</button>
                    </div>
                </div>

                {/* Row 2 — per-page + search + print + export */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 lg:px-4">
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

                    <div className="flex w-full items-center gap-2 lg:w-auto">
                        {/* Search */}
                        <div className="relative min-w-0 flex-1 lg:flex-none">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text" value={search} placeholder="Cari data..."
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:border-indigo-300 transition-colors lg:w-44"
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
                    group.rows.forEach(r => { const bp = getBaseProduct(r.product_type); if (productTotals[bp] !== undefined) productTotals[bp] += r.tray_count || 0; });

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
                                        { pt: 'lumpia',         val: group.totals.lumpia, unit: 'K' },
                                        { pt: 'adonan_pangsit', val: group.totals.adonan, unit: 'K' },
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
                                            <SortableHeader columnKey="tray_count">Jumlah (Loyang/Keranjang)</SortableHeader>
                                            <th className="px-3 py-2.5 text-xs font-bold text-emerald-100 bg-emerald-700 border-b border-emerald-800 text-center">Total</th>
                                            <SortableHeader columnKey="unplanned_stop" className="hidden lg:table-cell">Unplanned Stop</SortableHeader>
                                            <th className="no-print hidden sm:table-cell px-3 py-2.5 text-xs font-bold text-white bg-[#1e3a5f] border-b border-[#152d4a] text-center w-14">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {(() => {
                                            const rakAnomalyIds = new Set();
                                            const byProduct = {};
                                            group.rows.forEach(r => {
                                                if (['lumpia','adonan_pangsit'].includes(getBaseProduct(r.product_type))) return;
                                                const bp = getBaseProduct(r.product_type);
                                                (byProduct[bp] = byProduct[bp] || []).push(r);
                                            });
                                            Object.values(byProduct).forEach(rows => {
                                                const sorted = [...rows].sort((a, b) => a.time.localeCompare(b.time));
                                                for (let i = 1; i < sorted.length; i++) {
                                                    const prev = Number(sorted[i - 1].rak);
                                                    const curr = Number(sorted[i].rak);
                                                    // Rak should increment by 1 each entry
                                                    if (curr !== prev + 1) {
                                                        rakAnomalyIds.add(sorted[i].id);
                                                    }
                                                }
                                            });

                                            return group.rows.map((row, idx) => {
                                            const basePt       = getBaseProduct(row.product_type);
                                            const isLastOfProd = lastIdxMap[basePt] === idx;
                                            const rowTotal     = productTotals[basePt];
                                            const pt           = basePt;
                                            const printClass   = PRODUCT_PRINT_CLASS[pt] || '';
                                            const isRakAnomaly = rakAnomalyIds.has(row.id);
                                            return (
                                                <tr key={row.id} title={isRakAnomaly ? `⚠️ Rak ${row.rak} tidak urut dari entri sebelumnya` : undefined} className={`transition-colors ${isRakAnomaly ? 'bg-red-50 hover:bg-red-100' : (PRODUCT_ROW_BG[pt] || 'hover:bg-slate-50')} ${printClass}`}>
                                                    <td className="px-3 py-1.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                                                    <td className="px-3 py-1.5 font-medium truncate max-w-[90px]">{row.pic}</td>
                                                    <td className="px-3 py-1.5 truncate max-w-[90px]">
                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${PRODUCT_BADGE[pt]?.bg} ${PRODUCT_BADGE[pt]?.text} ${PRODUCT_BADGE[pt]?.border}`}>
                                                            {formatProduct(row.product_type)}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-1.5 font-mono text-slate-600 truncate max-w-[90px]">{row.batch_number}</td>
                                                    <td className="px-3 py-1.5 font-mono text-slate-600 hidden sm:table-cell">{row.suhu_panel}</td>
                                                    <td className="px-3 py-1.5 font-mono text-slate-600 hidden sm:table-cell">{row.suhu_produk}</td>
                                                    <td className="px-3 py-1.5 font-mono text-indigo-700 font-bold">{formatTime(row.time)}</td>
                                                    <td className={`px-3 py-1.5 text-center font-bold hidden md:table-cell ${isRakAnomaly ? 'text-red-600 bg-red-100' : 'text-slate-700'}`}>
                                                        {['lumpia','adonan_pangsit'].includes(pt)
                                                            ? <span className="text-slate-300">-</span>
                                                            : (
                                                                <span className={`inline-flex items-center gap-1 ${ isRakAnomaly ? 'text-red-600' : ''}`}>
                                                                    {isRakAnomaly && <span title="Rak tidak urut" className="text-red-500 font-black">!</span>}
                                                                    {row.rak}
                                                                </span>
                                                            )
                                                        }
                                                    </td>
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
                                         });
                                        })()}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                        <tr>
                                            <td colSpan={12} className="p-0">
                                                <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-2.5 text-xs">
                                                    <span className="text-slate-400 uppercase font-medium mr-1">Rekap:</span>
                                                    {[
                                                        { label:'Siomay', val: group.totals.siomay, unit:'L', cls:'text-yellow-800 bg-yellow-100 border-yellow-300' },
                                                        { label:'Pentol', val: group.totals.pentol, unit:'L', cls:'text-blue-800 bg-blue-100 border-blue-300' },
                                                        { label:'Lumpia', val: group.totals.lumpia, unit:'K', cls:'text-green-800 bg-green-100 border-green-300' },
                                                        { label:'Adonan', val: group.totals.adonan, unit:'K', cls:'text-purple-800 bg-purple-100 border-purple-300' },
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
                                    <Label>Jumlah (Loyang/Keranjang)</Label>
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

                /* ── Pisahkan baris per jenis produk ── */
                const siomayRows = pg.rows.filter(r => getBaseProduct(r.product_type) === 'siomay');
                const pentolRows  = pg.rows.filter(r => getBaseProduct(r.product_type) === 'pentol');
                const lumpiaRows  = pg.rows.filter(r => getBaseProduct(r.product_type) === 'lumpia');
                const adonanRows  = pg.rows.filter(r => getBaseProduct(r.product_type) === 'adonan_pangsit');

                /* Pentol dibagi 2 kolom karena volume terbanyak */
                const pentolHalf = Math.ceil(pentolRows.length / 2);
                const pentolCol1 = pentolRows.slice(0, pentolHalf);
                const pentolCol2 = pentolRows.slice(pentolHalf);

                const maxRows = Math.max(
                    siomayRows.length, pentolCol1.length, pentolCol2.length,
                    lumpiaRows.length, adonanRows.length, 1
                );

                /* Totals */
                const totSiomay = siomayRows.reduce((s, r) => s + (r.tray_count || 0), 0);
                const totPentol = pentolRows.reduce((s, r) => s + (r.tray_count || 0), 0);
                const totLumpia = lumpiaRows.reduce((s, r) => s + (r.tray_count || 0), 0);
                const totAdonan = adonanRows.reduce((s, r) => s + (r.tray_count || 0), 0);

                /* Unplanned stops & PICs */
                const unplannedStops = [...new Set(pg.rows.map(r => r.unplanned_stop).filter(s => s && s !== '-'))].join('\n') || '';
                const pgPics = [...new Set(pg.rows.map(r => r.pic).filter(p => p && p !== '--'))].join(', ') || '-';

                /* Tanggal berlaku = hari ini */
                const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

                /* Helpers */
                const cv  = (row, f) => row ? (row[f] ?? '') : '';
                const tc  = (row)    => row ? formatTime(row.time) : '';
                const bold = (row)   => row ? 700 : 'normal';

                return createPortal(
                    <div id="iqf-spt">

                        {/* ── MAIN HEADER ── */}
                        <div className="spt-main-header">
                            <img src="/images/ppa.jpg" alt="Logo PPA" style={{ height: '48px', objectFit: 'contain' }} />
                            <div className="spt-title-block">
                                <div className="spt-t1">FORMULIR</div>
                                <div className="spt-t2">INPUT IQF DAN FREEZING</div>
                            </div>
                            <table className="spt-doc-table">
                                <tbody>
                                    <tr><td className="spt-doc-label">Departemen</td><td>Produksi</td></tr>
                                    <tr><td className="spt-doc-label">Nomor Dokumen</td><td>Form/PROS/IQF-01</td></tr>
                                    <tr><td className="spt-doc-label">Tanggal Berlaku</td><td>{today}</td></tr>
                                    <tr><td className="spt-doc-label">Factory</td><td>Malang</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* ── SUB-HEADER INFO ── */}
                        <div className="spt-info-row">
                            <span><b>Tanggal</b>: {formatDate(pg.date)}</span>
                            <span><b>PIC</b>: {pgPics}</span>
                            <span><b>IQF</b>: {pg.machine}</span>
                            <span><b>Shift</b>: {pg.shift}</span>
                        </div>

                        {/* ── PRINTED TIMESTAMP ── */}
                        <div className="spt-printed">Dicetak pada: {printTime}</div>

                        {/* ── MATRIX TABLE ──
                            Kolom: SIOMAY(6) | PENTOL(6) | PENTOL(6) | LUMPIA(5) | ADONAN PANGSIT(5) | STOP(1) = 29
                        ── */}
                        <table className="spt-tbl">
                            <colgroup>
                                {/* SIOMAY: Batch|PnlSuhu|PrdSuhu|Mulai|Rak|Loy */}
                                <col className="spt-c-batch"/><col className="spt-c-suhu"/><col className="spt-c-suhu"/>
                                <col className="spt-c-time" /><col className="spt-c-rak" /><col className="spt-c-qty" />
                                {/* PENTOL 1 */}
                                <col className="spt-c-batch"/><col className="spt-c-suhu"/><col className="spt-c-suhu"/>
                                <col className="spt-c-time" /><col className="spt-c-rak" /><col className="spt-c-qty" />
                                {/* PENTOL 2 */}
                                <col className="spt-c-batch"/><col className="spt-c-suhu"/><col className="spt-c-suhu"/>
                                <col className="spt-c-time" /><col className="spt-c-rak" /><col className="spt-c-qty" />
                                {/* LUMPIA: Batch|PnlSuhu|PrdSuhu|Mulai|Keranjang (tanpa Rak) */}
                                <col className="spt-c-batch"/><col className="spt-c-suhu"/><col className="spt-c-suhu"/>
                                <col className="spt-c-time" /><col className="spt-c-qty" />
                                {/* ADONAN: Batch|PnlSuhu|PrdSuhu|Mulai|Keranjang (tanpa Rak) */}
                                <col className="spt-c-batch"/><col className="spt-c-suhu"/><col className="spt-c-suhu"/>
                                <col className="spt-c-time" /><col className="spt-c-qty" />
                                {/* UNPLANNED STOP */}
                                <col className="spt-c-stop"/>
                            </colgroup>

                            <thead>
                                {/* ROW A: Group Headers */}
                                <tr>
                                    <th colSpan={6} className="spt-gh-siomay">SIOMAY</th>
                                    <th colSpan={6} className="spt-gh-pentol">PENTOL</th>
                                    <th colSpan={6} className="spt-gh-pentol">PENTOL</th>
                                    <th colSpan={5} className="spt-gh-lumpia">LUMPIA</th>
                                    <th colSpan={5} className="spt-gh-adonan">ADONAN PANGSIT</th>
                                    <th rowSpan={2} className="spt-gh-stop">UNPLANNED STOP</th>
                                </tr>
                                {/* ROW B: Sub-headers */}
                                <tr>
                                    {/* SIOMAY */}
                                    <th className="spt-sh-siomay">No.Batch</th>
                                    <th className="spt-sh-siomay">Suhu Panel</th>
                                    <th className="spt-sh-siomay">Suhu Produk</th>
                                    <th className="spt-sh-siomay">Mulai</th>
                                    <th className="spt-sh-siomay">Rak</th>
                                    <th className="spt-sh-siomay">Loyang</th>
                                    {/* PENTOL 1 */}
                                    <th className="spt-sh-pentol">No.Batch</th>
                                    <th className="spt-sh-pentol">Suhu Panel</th>
                                    <th className="spt-sh-pentol">Suhu Produk</th>
                                    <th className="spt-sh-pentol">Mulai</th>
                                    <th className="spt-sh-pentol">Rak</th>
                                    <th className="spt-sh-pentol">Loyang</th>
                                    {/* PENTOL 2 */}
                                    <th className="spt-sh-pentol">No.Batch</th>
                                    <th className="spt-sh-pentol">Suhu Panel</th>
                                    <th className="spt-sh-pentol">Suhu Produk</th>
                                    <th className="spt-sh-pentol">Mulai</th>
                                    <th className="spt-sh-pentol">Rak</th>
                                    <th className="spt-sh-pentol">Loyang</th>
                                    {/* LUMPIA — tanpa Rak */}
                                    <th className="spt-sh-lumpia">No.Batch</th>
                                    <th className="spt-sh-lumpia">Suhu Panel</th>
                                    <th className="spt-sh-lumpia">Suhu Produk</th>
                                    <th className="spt-sh-lumpia">Mulai</th>
                                    <th className="spt-sh-lumpia">Keranjang</th>
                                    {/* ADONAN PANGSIT — tanpa Rak */}
                                    <th className="spt-sh-adonan">No.Batch</th>
                                    <th className="spt-sh-adonan">Suhu Panel</th>
                                    <th className="spt-sh-adonan">Suhu Produk</th>
                                    <th className="spt-sh-adonan">Mulai</th>
                                    <th className="spt-sh-adonan">Keranjang</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Array.from({ length: maxRows }, (_, i) => {
                                    const s  = siomayRows[i]  || null;
                                    const p1 = pentolCol1[i]  || null;
                                    const p2 = pentolCol2[i]  || null;
                                    const l  = lumpiaRows[i]  || null;
                                    const a  = adonanRows[i]  || null;
                                    return (
                                        <tr key={i}>
                                            {/* SIOMAY */}
                                            <td className="spt-d-siomay">{cv(s,'batch_number')}</td>
                                            <td className="spt-d-siomay">{cv(s,'suhu_panel')}</td>
                                            <td className="spt-d-siomay">{cv(s,'suhu_produk')}</td>
                                            <td className="spt-d-siomay">{tc(s)}</td>
                                            <td className="spt-d-siomay" style={{fontWeight:bold(s)}}>{cv(s,'rak')}</td>
                                            <td className="spt-d-siomay" style={{fontWeight:bold(s)}}>{s ? s.tray_count : ''}</td>
                                            {/* PENTOL 1 */}
                                            <td className="spt-d-pentol">{cv(p1,'batch_number')}</td>
                                            <td className="spt-d-pentol">{cv(p1,'suhu_panel')}</td>
                                            <td className="spt-d-pentol">{cv(p1,'suhu_produk')}</td>
                                            <td className="spt-d-pentol">{tc(p1)}</td>
                                            <td className="spt-d-pentol" style={{fontWeight:bold(p1)}}>{cv(p1,'rak')}</td>
                                            <td className="spt-d-pentol" style={{fontWeight:bold(p1)}}>{p1 ? p1.tray_count : ''}</td>
                                            {/* PENTOL 2 — lanjutan */}
                                            <td className="spt-d-pentol">{cv(p2,'batch_number')}</td>
                                            <td className="spt-d-pentol">{cv(p2,'suhu_panel')}</td>
                                            <td className="spt-d-pentol">{cv(p2,'suhu_produk')}</td>
                                            <td className="spt-d-pentol">{tc(p2)}</td>
                                            <td className="spt-d-pentol" style={{fontWeight:bold(p2)}}>{cv(p2,'rak')}</td>
                                            <td className="spt-d-pentol" style={{fontWeight:bold(p2)}}>{p2 ? p2.tray_count : ''}</td>
                                            {/* LUMPIA — tanpa kolom rak */}
                                            <td className="spt-d-lumpia">{cv(l,'batch_number')}</td>
                                            <td className="spt-d-lumpia">{cv(l,'suhu_panel')}</td>
                                            <td className="spt-d-lumpia">{cv(l,'suhu_produk')}</td>
                                            <td className="spt-d-lumpia">{tc(l)}</td>
                                            <td className="spt-d-lumpia" style={{fontWeight:bold(l)}}>{l ? l.tray_count : ''}</td>
                                            {/* ADONAN PANGSIT — tanpa kolom rak */}
                                            <td className="spt-d-adonan">{cv(a,'batch_number')}</td>
                                            <td className="spt-d-adonan">{cv(a,'suhu_panel')}</td>
                                            <td className="spt-d-adonan">{cv(a,'suhu_produk')}</td>
                                            <td className="spt-d-adonan">{tc(a)}</td>
                                            <td className="spt-d-adonan" style={{fontWeight:bold(a)}}>{a ? a.tray_count : ''}</td>
                                            {/* UNPLANNED STOP — rowSpan, hanya pada baris pertama */}
                                            {i === 0 && (
                                                <td rowSpan={maxRows} className="spt-d-stop" style={{whiteSpace:'pre-line'}}>
                                                    {unplannedStops}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>

                            <tfoot>
                                <tr className="spt-total-row">
                                    {/* SIOMAY total */}
                                    <td colSpan={4} style={{textAlign:'right'}}>TOTAL</td>
                                    <td colSpan={2} style={{fontWeight:900,color:'#e65100'}}>
                                        {totSiomay > 0 ? `${totSiomay} L` : '-'}
                                    </td>
                                    {/* PENTOL 1 total */}
                                    <td colSpan={4} style={{textAlign:'right'}}>TOTAL</td>
                                    <td colSpan={2} style={{fontWeight:900,color:'#1565c0'}}>
                                        {totPentol > 0 ? `${totPentol} L` : '-'}
                                    </td>
                                    {/* PENTOL 2 — kosong (total sudah di PENTOL 1) */}
                                    <td colSpan={6} />
                                    {/* LUMPIA total */}
                                    <td colSpan={3} style={{textAlign:'right'}}>TOTAL</td>
                                    <td colSpan={2} style={{fontWeight:900,color:'#2e7d32'}}>
                                        {totLumpia > 0 ? `${totLumpia}` : '-'}
                                    </td>
                                    {/* ADONAN total */}
                                    <td colSpan={3} style={{textAlign:'right'}}>TOTAL</td>
                                    <td colSpan={2} style={{fontWeight:900,color:'#6a1b9a'}}>
                                        {totAdonan > 0 ? `${totAdonan}` : '-'}
                                    </td>
                                    {/* STOP */}
                                    <td />
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
