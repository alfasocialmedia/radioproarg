"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket, initSocket } from "@/lib/socket";
import { api } from "@/lib/api";
import { Send, UserCircle2, Smile, Edit2, Check } from "lucide-react";

interface Mensaje {
    id: string;
    horario: string;
    usuario: string;
    texto: string;
    esAdmin?: boolean;
    replyTo?: {
        usuario: string;
        texto: string;
    } | null;
}

const EMOJIS = ["😀", "😂", "😍", "🔥", "👍", "🙏", "👏", "🎶", "📻", "❤️", "🙌", "🎙️"];

export default function ChatBox({ radioId, isPureRadio = false }: { radioId: string, isPureRadio?: boolean }) {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [mensajeActual, setMensajeActual] = useState("");
    const [miNombreUsuario, setMiNombreUsuario] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [showEmojis, setShowEmojis] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const socket = useSocket();

    useEffect(() => {
        // Cargar nombre de localStorage o generar uno aleatorio
        const savedName = localStorage.getItem('onradio_chat_name');
        if (savedName) {
            setMiNombreUsuario(savedName);
            setTempName(savedName);
        } else {
            const alias = `Oyente_${Math.floor(Math.random() * 1000)}`;
            setMiNombreUsuario(alias);
            setTempName(alias);
            // PERSISTENCIA: Guardar el alias generado para que no cambie al recargar
            localStorage.setItem('onradio_chat_name', alias);
        }

    }, []);

    // Cargar Historial Público
    useEffect(() => {
        if (!radioId) return;

        api.get(`/chat/public/${radioId}`)
            .then(res => {
                const hist = res.data.map((m: any) => ({
                    id: m.id,
                    usuario: m.nombreEmisor,
                    texto: m.texto,
                    horario: new Date(m.fechaCreacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                    esAdmin: m.esAdmin,
                    replyTo: m.replyTo ? {
                        usuario: m.replyTo.nombreEmisor,
                        texto: m.replyTo.texto
                    } : null
                })).reverse();
                setMensajes(hist);
            })
            .catch(err => console.error("Error cargando historial público", err));
    }, [radioId]);

    useEffect(() => {
        if (!socket || !radioId) return;

        const joinRoom = () => {
            socket.emit("unirse_a_radio", radioId);
            console.log("Oyente unido a sala:", radioId);
        };

        joinRoom();
        socket.on('connect', joinRoom);

        const handleMessage = (data: any) => {
            const fecha = new Date(data.hora);
            const msjFormateado = {
                id: data.id,
                usuario: data.usuario,
                texto: data.texto,
                horario: `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`,
                esAdmin: data.esAdmin,
                replyTo: data.replyTo
            };
            setMensajes(prev => [...prev, msjFormateado]);
        };

        socket.on("nuevo_mensaje_chat", handleMessage);

        const handleEdit = (data: { id: string, nuevoTexto: string }) => {
            setMensajes(prev => prev.map(m => m.id === data.id ? { ...m, texto: data.nuevoTexto } : m));
        };
        socket.on("mensaje_chat_editado", handleEdit);

        return () => {
            socket.off('connect', joinRoom);
            socket.off("nuevo_mensaje_chat", handleMessage);
            socket.off("mensaje_chat_editado", handleEdit);
        };
    }, [socket, radioId]);

    // Auto-scroll al fondo
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensajes]);

    const saveName = () => {
        if (!tempName.trim()) return;
        setMiNombreUsuario(tempName);
        localStorage.setItem('onradio_chat_name', tempName);
        setIsEditingName(false);
    };

    const addEmoji = (emoji: string) => {
        setMensajeActual(prev => prev + emoji);
        setShowEmojis(false);
    };

    const enviarMensaje = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mensajeActual.trim()) return;

        if (socket) {
            socket.emit("enviar_mensaje_chat", {
                radioId,
                usuario: miNombreUsuario,
                texto: mensajeActual
            });
        }

        setMensajeActual("");
        setShowEmojis(false);
    };

    return (
        <div className={`${isPureRadio ? 'bg-transparent' : 'bg-[#0f172a]/90 border-white/5 backdrop-blur-sm shadow-lg'} border border-transparent rounded-2xl flex flex-col h-[500px] relative overflow-hidden`}>
            {/* Estilos Inyectados para Scrollbar Moderno */}
            <style dangerouslySetInnerHTML={{ __html: `
                .chat-scroll::-webkit-scrollbar {
                    width: 5px;
                }
                .chat-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .chat-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                /* Firefox */
                .chat-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
                }
            `}} />

            {/* Header / Name Config */}
            <div className="bg-black/30 p-3 lg:p-4 border-b border-white/5 flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Chat en Vivo
                    </h3>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                    <UserCircle2 className="w-5 h-5 text-slate-400" />
                    {isEditingName ? (
                        <div className="flex items-center flex-1 gap-2">
                            <input 
                                type="text" 
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                maxLength={20}
                                className="w-full bg-black/40 border border-[var(--primary)]/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                placeholder="Escribe tu alias..."
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                            />
                            <button onClick={saveName} className="text-green-400 hover:text-green-300 transition-colors p-1">
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between flex-1 group">
                            <span className="text-sm font-medium text-slate-300 truncate">{miNombreUsuario}</span>
                            <button onClick={() => setIsEditingName(true)} className="text-slate-500 hover:text-[var(--primary)] transition-colors opacity-0 group-hover:opacity-100 p-1">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Listado de mensajes */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-black/5 chat-scroll">
                {mensajes.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-slate-500 text-sm text-center px-4">
                            ¡El chat está libre! Sé el primero en mandar saludos a la radio.
                        </p>
                    </div>
                ) : (
                    mensajes.map((msj, idx) => (
                        <div key={idx} className={`flex flex-col ${msj.usuario === miNombreUsuario ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1.5 mb-1 opacity-80">
                                {msj.usuario !== miNombreUsuario && (
                                    msj.esAdmin ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> : <UserCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span className={`text-[11px] font-bold ${
                                    msj.usuario === miNombreUsuario ? 'text-[var(--primary)]' : (msj.esAdmin ? 'text-white' : 'text-slate-200')
                                }`}>
                                    {msj.usuario}
                                    {msj.esAdmin && (
                                        <span 
                                            className="ml-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm"
                                            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                                        >
                                            OFICIAL
                                        </span>
                                    )}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono ml-1">{msj.horario}</span>
                            </div>
                             <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] leading-snug shadow-sm ${
                                msj.usuario === miNombreUsuario 
                                ? 'bg-[var(--primary)] font-medium text-white rounded-tr-sm shadow-[0_2px_8px_rgba(var(--primary-rgb),0.3)]' 
                                : (msj.esAdmin ? 'bg-white/10 text-white border border-white/20 rounded-tl-sm' : 'bg-slate-800 text-slate-100 border border-white/5 rounded-tl-sm')
                            }`}
                            style={msj.usuario === miNombreUsuario ? { 
                                filter: 'brightness(1.1)',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            } : {}}
                            >
                                {msj.replyTo && (
                                    <div className="mb-2 bg-black/30 border-l-2 p-2 rounded-r-lg text-[10px]" style={{ borderColor: 'var(--primary)' }}>
                                        <p className="font-bold mb-0.5" style={{ color: 'var(--primary)' }}>Resp. a {msj.replyTo.usuario}</p>
                                        <p className="italic text-slate-400 line-clamp-1">"{msj.replyTo.texto}"</p>
                                    </div>
                                )}
                                {msj.texto}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Config & Emojis Panel */}
            <div className="bg-black/30 border-t border-white/5 relative p-3">
                {showEmojis && (
                    <div className="absolute bottom-full left-0 mb-2 w-full p-2">
                        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-3 shadow-2xl grid grid-cols-6 gap-2">
                            {EMOJIS.map(emj => (
                                <button key={emj} onClick={() => addEmoji(emj)} type="button" className="text-xl hover:scale-125 transition-transform">
                                    {emj}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <form onSubmit={enviarMensaje} className="flex gap-2 items-end">
                    <button
                        type="button"
                        onClick={() => setShowEmojis(!showEmojis)}
                        className={`p-2.5 rounded-xl transition-colors shrink-0 ${showEmojis ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                    
                    <textarea
                        value={mensajeActual}
                        onChange={(e) => setMensajeActual(e.target.value)}
                        placeholder="Mensaje..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)]/50 transition-colors resize-none overflow-hidden h-11"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                enviarMensaje(e);
                            }
                        }}
                    />
                    
                    <button
                        type="submit"
                        disabled={!mensajeActual.trim()}
                        className="bg-[var(--primary)] text-white p-2.5 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-700 shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
