"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Bell, BellOff, Send, Loader2, CheckCircle, ChevronRight, Users, History, AlertCircle } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function NotificacionesPage() {
    const [titulo, setTitulo] = useState('');
    const [cuerpo, setCuerpo] = useState('');
    const [url, setUrl] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState<{ enviadas: number; fallidas: number } | null>(null);
    const [historial, setHistorial] = useState<any[]>([]);
    const [suscriptores, setSuscriptores] = useState<number>(0);
    const [loadingHist, setLoadingHist] = useState(true);

    useEffect(() => {
        // Cargar historial y conteo
        Promise.allSettled([
            api.get('/push/history'),
            api.get('/push/count'),
        ]).then(([h, c]) => {
            if (h.status === 'fulfilled') setHistorial(h.value.data || []);
            if (c.status === 'fulfilled') setSuscriptores(c.value.data?.count || 0);
        }).finally(() => setLoadingHist(false));
    }, []);

    const handleEnviar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo || !cuerpo) return;
        setEnviando(true);
        setResultado(null);
        try {
            const res = await api.post('/push/send', { titulo, cuerpo, url: url || undefined });
            setResultado(res.data);
            setTitulo('');
            setCuerpo('');
            setUrl('');
            // Actualizar historial
            const h = await api.get('/push/history');
            setHistorial(h.data || []);
        } catch {
            alert('Error enviando la notificación. Verificá que hay suscriptores.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Bell className="text-yellow-400 w-8 h-8" /> Notificaciones Push
                </h1>
                <p className="text-slate-400 mt-1">Enviá alertas instantáneas a los oyentes que se suscribieron desde el portal.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                        <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white">{suscriptores}</p>
                        <p className="text-sm text-slate-400">Oyentes Suscritos</p>
                    </div>
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                        <History className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white">{historial.length}</p>
                        <p className="text-sm text-slate-400">Notificaciones Enviadas</p>
                    </div>
                </div>
            </div>

            {/* Formulario de envío */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
                    <Send className="w-4 h-4 text-yellow-400" /> Redactar Notificación
                </h2>

                {resultado && (
                    <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 text-green-400 text-sm font-medium">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        Enviada a <strong>{resultado.enviadas}</strong> oyente(s).
                        {resultado.fallidas > 0 && <span className="text-slate-400"> ({resultado.fallidas} suscripciones expiradas eliminadas)</span>}
                    </div>
                )}

                {suscriptores === 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3 text-yellow-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        No hay oyentes suscritos todavía. Cuando visiten el portal y acepten recibir notificaciones, aparecerán aquí.
                    </div>
                )}

                <form onSubmit={handleEnviar} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Título *</label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="Ej: ¡Estamos en el aire!"
                            maxLength={60}
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Mensaje *</label>
                        <textarea
                            value={cuerpo}
                            onChange={e => setCuerpo(e.target.value)}
                            placeholder="Ej: No te pierdas nuestra transmisión en vivo ahora mismo."
                            maxLength={120}
                            required
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
                        />
                        <p className="text-xs text-slate-500">{cuerpo.length}/120 caracteres</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">URL de acción (opcional)</label>
                        <input
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://... (página a abrir al hacer clic)"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 transition-all"
                        />
                    </div>

                    {/* Preview */}
                    {(titulo || cuerpo) && (
                        <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Vista previa</p>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <Bell className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{titulo || 'Título de la notificación'}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">{cuerpo || 'Aquí irá el mensaje...'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={enviando || suscriptores === 0}
                            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20"
                        >
                            {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar a {suscriptores} oyente{suscriptores !== 1 ? 's' : ''}</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Historial */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
                    <History className="w-4 h-4" /> Historial de envíos
                </h2>
                {loadingHist ? (
                    <div className="text-slate-500 flex items-center gap-2 py-4"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
                ) : historial.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4">Aún no se han enviado notificaciones.</p>
                ) : (
                    <div className="space-y-3">
                        {historial.map((n: any) => (
                            <div key={n.id} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <Bell className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white">{n.titulo}</p>
                                    <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{n.cuerpo}</p>
                                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                        <span>{new Date(n.enviadoEn).toLocaleString('es-AR')}</span>
                                        <span className="text-green-400 font-bold">✓ {n.enviadas} enviadas</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
