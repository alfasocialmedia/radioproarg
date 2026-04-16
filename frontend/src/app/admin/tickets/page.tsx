"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { LifeBuoy, PlusCircle, Send, MessageSquare, CheckCircle, Loader2, X, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    ABIERTO: { label: 'Abierto', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    EN_PROCESO: { label: 'En proceso', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    CERRADO: { label: 'Cerrado', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ asunto: '', mensaje: '' });
    const [saving, setSaving] = useState(false);
    const [expandido, setExpandido] = useState<string | null>(null);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const mensajesRef = useRef<HTMLDivElement>(null);

    const cargar = () => {
        setLoading(true);
        api.get('/tickets')
            .then(r => setTickets(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, []);

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/tickets', form);
            setShowModal(false);
            setForm({ asunto: '', mensaje: '' });
            cargar();
        } catch { alert('Error creando el ticket.'); }
        finally { setSaving(false); }
    };

    const handleEnviarMensaje = async (ticketId: string) => {
        if (!nuevoMensaje.trim()) return;
        setEnviando(true);
        try {
            await api.post(`/tickets/${ticketId}/mensajes`, { contenido: nuevoMensaje });
            setNuevoMensaje('');
            cargar();
        } catch { alert('Error enviando el mensaje.'); }
        finally { setEnviando(false); }
    };

    const ticketActual = tickets.find(t => t.id === expandido);

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <LifeBuoy className="text-primary w-8 h-8" /> Soporte
                    </h1>
                    <p className="text-slate-400 mt-1">Tickets de soporte técnico con el equipo de ONRADIO.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <PlusCircle className="w-4 h-4" /> Nuevo Ticket
                </button>
            </div>

            {/* Lista de tickets o estado vacío */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>
            ) : tickets.length === 0 ? (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl py-16 text-center">
                    <LifeBuoy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No tenés tickets abiertos.</p>
                    <p className="text-slate-600 text-sm mt-1">¿Tenés alguna consulta o problema? Abrí un ticket.</p>
                    <button onClick={() => setShowModal(true)} className="mt-4 text-primary hover:underline text-sm font-bold">+ Crear primer ticket</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((t: any) => {
                        const est = ESTADO_CONFIG[t.estado] || ESTADO_CONFIG.ABIERTO;
                        const isOpen = expandido === t.id;
                        return (
                            <div key={t.id} className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpandido(isOpen ? null : t.id)}>
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.estado === 'ABIERTO' ? 'bg-yellow-400 animate-pulse' : t.estado === 'EN_PROCESO' ? 'bg-blue-400' : 'bg-slate-600'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white text-sm">{t.asunto}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {new Date(t.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })} · {t.mensajes?.length || 0} mensajes
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 ${est.color}`}>
                                        {t.estado === 'CERRADO' ? <><CheckCircle className="w-3 h-3 inline mr-1" />Cerrado</> :
                                            t.estado === 'EN_PROCESO' ? <><Clock className="w-3 h-3 inline mr-1" />En proceso</> :
                                                <><AlertTriangle className="w-3 h-3 inline mr-1" />Abierto</>}
                                    </span>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                                </div>

                                {isOpen && (
                                    <div className="border-t border-white/5">
                                        {/* Hilo de mensajes */}
                                        <div ref={mensajesRef} className="p-5 space-y-3 max-h-80 overflow-y-auto">
                                            {(t.mensajes || []).map((m: any) => (
                                                <div key={m.id} className={`flex ${m.esAdmin ? 'justify-start' : 'justify-end'}`}>
                                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.esAdmin ? 'bg-white/5 text-white rounded-tl-sm' : 'bg-primary/20 text-blue-100 border border-primary/20 rounded-tr-sm'}`}>
                                                        {m.esAdmin && <p className="text-xs text-primary font-bold mb-1">Soporte ONRADIO</p>}
                                                        <p>{m.contenido}</p>
                                                        <p className="text-xs opacity-40 mt-1">{new Date(m.creadoEn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Enviar mensaje */}
                                        {t.estado !== 'CERRADO' && (
                                            <div className="p-4 border-t border-white/5 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={nuevoMensaje}
                                                    onChange={e => setNuevoMensaje(e.target.value)}
                                                    placeholder="Escribí tu respuesta..."
                                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                                    onKeyDown={e => e.key === 'Enter' && handleEnviarMensaje(t.id)}
                                                />
                                                <button
                                                    onClick={() => handleEnviarMensaje(t.id)}
                                                    disabled={enviando || !nuevoMensaje.trim()}
                                                    className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 border border-primary/20"
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

            {/* Modal nuevo ticket */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" /> Nuevo Ticket
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCrear} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Asunto</label>
                                <input
                                    required
                                    value={form.asunto}
                                    onChange={e => setForm({ ...form, asunto: e.target.value })}
                                    placeholder="Ej: No puedo conectar el software de transmisión"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Descripción del problema</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.mensaje}
                                    onChange={e => setForm({ ...form, mensaje: e.target.value })}
                                    placeholder="Describirlo con el mayor detalle posible ayuda a resolver más rápido..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition">Cancelar</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando</> : <><Send className="w-4 h-4" /> Crear Ticket</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
