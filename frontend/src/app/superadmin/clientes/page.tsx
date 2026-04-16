"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Radio, Loader2, Mail, ExternalLink, Settings, Database, ShieldCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminClientesPage() {
    const [radios, setRadios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/radios/all').then(res => setRadios(res.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Users className="text-violet-400 w-8 h-8" /> Clientes
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Vista de todos los clientes-radio registrados en la plataforma.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-violet-400 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {radios.length === 0 ? (
                        <div className="col-span-3 text-center py-16 text-slate-500 text-sm">No hay clientes registrados aún.</div>
                    ) : radios.map((r: any) => (
                        <div key={r.id} className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all hover:-translate-y-1 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-violet-500/30 transition-colors">
                                        {r.logoUrl
                                            ? <img src={r.logoUrl} alt="" className="w-full h-full object-cover" />
                                            : <Radio className="w-6 h-6 text-slate-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-sm truncate">{r.nombre}</p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate lowercase">{r.subdominio}.onradio.com.ar</p>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${r.activa && !r.suspendida ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : r.suspendida ? 'bg-amber-500' : 'bg-slate-700'}`} title={r.activa ? 'Activa' : 'Inactiva'} />
                            </div>

                            {/* Almacenamiento */}
                            <div className="mb-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Database className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Espacio en Disco</span>
                                    </div>
                                    <span className={`text-[10px] font-black ${(r.storage?.percentage ?? 0) > 90 ? 'text-red-400' : 'text-slate-300'}`}>
                                        {r.storage?.percentage ?? 0}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                                    <div 
                                        className={`h-full transition-all duration-700 ${
                                            (r.storage?.percentage ?? 0) > 90 ? 'bg-red-500' : 
                                            (r.storage?.percentage ?? 0) > 70 ? 'bg-amber-500' : 'bg-violet-500'
                                        }`}
                                        style={{ width: `${Math.min(r.storage?.percentage ?? 0, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                    <span>{r.storage?.usedGB?.toFixed(2) ?? '0.00'} GB USADOS</span>
                                    <span>Límite {r.storage?.totalGB ?? 0} GB</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs mb-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Plan de Servicio</span>
                                    <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded border ${r.plan?.slug === 'portal' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                        {r.plan?.nombre || (r.plan?.slug === 'portal' ? 'Portal Web' : 'Audio Streaming')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Miembros</span>
                                    <span className="text-white font-bold">{r._count?.usuarios ?? 1} usuarios</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => { 
                                        localStorage.removeItem('radioId');
                                        localStorage.setItem('tenant_id', r.id); 
                                        localStorage.setItem('usuario_plan', r.plan?.slug || 'audio'); 
                                        window.location.href = '/admin/dashboard'; 
                                    }}
                                    className="py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-violet-900/20"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> GESTIONAR
                                </button>
                                <Link
                                    href={`/superadmin/emisoras?id=${r.id}`}
                                    className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 border border-white/5"
                                >
                                    <Settings className="w-3.5 h-3.5" /> CONFIG
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
