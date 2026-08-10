import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function OperatorLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/operator/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Operator Login" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Masuk Terminal Operator
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Silakan masukkan email Anda untuk mencatat produksi
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border-t-8 border-pink-500">
                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-black tracking-wider uppercase text-slate-700">
                                Alamat Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm font-medium"
                                    placeholder="operator@example.com"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 font-bold" id="email-error">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black uppercase tracking-widest text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Memproses...' : 'Masuk Terminal'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-6 text-center">
                         {/* <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                            Kembali ke Halaman Awal
                        </Link> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
