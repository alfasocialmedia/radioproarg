"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { PlusCircle, Search, Trash2, Pencil, ImageIcon, Upload, Loader2, CheckCircle, AlertCircle, X, Eye, EyeOff, SearchCode, Share2, Heart, BarChart3 } from 'lucide-react';
import EditorTipTap from '@/components/EditorTipTap';

const BACKEND = 'http://localhost:4000';
const FORM_VACIO = { 
    titulo: '', slug: '', copete: '', contenidoHtml: '<p></p>', imagenDestacada: '',
    metaTitulo: '', metaDescripcion: '', ogImagen: '' 
};

export default function AdminNoticiasPage() {
    const [noticias, setNoticias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(FORM_VACIO);
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [encuestasDisponibles, setEncuestasDisponibles] = useState<any[]>([]);
    const [encuestaSeleccionadaId, setEncuestaSeleccionadaId] = useState<string>('');
    const imgRef = useRef<HTMLInputElement>(null);

    const radioId = typeof window !== 'undefined' ? localStorage.getItem('radioId') : null;

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const [resNoticias, resEncuestas] = await Promise.all([
                api.get('/noticias/admin/todas'),
                radioId ? api.get(`/encuestas/todas`) : Promise.resolve({ data: [] })
            ]);
            setNoticias(resNoticias.data);
            setEncuestasDisponibles(resEncuestas.data || []);
        } catch { showToast('error', 'Error cargando datos.'); }
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
            setForm(prev => ({ ...prev, imagenDestacada: data.url }));
            showToast('success', '✅ Imagen subida.');
        } catch (e: any) {
            showToast('error', `❌ Error subiendo imagen: ${e?.response?.data?.error || e.message}`);
        } finally { setUploadingImg(false); }
    };

    const abrirNueva = () => {
        setEditId(null);
        setForm(FORM_VACIO);
        setEncuestaSeleccionadaId('');
        setShowModal(true);
    };

    const abrirEditar = (noticia: any) => {
        setEditId(noticia.id);
        const poll = encuestasDisponibles.find(e => e.noticiaId === noticia.id);
        setEncuestaSeleccionadaId(poll?.id || '');
        setForm({
            titulo: noticia.titulo,
            slug: noticia.slug,
            copete: noticia.copete || '',
            contenidoHtml: noticia.contenidoHtml || '<p></p>',
            imagenDestacada: noticia.imagenDestacada || '',
            metaTitulo: noticia.metaTitulo || '',
            metaDescripcion: noticia.metaDescripcion || '',
            ogImagen: noticia.ogImagen || ''
        });
        setShowModal(true);
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let nId = editId;
            if (editId) {
                await api.put(`/noticias/${editId}`, form);
                showToast('success', '✅ Noticia actualizada.');
            } else {
                const token = localStorage.getItem('auth_token') || '';
                const res = await api.post('/noticias', form, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                nId = res.data.id;
                showToast('success', '✅ Noticia publicada.');
            }

            // Gestionar vínculo de encuesta
            if (nId) {
                // Desvincular encuestas previas de esta noticia (si las hubiera y cambió)
                const prevPoll = encuestasDisponibles.find(e => e.noticiaId === nId);
                if (prevPoll && prevPoll.id !== encuestaSeleccionadaId) {
                    await api.put(`/encuestas/${prevPoll.id}`, { noticiaId: null });
                }
                // Vincular la nueva
                if (encuestaSeleccionadaId) {
                    await api.put(`/encuestas/${encuestaSeleccionadaId}`, { noticiaId: nId });
                }
            }

            setShowModal(false);
            setForm(FORM_VACIO);
            cargar();
        } catch (e: any) {
            showToast('error', `❌ ${e?.response?.data?.error || e.message}`);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string, titulo: string) => {
        if (!confirm(`¿Eliminar la noticia "${titulo}"?`)) return;
        try {
            await api.delete(`/noticias/${id}`);
            showToast('success', '✅ Noticia eliminada.');
            cargar();
        } catch { showToast('error', '❌ Error eliminando noticia.'); }
    };

    const noticiasFiltradas = noticias.filter(n =>
        n.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm border animate-fade-in ${toast.type === 'success' ? 'bg-green-900/90 border-green-500/30' : 'bg-red-900/90 border-red-500/30'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">Gestión de Noticias</h1>
                    <p className="text-slate-400 mt-1">{noticias.length} publicaciones · portal informativo de tu radio</p>
                </div>
                <button
                    onClick={abrirNueva}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20"
                >
                    <PlusCircle className="w-5 h-5" /> Nueva Noticia
                </button>
            </div>

            {/* Buscador */}
            <div className="relative mb-5">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Buscar por titular..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/40 transition-all"
                />
            </div>

            {/* Tabla */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-yellow-400 animate-spin" /></div>
                ) : noticiasFiltradas.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        {busqueda ? 'No hay noticias que coincidan con la búsqueda.' : 'Aún no hay noticias publicadas.'}
                        <br />
                        <button onClick={abrirNueva} className="mt-4 text-yellow-400 hover:underline text-sm font-bold">+ Crear la primera</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Noticia</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Impacto</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {noticiasFiltradas.map((n: any) => (
                                    <tr key={n.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                                                    {n.imagenDestacada ? (
                                                        <img src={n.imagenDestacada} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-slate-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white text-sm line-clamp-1">{n.titulo}</p>
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5 line-clamp-1">/{n.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Share2 className="w-3 h-3 text-blue-400" />
                                                    {(n.sharesFacebook || 0) + (n.sharesWhatsapp || 0) + (n.sharesTwitter || 0)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Heart className="w-3 h-3 text-pink-500" />
                                                    {(n.votosMeEncanto || 0) + (n.votosInteresante || 0) + (n.votosRegular || 0) + (n.votosNoMeGusto || 0)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${n.estado === 'PUBLICADA'
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {n.estado === 'PUBLICADA' ? <><Eye className="w-3 h-3 inline mr-1" />Publicada</> : <><EyeOff className="w-3 h-3 inline mr-1" />Borrador</>}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {new Date(n.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => abrirEditar(n)}
                                                    className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg transition-all"
                                                >
                                                    <Pencil className="w-3 h-3" /> Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(n.id, n.titulo)}
                                                    className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Borrar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Creación/Edición */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white">{editId ? 'Editar Noticia' : 'Nueva Noticia'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleGuardar} className="space-y-4">
                            {/* Imagen Destacada */}
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-2">Imagen Destacada</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-20 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {form.imagenDestacada ? (
                                            <img src={form.imagenDestacada} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-7 h-7 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            ref={imgRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleUploadImagen(e.target.files[0])}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => imgRef.current?.click()}
                                            disabled={uploadingImg}
                                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                                        >
                                            {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {uploadingImg ? 'Subiendo...' : 'Subir desde dispositivo'}
                                        </button>
                                        <input
                                            type="url"
                                            value={form.imagenDestacada}
                                            onChange={e => setForm({ ...form, imagenDestacada: e.target.value })}
                                            placeholder="O pegá la URL de la imagen..."
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-1.5">Titular (Título) *</label>
                                    <input
                                        required
                                        value={form.titulo}
                                        onChange={e => setForm({ 
                                            ...form, 
                                            titulo: e.target.value, 
                                            slug: e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
                                            metaTitulo: form.metaTitulo || e.target.value // Autocompletar SEO
                                        })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                        placeholder="Ej: Nuevos eventos para este fin de semana"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-1.5">Slug (URL)</label>
                                    <input
                                        value={form.slug}
                                        onChange={e => setForm({ ...form, slug: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                        placeholder="se-genera-automaticamente"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Copete / Bajada (Resumen)</label>
                                <textarea
                                    rows={2}
                                    value={form.copete}
                                    onChange={e => setForm({ 
                                        ...form, 
                                        copete: e.target.value,
                                        metaDescripcion: form.metaDescripcion || e.target.value // Autocompletar SEO
                                    })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all resize-none"
                                    placeholder="Un breve resumen de 1-2 oraciones..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5 flex justify-between items-center">
                                    <span>Contenido de la Noticia *</span>
                                </label>
                                <EditorTipTap 
                                    value={form.contenidoHtml} 
                                    onChange={(html) => setForm({ ...form, contenidoHtml: html })} 
                                />
                            </div>

                            {/* SEO SECTION */}
                            <div className="pt-4 border-t border-white/10 mt-6">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <SearchCode className="w-4 h-4 text-primary" />
                                    Optimización SEO (Opcional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 block mb-1">Meta Título (Google)</label>
                                            <input
                                                value={form.metaTitulo}
                                                onChange={e => setForm({ ...form, metaTitulo: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/60"
                                                placeholder="Título optimizado para buscadores..."
                                                maxLength={60}
                                            />
                                            <span className="text-[10px] text-slate-500 float-right mt-1">{form.metaTitulo.length}/60</span>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 block mb-1">Meta Descripción</label>
                                            <textarea
                                                rows={3}
                                                value={form.metaDescripcion}
                                                onChange={e => setForm({ ...form, metaDescripcion: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/60 resize-none"
                                                placeholder="Descripción para mostrar en resultados de búsqueda..."
                                                maxLength={160}
                                            />
                                            <span className="text-[10px] text-slate-500 float-right mt-1">{form.metaDescripcion.length}/160</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-1">Imagen OpenGraph (WhatsApp, FB, X)</label>
                                        <div className="w-full h-24 bg-black/40 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                                            {form.ogImagen || form.imagenDestacada ? (
                                                <img src={form.ogImagen || form.imagenDestacada} alt="OG" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-slate-600" />
                                            )}
                                        </div>
                                        <input
                                            value={form.ogImagen}
                                            onChange={e => setForm({ ...form, ogImagen: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/60"
                                            placeholder="URL imagen social (por defecto usa la destacada)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SELECTOR DE ENCUESTA */}
                            <div className="pt-4 border-t border-white/10 mt-2">
                                <label className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-primary" />
                                    Vincular Encuesta
                                </label>
                                <select
                                    value={encuestaSeleccionadaId}
                                    onChange={e => setEncuestaSeleccionadaId(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/60 transition-all text-sm"
                                >
                                    <option value="" className="bg-[#0f172a]">Sin encuesta específica (usará la global de la radio)</option>
                                    {encuestasDisponibles
                                        .filter(e => !e.noticiaId || e.noticiaId === editId)
                                        .map(e => (
                                            <option key={e.id} value={e.id} className="bg-[#0f172a]">
                                                {e.pregunta} ({e.opciones.reduce((acc:any, o:any) => acc + (o.votos || 0), 0)} votos)
                                            </option>
                                        ))
                                    }
                                </select>
                                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                                    * Solo aparecen las encuestas que no están vinculadas a otras noticias.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition font-medium">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando</> : <><CheckCircle className="w-4 h-4" /> {editId ? 'Actualizar' : 'Publicar'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
