import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Lupa Password?</h2>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Tidak masalah. Cukup beri tahu kami alamat email Anda dan kami akan mengirimkan tautan reset password yang memungkinkan Anda membuat password baru.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-black text-emerald-600 text-center bg-emerald-50 py-3 rounded-2xl border border-emerald-100">
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
                        placeholder="Masukkan Email Anda"
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
                        {processing ? 'Mengirim...' : 'Kirim Link Reset'}
                    </button>
                </div>
                
                <div className="mt-4 flex justify-center">
                    <a href="/login" className="text-xs font-black text-slate-500 hover:text-pink-500 transition-colors uppercase tracking-widest">
                        Kembali ke Login
                    </a>
                </div>
            </form>
        </GuestLayout>
    );
}
