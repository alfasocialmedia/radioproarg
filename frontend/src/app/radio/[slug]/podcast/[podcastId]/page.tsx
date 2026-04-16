"use client";

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { Headphones, ArrowLeft, Play, Pause, Link2, Layers, Calendar } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function EpisodioPlayer({ src, id, activoId, setActivoId }: { src: string; id: string; activoId: string | null; setActivoId: (id: string | null) => void }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');

    const esActivo = activoId === id;

    useEffect(() => {
        if (!esActivo && playing) {
            audioRef.current?.pause();
            setPlaying(false);
        }
    }, [esActivo]);

    const toggle = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            setActivoId(id);
            audioRef.current.play();
            setPlaying(true);
        }
    };

    const fmt = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mt-4 flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={() => {
                    const a = audioRef.current!;
                    setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
                    setCurrentTime(fmt(a.currentTime));
                }}
                onLoadedMetadata={() => setDuration(fmt(audioRef.current!.duration))}
                onEnded={() => { setPlaying(false); setActivoId(null); }}
            />
            <button
                onClick={toggle}
                className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-400 transition-colors flex items-center justify-center shrink-0 shadow-md shadow-pink-500/30"
            >
                {playing ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
            </button>
            <div className="flex-1 min-w-0">
                <div
                    className="h-1.5 bg-white/10 rounded-full cursor-pointer"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        if (audioRef.current) audioRef.current.currentTime = pct * audioRef.current.duration;
                    }}
                >
                    <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>
            <span className="text-xs text-slate-400 shrink-0 font-mono">{currentTime} / {duration}</span>
        </div>
    );
}

export default function PodcastPublicoPage({ params }: { params: Promise<{ slug: string; podcastId: string }> }) {
    const { slug, podcastId } = use(params);

    const [podcast, setPodcast] = useState<any>(null);
    const [episodios, setEpisodios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeEp, setActiveEp] = useState<string | null>(null);

    useEffect(() => {
        const tenantHeader = { headers: { 'x-tenant': slug } };
        Promise.allSettled([
            fetch(`${BACKEND}/api/v1/podcasts/public`, tenantHeader).then(r => r.json()),
            fetch(`${BACKEND}/api/v1/podcasts/public/${podcastId}/episodios`, tenantHeader).then(r => r.json()),
        ]).then(([pc, ep]) => {
            if (pc.status === 'fulfilled') {
                const found = Array.isArray(pc.value) ? pc.value.find((p: any) => p.id === podcastId) : null;
                setPodcast(found || null);
            }
            if (ep.status === 'fulfilled') setEpisodios(Array.isArray(ep.value) ? ep.value : []);
        }).finally(() => setLoading(false));
    }, [slug, podcastId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-white" style={{ backgroundColor: 'var(--secondary)' }}>
            <div className="text-center text-slate-400">
                <Headphones className="w-10 h-10 mx-auto mb-3 animate-bounce opacity-50" />
                <p>Cargando episodios...</p>
            </div>
        </div>
    );

    if (!podcast) return (
        <div className="min-h-screen flex items-center justify-center text-slate-400" style={{ backgroundColor: 'var(--secondary)' }}>
            Podcast no encontrado.
        </div>
    );

    return (
        <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--secondary)' }}>
            {/* Hero */}
            <div className="relative border-b border-white/5 pt-24 pb-12 px-4" style={{ backgroundImage: `linear-gradient(to bottom, var(--primary)15 0%, var(--secondary) 100%)` }}>
                <div className="max-w-4xl mx-auto">
                    <Link href={`/radio/${slug}/podcast`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver a Podcasts
                    </Link>
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        {podcast.portadaUrl ? (
                            <img src={podcast.portadaUrl} alt={podcast.titulo} className="w-40 h-40 rounded-2xl object-cover shadow-2xl shrink-0 border border-white/10" />
                        ) : (
                            <div className="w-40 h-40 bg-gradient-to-br from-pink-900/50 to-purple-900/30 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                                <Headphones className="w-16 h-16 text-pink-400/50" />
                            </div>
                        )}
                        <div>
                            <span className="text-xs font-black text-primary uppercase tracking-widest mb-2 inline-block">PODCAST</span>
                            <h1 className="text-4xl font-black text-white mb-3">{podcast.titulo}</h1>
                            {podcast.descripcion && <p className="text-slate-400 leading-relaxed max-w-xl">{podcast.descripcion}</p>}
                            <div className="flex items-center gap-3 mt-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {episodios.length} Episodios</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de episodios */}
            <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
                <h2 className="text-xl font-black text-white border-b border-white/10 pb-4 mb-6">Todos los Episodios</h2>
                {episodios.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        No hay episodios publicados aún.
                    </div>
                ) : episodios.map((ep: any, idx: number) => (
                    <div key={ep.id} className={`border rounded-2xl p-5 transition-all ${activeEp === ep.id ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-white/5 hover:border-white/20'}`} style={{ backgroundColor: 'var(--secondary)' }}>
                        <div className="flex gap-5 items-start">
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0 mt-1">
                                <span className="text-sm font-black text-primary">{String(episodios.length - idx).padStart(2, '0')}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white text-lg leading-snug">{ep.titulo}</h3>
                                {ep.descripcion && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{ep.descripcion}</p>}
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(ep.fechaPublicacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    {ep.audioMp3Url && <span className="text-green-400 font-medium">• MP3</span>}
                                    {ep.audioLinkExt && <span className="text-purple-400 font-medium">• Link Externo</span>}
                                </div>

                                {/* Player */}
                                {ep.audioMp3Url ? (
                                    <EpisodioPlayer
                                        src={ep.audioMp3Url}
                                        id={ep.id}
                                        activoId={activeEp}
                                        setActivoId={setActiveEp}
                                    />
                                ) : ep.audioLinkExt ? (
                                    <a
                                        href={ep.audioLinkExt}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        <Link2 className="w-4 h-4" /> Abrir en plataforma externa →
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
