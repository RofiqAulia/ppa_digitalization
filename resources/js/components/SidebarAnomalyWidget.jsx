import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, ChevronRight, Activity, Bell } from 'lucide-react';

export function SidebarAnomalyWidget({ isCollapsed }) {
    const [anomalyData, setAnomalyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnomalyStats = async () => {
        try {
            const res = await axios.get('/dashboard/stats');
            if (res.data && res.data.anomaly_detection) {
                setAnomalyData(res.data.anomaly_detection);
            }
        } catch (e) {
            // Quiet fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnomalyStats();
        const interval = setInterval(fetchAnomalyStats, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !anomalyData) return null;

    const {
        active_minutes_by_product = {},
        downtime_minutes = 0,
        total_recorded_minutes = 0,
        target_shift_minutes = 480,
        unaccounted_minutes = 0,
        status = 'normal',
    } = anomalyData;

    const isAnomaly = status === 'anomaly' || unaccounted_minutes > 30;
    const isWarning = status === 'warning' || (unaccounted_minutes > 0 && unaccounted_minutes <= 30);

    const scrollToAnomalySection = () => {
        const elem = document.getElementById('deteksi-anomali-section');
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/dashboard#deteksi-anomali-section';
        }
    };

    if (isCollapsed) {
        return (
            <div className="px-2 py-2">
                <button
                    type="button"
                    onClick={scrollToAnomalySection}
                    title={`Deteksi Anomali Shift: ${unaccounted_minutes}m Selisih`}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
                        isAnomaly 
                            ? 'bg-rose-500 text-white animate-pulse' 
                            : isWarning 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-emerald-500 text-white'
                    }`}
                >
                    <Bell className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="mx-3 my-2 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-950 shadow-2xs space-y-2.5">
            {/* Top Row: Title & Red Badge Count (Matching Gambar 1) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-xs text-rose-700">
                    <Bell className="w-3.5 h-3.5 text-rose-600 fill-rose-100" />
                    <span>Perhatian Anomali!</span>
                </div>
            </div>

            <button
                type="button"
                onClick={scrollToAnomalySection}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer border-0"
            >
                <span>Buka Deteksi Anomali</span>
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
