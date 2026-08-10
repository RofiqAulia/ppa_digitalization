import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function OperatorLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
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
        post('/operator/login');
    };

    return (
        <GuestLayout>
            <Head title="Login Operator" />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Halooo Insan Gacoan</h2>
                <p className="text-xs font-bold text-slate-600">{greeting}, Semoga {dayName}-mu Menyenangkan Terus</p>
                <p className="mt-3 text-[11px] font-black text-pink-500 uppercase tracking-widest">Terminal Operator</p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        placeholder="Masukkan Email Operator"
                        className="w-full bg-[#E51C77] text-white placeholder-pink-200 text-sm font-bold px-6 py-3.5 rounded-full border-none focus:ring-4 focus:ring-pink-300 outline-none text-center shadow-md transition-all"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-pink-500 text-xs font-bold mt-2 text-center">{errors.email}</p>}
                </div>

                <div className="mt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#8DE1F1] text-slate-800 text-sm font-black px-6 py-3.5 rounded-full shadow-md hover:bg-[#7AD5E7] transition-all focus:ring-4 focus:ring-cyan-200 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {processing ? 'Memproses...' : 'Masuk Terminal'}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Hanya email terdaftar yang dapat masuk
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
