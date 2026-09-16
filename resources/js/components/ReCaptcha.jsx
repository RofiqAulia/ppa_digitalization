import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, Check, Lock } from 'lucide-react';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LcyFL4tAAAAAEMxoz0fvlhDP-ylhGpbgPFjCtHh';

export default function ReCaptcha({ onVerify, error }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [fallbackMode, setFallbackMode] = useState(false);

    // Fallback Math Challenge states
    const [status, setStatus] = useState('idle'); // 'idle' | 'challenging' | 'verified'
    const [challenge, setChallenge] = useState({ num1: 0, num2: 0, answer: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [challengeError, setChallengeError] = useState(false);

    const generateChallenge = () => {
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        setChallenge({ num1, num2, answer: num1 + num2 });
        setUserAnswer('');
        setChallengeError(false);
    };

    useEffect(() => {
        generateChallenge();

        // 1. Function to render Google reCAPTCHA
        const renderRecaptcha = () => {
            if (window.grecaptcha && window.grecaptcha.render && containerRef.current) {
                try {
                    // Clear container first if needed
                    containerRef.current.innerHTML = '';
                    const id = window.grecaptcha.render(containerRef.current, {
                        sitekey: SITE_KEY,
                        callback: (token) => {
                            if (onVerify) onVerify(token);
                            setStatus('verified');
                        },
                        'expired-callback': () => {
                            if (onVerify) onVerify('');
                            setStatus('idle');
                        },
                        'error-callback': () => {
                            setFallbackMode(true);
                        }
                    });
                    widgetIdRef.current = id;
                    setIsGoogleLoaded(true);
                } catch (e) {
                    console.warn('Google reCAPTCHA render fallback:', e);
                }
            }
        };

        // 2. Load Google Script if not present
        if (window.grecaptcha && window.grecaptcha.render) {
            renderRecaptcha();
        } else {
            const scriptId = 'google-recaptcha-script';
            let script = document.getElementById(scriptId);

            if (!script) {
                script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }

            const checkTimer = setInterval(() => {
                if (window.grecaptcha && window.grecaptcha.render) {
                    clearInterval(checkTimer);
                    renderRecaptcha();
                }
            }, 300);

            // Timeout to fallback if script blocked/offline after 4s
            const timeoutTimer = setTimeout(() => {
                clearInterval(checkTimer);
                if (!window.grecaptcha || !window.grecaptcha.render) {
                    setFallbackMode(true);
                }
            }, 4000);

            return () => {
                clearInterval(checkTimer);
                clearTimeout(timeoutTimer);
            };
        }
    }, []);

    const handleCheckboxClick = () => {
        if (status === 'verified') return;
        setStatus('challenging');
        generateChallenge();
    };

    const handleVerifyChallenge = (e) => {
        e.preventDefault();
        if (parseInt(userAnswer.trim(), 10) === challenge.answer) {
            const timestamp = Date.now();
            const token = 'LOCAL_VERIFIED_' + btoa(JSON.stringify({
                val: challenge.answer,
                ts: timestamp,
                hash: Math.random().toString(36).substring(2, 10)
            }));
            setStatus('verified');
            setChallengeError(false);
            if (onVerify) {
                onVerify(token);
            }
        } else {
            setChallengeError(true);
            generateChallenge();
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* ── GOOGLE RECAPTCHA WIDGET CONTAINER ── */}
            <div className={`flex justify-center transition-all ${fallbackMode ? 'hidden' : 'block'}`}>
                <div ref={containerRef} className="my-1" />
            </div>

            {/* ── INTERACTIVE FALLBACK (If Google API unavailable or offline) ── */}
            {fallbackMode && (
                <div className="w-full">
                    <div className={`relative bg-slate-50/90 backdrop-blur border rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition-all ${
                        status === 'verified' ? 'border-emerald-300 bg-emerald-50/40' : error ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-pink-300'
                    }`}>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCheckboxClick}
                                disabled={status === 'verified'}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                                    status === 'verified'
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                                        : status === 'challenging'
                                        ? 'border-2 border-pink-400 bg-pink-50 animate-pulse'
                                        : 'border-2 border-slate-300 bg-white hover:border-pink-400 hover:bg-pink-50/50'
                                }`}
                                title="Klik untuk verifikasi reCAPTCHA"
                            >
                                {status === 'verified' && <Check className="w-4 h-4 stroke-[3]" />}
                                {status === 'challenging' && <div className="w-3 h-3 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />}
                            </button>

                            <div className="flex flex-col text-left">
                                <span className={`text-xs font-bold transition-colors ${
                                    status === 'verified' ? 'text-emerald-700' : 'text-slate-700'
                                }`}>
                                    {status === 'verified' ? 'Saya bukan robot (Terverifikasi)' : 'Saya bukan robot'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Keamanan reCAPTCHA Terlindungi
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 pl-2">
                            <div className="flex items-center gap-1 text-slate-400">
                                <ShieldCheck className={`w-5 h-5 ${status === 'verified' ? 'text-emerald-500' : 'text-pink-500'}`} />
                                <span className="text-[9px] font-black tracking-tighter text-slate-500 uppercase">reCAPTCHA</span>
                            </div>
                            <div className="flex gap-1 text-[8px] text-slate-400 mt-0.5 font-medium">
                                <span>Privasi</span>
                                <span>•</span>
                                <span>Syarat</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-pink-500 text-xs font-bold mt-1.5 text-center flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 inline" /> {error}
                </p>
            )}

            {/* ── CHALLENGE MODAL (Fallback Mode Only) ── */}
            {fallbackMode && status === 'challenging' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white border-2 border-pink-200 rounded-3xl p-6 max-w-xs w-full shadow-2xl shadow-pink-500/20 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-black text-slate-800 mb-1 uppercase tracking-wide">
                            Verifikasi Keamanan
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 font-medium">
                            Buktikan Anda bukan bot dengan menjawab pertanyaan berikut:
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                            <div className="flex items-center justify-center gap-3 text-2xl font-black text-slate-800 tracking-wider">
                                <span>{challenge.num1}</span>
                                <span className="text-pink-500">+</span>
                                <span>{challenge.num2}</span>
                                <span className="text-pink-500">=</span>
                                <span className="text-pink-600 bg-pink-100 px-3 py-1 rounded-xl">?</span>
                            </div>
                        </div>

                        {challengeError && (
                            <p className="text-rose-500 text-xs font-bold mb-3">
                                ✕ Jawaban salah, silakan coba lagi!
                            </p>
                        )}

                        <form onSubmit={handleVerifyChallenge} className="flex flex-col gap-3">
                            <input
                                type="number"
                                autoFocus
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Masukkan hasil..."
                                className="w-full text-center font-bold text-base bg-white border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 rounded-xl py-2.5 outline-none transition-all"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={generateChallenge}
                                    className="p-2.5 border-2 border-slate-200 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                                    title="Acak Pertanyaan"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!userAnswer.trim()}
                                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
                                >
                                    Verifikasi
                                </button>
                            </div>
                        </form>

                        <button
                            type="button"
                            onClick={() => setStatus('idle')}
                            className="mt-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
