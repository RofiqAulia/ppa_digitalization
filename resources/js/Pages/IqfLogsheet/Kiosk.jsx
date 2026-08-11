import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const KENDALA_LIST = [
    { label: 'Trouble Kipas',   icon: '🌀' },
    { label: 'Trouble Sensor',  icon: '📡' },
    { label: 'Tunggu Dimsum',   icon: '⏳' },
    { label: 'Temperatur Naik', icon: '🌡️' },
    { label: 'Conveyor Mati',   icon: '🔧' },
    { label: 'Lain-lain',       icon: '📝' },
];

// Helper: dapatkan shift dan tanggal saat ini (mirror logika backend)
const getCurrentShiftAndDate = () => {
    const now = new Date();
    // Gunakan waktu Asia/Jakarta
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
        // 00:00–05:59 masih Shift 3 hari sebelumnya
        shift = 3;
        const prev = new Date(wib);
        prev.setDate(prev.getDate() - 1);
        date = prev.toISOString().slice(0, 10);
    }
    return { shift, date };
};

// Helper: baca lastRak dari localStorage, reset jika tanggal/shift berbeda
const readLastRakSafe = (machine, product) => {
    const rakKey      = `iqf_lastRak_${machine}_${product}`;
    const rakDateKey  = `iqf_lastRakDate_${machine}_${product}`;
    const rakShiftKey = `iqf_lastRakShift_${machine}_${product}`;

    const savedRak   = localStorage.getItem(rakKey)   || '';
    const savedDate  = localStorage.getItem(rakDateKey)  || '';
    const savedShift = localStorage.getItem(rakShiftKey) || '';

    if (!savedRak) return '';

    const { shift: curShift, date: curDate } = getCurrentShiftAndDate();

    // Jika tanggal atau shift berbeda → reset lastRak
    if (savedDate !== curDate || savedShift !== String(curShift)) {
        localStorage.removeItem(rakKey);
        localStorage.removeItem(rakDateKey);
        localStorage.removeItem(rakShiftKey);
        return '';
    }

    return savedRak;
};

// Helper: simpan lastRak beserta konteks tanggal+shift
const saveLastRak = (machine, product, rak) => {
    const { shift, date } = getCurrentShiftAndDate();
    localStorage.setItem(`iqf_lastRak_${machine}_${product}`,      String(rak));
    localStorage.setItem(`iqf_lastRakDate_${machine}_${product}`,  date);
    localStorage.setItem(`iqf_lastRakShift_${machine}_${product}`, String(shift));
};

export default function Kiosk() {
    const [step, setStep]               = useState(1);
    const [currentTime, setCurrentTime] = useState('');
    const products = ['siomay', 'pentol', 'lumpia', 'adonan_pangsit'];
    const machines = ['IQF 1', 'IQF 2'];
    const [product,     setProduct]     = useState(null);
    const [machine,     setMachine]     = useState(null);
    const [batchNumber, setBatchNumber] = useState('');
    const [rak,             setRak]            = useState('');
    const [trayCount,       setTrayCount]      = useState('');
    const [lastRak,         setLastRak]        = useState('');  // highest Rak shift ini (auto-reset antar shift/hari)
    const [totalsByProduct, setTotalsByProduct]= useState(null);
    const [loading,         setLoading]        = useState(false);
    const [toast,           setToast]          = useState({ show: false, type: '', title: '', message: '' });
    const [kendalaLog,      setKendalaLog]     = useState([]);
    const [flashingKendala, setFlashingKendala]= useState(null);
    const [showCustomInput, setShowCustomInput]= useState(false);
    const [customKendala,   setCustomKendala]  = useState('');
    const [submitingKendala,setSubmitingKendala]= useState(false);
    const customInputRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
            const dateString = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            setCurrentTime(`${dateString} | ${timeString} WIB`);
        }, 1000);

        const savedProduct = localStorage.getItem('iqf_product');
        const savedMachine = localStorage.getItem('iqf_machine');

        if (savedProduct && savedMachine) {
            setProduct(savedProduct);
            setMachine(savedMachine);

            // Restore lastRak per machine+product — auto-reset jika shift/hari berbeda
            const savedRak = readLastRakSafe(savedMachine, savedProduct);
            setLastRak(savedRak);
            setRak(savedRak);

            // Restore lastBatch per machine+product
            const batchKey   = `iqf_lastBatch_${savedMachine}_${savedProduct}`;
            const savedBatch = localStorage.getItem(batchKey) || '';
            setBatchNumber(savedBatch);

            setStep(2);
        }

        try {
            const saved = JSON.parse(localStorage.getItem('iqf_kendalaLog') || '[]');
            if (Array.isArray(saved)) setKendalaLog(saved);
        } catch (_) {}

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (showCustomInput && customInputRef.current) {
            setTimeout(() => customInputRef.current?.focus(), 50);
        }
    }, [showCustomInput]);

    const nowHHMM = () => {
        const d = new Date();
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };

    const showNotification = (type, title, message) => {
        setToast({ show: true, type, title, message });
        setTimeout(() => setToast({ show: false, type: '', title: '', message: '' }), 3000);
    };

    const proceedToStep2 = () => {
        if (product && machine) {
            localStorage.setItem('iqf_product', product);
            localStorage.setItem('iqf_machine', machine);

            // Load lastRak per machine+product — auto-reset jika shift/hari berbeda
            const savedRak = readLastRakSafe(machine, product);
            setRak(savedRak);
            setLastRak(savedRak);

            // Load lastBatch per machine+product
            const batchKey   = `iqf_lastBatch_${machine}_${product}`;
            const savedBatch = localStorage.getItem(batchKey) || '';
            setBatchNumber(savedBatch);

            setTrayCount('');
            setTotalsByProduct(null);
            setStep(2);
        }
    };

    const resetContext = () => {
        setProduct(null); setMachine(null); setBatchNumber('');
        setRak(''); setTrayCount(''); setTotalsByProduct(null);
        setLastRak(''); // reset in-memory only
        localStorage.removeItem('iqf_product');
        localStorage.removeItem('iqf_machine');
        localStorage.removeItem('iqf_kendalaLog');
        // TIDAK hapus iqf_lastRak_${machine}_${product} — persist per produk per mesin
        setKendalaLog([]);
        setStep(1);
    };

    const submitData = async () => {
        const isPackItem = product === 'lumpia' || product === 'adonan_pangsit';
        
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
            const response = await axios.post('/iqf-kiosk/store', {
                product_type: product, machine, batch_number: batchNumber, rak: isPackItem ? null : rak, tray_count: trayCount,
            });
            setTotalsByProduct(response.data.totals_by_product || null);
            showNotification('success', 'Berhasil Dicatat!', isPackItem ? `${trayCount} dimasukkan.` : `Rak ${rak} - ${trayCount} dimasukkan.`);

            // Update lastRak per mesin+produk (beserta konteks tanggal+shift)
            if (!isPackItem && (lastRak === '' || parseInt(rak) >= parseInt(lastRak))) {
                setLastRak(String(rak));
                saveLastRak(machine, product, rak);
            }
            // Update lastBatch per mesin+produk
            localStorage.setItem(`iqf_lastBatch_${machine}_${product}`, String(batchNumber));

            setTrayCount('');
        } catch (error) {
            showNotification('error', 'Gagal Mencatat', error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    const submitKendala = async (label) => {
        const time = nowHHMM();
        const text = `${time} - ${label}`;
        setFlashingKendala(label);
        setTimeout(() => setFlashingKendala(null), 700);
        const newEntry = { time, label };
        const newLog = [...kendalaLog, newEntry];
        setKendalaLog(newLog);
        localStorage.setItem('iqf_kendalaLog', JSON.stringify(newLog));
        try {
            await axios.post('/iqf-kiosk/unplanned-stop', {
                product_type: product, machine, batch_number: batchNumber, unplanned_stop: text,
            });
            showNotification('success', 'Kendala Dicatat', `${time} - ${label}`);
        } catch (e) {
            showNotification('error', 'Gagal Mencatat', 'Coba lagi.');
        }
    };

    const handleKendala = async (label) => {
        if (label === 'Lain-lain') { setShowCustomInput(true); return; }
        await submitKendala(label);
    };

    const handleSubmitCustom = async () => {
        if (!customKendala.trim()) return;
        setSubmitingKendala(true);
        await submitKendala(customKendala.trim());
        setCustomKendala(''); setShowCustomInput(false); setSubmitingKendala(false);
    };

    const isPack = product === 'lumpia' || product === 'adonan_pangsit';

    return (
        <div className="bg-slate-50 text-slate-800 min-h-screen w-screen flex flex-col relative overflow-x-hidden font-sans">
            <Head title="IQF Operator Terminal" />
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-300/40 blur-[120px]"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-300/40 blur-[120px]"></div>
            </div>

            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg border shadow-sm">
                        <img src="/images/ppa.jpg" alt="PPA" className="h-8 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-wider">IQF <span className="text-blue-600">Terminal</span></h1>
                        <p className="text-sm font-semibold text-slate-500">{currentTime}</p>
                    </div>
                </div>
                {step === 2 && (
                    <button onClick={resetContext} className="bg-slate-100 text-slate-700 border px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-200 transition-colors">
                        Ganti Pilihan
                    </button>
                )}
            </div>

            <div className="flex-1 p-6 z-10 flex flex-col items-center">
                {step === 1 && (
                    <div className="w-full max-w-4xl mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-black text-slate-800 mb-2">Pilih Konteks Shift</h2>
                            <p className="text-slate-500 font-medium">Pilih jenis produk dan mesin sebelum memulai pencatatan.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white/80 backdrop-blur-xl border p-6 rounded-3xl shadow-sm flex flex-col">
                                <h3 className="text-lg font-bold uppercase mb-4">Jenis Produk</h3>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {products.map(p => (
                                        <button key={p} onClick={() => setProduct(p)} className={`border-2 rounded-2xl py-4 font-bold text-sm uppercase transition-all ${product === p ? 'bg-cyan-500 text-white border-cyan-500 scale-105 shadow-md' : 'bg-white hover:bg-slate-50'}`}>
                                            {p.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl border p-6 rounded-3xl shadow-sm flex flex-col">
                                <h3 className="text-lg font-bold uppercase mb-4">Mesin IQF</h3>
                                <div className="grid grid-cols-1 gap-3 flex-1">
                                    {machines.map(m => (
                                        <button key={m} onClick={() => setMachine(m)} className={`border-2 rounded-2xl py-4 font-bold text-lg uppercase transition-all ${machine === m ? 'bg-blue-500 text-white border-blue-500 scale-105 shadow-md' : 'bg-white hover:bg-slate-50'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {product && machine && (
                            <div className="mt-16 text-center animate-in fade-in duration-500">
                                <button onClick={proceedToStep2} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-12 py-5 rounded-full hover:scale-105 transition-all text-xl uppercase tracking-[0.1em] shadow-lg">
                                    Mulai Pencatatan
                                </button>
                            </div>
                        )}
                    </div>
                )}

                    {step === 2 && (
                    <div className="w-full max-w-xl mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                        {/* Context badges */}
                        <div className="flex gap-3 mb-4 justify-center flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-black uppercase tracking-widest border border-cyan-200">{product?.replace('_', ' ')}</span>
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest border border-blue-200">{machine}</span>
                        </div>

                        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                            <div className="p-6">
                                {/* Grid: Batch | (Rak) | Jml */}
                                <div className={`grid gap-3 items-end ${isPack ? 'grid-cols-2' : 'grid-cols-3'}`}>

                                    {/* No. Batch — amber */}
                                    <div className="flex flex-col">
                                        <div className="h-12 flex flex-col justify-center">
                                            <label className="block text-slate-500 font-bold uppercase text-xs text-center leading-tight">No. Batch</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={batchNumber}
                                            onChange={e => setBatchNumber(e.target.value)}
                                            className="w-full text-center text-5xl font-black text-amber-600 bg-amber-50 border-2 border-amber-200 rounded-2xl focus:border-amber-400 py-5 outline-none transition-colors"
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* No. Rak — indigo */}
                                    {!isPack && (
                                    <div className="flex flex-col">
                                        <div className="h-12 flex flex-col justify-center">
                                            <label className="block text-slate-500 font-bold uppercase text-xs text-center leading-tight">No. Rak</label>

                                        </div>
                                        <input
                                            type="number"
                                            value={rak}
                                            onChange={e => setRak(e.target.value)}
                                            className={`w-full text-center text-5xl font-black rounded-2xl py-5 outline-none border-2 transition-colors text-indigo-600 bg-indigo-50 border-indigo-200 focus:border-indigo-500`}
                                            placeholder="0"
                                        />
                                    </div>
                                    )}

                                    {/* Jml Loyang/Keranjang — emerald */}
                                    <div className="flex flex-col">
                                        <div className="h-12 flex flex-col justify-center">
                                            <label className="block text-slate-500 font-bold uppercase text-xs text-center leading-tight">Jumlah {isPack ? 'Keranjang' : 'Loyang'}</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={trayCount}
                                            onChange={e => setTrayCount(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && submitData()}
                                            className="w-full text-center text-5xl font-black text-emerald-600 bg-emerald-50 border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 py-5 outline-none shadow-inner"
                                            placeholder="0"
                                        />
                                    </div>

                                </div>
                            </div>
                            <div className="px-8 pb-8">
                                <button onClick={submitData} disabled={loading || !trayCount || trayCount <= 0} className={`w-full font-black text-2xl py-6 rounded-2xl transition-all uppercase tracking-widest ${(loading || !trayCount || trayCount <= 0) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg hover:-translate-y-1'}`}>
                                    {loading ? 'MENCATAT...' : 'CATAT SEKARANG'}
                                </button>
                            </div>
                        </div>

                        {totalsByProduct !== null && (
                            <div className="mt-4 bg-white/90 backdrop-blur-md rounded-2xl border shadow-lg p-5 animate-in fade-in">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 text-center">Total Shift Ini (Loyang / Keranjang)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { key: 'siomay', label: 'Siomay', unit: 'L', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                                        { key: 'pentol', label: 'Pentol', unit: 'L', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                                        { key: 'lumpia', label: 'Lumpia', unit: 'K', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                                        { key: 'adonan_pangsit', label: 'Adonan Pangsit', unit: 'K', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                                    ].map(({ key, label, unit, color }) => (
                                        <div key={key} className={`rounded-xl border p-3 flex flex-col items-center ${color}`}>
                                            <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">{label}</span>
                                            <span className="text-3xl font-black font-mono">{totalsByProduct[key] ?? 0}</span>
                                            <span className="text-[10px] font-semibold uppercase mt-0.5 opacity-60">{unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* LINTASAN KENDALA */}
                        <div className="mt-5 bg-white/90 backdrop-blur-md rounded-2xl border border-rose-100 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100 px-5 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">⚠️</span>
                                    <span className="font-black text-xs uppercase tracking-widest text-rose-700">Lintasan Kendala</span>
                                </div>
                                {kendalaLog.length > 0 && (
                                    <span className="text-[10px] font-bold text-rose-500 bg-rose-100 border border-rose-200 rounded-full px-2 py-0.5">
                                        {kendalaLog.length}x tercatat
                                    </span>
                                )}
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-2.5">
                                {KENDALA_LIST.map(k => {
                                    const isFlashing = flashingKendala === k.label;
                                    return (
                                        <button
                                            key={k.label}
                                            onClick={() => handleKendala(k.label)}
                                            className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-xl border-2 font-bold text-xs uppercase tracking-wide transition-all duration-300 select-none active:scale-90 ${
                                                isFlashing
                                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-95 shadow-inner'
                                                    : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-400 hover:shadow-md hover:-translate-y-0.5'
                                            }`}
                                        >
                                            <span className="text-xl leading-none">{k.icon}</span>
                                            <span className="text-center leading-tight">{k.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {kendalaLog.length > 0 && (
                                <div className="border-t border-rose-100 px-5 py-3 max-h-32 overflow-y-auto bg-rose-50/50">
                                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-2">📋 Log Shift Ini</p>
                                    <div className="flex flex-col gap-1">
                                        {[...kendalaLog].reverse().map((k, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-rose-700">
                                                <span className="font-mono font-bold text-rose-500 shrink-0">{k.time}</span>
                                                <span className="text-slate-400">—</span>
                                                <span className="font-semibold">{k.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showCustomInput && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => { setShowCustomInput(false); setCustomKendala(''); }}>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-1">📝 Kendala Lain-lain</h3>
                        <p className="text-xs text-slate-400 font-semibold mb-5">Ketik deskripsi kendala spesifik</p>
                        <textarea
                            ref={customInputRef}
                            value={customKendala}
                            onChange={e => setCustomKendala(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitCustom()}
                            placeholder="Contoh: Rantai putus bagian depan..."
                            rows={3}
                            className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none resize-none transition-all"
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => { setShowCustomInput(false); setCustomKendala(''); }} className="flex-1 border-2 border-slate-200 text-slate-500 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Batal</button>
                            <button onClick={handleSubmitCustom} disabled={!customKendala.trim() || submitingKendala} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!customKendala.trim() || submitingKendala ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'}`}>
                                {submitingKendala ? 'Mencatat...' : '✓ Catat Kendala'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
}
