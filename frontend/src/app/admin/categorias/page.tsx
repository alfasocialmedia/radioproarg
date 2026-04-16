"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Tag, PlusCircle, Pencil, Trash2, Save, X, Loader2, Check } from 'lucide-react';

export default function AdminCategoriasPage() {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [nombre, setNombre] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const cargar = () => {
        setLoading(true);
        api.get('/categorias')
            .then(r => setCategorias(Array.isArray(r.data) ? r.data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, []);

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setSaving(true);
        try {
            const slug = nombre.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (editId) {
                await api.put(`/categorias/${editId}`, { nombre, slug });
                setMsg('✅ Categoría actualizada');
            } else {
                await api.post('/categorias', { nombre, slug });
                setMsg('✅ Categoría creada');
            }
            setNombre('');
            setEditId(null);
            setShowForm(false);
            cargar();
        } catch (e: any) {
            setMsg(e.response?.data?.error || '❌ Error guardando');
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar la categoría "${nombre}"? Las noticias que la usen quedarán sin categoría.`)) return;
        try {
            await api.delete(`/categorias/${id}`);
            setMsg('✅ Eliminada');
            cargar();
        } catch { setMsg('❌ Error eliminando'); }
        setTimeout(() => setMsg(''), 3000);
    };

    const abrirEditar = (cat: any) => {
        setNombre(cat.nombre);
        setEditId(cat.id);
        setShowForm(true);
    };

    const cancelar = () => {
        setNombre('');
        setEditId(null);
        setShowForm(false);
    };

    return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Tag className="text-primary w-8 h-8" /> Categorías
                    </h1>
                    <p className="text-slate-400 mt-1">Organizá las noticias de tu radio por categorías.</p>
                </div>
                <div className="flex items-center gap-3">
                    {msg && <span className="text-sm font-medium text-green-400">{msg}</span>}
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-primary hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <PlusCircle className="w-4 h-4" /> Nueva Categoría
                        </button>
                    )}
                </div>
            </div>

            {/* Formulario inline */}
            {showForm && (
                <div className="bg-[#0f172a] border border-primary/20 rounded-2xl p-5 mb-6">
                    <h2 className="text-sm font-bold text-white mb-3">{editId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                    <form onSubmit={handleGuardar} className="flex gap-3">
                        <input
                            autoFocus
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Nombre de la categoría (ej: Tecnología, Deportes, Música...)"
                            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                        />
                        <button type="submit" disabled={saving || !nombre.trim()} className="bg-primary hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editId ? 'Actualizar' : 'Crear'}
                        </button>
                        <button type="button" onClick={cancelar} className="text-slate-500 hover:text-white px-3 py-2.5 rounded-xl transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </form>
                    {nombre && (
                        <p className="text-xs text-slate-500 mt-2">
                            Slug: <span className="text-primary font-mono">{nombre.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Lista de categorías */}
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : categorias.length === 0 ? (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl py-16 text-center">
                    <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Todavía no hay categorías.</p>
                    <p className="text-slate-600 text-sm mt-1">Crea la primera para organizar tus noticias.</p>
                    <button onClick={() => setShowForm(true)} className="mt-4 text-primary hover:underline text-sm font-bold">+ Crear categoría</button>
                </div>
            ) : (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{categorias.length} categorías</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {categorias.map((cat: any) => (
                            <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors group">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <Tag className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm">{cat.nombre}</p>
                                    <p className="text-xs text-slate-500 font-mono">{cat.slug}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {cat._count?.noticias !== undefined && (
                                        <span className="text-xs text-slate-500 mr-2">{cat._count.noticias} nota{cat._count.noticias !== 1 ? 's' : ''}</span>
                                    )}
                                    <button onClick={() => abrirEditar(cat)} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleEliminar(cat.id, cat.nombre)} className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
