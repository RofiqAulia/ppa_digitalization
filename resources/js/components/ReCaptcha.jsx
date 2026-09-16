import React, { useEffect, useRef, useState } from 'react';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdXGL4tAAAAAOvpEnVcZfsPTiH_9NvYQZF65dHg';

export default function ReCaptcha({ onVerify, error }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const onVerifyRef = useRef(onVerify);

    const [renderError, setRenderError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Keep onVerifyRef up-to-date without triggering re-render of reCAPTCHA iframe
    useEffect(() => {
        onVerifyRef.current = onVerify;
    }, [onVerify]);

    const renderWidget = () => {
        if (widgetIdRef.current !== null) return; // Prevent double rendering

        if (window.grecaptcha && window.grecaptcha.render && containerRef.current) {
            try {
                containerRef.current.innerHTML = '';
                const id = window.grecaptcha.render(containerRef.current, {
                    sitekey: SITE_KEY,
                    callback: (token) => {
                        setRenderError(null);
                        if (onVerifyRef.current) onVerifyRef.current(token);
                    },
                    'expired-callback': () => {
                        if (onVerifyRef.current) onVerifyRef.current('');
                    },
                    'error-callback': () => {
                        console.warn('Google reCAPTCHA error-callback triggered for sitekey:', SITE_KEY);
                        setRenderError('Google reCAPTCHA belum dapat terhubung. Pastikan domain (misal: localhost) sudah didaftarkan pada Site Key ini.');
                    }
                });
                widgetIdRef.current = id;
                setIsLoading(false);
            } catch (e) {
                console.error('reCAPTCHA render error:', e);
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        let timer;
        if (window.grecaptcha && window.grecaptcha.render) {
            renderWidget();
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

            const checkInterval = setInterval(() => {
                if (window.grecaptcha && window.grecaptcha.render) {
                    clearInterval(checkInterval);
                    renderWidget();
                }
            }, 250);

            timer = setTimeout(() => {
                clearInterval(checkInterval);
                setIsLoading(false);
            }, 4000);

            return () => {
                clearInterval(checkInterval);
                clearTimeout(timer);
            };
        }
    }, []); // Empty dependency array: ONLY initialize reCAPTCHA once on mount!

    const handleReload = () => {
        setRenderError(null);
        setIsLoading(true);
        if (window.grecaptcha && window.grecaptcha.reset && widgetIdRef.current !== null) {
            try {
                window.grecaptcha.reset(widgetIdRef.current);
                setIsLoading(false);
            } catch (e) {
                widgetIdRef.current = null;
                renderWidget();
            }
        } else {
            widgetIdRef.current = null;
            renderWidget();
        }
    };

    return (
        <div className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col items-center">
            {/* Header Anti-Bot */}
            <div className="flex items-center gap-2 mb-3 w-full justify-center">
                <Shield className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />
                <span className="text-xs md:text-sm font-bold text-slate-700">
                    Verifikasi Anti-Bot (Security CAPTCHA)
                </span>
            </div>

            {/* Google reCAPTCHA Container */}
            <div className="flex flex-col items-center justify-center my-1 min-h-[78px] w-full">
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-4 font-semibold">
                        <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
                        Memuat Google reCAPTCHA...
                    </div>
                )}
                <div ref={containerRef} className={isLoading ? 'hidden' : 'block'} />
            </div>

            {/* Error Message */}
            {(error || renderError) && (
                <div className="mt-2 text-center flex flex-col items-center gap-1">
                    <p className="text-pink-500 text-xs font-bold flex items-center justify-center gap-1 max-w-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 inline" /> {error || renderError}
                    </p>
                    <button
                        type="button"
                        onClick={handleReload}
                        className="mt-1 text-[11px] text-slate-500 hover:text-pink-600 font-bold underline flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" /> Coba Muat Ulang CAPTCHA
                    </button>
                </div>
            )}
        </div>
    );
}
