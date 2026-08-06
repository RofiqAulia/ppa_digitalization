import React from 'react';
import { Link } from '@inertiajs/react';

export default function OperatorLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative overflow-hidden">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Left: Logos */}
                    <div className="flex items-center gap-4">
                        <img src="/images/ppa.jpg" alt="PPA Logo" className="h-10 object-contain" />
                        <img src="/images/LogoMieGacoan.png" alt="Mie Gacoan Logo" className="h-10 object-contain" />
                    </div>

                    {/* Center: Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/iqf-logsheet/dashboard" className="text-sm font-bold text-slate-600 hover:text-rose-600 uppercase tracking-widest transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/logsheet-iqf" className="text-sm font-bold text-slate-600 hover:text-rose-600 uppercase tracking-widest transition-colors">
                            Logsheet
                        </Link>
                        <Link href="/" className="text-sm font-bold text-rose-600 uppercase tracking-widest transition-colors">
                            Terminal
                        </Link>
                        <Link href="/iqf-logsheet/history" className="text-sm font-bold text-slate-600 hover:text-rose-600 uppercase tracking-widest transition-colors">
                            History
                        </Link>
                    </nav>

                    {/* Right: Login Button */}
                    <div>
                        <Link 
                            href="/login" 
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-200 hover:bg-cyan-300 text-slate-800 text-sm font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105"
                        >
                            Login Admin
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col">
                {children}
            </main>
        </div>
    );
}
