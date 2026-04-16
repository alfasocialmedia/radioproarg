"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, RadioReceiver } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { api } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';

export default function AudioPlayer({ isHidden = false }: { isHidden?: boolean }) {
    const { isPlaying, volume, currentTitle, streamUrl, setPlaying, setVolume, setTitle, setStreamUrl } = usePlayerStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const params = useParams();
    const slug = params?.slug as string;

    const [scrolledY, setScrolledY] = useState(0);
    const [bottomOffset, setBottomOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolledY(window.scrollY);
            const footer = document.querySelector('footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight) {
                    setBottomOffset(window.innerHeight - footerRect.top);
                } else {
                    setBottomOffset(0); // Add default when footer is offscreen
                }
            } else {
                setBottomOffset(0);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Boot Inicial: Cargar URL del Stream real y conectar al Socket de Metadata
    useEffect(() => {
        if (!slug) return;
        let mounted = true;

        const bootPlayer = async () => {
            try {
                // 1. Obtener la Config de la Radio (Tenant en tiempo real)
                const res = await api.get('/radios/config', {
                    headers: { 'X-Tenant': slug }
                });
                const radioInfo = res.data;

                if (mounted && radioInfo.streamUrl) {
                    setStreamUrl(radioInfo.streamUrl);

                    // 2. Conectarse a la emisora local mediante WebSockets para la Metadata
                    const socket = initSocket();
                    socket.emit('unirse_a_radio', radioInfo.id);

                    socket.on('metadata_stream', (data: { cancion: string }) => {
                        setTitle(data.cancion);
                    });
                }
            } catch (e) {
                console.error("Error iniciando AudioPlayer: ", e);
            }
        };

        bootPlayer();

        return () => {
            mounted = false;
            disconnectSocket();
            // Not playing/pausing here, let zustand handle state.
        };
    }, [slug, setStreamUrl, setTitle]);

    // Reaccionar a cambios globales en isPlaying
    useEffect(() => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            if (audioRef.current.paused && streamUrl) {
                audioRef.current.play().catch(error => {
                    console.error("Error al reproducir audio:", error);
                    setPlaying(false); // Revertir si el navegador bloquea el Autoplay
                });
            }
        } else {
            if (!audioRef.current.paused) {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, streamUrl, setPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (!streamUrl || streamUrl === '') {
            console.error('No hay URL de stream configurada');
            return;
        }
        setPlaying(!isPlaying);
    };

    // Toggle mute
    const toggleMute = () => {
        if (volume > 0) {
            setVolume(0);
        } else {
            setVolume(1);
        }
    };

    if (isHidden) {
        return <audio ref={audioRef} src={streamUrl} preload="none" />;
    }

    const showFloating = scrolledY > 250;

    return (
        <div 
            className="fixed left-0 right-0 z-50 pointer-events-none py-3 md:py-5 flex justify-center w-full transition-transform duration-300 ease-out" 
            style={{ 
                bottom: `${bottomOffset}px`,
                transform: showFloating ? 'translateY(0)' : 'translateY(150%)',
                opacity: showFloating ? 1 : 0
            }}
        >
            {/* Player oculto para manejar el streaming */}
            <audio ref={audioRef} src={streamUrl} preload="none" />

            <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end h-full">
                <div className="col-span-1 lg:col-span-8 flex justify-center pointer-events-auto">
                    {/* Glassmorphism Container */}
                    <div 
                        className={`w-full max-w-[800px] rounded-full flex items-center justify-between px-4 py-2.5 md:px-6 md:py-3.5 transition-all duration-500 ${isPlaying ? 'backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]' : 'backdrop-blur-lg border border-white/10 shadow-2xl'}`}
                        style={isPlaying 
                            ? { backgroundColor: 'var(--secondary)', opacity: 0.95, borderColor: 'var(--color-botones)', borderStyle: 'solid', borderWidth: '1px' } 
                            : { backgroundColor: 'var(--secondary)', opacity: 0.85 }
                        }
                    >
                        {/* Status Icon & Title */}
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1 group">
                            <div className="relative flex-shrink-0 cursor-pointer">
                                {/* Ripple Animation when Playing */}
                                {isPlaying && (
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: 'var(--color-botones)' }}></div>
                                )}
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center relative z-10 transition-colors shadow-lg`} 
                                     style={{ backgroundColor: isPlaying ? 'var(--color-botones)' : 'rgba(255,255,255,0.1)' }}>
                                    {isPlaying ? (
                                        <div className="flex gap-0.5 items-end h-4 justify-center">
                                            <span className="w-1 bg-white inline-block animate-[bounce_1s_infinite] h-full rounded-full"></span>
                                            <span className="w-1 bg-white inline-block animate-[bounce_1s_infinite_0.2s] h-3/4 rounded-full"></span>
                                            <span className="w-1 bg-white inline-block animate-[bounce_1s_infinite_0.4s] h-full rounded-full"></span>
                                        </div>
                                    ) : (
                                        <RadioReceiver className="w-5 h-5 md:w-6 md:h-6 text-white/50" />
                                    )}
                                </div>
                            </div>
                            
                            {/* Metadata */}
                            <div className="flex flex-col min-w-0 pr-4">
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {isPlaying ? 'Al Aire' : 'Desconectado'}
                                </span>
                                <div className="text-sm md:text-base font-black truncate text-white leading-tight mt-0.5" 
                                     style={{ fontFamily: 'var(--font-main)' }}>
                                    {currentTitle || (slug ? `Radio ${slug.toUpperCase()}` : 'Cargando Metadata...')}
                                </div>
                            </div>
                        </div>

                        {/* Controls (Play & Volume) */}
                        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                            {/* Play Button */}
                            <button 
                                onClick={togglePlay}
                                className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-[0_0_20px_rgba(var(--color-botones-rgb),0.4)]"
                                style={{ backgroundColor: 'var(--color-botones)' }}
                                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" />
                                ) : (
                                    <Play className="w-6 h-6 md:w-7 md:h-7 ml-1 fill-current" /> 
                                )}
                            </button>

                            {/* Volume Control */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/5">
                                <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors" aria-label="Mute">
                                    {volume === 0 ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01" 
                                    value={volume}
                                    onChange={(e) => {
                                        const newVol = parseFloat(e.target.value);
                                        if (audioRef.current) audioRef.current.volume = newVol;
                                        setVolume(newVol);
                                    }}
                                    className="w-16 md:w-24 h-1.5 rounded-full appearance-none cursor-pointer hover:opacity-100 transition-opacity"
                                    style={{ 
                                        background: `linear-gradient(to right, var(--color-botones) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
