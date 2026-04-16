"use client";

import { Play, Pause, RadioReceiver, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export default function TopStaticPlayer() {
    const { isPlaying, volume, currentTitle, setPlaying, setVolume } = usePlayerStore();

    const togglePlay = () => setPlaying(!isPlaying);
    const toggleMute = () => {
        if (volume > 0) setVolume(0);
        else setVolume(0.8);
    };

    return (
        <div 
            className="w-full rounded-3xl overflow-hidden shadow-2xl relative mb-8"
            style={{ backgroundColor: 'var(--secondary)' }}
        >
            <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, var(--primary), transparent)' }} />
            
            <div className="relative z-10 p-4 md:p-8 flex items-center justify-between gap-4 md:gap-6">
                
                {/* Info Text & Icon */}
                <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
                    <button 
                        onClick={togglePlay}
                        className="w-12 h-12 md:w-20 md:h-20 shrink-0 rounded-full flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all shadow-xl group border-2 border-white/10"
                        style={{ backgroundColor: 'var(--color-botones)' }}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 md:w-8 md:h-8 fill-current text-white" />
                        ) : (
                            <Play className="w-5 h-5 md:w-8 md:h-8 fill-current text-white translate-x-[2px]" />
                        )}
                    </button>

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <RadioReceiver className={`w-3.5 h-3.5 md:w-5 md:h-5 ${isPlaying ? 'animate-pulse text-green-400' : 'text-slate-400'}`} />
                            <span className="text-[10px] md:text-sm font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                                {isPlaying ? 'En Vivo' : 'Radio'}
                            </span>
                        </div>
                        <h2 className="text-sm md:text-3xl font-black text-white leading-tight drop-shadow-md truncate">
                            {currentTitle || 'Transmisión Online'}
                        </h2>
                    </div>
                </div>

                {/* Volume Control */}
                <div className="hidden md:flex items-center gap-3 w-48 shrink-0 bg-black/20 p-3 rounded-full backdrop-blur-sm border border-white/5">
                    <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors p-1">
                        {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full accent-white h-1.5 bg-slate-700/50 rounded-full appearance-none cursor-pointer outline-none hover:bg-slate-600 transition-colors"
                    />
                </div>
                
            </div>
        </div>
    );
}
