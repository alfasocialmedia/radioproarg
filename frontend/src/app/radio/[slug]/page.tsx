"use client";

import { useEffect, useState, useRef, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Radio, Newspaper, CalendarDays, Play, Pause, ChevronRight, Music2, DollarSign, Flame, Share2, Facebook, Twitter, Instagram, Youtube, TrendingUp, Headphones, Layers, Link2, PlayCircle, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import BannerSlider from '@/components/BannerSlider';
import { io } from 'socket.io-client';

import ChatBox from '@/components/ChatBox';
import dynamic from 'next/dynamic';
import ProgramModal from '@/components/ProgramModal';
import PollWidget from '@/components/PollWidget';
import CurrencyWidget from '@/components/CurrencyWidget';
import AdsWidget from '@/components/AdsWidget';
import RecentPodcastsWidget from '@/components/RecentPodcastsWidget';
import TopStaticPlayer from '@/components/TopStaticPlayer';
import NewsTicker from '@/components/NewsTicker';

const PlantillaModerno = dynamic(() => import('@/components/plantillas/PlantillaModerno'), { ssr: false });
const PlantillaMinimalista = dynamic(() => import('@/components/plantillas/PlantillaMinimalista'), { ssr: false });

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function RadioPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [radio, setRadio] = useState<any>(null);
    const [noticias, setNoticias] = useState<any[]>([]);
    const [programacion, setProgramacion] = useState<any[]>([]);
    const [podcasts, setPodcasts] = useState<any[]>([]);
    const [dolares, setDolares] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<any>(null);

    const { isPlaying, setPlaying, setTitle, currentTitle, setStreamUrl, setIsPureRadio, setFondoPlayerUrl } = usePlayerStore();
    const hoy = new Date().getDay() === 0 ? 7 : new Date().getDay(); // JS: 0=dom, ajustamos a 7

    useEffect(() => {
        const baseUrl = `${BACKEND}/api/v1`;
        const tenantHeader = { headers: { 'x-tenant': slug } };
        Promise.allSettled([
            fetch(`${baseUrl}/radios/config`, { ...tenantHeader, cache: 'no-store' }).then(r => r.json()),
            fetch(`${baseUrl}/noticias`, tenantHeader).then(r => r.json()),
            fetch(`${baseUrl}/programacion`, tenantHeader).then(r => r.json()),
            fetch('https://dolarapi.com/v1/dolares').then(r => r.json()),
            fetch(`${baseUrl}/podcasts/public`, tenantHeader).then(r => r.json()),
            fetch(`${baseUrl}/publicidad/banners`, tenantHeader).then(r => r.json()),
        ]).then(([r, n, p, d, pc, b]) => {
            if (r.status === 'fulfilled' && r.value && !r.value.error) {
                console.log('📻 Radio config recibida:', r.value);
                setRadio(r.value);
                const isPure = r.value?.plan && r.value.plan.tieneCMS === false;
                setIsPureRadio(isPure);
                setFondoPlayerUrl(r.value?.fondoPlayerUrl || null);
                if (r.value?.streamUrl) setStreamUrl(r.value.streamUrl);
                
                // Aplicar estilos dinámicos al vuelo para evitar caché rancia
                setTimeout(() => {
                    const root = document.getElementById('radio-portal-root');
                    if (root && r.value) {
                        const cPrimario = r.value.colorPrimario || '#64748b';
                        const cSecundario = r.value.colorSecundario || '#0f172a';
                        const hexToRgbStr = (h: string) => { 
                            const val = h.startsWith('#') ? h.substring(1) : h; 
                            return `${parseInt(val.substring(0,2), 16) || 0}, ${parseInt(val.substring(2,4), 16) || 0}, ${parseInt(val.substring(4,6), 16) || 0}`; 
                        };
                        const fontMap: Record<string, string> = {
                            inter: 'Inter, sans-serif',
                            outfit: 'Outfit, sans-serif',
                            roboto: 'Roboto, sans-serif',
                            merriweather: 'Merriweather, Georgia, serif',
                        };
                        root.style.setProperty('--primary', cPrimario);
                        root.style.setProperty('--primary-rgb', hexToRgbStr(cPrimario));
                        root.style.setProperty('--secondary', cSecundario);
                        root.style.setProperty('--secondary-rgb', hexToRgbStr(cSecundario));
                        root.style.setProperty('--color-botones', r.value.colorBotones || cPrimario);
                        root.style.setProperty('--color-textos', r.value.colorTextos || '#ffffff');
                        root.style.setProperty('--player-bg', r.value.playerColor || '#0f172a');
                        root.style.setProperty('--player-blur', `${r.value.playerBlur || 0}px`);
                        root.style.setProperty('--font-main', fontMap[r.value.fontFamily || 'inter'] || fontMap['inter']);
                        root.style.fontFamily = 'var(--font-main)';
                        if(r.value.playerImagenUrl) root.style.setProperty('--player-image', `url(${r.value.playerImagenUrl})`);
                        else root.style.setProperty('--player-image', 'none');
                    }
                }, 50);
            }
            if (n.status === 'fulfilled') setNoticias(Array.isArray(n.value) ? n.value.slice(0, 20) : []);
            if (p.status === 'fulfilled') setProgramacion(Array.isArray(p.value) ? p.value : []);
            if (d.status === 'fulfilled') setDolares(Array.isArray(d.value) ? d.value : []);
            if (pc.status === 'fulfilled') setPodcasts(Array.isArray(pc.value) ? pc.value : []);
            if (b.status === 'fulfilled') setBanners(Array.isArray(b.value) ? b.value : []);
        }).finally(() => setLoading(false));

    }, [slug]);

    // Scroll automático a la encuesta si llega con ?poll=xxx
    const searchParams = useSearchParams();
    const pollWidgetRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const pollId = searchParams?.get('poll');
        if (pollId && pollWidgetRef.current) {
            setTimeout(() => {
                pollWidgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 800);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!radio?.id) return;
        const socket = io(BACKEND);
        socket.emit('unirse_a_radio', radio.id);
        socket.on('metadata_stream', (data) => {
            if (data?.cancion) {
                setTitle(data.cancion);
            }
        });
        return () => { socket.disconnect(); };
    }, [radio?.id, setTitle]);

    const togglePlay = () => {
        setPlaying(!isPlaying);
    };

    const programasHoy = programacion
        .filter(p => Number(p.diaSemana) === hoy)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    const colorPrimario = 'var(--primary)';
    const colorSecundario = 'var(--secondary)';
    
    // Cotizaciones Dólar
    const dolarOficial = dolares.find(d => d.casa === 'oficial') || null;
    const dolarBlue = dolares.find(d => d.casa === 'blue') || null;
    
    const activeWidgets = (radio?.configSidebar && radio.configSidebar.length > 0) 
        ? radio.configSidebar 
        : [{ id: 'polls', enabled: true }, { id: 'currency', enabled: true }, { id: 'podcasts', enabled: true }];

    const formatDolar = (val: any) => val ? `$ ${Number(val).toLocaleString('es-AR')}` : '---';

    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const programaActual = programasHoy.find(p => horaActual >= p.horaInicio && horaActual <= p.horaFin);
    
    // Encontrar el siguiente programa
    let programaSiguiente = null;
    if (programaActual) {
        const indexActual = programasHoy.findIndex(p => p.id === programaActual.id);
        programaSiguiente = programasHoy[indexActual + 1] || null;
    } else {
        // Si no hay nada al aire ahora, el siguiente es el primero que empiece después de ahora
        programaSiguiente = programasHoy.find(p => p.horaInicio > horaActual) || null;
    }

    const getSpotifyEmbedUrl = (url: string | undefined | null) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'open.spotify.com') {
                let path = urlObj.pathname;
                // Eliminar prefijos de país como /intl-es o /intl-en
                if (path.startsWith('/intl-')) {
                    path = '/' + path.split('/').slice(2).join('/');
                }
                return `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`;
            }
            return null;
        } catch {
            return null;
        }
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)' }}>
            <div className="text-center space-y-4">
                <Radio className="w-12 h-12 text-primary animate-pulse mx-auto" />
                <p className="text-slate-400">Cargando la emisora...</p>
            </div>
        </div>
    );

    // Fuente tipográfica según configuración de la emisora
    const fontStyle = { fontFamily: 'var(--font-main)' };
    const isPureRadio = radio?.plan && radio.plan.tieneCMS === false;
    const templateProps = { radio, noticias, programacion, programasHoy, programaActual, podcasts, banners, slug, colorPrimario, colorSecundario, isPlaying, togglePlay, formatDolar, dolarOficial, dolarBlue, isPureRadio };

    // Plantillas alternativas
    if (radio?.plantilla === 'moderno') {
        return <div style={fontStyle}><PlantillaModerno {...templateProps} /></div>;
    }
    if (radio?.plantilla === 'minimalista') {
        return <div style={fontStyle}><PlantillaMinimalista {...templateProps} /></div>;
    }

    // Plantilla CLÁSICA (Default)
    return (
        <div className="w-full" style={fontStyle}>

            {/* Banner HEADER */}
            {radio?.publicidadActiva && banners.some(b => b.ubicacion === 'HEADER') && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BannerSlider banners={banners.filter(b => b.ubicacion === 'HEADER')} ubicacion="HEADER" />
                </div>
            )}

            {/* Contenido Base del Portal (12 Columnas Grid) */}
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* ----------------- COLUMNA PRINCIPAL (8/12) ----------------- */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {!isPureRadio ? (
                        <div className="flex flex-col">
                            {/* Ticker de noticias (solo móvil) */}
                            <NewsTicker noticias={noticias} slug={slug} />

                            {/* Player Estático en Encabezado */}
                            <div className="w-full mt-0">
                                <TopStaticPlayer />
                            </div>

                            <div className="flex flex-col gap-6 mt-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
                                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--primary)' }}></span> {radio?.tituloNoticias || 'Titulares'}
                                </h2>
                            </div>
                            
                            {noticias.length === 0 ? (
                                <div className="border border-white/5 rounded-2xl p-10 text-center text-slate-500" style={{ backgroundColor: 'var(--secondary)' }}>
                                    No hay noticias publicadas en este momento.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 md:gap-6">

                                    {/* ── HERO: Noticia 1 (full width) ── */}
                                    {noticias[0] && (
                                        <Link href={`/radio/${slug}/noticias/${noticias[0].slug}`} className="group block rounded-2xl overflow-hidden relative shadow-2xl" style={{ backgroundColor: 'var(--secondary)' }}>
                                            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-slate-900 overflow-hidden">
                                                {noticias[0].imagenDestacada
                                                    ? <img src={noticias[0].imagenDestacada} alt={noticias[0].titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                    : <div className="w-full h-full flex items-center justify-center bg-slate-900"><Newspaper className="w-16 h-16 text-slate-700" /></div>
                                                }
                                                {/* Gradiente inferior fuerte */}
                                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />
                                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest" style={{ backgroundColor: 'var(--primary)' }}>Lo último</span>
                                                        <span className="text-white/60 text-xs">{new Date(noticias[0].fechaCreacion).toLocaleDateString('es-AR')}</span>
                                                    </div>
                                                    <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.15] drop-shadow-md">{noticias[0].titulo}</h2>
                                                    {noticias[0].copete && <p className="text-white/70 text-sm mt-2 line-clamp-2 max-w-2xl hidden sm:block">{noticias[0].copete}</p>}
                                                </div>
                                            </div>
                                        </Link>
                                    )}

                                    {/* ── FILA 2 COLUMNAS: Noticias 2 y 3 ── */}
                                    {noticias.slice(1, 3).length > 0 && (
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            {noticias.slice(1, 3).map((n: any) => (
                                                <Link key={n.id} href={`/radio/${slug}/noticias/${n.slug}`} className="group flex flex-col rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-all" style={{ backgroundColor: 'var(--secondary)' }}>
                                                    <div className="w-full aspect-[4/3] bg-slate-800 overflow-hidden relative">
                                                        {n.imagenDestacada
                                                            ? <img src={n.imagenDestacada} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-6 h-6 text-slate-700" /></div>
                                                        }
                                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                                                    </div>
                                                    <div className="p-2.5 md:p-3 flex flex-col flex-1">
                                                        <p className="font-bold text-white text-[11px] md:text-sm leading-tight line-clamp-2 md:line-clamp-3">{n.titulo}</p>
                                                        <div className="mt-auto pt-1.5 flex items-center justify-between">
                                                            <p className="text-[9px] md:text-[10px] text-slate-500">{new Date(n.fechaCreacion).toLocaleDateString('es-AR')}</p>
                                                            <span className="text-[9px] font-bold flex items-center gap-0.5" style={{ color: 'var(--primary)' }}>Leer <ChevronRight className="w-2.5 h-2.5 md:w-3 h-3" /></span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* ── Banner MID (si está activado) ── */}
                                    {radio?.publicidadActiva && banners.some((b: any) => b.ubicacion === 'MID_CONTENT') && (
                                        <div className="w-full">
                                            <BannerSlider banners={banners.filter((b: any) => b.ubicacion === 'MID_CONTENT')} ubicacion="MID_CONTENT" />
                                        </div>
                                    )}

                                    {/* ── NOTICIA 4: Card Horizontal Ancha / Hero Secundario ── */}
                                    {noticias[3] && (
                                        <Link href={`/radio/${slug}/noticias/${noticias[3].slug}`} className="group block rounded-2xl overflow-hidden relative shadow-xl h-[160px] md:h-auto" style={{ backgroundColor: 'var(--secondary)' }}>
                                            <div className="relative w-full h-full md:aspect-[21/7] bg-slate-900 overflow-hidden flex flex-col md:flex-row">
                                                {/* Imagen (en móvil ocupa fondo, en desktop izquierda) */}
                                                <div className="absolute inset-0 md:relative md:w-[45%] shrink-0 overflow-hidden">
                                                    {noticias[3].imagenDestacada
                                                        ? <img src={noticias[3].imagenDestacada} alt={noticias[3].titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        : <div className="w-full h-full flex items-center justify-center bg-slate-900"><Newspaper className="w-12 h-12 text-slate-700" /></div>
                                                    }
                                                    {/* Filtro extra para móvil para que el texto se vea bien encima */}
                                                    <div className="absolute inset-0 bg-black/40 md:hidden" />
                                                </div>
                                                
                                                {/* Contenido (en móvil encima de imagen, en desktop derecha) */}
                                                <div className="relative z-10 p-5 flex flex-col justify-center h-full flex-1 md:bg-transparent">
                                                    <div className="mb-2">
                                                        <span className="text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest inline-block" style={{ backgroundColor: 'var(--primary)' }}>Sugerido</span>
                                                    </div>
                                                    <h3 className="text-lg md:text-2xl font-black text-white leading-tight drop-shadow-lg md:drop-shadow-none md:text-white line-clamp-2 md:line-clamp-none">{noticias[3].titulo}</h3>
                                                    <div className="flex items-center gap-2 mt-3 md:mt-4">
                                                        <p className="text-white/60 text-[9px] md:text-xs">{new Date(noticias[3].fechaCreacion).toLocaleDateString('es-AR')}</p>
                                                        <span className="text-white font-bold text-[9px] md:text-xs flex items-center gap-0.5 underline underline-offset-4 decoration-primary">Leer noticia completa</span>
                                                    </div>
                                                </div>
                                                {/* Gradiente sutil para desktop */}
                                                <div className="hidden md:absolute md:inset-0 pointer-events-none md:block" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.8) 100%)' }} />
                                            </div>
                                        </Link>
                                    )}

                                    {/* ── FILA 3 COLUMNAS: Noticias 5, 6, 7 ── */}
                                    {noticias.slice(4, 7).length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                                            {noticias.slice(4, 7).map((n: any) => (
                                                <Link key={n.id} href={`/radio/${slug}/noticias/${n.slug}`} className="group flex flex-col rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-all" style={{ backgroundColor: 'var(--secondary)' }}>
                                                    <div className="w-full aspect-square bg-slate-800 overflow-hidden relative">
                                                        {n.imagenDestacada
                                                            ? <img src={n.imagenDestacada} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-5 h-5 text-slate-700" /></div>
                                                        }
                                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 70%)' }} />
                                                    </div>
                                                    <div className="p-2 md:p-2.5">
                                                        <p className="font-bold text-white text-[9px] md:text-[11px] leading-[1.2] line-clamp-3 md:line-clamp-3">{n.titulo}</p>
                                                        <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-1.5">{new Date(n.fechaCreacion).toLocaleDateString('es-AR')}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* ── RESTO de noticias en grid 2 col ── */}
                                    {noticias.slice(7).length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {noticias.slice(7).map((n: any) => (
                                                <Link key={n.id} href={`/radio/${slug}/noticias/${n.slug}`} className="group flex flex-row gap-3 rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-all p-3" style={{ backgroundColor: 'var(--secondary)' }}>
                                                    {n.imagenDestacada && (
                                                        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-800">
                                                            <img src={n.imagenDestacada} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col justify-between flex-1">
                                                        <p className="font-bold text-white text-sm line-clamp-3 leading-snug">{n.titulo}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <p className="text-[10px] text-slate-500">{new Date(n.fechaCreacion).toLocaleDateString('es-AR')}</p>
                                                            <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>Leer →</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            )}

                            </div> {/* fin flex-col gap-6 */}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-8">
                            {/* Player card Solo Audio */}
                            <div 
                                className="backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group min-h-[400px]" 
                                style={{ backgroundColor: 'var(--player-bg)' }}
                            >
                                {/* Fondo con Blur Configurable */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-60"
                                    style={{ 
                                        backgroundImage: 'var(--player-image)',
                                        filter: 'blur(var(--player-blur))'
                                    }}
                                />
                                
                                <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at center, var(--color-botones), transparent 70%)` }}></div>
                                
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg overflow-hidden shrink-0 mb-6 relative z-10 transition-transform group-hover:scale-105">
                                    {radio?.logoUrl ? <img src={radio.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Radio className="w-12 h-12 text-slate-500" />}
                                </div>

                                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 relative z-10 uppercase drop-shadow-lg" style={{ color: 'var(--color-textos)' }}>{radio?.nombre || slug}</h2>
                                
                                <div className="inline-flex items-center gap-2 text-slate-300 text-sm px-6 py-2.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md relative z-10 mb-10 max-w-full shadow-xl">
                                    <Music2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-botones)' }} />
                                    <span className="font-bold truncate tracking-wide" style={{ color: 'var(--color-textos)' }}>{currentTitle || 'Transmisión en Vivo'}</span>
                                </div>

                                {radio?.streamUrl ? (
                                    <div className="w-full relative z-10 flex flex-col items-center">
                                        <div className="flex items-center justify-center gap-6 mb-8">
                                            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                                                <button onClick={() => { const { volume, setVolume } = usePlayerStore.getState(); setVolume(volume > 0 ? 0 : 0.8); }} className="text-slate-400 hover:text-white transition-colors"><Volume2 className="w-5 h-5" /></button>
                                                <input type="range" min="0" max="1" step="0.01" defaultValue="0.8" onChange={(e) => usePlayerStore.getState().setVolume(parseFloat(e.target.value))} className="w-20 md:w-28 h-1 bg-white/20 rounded-full appearance-none cursor-pointer outline-none" style={{ accentColor: 'var(--color-botones)' }} />
                                            </div>
                                            <button onClick={togglePlay} className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all active:scale-95 hover:scale-105 border-4 border-white/10 group/btn" style={{ background: 'var(--color-botones)' }}>
                                                {isPlaying ? <Pause className="w-10 h-10 md:w-14 md:h-14 text-white fill-current" /> : <Play className="w-10 h-10 md:w-14 md:h-14 ml-1.5 text-white fill-current" />}
                                            </button>
                                            <div className="text-center min-w-[80px] hidden md:block">
                                                <p className="font-black text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-textos)' }}>{isPlaying ? 'EN VIVO' : 'PAUSA'}</p>
                                            </div>
                                        </div>
                                        
                                        {isPlaying && (
                                            <div className="flex justify-center items-end gap-1 h-10 mb-10">
                                                {[...Array(15)].map((_, i) => (
                                                    <div key={i} className="w-1.5 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s`, backgroundColor: 'var(--color-botones)', opacity: 0.6 + (Math.random() * 0.4) }} />
                                                ))}
                                            </div>
                                        )}

                                        {(programaActual || programasHoy.length > 0) && (
                                            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-black/30 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                                                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-botones)' }}></span>
                                                <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-textos)' }}>{(programaActual || programasHoy[0]).nombrePrograma}</span>
                                                {(programaActual || programasHoy[0]).conductores && <span className="text-slate-400 text-xs font-medium ml-1">con {(programaActual || programasHoy[0]).conductores}</span>}
                                            </div>
                                        )}

                                        {radio?.adHorizontal && radio.adHorizontal.trim() !== "" && (
                                            <div className="mt-8 w-full max-w-2xl bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-3 flex justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: radio.adHorizontal }} />
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-black/30 border border-white/10 rounded-xl p-8 text-center text-slate-400 relative z-10 w-full max-w-md">
                                        <Radio className="w-10 h-10 mx-auto mb-3 text-slate-600" /><p className="font-bold">Stream no disponible temporalmente</p>
                                    </div>
                                )}
                            </div>

                            {/* Anuncios Bajo el Reproductor */}
                            {radio?.publicidadActiva && banners.filter(b => b.ubicacion === 'UNDER_PLAYER' && b.mostrarEscritorio).length > 0 && (
                                <div className="w-full">
                                    {radio.adDisplayBajoPlayer === 'grid' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                                            {banners.filter(b => b.ubicacion === 'UNDER_PLAYER' && b.mostrarEscritorio).map((b: any) => (
                                                <div key={b.id} className="w-full rounded-2xl overflow-hidden shadow-lg border border-white/10 group relative bg-black/50">
                                                    {b.urlDestino ? (
                                                        <a href={b.urlDestino} target="_blank" rel="noopener noreferrer" className="block w-full">
                                                            <img src={b.imagenUrl} alt="Publicidad" className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                                                        </a>
                                                    ) : (
                                                        <img src={b.imagenUrl} alt="Publicidad" className="w-full object-cover" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <BannerSlider banners={banners.filter(b => b.ubicacion === 'UNDER_PLAYER' && b.mostrarEscritorio)} ubicacion="UNDER_PLAYER" />
                                    )}
                                </div>
                            )}

                            {/* Info Adicional Bajo Reprodutor en Modo Solo Audio */}
                            {programasHoy.length > 0 && (
                                <div className="backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl w-full" style={{ backgroundColor: 'var(--secondary)', opacity: 0.8 }}>
                                    <h2 className="text-xs font-black flex items-center gap-2 mb-5 uppercase tracking-widest border-b border-white/5 pb-3" style={{ color: 'var(--primary)' }}>
                                        <CalendarDays className="w-4 h-4" /> En el Aire Hoy
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {programasHoy.map((p: any) => {
                                            const esActual = programaActual?.id === p.id;
                                            return (
                                                <div 
                                                    key={p.id} 
                                                    onClick={() => setSelectedProgram(p)}
                                                    className={`flex gap-4 items-center p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${esActual ? 'border shadow-lg' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                                                    style={esActual ? { backgroundColor: 'var(--primary)10', borderColor: 'var(--primary)30' } : {}}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border relative ${esActual ? 'bg-primary/20' : 'bg-white/5'}`} style={esActual ? { borderColor: 'var(--primary)40' } : { borderColor: 'rgba(255,255,255,0.1)' }}>
                                                        {p.imagenPrograma ? <img src={p.imagenPrograma} alt={p.nombrePrograma} className="w-full h-full object-cover" /> : <CalendarDays className={`w-5 h-5 m-auto mt-3.5 ${esActual ? 'text-white' : 'opacity-40'}`} style={!esActual ? { color: 'var(--primary)' } : {}} />}
                                                        {esActual && <div className="absolute inset-0 bg-primary/20 animate-pulse" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black text-white text-sm line-clamp-1 transition-colors uppercase" style={{ color: 'var(--primary)' }}>{p.nombrePrograma}</p>
                                                            {esActual && <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} title="Al aire ahora" />}
                                                        </div>
                                                        <p className="text-xs font-mono font-bold tracking-wider" style={{ color: 'var(--primary)' }}>{p.horaInicio} – {p.horaFin}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />

                            {radio?.mostrarSpotify && radio?.spotifyUrl && getSpotifyEmbedUrl(radio.spotifyUrl) && (
                                <div className="backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl w-full" style={{ backgroundColor: 'var(--secondary)', opacity: 0.8 }}>
                                    <h2 className="text-xs font-black flex items-center gap-2 mb-5 uppercase tracking-widest text-[#1DB954] border-b border-white/5 pb-3">
                                        <Music2 className="w-4 h-4" /> Playlist Recomendada
                                    </h2>
                                    <iframe src={getSpotifyEmbedUrl(radio.spotifyUrl)!} width="100%" height="232" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl border-0 bg-transparent" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Podcasts On-Demand (Visible en ambos modos si hay datos) */}
                    {podcasts.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                                <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
                                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--primary)' }}></span> Podcasts Destacados
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {podcasts.slice(0, 4).map((p: any) => (
                                    <Link key={p.id} href={`/radio/${slug}/podcast/${p.id}`} className="group flex flex-col border border-white/5 rounded-2xl overflow-hidden transition-all shadow-lg pb-4" style={{ backgroundColor: 'var(--secondary)' }}>
                                        <div className="relative aspect-[16/9] bg-slate-800 overflow-hidden">
                                            {p.portadaUrl ? <img src={p.portadaUrl} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center bg-pink-900/10"><Headphones className="w-12 h-12 text-pink-500/20" /></div>}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                        </div>
                                        <div className="px-5 pt-4">
                                            <h3 className="font-black text-white text-lg line-clamp-1 group-hover:opacity-80 transition-colors uppercase tracking-tight">{p.titulo}</h3>
                                            <div className="flex items-center justify-between mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                                                <span>{p._count?.episodios || 0} Episodios</span>
                                                <span className="flex items-center gap-1" style={{ color: 'var(--primary)' }}>Oír <PlayCircle className="w-4 h-4" /></span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    {/* Al Aire Ahora (Mantenemos como widget fijo al inicio por importancia) */}
                    {!isPureRadio && (
                        <div className="backdrop-blur-md shadow-2xl rounded-2xl p-6 border border-white/5 relative overflow-hidden" style={{ backgroundColor: 'var(--secondary)', opacity: 0.95 }}>
                            <h2 className="text-lg font-black flex items-center gap-2 mb-6 uppercase tracking-wider border-b border-white/10 pb-4">
                                <span className="w-2 h-2 bg-purple-500 rounded-sm animate-pulse"></span> Al Aire Ahora
                            </h2>
                            {programasHoy.length === 0 ? <p className="text-center text-slate-500 font-medium py-6 text-sm italic">Sin programación disponible hoy.</p> : (
                                <div className="space-y-6">
                                    {[programaActual, programaSiguiente].filter(p => !!p).map((p: any) => {
                                        const esActual = p?.id === programaActual?.id;
                                        return (
                                            <div key={p.id} 
                                                 className={`flex gap-4 items-center group relative p-3 rounded-2xl transition-all border ${esActual ? '' : 'bg-white/5 border-white/10'}`}
                                                 style={esActual ? { backgroundColor: 'var(--primary)10', borderColor: 'var(--primary)30' } : {}}
                                            >
                                                <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-lg border-2 ${esActual ? '' : 'border-white/10'}`} style={esActual ? { borderColor: 'var(--primary)40' } : {}}>
                                                    {p.imagenPrograma ? <img src={p.imagenPrograma} alt={p.nombrePrograma} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <CalendarDays className="w-6 h-6 m-auto mt-4 text-slate-500" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${esActual ? 'animate-pulse' : 'opacity-60'}`} style={{ backgroundColor: esActual ? 'var(--primary)' : 'var(--primary)60' }} />
                                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${esActual ? 'brightness-125' : 'opacity-80'}`} style={{ color: 'var(--primary)' }}>
                                                            {esActual ? 'En Vivo Ahora' : 'A Continuación'}
                                                        </p>
                                                    </div>
                                                    <p className="font-black text-white text-base line-clamp-1 group-hover:opacity-80 transition-colors leading-tight uppercase tracking-tight">{p.nombrePrograma}</p>
                                                    <p className={`text-[11px] font-mono font-bold mt-1.5 px-2 py-0.5 rounded-md inline-block tracking-tighter ${esActual ? 'brightness-110 shadow-sm' : 'bg-white/10 text-slate-400'}`} style={esActual ? { backgroundColor: 'var(--primary)20', color: 'white' } : {}}>
                                                        {p.horaInicio} – {p.horaFin}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {programacion.length > 0 && <Link href={`/radio/${slug}/programacion`} className="mt-6 w-full text-center text-[10px] font-black uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2 transition-all" style={{ color: 'var(--primary)' }}>Explorar Grilla <ChevronRight className="w-4 h-4" /></Link>}
                        </div>
                    )}

                    {/* Chat Box (También fijo o manejado por separado por su naturaleza interactiva) */}
                    {radio?.id && <ChatBox radioId={radio.id} isPureRadio={isPureRadio} />}

                    {/* Widgets dinámicos configurados en el Admin */}
                    {activeWidgets.length > 0 ? (
                        activeWidgets.map((widget: any) => {
                            if (widget.id === 'polls' && radio?.id) {
                                return (
                                    <div key={widget.id} ref={pollWidgetRef} className="bg-white/[0.02] border border-white/10 rounded-3xl p-1 overflow-hidden shadow-2xl">
                                        <PollWidget radioId={radio.id} />
                                    </div>
                                );
                            }
                            if (widget.id === 'ads') {
                                return (
                                    <div key={widget.id}>
                                        <AdsWidget 
                                            adImage={radio.adSquare} 
                                            banners={banners.filter((b: any) => b.ubicacion && b.ubicacion.toUpperCase() === 'SIDEBAR')} 
                                        />
                                    </div>
                                );
                            }
                            if (widget.id === 'currency') {
                                return (
                                    <div key={widget.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                         <CurrencyWidget type={widget.type || 'blue'} />
                                    </div>
                                );
                            }
                            if (widget.id === 'podcasts' && radio?.id) {
                                return (
                                    <div key={widget.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                        <RecentPodcastsWidget radioId={radio.id} slug={slug} />
                                    </div>
                                );
                            }
                            return null;
                        })
                    ) : (
                        // Fallback si no hay widgets configurados
                        <>
                            {radio?.id && (
                                <div ref={pollWidgetRef} className="bg-white/[0.02] border border-white/10 rounded-3xl p-1 overflow-hidden shadow-2xl">
                                    <PollWidget radioId={radio.id} />
                                </div>
                            )}
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                <CurrencyWidget type="blue" />
                            </div>
                        </>
                    )}

                    {/* Spotify (Mantenemos si está activo) */}
                    {radio?.mostrarSpotify && radio?.spotifyUrl && getSpotifyEmbedUrl(radio.spotifyUrl) && (
                        <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/5 p-1 shadow-2xl">
                            <iframe src={getSpotifyEmbedUrl(radio.spotifyUrl)!} width="100%" height="380" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl border-0" />
                        </div>
                    )}
                </div>
            </div>

            {/* Banner FOOTER */}
            {radio?.publicidadActiva && banners.some(b => b.ubicacion === 'FOOTER') && (
                <div className="mx-auto max-w-7xl px-4 mt-12 mb-20">
                    <BannerSlider banners={banners.filter(b => b.ubicacion === 'FOOTER')} ubicacion="FOOTER" />
                </div>
            )}
        </div>
    );
}
