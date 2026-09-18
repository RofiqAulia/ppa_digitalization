import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, FileText, History, Snowflake, ClipboardList, Users, LogOut, PanelLeftClose, PanelLeftOpen, Layers
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
        <div className="flex flex-col h-full bg-[#1a2035] text-white shadow-2xl select-none border-r border-slate-800">
            {/* Header / Brand */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-[#151a2d] shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex items-center shrink-0 gap-2 bg-white/10 p-1.5 rounded-lg border border-white/10">
                        <img src="/images/ppa.jpg" alt="PPA" className="rounded h-7 w-auto object-contain" />
                        <div className="h-5 w-px bg-white/20"></div>
                        <img src="/images/LogoMieGacoan.png" alt="Gacoan" className="h-7 w-auto object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div className="text-left leading-tight truncate">
                            <div className="font-bold text-white text-xs tracking-tight truncate">
                                PPA Digitalization
                            </div>
                            <div className="text-[10px] text-indigo-300 font-semibold opacity-90 truncate">
                                Production Division
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Navigation Links */}
            <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5 custom-scrollbar">
                
                {/* IQF SECTION */}
                <div>
                    {!isCollapsed && (
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-1.5">
                            IQF
                        </div>
                    )}
                    <div className="space-y-1">
                        <Link
                            href="/dashboard"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                isIqfDashboardActive
                                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                            title="IQF Dashboard"
                        >
                            {isIqfDashboardActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-300 rounded-r-full"></span>
                            )}
                            <LayoutDashboard className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isIqfDashboardActive ? 'text-white' : 'text-indigo-400'}`} />
                            {!isCollapsed && <span className="truncate">Dashboard</span>}
                        </Link>

                        <Link
                            href="/logsheet-iqf"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                isIqfLogsheetActive
                                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                            title="IQF Logsheet Harian"
                        >
                            {isIqfLogsheetActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-300 rounded-r-full"></span>
                            )}
                            <FileText className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isIqfLogsheetActive ? 'text-white' : 'text-indigo-400'}`} />
                            {!isCollapsed && <span className="truncate">Logsheet Harian</span>}
                        </Link>

                        <Link
                            href="/iqf-logsheet/history"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                isIqfHistoryActive
                                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                            title="IQF History"
                        >
                            {isIqfHistoryActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-300 rounded-r-full"></span>
                            )}
                            <History className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isIqfHistoryActive ? 'text-white' : 'text-indigo-400'}`} />
                            {!isCollapsed && <span className="truncate">History</span>}
                        </Link>
                    </div>
                </div>

                {/* REFREZING SECTION */}
                <div>
                    {!isCollapsed && (
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-1.5">
                            IQF Refrezing
                        </div>
                    )}
                    <div className="space-y-1">
                        <Link
                            href="/refrezing/dashboard"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                isRefrezingDashboardActive
                                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                            title="Refrezing Dashboard"
                        >
                            {isRefrezingDashboardActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-300 rounded-r-full"></span>
                            )}
                            <Snowflake className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isRefrezingDashboardActive ? 'text-white' : 'text-cyan-400'}`} />
                            {!isCollapsed && <span className="truncate">Dashboard</span>}
                        </Link>

                        <Link
                            href="/refrezing/logsheet"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                isRefrezingLogsheetActive
                                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                            title="Refrezing Logsheet Harian"
                        >
                            {isRefrezingLogsheetActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-300 rounded-r-full"></span>
                            )}
                            <ClipboardList className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isRefrezingLogsheetActive ? 'text-white' : 'text-cyan-400'}`} />
                            {!isCollapsed && <span className="truncate">Logsheet Harian</span>}
                        </Link>

                        <Link
                            href="/refrezing/history"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                isRefrezingHistoryActive
                                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                            title="Refrezing History"
                        >
                            {isRefrezingHistoryActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-300 rounded-r-full"></span>
                            )}
                            <History className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isRefrezingHistoryActive ? 'text-white' : 'text-cyan-400'}`} />
                            {!isCollapsed && <span className="truncate">History</span>}
                        </Link>
                    </div>
                </div>

                {/* PREPARE PRODUKSI SECTION */}
                <div>
                    {!isCollapsed && (
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-1.5">
                            Perencanaan
                        </div>
                    )}
                    {/* <div className="space-y-1">
                        <Link
                            href="/prepare-produksi"
                            onClick={handleItemClick}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                isPrepareProduksiActive
                                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                            title="Prepare Produksi"
                        >
                            {isPrepareProduksiActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-300 rounded-r-full"></span>
                            )}
                            <Layers className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isPrepareProduksiActive ? 'text-white' : 'text-emerald-400'}`} />
                            {!isCollapsed && <span className="truncate">Prepare Produksi</span>}
                        </Link>
                    </div> */}
                </div>

                {/* ADMIN USER MANAGEMENT */}
                {isAdmin && (
                    <div>
                        {!isCollapsed && (
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-1.5">
                                Manajemen User
                            </div>
                        )}
                        <div className="space-y-1">
                            <Link
                                href="/admin/users"
                                onClick={handleItemClick}
                                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-decoration-none ${
                                    isUserAdminActive
                                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                }`}
                                title="Manajemen User"
                            >
                                {isUserAdminActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-300 rounded-r-full"></span>
                                )}
                                <Users className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isUserAdminActive ? 'text-white' : 'text-purple-400'}`} />
                                {!isCollapsed && <span className="truncate">Manajemen User</span>}
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / User / Collapse Action */}
            <div className="p-3 border-t border-slate-800/80 bg-[#151a2d] space-y-2 shrink-0">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-decoration-none cursor-pointer"
                    title="Log out"
                >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    {!isCollapsed && <span>Log out</span>}
                </Link>

                <div className="hidden md:block pt-1">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full py-1.5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
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
                <SheetContent side="left" className="p-0 w-72 bg-[#1a2035] border-r-0 text-white">
                    {renderNavContent()}
                </SheetContent>
            </Sheet>
        </>
    );
}

