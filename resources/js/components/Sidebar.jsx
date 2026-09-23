import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, FileText, History, Snowflake, ClipboardList, Users, LogOut, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, Layers, AlertCircle, Scan
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarAnomalyWidget } from '@/components/SidebarAnomalyWidget';

export function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
    const { url, props } = usePage();
    const isAdmin = props.auth?.user?.role === 'admin';

    // State for expandable sections (default open)
    const [iqfOpen, setIqfOpen] = useState(true);
    const [refrezingOpen, setRefrezingOpen] = useState(false);

    // Active state helpers
    const isIqfDashboardActive = url === '/dashboard' || url === '/' || url.startsWith('/dashboard?');
    const isIqfLogsheetActive  = (url.startsWith('/logsheet-iqf') || url.startsWith('/iqf-logsheet')) && !url.includes('/history');
    const isIqfHistoryActive   = url.includes('/iqf-logsheet/history');
    const isIqfGroupActive     = isIqfDashboardActive || isIqfLogsheetActive || isIqfHistoryActive;

    const isRefrezingDashboardActive = url.startsWith('/refrezing/dashboard');
    const isRefrezingLogsheetActive  = (url.startsWith('/refrezing/logsheet') || url.startsWith('/refrezing-logsheet')) && !url.includes('/history');
    const isRefrezingHistoryActive   = url.includes('/refrezing/history') || url.includes('/refrezing-logsheet/history');
    const isRefrezingGroupActive     = isRefrezingDashboardActive || isRefrezingLogsheetActive || isRefrezingHistoryActive;

    const isUserAdminActive = url.startsWith('/admin/users');

    const handleItemClick = () => {
        if (setIsOpen) setIsOpen(false);
    };

    const renderNavContent = () => (
        <div className="flex flex-col h-full bg-white text-slate-700 rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden select-none">
            {/* Sidebar Brand Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col leading-tight truncate">
                            <span className="font-black text-slate-900 text-sm tracking-tight truncate">
                                Master Data
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                Control Panel
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
                
                {/* DASHBOARD UTAMA */}
                <Link
                    href="/dashboard"
                    onClick={handleItemClick}
                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 text-decoration-none ${
                        isIqfDashboardActive && !iqfOpen
                            ? 'bg-[#0284c7] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title="Dashboard Kontrol"
                >
                    <LayoutDashboard className={`w-4 h-4 shrink-0 ${isIqfDashboardActive && !iqfOpen ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">Dashboard Kontrol</span>}
                </Link>

                {/* IQF PRODUCTION GROUP (Expandable) */}
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => setIqfOpen(!iqfOpen)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                            isIqfGroupActive
                                ? 'bg-cyan-50/80 text-cyan-800'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Produksi IQF"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <Layers className={`w-4 h-4 shrink-0 ${isIqfGroupActive ? 'text-cyan-600' : 'text-slate-500'}`} />
                            {!isCollapsed && <span className="truncate">Produksi IQF</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${iqfOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {/* Sub-items for IQF */}
                    {(iqfOpen || isCollapsed) && (
                        <div className={`space-y-1 ${!isCollapsed ? 'pl-4 pr-1 border-l-2 border-slate-100 ml-5 my-1' : ''}`}>
                            <Link
                                href="/dashboard"
                                onClick={handleItemClick}
                                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-decoration-none ${
                                    isIqfDashboardActive
                                        ? 'bg-[#0284c7] text-white shadow-xs font-black'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                                title="Dashboard IQF"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                                {!isCollapsed && <span className="truncate">Dashboard IQF</span>}
                            </Link>

                            <Link
                                href="/logsheet-iqf"
                                onClick={handleItemClick}
                                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-decoration-none ${
                                    isIqfLogsheetActive
                                        ? 'bg-[#0284c7] text-white shadow-xs font-black'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                                title="Data Logsheet Harian"
                            >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                {!isCollapsed && <span className="truncate">Data Logsheet</span>}
                            </Link>

                            <Link
                                href="/iqf-logsheet/history"
                                onClick={handleItemClick}
                                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-decoration-none ${
                                    isIqfHistoryActive
                                        ? 'bg-[#0284c7] text-white shadow-xs font-black'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                                title="History Data"
                            >
                                <History className="w-3.5 h-3.5 shrink-0" />
                                {!isCollapsed && <span className="truncate">History Data</span>}
                            </Link>
                        </div>
                    )}
                </div>

                {/* REFREEZING SYSTEM GROUP */}
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => setRefrezingOpen(!refrezingOpen)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                            isRefrezingGroupActive
                                ? 'bg-cyan-50/80 text-cyan-800'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Refrezing System"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <Snowflake className={`w-4 h-4 shrink-0 ${isRefrezingGroupActive ? 'text-cyan-600' : 'text-slate-500'}`} />
                            {!isCollapsed && <span className="truncate">Refrezing System</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${refrezingOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {(refrezingOpen || isCollapsed) && (
                        <div className={`space-y-1 ${!isCollapsed ? 'pl-4 pr-1 border-l-2 border-slate-100 ml-5 my-1' : ''}`}>
                            <Link
                                href="/refrezing/dashboard"
                                onClick={handleItemClick}
                                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-decoration-none ${
                                    isRefrezingDashboardActive
                                        ? 'bg-[#0284c7] text-white shadow-xs font-black'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                                title="Refrezing Dashboard"
                            >
                                <Snowflake className="w-3.5 h-3.5 shrink-0" />
                                {!isCollapsed && <span className="truncate">Dashboard</span>}
                            </Link>

                            <Link
                                href="/refrezing/logsheet"
                                onClick={handleItemClick}
                                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-decoration-none ${
                                    isRefrezingLogsheetActive
                                        ? 'bg-[#0284c7] text-white shadow-xs font-black'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                                title="Logsheet Refrezing"
                            >
                                <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                                {!isCollapsed && <span className="truncate">Logsheet Harian</span>}
                            </Link>
                        </div>
                    )}
                </div>

                {/* MANAJEMEN USER */}
                {isAdmin && (
                    <Link
                        href="/admin/users"
                        onClick={handleItemClick}
                        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 text-decoration-none ${
                            isUserAdminActive
                                ? 'bg-[#0284c7] text-white shadow-xs font-black'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title="Manajemen User"
                    >
                        <Users className={`w-4 h-4 shrink-0 ${isUserAdminActive ? 'text-white' : 'text-slate-500'}`} />
                        {!isCollapsed && <span className="truncate">Manajemen User</span>}
                    </Link>
                )}
            </div>

            {/* Bottom Alert Card (Widget Anomali / Perhatian Stok) */}
            <SidebarAnomalyWidget isCollapsed={isCollapsed} />

            {/* Sidebar Footer / Collapse Toggle */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full py-1.5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Floating Sidebar Container */}
            <aside className={`hidden md:block h-full transition-all duration-300 z-20 shrink-0 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                {renderNavContent()}
            </aside>

            {/* Mobile Sheet Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="left" className="p-2 w-72 bg-[#f0f4f9] border-r-0">
                    {renderNavContent()}
                </SheetContent>
            </Sheet>
        </>
    );
}
