"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ShieldCheck, Radio, DollarSign, TrendingUp, PlusCircle, ChevronRight, Loader2, Ticket, Users, Activity, Database } from 'lucide-react';

interface PlatformMetrics {
    totalRadios: number;
    radiosActivas: number;
    radiosSuspendidas: number;
    totalUsuarios: number;
    ticketsAbiertos: number;
    mrrTotal: number;
    totalStorageAssigned: number;
    totalStorageLimit: number;
    ultimasRadios: any[];
}

export default function SuperAdminIndexPage() {
    const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/superadmin/dashboard')
            .then(res => setMetrics(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="text-violet-400 w-6 h-6" />
                    <h1 className="text-3xl font-black text-white">Panel SuperAdmin</h1>
                </div>
                <p className="text-slate-500 text-sm">Vista global de la plataforma ONRADIO · Acceso restringido</p>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {[
                    { label: 'Emisoras Activas', val: loading ? '—' : metrics?.radiosActivas ?? 0, sub: `de ${metrics?.totalRadios ?? 0} total`, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', icon: Radio, href: '/superadmin/emisoras' },
                    { label: 'MRR del Mes (ARS)', val: loading ? '—' : `$${(metrics?.mrrTotal ?? 0).toLocaleString('es-AR')}`, sub: `Estimación por planes`, iconColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: DollarSign, href: '/superadmin/pagos' },
                    { label: 'Disco Asignado', val: loading ? '—' : `${metrics?.totalStorageAssigned ?? 0} GB`, sub: `de ${metrics?.totalStorageLimit ?? 100} GB`, iconColor: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', icon: Database, href: '/superadmin/planes' },
                ].map(({ label, val, sub, iconColor, bgColor, borderColor, icon: Icon, href }) => (
                    <Link key={href} href={href} className="bg-[#0f172a] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-0.5 group">
                        <div className={`flex items-center gap-2 ${iconColor} mb-3`}>
                            <div className={`w-8 h-8 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
                        </div>
                        <p className="text-4xl font-black text-white">{val}</p>
                        <p className="text-xs text-slate-500 mt-2">{sub}</p>
                    </Link>
                ))}
            </div>

            {/* Emisoras registradas */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Radio className="w-4 h-4 text-violet-400" /> Últimas Emisoras Registradas
                    </h2>
                    <Link href="/superadmin/emisoras" className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        <PlusCircle className="w-3 h-3" /> Nueva
                    </Link>
                </div>
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
                ) : (metrics?.ultimasRadios?.length ?? 0) === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">No hay emisoras registradas todavía.</div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {metrics?.ultimasRadios.map((r: any) => (
                            <div key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/2 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                        {r.logoUrl
                                            ? <img src={r.logoUrl} alt="" className="w-full h-full object-cover" />
                                            : <Radio className="w-5 h-5 text-slate-400" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{r.nombre}</p>
                                        <p className="text-xs text-slate-500 font-mono">{r.subdominio}.onradio.com.ar</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${r.activa && !r.suspendida ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                        {r.activa && !r.suspendida ? 'Activa' : r.suspendida ? 'Suspendida' : 'Inactiva'}
                                    </span>
                                    <span className="text-xs text-slate-500">{new Date(r.fechaCreacion).toLocaleDateString('es-AR')}</span>
                                    <Link href="/superadmin/emisoras" className="text-xs text-violet-400 hover:text-violet-300 font-medium">
                                        Ver <ChevronRight className="w-3 h-3 inline" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Acciones rápidas */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-400" /> Acciones Rápidas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Gestionar Emisoras', href: '/superadmin/emisoras', icon: Radio },
                        { label: 'Ver Clientes', href: '/superadmin/clientes', icon: Users },
                        { label: 'Suscripciones', href: '/superadmin/suscripciones', icon: DollarSign },
                        { label: 'Tickets', href: '/superadmin/tickets', icon: Ticket },
                        { label: 'Gestión de Planes', href: '/superadmin/planes', icon: TrendingUp },
                        { label: 'Historial de Pagos', href: '/superadmin/pagos', icon: DollarSign },
                        { label: 'FAQ Global', href: '/superadmin/faq', icon: ShieldCheck },
                        { label: 'Ir a la Landing', href: '/', icon: Activity },
                    ].map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href} href={href}
                            className="bg-[#0f172a] border border-white/5 p-4 rounded-2xl hover:border-white/10 hover:bg-white/[0.03] transition-all hover:-translate-y-1 text-center group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                                <Icon className="w-4 h-4 text-violet-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{label}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
