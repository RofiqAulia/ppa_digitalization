import React, { useEffect, useRef, useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LcyFL4tAAAAAEMxoz0fvlhDP-ylhGpbgPFjCtHh';

export default function ReCaptcha({ onVerify, error }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const [renderError, setRenderError] = useState(null);

    useEffect(() => {
        const renderGoogleRecaptcha = () => {
            if (window.grecaptcha && window.grecaptcha.render && containerRef.current) {
                try {
                    containerRef.current.innerHTML = '';
                    const id = window.grecaptcha.render(containerRef.current, {
                        sitekey: SITE_KEY,
                        callback: (token) => {
                            setRenderError(null);
                            if (onVerify) onVerify(token);
                        },
                        'expired-callback': () => {
                            if (onVerify) onVerify('');
                        },
                        'error-callback': () => {
                            setRenderError('Google reCAPTCHA gagal dimuat. Pastikan domain ini (misal: localhost) sudah didaftarkan di Google Admin Console.');
                        }
                    });
                    widgetIdRef.current = id;
                } catch (e) {
                    console.error('reCAPTCHA render error:', e);
                }
            }
        };

        if (window.grecaptcha && window.grecaptcha.render) {
            renderGoogleRecaptcha();
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
                    renderGoogleRecaptcha();
                }
            }, 200);

            return () => {
                clearInterval(checkInterval);
            };
        }
    }, [onVerify]);

    return (
        <div className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col items-center">
            {/* Header Header anti-bot */}
            <div className="flex items-center gap-2 mb-3 w-full justify-center">
                <Shield className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />
                <span className="text-xs md:text-sm font-bold text-slate-700">
                    Verifikasi Anti-Bot (Security CAPTCHA)
                </span>
            </div>

            {/* Official Google reCAPTCHA Widget Container */}
            <div className="flex justify-center my-1 min-h-[78px] items-center">
                <div ref={containerRef} />
            </div>

            {/* Error Message */}
            {(error || renderError) && (
                <p className="text-pink-500 text-xs font-bold mt-2 text-center flex items-center justify-center gap-1 max-w-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 inline" /> {error || renderError}
                </p>
            )}
        </div>
    );
}
