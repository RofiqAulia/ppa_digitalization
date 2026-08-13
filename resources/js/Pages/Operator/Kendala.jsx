import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import axios from 'axios';

const KENDALA_LIST = [
    { label: 'Trouble Kipas',   icon: '🌀' },
    { label: 'Trouble Sensor',  icon: '📡' },
    { label: 'Tunggu Dimsum',   icon: '⏳' },
    { label: 'Temperatur Naik', icon: '🌡️' },
    { label: 'Conveyor Mati',   icon: '🔧' },
    { label: 'Lain-lain',       icon: '📝' },
];

export default function Kendala() {
    const [kendalaLog, setKendalaLog] = useState([]);
    const [flashingKendala, setFlashingKendala] = useState(null);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customKendala, setCustomKendala] = useState('');
    const [submitingKendala, setSubmitingKendala] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', title: '', message: '' });
    const customInputRef = useRef(null);
    
    // Retrieve context from localStorage (same as Kiosk)
    const product = (typeof window !== 'undefined' ? localStorage.getItem('iqf_product') : null) || 'siomay';
    const machine = (typeof window !== 'undefined' ? localStorage.getItem('iqf_machine') : null) || 'IQF 1';
    const batchNumber = (typeof window !== 'undefined' ? localStorage.getItem(`iqf_lastBatch_${machine}_${product}`) : null) || '1';

    const getTodayWIB = () => {
        const now = new Date();
        const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        return wib.toISOString().slice(0, 10); // YYYY-MM-DD
    };

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('iqf_kendalaLog') || '[]');
            if (Array.isArray(saved)) {
                const today = getTodayWIB();
                // Only display today's entries, but keep all in localStorage
                const todayLog = saved.filter(e => e.date === today);
                setKendalaLog(todayLog);
            }
        } catch (_) {}
    }, []);

    useEffect(() => {
        if (showCustomInput && customInputRef.current) {
            setTimeout(() => customInputRef.current?.focus(), 50);
        }
    }, [showCustomInput]);

    const showNotification = (type, title, message) => {
        setToast({ show: true, type, title, message });
        setTimeout(() => setToast({ show: false, type: '', title: '', message: '' }), 3000);
    };

    const nowHHMM = () => {
        const now = new Date();
        const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        return `${String(wib.getHours()).padStart(2,'0')}:${String(wib.getMinutes()).padStart(2,'0')}`;
    };

    const submitKendala = async (label) => {
        if (!product || !machine) {
            showNotification('error', 'Konteks Hilang', 'Mohon pilih produk dan mesin di halaman terminal terlebih dahulu.');
            return;
        }

        const time = nowHHMM();
        const text = `${time} - ${label}`;
        
        setFlashingKendala(label);
        setTimeout(() => setFlashingKendala(null), 700);
        
        const today = getTodayWIB();
        const newEntry = { time, label, date: today };
        // Load all existing entries (including past days) and append new one
        let allEntries = [];
        try {
            allEntries = JSON.parse(localStorage.getItem('iqf_kendalaLog') || '[]');
        } catch (_) {}
        const allUpdated = [...allEntries, newEntry];
        localStorage.setItem('iqf_kendalaLog', JSON.stringify(allUpdated));
        // Only show today's in state
        const todayLog = allUpdated.filter(e => e.date === today);
        setKendalaLog(todayLog);
        
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

    return (
        <OperatorLayout>
            <Head title="Lintasan Kendala" />
            
            <div className="flex-1 flex flex-col bg-white p-6 relative">
                
                {/* Header Actions */}
                <div className="w-full max-w-5xl mx-auto flex justify-end mb-8 mt-4">
                    <button 
                        onClick={() => router.visit('/')}
                        className="bg-cyan-200 hover:bg-cyan-300 text-slate-800 font-black text-sm uppercase tracking-widest px-8 py-3 rounded-full flex items-center gap-2 shadow-sm transition-all"
                    >
                        <span className="text-xl leading-none bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-cyan-600 font-bold">&larr;</span>
                        BACK
                    </button>
                </div>

                <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center">
                    <h2 className="text-center font-black text-slate-800 uppercase tracking-widest mb-12 border-b-2 border-slate-100 pb-4">
                        Cukup klik sekali saat terjadi kendala, maka data akan tercatat di system.
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full">
                        {KENDALA_LIST.map(k => {
                            const isFlashing = flashingKendala === k.label;
                            return (
                                <div key={k.label} className="flex flex-col items-center gap-3">
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest text-center">{k.label}</p>
                                    <button
                                        onClick={() => handleKendala(k.label)}
                                        className={`w-full aspect-video flex flex-col items-center justify-center rounded-[2.5rem] border-4 transition-all duration-300 select-none active:scale-95 ${
                                            isFlashing
                                                ? 'bg-cyan-50 border-cyan-400 text-cyan-700 scale-95 shadow-inner'
                                                : 'bg-white/90 backdrop-blur-md border-pink-400 text-pink-500 hover:bg-pink-50 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-1'
                                        }`}
                                    >
                                        <span className="text-5xl md:text-6xl">{k.icon}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Log display */}
                    {kendalaLog.length > 0 && (
                        <div className="mt-16 w-full max-w-md mx-auto bg-pink-50/80 backdrop-blur-md rounded-3xl border border-pink-100 p-6 shadow-xl">
                            <p className="text-[10px] text-pink-400 font-black uppercase tracking-[0.2em] mb-4 text-center">📋 Log Kendala Hari Ini</p>
                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                {[...kendalaLog].reverse().map((k, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xs text-pink-700 justify-center">
                                        <span className="font-mono font-black text-pink-500 shrink-0 bg-white px-2 py-1 rounded-md shadow-sm">{k.time}</span>
                                        <span className="text-pink-300">—</span>
                                        <span className="font-bold">{k.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Input Modal */}
            {showCustomInput && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => { setShowCustomInput(false); setCustomKendala(''); }}>
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 border border-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-1">📝 Kendala Lain-lain</h3>
                        <p className="text-xs text-slate-400 font-semibold mb-6">Ketik deskripsi kendala spesifik</p>
                        <textarea
                            ref={customInputRef}
                            value={customKendala}
                            onChange={e => setCustomKendala(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitCustom()}
                            placeholder="Contoh: Rantai putus bagian depan..."
                            rows={3}
                            className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold text-slate-700 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none resize-none transition-all"
                        />
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setShowCustomInput(false); setCustomKendala(''); }} className="flex-1 border-2 border-slate-200 text-slate-500 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Batal</button>
                            <button onClick={handleSubmitCustom} disabled={!customKendala.trim() || submitingKendala} className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!customKendala.trim() || submitingKendala ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-pink-500/30'}`}>
                                {submitingKendala ? 'Mencatat...' : '✓ Catat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-10">
                    <div className={`px-6 py-4 rounded-2xl shadow-xl border-2 flex items-center gap-4 bg-white/95 backdrop-blur-md ${toast.type === 'success' ? 'border-cyan-200 text-cyan-800' : 'border-pink-200 text-pink-800'}`}>
                        <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-cyan-500' : 'bg-pink-500'} text-white font-black text-sm`}>
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
