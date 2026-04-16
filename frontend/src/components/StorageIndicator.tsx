"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Database, AlertTriangle } from 'lucide-react';

interface StorageStats {
    usedGB: number;
    totalGB: number;
    percentage: number;
    usedBytes: number;
    limitBytes: number;
}

export default function StorageIndicator() {
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/radios/stats/storage');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching storage stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Recargar cada 5 minutos
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="px-3 py-4 animate-pulse">
            <div className="h-2 w-24 bg-white/10 rounded mb-2"></div>
            <div className="h-1.5 w-full bg-white/5 rounded"></div>
        </div>
    );

    if (!stats) return null;

    const isNearLimit = stats.percentage >= 90;
    const isFull = stats.percentage >= 100;

    return (
        <div className="px-3 py-4 border-t border-white/5 bg-slate-900/20">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <Database className="w-3 h-3" />
                    Almacenamiento
                </div>
                <span className={`text-[10px] font-black ${isNearLimit ? 'text-rose-400' : 'text-slate-400'}`}>
                    {stats.usedGB} / {stats.totalGB} GB
                </span>
            </div>

            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 rounded-full ${
                        isFull ? 'bg-rose-600' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                />
            </div>

            {isNearLimit && (
                <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold text-amber-400/80 animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {isFull ? 'Límite alcanzado' : 'Espacio casi lleno'}
                </div>
            )}
        </div>
    );
}
