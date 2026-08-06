import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col items-center pt-6 sm:justify-center sm:pt-0 relative overflow-hidden bg-slate-100">
            {/* Background image covering main content */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: 'url("/images/bg-miegacoan.png")' }}
            >
                {/* Darker overlay for login page to make the white card pop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <Link href="/" className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/50 mb-6">
                    <img src="/images/ppa.jpg" alt="PPA Logo" className="h-10 object-contain" />
                    <img src="/images/LogoMieGacoan.png" alt="Mie Gacoan Logo" className="h-10 object-contain" />
                </Link>

                <div className="w-full sm:max-w-md mt-2 px-8 py-10 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden sm:rounded-[2rem] border border-white">
                    <h2 className="text-2xl font-black text-center text-slate-800 uppercase tracking-widest mb-6">Admin Panel</h2>
                    {children}
                </div>
            </div>
        </div>
    );
}
