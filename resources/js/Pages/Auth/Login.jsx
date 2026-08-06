import React, { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [greeting, setGreeting] = useState('Selamat Datang');
    const [dayName, setDayName] = useState('Hari');

    useEffect(() => {
        const now = new Date();
        const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const hour = wibTime.getHours();
        
        let greet = 'Malam';
        if (hour >= 0 && hour < 11) greet = 'Pagi';
        else if (hour >= 11 && hour < 15) greet = 'Siang';
        else if (hour >= 15 && hour < 18) greet = 'Sore';
        
        setGreeting(`Selamat ${greet}`);

        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        setDayName(days[wibTime.getDay()]);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Halooo Insan Gacoan</h2>
                <p className="text-xs font-bold text-slate-600">{greeting}, Semoga {dayName}-mu Menyenangkan Terus</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        placeholder="Masukan Email Anda"
                        className="w-full bg-[#E51C77] text-white placeholder-pink-200 text-sm font-bold px-6 py-3.5 rounded-full border-none focus:ring-4 focus:ring-pink-300 outline-none text-center shadow-md transition-all"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-pink-500 text-xs font-bold mt-2 text-center">{errors.email}</p>}
                </div>

                <div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        placeholder="Masukkan Password Anda"
                        className="w-full bg-[#E51C77] text-white placeholder-pink-200 text-sm font-bold px-6 py-3.5 rounded-full border-none focus:ring-4 focus:ring-pink-300 outline-none text-center shadow-md transition-all"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && <p className="text-pink-500 text-xs font-bold mt-2 text-center">{errors.password}</p>}
                </div>

                <div className="mt-2">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full bg-[#8DE1F1] text-slate-800 text-sm font-black px-6 py-3.5 rounded-full shadow-md hover:bg-[#7AD5E7] transition-all focus:ring-4 focus:ring-cyan-200 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {processing ? 'Logging in...' : 'Login'}
                    </button>
                </div>

                <div className="mt-2 flex justify-center">
                    {canResetPassword && (
                        <Link
                            href="/forgot-password"
                            className="text-xs font-black text-slate-700 hover:text-pink-500 transition-colors"
                        >
                            Lupa Password
                        </Link>
                    )}
                </div>
            </form>
        </GuestLayout>
    );
}
