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
    if (hour >= 8 && hour < 16) {
        shift = 1;
        date  = wib.toISOString().slice(0, 10);
    } else if (hour >= 16 && hour <= 23) {
        shift = 2;
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
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-[0.2em] mb-3 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)] [-webkit-text-stroke:1px_white]">Pilihan Dimsum (IQF)</h2>
                    <p className="text-base font-black text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] [-webkit-text-stroke:0.5px_white]">Pilih jenis produk dan mesin sebelum memulai pencatatan.</p>
                </div>

                <div className="flex bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden mb-12 max-w-md w-full border-2 border-pink-500/50 p-1">
                    <div className="flex-1">
                        <select 
                            value={product} 
                            onChange={e => setProduct(e.target.value)}
                            className="w-full bg-pink-500 text-white font-black text-sm uppercase px-4 py-4 rounded-[1.8rem] appearance-none outline-none text-center cursor-pointer hover:bg-pink-600 transition-all shadow-md"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1em top 50%', backgroundSize: '.65em auto' }}
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
                            className="w-full bg-transparent text-slate-700 font-black text-sm uppercase px-4 py-4 appearance-none outline-none text-center cursor-pointer hover:bg-slate-50 transition-all rounded-[1.8rem]"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1em top 50%', backgroundSize: '.65em auto' }}
                        >
                            {machines.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Inputs Card Row */}
                <div className="grid gap-2 md:gap-6 w-full max-w-5xl mb-6 md:mb-12 grid-cols-3">
                    {/* No. Batch */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border-2 border-pink-400 shadow-xl shadow-pink-500/20 p-3 md:p-8 flex flex-col items-center transform transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/40 relative overflow-hidden group">
                        <label className="text-slate-500 font-black uppercase text-[9px] md:text-xs mb-2 md:mb-6 tracking-widest md:tracking-[0.2em] flex flex-col md:flex-row items-center gap-1 md:gap-2 text-center text-wrap leading-tight">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-500 animate-pulse"></span>
                            No. Batch
                        </label>
                        <input
                            type="number"
                            value={batchNumber}
                            onChange={e => setBatchNumber(e.target.value)}
                            className="w-full text-center text-3xl md:text-6xl font-black text-pink-600 border-none bg-transparent focus:ring-0 p-1 md:p-2 placeholder-pink-200 outline-none"
                            placeholder="0"
                        />
                    </div>

                    {/* No. Rak */}
                    <div className={`bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 p-3 md:p-8 flex flex-col items-center transform transition-all relative overflow-hidden group ${isPackItem ? 'opacity-50 pointer-events-none grayscale' : 'hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/40'}`}>
                        <label className="text-slate-500 font-black uppercase text-[9px] md:text-xs mb-2 md:mb-6 tracking-widest md:tracking-[0.2em] flex flex-col md:flex-row items-center gap-1 md:gap-2 text-center text-wrap leading-tight">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                            No. Rak
                        </label>
                        <input
                            type="number"
                            value={isPackItem ? '' : rak}
                            onChange={e => setRak(e.target.value)}
                            disabled={isPackItem}
                            className="w-full text-center text-3xl md:text-6xl font-black text-cyan-600 border-none bg-transparent focus:ring-0 p-1 md:p-2 placeholder-cyan-200 outline-none"
                            placeholder={isPackItem ? "-" : "0"}
                        />

                    </div>

                    {/* Jumlah Loyang */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border-2 border-pink-400 shadow-xl shadow-pink-500/20 p-3 md:p-8 flex flex-col items-center transform transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/40 relative overflow-hidden group">
                        <label className="text-slate-500 font-black uppercase text-[9px] md:text-xs mb-2 md:mb-6 tracking-widest md:tracking-[0.2em] flex flex-col md:flex-row items-center gap-1 md:gap-2 text-center leading-tight">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-500 animate-pulse"></span>
                            Jml <span className="hidden md:inline"> {isPackItem ? 'Keranjang' : 'Loyang'}</span>
                            <span className="md:hidden"> {isPackItem ? 'Pack' : 'Loyng'}</span>
                        </label>
                        <input
                            type="number"
                            value={trayCount}
                            onChange={e => setTrayCount(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitData()}
                            className="w-full text-center text-3xl md:text-6xl font-black text-pink-600 border-none bg-transparent focus:ring-0 p-1 md:p-2 placeholder-pink-200 outline-none"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    onClick={submitData} 
                    disabled={loading || !trayCount || trayCount <= 0}
                    className="w-full md:w-auto bg-white/90 backdrop-blur-md border-2 border-pink-500 text-pink-500 font-black text-sm py-4 px-12 rounded-full uppercase tracking-[0.2em] hover:bg-pink-500 hover:text-white transition-all shadow-xl hover:shadow-pink-500/30 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-pink-500"
                >
                    {loading ? 'Mencatat...' : 'Lanjutkan Pencatatan'}
                </button>
            </div>

            {/* Floating Action Button for Kendala */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 group cursor-pointer" onClick={() => router.visit('/kendala')}>
                <p className="text-slate-700 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg font-black text-xs uppercase tracking-widest text-right opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                    Klik Disini<br/><span className="text-pink-500">*Jika Terjadi Kendala!</span>
                </p>
                <button 
                    className="bg-[#E51C77] text-white font-black text-sm py-4 px-8 rounded-full uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-pink-600 shadow-xl shadow-pink-500/40 hover:shadow-pink-500/60 hover:-translate-y-1 transition-all"
                >
                    Lintasan Kendala 
                    <span className="bg-amber-400 text-amber-900 rounded-sm w-5 h-5 flex items-center justify-center text-[12px] transform rotate-45 shadow-inner shadow-amber-600/50">!</span>
                </button>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex justify-center z-[60] animate-in slide-in-from-bottom-10">
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
