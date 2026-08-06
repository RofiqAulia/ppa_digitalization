import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* Left Side: Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative z-10 bg-white">
                <Link href="/" className="flex items-center gap-4 mb-8">
                    <img src="/images/ppa.jpg" alt="PPA Logo" className="h-10 md:h-12 object-contain" />
                    <img src="/images/LogoMieGacoan.png" alt="Mie Gacoan Logo" className="h-10 md:h-12 object-contain" />
                </Link>
                
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>

            {/* Right Side: Background Image */}
            <div className="hidden lg:block lg:w-1/2 relative border-l-4 border-[#8DE1F1]">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url("/images/bg-miegacoan.png")' }}
                ></div>
            </div>
        </div>
    );
}
