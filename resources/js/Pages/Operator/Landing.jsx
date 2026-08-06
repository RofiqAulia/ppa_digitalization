import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import axios from 'axios';

// Helper functions for shift/date
const getCurrentShiftAndDate = () => {
    const now = new Date();
    const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const hour = wib.getHours();

    let shift, date;
    if (hour >= 6 && hour < 14) {
        shift = 1;
        date  = wib.toISOString().slice(0, 10);
    } else if (hour >= 14 && hour < 22) {
        shift = 2;
        date  = wib.toISOString().slice(0, 10);
    } else if (hour >= 22) {
        shift = 3;
        date  = wib.toISOString().slice(0, 10);
    } else {
        shift = 3;
        const prev = new Date(wib);
        prev.setDate(prev.getDate() - 1);
        date = prev.toISOString().slice(0, 10);
    }
    return { shift, date };
};

const readLastRakSafe = (machine, product) => {
    const rakKey      = `iqf_lastRak_${machine}_${product}`;
    const rakDateKey  = `iqf_lastRakDate_${machine}_${product}`;
    const rakShiftKey = `iqf_lastRakShift_${machine}_${product}`;

    const savedRak   = localStorage.getItem(rakKey)   || '';
    const savedDate  = localStorage.getItem(rakDateKey)  || '';
    const savedShift = localStorage.getItem(rakShiftKey) || '';

    if (!savedRak) return '';

    const { shift: curShift, date: curDate } = getCurrentShiftAndDate();

    if (savedDate !== curDate || savedShift !== String(curShift)) {
        localStorage.removeItem(rakKey);
        localStorage.removeItem(rakDateKey);
        localStorage.removeItem(rakShiftKey);
        return '';
    }
    return savedRak;
};

const saveLastRak = (machine, product, rak) => {
    const { shift, date } = getCurrentShiftAndDate();
    localStorage.setItem(`iqf_lastRak_${machine}_${product}`,      String(rak));
    localStorage.setItem(`iqf_lastRakDate_${machine}_${product}`,  date);
    localStorage.setItem(`iqf_lastRakShift_${machine}_${product}`, String(shift));
};

export default function Landing() {
    const products = ['siomay', 'pentol', 'lumpia', 'adonan_pangsit'];
    const machines = ['IQF 1', 'IQF 2'];

    const [product, setProduct] = useState(products[0]);
    const [machine, setMachine] = useState(machines[0]);
    const [batchNumber, setBatchNumber] = useState('');
    const [rak, setRak] = useState('');
    const [trayCount, setTrayCount] = useState('');
    const [lastRak, setLastRak] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', title: '', message: '' });
    
    // Load state from local storage on mount
    useEffect(() => {
        const savedProduct = localStorage.getItem('iqf_product');
        const savedMachine = localStorage.getItem('iqf_machine');
        if (savedProduct && products.includes(savedProduct)) setProduct(savedProduct);
        if (savedMachine && machines.includes(savedMachine)) setMachine(savedMachine);

        if (savedProduct && savedMachine) {
            const savedRak = readLastRakSafe(savedMachine, savedProduct);
            setLastRak(savedRak);
            setRak(savedRak);

            const batchKey = `iqf_lastBatch_${savedMachine}_${savedProduct}`;
            setBatchNumber(localStorage.getItem(batchKey) || '');
        }
    }, []);

    // When product/machine change, reload last inputs
    useEffect(() => {
        if (product && machine) {
            localStorage.setItem('iqf_product', product);
            localStorage.setItem('iqf_machine', machine);

            const savedRak = readLastRakSafe(machine, product);
            setLastRak(savedRak);
            setRak(savedRak);

            const batchKey = `iqf_lastBatch_${machine}_${product}`;
            setBatchNumber(localStorage.getItem(batchKey) || '');
        }
    }, [product, machine]);

    const showNotification = (type, title, message) => {
        setToast({ show: true, type, title, message });
        setTimeout(() => setToast({ show: false, type: '', title: '', message: '' }), 3000);
    };

    const isPackItem = product === 'lumpia' || product === 'adonan_pangsit';

    const submitData = async () => {
        if (loading || !trayCount || trayCount <= 0 || (!isPackItem && !rak)) {
            showNotification('error', 'Gagal', isPackItem ? 'Jumlah harus diisi dengan benar' : 'Rak dan Jumlah harus diisi dengan benar');
            return;
        }
        if (!batchNumber) {
            showNotification('error', 'Gagal', 'No. Batch harus diisi');
            return;
        }

        if (!isPackItem && lastRak !== '' && parseInt(rak) < parseInt(lastRak)) {
            showNotification(
                'error',
                '⛔ Rak Tidak Valid',
                `Rak ${rak} lebih kecil dari Rak terakhir (${lastRak}). Input harus ≥ Rak ${lastRak}.`
            );
            return;
        }

        setLoading(true);
        try {
            await axios.post('/iqf-kiosk/store', {
                product_type: product, machine, batch_number: batchNumber, rak: isPackItem ? null : rak, tray_count: trayCount,
            });
            showNotification('success', 'Berhasil Dicatat!', isPackItem ? `${trayCount} dimasukkan.` : `Rak ${rak} - ${trayCount} dimasukkan.`);

            if (!isPackItem && (lastRak === '' || parseInt(rak) >= parseInt(lastRak))) {
                setLastRak(String(rak));
                saveLastRak(machine, product, rak);
            }
            localStorage.setItem(`iqf_lastBatch_${machine}_${product}`, String(batchNumber));
            setTrayCount('');
        } catch (error) {
            showNotification('error', 'Gagal Mencatat', error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <OperatorLayout>
            <Head title="Operator Terminal" />
            
            {/* Background image covering main content */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: 'url("/images/bg-miegacoan.png")' }}
            >
                {/* Light overlay for readability */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center pt-8 pb-16 px-4">
                
                {/* Title and Dropdowns */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-1">Pilihan Dimsum</h2>
                    <p className="text-sm font-semibold text-slate-700">Pilih jenis produk dan mesin sebelum memulai pencatatan.</p>
                </div>

                <div className="flex bg-white/80 backdrop-blur-md rounded-xl shadow-md overflow-hidden mb-12 max-w-md w-full border border-white/50">
                    <div className="flex-1 border-r border-slate-200">
                        <select 
                            value={product} 
                            onChange={e => setProduct(e.target.value)}
                            className="w-full bg-rose-500 text-white font-bold text-sm uppercase px-4 py-4 appearance-none outline-none text-center cursor-pointer hover:bg-rose-600 transition-colors"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
                        >
                            {products.map(p => (
                                <option key={p} value={p}>{p.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <select 
                            value={machine} 
                            onChange={e => setMachine(e.target.value)}
                            className="w-full bg-cyan-200 text-slate-800 font-bold text-sm uppercase px-4 py-4 appearance-none outline-none text-center cursor-pointer hover:bg-cyan-300 transition-colors"
                        >
                            {machines.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Inputs Card Row */}
                <div className={`grid gap-6 w-full max-w-4xl mb-8 ${isPackItem ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {/* No. Batch */}
                    <div className="bg-white rounded-[2rem] border border-rose-100 shadow-xl p-8 flex flex-col items-center">
                        <label className="text-slate-500 font-bold uppercase text-sm mb-6 tracking-widest">No. Batch</label>
                        <input
                            type="number"
                            value={batchNumber}
                            onChange={e => setBatchNumber(e.target.value)}
                            className="w-full text-center text-4xl font-black text-slate-800 border-none rounded-xl focus:ring-0 p-2 placeholder-slate-200 outline-none"
                            placeholder="0"
                        />
                    </div>

                    {/* No. Rak */}
                    {!isPackItem && (
                    <div className="bg-white rounded-[2rem] border border-rose-100 shadow-xl p-8 flex flex-col items-center">
                        <label className="text-slate-500 font-bold uppercase text-sm mb-6 tracking-widest">No. Rak</label>
                        <input
                            type="number"
                            value={rak}
                            onChange={e => setRak(e.target.value)}
                            className="w-full text-center text-4xl font-black text-slate-800 border-none rounded-xl focus:ring-0 p-2 placeholder-slate-200 outline-none"
                            placeholder="0"
                        />
                        {lastRak !== '' && (
                            <p className="text-center text-xs font-bold mt-2 text-rose-500">Min: {lastRak} ↑</p>
                        )}
                    </div>
                    )}

                    {/* Jumlah Loyang */}
                    <div className="bg-white rounded-[2rem] border border-rose-100 shadow-xl p-8 flex flex-col items-center">
                        <label className="text-slate-500 font-bold uppercase text-sm mb-6 tracking-widest">
                            Jumlah {isPackItem ? 'Keranjang' : 'Loyang'}
                        </label>
                        <input
                            type="number"
                            value={trayCount}
                            onChange={e => setTrayCount(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitData()}
                            className="w-full text-center text-4xl font-black text-slate-800 border-none rounded-xl focus:ring-0 p-2 placeholder-slate-200 outline-none"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    onClick={submitData} 
                    disabled={loading || !trayCount || trayCount <= 0}
                    className="bg-white border-2 border-rose-500 text-rose-600 font-black text-lg py-4 px-12 rounded-full uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-lg disabled:opacity-50"
                >
                    {loading ? 'Mencatat...' : 'Lanjutkan Pencatatan'}
                </button>
            </div>

            {/* Divider and Lintasan Kendala (Positioned at bottom) */}
            <div className="relative z-10 w-full bg-white border-t border-rose-200 py-6 px-4">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
                    <p className="text-slate-500 font-black text-sm uppercase tracking-widest">
                        Klik Disini<br/>*Jika Terjadi Kendala!
                    </p>
                    <button 
                        onClick={() => router.visit('/kendala')}
                        className="bg-rose-600 text-white font-black text-sm py-3 px-8 rounded-full uppercase tracking-widest flex items-center gap-2 hover:bg-rose-700 shadow-md transition-colors"
                    >
                        Lintasan Kendala <span className="bg-amber-300 text-amber-900 rounded-sm w-4 h-4 flex items-center justify-center text-[10px] transform rotate-45">!</span>
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-10">
                    <div className={`px-6 py-4 rounded-2xl shadow-xl border-2 flex items-center gap-4 bg-white ${toast.type === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'}`}>
                        <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white font-black text-sm`}>
                            {toast.type === 'success' ? '✓' : '✕'}
                        </div>
                        <div>
                            <h4 className="font-black text-lg uppercase tracking-wider">{toast.title}</h4>
                            <p className="text-sm font-semibold opacity-80">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </OperatorLayout>
    );
}
