"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Radio, Search, ChevronRight, Activity } from 'lucide-react';

export default function RadiosHubPage() {
    const [radios, setRadios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtenemos todas las radios disponibles (endpoint público si existiera, o listamos las del sistema)
        // Por ahora simulamos que buscamos radios disponibles o mostramos un mensaje para ir as la demo.
        api.get('/radios')
            .then(res => setRadios(res.data || []))
            .catch(err => console.error("Error cargando directorio:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#020817]">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold tracking-wide uppercase mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Directorio Global
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
                    Descubrí <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Emisoras</span>
                </h1>
                
                <p className="max-w-xl mx-auto text-lg text-slate-400 font-medium leading-relaxed mb-12">
                    Encuentra estaciones de radio online potenciadas por ONRADIO. Noticias, música y contenido en vivo en un solo lugar.
                </p>

                {/* Buscador Simple */}
                <div className="max-w-md mx-auto mb-16 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o frecuencia..."
                        className="w-full pl-11 pr-4 py-4 bg-[#0f172a]/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    />
                </div>

                {/* Grilla Emisoras (o acceso directo a Demo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : radios.length > 0 ? (
                        radios.map(radio => (
                            <Link key={radio.id} href={`/radio/${radio.subdominio}`} className="group bg-[#0f172a] border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 transition-all shadow-xl hover:-translate-y-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                                        {radio.logoUrl ? (
                                            <img src={radio.logoUrl} alt={radio.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <Radio className="w-6 h-6 text-slate-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{radio.nombre}</h3>
                                        <p className="text-slate-500 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> En el aire</p>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <span className="text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Sintonizar <ChevronRight className="w-4 h-4" /></span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full bg-blue-500/5 border border-blue-500/20 rounded-3xl p-10 flex flex-col items-center text-center">
                            <Radio className="w-12 h-12 text-blue-400/50 mb-4" />
                            <h3 className="text-white font-bold text-xl mb-2">Visita la Estación de Prueba</h3>
                            <p className="text-slate-400 mb-6 max-w-sm">Explora cómo luce una emisora completa con noticias, streaming de audio y widgets sociales.</p>
                            <Link href="/radio/demo" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25">
                                Sintonizar Demo
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
