"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit2, Trash2, Headphones, Layers, Calendar, ChevronRight, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';

interface Podcast {
    id: string;
    titulo: string;
    descripcion: string;
    portadaUrl?: string;
    creadoEn: string;
    _count?: { episodios: number };
}

export default function PodcastsPage() {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [portadaUrl, setPortadaUrl] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        cargarPodcasts();
    }, []);

    const cargarPodcasts = async () => {
        try {
            const res = await api.get('/podcasts');
            setPodcasts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImage = async (file: File) => {
        setUploadingImage(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const { data } = await api.post('/upload/imagen', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPortadaUrl(data.url);
        } catch (e: any) {
            alert(`Error subiendo imagen: ${e?.response?.data?.error || e.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const abrirModalNuevo = () => {
        setEditandoId(null);
        setTitulo('');
        setDescripcion('');
        setPortadaUrl('');
        setModalAbierto(true);
    };

    const abrirModalEditar = (p: Podcast) => {
        setEditandoId(p.id);
        setTitulo(p.titulo);
        setDescripcion(p.descripcion || '');
        setPortadaUrl(p.portadaUrl || '');
        setModalAbierto(true);
    };

    const guardarPodcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            // Ya no es multipart, sino JSON normal
            const payload = { titulo, descripcion, portadaUrl };

            if (editandoId) {
                await api.put(`/podcasts/${editandoId}`, payload);
            } else {
                await api.post('/podcasts', payload);
            }
            setModalAbierto(false);
            cargarPodcasts();
        } catch (error: any) {
            alert('Error al guardar el programa de podcast. ' + (error.response?.data?.error || ''));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarPodcast = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el programa "${name}" y todos sus episodios? Esta acción es irreversible.`)) return;
        try {
            await api.delete(`/podcasts/${id}`);
            cargarPodcasts();
        } catch (error) {
            alert('Error eliminando el podcast.');
        }
    };

    if (loading) return <div className="p-8 text-slate-400 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Headphones className="text-primary w-8 h-8" /> Programas de Podcast
                    </h1>
                    <p className="text-slate-400 mt-1">Crea canales o programas, y luego sube episodios adentro.</p>
                </div>
                <button 
                    onClick={abrirModalNuevo}
                    className="bg-primary hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Nuevo Programa
                </button>
            </div>

            {podcasts.length === 0 ? (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-12 text-center text-slate-400">
                    <Headphones className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-lg font-medium text-white mb-2">No tienes ningún programa creado</p>
                    <p className="text-sm">Inicia creando el nombre de un Show o Canal de Podcasts.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {podcasts.map(p => (
                        <div key={p.id} className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all group flex flex-col relative w-full">
                            {p.portadaUrl ? (
                                <div className="h-40 w-full bg-slate-800 relative">
                                    <img src={p.portadaUrl} alt={p.titulo} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ) : (
                                <div className="h-40 w-full bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5 flex items-center justify-center">
                                    <Headphones className="w-12 h-12 text-slate-600" />
                                </div>
                            )}
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-1">{p.titulo}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                                    {p.descripcion || 'Sin descripción.'}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-5">
                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(p.creadoEn).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 text-pink-400">
                                        <Layers className="w-4 h-4" /> {p._count?.episodios || 0} Episodios
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => abrirModalEditar(p)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors" title="Editar Programa">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => eliminarPodcast(p.id, p.titulo)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="Eliminar Programa">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <Link 
                                        href={`/admin/podcasts/${p.id}`} 
                                        className="bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors"
                                    >
                                        Subir Episodios <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalAbierto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg p-6 my-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            {editandoId ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            {editandoId ? 'Editar Programa de Podcast' : 'Crear Programa de Podcast'}
                        </h2>
                        <form onSubmit={guardarPodcast} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Programa / Canal *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={titulo} 
                                    onChange={e => setTitulo(e.target.value)} 
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                    placeholder="Ej. Entrevistas de la Mañana"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
                                <textarea 
                                    value={descripcion} 
                                    onChange={e => setDescripcion(e.target.value)} 
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                    placeholder="De qué trata este programa..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Portada del Programa</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {portadaUrl ? (
                                            <img src={portadaUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                                            {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={e => e.target.files?.[0] && handleUploadImage(e.target.files[0])} 
                                                disabled={uploadingImage} 
                                            />
                                        </label>
                                        <input 
                                            type="url" 
                                            value={portadaUrl} 
                                            onChange={e => setPortadaUrl(e.target.value)} 
                                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary text-xs"
                                            placeholder="🔗 O pegá una URL de imagen..."
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 italic">Recomendado: Imagen cuadrada (1:1).</p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setModalAbierto(false)} 
                                    className="flex-1 py-3 text-slate-400 hover:text-white font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={guardando} 
                                    className="flex-1 flex justify-center items-center gap-2 bg-primary hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    {guardando ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : 'Guardar Programa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
