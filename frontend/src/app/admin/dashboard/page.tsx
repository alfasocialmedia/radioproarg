"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Newspaper, RadioTower, Activity, Users,
    TrendingUp, ChevronRight, Clock, Zap, PlusCircle, Loader2,
    Music2, Lock, BarChart3, HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardStats {
    totalNoticias: number;
    totalProgramas: number;
    radioNombre: string;
    streamUrl: string;
    ultimasNoticias: Array<{ id: string; titulo: string; fechaCreacion: string; estado: string }>;
    ultimosProgramas: Array<{ id: string; nombrePrograma: string; diaSemana: string; horaInicio: string }>;
    listeners: number;
    storage?: {
        usedGB: number;
        totalGB: number;
        percentage: number;
    };
    radioId?: string;
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [streamOnline, setStreamOnline] = useState<boolean | null>(null);
    const [isPlanPortal, setIsPlanPortal] = useState(true);
    const [historicalStats, setHistoricalStats] = useState<any[]>([]);

    useEffect(() => {
        const rol = localStorage.getItem('usuario_rol');
        if (rol === 'EDITOR_NOTICIAS') {
            router.replace('/admin/noticias');
            return;
        }

        // En un entorno real se leería de un JWT.
        setIsPlanPortal(localStorage.getItem('usuario_plan') === 'portal');
        cargarDatos();
    }, [router]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            // Traemos datos en paralelo
            const results = await Promise.allSettled([
                api.get('/radios/config'),
                api.get('/noticias/admin/todas'),
                api.get('/programacion'),
                api.get('/radios/stats'),
                api.get('/radios/stats/historical'),
                api.get('/radios/stats/storage')
            ]);

            const radioRes = results[0];
            const noticiasRes = results[1];
            const programaRes = results[2];
            const statsRes = results[3];
            const histRes = results[4];
            const statsStorageRes = results[5];

            const radioData = radioRes.status === 'fulfilled' ? (radioRes as any).value.data : null;
            const noticiasData = noticiasRes.status === 'fulfilled' ? (noticiasRes as any).value.data : [];
            const programaData = programaRes.status === 'fulfilled' ? (programaRes as any).value.data : [];
            const listenersData = statsRes.status === 'fulfilled' ? (statsRes as any).value.data : { listeners: 0 };
            const storageData = statsStorageRes.status === 'fulfilled' ? (statsStorageRes as any).value.data : { usedGB: 0, totalGB: 5, percentage: 0 };

            setStats({
                radioId: radioData?.id,
                radioNombre: radioData?.nombre || 'Sin nombre',
                streamUrl: radioData?.streamUrl || '',
                totalNoticias: noticiasData.length,
                totalProgramas: programaData.length,
                ultimasNoticias: noticiasData.slice(0, 4),
                ultimosProgramas: programaData.slice(0, 4),
                listeners: listenersData.listeners || 0,
                storage: storageData
            });

            // Parsear datos históricos
            if (histRes.status === 'fulfilled') {
                const hData = (histRes as any).value.data || [];
                const parsedHist = hData.map((item: any) => ({
                    ...item,
                    fechaFormateada: new Date(item.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                    dia: new Date(item.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
                }));
                // Agrupar o simplemente usar raw (depende de la cantidad)
                setHistoricalStats(parsedHist);
            }

            // Verificar si el stream está online (HEAD request simple)
            if (radioData?.streamUrl) {
                fetch(radioData.streamUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
                    .then(() => setStreamOnline(true))
                    .catch(() => setStreamOnline(false));
            } else {
                setStreamOnline(false);
            }
        } catch (e: any) {
            setError('No se pudo conectar al backend. ¿Está el servidor iniciado?');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[80vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-slate-400 font-medium">Cargando métricas de la emisora...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[80vh]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <RadioTower className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Error de conexión</h2>
                    <p className="text-slate-400">{error}</p>
                    <button onClick={cargarDatos} className="bg-primary hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutDashboard className="text-primary w-6 h-6" />
                        <h1 className="text-3xl font-black text-white">Panel de Control</h1>
                    </div>
                    <p className="text-slate-400">Estado en tiempo real de <span className="text-primary font-semibold">{stats?.radioNombre}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${streamOnline === true
                            ? 'border-green-500/30 bg-green-500/10 text-green-400'
                            : streamOnline === false
                                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        }`}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{
                            backgroundColor: streamOnline === true ? 'rgb(74,222,128)' : streamOnline === false ? 'rgb(248,113,113)' : 'rgb(250,204,21)'
                        }} />
                        {streamOnline === true ? 'Stream ONLINE' : streamOnline === false ? 'Stream OFFLINE' : 'Verificando...'}
                    </div>
                </div>
            </div>

            {/* Banner de Limitación para Plan Audio */}
            {!isPlanPortal && (
                <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-blue-600/10 to-transparent border border-purple-500/30 rounded-3xl p-6 mb-8 group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap className="w-24 h-24 text-purple-400" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/10">
                            <Music2 className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-xl font-black text-white mb-1">Estás en el Plan de Solo Audio</h2>
                            <p className="text-slate-400 text-sm max-w-xl">
                                Tu emisora está funcionando correctamente, pero no tienes acceso al **Portal de Noticias, CMS, Programación Interactiva ni Publicidad**.
                            </p>
                        </div>
                        <Link 
                            href={`/checkout?plan=portal&radioId=${stats?.radioId || ''}`}
                            className="md:ml-auto bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-purple-600/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                        >
                            <TrendingUp className="w-4 h-4" /> ¡Pasar a Plan Portal ahora!
                        </Link>
                    </div>
                </div>
            )}

            {/* Tarjetas de Métricas Reales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Almacenamiento (Disco) */}
                <div className="bg-[#0f172a] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all flex items-center justify-between">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm font-medium mb-1">Espacio en Disco</p>
                        <h3 className="text-3xl font-black text-white">
                            {stats?.storage?.usedGB ?? 0} <span className="text-sm font-normal text-slate-500">/ {stats?.storage?.totalGB ?? 0} GB</span>
                        </h3>
                        <Link href="/admin/media" className="text-[10px] text-blue-400 mt-2 flex items-center gap-1 hover:underline">
                            Limpiar espacio <ChevronRight className="w-2 h-2" />
                        </Link>
                    </div>
                    
                    {/* Círculo de Progreso */}
                    <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
                            <circle 
                                cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                                className={`${(stats?.storage?.percentage ?? 0) > 90 ? 'text-red-500' : (stats?.storage?.percentage ?? 0) > 70 ? 'text-orange-500' : 'text-blue-500'}`}
                                strokeDasharray={`${stats?.storage?.percentage ?? 0}, 100`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-black text-white">{Math.round(stats?.storage?.percentage ?? 0)}%</span>
                        </div>
                    </div>
                </div>

                <div className={`bg-[#0f172a] border border-white/5 p-6 rounded-2xl relative overflow-hidden transition-colors ${isPlanPortal ? 'group hover:border-blue-500/20' : 'opacity-50 grayscale'}`}>
                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Newspaper className="w-28 h-28 text-blue-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Noticias Publicadas</p>
                    <h3 className="text-4xl font-black text-white">{isPlanPortal ? (stats?.totalNoticias ?? 0) : '—'}</h3>
                    {isPlanPortal && (
                        <Link href="/admin/noticias" className="text-[10px] text-blue-400 mt-2 flex items-center gap-1 hover:underline underline-offset-4">
                            Ver todas <ChevronRight className="w-2 h-2" />
                        </Link>
                    )}
                </div>

                <div className={`bg-[#0f172a] border border-white/5 p-6 rounded-2xl relative overflow-hidden transition-colors ${isPlanPortal ? 'group hover:border-purple-500/20' : 'opacity-50 grayscale'}`}>
                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-28 h-28 text-purple-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Programas</p>
                    <h3 className="text-4xl font-black text-white">{isPlanPortal ? (stats?.totalProgramas ?? 0) : '—'}</h3>
                    {isPlanPortal && (
                        <Link href="/admin/programacion" className="text-[10px] text-purple-400 mt-2 flex items-center gap-1 hover:underline underline-offset-4">
                            Ver grilla <ChevronRight className="w-2 h-2" />
                        </Link>
                    )}
                </div>

                <div className="bg-[#0f172a] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/20 transition-colors">
                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-28 h-28 text-green-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Oyentes Online</p>
                    <h3 className="text-4xl font-black text-white">{streamOnline ? (stats?.listeners ?? 0) : '0'}</h3>
                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${streamOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {streamOnline ? 'Conexiones activas' : 'Servidor offline'}
                    </p>
                </div>
            </div>

            {/* Gráfico Histórico */}
            <div className={`bg-[#0f172a] border border-white/5 rounded-3xl p-6 lg:p-8 ${!isPlanPortal ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-green-400" /> Rendimiento de Multitudes (Últimos 7 días)
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {!isPlanPortal ? 'Módulo bloqueado en tu plan actual.' : 'Picos de oyentes detectados en vivo.'}
                        </p>
                    </div>
                </div>

                {isPlanPortal ? (
                    <div className="h-[300px] w-full">
                        {historicalStats.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                Recolectando estadísticas... Los datos empezarán a poblarse pronto.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historicalStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="fechaFormateada" stroke="#64748b" fontSize={12} tickMargin={10} />
                                    <YAxis stroke="#64748b" fontSize={12} tickMargin={10} allowDecimals={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                        itemStyle={{ color: '#4ade80', fontWeight: 'bold' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="cantidad" 
                                        name="Oyentes"
                                        stroke="#4ade80" 
                                        strokeWidth={3} 
                                        dot={{ r: 4, fill: '#0f172a', stroke: '#4ade80', strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                ) : (
                    <div className="h-[300px] w-full flex flex-col items-center justify-center bg-black/20 rounded-2xl border border-white/5">
                        <Lock className="w-12 h-12 text-yellow-500/50 mb-4" />
                        <p className="text-slate-400 text-sm font-medium mb-4">Mejora al Plan Portal para ver analíticas</p>
                        <Link href={`/checkout?plan=portal&radioId=${stats?.radioId || ''}`} className="bg-yellow-500/10 text-yellow-500 font-bold px-6 py-2 rounded-xl text-sm border border-yellow-500/20 hover:bg-yellow-500/20 transition-all">
                            Ver Planes
                        </Link>
                    </div>
                )}
            </div>

            {/* Dos columnas: últimas noticias / grilla */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                {!isPlanPortal && (
                    <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl border border-white/5 mx-1">
                        <div className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl text-center shadow-2xl max-w-sm">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Módulos del Portal</h3>
                            <p className="text-slate-400 text-sm mb-6">Estas secciones son exclusivas para emisoras con el Plan Portal de noticias.</p>
                            <Link href={`/checkout?plan=portal&radioId=${stats?.radioId || ''}`} className="text-sm font-bold text-primary hover:underline">Ver comparación de planes</Link>
                        </div>
                    </div>
                )}
                
                {/* Últimas Noticias */}
                <div className={`bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden ${!isPlanPortal ? 'opacity-30 blur-[1px]' : ''}`}>
                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-blue-400" /> Últimas Noticias
                        </h2>
                        {isPlanPortal && (
                            <Link href="/admin/noticias" className="text-xs text-primary hover:underline flex items-center gap-1">
                                Nueva <PlusCircle className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                    <div className="divide-y divide-white/5">
                        {(stats?.ultimasNoticias.length ?? 0) === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-400 text-sm mb-3">No hay noticias publicadas aún.</p>
                                <Link href="/admin/noticias" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1">
                                    <PlusCircle className="w-3 h-3" /> Crear primera noticia
                                </Link>
                            </div>
                        ) : stats?.ultimasNoticias.map((n) => (
                            <div key={n.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium line-clamp-1">{n.titulo}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        {new Date(n.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <span className="ml-3 shrink-0 text-xs font-bold px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                                    {n.estado}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Próxima Programación */}
                <div className={`bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden ${!isPlanPortal ? 'opacity-30 blur-[1px]' : ''}`}>
                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" /> Grilla de Programación
                        </h2>
                        {isPlanPortal && (
                            <Link href="/admin/programacion" className="text-xs text-primary hover:underline flex items-center gap-1">
                                Editar <ChevronRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                    <div className="divide-y divide-white/5">
                        {(stats?.ultimosProgramas.length ?? 0) === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-400 text-sm mb-3">No hay programas cargados aún.</p>
                                <Link href="/admin/programacion" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1">
                                    <PlusCircle className="w-3 h-3" /> Agregar programa
                                </Link>
                            </div>
                        ) : stats?.ultimosProgramas.map((p) => (
                            <div key={p.id} className="flex items-center p-4 gap-4 hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium line-clamp-1">{p.nombrePrograma}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        {DIAS[Number(p.diaSemana) - 1] || `Día ${p.diaSemana}`} · {p.horaInicio}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Acciones Rápidas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Nueva Noticia', href: '/admin/noticias', color: 'blue', icon: PlusCircle, isPro: true },
                        { label: 'Editar Emisora', href: '/admin/emisora', color: 'green', icon: RadioTower, isPro: false },
                        { label: 'Programación', href: '/admin/programacion', color: 'purple', icon: Clock, isPro: true },
                        { label: 'Configuración', href: '/admin/settings', color: 'pink', icon: Activity, isPro: false },
                    ].map(({ label, href, color, icon: Icon, isPro }) => {
                        const bloqueado = isPro && !isPlanPortal;
                        return (
                            <Link
                                key={href}
                                href={bloqueado ? '#' : href}
                                className={`bg-[#0f172a] border border-white/5 p-5 rounded-2xl transition-all text-center ${bloqueado ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-white/10 hover:-translate-y-1 group'}`}
                                onClick={(e) => bloqueado && e.preventDefault()}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mx-auto mb-3 ${bloqueado ? '' : 'group-hover:scale-110'} transition-transform relative`}>
                                    <Icon className={`w-6 h-6 text-${color}-400`} />
                                    {bloqueado && <span className="absolute -top-2 -right-2 bg-yellow-500 text-black font-black text-[8px] px-1 rounded-sm">PRO</span>}
                                </div>
                                <p className="text-sm font-semibold text-white">{label}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
