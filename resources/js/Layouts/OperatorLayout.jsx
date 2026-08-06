import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function OperatorLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    <nav className="hidden md:flex items-center gap-8 bg-slate-50/50 px-8 py-2.5 rounded-full border border-slate-100 shadow-inner">
                        <Link href="/iqf-logsheet/dashboard" className="text-[13px] font-black text-slate-500 hover:text-pink-500 uppercase tracking-widest transition-all hover:scale-105">
                            Dashboard
                        </Link>
                        <Link href="/logsheet-iqf" className="text-[13px] font-black text-slate-500 hover:text-pink-500 uppercase tracking-widest transition-all hover:scale-105">
                            Logsheet
                        </Link>
                        <Link href="/" className="text-[13px] font-black text-pink-500 uppercase tracking-widest transition-all hover:scale-105 relative">
                            Terminal
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-pink-500 rounded-full"></span>
                        </Link>
                        <Link href="/iqf-logsheet/history" className="text-[13px] font-black text-slate-500 hover:text-pink-500 uppercase tracking-widest transition-all hover:scale-105">
                            History
                        </Link>
                    </nav>

                    {/* Right: Login Button (Desktop) */}
                    <div className="hidden md:block">
                        {/* We use an anchor tag <a> instead of <Link> for login just in case it's a completely separate layout boundary or session reset */}
                        <a 
                            href="/login" 
                            className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-slate-900 text-xs font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                            Login Admin
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </a>
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
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                        <Link href="/iqf-logsheet/dashboard" className="text-sm font-black text-slate-600 uppercase tracking-widest border-b border-slate-50 pb-2">Dashboard</Link>
                        <Link href="/logsheet-iqf" className="text-sm font-black text-slate-600 uppercase tracking-widest border-b border-slate-50 pb-2">Logsheet</Link>
                        <Link href="/" className="text-sm font-black text-pink-500 uppercase tracking-widest border-b border-slate-50 pb-2">Terminal</Link>
                        <Link href="/iqf-logsheet/history" className="text-sm font-black text-slate-600 uppercase tracking-widest border-b border-slate-50 pb-2">History</Link>
                        
                        <a href="/login" className="mt-2 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-300 text-slate-900 text-sm font-black uppercase tracking-widest shadow-sm">
                            Login Admin
                        </a>
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
