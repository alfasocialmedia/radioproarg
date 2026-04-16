"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    DollarSign, Loader2, RefreshCw, TrendingUp,
    CheckCircle, XCircle, Clock, CreditCard, Filter
} from 'lucide-react';

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    APROBADO: { label: 'Aprobado', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    PENDIENTE: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    RECHAZADO: { label: 'Rechazado', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    EN_PROCESO: { label: 'En proceso', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    DEVUELTO: { label: 'Devuelto', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

export default function SuperAdminPagosPage() {
    const [pagos, setPagos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroMetodo, setFiltroMetodo] = useState('TODOS');

    const cargar = () => {
        setLoading(true);
        api.get('/pagos/todos')
            .then(r => setPagos(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, []);

    const pagosAprobados = pagos.filter(p => p.estado === 'APROBADO');
    const mrr = pagosAprobados.reduce((a, p) => a + p.monto, 0);
    const mrrAvg = pagosAprobados.length > 0 ? mrr / pagosAprobados.length : 0;

    const filtrados = pagos.filter(p => {
        const okEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
        const okMetodo = filtroMetodo === 'TODOS' || p.metodo === filtroMetodo;
        return okEstado && okMetodo;
    });

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <DollarSign className="text-red-500 w-8 h-8" /> Gestión de Pagos
                    </h1>
                    <p className="text-slate-400 mt-1">Historial de todos los pagos de la plataforma.</p>
                </div>
                <button onClick={cargar} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1a0a0a] border border-white/5 rounded-2xl p-5 col-span-1">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Total Recaudado</p>
                    <p className="text-3xl font-black text-green-400">${mrr.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-slate-500 mt-1">en pagos aprobados</p>
                </div>
                <div className="bg-[#1a0a0a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Transacciones</p>
                    <p className="text-3xl font-black text-white">{pagos.length}</p>
                </div>
                <div className="bg-[#1a0a0a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Aprobados</p>
                    <p className="text-3xl font-black text-green-400">{pagosAprobados.length}</p>
                </div>
                <div className="bg-[#1a0a0a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Rechazados</p>
                    <p className="text-3xl font-black text-red-400">{pagos.filter(p => p.estado === 'RECHAZADO').length}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Filter className="w-4 h-4" />
                    <select
                        value={filtroEstado}
                        onChange={e => setFiltroEstado(e.target.value)}
                        className="bg-black/30 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs"
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="APROBADO">Aprobados</option>
                        <option value="PENDIENTE">Pendientes</option>
                        <option value="RECHAZADO">Rechazados</option>
                        <option value="DEVUELTO">Devueltos</option>
                    </select>
                    <select
                        value={filtroMetodo}
                        onChange={e => setFiltroMetodo(e.target.value)}
                        className="bg-black/30 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs"
                    >
                        <option value="TODOS">Todos los métodos</option>
                        <option value="mercadopago">MercadoPago</option>
                        <option value="paypal">PayPal</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-[#1a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>
                ) : filtrados.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">No hay pagos para los filtros seleccionados.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    {['Fecha', 'Radio / Cliente', 'Monto', 'Método', 'Estado', 'MP ID'].map(h => (
                                        <th key={h} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtrados.map((p: any) => {
                                    const est = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.PENDIENTE;
                                    return (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-sm text-slate-400">
                                                {new Date(p.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-white">{p.radio?.nombre || '—'}</p>
                                                <p className="text-xs text-slate-500">{p.radio?.subdominio || ''}</p>
                                            </td>
                                            <td className="p-4 text-sm font-black text-white">
                                                ${p.monto?.toLocaleString('es-AR')}
                                                <span className="text-xs text-slate-500 font-normal ml-1">{p.moneda}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                                    <CreditCard className="w-3 h-3" />
                                                    {p.metodo === 'mercadopago' ? 'MercadoPago' : p.metodo || '—'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${est.color}`}>
                                                    {p.estado === 'APROBADO' ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
                                                        p.estado === 'RECHAZADO' ? <XCircle className="w-3 h-3 inline mr-1" /> :
                                                            <Clock className="w-3 h-3 inline mr-1" />}
                                                    {est.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-600 font-mono">
                                                {p.mpPaymentId ? p.mpPaymentId.slice(0, 12) + '...' : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
