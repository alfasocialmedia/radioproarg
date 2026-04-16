"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import {
    ImageIcon, Trash2, Loader2, Upload, Copy, CheckCheck,
    FolderOpen, Search, Eye, Film, File
} from 'lucide-react';

type TipoMedia = 'imagen' | 'video' | 'documento' | 'all';

const TIPO_ICON: Record<string, React.ReactNode> = {
    imagen: <ImageIcon className="w-4 h-4 text-blue-400" />,
    video: <Film className="w-4 h-4 text-purple-400" />,
    documento: <File className="w-4 h-4 text-orange-400" />,
};

const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function AdminMediaPage() {
    const [archivos, setArchivos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<TipoMedia>('all');
    const [copiado, setCopiado] = useState<string | null>(null);
    const [preview, setPreview] = useState<any | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const cargar = () => {
        setLoading(true);
        api.get('/upload/media')
            .then(r => setArchivos(Array.isArray(r.data) ? r.data : []))
            .catch(() => {
                // Si el endpoint aún no existe, listamos archivos del filesystem
                setArchivos([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            cargar();
        } catch { alert('Error subiendo el archivo.'); }
        finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/upload/${id}`);
            cargar();
        } catch { alert('Error eliminando el archivo.'); }
    };

    const copiarUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiado(url);
        setTimeout(() => setCopiado(null), 2000);
    };

    const filtrados = archivos.filter(a => {
        const okBusq = a.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        const okTipo = filtroTipo === 'all' || a.tipo === filtroTipo;
        return okBusq && okTipo;
    });

    const totalSize = archivos.reduce((acc, a) => acc + (a.tamano || 0), 0);

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <FolderOpen className="text-primary w-8 h-8" /> Gestor de Medios
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {archivos.length} archivos · {formatSize(totalSize)} usados
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        ref={inputRef} 
                        type="file" 
                        onChange={handleUpload} 
                        className="hidden" 
                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/*" 
                    />
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="bg-primary hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
                    >
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir Archivo</>}
                    </button>
                </div>
            </div>

            {/* Barra de herramientas */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>
                {(['all', 'imagen', 'video', 'documento'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setFiltroTipo(t)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${filtroTipo === t ? 'bg-primary/20 text-primary border-primary/30' : 'text-slate-500 border-white/5 hover:text-white hover:border-white/15'}`}
                    >
                        {t === 'all' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>
            ) : filtrados.length === 0 ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-primary/30 rounded-2xl py-20 text-center cursor-pointer transition-all group"
                >
                    <Upload className="w-12 h-12 text-slate-600 group-hover:text-primary mx-auto mb-3 transition-colors" />
                    <p className="text-slate-400 font-medium group-hover:text-white transition-colors">
                        {busqueda ? 'No se encontraron archivos' : 'No hay archivos subidos todavía'}
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                        {!busqueda && 'Hacé click o arrastrá un archivo para empezar'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filtrados.map((archivo: any) => (
                        <div key={archivo.id || archivo.url} className="bg-[#0f172a] border border-white/5 rounded-xl overflow-hidden group hover:border-primary/20 transition-all">
                            {/* Thumbnail */}
                            <div className="aspect-square bg-black/30 flex items-center justify-center relative overflow-hidden">
                                {archivo.tipo === 'imagen' ? (
                                    <img
                                        src={archivo.url}
                                        alt={archivo.nombre}
                                        className="w-full h-full object-cover"
                                        onError={e => (e.currentTarget.style.display = 'none')}
                                    />
                                ) : (
                                    <div className="text-slate-600">
                                        {TIPO_ICON[archivo.tipo] || <File className="w-8 h-8" />}
                                    </div>
                                )}
                                {/* Overlay con acciones */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                    <button onClick={() => setPreview(archivo)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => copiarUrl(archivo.url)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                                        {copiado === archivo.url ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleEliminar(archivo.id, archivo.nombre)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Info */}
                            <div className="p-2.5">
                                <p className="text-xs text-white font-medium truncate" title={archivo.nombre}>{archivo.nombre || 'sin nombre'}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{formatSize(archivo.tamano)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de preview */}
            {preview && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                    <div className="max-w-3xl w-full bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        {preview.tipo === 'imagen' ? (
                            <img src={preview.url} alt={preview.nombre} className="w-full max-h-[70vh] object-contain" />
                        ) : (
                            <div className="flex items-center justify-center h-48 text-slate-500">
                                {TIPO_ICON[preview.tipo] || <File className="w-12 h-12" />}
                            </div>
                        )}
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-bold text-white">{preview.nombre}</p>
                                <p className="text-xs text-slate-500">{formatSize(preview.tamano)} · {preview.tipo}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => copiarUrl(preview.url)} className="flex items-center gap-2 text-sm bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-xl transition-all border border-primary/20">
                                    {copiado === preview.url ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    Copiar URL
                                </button>
                                <button onClick={() => { handleEliminar(preview.id, preview.nombre); setPreview(null); }} className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-xl transition-all border border-red-500/20">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
