"use client";

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Megaphone, PlusCircle, Trash2, Pencil, Loader2, ExternalLink, CheckCircle, AlertCircle, X, Image as ImageIcon, Upload } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const FORM_VACIO = {
    auspiciante_nombre: '',
    auspiciante_email: '',
    imagenUrl: '',
    linkDestino: '',
    posicion: 'header',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    mostrarMobile: true,
    mostrarEscritorio: true,
};


export default function AdminPublicidadPage() {
    const [auspiciantes, setAuspiciantes] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_VACIO);
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [publicidadActiva, setPublicidadActiva] = useState(true);
    const [adDisplayBajoPlayer, setAdDisplayBajoPlayer] = useState<'slider' | 'grid'>('slider');
    const [updatingGlobal, setUpdatingGlobal] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);


    const imgRef = useRef<HTMLInputElement>(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const [respA, respB, respC] = await Promise.allSettled([
                api.get('/publicidad/auspiciantes'),
                api.get('/publicidad/banners'),
                api.get('/radios/config'),
            ]);
            if (respA.status === 'fulfilled') setAuspiciantes(Array.isArray(respA.value.data) ? respA.value.data : []);
            if (respB.status === 'fulfilled') setBanners(Array.isArray(respB.value.data) ? respB.value.data : []);
            if (respC.status === 'fulfilled') {
                setPublicidadActiva(respC.value.data.publicidadActiva);
                setAdDisplayBajoPlayer(respC.value.data.adDisplayBajoPlayer || 'slider');
            }
        } catch { }
        finally { setLoading(false); }
    };


    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUploadImagen = async (file: File) => {
        setUploadingImg(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const { data } = await api.post('/upload/imagen', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(prev => ({ ...prev, imagenUrl: data.url }));
            showToast('success', '✅ Imagen subida.');
        } catch (e: any) {
            showToast('error', `❌ ${e?.response?.data?.error || e.message}`);
        } finally { setUploadingImg(false); }
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // 1. Crear/encontrar el auspiciante
            let auspId = auspiciantes.find(a => a.nombreEmpresa === form.auspiciante_nombre)?.id;
            if (!auspId) {
                const resp = await api.post('/publicidad/auspiciantes', {
                    nombreEmpresa: form.auspiciante_nombre,
                    emailContacto: form.auspiciante_email || undefined,
                });
                auspId = resp.data.id;
            }

            // 2. Crear/Editar el banner
            const payload = {
                auspicianteId: auspId,
                imagenUrl: form.imagenUrl,
                urlDestino: form.linkDestino,
                posicion: form.posicion,
                fechaInicio: new Date(form.fechaInicio).toISOString(),
                fechaFin: form.fechaFin ? new Date(form.fechaFin).toISOString() : null,
            };

            if (editingId) {
                await api.put(`/publicidad/banners/${editingId}`, {
                    ...payload,
                    mostrarMobile: form.mostrarMobile,
                    mostrarEscritorio: form.mostrarEscritorio,
                });
                showToast('success', '✅ Banner actualizado correctamente.');
            } else {
                await api.post('/publicidad/banners', {
                    ...payload,
                    mostrarMobile: form.mostrarMobile,
                    mostrarEscritorio: form.mostrarEscritorio,
                });
                showToast('success', '✅ Banner publicado correctamente.');
            }


            setShowModal(false);
            setForm(FORM_VACIO);
            setEditingId(null);
            cargar();

        } catch (e: any) {
            showToast('error', `❌ ${e?.response?.data?.error || 'Error guardando banner.'}`);
        } finally { setSaving(false); }
    };

    const handleEliminarBanner = async (id: string) => {
        if (!confirm('¿Eliminar este banner?')) return;
        try {
            await api.delete(`/publicidad/banners/${id}`);
            showToast('success', '✅ Banner eliminado.');
            cargar();
        } catch { showToast('error', '❌ Error eliminando.'); }
    };

    const handleEditarBanner = (b: any) => {
        setEditingId(b.id);
        setForm({
            auspiciante_nombre: b.auspiciante?.nombreEmpresa || '',
            auspiciante_email: b.auspiciante?.emailContacto || '',
            imagenUrl: b.imagenUrl,
            linkDestino: b.urlDestino || '',
            posicion: b.ubicacion.toLowerCase(),
            fechaInicio: b.fechaInicio.split('T')[0],
            fechaFin: b.fechaFin ? b.fechaFin.split('T')[0] : '',
            mostrarMobile: b.mostrarMobile ?? true,
            mostrarEscritorio: b.mostrarEscritorio ?? true,
        });

        setShowModal(true);
    };


    const handleToggleGlobal = async () => {
        setUpdatingGlobal(true);
        try {
            const radioId = (await api.get('/radios/config')).data.id;
            await api.put(`/radios/${radioId}/config`, { publicidadActiva: !publicidadActiva });
            setPublicidadActiva(!publicidadActiva);
            showToast('success', `✅ Publicidad ${!publicidadActiva ? 'activada' : 'desactivada'} globalmente.`);
        } catch { showToast('error', '❌ Error al cambiar estado global.'); }
        finally { setUpdatingGlobal(false); }
    };

    const handleUpdateDisplay = async (val: 'slider' | 'grid') => {
        setUpdatingGlobal(true);
        try {
            const radioId = (await api.get('/radios/config')).data.id;
            await api.put(`/radios/${radioId}/config`, { adDisplayBajoPlayer: val });
            setAdDisplayBajoPlayer(val);
            showToast('success', `✅ Formato bajo player actualizado a ${val.toUpperCase()}.`);
        } catch { showToast('error', '❌ Error al actualizar formato.'); }
        finally { setUpdatingGlobal(false); }
    };

    const MEDIDAS: Record<string, string[]> = {
        header: [
            'Escritorio (Desktop): 970x250px (Recomendado) o 728x90px',
            'Móvil (Mobile): 320x100px (Recomendado) o 320x50px'
        ],
        sidebar: [
            'Caja Cuadrada: 300x250px (Universal)',
            'Skyscraper: 300x600px (Lateral largo)'
        ],
        footer: [
            'Escritorio: 970x90px o 728x90px',
            'Móvil: 320x50px'
        ],
        under_player: [
            'Escritorio: 728x90px o 970x250px',
            'Móvil: Cuadrados (300x250px) o rectangulares (320x100px)'
        ],
    };


    return (

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm border ${toast.type === 'success' ? 'bg-green-900/90 border-green-500/30' : 'bg-red-900/90 border-red-500/30'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Megaphone className="text-orange-400 w-8 h-8" /> Publicidad & Auspiciantes
                    </h1>
                    <p className="text-slate-400 mt-1">Gestioná los banners de publicidad que aparecen en el portal de tu radio.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                        <span className={`w-2 h-2 rounded-full ${publicidadActiva ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm font-bold text-white">Global: {publicidadActiva ? 'Activa' : 'Oculta'}</span>
                        <button
                            onClick={handleToggleGlobal}
                            disabled={updatingGlobal}
                            className={`ml-2 text-[10px] uppercase font-black px-2 py-1 rounded border transition-all ${publicidadActiva ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-green-500/50 text-green-400 hover:bg-green-500/10'}`}
                        >
                            {updatingGlobal ? '...' : publicidadActiva ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                        <button
                            onClick={() => handleUpdateDisplay('slider')}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${adDisplayBajoPlayer === 'slider' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Slider Player
                        </button>
                        <button
                            onClick={() => handleUpdateDisplay('grid')}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${adDisplayBajoPlayer === 'grid' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Grid Player
                        </button>
                    </div>
                    <button
                        onClick={() => { setEditingId(null); setForm(FORM_VACIO); setShowModal(true); }}
                        className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                        <PlusCircle className="w-5 h-5" /> Nuevo Banner
                    </button>
                </div>

            </div>

            {/* Guía de Medidas Rápida */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {Object.entries(MEDIDAS).map(([pos, ms]) => (
                    <div key={pos} className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm relative overflow-hidden group hover:border-orange-500/20 transition-all">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Megaphone className="w-10 h-10 text-orange-500" />
                        </div>
                        <h3 className="text-orange-500 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-orange-500" />
                            {pos}
                        </h3>
                        <ul className="space-y-1">
                            {ms.map((m, i) => (
                                <li key={i} className="text-[11px] text-slate-400 flex items-center gap-2">
                                    <div className="w-0.5 h-0.5 rounded-full bg-slate-600" />
                                    {m}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>


            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Auspiciantes', val: auspiciantes.length, color: 'orange' },
                    { label: 'Banners activos', val: banners.length, color: 'green' },
                    { label: 'Impresiones est.', val: '—', color: 'blue' },
                ].map(({ label, val, color }) => (
                    <div key={label} className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                        <p className="text-slate-400 text-sm mb-1">{label}</p>
                        <p className={`text-3xl font-black text-${color}-400`}>{val}</p>
                    </div>
                ))}
            </div>

            {/* Banners */}
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-orange-400 animate-spin" /></div>
            ) : banners.length === 0 ? (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-12 text-center">
                    <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No hay banners publicados todavía.</p>
                    <button onClick={() => setShowModal(true)} className="text-orange-400 hover:underline text-sm font-bold">+ Crear primer banner</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {banners.map((b: any) => (
                        <div key={b.id} className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden group hover:border-orange-500/20 transition-colors">
                            <div className="w-full h-32 bg-slate-800 relative overflow-hidden">
                                {b.imagenUrl
                                    ? <img src={b.imagenUrl} alt="banner" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-600" /></div>
                                }
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    {b.linkDestino && (
                                        <a href={b.linkDestino} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center hover:bg-black/80">
                                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                                        </a>
                                    )}
                                    <button onClick={() => handleEditarBanner(b)} className="w-8 h-8 bg-blue-500/60 rounded-lg flex items-center justify-center hover:bg-blue-500/80">
                                        <Pencil className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <button onClick={() => handleEliminarBanner(b.id)} className="w-8 h-8 bg-red-500/60 rounded-lg flex items-center justify-center hover:bg-red-500/80">
                                        <Trash2 className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>

                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <p className="font-bold text-white text-sm">{b.auspiciante?.nombreEmpresa || 'Sin nombre'}</p>
                                    <div className="flex gap-1.5">
                                        {b.mostrarEscritorio && <span title="Visible en escritorio" className="text-slate-500"><ExternalLink className="w-3 h-3" /></span>}
                                        {b.mostrarMobile && <span title="Visible en móvil" className="text-slate-500"><Megaphone className="w-3 h-3" /></span>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">

                                    <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-lg border border-orange-500/20 font-mono">{b.posicion}</span>
                                    {b.fechaFin && (
                                        <span className="text-[10px] text-slate-500">Vence: {new Date(b.fechaFin).toLocaleDateString('es-AR')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal nuevo banner */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Banner' : 'Nuevo Banner'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingId(null); setForm(FORM_VACIO); }} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleGuardar} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1.5">Nombre del auspiciante *</label>
                                <input required value={form.auspiciante_nombre} onChange={e => setForm({ ...form, auspiciante_nombre: e.target.value })}
                                    list="ausp-list" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/60"
                                    placeholder="Ej: Panadería Don Pedro" />
                                <datalist id="ausp-list">
                                    {auspiciantes.map(a => <option key={a.id} value={a.nombreEmpresa} />)}
                                </datalist>
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-1.5">Imagen del banner *</label>
                                <div className="flex items-start gap-3">
                                    <div className="w-20 h-16 bg-black/30 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                        {form.imagenUrl ? <img src={form.imagenUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-600" />}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadImagen(e.target.files[0])} />
                                        <button type="button" onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl text-sm font-bold transition-all w-full justify-center disabled:opacity-60">
                                            {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {uploadingImg ? 'Subiendo...' : 'Subir imagen'}
                                        </button>
                                        <input value={form.imagenUrl} onChange={e => setForm({ ...form, imagenUrl: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/60"
                                            placeholder="O pegá la URL..." />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-1.5">URL destino (clic en banner)</label>
                                <input value={form.linkDestino} onChange={e => setForm({ ...form, linkDestino: e.target.value })}
                                    type="url" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/60"
                                    placeholder="https://miempresa.com" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5">Posición</label>
                                    <select value={form.posicion} onChange={e => setForm({ ...form, posicion: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-orange-500/60 transition-all">
                                        <option value="header">Header</option>
                                        <option value="sidebar">Sidebar</option>
                                        <option value="footer">Footer</option>
                                        <option value="under_player">Bajo Reproductor (Solo Audio)</option>
                                    </select>
                                    <div className="mt-2.5 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                        <p className="text-[10px] text-orange-400 font-black uppercase tracking-wider mb-1">Medidas Exactas:</p>
                                        <ul className="space-y-1">
                                            {MEDIDAS[form.posicion].map((m, i) => (
                                                <li key={i} className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-orange-500/50" />
                                                    {m}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>


                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5">Inicio</label>
                                    <input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-orange-500/60" />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5">Fin (opcional)</label>
                                    <input type="date" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-orange-500/60" />
                                </div>
                            </div>

                                <div>
                                    <label className="text-sm text-slate-400 block mb-3">Visibilidad del Banner</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={form.mostrarEscritorio} onChange={e => setForm({ ...form, mostrarEscritorio: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-black/30 text-orange-500 focus:ring-orange-500/50" />
                                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Escritorio (Desktop)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={form.mostrarMobile} onChange={e => setForm({ ...form, mostrarMobile: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-black/30 text-orange-500 focus:ring-orange-500/50" />
                                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Celular (Móvil)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">

                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition font-medium">Cancelar</button>
                                <button type="submit" disabled={saving || !form.auspiciante_nombre || !form.imagenUrl}
                                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando</> : <><CheckCircle className="w-4 h-4" /> Publicar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
