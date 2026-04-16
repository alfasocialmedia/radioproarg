"use client";

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import { Send, Music2, MessageSquare, Loader2, CheckCheck, Edit2, XCircle } from 'lucide-react';

interface ChatMessage {
    id: string;
    usuario: string; // nombre del emisor
    texto: string;
    hora: string;
    leido: boolean;
    esAdmin?: boolean;
    replyTo?: {
        usuario: string;
        texto: string;
    } | null;
}

export default function AdminLiveCabina() {
    const [token] = useState<string | undefined>(() =>
        typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || undefined) : undefined
    );
    const socket = useSocket(token);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [radioId, setRadioId] = useState<string | null>(null);
    const [nombreAdmin, setNombreAdmin] = useState(typeof window !== 'undefined' ? localStorage.getItem('chat_admin_name') || 'Admin' : 'Admin');
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Cargar historial
        api.get('/radios/config')
            .then(res => {
                const id = res.data.id;
                setRadioId(id);
                if (id) {
                    // Marcar como leidos al entrar
                    api.post('/chat/marcar-leidos')
                        .catch(err => console.error("Error al marcar leidos:", err?.message || err))
                        .finally(() => {
                            // Traer el historial
                            api.get('/chat')
                                .then(histRes => {
                                    // Mapear de base de datos a interfaz
                                    const hist = histRes.data.map((m: any) => ({
                                        id: m.id,
                                        usuario: m.nombreEmisor,
                                        texto: m.texto,
                                        hora: m.fechaCreacion,
                                        leido: m.leido,
                                        esAdmin: m.esAdmin,
                                        replyTo: m.replyTo ? {
                                            usuario: m.replyTo.nombreEmisor,
                                            texto: m.replyTo.texto
                                        } : null
                                    }));
                                    setMessages(hist);
                                    setLoading(false);
                                })
                                .catch(err => {
                                    console.error("Error al obtener historial", err?.message || err);
                                    setLoading(false);
                                });
                        });
                }
            })
            .catch(err => {
                console.error('Error fetching radio config:', err?.message || err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!socket || !radioId) return;

        const joinRoom = () => {
            socket.emit('unirse_a_radio', radioId);
            console.log("Admin unido a sala:", radioId);
        };

        joinRoom();
        socket.on('connect', joinRoom);

        const handleNuevoMensaje = (data: ChatMessage) => {
            setMessages(prev => [...prev, data]);
            
            // Marcar leídos instantáneamente si estamos en la pestaña
            if (document.visibilityState === 'visible') {
                api.post('/chat/marcar-leidos').catch(console.error);
            }
        };

        socket.on('nuevo_mensaje_chat', handleNuevoMensaje);

        const handleMensajeEditado = (data: { id: string, nuevoTexto: string }) => {
            setMessages(prev => prev.map(m => m.id === data.id ? { ...m, texto: data.nuevoTexto } : m));
        };
        socket.on('mensaje_chat_editado', handleMensajeEditado);

        return () => {
            socket.off('connect', joinRoom);
            socket.off('nuevo_mensaje_chat', handleNuevoMensaje);
            socket.off('mensaje_chat_editado', handleMensajeEditado);
        };
    }, [socket, radioId]);

    // Opcional: Marcar como leídos cuando la ventana retoma el foco
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                api.post('/chat/marcar-leidos').catch(console.error);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // Guardar nombre en localStorage al perder el foco (no en cada keystroke)
    const handleNombreBlur = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('chat_admin_name', nombreAdmin);
        }
    };
    
    const handleEnviar = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!nuevoMensaje.trim() || !radioId || !socket) return;

        setIsSending(true);
        socket.emit('enviar_mensaje_chat', {
            radioId,
            usuario: nombreAdmin || 'Admin',
            texto: nuevoMensaje,
            esAdmin: true,
            replyToId: replyingTo?.id || null
        });

        setNuevoMensaje("");
        setReplyingTo(null);
        setIsSending(false);
    };

    const handleGuardarEdicion = (id: string) => {
        if (!editText.trim() || !radioId || !socket) return;
        socket.emit('editar_mensaje_chat', { id, radioId, nuevoTexto: editText });
        setEditingId(null);
        setEditText("");
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[80vh]">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <MessageSquare className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Cabina Interactiva</h1>
                    <p className="text-slate-400 text-sm">Lee los mensajes de tus oyentes en tiempo real</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-green-400">EN VIVO</span>
                </div>
                
                {/* Selector de Nombre Admin */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tu Nombre:</span>
                    <input 
                        type="text" 
                        value={nombreAdmin}
                        onChange={(e) => setNombreAdmin(e.target.value)}
                        onBlur={handleNombreBlur}
                        placeholder="Admin Name"
                        className="bg-transparent border-none p-0 text-xs font-bold text-white focus:outline-none w-24"
                    />
                </div>
            </div>

            <div className="flex-1 bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                
                {/* Historial de Mensajes */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <Music2 className="w-12 h-12 mb-4 opacity-20" />
                            <p>No hay mensajes en la cabina todavía.</p>
                            <p className="text-sm">¡Invita a tus oyentes a escribir desde el portal!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id || msg.hora} className="flex gap-4 group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg font-bold text-white uppercase ${
                                    msg.esAdmin ? 'bg-gradient-to-br from-rose-500 to-pink-600 ring-2 ring-rose-500/30' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                                }`}>
                                    {msg.usuario.substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <h4 className={`font-bold leading-none ${msg.esAdmin ? 'text-rose-400' : 'text-white'}`}>
                                            {msg.usuario}
                                            {msg.esAdmin && <span className="ml-2 text-[8px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-md border border-rose-500/20">OFICIAL</span>}
                                        </h4>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {new Date(msg.hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {!msg.esAdmin && (
                                            <button 
                                                onClick={() => setReplyingTo(msg)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-blue-400 transition-all"
                                                title="Responder a este mensaje"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className={`border rounded-2xl rounded-tl-none p-4 leading-relaxed max-w-2xl relative transition-colors ${
                                        msg.esAdmin 
                                        ? 'bg-rose-500/5 border-rose-500/20 text-slate-200 group-hover:bg-rose-500/10' 
                                        : 'bg-white/5 border-white/10 text-slate-300 group-hover:bg-white/10'
                                    }`}>
                                        {/* Renderizado de Cita (Reply) */}
                                        {msg.replyTo && (
                                            <div className="mb-3 bg-black/30 border-l-2 border-rose-500/50 p-2 rounded-r-lg text-[11px] opacity-80">
                                                <p className="font-black text-rose-500 mb-0.5 uppercase tracking-tighter">Respondiendo a {msg.replyTo.usuario}</p>
                                                <p className="italic text-slate-400 line-clamp-1">"{msg.replyTo.texto}"</p>
                                            </div>
                                        )}
                                        
                                        {editingId === msg.id ? (
                                            <div className="space-y-3">
                                                <textarea 
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full bg-black/40 border border-rose-500/50 rounded-xl p-3 text-sm text-white focus:outline-none"
                                                    rows={3}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">Cancelar</button>
                                                    <button onClick={() => handleGuardarEdicion(msg.id)} className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-lg transition-all">Guardar Corrección</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {msg.texto}
                                                {msg.esAdmin && (
                                                    <button 
                                                        onClick={() => {
                                                            setEditingId(msg.id);
                                                            setEditText(msg.texto);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all bg-black/40 rounded-lg"
                                                        title="Editar mensaje"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Zona de Reply activo */}
                {replyingTo && (
                    <div className="bg-blue-500/10 border-t border-blue-500/20 px-6 py-2 flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <div className="text-[11px] truncate">
                                <span className="font-bold text-blue-400">Respondiendo a {replyingTo.usuario}: </span>
                                <span className="text-slate-500 italic">"{replyingTo.texto}"</span>
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-500 hover:text-white transition-colors" title="Cancelar respuesta">
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Zona Inferior: Respuesta */}
                <form onSubmit={handleEnviar} className="p-4 bg-white/5 border-t border-white/10 flex gap-4 items-center">
                    <input 
                        type="text" 
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe una respuesta oficial..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-600"
                    />
                    <button 
                        type="submit"
                        disabled={isSending || !nuevoMensaje.trim()}
                        className="w-14 h-14 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/20 transition-all active:scale-95"
                    >
                        {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                </form>

                <div className="p-4 bg-[#0a0f1e] border-t border-white/5 text-center">
                    <p className="text-xs font-medium text-slate-500 flex items-center justify-center gap-2">
                        <CheckCheck className="w-4 h-4 text-blue-400" /> Los mensajes se reciben automáticamente vía WebSockets. No necesitas recargar.
                    </p>
                </div>
            </div>
        </div>
    );
}
