import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function OperatorLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { url, props } = usePage();
    const operatorName = props.operatorName;

    // Determine active route
    const isLogsheet   = url.startsWith('/logsheet-operator');
    const isTerminalIQF = url === '/' || (url.startsWith('/operator') && !url.startsWith('/operator/refrezing')) || url.startsWith('/kendala');
    const isTerminalRefrezing = url.startsWith('/refrezing-kiosk');
    const isLogsheetRefrezing = url.startsWith('/logsheet-refrezing');

    const handleLogout = () => {
        router.post('/operator/logout');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative overflow-hidden pt-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50 border-b border-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Left: Logos */}
                    <div className="flex items-center gap-3 md:gap-5">
                        <img src="/images/ppa.jpg" alt="PPA Logo" className="h-9 md:h-11 object-contain drop-shadow-sm" />
                        <div className="h-6 w-px bg-slate-200"></div>
                        <img src="/images/LogoMieGacoan.png" alt="Mie Gacoan Logo" className="h-9 md:h-11 object-contain drop-shadow-sm" />
                    </div>

                    {/* Center: Navigation (Desktop) */}
                    <nav className="hidden md:flex items-center gap-6 bg-slate-50/50 px-6 py-2.5 rounded-full border border-slate-100 shadow-inner">
                        <Link 
                            href="/logsheet-operator" 
                            className={`text-[12px] font-black uppercase tracking-widest transition-all hover:scale-105 relative ${isLogsheet ? 'text-pink-500' : 'text-slate-500 hover:text-pink-500'}`}
                        >
                            Logsheet IQF
                            {isLogsheet && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-pink-500 rounded-full"></span>}
                        </Link>

                        <div className="h-4 w-px bg-slate-200"></div>

                        <Link 
                            href="/" 
                            className={`text-[12px] font-black uppercase tracking-widest transition-all hover:scale-105 relative ${isTerminalIQF ? 'text-pink-500' : 'text-slate-500 hover:text-pink-500'}`}
                        >
                            Terminal IQF
                            {isTerminalIQF && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-pink-500 rounded-full"></span>}
                        </Link>

                        <div className="h-4 w-px bg-slate-200"></div>

                        <Link 
                            href="/refrezing-kiosk" 
                            className={`text-[12px] font-black uppercase tracking-widest transition-all hover:scale-105 relative ${isTerminalRefrezing ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-500'}`}
                        >
                            Terminal Refrezing
                            {isTerminalRefrezing && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-500 rounded-full"></span>}
                        </Link>

                        <div className="h-4 w-px bg-slate-200"></div>

                        <Link 
                            href="/logsheet-refrezing" 
                            className={`text-[12px] font-black uppercase tracking-widest transition-all hover:scale-105 relative ${isLogsheetRefrezing ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-500'}`}
                        >
                            Logsheet Refrezing
                            {isLogsheetRefrezing && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-500 rounded-full"></span>}
                        </Link>
                    </nav>

                    {/* Right: Operator Info / Login Button */}
                    <div className="hidden md:flex items-center gap-3">
                        {operatorName ? (
                            <>
                                {/* Operator Name Badge */}
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-200">
                                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-[10px] font-black">
                                        {operatorName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-black text-pink-700 uppercase tracking-widest max-w-[120px] truncate">
                                        {operatorName}
                                    </span>
                                </div>
                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                    Logout
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <a 
                                href="/operator/login" 
                                className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white text-xs font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                            >
                                Login Operator
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </a>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-slate-600 hover:text-pink-500 focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl py-4 px-6 flex flex-col gap-3 animate-in slide-in-from-top-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">IQF</p>
                        <Link href="/logsheet-operator" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isLogsheet ? 'text-pink-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Logsheet IQF</Link>
                        <Link href="/" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isTerminalIQF ? 'text-pink-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Terminal IQF</Link>
                        
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Refrezing</p>
                        <Link href="/refrezing-kiosk" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isTerminalRefrezing ? 'text-cyan-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Terminal Refrezing</Link>
                        <Link href="/logsheet-refrezing" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isLogsheetRefrezing ? 'text-cyan-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Logsheet Refrezing</Link>
                        
                        {operatorName ? (
                            <div className="mt-2 flex flex-col gap-2">
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-pink-50 rounded-xl border border-pink-200">
                                    <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-black">
                                        {operatorName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-black text-pink-700">{operatorName}</span>
                                </div>
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-100 text-rose-700 text-sm font-black uppercase tracking-widest shadow-sm hover:bg-rose-200 transition-colors"
                                >
                                    Logout
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <a href="/operator/login" className="mt-2 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-black uppercase tracking-widest shadow-sm">
                                Login Operator
                            </a>
                        )}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col">
                {children}
            </main>
        </div>
    );
}
