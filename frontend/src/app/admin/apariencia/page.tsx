"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Palette, Layout, Save, CheckCircle, Loader2, Monitor, Type, MousePointer2, Settings2, Image as ImageIcon, Sliders, Upload, X } from 'lucide-react';

// --- Definición de Plantillas ---
const PLANTILLAS = [
    {
        id: 'clasico',
        nombre: 'Clásico',
        descripcion: 'Noticias a la izquierda, sidebar a la derecha. El favorito de las radios tradicionales.',
        preview: '/plantillas/clasico.png',
        accentClass: 'border-blue-500 ring-blue-500/30',
    },
    {
        id: 'moderno',
        nombre: 'Moderno (Magazine)',
        descripcion: 'Grid tipo magazine con la noticia hero en grande y cards compactas debajo.',
        preview: '/plantillas/moderno.png',
        accentClass: 'border-purple-500 ring-purple-500/30',
    },
    {
        id: 'minimalista',
        nombre: 'Minimalista',
        descripcion: 'Énfasis total en el streaming. Mínimo de texto, mucho impacto visual.',
        preview: '/plantillas/minimalista.png',
        accentClass: 'border-green-500 ring-green-500/30',
    },
];

const FUENTES = [
    { id: 'inter', nombre: 'Inter', ejemplo: 'La radio que te habla.' },
    { id: 'outfit', nombre: 'Outfit', ejemplo: 'La radio que te habla.' },
    { id: 'roboto', nombre: 'Roboto', ejemplo: 'La radio que te habla.' },
    { id: 'merriweather', nombre: 'Merriweather', ejemplo: 'La radio que te habla.' },
];

export default function AparienciaPage() {
    const [radioId, setRadioId] = useState<string>('');
    const [plantilla, setPlantilla] = useState('clasico');
    const [colorPrimario, setColorPrimario] = useState('#3b82f6'); // Acento General
    const [colorSecundario, setColorSecundario] = useState('#020817'); // Fondo Portal
    const [colorBotones, setColorBotones] = useState('#3b82f6');
    const [colorTextos, setColorTextos] = useState('#ffffff');
    const [playerColor, setPlayerColor] = useState('#1e293b');
    const [playerImagenUrl, setPlayerImagenUrl] = useState('');
    const [playerBlur, setPlayerBlur] = useState(0);
    const [iaIconoUrl, setIaIconoUrl] = useState('');
    const [fontFamily, setFontFamily] = useState('inter');
    const [tituloNoticias, setTituloNoticias] = useState('Titulares');
    
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [savedOk, setSavedOk] = useState(false);
    const [tieneCMS, setTieneCMS] = useState(false);
    const [planNombre, setPlanNombre] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/radios/config');
                const data = res.data;
                setRadioId(data.id);
                const hasCMS = (data.plan?.tieneCMS ?? false) && data.plan?.slug !== 'audio';
                setTieneCMS(hasCMS);
                setPlanNombre(data.plan?.nombre || 'Audio');
                
                setColorPrimario(data.colorPrimario || '#3b82f6');
                setColorSecundario(data.colorSecundario || '#020817');
                setColorBotones(data.colorBotones || data.colorPrimario || '#3b82f6');
                setColorTextos(data.colorTextos || '#ffffff');
                setPlayerColor(data.playerColor || '#1e293b');
                setPlayerImagenUrl(data.playerImagenUrl || '');
                setPlayerBlur(data.playerBlur || 0);
                setIaIconoUrl(data.iaIconoUrl || '');
                setFontFamily(data.fontFamily || 'inter');
                setTituloNoticias(data.tituloNoticias || 'Titulares');

                if (!hasCMS && data.plantilla !== 'clasico') {
                    setPlantilla('clasico');
                } else {
                    setPlantilla(data.plantilla || 'clasico');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            await api.put(`/radios/config`, {
                plantilla,
                colorPrimario,
                colorSecundario,
                colorBotones,
                colorTextos,
                playerColor,
                playerImagenUrl,
                playerBlur,
                iaIconoUrl,
                fontFamily,
                tituloNoticias,
            });
            setSavedOk(true);
            setTimeout(() => setSavedOk(false), 3000);
        } catch (err) {
            alert('Error guardando cambios');
        } finally {
            setGuardando(false);
        }
    };

    const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSubiendoImagen(true);
        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const res = await api.post('/upload/imagen', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data?.url) {
                setPlayerImagenUrl(res.data.url);
            }
        } catch (err) {
            console.error('Error upload:', err);
            alert('Error al subir la imagen. Intenta con un archivo más pequeño (máx 2MB).');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleSubirIconoIA = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSubiendoImagen(true);
        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const res = await api.post('/upload/imagen', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data?.url) {
                setIaIconoUrl(res.data.url);
            }
        } catch (err) {
            console.error('Error upload icono IA:', err);
            alert('Error al subir el icono. Intenta con un archivo más pequeño (máx 2MB).');
        } finally {
            setSubiendoImagen(false);
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" /> Cargando configuración de apariencia...
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 pb-32">
            {/* Toast */}
            {savedOk && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm bg-green-900/90 border border-green-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle className="w-5 h-5 text-green-400" /> ¡Apariencia actualizada!
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Palette className="text-pink-400 w-8 h-8" /> Apariencia del Portal
                    </h1>
                    <p className="text-slate-400 mt-1">Personaliza cada detalle visual de tu estación de radio.</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Plan {planNombre}</span>
                </div>
            </div>

            <form onSubmit={guardar} className="space-y-8">

                {/* --- SECCIÓN 1: PLANTILLA --- */}
                <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Layout className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-bold text-white tracking-tight">Estructura y Diseño</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PLANTILLAS.map(p => {
                            const isLocked = !tieneCMS && p.id !== 'clasico';
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => setPlantilla(p.id)}
                                    className={`relative text-left rounded-2xl border-2 p-5 transition-all group hover:bg-white/5 ${isLocked ? 'grayscale opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'} ${
                                        plantilla === p.id
                                            ? `${p.accentClass} bg-white/5 ring-4 ring-white/5`
                                            : 'border-white/5 bg-transparent opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <div className="aspect-video w-full bg-black/40 rounded-xl mb-4 overflow-hidden border border-white/5 flex items-center justify-center relative">
                                        <Monitor className="w-10 h-10 text-slate-700" />
                                        {isLocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                                                <div className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase">Bloqueado</div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-bold text-white">{p.nombre}</p>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.descripcion}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Título de Noticias */}
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Type className="w-4 h-4 text-blue-400" />
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Título de la Sección de Noticias</label>
                        </div>
                        <div className="relative group max-w-sm">
                            <input 
                                type="text"
                                value={tituloNoticias}
                                onChange={e => setTituloNoticias(e.target.value)}
                                placeholder="Ej: Titulares, Últimas Noticias, Actualidad..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                            />
                            <p className="text-[10px] text-slate-500 mt-2 ml-1 italic leading-relaxed">
                                Este es el título que aparecerá arriba del listado de noticias en tu portal público.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN 2: COLORES GENERALES (BOTONES Y FONDO) --- */}
                <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Palette className="w-5 h-5 text-pink-400" />
                        <h2 className="text-lg font-bold text-white tracking-tight">Colores del Entorno</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Botones */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MousePointer2 className="w-4 h-4 text-blue-400" />
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Color de Botones e Íconos</label>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <input type="color" value={colorBotones} onChange={e => setColorBotones(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl transition-transform" style={{ backgroundColor: colorBotones }} />
                                </div>
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-white flex items-center justify-between">
                                    <span className="text-lg tracking-widest">{colorBotones.toUpperCase()}</span>
                                    <button type="button" onClick={() => setColorBotones(colorPrimario)} className="text-[10px] text-slate-500 hover:text-white underline">Restaurar Primario</button>
                                </div>
                            </div>
                        </div>

                        {/* Fondo */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-purple-400" />
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Color de Fondo del Portal</label>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <input type="color" value={colorSecundario} onChange={e => setColorSecundario(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl transition-transform" style={{ backgroundColor: colorSecundario }} />
                                </div>
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-white flex items-center justify-between">
                                    <span className="text-lg tracking-widest">{colorSecundario.toUpperCase()}</span>
                                    <div className="w-3 h-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ backgroundColor: colorSecundario }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Textos */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-yellow-400" />
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Color de Textos Principales</label>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <input type="color" value={colorTextos} onChange={e => setColorTextos(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl transition-transform" style={{ backgroundColor: colorTextos }} />
                                </div>
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-white flex items-center justify-between">
                                    <span className="text-lg tracking-widest">{colorTextos.toUpperCase()}</span>
                                    <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white">ABC</div>
                                </div>
                            </div>
                        </div>
                        {/* Acento Secundario / Primario Legacy */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-pink-400" />
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Color de Acento (Detalles)</label>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <input type="color" value={colorPrimario} onChange={e => setColorPrimario(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl transition-transform" style={{ backgroundColor: colorPrimario }} />
                                </div>
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-white flex items-center justify-between">
                                    <span className="text-lg tracking-widest">{colorPrimario.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN 3: CONFIGURACIÓN DEL REPRODUCTOR (CARD) --- */}
                <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Settings2 className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white tracking-tight">Diseño del Reproductor</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <div className="space-y-6">
                            {/* Color de Fondo Card */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    <Palette className="w-3.5 h-3.5" /> Fondo del Card
                                </label>
                                <div className="flex items-center gap-4">
                                    <input type="color" value={playerColor} onChange={e => setPlayerColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm"
                                        value={playerColor}
                                        onChange={e => setPlayerColor(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Imagen de Fondo Player */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> Imagen de Fondo
                                </label>
                                
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative group">
                                            <input 
                                                type="text" 
                                                placeholder="https://ejemplo.com/fondo.jpg"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:border-blue-500 focus:outline-none transition-all pr-10"
                                                value={playerImagenUrl}
                                                onChange={e => setPlayerImagenUrl(e.target.value)}
                                            />
                                            {playerImagenUrl && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setPlayerImagenUrl('')}
                                                    className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <label className="relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg group">
                                            {subiendoImagen ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                                    <span className="text-sm">Subir</span>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleSubirImagen} 
                                                disabled={subiendoImagen}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium">Recomendado: 1200x800px. Máximo 2MB.</p>
                                </div>
                            </div>

                            {/* Blur Regulation */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                        <Sliders className="w-3.5 h-3.5" /> Intensidad del Blur (Desenfoque)
                                    </label>
                                    <span className="text-blue-400 font-mono font-bold text-sm bg-blue-400/10 px-2 py-0.5 rounded">{playerBlur}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="40" 
                                    step="1"
                                    className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    value={playerBlur}
                                    onChange={e => setPlayerBlur(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Previsualización del Reproductor */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Previsualización en tiempo real</label>
                            <div 
                                className="w-full aspect-square md:aspect-auto md:h-64 rounded-3xl border-2 border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 text-center"
                                style={{ backgroundColor: playerColor }}
                            >
                                {playerImagenUrl && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                                        style={{ 
                                            backgroundImage: `url(${playerImagenUrl})`,
                                            filter: `blur(${playerBlur}px)`
                                        }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/20" /> {/* Overlay para legibilidad */}
                                
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-white/20 rounded-2xl animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-6 w-40 bg-white/40 rounded-full mx-auto" />
                                        <div className="h-3 w-24 bg-white/20 rounded-full mx-auto" />
                                    </div>
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center pt-1 pl-1 shadow-lg" style={{ backgroundColor: colorBotones }}>
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN 4: TIPOGRAFÍA --- */}
                <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Type className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-bold text-white tracking-tight">Identidad de Texto</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {FUENTES.map(f => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setFontFamily(f.id)}
                                className={`text-left p-6 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                                    fontFamily === f.id
                                        ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/5'
                                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                }`}
                            >
                                <p className="font-black text-xl text-white" style={{ fontFamily: `var(--font-${f.id})` }}>
                                    {f.nombre}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold" style={{ fontFamily: `var(--font-${f.id})` }}>
                                    {f.ejemplo}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- SECCIÓN 5: ASISTENTE INTELIGENTE (IA) --- */}
                <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl -z-10" />
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <ImageIcon className="w-5 h-5 text-green-400" />
                        <h2 className="text-lg font-bold text-white tracking-tight">Asistente Inteligente (IA)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> Ícono del Asistente
                                </label>
                                
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative group">
                                            <input 
                                                type="text" 
                                                placeholder="https://ejemplo.com/icono.png"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:border-green-500 focus:outline-none transition-all pr-10"
                                                value={iaIconoUrl}
                                                onChange={e => setIaIconoUrl(e.target.value)}
                                            />
                                            {iaIconoUrl && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setIaIconoUrl('')}
                                                    className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <label className="relative flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg group">
                                            {subiendoImagen ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                                    <span className="text-sm">Subir</span>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleSubirIconoIA} 
                                                disabled={subiendoImagen}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium">Recomendado: 128x128px (formato PNG cuadrado).</p>
                                </div>
                            </div>
                        </div>

                        {/* Previsualización del Ícono */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Previsualización del Chatbot</label>
                            <div className="w-full h-32 md:h-40 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center p-8 text-center bg-black/20">
                                <div className="flex items-center gap-4 bg-[#0b141a] p-4 rounded-xl border border-white/5 shadow-2xl w-full max-w-xs">
                                     <div className="w-12 h-12 rounded-full overflow-hidden bg-[#00a884] flex items-center justify-center shrink-0 border border-white/10">
                                         {iaIconoUrl ? (
                                             <img src={iaIconoUrl} alt="IA Avatar" className="w-full h-full object-cover" />
                                         ) : (
                                             <div className="text-2xl font-black text-[#111b21]">IA</div>
                                         )}
                                     </div>
                                     <div className="flex-1 text-left">
                                         <p className="text-sm font-black text-[#e9edef]">Asistente ONRADIO</p>
                                         <p className="text-xs font-medium text-[#00a884]">en línea</p>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón Flotante de Guardado */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-40 w-full max-w-sm px-6">
                    <button
                        type="submit"
                        disabled={guardando}
                        className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-60 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(219,39,119,0.4)] active:scale-95 border-2 border-white/10 backdrop-blur-md"
                    >
                        {guardando ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando configuraciones...</> : <><Save className="w-5 h-5" /> Guardar Todos los Cambios</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
