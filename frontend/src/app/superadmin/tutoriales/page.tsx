"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, PlusCircle, Trash2, Save, Loader2, GripVertical } from 'lucide-react';

export default function SuperAdminTutorialesPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/tutoriales')
            .then(r => setItems(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const agregar = () => setItems([...items, { titulo: '', descripcion: '', videoUrl: '', duracion: '', categoria: '', dificultad: 'Básico' }]);
    const eliminar = (i: number) => setItems(items.filter((_, idx) => idx !== i));
    const actualizar = (i: number, campo: string, valor: string) => {
        const copia = [...items];
        copia[i] = { ...copia[i], [campo]: valor };
        setItems(copia);
    };

    const guardar = async () => {
        setSaving(true);
        try {
            await api.post('/tutoriales', items);
            setMsg('✅ Tutoriales guardados.');
        } catch { setMsg('❌ Error guardando.'); }
        finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
    };

    const Campo = ({ label, name, idx, type = 'text', placeholder = '' }: any) => (
        <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1 block">{label}</label>
            <input
                type={type}
                value={items[idx][name]}
                onChange={e => actualizar(idx, name, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-500/40 transition-all"
            />
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <BookOpen className="text-red-500 w-8 h-8" /> Editor de Tutoriales
                    </h1>
                    <p className="text-slate-400 mt-1">Agregá videos, guías y recursos de ayuda para tus clientes.</p>
                </div>
                <div className="flex items-center gap-3">
                    {msg && <span className="text-sm text-green-400 font-medium">{msg}</span>}
                    <button onClick={guardar} disabled={saving} className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-60">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, i) => (
                        <div key={i} className="bg-[#1a0a0a] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <GripVertical className="w-5 h-5 text-slate-600 mt-1 shrink-0 cursor-grab" />
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Campo label="Título" name="titulo" idx={i} placeholder="Ej: Primeros pasos con ONRADIO" />
                                    <Campo label="URL del Video (YouTube)" name="videoUrl" idx={i} placeholder="https://youtube.com/watch?v=..." />
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1 block">Descripción</label>
                                        <textarea
                                            value={item.descripcion}
                                            onChange={e => actualizar(i, 'descripcion', e.target.value)}
                                            rows={2}
                                            placeholder="Descripción breve del tutorial..."
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-500/40 transition-all resize-none"
                                        />
                                    </div>
                                    <Campo label="Categoría" name="categoria" idx={i} placeholder="Ej: Transmisión, CMS, AutoDJ" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Campo label="Duración" name="duracion" idx={i} placeholder="Ej: 10 min" />
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1 block">Dificultad</label>
                                            <select
                                                value={item.dificultad}
                                                onChange={e => actualizar(i, 'dificultad', e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/40 transition-all"
                                            >
                                                <option>Básico</option>
                                                <option>Intermedio</option>
                                                <option>Avanzado</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => eliminar(i)} className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all mt-1 shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={agregar}
                        className="w-full border border-dashed border-white/10 hover:border-red-500/30 rounded-2xl p-4 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                    >
                        <PlusCircle className="w-4 h-4" /> Agregar Tutorial
                    </button>
                </div>
            )}
        </div>
    );
}
