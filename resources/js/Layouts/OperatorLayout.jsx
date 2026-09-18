import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function OperatorLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { url, props } = usePage();
    const operatorName = props.operatorName;

    // Determine active route
    const isLogsheet   = url.startsWith('/logsheet-operator');
    const isTerminalIQF = (url === '/' || (url.startsWith('/operator') && !url.startsWith('/operator/refrezing'))) && !url.startsWith('/kendala');
    const isTerminalRefrezing = url.startsWith('/refrezing-kiosk');
    const isLogsheetRefrezing = url.startsWith('/logsheet-refrezing');
    const isKendala = url.startsWith('/kendala');

    const handleLogout = () => {
        router.post('/operator/logout');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative overflow-hidden pt-20">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50 border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
                    {/* Left: Logos */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
                        <img src="/images/ppa.jpg" alt="PPA Logo" className="h-8 sm:h-9 md:h-10 object-contain drop-shadow-sm shrink-0" />
                        <div className="h-5 sm:h-6 w-px bg-slate-200 shrink-0"></div>
                        <img src="/images/LogoMieGacoan.png" alt="Mie Gacoan Logo" className="h-8 sm:h-9 md:h-10 object-contain drop-shadow-sm shrink-0" />
                    </div>

                    {/* Center: Navigation (Desktop/Laptop lg+) */}
                    <nav className="hidden lg:flex items-center gap-2 xl:gap-4 bg-slate-50/80 px-3 py-1.5 xl:px-5 xl:py-2.5 rounded-full border border-slate-200/80 shadow-inner shrink-0">
                        <Link 
                            href="/logsheet-operator" 
                            className={`whitespace-nowrap text-[11px] xl:text-[12px] font-black uppercase tracking-wider transition-all hover:scale-105 relative ${isLogsheet ? 'text-pink-500' : 'text-slate-500 hover:text-pink-500'}`}
                        >
                            Logsheet IQF
                            {isLogsheet && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-pink-500 rounded-full"></span>}
                        </Link>

                        <div className="h-3.5 w-px bg-slate-200 shrink-0"></div>

                        <Link 
                            href="/" 
                            className={`whitespace-nowrap text-[11px] xl:text-[12px] font-black uppercase tracking-wider transition-all hover:scale-105 relative ${isTerminalIQF ? 'text-pink-500' : 'text-slate-500 hover:text-pink-500'}`}
                        >
                            Terminal IQF
                            {isTerminalIQF && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-pink-500 rounded-full"></span>}
                        </Link>

                        <div className="h-3.5 w-px bg-slate-200 shrink-0"></div>

                        <Link 
                            href="/refrezing-kiosk" 
                            className={`whitespace-nowrap text-[11px] xl:text-[12px] font-black uppercase tracking-wider transition-all hover:scale-105 relative ${isTerminalRefrezing ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-500'}`}
                        >
                            Terminal Refrezing
                            {isTerminalRefrezing && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-500 rounded-full"></span>}
                        </Link>

                        <div className="h-3.5 w-px bg-slate-200 shrink-0"></div>

                        <Link 
                            href="/logsheet-refrezing" 
                            className={`whitespace-nowrap text-[11px] xl:text-[12px] font-black uppercase tracking-wider transition-all hover:scale-105 relative ${isLogsheetRefrezing ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-500'}`}
                        >
                            Logsheet Refrezing
                            {isLogsheetRefrezing && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-cyan-500 rounded-full"></span>}
                        </Link>

                        <div className="h-3.5 w-px bg-slate-200 shrink-0"></div>

                        <Link 
                            href="/kendala" 
                            className={`whitespace-nowrap text-[11px] xl:text-[12px] font-black uppercase tracking-wider transition-all hover:scale-105 relative flex items-center gap-1.5 ${isKendala ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'}`}
                        >
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                            Lintasan Kendala
                            {isKendala && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-rose-600 rounded-full"></span>}
                        </Link>
                    </nav>

                    {/* Right: Operator Info / Login Button */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
                        {operatorName ? (
                            <>
                                {/* Operator Name Badge */}
                                <div className="flex items-center gap-2 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full bg-pink-50 border border-pink-200 shrink-0">
                                    <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                        {operatorName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[11px] xl:text-xs font-black text-pink-700 uppercase tracking-wider max-w-[90px] xl:max-w-[130px] truncate">
                                        {operatorName}
                                    </span>
                                </div>
                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="group flex items-center gap-1.5 px-3 py-1.5 xl:px-5 xl:py-2.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 text-[11px] xl:text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95 shrink-0"
                                >
                                    Logout
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <a 
                                href="/operator/login" 
                                className="group flex items-center gap-2 px-4 py-2 xl:px-6 xl:py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white text-[11px] xl:text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 shrink-0"
                            >
                                Login Operator
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </a>
                        )}
                    </div>

                    {/* Mobile & Tablet Menu Toggle Button (lg:hidden) */}
                    <button 
                        className="lg:hidden p-2 text-slate-600 hover:text-pink-500 focus:outline-none shrink-0"
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
                    <div className="lg:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl py-4 px-6 flex flex-col gap-3 animate-in slide-in-from-top-2 z-50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">IQF</p>
                        <Link href="/logsheet-operator" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isLogsheet ? 'text-pink-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Logsheet IQF</Link>
                        <Link href="/" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isTerminalIQF ? 'text-pink-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Terminal IQF</Link>
                        
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Refrezing</p>
                        <Link href="/refrezing-kiosk" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isTerminalRefrezing ? 'text-cyan-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Terminal Refrezing</Link>
                        <Link href="/logsheet-refrezing" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 ${isLogsheetRefrezing ? 'text-cyan-500' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>Logsheet Refrezing</Link>
                        
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mt-1">Kendala</p>
                        <Link href="/kendala" className={`text-sm font-black uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center justify-between ${isKendala ? 'text-rose-600' : 'text-slate-600'}`} onClick={() => setIsMobileMenuOpen(false)}>
                            <span>Lintasan Kendala</span>
                            <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">⚠️</span>
                        </Link>
                        
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
