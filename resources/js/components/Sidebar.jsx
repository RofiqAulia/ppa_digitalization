import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    CSidebar, CSidebarHeader, CSidebarBrand, CSidebarNav, CNavTitle, CNavItem, CSidebarFooter, CSidebarToggler
} from '@coreui/react';
import {
    LayoutDashboard, FileText, History, Snowflake, ClipboardList, Users, LogOut
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
    const { url, props } = usePage();
    const isAdmin = props.auth?.user?.role === 'admin';

    const renderContent = () => (
        <CSidebar className="h-full bg-[#1a2035] text-white shadow-xl border-r border-slate-800" unfoldable={isCollapsed}>
            <CSidebarHeader className="border-b border-slate-800 px-4 py-3">
                <CSidebarBrand className="flex items-center gap-2 text-decoration-none">
                    <div className="flex items-center shrink-0 gap-2">
                        <img src="/images/ppa.jpg" alt="PPA" className="rounded h-8 w-auto" />
                        <img src="/images/LogoMieGacoan.png" alt="Gacoan" className="h-8 w-auto object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div className="text-left ml-2">
                            <div className="font-bold text-white text-xs tracking-tight leading-tight">
                                PPA Digitalization
                            </div>
                            <div className="text-[10px] text-indigo-300 opacity-75 font-semibold">
                                Production Division
                            </div>
                        </div>
                    )}
                </CSidebarBrand>
            </CSidebarHeader>

            <CSidebarNav className="py-2 px-2 space-y-1">
                {/* IQF SECTION */}
                <CNavTitle className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mt-3 mb-1">
                    IQF
                </CNavTitle>
                <CNavItem
                    as={Link}
                    href="/dashboard"
                    active={url === '/dashboard' || url === '/'}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-decoration-none ${
                        url === '/dashboard' || url === '/'
                            ? 'bg-indigo-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <LayoutDashboard className="w-4 h-4 text-indigo-300 shrink-0" />
                    {!isCollapsed && <span>Dashboard</span>}
                </CNavItem>
                <CNavItem
                    as={Link}
                    href="/logsheet-iqf"
                    active={url.startsWith('/logsheet-iqf')}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-decoration-none ${
                        url.startsWith('/logsheet-iqf')
                            ? 'bg-indigo-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <FileText className="w-4 h-4 text-indigo-300 shrink-0" />
                    {!isCollapsed && <span>Logsheet Harian</span>}
                </CNavItem>
                <CNavItem
                    as={Link}
                    href="/iqf-logsheet/history"
                    active={url.startsWith('/iqf-logsheet/history')}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-decoration-none ${
                        url.startsWith('/iqf-logsheet/history')
                            ? 'bg-indigo-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <History className="w-4 h-4 text-indigo-300 shrink-0" />
                    {!isCollapsed && <span>History</span>}
                </CNavItem>

                {/* REFREZING SECTION */}
                <CNavTitle className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mt-4 mb-1">
                    IQF Refrezing
                </CNavTitle>
                <CNavItem
                    as={Link}
                    href="/refrezing/dashboard"
                    active={url.startsWith('/refrezing/dashboard')}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-decoration-none ${
                        url.startsWith('/refrezing/dashboard')
                            ? 'bg-cyan-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <Snowflake className="w-4 h-4 text-cyan-300 shrink-0" />
                    {!isCollapsed && <span>Dashboard</span>}
                </CNavItem>
                <CNavItem
                    as={Link}
                    href="/refrezing/logsheet"
                    active={url.startsWith('/refrezing/logsheet')}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-decoration-none ${
                        url.startsWith('/refrezing/logsheet')
                            ? 'bg-cyan-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <ClipboardList className="w-4 h-4 text-cyan-300 shrink-0" />
                    {!isCollapsed && <span>Logsheet Harian</span>}
                </CNavItem>
                <CNavItem
                    as={Link}
                    href="/refrezing/history"
                    active={url.startsWith('/refrezing/history')}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-decoration-none ${
                        url.startsWith('/refrezing/history')
                            ? 'bg-cyan-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <History className="w-4 h-4 text-cyan-300 shrink-0" />
                    {!isCollapsed && <span>History</span>}
                </CNavItem>

                {/* ADMIN USER MANAGEMENT */}
                {isAdmin && (
                    <>
                        <CNavTitle className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mt-4 mb-1">
                            Manajemen User
                        </CNavTitle>
                        <CNavItem
                            as={Link}
                            href="/admin/users"
                            active={url.startsWith('/admin/users')}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-decoration-none ${
                                url.startsWith('/admin/users')
                                    ? 'bg-purple-600 text-white font-bold shadow'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Users className="w-4 h-4 text-purple-300 shrink-0" />
                            {!isCollapsed && <span>Add User</span>}
                        </CNavItem>
                    </>
                )}

                {/* LOG OUT */}
                <CNavItem
                    as={Link}
                    href="/logout"
                    method="post"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-rose-300 hover:bg-rose-900/40 hover:text-rose-100 rounded-lg transition-colors mt-4 text-decoration-none cursor-pointer"
                >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    {!isCollapsed && <span>Log out</span>}
                </CNavItem>
            </CSidebarNav>

            <CSidebarFooter className="border-t border-slate-800 hidden md:flex items-center justify-center p-2">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full py-1.5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <CSidebarToggler />
                </button>
            </CSidebarFooter>
        </CSidebar>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:block h-full transition-all duration-300 z-20 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                {renderContent()}
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="left" className="p-0 w-72 bg-[#1a2035] border-r-0">
                    {renderContent()}
                </SheetContent>
            </Sheet>
        </>
    );
}
