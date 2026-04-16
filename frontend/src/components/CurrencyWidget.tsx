'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function CurrencyWidget({ type = 'blue' }: { type?: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const labels: Record<string, string> = {
        blue: 'Dólar Blue',
        oficial: 'Dólar Oficial',
        mep: 'Dólar MEP',
        cripto: 'Dólar Cripto',
        bolsa: 'Dólar Bolsa'
    };

    useEffect(() => {
        const fetchDolar = async () => {
            try {
                const res = await fetch(`https://dolarapi.com/v1/dolares/${type}`);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error("Error fetching dolar:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchDolar();
    }, [type]);

    if (loading) return (

        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
            <div className="h-8 bg-white/5 rounded w-full"></div>
        </div>
    );

    if (!data) return null;

    return (
        <div className="relative group">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{labels[type] || 'Cotización'}</h4>
                <div 
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: 'var(--primary)', backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}
                >
                    <TrendingUp className="w-3 h-3" />
                     Bursátil
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-all group-hover:bg-white/[0.05]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Compra</p>
                    <p className="text-xl font-black text-white">${data.compra}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-all group-hover:bg-white/[0.05]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Venta</p>
                    <p className="text-xl font-black" style={{ color: 'var(--primary)' }}>${data.venta}</p>
                </div>
            </div>
            
            <p className="mt-4 text-[9px] text-slate-600 font-medium italic">
                Última actualización: {new Date(data.fechaActualizacion).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs
            </p>
        </div>
    );
}
