"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Save, RadioReceiver, CheckCircle, Loader2, AlertCircle, Upload, ImageIcon, Layout, DollarSign, BarChart3, Headphones, Megaphone, GripVertical } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminEmisoraPage() {
    const [radioId, setRadioId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFondo, setUploadingFondo] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const logoRef = useRef<HTMLInputElement>(null);
    const fondoRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        nombre: '',
        streamUrl: '',
        logoUrl: '',
        fondoPlayerUrl: '',
        colorPrimario: '#3b82f6',
        colorSecundario: '#1d4ed8',
        spotifyUrl: '',
        whatsapp: '',
        mostrarSpotify: false,
        mercadoPagoLink: '',
        paypalLink: '',
        faviconUrl: '',
        ogImagenUrl: '',
        metaTitulo: '',
        metaDescripcion: '',
        configSidebar: [] as { id: string, enabled: boolean, label: string, type?: string }[],
    });

    const faviconRef = useRef<HTMLInputElement>(null);
    const ogImagenRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        api.get('/radios/config')
            .then(res => {
                const d = res.data;
                setRadioId(d.id);
                setForm({
                    nombre: d.nombre || '',
                    streamUrl: d.streamUrl || '',
                    logoUrl: d.logoUrl || '',
                    fondoPlayerUrl: d.fondoPlayerUrl || '',
                    colorPrimario: d.colorPrimario || '#3b82f6',
                    colorSecundario: d.colorSecundario || '#1d4ed8',
                    spotifyUrl: d.spotifyUrl || '',
                    whatsapp: d.whatsapp || '',
                    mostrarSpotify: d.mostrarSpotify || false,
                    mercadoPagoLink: d.mercadoPagoLink || '',
                    paypalLink: d.paypalLink || '',
                    faviconUrl: d.faviconUrl || '',
                    ogImagenUrl: d.ogImagenUrl || '',
                    metaTitulo: d.metaTitulo || '',
                    metaDescripcion: d.metaDescripcion || '',
                    configSidebar: d.configSidebar && Array.isArray(d.configSidebar) && d.configSidebar.length > 0 
                        ? d.configSidebar 
                        : [
                            { id: 'polls', label: 'Encuesta Actual', enabled: true },
                            { id: 'currency', label: 'Cotización Dólar', enabled: true },
                            { id: 'podcasts', label: 'Episodio Reciente', enabled: false },
                            { id: 'ads', label: 'Espacio Publicitario', enabled: true },
                        ],
                });
            })
            .catch(() => showToast('error', '❌ Error cargando configuración de la emisora.'))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUploadLogo = async (file: File) => {
        setUploadingLogo(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const res = await fetch(`${BACKEND}/api/v1/upload/imagen`, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForm(prev => ({ ...prev, logoUrl: data.url }));
            showToast('success', '✅ Logo subido correctamente.');
        } catch (e: any) {
            showToast('error', `❌ Error subiendo logo: ${e.message}`);
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleUploadFondo = async (file: File) => {
        setUploadingFondo(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const res = await fetch(`${BACKEND}/api/v1/upload/imagen`, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForm(prev => ({ ...prev, fondoPlayerUrl: data.url }));
            showToast('success', '✅ Fondo de Emisora subido correctamente.');
        } catch (e: any) {
            showToast('error', `❌ Error subiendo fondo: ${e.message}`);
        } finally {
            setUploadingFondo(false);
        }
    };

    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const [uploadingOg, setUploadingOg] = useState(false);

    const handleUploadFavicon = async (file: File) => {
        setUploadingFavicon(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const res = await fetch(`${BACKEND}/api/v1/upload/imagen`, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForm(prev => ({ ...prev, faviconUrl: data.url }));
            showToast('success', '✅ Favicon subido correctamente.');
        } catch (e: any) {
            showToast('error', `❌ Error subiendo favicon: ${e.message}`);
        } finally {
            setUploadingFavicon(false);
        }
    };

    const handleUploadOg = async (file: File) => {
        setUploadingOg(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const res = await fetch(`${BACKEND}/api/v1/upload/imagen`, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForm(prev => ({ ...prev, ogImagenUrl: data.url }));
            showToast('success', '✅ Imagen OG subida correctamente.');
        } catch (e: any) {
            showToast('error', `❌ Error subiendo imagen OG: ${e.message}`);
        } finally {
            setUploadingOg(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!radioId) return;
        setSaving(true);
        setToast(null);
        try {
            await api.put(`/radios/${radioId}/config`, form);
            showToast('success', '✅ Configuración guardada correctamente.');
        } catch (e: any) {
            showToast('error', `❌ Error: ${e?.response?.data?.error || e.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm border ${toast.type === 'success' ? 'bg-green-900/90 border-green-500/30' : 'bg-red-900/90 border-red-500/30'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <RadioReceiver className="text-primary w-8 h-8" /> Mi Emisora
                    </h1>
                    <p className="text-slate-400 mt-1">Configuración completa de tu radio.</p>
                </div>
                <button
                    form="emisora-form"
                    type="submit"
                    disabled={saving || loading}
                    className="bg-primary hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Guardando...' : 'Guardar Todo'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>
            ) : (
                <form id="emisora-form" onSubmit={handleSave} className="space-y-6">
                    {/* Logo */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-5">Logo de la Emisora</h2>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-black/30 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {form.logoUrl ? (
                                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-600" />
                                )}
                            </div>
                            <div className="space-y-3">
                                <input
                                    ref={logoRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => e.target.files?.[0] && handleUploadLogo(e.target.files[0])}
                                />
                                <button
                                    type="button"
                                    onClick={() => logoRef.current?.click()}
                                    disabled={uploadingLogo}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                                >
                                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {uploadingLogo ? 'Subiendo...' : 'Subir Logo desde Dispositivo'}
                                </button>
                                <p className="text-xs text-slate-500">PNG, JPG, WEBP · Máx 5MB</p>
                                <div className="space-y-1 mt-3">
                                    <label className="text-xs text-slate-500">O pegá una URL directa del logo:</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={form.logoUrl}
                                        onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fondo del Reproductor (Para emisoras Solo-Audio) */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-5">Fondo del Reproductor (Portales Básicos)</h2>
                        <div className="flex items-center gap-6">
                            <div className="w-40 h-24 rounded-2xl bg-black/30 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {form.fondoPlayerUrl ? (
                                    <img src={form.fondoPlayerUrl} alt="Fondo Player" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-600" />
                                )}
                            </div>
                            <div className="space-y-3 flex-1">
                                <input
                                    ref={fondoRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => e.target.files?.[0] && handleUploadFondo(e.target.files[0])}
                                />
                                <button
                                    type="button"
                                    onClick={() => fondoRef.current?.click()}
                                    disabled={uploadingFondo}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                                >
                                    {uploadingFondo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {uploadingFondo ? 'Subiendo Fondo...' : 'Asignar Imagen de Fondo'}
                                </button>
                                <p className="text-xs text-slate-500">Landscape recomendado (1920x1080) · WEBP/JPG</p>
                                <div className="space-y-1 mt-3">
                                    <label className="text-xs text-slate-500">O pegá una URL directa del fondo:</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={form.fondoPlayerUrl}
                                        onChange={e => setForm({ ...form, fondoPlayerUrl: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información General */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3">Información General</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nombre de la Emisora *</label>
                                <input
                                    required
                                    type="text"
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                                    placeholder="Ej: Radio Zenith FM"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">ID Tenant (solo lectura)</label>
                                <input
                                    disabled
                                    value={radioId}
                                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-mono text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">URL del Stream (Icecast / Shoutcast / MP3)</label>
                            <input
                                type="url"
                                value={form.streamUrl}
                                onChange={e => setForm({ ...form, streamUrl: e.target.value })}
                                placeholder="https://stream.miservidor.com:8000/live"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                            />
                            <p className="text-xs text-slate-500">URL pública y accesible en HTTP/HTTPS. El reproductor de tus oyentes usa esta URL.</p>
                        </div>
                    </div>

                    {/* SEO y PWA */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-6">
                        <div className="border-b border-white/5 pb-3">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">SEO y PWA (Visibilidad)</h2>
                            <p className="text-xs text-slate-500 mt-1">Configura cómo se verá tu portal cuando lo compartan y al instalarlo como App (PWA).</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Título SEO (meta title)</label>
                                <input
                                    type="text"
                                    value={form.metaTitulo}
                                    onChange={e => setForm({ ...form, metaTitulo: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                    placeholder="Ej: Radio Zenith - La mejor música"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Descripción SEO (meta description)</label>
                                <input
                                    type="text"
                                    value={form.metaDescripcion}
                                    onChange={e => setForm({ ...form, metaDescripcion: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                    placeholder="Escucha los mejores hits las 24hs..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                            {/* Favicon / Icono PWA */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-300 mb-4">Ícono PWA y Favicon</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-black/30 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {form.faviconUrl ? (
                                            <img src={form.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <input
                                            ref={faviconRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleUploadFavicon(e.target.files[0])}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => faviconRef.current?.click()}
                                            disabled={uploadingFavicon}
                                            className="flex w-full justify-center items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
                                        >
                                            {uploadingFavicon ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            Subir Ícono (PNG)
                                        </button>
                                        <p className="text-[10px] text-slate-500 text-center">Recomendado: 512x512px, transparente.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Imagen OG */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-300 mb-4">Imagen al compartir (Open Graph)</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-16 rounded-xl bg-black/30 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {form.ogImagenUrl ? (
                                            <img src={form.ogImagenUrl} alt="OG Image" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <input
                                            ref={ogImagenRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleUploadOg(e.target.files[0])}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => ogImagenRef.current?.click()}
                                            disabled={uploadingOg}
                                            className="flex w-full justify-center items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
                                        >
                                            {uploadingOg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            Subir Portada
                                        </button>
                                        <p className="text-[10px] text-slate-500 text-center">La imagen que sale en WhatsApp/Facebook.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integraciones */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3">Integraciones Adicionales</h2>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Número de WhatsApp (Contacto)</label>
                                <input
                                    type="text"
                                    value={form.whatsapp || ''}
                                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                    placeholder="Ej: +5491122334455"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/60 transition-all"
                                />
                                <p className="text-xs text-slate-500">Aparecerá un botón flotante en el portal para que los oyentes te escriban.</p>
                            </div>

                            <div className="space-y-2 border-t border-white/5 pt-4">
                                <label className="text-sm font-medium text-slate-300">Link a Playlist/Podcast de Spotify</label>
                                <input
                                    type="url"
                                    value={form.spotifyUrl}
                                    onChange={e => setForm({ ...form, spotifyUrl: e.target.value })}
                                    placeholder="https://open.spotify.com/playlist/..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                />
                                <div className="flex items-center gap-3 mt-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.mostrarSpotify}
                                            onChange={e => setForm({ ...form, mostrarSpotify: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                    <div>
                                        <span className="text-sm font-bold text-white block">Activar Playlist de Spotify</span>
                                        <span className="text-xs text-slate-500">Si está apagado, el widget no se mostrará en el portal.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gestión de Widgets Laterales */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                        <div className="border-b border-white/5 pb-3">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layout className="w-4 h-4 text-primary" /> Widgets de Barra Lateral (Portal)
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Elige qué módulos se mostrarán a la derecha de tus noticias y el orden de prioridad.</p>
                        </div>
                        
                        <div className="space-y-3">
                            {form.configSidebar.map((widget, index) => (
                                <div key={widget.id} className="flex items-center justify-between bg-black/30 border border-white/5 p-4 rounded-xl group transition-all hover:border-white/15">
                                    <div className="flex items-center gap-4">
                                        <div className="text-slate-600 cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className={`p-2 rounded-lg ${widget.enabled ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-500'}`}>
                                            {widget.id === 'polls' && <BarChart3 className="w-5 h-5" />}
                                            {widget.id === 'currency' && <DollarSign className="w-5 h-5" />}
                                            {widget.id === 'podcasts' && <Headphones className="w-5 h-5" />}
                                            {widget.id === 'ads' && <Megaphone className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold ${widget.enabled ? 'text-white' : 'text-slate-500'}`}>{widget.label}</h4>
                                            <div className="text-[11px] text-slate-600">
                                                {widget.id === 'polls' && 'Muestra la encuesta vinculada o global.'}
                                                {widget.id === 'currency' && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Variante:</span>
                                                        <select 
                                                            value={widget.type || 'blue'}
                                                            onChange={e => {
                                                                const newSidebar = [...form.configSidebar];
                                                                newSidebar[index].type = e.target.value;
                                                                setForm({ ...form, configSidebar: newSidebar });
                                                            }}
                                                            className="bg-black/50 border border-white/10 rounded-md text-[10px] px-2 py-1 text-white focus:outline-none focus:border-primary"
                                                        >
                                                            <option value="blue">Dólar Blue</option>
                                                            <option value="oficial">Dólar Oficial</option>
                                                            <option value="mep">Dólar MEP</option>
                                                            <option value="cripto">Dólar Cripto</option>
                                                            <option value="bolsa">Dólar Bolsa</option>
                                                        </select>
                                                    </div>
                                                )}
                                                {widget.id === 'podcasts' && 'Último episodio subido a tu canal.'}
                                                {widget.id === 'ads' && 'Banners publicitarios del sidebar.'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={widget.enabled}
                                                onChange={e => {
                                                    const newSidebar = [...form.configSidebar];
                                                    newSidebar[index].enabled = e.target.checked;
                                                    setForm({ ...form, configSidebar: newSidebar });
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                        
                                        <div className="flex flex-col gap-1">
                                            <button 
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => {
                                                    const newSidebar = [...form.configSidebar];
                                                    [newSidebar[index], newSidebar[index - 1]] = [newSidebar[index - 1], newSidebar[index]];
                                                    setForm({ ...form, configSidebar: newSidebar });
                                                }}
                                                className="p-1 hover:bg-white/5 rounded text-slate-500 disabled:opacity-0"
                                            >
                                                <Save className="w-3 h-3 rotate-180" /> {/* Reutilizando icono o usa uno de flecha */}
                                            </button>
                                            <button 
                                                type="button"
                                                disabled={index === form.configSidebar.length - 1}
                                                onClick={() => {
                                                    const newSidebar = [...form.configSidebar];
                                                    [newSidebar[index], newSidebar[index + 1]] = [newSidebar[index + 1], newSidebar[index]];
                                                    setForm({ ...form, configSidebar: newSidebar });
                                                }}
                                                className="p-1 hover:bg-white/5 rounded text-slate-500 disabled:opacity-0"
                                            >
                                                <Save className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3">Colores de Marca</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">Color Primario</label>
                                <div className="flex items-center gap-4">
                                    <input type="color" value={form.colorPrimario} onChange={e => setForm({ ...form, colorPrimario: e.target.value })} className="w-14 h-14 rounded-xl cursor-pointer border-none p-1 bg-black/30" />
                                    <div>
                                        <p className="text-white font-mono text-sm">{form.colorPrimario}</p>
                                        <p className="text-xs text-slate-500">Botones, énfasis</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">Color Secundario</label>
                                <div className="flex items-center gap-4">
                                    <input type="color" value={form.colorSecundario} onChange={e => setForm({ ...form, colorSecundario: e.target.value })} className="w-14 h-14 rounded-xl cursor-pointer border-none p-1 bg-black/30" />
                                    <div>
                                        <p className="text-white font-mono text-sm">{form.colorSecundario}</p>
                                        <p className="text-xs text-slate-500">Fondos, gradientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-10 rounded-xl overflow-hidden border border-white/5" style={{ background: `linear-gradient(to right, ${form.colorPrimario}, ${form.colorSecundario})` }} />
                    </div>

                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3">Donaciones & Monetización</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Link MercadoPago (Donaciones)</label>
                            <input type="url" value={form.mercadoPagoLink} onChange={e => setForm({ ...form, mercadoPagoLink: e.target.value })} placeholder="https://mpago.la/XXXXXXXX" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Link PayPal (Donaciones)</label>
                            <input type="url" value={form.paypalLink} onChange={e => setForm({ ...form, paypalLink: e.target.value })} placeholder="https://paypal.me/tunombre" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all" />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
