"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { HelpCircle, PlusCircle, Trash2, Save, Loader2, GripVertical, Sparkles, RefreshCw } from 'lucide-react';

export default function SuperAdminFaqPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [generando, setGenerando] = useState<number | null>(null); // índice del item que está generando

    useEffect(() => {
        api.get('/faq')
            .then(r => setItems(r.data.length ? r.data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const agregar = () => setItems([...items, { pregunta: '', respuesta: '', orden: items.length }]);
    const eliminar = (i: number) => setItems(items.filter((_, idx) => idx !== i));
    const actualizar = (i: number, campo: string, valor: string) => {
        const copia = [...items];
        copia[i] = { ...copia[i], [campo]: valor };
        setItems(copia);
    };

    const guardar = async () => {
        setSaving(true);
        try {
            await api.post('/faq', items);
            setMsg('✅ FAQ guardada correctamente.');
        } catch { setMsg('❌ Error guardando.'); }
        finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
    };

    // Genera respuesta con IA para un item según su pregunta
    const generarConIA = async (i: number) => {
        const pregunta = items[i]?.pregunta?.trim();
        if (!pregunta || pregunta.length < 5) {
            setMsg('❌ Escribí primero la pregunta antes de generar la respuesta.');
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        setGenerando(i);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/faq/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pregunta })
            });
            const data = await res.json();
            if (data.respuesta) {
                actualizar(i, 'respuesta', data.respuesta);
                setMsg('✨ Respuesta generada con IA correctamente.');
                setTimeout(() => setMsg(''), 3000);
            } else {
                setMsg('❌ ' + (data.error || 'Error al generar la respuesta.'));
                setTimeout(() => setMsg(''), 4000);
            }
        } catch {
            setMsg('❌ Error al conectar con el servicio de IA.');
            setTimeout(() => setMsg(''), 3000);
        } finally {
            setGenerando(null);
        }
    };

    // Genera todas las respuestas vacías en batch
    const generarTodas = async () => {
        const vacias = items.filter((item, i) => item.pregunta?.trim() && !item.respuesta?.trim());
        if (vacias.length === 0) {
            setMsg('ℹ️ No hay preguntas sin respuesta para generar.');
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        for (let i = 0; i < items.length; i++) {
            if (items[i]?.pregunta?.trim() && !items[i]?.respuesta?.trim()) {
                await generarConIA(i);
            }
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <HelpCircle className="text-red-500 w-8 h-8" /> Editor de FAQ
                    </h1>
                    <p className="text-slate-400 mt-1">Agregá, editá y generá respuestas automáticas con IA.</p>
                </div>
                <div className="flex items-center gap-3">
                    {msg && (
                        <span className={`text-sm font-medium ${msg.startsWith('✅') || msg.startsWith('✨') ? 'text-green-400' : msg.startsWith('ℹ️') ? 'text-blue-400' : 'text-red-400'}`}>
                            {msg}
                        </span>
                    )}
                    <button
                        onClick={generarTodas}
                        disabled={saving || generando !== null}
                        className="bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                        title="Genera con IA las respuestas vacías"
                    >
                        <Sparkles className="w-4 h-4" /> Generar vacías con IA
                    </button>
                    <button
                        onClick={guardar}
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, i) => (
                        <div key={i} className="bg-[#0d1526] border border-white/5 rounded-2xl p-5 space-y-3 hover:border-white/10 transition-colors">
                            <div className="flex items-start gap-3">
                                <GripVertical className="w-5 h-5 text-slate-600 mt-3 shrink-0 cursor-grab" />
                                <div className="flex-1 space-y-3">

                                    {/* Pregunta */}
                                    <input
                                        type="text"
                                        value={item.pregunta}
                                        onChange={e => actualizar(i, 'pregunta', e.target.value)}
                                        placeholder="Pregunta..."
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-500/40 transition-all font-bold"
                                    />

                                    {/* Respuesta + botón IA */}
                                    <div className="relative">
                                        <textarea
                                            value={item.respuesta}
                                            onChange={e => actualizar(i, 'respuesta', e.target.value)}
                                            placeholder="Respuesta detallada... (o usá ✨ para generar con IA)"
                                            rows={3}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-500/40 transition-all resize-none pr-28"
                                        />
                                        {/* Badge IA */}
                                        {item.respuesta && (
                                            <span className="absolute top-2.5 right-2 text-[9px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider pointer-events-none">
                                                IA
                                            </span>
                                        )}
                                    </div>

                                    {/* Botones de acción del item */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => generarConIA(i)}
                                            disabled={generando === i || !item.pregunta?.trim()}
                                            className="flex items-center gap-1.5 text-xs bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/20 text-violet-300 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {generando === i
                                                ? <><Loader2 className="w-3 h-3 animate-spin" /> Generando...</>
                                                : item.respuesta?.trim()
                                                    ? <><RefreshCw className="w-3 h-3" /> Regenerar con IA</>
                                                    : <><Sparkles className="w-3 h-3" /> Generar respuesta con IA</>
                                            }
                                        </button>
                                        <span className="text-[10px] text-slate-600">
                                            {item.respuesta?.length || 0} caracteres
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => eliminar(i)}
                                    className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all mt-1 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={agregar}
                        className="w-full border border-dashed border-white/10 hover:border-red-500/30 rounded-2xl p-4 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                    >
                        <PlusCircle className="w-4 h-4" /> Agregar Pregunta
                    </button>
                </div>
            )}
        </div>
    );
}
