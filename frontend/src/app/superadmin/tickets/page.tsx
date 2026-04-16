"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    MessageSquare, Loader2, CheckCircle, Clock, AlertTriangle,
    Send, ChevronDown, ChevronUp, X, RefreshCw, Circle
} from 'lucide-react';

const ESTADO_COLOR: Record<string, string> = {
    ABIERTO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    EN_PROCESO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    CERRADO: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

export default function SuperAdminTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandido, setExpandido] = useState<string | null>(null);
    const [respuesta, setRespuesta] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [filtro, setFiltro] = useState<'TODOS' | 'ABIERTO' | 'EN_PROCESO' | 'CERRADO'>('TODOS');

    const cargar = () => {
        setLoading(true);
        api.get('/tickets/admin')
            .then(r => setTickets(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, []);

    const handleResponder = async (ticketId: string) => {
        if (!respuesta.trim()) return;
        setEnviando(true);
        try {
            await api.put(`/tickets/${ticketId}/responder`, { contenido: respuesta });
            setRespuesta('');
            cargar();
        } catch { alert('Error respondiendo el ticket.'); }
        finally { setEnviando(false); }
    };

    const handleCerrar = async (ticketId: string) => {
        if (!confirm('¿Cerrar este ticket?')) return;
        await api.put(`/tickets/${ticketId}/cerrar`);
        cargar();
    };

    const filtrados = filtro === 'TODOS' ? tickets : tickets.filter(t => t.estado === filtro);
    const counts = {
        TODOS: tickets.length,
        ABIERTO: tickets.filter(t => t.estado === 'ABIERTO').length,
        EN_PROCESO: tickets.filter(t => t.estado === 'EN_PROCESO').length,
        CERRADO: tickets.filter(t => t.estado === 'CERRADO').length,
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <MessageSquare className="text-red-500 w-8 h-8" /> Tickets de Soporte
                    </h1>
                    <p className="text-slate-400 mt-1">Gestioná todos los tickets de los clientes.</p>
                </div>
                <button onClick={cargar} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6">
                {(['TODOS', 'ABIERTO', 'EN_PROCESO', 'CERRADO'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${filtro === f ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'text-slate-500 border-white/5 hover:text-white hover:border-white/10'}`}
                    >
                        {f === 'TODOS' ? 'Todos' : f === 'EN_PROCESO' ? 'En proceso' : f.charAt(0) + f.slice(1).toLowerCase()} ({counts[f]})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>
            ) : filtrados.length === 0 ? (
                <div className="bg-[#1a0a0a] border border-white/5 rounded-2xl py-16 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No hay tickets {filtro !== 'TODOS' ? `con estado ${filtro.toLowerCase()}` : ''}.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtrados.map((t: any) => {
                        const isOpen = expandido === t.id;
                        return (
                            <div key={t.id} className="bg-[#1a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpandido(isOpen ? null : t.id)}>
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.estado === 'ABIERTO' ? 'bg-yellow-400 animate-pulse' : t.estado === 'EN_PROCESO' ? 'bg-blue-400' : 'bg-slate-600'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white text-sm">{t.asunto}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            <span className="text-primary">{t.radio?.nombre || 'Radio'}</span>
                                            {' · '}
                                            {new Date(t.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            {' · '}{t.mensajes?.length || 0} mensajes
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${ESTADO_COLOR[t.estado]}`}>
                                            {t.estado === 'CERRADO' ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
                                                t.estado === 'EN_PROCESO' ? <Clock className="w-3 h-3 inline mr-1" /> :
                                                    <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                            {t.estado === 'EN_PROCESO' ? 'En proceso' : t.estado.charAt(0) + t.estado.slice(1).toLowerCase()}
                                        </span>
                                        {t.estado !== 'CERRADO' && (
                                            <button onClick={e => { e.stopPropagation(); handleCerrar(t.id); }} className="text-xs text-slate-600 hover:text-red-400 transition-colors p-1 rounded">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-white/5">
                                        {/* Hilo de mensajes */}
                                        <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
                                            {(t.mensajes || []).map((m: any) => (
                                                <div key={m.id} className={`flex ${m.esAdmin ? 'justify-start' : 'justify-end'}`}>
                                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.esAdmin ? 'bg-red-500/10 border border-red-500/20 text-white rounded-tl-sm' : 'bg-white/5 text-slate-300 rounded-tr-sm'}`}>
                                                        {m.esAdmin && <p className="text-xs text-red-400 font-bold mb-1">Admin ONRADIO</p>}
                                                        {!m.esAdmin && <p className="text-xs text-slate-500 font-bold mb-1">{t.radio?.nombre}</p>}
                                                        <p>{m.contenido}</p>
                                                        <p className="text-xs opacity-40 mt-1">{new Date(m.creadoEn || m.createdAt || Date.now()).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Responder */}
                                        {t.estado !== 'CERRADO' && (
                                            <div className="p-4 border-t border-white/5 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={expandido === t.id ? respuesta : ''}
                                                    onChange={e => setRespuesta(e.target.value)}
                                                    placeholder="Escribí tu respuesta al cliente..."
                                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-500/40 transition-all"
                                                    onKeyDown={e => e.key === 'Enter' && handleResponder(t.id)}
                                                />
                                                <button
                                                    onClick={() => handleResponder(t.id)}
                                                    disabled={enviando || !respuesta.trim()}
                                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 border border-red-500/20"
                                                >
                                                    {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
