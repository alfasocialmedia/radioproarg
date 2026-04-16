/**
 * Plantilla MODERNO (Magazine) - FULL FEATURES
 * Grid tipo magazine con hero extra grande, noticias en mosaico, programación, chat y finanzas.
 * Se usa en /radio/[slug]/page.tsx cuando radio.plantilla === 'moderno'
 */
"use client";

import Link from 'next/link';
import { Newspaper, ChevronRight, Play, Pause, Radio, Headphones, Layers, PlayCircle, CalendarDays, Music2, DollarSign, TrendingUp } from 'lucide-react';
import BannerSlider from '../BannerSlider';
import PollWidget from '../PollWidget';
import ChatBox from '../ChatBox';
import CurrencyWidget from '../CurrencyWidget';
import RecentPodcastsWidget from '../RecentPodcastsWidget';
import dynamic from 'next/dynamic';

interface Props {
    radio: any;
    noticias: any[];
    programacion: any[];
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

export default function PlantillaModerno(props: Props) {
    const { 
        radio, noticias, programacion, programasHoy, programaActual, podcasts, 
        banners, slug, colorPrimario, colorSecundario, isPlaying, togglePlay,
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

    return (
        <div className="w-full flex flex-col gap-0" style={{ backgroundColor: 'var(--secondary)' }}>
            {/* Hero full-width con player */}
            <div
                className="relative overflow-hidden min-h-[520px] flex items-end"
                style={{ background: `linear-gradient(160deg, var(--secondary) 0%, rgba(var(--secondary-rgb), 0.9) 70%)` }}
            >
                {noticias[0] && (
                    <div className="absolute inset-0">
                        <img src={noticias[0].imagenDestacada || ''} alt="" className="w-full h-full object-cover opacity-20" />
                        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, var(--secondary) 0%, rgba(var(--secondary-rgb), 0.7) 100%)` }} />
                    </div>
                )}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[150px] rounded-full opacity-15" style={{ backgroundColor: 'var(--color-botones)' }} />

                <div className="relative max-w-7xl mx-auto px-6 pb-12 pt-20 w-full">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
                        {/* Logo + Player */}
                        <div className="flex flex-col gap-5 md:w-72 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                                    {radio?.logoUrl ? <img src={radio.logoUrl} alt="" className="w-full h-full object-cover" /> : <Radio className="w-8 h-8 text-white/50" />}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-black text-white truncate" style={{ color: 'var(--color-textos)' }}>{radio?.nombre || slug}</h1>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-botones)' }} /> EN VIVO
                                    </div>
                                </div>
                            </div>
                            {radio?.streamUrl && (
                                <button
                                    onClick={togglePlay}
                                    className="flex items-center justify-center gap-3 py-3 px-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 hover:brightness-110"
                                    style={{ background: 'var(--color-botones)' }}
                                >
                                    {isPlaying ? <><Pause className="w-5 h-5 flex-shrink-0" /> Pausar</> : <><Play className="w-5 h-5 ml-1 flex-shrink-0" /> Escuchar en Vivo</>}
                                </button>
                            )}
                        </div>

                        {/* Noticia Héroe grande */}
                        {noticias[0] && (
                            <Link href={`/radio/${slug}/noticias/${noticias[0].slug}`} className="flex-1 group">
                                <span className="text-xs font-black uppercase tracking-widest mb-2 inline-block" style={{ color: 'var(--primary)' }}>ÚLTIMA HORA</span>
                                <h2 className="text-4xl md:text-6xl font-black leading-tight group-hover:text-slate-200 transition-colors line-clamp-2" style={{ color: 'var(--color-textos)' }}>
                                    {noticias[0].titulo}
                                </h2>
                                {noticias[0].copete && <p className="text-slate-300 mt-4 text-lg line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl">{noticias[0].copete}</p>}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Layout Principal: 12 Columnas Grid */}
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* COLUMNA IZQUIERDA: Noticias y Contenido (8/12) */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    
                    {/* Publicidad HEADER en Moderno */}
                    {radio?.publicidadActiva && banners.some(b => b.ubicacion === 'HEADER') && (
                        <BannerSlider banners={banners.filter(b => b.ubicacion === 'HEADER')} ubicacion="HEADER" />
                    )}

                    {/* Noticias Mosaico */}
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                            <span className="w-2 h-6 rounded-full" style={{ background: 'var(--color-botones)' }} />
                            {radio?.tituloNoticias || 'Noticias'}
                        </h2>
                        {noticias.length > 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {noticias.slice(1, 5).map((n: any) => (
                                    <Link key={n.id} href={`/radio/${slug}/noticias/${n.slug}`} className="group block bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all shadow-lg">
                                        <div className="aspect-video w-full bg-slate-800/50 overflow-hidden">
                                            {n.imagenDestacada
                                                ? <img src={n.imagenDestacada} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-8 h-8 text-slate-600" /></div>}
                                        </div>
                                        <div className="p-6">
                                            <p className="font-bold text-white text-lg line-clamp-2 transition-colors leading-tight group-hover:opacity-80">{n.titulo}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(n.fechaCreacion).toLocaleDateString('es-AR')}</p>
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--primary)' }} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center bg-white/[0.03] rounded-2xl border border-white/5 text-slate-500 italic">No hay más noticias disponibles</div>
                        )}
                    </div>

                    {/* Programación Destacada Moderno */}
                    {programasHoy.length > 0 && (
                        <div className="p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group" style={{ backgroundColor: 'var(--secondary)' }}>
                           <div className="absolute top-0 right-0 w-40 h-40 blur-[80px] -mr-20 -mt-20 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }} />
                            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8 uppercase tracking-widest border-b border-white/10 pb-4">
                                <CalendarDays className="w-6 h-6" style={{ color: 'var(--primary)' }} /> Programación de Hoy
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {programasHoy.map((p: any) => {
                                    const esActual = p.id === programaActual?.id;
                                    return (
                                        <div key={p.id} className={`flex gap-4 items-center p-4 rounded-2xl transition-all border ${esActual ? 'shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10'}`} style={esActual ? { backgroundColor: 'rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.3)' } : {}}>
                                            <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 ${esActual ? '' : 'border-white/10 bg-white/5'}`} style={esActual ? { borderColor: 'rgba(var(--primary-rgb), 0.4)', backgroundColor: 'rgba(var(--primary-rgb), 0.2)' } : {}}>
                                                {p.imagenPrograma ? <img src={p.imagenPrograma} alt="" className="w-full h-full object-cover" /> : <CalendarDays className={`w-6 h-6 m-auto mt-4 ${esActual ? 'text-white' : 'text-slate-600'}`} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {esActual && <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />}
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${esActual ? 'brightness-125' : 'text-slate-500'}`} style={esActual ? { color: 'var(--primary)' } : {}}>
                                                        {esActual ? 'Al Aire' : 'Hoy'}
                                                    </p>
                                                </div>
                                                <p className="font-black text-white text-base truncate uppercase tracking-tight leading-none mb-2">{p.nombrePrograma}</p>
                                                <p className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md inline-block ${esActual ? 'brightness-110 shadow-sm' : 'bg-white/10 text-slate-400'}`} style={esActual ? { backgroundColor: 'rgba(var(--primary-rgb), 0.2)', color: 'white' } : {}}>
                                                    {p.horaInicio} – {p.horaFin}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Podcasts Moderno */}
                    {podcasts.length > 0 && (
                        <div className="mt-4">
                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <Headphones className="w-8 h-8" style={{ color: 'var(--primary)' }} /> Podcasts Destacados
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {podcasts.slice(0, 4).map((p: any) => (
                                    <Link key={p.id} href={`/radio/${slug}/podcast/${p.id}`} className="group flex flex-col bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden transition-all shadow-xl pb-4" style={{ '--hover-border': 'rgba(var(--primary-rgb), 0.3)' } as any}>
                                        <div className="relative aspect-video overflow-hidden bg-slate-800/50">
                                            {p.portadaUrl ? <img src={p.portadaUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center"><Headphones className="w-12 h-12" style={{ color: 'rgba(var(--primary-rgb), 0.1)' }} /></div>}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="px-5 pt-4">
                                            <h3 className="font-black text-white text-lg line-clamp-1 transition-colors uppercase tracking-tight group-hover:opacity-80">{p.titulo}</h3>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{p._count?.episodios || 0} Episodios</span>
                                                <PlayCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" style={{ color: 'var(--primary)' }} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* COLUMNA DERECHA: Sidebar y Widgets (4/12) */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    
                    {/* Chat Box Moderno - Siempre arriba o según config */}
                    {radio?.id && (
                        <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/5">
                            <ChatBox radioId={radio.id} isPureRadio={isPureRadio} />
                        </div>
                    )}

                    {radio?.configSidebar && Array.isArray(radio.configSidebar) ? (
                        radio.configSidebar
                            .filter((w: any) => w.enabled)
                            .map((widget: any) => {
                                if (widget.id === 'polls') {
                                    return (
                                        <div key={widget.id} className="shadow-2xl rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
                                            <PollWidget radioId={radio.id} />
                                        </div>
                                    );
                                }
                                if (widget.id === 'currency') {
                                    return (
                                        <div key={widget.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                             <CurrencyWidget type={widget.type || 'blue'} />
                                        </div>
                                    );
                                }
                                if (widget.id === 'podcasts') {
                                    return (
                                        <div key={widget.id} className="p-1 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                            <RecentPodcastsWidget radioId={radio.id} slug={slug} />
                                        </div>
                                    );
                                }
                                if (widget.id === 'ads') {
                                    return (
                                        <div key={widget.id} className="flex flex-col gap-6">
                                            {radio?.publicidadActiva && banners.some(b => b.ubicacion === 'SIDEBAR') && (
                                                <BannerSlider banners={banners.filter(b => b.ubicacion === 'SIDEBAR')} ubicacion="SIDEBAR" />
                                            )}
                                            {radio?.adSquare && radio.adSquare.trim() !== "" && (
                                                <div className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-2 flex justify-center shadow-xl overflow-hidden" dangerouslySetInnerHTML={{ __html: radio.adSquare }} />
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })
                    ) : (
                        <>
                            {/* Default Sidebar si no hay config */}
                            {dolarOficial && (
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                    <h2 className="text-lg font-black flex items-center gap-2 mb-6 uppercase tracking-widest border-b border-white/5 pb-4">
                                        <DollarSign className="w-5 h-5 text-green-500" /> Finanzas
                                    </h2>
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-colors">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Dólar Oficial</p>
                                                <p className="font-black text-white text-xl">{formatDolar(dolarOficial?.venta)}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"><TrendingUp className="w-5 h-5 text-green-500" /></div>
                                        </div>
                                        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-colors">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Dólar Blue</p>
                                                <p className="font-black text-white text-xl">{formatDolar(dolarBlue?.venta)}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}><TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/5">
                                <PollWidget radioId={radio.id} />
                            </div>

                            {radio?.mostrarSpotify && radio?.spotifyUrl && getSpotifyEmbedUrl(radio.spotifyUrl) && (
                                <div className="p-1 bg-black/20 rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                                    <iframe src={getSpotifyEmbedUrl(radio.spotifyUrl)!} width="100%" height="320" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl border-0" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Banner FOOTER */}
            {radio?.publicidadActiva && banners.some(b => b.ubicacion === 'FOOTER') && (
                <div className="max-w-7xl mx-auto px-6 mt-10 mb-20 w-full">
                    <BannerSlider banners={banners.filter(b => b.ubicacion === 'FOOTER')} ubicacion="FOOTER" />
                </div>
            )}
        </div>
    );
}
