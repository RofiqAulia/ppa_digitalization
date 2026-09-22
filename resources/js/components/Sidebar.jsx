import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, FileText, History, Snowflake, ClipboardList, Users, LogOut, PanelLeftClose, PanelLeftOpen, Layers
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarAnomalyWidget } from '@/components/SidebarAnomalyWidget';

export function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
    const { url, props } = usePage();
    const isAdmin = props.auth?.user?.role === 'admin';

    // Active state helper functions
    const isIqfDashboardActive = url === '/dashboard' || url === '/' || url.startsWith('/dashboard?');
    const isIqfLogsheetActive  = (url.startsWith('/logsheet-iqf') || url.startsWith('/iqf-logsheet')) && !url.includes('/history');
    const isIqfHistoryActive   = url.includes('/iqf-logsheet/history');

    const isRefrezingDashboardActive = url.startsWith('/refrezing/dashboard');
    const isRefrezingLogsheetActive  = (url.startsWith('/refrezing/logsheet') || url.startsWith('/refrezing-logsheet')) && !url.includes('/history');
    const isRefrezingHistoryActive   = url.includes('/refrezing/history') || url.includes('/refrezing-logsheet/history');

    const isPrepareProduksiActive    = url.startsWith('/prepare-produksi');
    const isUserAdminActive          = url.startsWith('/admin/users');

    const handleItemClick = () => {
        if (setIsOpen) setIsOpen(false);
    };

    const renderNavContent = () => (
        <div className="flex flex-col h-full bg-[#10132b] text-white shadow-2xl select-none border-r border-[#202449]">
            {/* Header / Brand */}
            <div className="p-3 border-b border-[#202449] bg-[#0d0f22] shrink-0">
                <div className="flex items-center gap-3 overflow-hidden bg-[#171a3a] border border-[#272c5a] p-2 rounded-2xl shadow-sm">
                    <div className="flex items-center shrink-0 gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                        <img src="/images/ppa.jpg" alt="PPA" className="rounded-md h-6 w-auto object-contain" />
                        <div className="h-4 w-px bg-white/20"></div>
                        <img src="/images/LogoMieGacoan.png" alt="Gacoan" className="h-6 w-auto object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div className="text-left leading-tight truncate pr-1">
                            <div className="font-extrabold text-white text-xs tracking-tight truncate">
                                PPA Digitalization
                            </div>
                            <div className="text-[10px] text-indigo-400 font-bold opacity-90 truncate">
                                Production Systems
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-6 custom-scrollbar">
                
                {/* IQF SECTION */}
                <div>
                    {!isCollapsed && (
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            IQF Production
                        </div>
                    )}
                    <div className="space-y-1">
                        <Link
                            href="/dashboard"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-decoration-none ${
                                isIqfDashboardActive
                                    ? 'bg-gradient-to-r from-[#584be2] to-[#695cf6] text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-300 hover:bg-[#181c3d] hover:text-white'
                            }`}
                            title="IQF Dashboard"
                        >
                            {isIqfDashboardActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"></span>
                            )}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                isIqfDashboardActive ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                                <LayoutDashboard className="w-4 h-4" />
                            </div>
                            {!isCollapsed && <span className="truncate">Dashboard</span>}
                        </Link>

                        <Link
                            href="/logsheet-iqf"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-decoration-none ${
                                isIqfLogsheetActive
                                    ? 'bg-gradient-to-r from-[#584be2] to-[#695cf6] text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-300 hover:bg-[#181c3d] hover:text-white'
                            }`}
                            title="IQF Logsheet Harian"
                        >
                            {isIqfLogsheetActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"></span>
                            )}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                isIqfLogsheetActive ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                                <FileText className="w-4 h-4" />
                            </div>
                            {!isCollapsed && <span className="truncate">Logsheet Harian</span>}
                        </Link>

                        <Link
                            href="/iqf-logsheet/history"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-decoration-none ${
                                isIqfHistoryActive
                                    ? 'bg-gradient-to-r from-[#584be2] to-[#695cf6] text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-300 hover:bg-[#181c3d] hover:text-white'
                            }`}
                            title="IQF History"
                        >
                            {isIqfHistoryActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"></span>
                            )}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                isIqfHistoryActive ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                                <History className="w-4 h-4" />
                            </div>
                            {!isCollapsed && <span className="truncate">History</span>}
                        </Link>
                    </div>
                </div>

                {/* REFREZING SECTION */}
                <div>
                    {!isCollapsed && (
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                            Refrezing System
                        </div>
                    )}
                    <div className="space-y-1">
                        <Link
                            href="/refrezing/dashboard"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-decoration-none ${
                                isRefrezingDashboardActive
                                    ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-lg shadow-cyan-600/30'
                                    : 'text-slate-300 hover:bg-[#181c3d] hover:text-white'
                            }`}
                            title="Refrezing Dashboard"
                        >
                            {isRefrezingDashboardActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"></span>
                            )}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                isRefrezingDashboardActive ? 'bg-white/20 text-white' : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                                <Snowflake className="w-4 h-4" />
                            </div>
                            {!isCollapsed && <span className="truncate">Dashboard</span>}
                        </Link>

                        <Link
                            href="/refrezing/logsheet"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-decoration-none ${
                                isRefrezingLogsheetActive
                                    ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-lg shadow-cyan-600/30'
                                    : 'text-slate-300 hover:bg-[#181c3d] hover:text-white'
                            }`}
                            title="Refrezing Logsheet Harian"
                        >
                            {isRefrezingLogsheetActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"></span>
                            )}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                isRefrezingLogsheetActive ? 'bg-white/20 text-white' : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                                <ClipboardList className="w-4 h-4" />
                            </div>
                            {!isCollapsed && <span className="truncate">Logsheet Harian</span>}
                        </Link>

                        <Link
                            href="/refrezing/history"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-decoration-none ${
                                isRefrezingHistoryActive
                                    ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-lg shadow-cyan-600/30'
                                    : 'text-slate-300 hover:bg-[#181c3d] hover:text-white'
                            }`}
                            title="Refrezing History"
                        >
                            {isRefrezingHistoryActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"></span>
                            )}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                isRefrezingHistoryActive ? 'bg-white/20 text-white' : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                                <History className="w-4 h-4" />
                            </div>
                            {!isCollapsed && <span className="truncate">History</span>}
                        </Link>
                    </div>
                </div>

                {/* ADMIN USER MANAGEMENT */}
                {isAdmin && (
                    <div>
                        {!isCollapsed && (
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Manajemen User
                            </div>
                        )}
                        <div className="space-y-1">
                            <Link
                                href="/admin/users"
                                onClick={handleItemClick}
                                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-decoration-none ${
                                    isUserAdminActive
                                        ? 'bg-gradient-to-r from-[#9333ea] to-[#a855f7] text-white shadow-lg shadow-purple-600/30'
                                        : 'text-slate-300 hover:bg-[#181c3d] hover:text-white'
                                }`}
                                title="Manajemen User"
                            >
                                {isUserAdminActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"></span>
                                )}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                    isUserAdminActive ? 'bg-white/20 text-white' : 'bg-purple-500/10 text-purple-400'
                                }`}>
                                    <Users className="w-4 h-4" />
                                </div>
                                {!isCollapsed && <span className="truncate">Manajemen User</span>}
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Anomaly Detection Widget */}
            <SidebarAnomalyWidget isCollapsed={isCollapsed} />

            {/* Footer / User / Collapse Action */}
            <div className="p-3 border-t border-[#202449] bg-[#0d0f22] space-y-2 shrink-0">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition-all text-decoration-none cursor-pointer shadow-xs justify-center sm:justify-start"
                    title="Log out"
                >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0 group-hover:text-white" />
                    {!isCollapsed && <span>Log out</span>}
                </Link>

                <div className="hidden md:block pt-0.5">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full py-1.5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#181c3d] rounded-xl transition-colors border border-transparent hover:border-[#272c5a]"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:block h-full transition-all duration-300 z-20 shrink-0 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                {renderNavContent()}
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="left" className="p-0 w-72 bg-[#10132b] border-r-0 text-white">
                    {renderNavContent()}
                </SheetContent>
            </Sheet>
        </>
    );
}

