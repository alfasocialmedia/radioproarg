"use client";

import { useState, useRef } from 'react';
import { Headphones, PlayCircle, PauseCircle, Link2, Calendar, Play, Pause } from 'lucide-react';

export default function PodcastCard({ p }: { p: any }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Error al reproducir audio:", e));
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div 
            className="group flex flex-col border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 relative"
            style={{ backgroundColor: 'var(--secondary)' }}
        >
            
            {/* Elemento de audio invisible pero funcional */}
            {p.audioMp3Url && (
                <audio 
                    ref={audioRef}
                    src={p.audioMp3Url} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    preload="metadata"
                />
            )}

            <div className="w-full aspect-square bg-slate-800 relative overflow-hidden shrink-0">
                {p.portadaUrl
                    ? <img src={p.portadaUrl} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 opacity-30"><Headphones className="w-12 h-12" /></div>
                }
                
                {/* Capa de control principal (botón grande siempre visible) */}
                <div 
                    className="absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-transparent to-transparent flex items-center justify-center pointer-events-none"
                >
                    {p.audioMp3Url && (
                        <button 
                            onClick={togglePlay}
                            className="pointer-events-auto text-white rounded-full p-4 transform hover:scale-110 transition-all z-10"
                            style={{ backgroundColor: 'var(--primary)', boxShadow: `0 0 30px var(--primary)` }}
                            title={isPlaying ? "Pausar" : "Reproducir"}
                        >
                            {isPlaying ? (
                                <Pause className="w-10 h-10" fill="currentColor" />
                            ) : (
                                <Play className="w-10 h-10 ml-1" fill="currentColor" />
                            )}
                        </button>
                    )}
                </div>
                
                <div className="absolute top-4 left-4 z-10">
                    <span 
                        className="text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider backdrop-blur-sm shadow-lg"
                        style={{ backgroundColor: 'var(--primary)' }}
                    >
                        Podcast
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1 relative z-20" style={{ backgroundColor: 'var(--secondary)' }}>
                <h2 className="font-bold text-white text-lg line-clamp-2 leading-tight mb-2 group-hover:opacity-80 transition-opacity">{p.titulo}</h2>
                {p.descripcion && <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">{p.descripcion}</p>}
                
                <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-4">
                    <span className="text-xs font-medium flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(p.creadoEn).toLocaleDateString()}
                    </span>

                    {p.audioMp3Url ? (
                        <div className="w-full flex flex-col gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                            {/* Barra de progreso interactiva */}
                            <input 
                                type="range" 
                                min={0} 
                                max={duration || 100} 
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{formatTime(currentTime)}</span>
                                <div className="flex gap-2">
                                    <button onClick={togglePlay} className="text-slate-300 hover:text-white transition-colors">
                                        {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
                                    </button>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{formatTime(duration)}</span>
                            </div>
                        </div>
                    ) : p.audioLinkExt ? (
                        <a 
                            href={p.audioLinkExt} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-white/5 border border-white/10 text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors w-full"
                        >
                            <Link2 className="w-4 h-4" /> Abrir Episodio
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
