"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Heart, ThumbsUp, Meh, ThumbsDown, Loader2 } from "lucide-react";

interface ReactionButtonsProps {
    noticiaId: string;
    initialStats?: {
        votosMeEncanto: number;
        votosInteresante: number;
        votosRegular: number;
        votosNoMeGusto: number;
    };
}

const REACCIONES = [
    { id: 'meEncanto', label: '¡Me encantó!', icon: Heart, color: 'text-primary', activeBg: 'bg-primary/20', borderColor: 'border-primary/30', dynamicColor: 'var(--primary)' },
    { id: 'interesante', label: 'Interesante', icon: ThumbsUp, color: 'text-primary/80', activeBg: 'bg-primary/10', borderColor: 'border-primary/20', dynamicColor: 'var(--primary)' },
    { id: 'regular', label: 'Regular', icon: Meh, color: 'text-yellow-500', activeBg: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', dynamicColor: '#eab308' },
    { id: 'noMeGusto', label: 'No me gustó', icon: ThumbsDown, color: 'text-slate-400', activeBg: 'bg-slate-500/20', borderColor: 'border-slate-500/30', dynamicColor: '#94a3b8' },
];

export default function ReactionButtons({ noticiaId, initialStats }: ReactionButtonsProps) {
    const [votado, setVotado] = useState(false);
    const [reaccionSeleccionada, setReaccionSeleccionada] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const [stats, setStats] = useState(initialStats || {
        votosMeEncanto: 0,
        votosInteresante: 0,
        votosRegular: 0,
        votosNoMeGusto: 0,
    });

    useEffect(() => {
        const checkVoto = localStorage.getItem(`voto_noticia_${noticiaId}`);
        if (checkVoto) {
            setVotado(true);
            setReaccionSeleccionada(checkVoto);
        }
    }, [noticiaId]);

    const handleReaccion = async (tipo: string) => {
        if (votado || cargando) return;

        setCargando(true);
        try {
            const res = await api.post(`/noticias/${noticiaId}/reaccionar`, { tipo });
            if (res.data.success) {
                setVotado(true);
                setReaccionSeleccionada(tipo);
                localStorage.setItem(`voto_noticia_${noticiaId}`, tipo);
                
                // Actualizar stats locales si el backend devuelve la noticia actualizada
                if (res.data.noticia) {
                    setStats({
                        votosMeEncanto: res.data.noticia.votosMeEncanto,
                        votosInteresante: res.data.noticia.votosInteresante,
                        votosRegular: res.data.noticia.votosRegular,
                        votosNoMeGusto: res.data.noticia.votosNoMeGusto,
                    });
                }
            }
        } catch (error) {
            console.error("Error al reaccionar:", error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="bg-[#0f172a]/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm mt-8">
            <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-black text-white">¿Qué te pareció esta nota?</h3>
                <p className="text-slate-400 text-sm mt-1">Tu opinión nos ayuda a mejorar el contenido.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {REACCIONES.map((r) => {
                    const isSelected = reaccionSeleccionada === r.id;
                    const Icon = r.icon;
                    
                    return (
                        <button
                            key={r.id}
                            onClick={() => handleReaccion(r.id)}
                            disabled={votado || cargando}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${
                                isSelected 
                                    ? ` ring-2 ring-white/5` 
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                            } ${votado && !isSelected ? 'opacity-50 grayscale-[0.5]' : ''} group`}
                            style={isSelected ? { 
                                backgroundColor: `${r.dynamicColor}33`, 
                                borderColor: `${r.dynamicColor}4d` 
                            } : {}}
                        >
                            <div 
                                className={`p-3 rounded-full transition-transform group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`}
                                style={{ color: r.dynamicColor }}
                            >
                                {cargando && isSelected ? <Loader2 className="w-8 h-8 animate-spin" /> : <Icon className="w-8 h-8" />}
                            </div>
                            <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                {r.label}
                            </span>
                            
                            {votado && (
                                <span className="text-xs font-mono text-slate-500 mt-1">
                                    {/* Mostrar conteo si es necesario, por ahora solo confirmamos voto */}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {votado && (
                <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <p className="text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        ¡Gracias por tu opinión!
                    </p>
                </div>
            )}
        </div>
    );
}
