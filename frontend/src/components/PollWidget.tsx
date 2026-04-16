"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { initSocket } from "@/lib/socket";
import { BarChart3, CheckCircle2, Clock, Share2, Copy, Check } from "lucide-react";
import { useParams } from "next/navigation";

interface OpcionEncuesta {
    id: string;
    texto: string;
    votos: number;
    imagenUrl?: string | null;
}

interface EncuestaActiva {
    id: string;
    pregunta: string;
    opciones: OpcionEncuesta[];
    activa: boolean;
    estilo: string;
    mostrarResultados: boolean;
    fechaFin?: string | null;
}

export default function PollWidget({ radioId, noticiaId }: { radioId?: string, noticiaId?: string }) {
    const [encuesta, setEncuesta] = useState<EncuestaActiva | null>(null);
    const [votado, setVotado] = useState(false);
    const [opcionVotadaId, setOpcionVotadaId] = useState<string | null>(null);
    const [isClosed, setIsClosed] = useState(false);
    const [compartidoCopied, setCompartidoCopied] = useState(false);

    const params = useParams();
    const slug = params?.slug as string;

    // Cargar estado inicial y suscribir a sockets
    useEffect(() => {
        if (!radioId && !noticiaId) return;

        const cargarEncuesta = async () => {
            try {
                let url = '';
                if (noticiaId) {
                    url = `/encuestas/noticia/${noticiaId}`;
                } else if (radioId) {
                    url = `/encuestas/activa`;
                }

                if (url) {
                    const res = await api.get(url);
                    if (res.data) {
                        setEncuesta(res.data);
                        if (res.data.fechaFin && new Date(res.data.fechaFin) < new Date()) {
                            setIsClosed(true);
                            setVotado(true);
                        }
                        const localVote = localStorage.getItem(`encuesta_votada_${res.data.id}`);
                        if (localVote) {
                            setVotado(true);
                            setOpcionVotadaId(localVote);
                        }
                    } else if (noticiaId && radioId) {
                        const resGlobal = await api.get(`/encuestas/activa`);
                        if (resGlobal.data) {
                            setEncuesta(resGlobal.data);
                            const localGlobalVote = localStorage.getItem(`encuesta_votada_${resGlobal.data.id}`);
                            if (localGlobalVote) {
                                setVotado(true);
                                setOpcionVotadaId(localGlobalVote);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error al cargar encuesta:", error);
            }
        };

        cargarEncuesta();

        const socket = initSocket();

        if (radioId) {
            socket.emit("unirse_a_radio", radioId);
        }

        const onNuevaEncuesta = (nuevaObj: EncuestaActiva) => {
            if (noticiaId && nuevaObj.id === encuesta?.id) {
                setEncuesta(nuevaObj);
            } else if (!noticiaId) {
                setEncuesta(nuevaObj);
                setVotado(false);
                setOpcionVotadaId(null);
                setIsClosed(false);
            }
        };

        const onVotosActualizados = (encuestaModificada: EncuestaActiva) => {
            if (encuestaModificada.id === encuesta?.id || (!noticiaId && encuestaModificada.activa)) {
                setEncuesta(encuestaModificada);
            }
        };

        socket.on('nueva_encuesta', onNuevaEncuesta);
        socket.on('votos_actualizados', onVotosActualizados);

        return () => {
            socket.off('nueva_encuesta', onNuevaEncuesta);
            socket.off('votos_actualizados', onVotosActualizados);
        };
    }, [radioId, noticiaId]);

    const handleVote = async (opcionId: string) => {
        if (votado || isClosed || !encuesta) return;
        try {
            await api.post(`/encuestas/votar/${opcionId}`);
            setVotado(true);
            setOpcionVotadaId(opcionId);
            localStorage.setItem(`encuesta_votada_${encuesta.id}`, opcionId);
        } catch (e) {
            console.error("Error al emitir voto", e);
        }
    };

    // ── Compartir Encuesta ──────────────────────────────────────────────────────
    const handleShare = async () => {
        if (!encuesta) return;

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const radioSlug = slug || '';
        const shareUrl = `${baseUrl}/radio/${radioSlug}?poll=${encuesta.id}`;
        
        const textoGancho = `🔥 ¡Queremos saber tu opinión! 🔥\n\n🗳️ *${encuesta.pregunta.toUpperCase()}*\n\nParticipá ahora en nuestra encuesta desde aquí 👇\n${shareUrl}\n\n📻 ¡Tu voz cuenta en nuestra radio! 🎙️`;

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `Encuesta: ${encuesta.pregunta}`,
                    text: textoGancho,
                    url: shareUrl,
                });
            } catch (e) {
                // El usuario canceló el share, ignoramos
            }
        } else {
            // Fallback: copiar al portapapeles
            try {
                await navigator.clipboard.writeText(`${textoGancho}\n${shareUrl}`);
                setCompartidoCopied(true);
                setTimeout(() => setCompartidoCopied(false), 2500);
            } catch (e) {
                console.error("No se pudo copiar:", e);
            }
        }
    };
    // ──────────────────────────────────────────────────────────────────────────

    if (!encuesta) return null;

    const totalVotos = encuesta.opciones.reduce((acc, opt) => acc + opt.votos, 0);
    const est = encuesta.estilo || 'premium';

    const containerStyles: Record<string, string> = {
        basic: "bg-white border border-slate-200 shadow-sm text-slate-900",
        premium: "glass-panel bg-white/5 border border-white/10 backdrop-blur-xl text-white shadow-2xl",
        modern: "backdrop-blur-xl text-white",
        brutal: "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black font-black",
    };

    const buttonStyles: Record<string, string> = {
        basic: "border-slate-200 bg-slate-50 hover:bg-slate-100",
        premium: "border-white/10 bg-black/20 hover:bg-white/5",
        modern: "border-white/10 bg-white/5 hover:bg-white/10",
        brutal: "border-2 border-black bg-white hover:bg-black hover:text-white transition-none",
    };

    const activeStyles: Record<string, string> = {
        basic: "text-primary",
        premium: "border-primary/50 text-white",
        modern: "text-white",
        brutal: "border-2 border-black text-white",
    };

    return (
        <div className={`w-full rounded-3xl p-5 relative overflow-hidden transition-all duration-500 ${containerStyles[est]} max-w-lg mx-auto`}
            style={est === 'modern' ? { backgroundColor: 'rgba(var(--secondary-rgb), 0.4)', borderColor: 'rgba(var(--primary-rgb), 0.2)' } : {}}
        >
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: est === 'brutal' ? '#000' : 'var(--primary)' }} />
                    <h3 className={`font-black text-[9px] uppercase tracking-[0.2em] ${est === 'basic' ? 'text-slate-500' : 'opacity-60'}`}>
                        {isClosed ? 'Finalizada' : 'Encuesta'}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {isClosed && <span className="text-[9px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded-lg uppercase tracking-widest">Cerrado</span>}
                    
                    {/* Botón Compartir */}
                    <button
                        onClick={handleShare}
                        title="Compartir encuesta"
                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full transition-all ${
                            compartidoCopied
                                ? 'bg-green-500/20 text-green-400'
                                : est === 'brutal'
                                    ? 'bg-black text-white hover:bg-slate-800'
                                    : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                        }`}
                    >
                        {compartidoCopied
                            ? <><Check className="w-3 h-3" /> Copiado</>
                            : <><Share2 className="w-3 h-3" /> Compartir</>
                        }
                    </button>
                </div>
            </div>

            <p className={`text-lg font-black mb-5 leading-tight ${est === 'brutal' ? 'uppercase' : ''}`}>
                {encuesta.pregunta}
            </p>

            <div className="space-y-2.5">
                {encuesta.opciones.map((opcion) => {
                    const porcentaje = totalVotos === 0 ? 0 : Math.round((opcion.votos / totalVotos) * 100);
                    const isSelected = opcionVotadaId === opcion.id;

                    return (
                        <div key={opcion.id} className="relative">
                            <button
                                onClick={() => handleVote(opcion.id)}
                                disabled={votado || isClosed}
                                className={`w-full text-left relative z-10 p-3 rounded-2xl border flex justify-between items-center transition-all ${
                                    isSelected ? activeStyles[est] : buttonStyles[est]
                                } ${votado && !isSelected ? 'opacity-40 cursor-default' : ''}`}
                                style={isSelected ? { 
                                    borderColor: est === 'brutal' ? '#000' : 'var(--primary)',
                                    backgroundColor: est === 'brutal' ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.2)' 
                                } : {}}
                            >
                                <span className="flex items-center gap-3 font-bold text-xs flex-1">
                                    {opcion.imagenUrl && (
                                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                            <img src={opcion.imagenUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <span className="line-clamp-2">{opcion.texto}</span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </span>
                                {votado && (encuesta.mostrarResultados || isClosed) && (
                                    <span className="font-black text-sm ml-2">{porcentaje}%</span>
                                )}
                            </button>

                            {/* Barra de progreso de fondo */}
                            {votado && (encuesta.mostrarResultados || isClosed) && (
                                <div
                                    className={`absolute top-0 left-0 bottom-0 rounded-2xl transition-all duration-1000 ease-out ${
                                        isSelected ? '' : 'opacity-10 bg-current'
                                    }`}
                                    style={{ 
                                        width: `${porcentaje}%`, 
                                        zIndex: 0,
                                        backgroundColor: isSelected ? 'var(--primary)' : undefined,
                                        opacity: isSelected ? 0.2 : undefined
                                    }}
                                />
                            )}
                            {votado && !encuesta.mostrarResultados && !isClosed && isSelected && (
                                <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                                    <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full" style={{ color: 'var(--primary)', backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>Voto Registrado ✓</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex justify-between items-center opacity-50">
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {totalVotos} votos
                </span>
                {encuesta.fechaFin && !isClosed && (
                    <span className="text-[9px] font-black flex items-center gap-1 uppercase tracking-widest">
                        <Clock className="w-3 h-3" /> termina pronto
                    </span>
                )}
            </div>
        </div>
    );
}
