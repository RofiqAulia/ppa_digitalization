import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, ShieldCheck, LogOut } from 'lucide-react';

export function TopNav({ setSidebarOpen }) {
    const { auth } = usePage().props;
    const user = auth?.user || { name: 'M Rofiq', role: 'admin', email: 'admin@ppa.com' };

    // Get initials (e.g. "M Rofiq" -> "MR")
    const getInitials = (name) => {
        if (!name) return 'AD';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 shadow-xs z-30 flex items-center justify-between shrink-0">
            {/* Left: Mobile Toggle & Brand */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    title="Toggle menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-cyan-500/20 shrink-0">
                        <img src="/images/ppa.jpg" alt="PPA" className="w-6 h-6 object-contain rounded-md" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm tracking-tight uppercase leading-none">
                                PPA <span className="text-cyan-600">Digitalization</span>
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Production Systems
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Pill Action Buttons (Matching Gambar 1) */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Admin Panel Pill */}
                <Link
                    href="/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all text-decoration-none"
                >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                </Link>

                {/* User Avatar Pill Badge */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-1 pr-3 rounded-full shadow-2xs">
                    <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col text-left leading-tight hidden lg:flex">
                        <span className="text-xs font-extrabold text-slate-800 truncate max-w-[100px]">
                            {user.name}
                        </span>
                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-wider">
                            {user.role || 'ADMIN'}
                        </span>
                    </div>
                </div>

                {/* Circular Pink/Red Logout Button */}
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-200/70 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </Link>
            </div>
        </header>
    );
}
