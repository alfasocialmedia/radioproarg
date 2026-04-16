/**
 * Plantilla MINIMALISTA - PREMIUM WOW EDITION
 * Enfocada en el audio, con un diseño ultra-limpio, tipografía moderna y glassmorphism.
 */
"use client";

import Link from 'next/link';
import { Play, Pause, Radio, Headphones, Newspaper, Layers, PlayCircle, CalendarDays, DollarSign, MessageSquare, Mic2, Clock, ShieldCheck } from 'lucide-react';
import BannerSlider from '../BannerSlider';
import PollWidget from '../PollWidget';
import ChatBox from '../ChatBox';

interface Props {
    radio: any;
    noticias: any[];
    programasHoy: any[];
    programaActual: any;
    podcasts: any[];
    banners: any[];
    slug: string;
    colorPrimario: string;
    colorSecundario: string;
    isPlaying: boolean;
    togglePlay: () => void;
    formatDolar: (v: any) => string;
    dolarOficial: any;
    dolarBlue: any;
    isPureRadio: boolean;
}

export default function PlantillaMinimalista(props: Props) {
    const { 
        radio, noticias, programasHoy, programaActual, podcasts, banners, 
        slug, colorPrimario, colorSecundario, isPlaying, togglePlay,
        formatDolar, dolarOficial, dolarBlue, isPureRadio 
    } = props;

    const getSpotifyEmbedUrl = (url: string | undefined | null) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'open.spotify.com') {
                let path = urlObj.pathname;
                if (path.startsWith('/intl-')) path = '/' + path.split('/').slice(2).join('/');
                return `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`;
            }
            return null;
        } catch { return null; }
    };

    const fondoHero = programaActual?.imagenPrograma || radio?.logoUrl || '';

    return (
        <div className="w-full min-h-screen pb-32 selection:bg-primary/30 font-sans" style={{ backgroundColor: 'var(--secondary)' }}>
            
            {/* Hero Section - Estética WOW */}
            <div className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
                
                {/* Fondo ultra-premium con blur dinámico */}
                <div className="absolute inset-0 z-0">
                    {fondoHero && (
                        <img 
                            src={fondoHero} 
                            alt="" 
                            className="w-full h-full object-cover opacity-20 scale-110 blur-3xl animate-pulse" 
                            style={{ animationDuration: '8s' }}
                        />
                    )}

                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(var(--secondary-rgb), 0.4) 0%, var(--secondary) 100%)` }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" 
                         style={{ backgroundColor: 'var(--color-botones)' }} />
                </div>

                <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                    
                    {/* Logo Flotante con Glassmorphism */}
                    <div className="mb-10 p-2 rounded-[3rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500">
                        <div className="w-32 h-32 rounded-[2.5rem] border border-white/5 flex items-center justify-center overflow-hidden shadow-inner" style={{ backgroundColor: 'var(--secondary)' }}>
                            {radio?.logoUrl ? <img src={radio.logoUrl} alt="" className="w-full h-full object-cover" /> : <Radio className="w-16 h-16 text-white/10" />}
                        </div>
                    </div>

                    {/* Título de Radio Minimalista */}
                    <div className="text-center mb-12">
                        <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-none uppercase italic" 
                            style={{ color: 'var(--color-textos)', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            {radio?.nombre || slug}
                        </h1>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <span className="h-px w-12 bg-white/10" />
                            <span className="text-xs font-black uppercase tracking-[0.5em] text-white/30 italic">Pure Audio Experience</span>
                            <span className="h-px w-12 bg-white/10" />
                        </div>
                    </div>

                    {/* El Player Central - Minimalista & Potente */}
                    {radio?.streamUrl && (
                        <div className="relative group">
                            {/* Brillo dinámico detrás del botón */}
                            <div className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" 
                                 style={{ backgroundColor: 'var(--color-botones)' }} />
                            
                            <button
                                onClick={togglePlay}
                                className="relative w-32 h-32 rounded-full flex items-center justify-center text-white border-4 border-white/10 backdrop-blur-xl transition-all hover:scale-110 active:scale-90 shadow-2xl"
                                style={{ background: 'var(--color-botones)' }}
                            >
                                {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-14 h-14 ml-2 fill-current" />}
                            </button>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col items-center gap-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Streaming Global</p>
                        {isPlaying && <div className="flex gap-1 h-3 items-end mt-2"><div className="w-1 rounded-full animate-[bounce_0.6s_infinite]" style={{ backgroundColor: 'var(--primary)', opacity: 0.5 }} /><div className="w-1 rounded-full animate-[bounce_0.4s_infinite]" style={{ backgroundColor: 'var(--primary)' }} /><div className="w-1 rounded-full animate-[bounce_0.8s_infinite]" style={{ backgroundColor: 'var(--primary)', opacity: 0.8 }} /></div>}
                    </div>
                </div>

                {/* Banner Header - Posicionado alto en Minimalista */}
                {radio?.publicidadActiva && banners.some(b => b.ubicacion === 'HEADER') && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 opacity-60 hover:opacity-100 transition-opacity">
                        <BannerSlider banners={banners.filter(b => b.ubicacion === 'HEADER')} ubicacion="HEADER" />
                    </div>
                )}
            </div>

            {/* SECCIÓN AL AIRE AHORA - DESTACADO WOW */}
            <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
                {programaActual ? (
                    <div className="backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-10 group overflow-hidden relative" style={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.8)' }}>
                        {/* Brillo ambiental dentro de la tarjeta */}
                        <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] -mr-32 -mt-32" style={{ backgroundColor: 'var(--primary)', opacity: 0.05 }} />
                        
                        {/* Imagen del Programa o Radio */}
                        <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0 transform group-hover:scale-105 transition-transform duration-700">
                             <div className="absolute inset-0 rounded-[2.5rem] animate-pulse blur-xl" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.2)' }} />
                             <div className="relative h-full w-full rounded-[2.5rem] border-2 border-white/10 overflow-hidden shadow-2xl">
                                {programaActual.imagenPrograma 
                                    ? <img src={programaActual.imagenPrograma} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Mic2 className="w-16 h-16 text-white/10" /></div>
                                }
                             </div>
                             <div className="absolute bottom-4 right-4 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 animate-pulse" style={{ backgroundColor: 'var(--color-botones)' }}>LIVE</div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <span className="p-1 rounded-md bg-white/5 border border-white/10"><Mic2 className="w-3 h-3" style={{ color: 'var(--primary)' }} /></span>
                                <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>Escuchas en Vivo</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-4 uppercase italic tracking-tighter">
                                {programaActual.nombrePrograma}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                                <div className="flex items-center gap-2 text-slate-400 font-bold">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm uppercase tracking-widest">{programaActual.horaInicio} – {programaActual.horaFin}</span>
                                </div>
                                {programaActual.conductores && (
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className="text-sm font-medium italic opacity-70">con {programaActual.conductores}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 text-center" style={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.5)' }}>
                        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">Programación fuera de línea</p>
                    </div>
                )}
            </div>

            {/* Mercado de Divisas Minimalista Row */}
            {dolarOficial && (
                <div className="max-w-4xl mx-auto px-6 mt-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-md">
                        <div className="p-4 flex flex-col items-center justify-center border-r border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Dólar Of.</span>
                            <span className="text-lg font-black text-white tracking-tighter">{formatDolar(dolarOficial?.venta)}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center border-r border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Dólar Blue</span>
                            <span className="text-lg font-black text-white tracking-tighter">{formatDolar(dolarBlue?.venta)}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center border-r border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Euro</span>
                            <span className="text-lg font-black text-slate-400 tracking-tighter">1.120,00</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</span>
                            <span className="flex items-center gap-1.5 text-xs font-black text-green-500/80 uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> OK</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Principal - 12 Columnas pero Centrado */}
            <div className="max-w-5xl mx-auto px-6 mt-20 grid grid-cols-1 md:grid-cols-12 gap-16">
                
                {/* COLUMNA IZQUIERDA: Noticias y Podcasts (7/12) */}
                <div className="md:col-span-7 flex flex-col gap-20">
                    
                    {/* Noticias Listado Minimalista Premium */}
                    <div className="flex flex-col gap-10">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                            <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                            {radio?.tituloNoticias || 'El Mural'}
                        </h2>
                        <div className="flex flex-col gap-8">
                            {noticias.slice(0, 5).map((n: any, idx) => (
                                <Link key={n.id} href={`/radio/${slug}/noticias/${n.slug}`} className="group flex items-start gap-6 border-b border-white/5 pb-8">
                                    <span className="text-3xl font-black text-white/5 transition-colors leading-none group-hover:opacity-20">{String(idx + 1).padStart(2, '0')}</span>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white leading-tight uppercase italic tracking-tighter transition-colors mb-2 group-hover:opacity-80">
                                            {n.titulo}
                                        </h3>
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                            <span>{new Date(n.fechaCreacion).toLocaleDateString('es-AR')}</span>
                                            <span className="group-hover:translate-x-2 transition-transform opacity-0 group-hover:opacity-100" style={{ color: 'var(--primary)' }}>Leer más →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Podcasts Carrusel Grid */}
                    {podcasts.length > 0 && (
                        <div className="flex flex-col gap-10">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                                <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                                Podcasts
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {podcasts.slice(0, 4).map((p: any) => (
                                    <Link key={p.id} href={`/radio/${slug}/podcast/${p.id}`} className="group flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all duration-500">
                                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl">
                                            {p.portadaUrl ? <img src={p.portadaUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Headphones className="w-10 h-10 m-auto mt-10 text-white/5" />}
                                            <div className="absolute inset-0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to top, var(--secondary) 0%, transparent 100%)` }} />
                                            <div className="absolute inset-x-0 bottom-4 px-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                <div className="w-full py-2 rounded-xl text-center text-xs font-black uppercase text-white shadow-xl" style={{ backgroundColor: 'var(--primary)' }}>Reproducir</div>
                                            </div>
                                        </div>
                                        <div className="px-1 text-center">
                                            <p className="font-black text-white uppercase tracking-tighter truncate mb-1 transition-colors group-hover:opacity-80" style={{ color: 'var(--primary)' }}>{p.titulo}</p>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{p._count?.episodios || 0} Episodios</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* COLUMNA DERECHA: Chat y Widgets (5/12) */}
                <div className="md:col-span-1 border-r border-white/5 hidden md:block" /> {/** Espaciador estético */}
                <div className="md:col-span-4 flex flex-col gap-16">
                    
                    {/* Chat Box - Estilo Premium Flotante en Minimalista */}
                    {radio?.id && (
                        <div className="flex flex-col gap-6">
                                 <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Live Chat
                                    </h3>
                                    <div className="flex gap-1"><span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: 'var(--primary)' }} /><span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Connected</span></div>
                                </div>
                                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md h-[550px]" style={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.4)' }}>
                                    <ChatBox radioId={radio.id} isPureRadio={isPureRadio} />
                                </div>
                        </div>
                    )}

                    {/* Programación "Up Next" List */}
                    {programasHoy.length > 0 && (
                        <div className="flex flex-col gap-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 border-l-2 pl-4" style={{ borderColor: 'var(--primary)' }}>Next in Schedule</h3>
                            <div className="space-y-4">
                                {programasHoy.slice(0, 4).map((p: any) => {
                                    const esActual = p.id === programaActual?.id;
                                    return (
                                        <div key={p.id} className={`group flex flex-col gap-1 p-5 rounded-3xl border transition-all duration-500 ${esActual ? 'ring-1' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`} style={esActual ? { backgroundColor: 'rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.3)', '--tw-ring-color': 'rgba(var(--primary-rgb), 0.2)' } as React.CSSProperties : {}}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md ${esActual ? 'text-white' : 'bg-white/10 text-slate-500'}`} style={esActual ? { backgroundColor: 'var(--primary)' } : {}}>{p.horaInicio}</span>
                                                {esActual && <span className="text-[10px] font-black animate-pulse tracking-widest" style={{ color: 'var(--primary)' }}>ON AIR</span>}
                                            </div>
                                            <p className={`font-black uppercase tracking-tight text-lg transition-colors ${esActual ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{p.nombrePrograma}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Spotify Widget Premium */}
                    {radio?.mostrarSpotify && radio?.spotifyUrl && getSpotifyEmbedUrl(radio.spotifyUrl) && (
                        <div className="flex flex-col gap-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 border-l-2 pl-4" style={{ borderColor: 'var(--primary)' }}>Curated Vibes</h3>
                            <div className="rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(30,215,96,0.1)] border border-white/5">
                                <iframe src={getSpotifyEmbedUrl(radio.spotifyUrl)!} width="100%" height="280" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl border-0 grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Banners & Footer Ads Section */}
            <div className="max-w-5xl mx-auto px-6 mt-32 flex flex-col gap-20">
                
                {/* Publicidad Inferior */}
                {radio?.publicidadActiva && banners.some(b => b.ubicacion === 'FOOTER') && (
                    <div className="w-full p-1 bg-white/[0.02] rounded-[3rem] border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                        <BannerSlider banners={banners.filter(b => b.ubicacion === 'FOOTER')} ubicacion="FOOTER" />
                    </div>
                )}

                {/* Encuesta Final de Página */}
                {radio?.id && (
                    <div className="max-w-2xl mx-auto w-full border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl" style={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.3)' }}>
                        <PollWidget radioId={radio.id} />
                    </div>
                )}

                {/* Ads Scripts Square a nivel de footer */}
                {radio?.adSquare && radio.adSquare.trim() !== "" && (
                    <div className="w-full flex justify-center opacity-50 hover:opacity-100 transition-all" dangerouslySetInnerHTML={{ __html: radio.adSquare }} />
                )}
            </div>

        </div>
    );
}
