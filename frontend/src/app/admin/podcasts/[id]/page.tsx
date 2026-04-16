"use client";

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit2, Trash2, Headphones, ArrowLeft, Calendar, Link2, UploadCloud, Loader2, PlayCircle } from 'lucide-react';
import Link from 'next/link';

interface Programa {
    id: string;
    titulo: string;
    descripcion: string;
    portadaUrl?: string;
}

interface Episodio {
    id: string;
    titulo: string;
    descripcion: string;
    audioMp3Url?: string;
    audioLinkExt?: string;
    fechaPublicacion: string;
    reproducciones: number;
}

export default function EpisodiosAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: podcastId } = use(params);

    const [programa, setPrograma] = useState<Programa | null>(null);
    const [episodios, setEpisodios] = useState<Episodio[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    
    // Audio State
    const [tipoMedia, setTipoMedia] = useState<'url' | 'archivo'>('archivo');
    const [audioLinkExt, setAudioLinkExt] = useState('');
    const [archivoFisico, setArchivoFisico] = useState<File | null>(null);

    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (podcastId) {
            cargarDatos();
        }
    }, [podcastId]);

    const cargarDatos = async () => {
        try {
            const [resProg, resEpi] = await Promise.all([
                api.get(`/podcasts/${podcastId}`),
                api.get(`/podcasts/${podcastId}/episodios`)
            ]);
            setPrograma(resProg.data);
            setEpisodios(resEpi.data);
        } catch (error) {
            console.error(error);
            alert("Error cargando el programa.");
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNuevo = () => {
        setEditandoId(null);
        setTitulo('');
        setDescripcion('');
        setAudioLinkExt('');
        setArchivoFisico(null);
        setTipoMedia('archivo');
        setModalAbierto(true);
    };

    const abrirModalEditar = (ep: Episodio) => {
        setEditandoId(ep.id);
        setTitulo(ep.titulo);
        setDescripcion(ep.descripcion || '');
        setAudioLinkExt(ep.audioLinkExt || '');
        setTipoMedia(ep.audioMp3Url ? 'archivo' : (ep.audioLinkExt ? 'url' : 'archivo'));
        setArchivoFisico(null);
        setModalAbierto(true);
    };

    const guardarEpisodio = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('descripcion', descripcion);

            if (tipoMedia === 'archivo' && archivoFisico) {
                formData.append('audioFisico', archivoFisico);
            } else if (tipoMedia === 'url' && audioLinkExt) {
                formData.append('audioLinkExt', audioLinkExt);
            }

            if (editandoId) {
                await api.put(`/podcasts/episodios/${editandoId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post(`/podcasts/${podcastId}/episodios`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setModalAbierto(false);
            cargarDatos();
        } catch (error: any) {
            alert('Error al guardar el episodio. ' + (error.response?.data?.error || ''));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarEpisodio = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el episodio "${name}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/podcasts/episodios/${id}`);
            cargarDatos();
        } catch (error) {
            alert('Error eliminando el episodio.');
        }
    };

    if (loading) return <div className="p-8 text-slate-400 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!programa) return <div className="p-8 text-slate-400">Programa no encontrado.</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Link href="/admin/podcasts" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver a Programas
            </Link>
            
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                {programa.portadaUrl ? (
                    <img src={programa.portadaUrl} alt={programa.titulo} className="w-32 h-32 rounded-2xl object-cover shadow-2xl shrink-0" />
                ) : (
                    <div className="w-32 h-32 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
                        <Headphones className="w-10 h-10 text-slate-600" />
                    </div>
                )}
                <div className="flex-1">
                    <span className="text-xs font-black text-pink-500 uppercase tracking-widest mb-1.5 inline-block">PROGRAMA</span>
                    <h1 className="text-3xl font-black text-white mb-2">{programa.titulo}</h1>
                    <p className="text-slate-400 leading-relaxed text-sm max-w-2xl">{programa.descripcion}</p>
                </div>
                <button 
                    onClick={abrirModalNuevo}
                    className="bg-primary hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" /> Subir Episodio
                </button>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-xl font-bold text-white mb-4">Lista de Episodios ({episodios.length})</h2>

                {episodios.length === 0 ? (
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-10 text-center text-slate-400">
                        <PlayCircle className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                        <p className="text-lg font-medium text-white mb-1">Este programa aún no tiene episodios</p>
                        <p className="text-sm">Sube el primer archivo MP3 para empezar.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {episodios.map((ep, index) => (
                            <div key={ep.id} className="bg-[#0f172a] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5 transition-colors">
                                <div className="text-xl font-black text-slate-700 w-8 text-center bg-white/5 rounded-lg py-1">
                                    {String(episodios.length - index).padStart(2, '0')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-lg truncate">{ep.titulo}</h3>
                                    {ep.descripcion && <p className="text-sm text-slate-400 truncate mt-0.5">{ep.descripcion}</p>}
                                    <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(ep.fechaPublicacion).toLocaleDateString()}</span>
                                        {ep.audioMp3Url && <span className="text-green-400">URL Físico (MP3)</span>}
                                        {ep.audioLinkExt && <span className="text-purple-400">Link Externo</span>}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 border-t sm:border-none border-white/5 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                    {ep.audioMp3Url ? (
                                        <audio controls src={ep.audioMp3Url} className="h-9 w-[200px]" />
                                    ) : ep.audioLinkExt ? (
                                        <a href={ep.audioLinkExt} target="_blank" className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                            <Link2 className="w-4 h-4" /> Enlace
                                        </a>
                                    ) : null}

                                    <div className="flex gap-2 border-l border-white/10 pl-4">
                                        <button onClick={() => abrirModalEditar(ep)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors" title="Editar">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => eliminarEpisodio(ep.id, ep.titulo)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Episodio */}
            {modalAbierto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg p-6 my-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            {editandoId ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            {editandoId ? 'Editar Episodio' : 'Subir Nuevo Episodio'}
                        </h2>
                        <form onSubmit={guardarEpisodio} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Título del Episodio *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={titulo} 
                                    onChange={e => setTitulo(e.target.value)} 
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                    placeholder="Ej. Entrevista a Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Descripción Breve</label>
                                <textarea 
                                    value={descripcion} 
                                    onChange={e => setDescripcion(e.target.value)} 
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary h-20 resize-none"
                                />
                            </div>

                            {/* AUDIO UPLOADER SOURCE */}
                            <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-white/5 space-y-4 mt-2">
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Fuente de Audio / Video</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button" 
                                            className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${tipoMedia === 'archivo' ? 'bg-primary/20 border-primary text-blue-400' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20'}`}
                                            onClick={() => {
                                                if (tipoMedia === 'archivo') {
                                                    document.getElementById('fileInputMp3')?.click();
                                                } else {
                                                    setTipoMedia('archivo');
                                                }
                                            }}
                                        >
                                            <UploadCloud className="w-5 h-5" />
                                            <span className="text-xs font-bold font-sans">Subir Archivo MP3</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${tipoMedia === 'url' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20'}`}
                                            onClick={() => setTipoMedia('url')}
                                        >
                                            <Link2 className="w-5 h-5" />
                                            <span className="text-xs font-bold font-sans">Enlace Externo (URL)</span>
                                        </button>
                                    </div>
                                </div>

                                {tipoMedia === 'archivo' ? (
                                    <div className="pt-2">
                                        <label className="block text-sm mb-1 text-slate-400">Seleccionar Archivo (.mp3, .wav)</label>
                                        <input 
                                            id="fileInputMp3"
                                            type="file" 
                                            accept="audio/*" 
                                            onChange={(e) => setArchivoFisico(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                            required={!editandoId} 
                                        />
                                    </div>
                                ) : (
                                    <div className="pt-2">
                                        <label className="block text-sm mb-1 text-slate-400">Enlace Externo (Spotify, iVoox, YouTube)</label>
                                        <input 
                                            type="url" 
                                            value={audioLinkExt} 
                                            onChange={e => setAudioLinkExt(e.target.value)}
                                            className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                            placeholder="https://..."
                                            required={tipoMedia === 'url'}
                                        />
                                    </div>
                                )}
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
                                    {guardando ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : 'Guardar Episodio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
