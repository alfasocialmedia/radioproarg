"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CreditCard, CheckCircle, XCircle, Clock, Radio, Loader2, RefreshCw, X, Save, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

interface Plan {
    id: string;
    slug: string;
    nombre: string;
}

interface RadioRow {
    id: string;
    nombre: string;
    subdominio: string;
    activa: boolean;
    suspendida: boolean;
    fechaCreacion: string;
    planId: string | null;
    planVenceEn: string | null;
    plan: Plan | null;
}

export default function SuperAdminSuscripcionesPage() {
    const [radios, setRadios] = useState<RadioRow[]>([]);
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<RadioRow | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Form state del modal
    const [formPlanId, setFormPlanId] = useState<string>('');
    const [formActiva, setFormActiva] = useState(true);
    const [formSuspendida, setFormSuspendida] = useState(false);
    const [formVencimiento, setFormVencimiento] = useState('');

    const mostrarToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const cargar = async () => {
        setLoading(true);
        try {
            const [radiosRes, planesRes] = await Promise.all([
                api.get('/radios/all'),
                api.get('/planes'),
            ]);
            setRadios(radiosRes.data);
            setPlanes(planesRes.data);
        } catch {
            mostrarToast('error', 'Error cargando datos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const abrirGestionar = (r: RadioRow) => {
        setSelected(r);
        setFormPlanId(r.planId || '');
        setFormActiva(r.activa);
        setFormSuspendida(r.suspendida);
        setFormVencimiento(r.planVenceEn ? r.planVenceEn.split('T')[0] : '');
    };

    const guardar = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await api.put(`/radios/${selected.id}/config`, {
                planId: formPlanId || null,
                activa: formActiva,
                suspendida: formSuspendida,
                planVenceEn: formVencimiento || null,
            });
            mostrarToast('success', `✅ Suscripción de "${selected.nombre}" actualizada.`);
            setSelected(null);
            cargar();
        } catch (e: any) {
            mostrarToast('error', e.response?.data?.error || '❌ Error guardando cambios.');
        } finally {
            setSaving(false);
        }
    };

    const PLAN_PRECIOS: Record<string, number> = { audio: 7000, portal: 20000 };
    const totalMRR = radios.reduce((acc, r) => acc + (PLAN_PRECIOS[r.plan?.slug || 'audio'] || 7000), 0);
    const countAudio = radios.filter(r => !r.plan || r.plan.slug === 'audio').length;
    const countPortal = radios.filter(r => r.plan?.slug === 'portal').length;

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm border ${
                    toast.type === 'success' ? 'bg-green-900/90 border-green-500/30' : 'bg-slate-800 border-white/10'
                }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-amber-400" />}
                    {toast.msg}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <CreditCard className="text-violet-400 w-8 h-8" /> Suscripciones
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Estado actual de los planes contratados por cada emisora.</p>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">MRR Total</p>
                    <p className="text-3xl font-black text-white">${totalMRR.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-slate-500 mt-1">Pesos Argentinos / mes</p>
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-2">Plan Audio ({countAudio})</p>
                    <p className="text-3xl font-black text-blue-400">${(7000 * countAudio).toLocaleString('es-AR')}</p>
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs font-bold text-violet-400/60 uppercase tracking-widest mb-2">Plan Portal ({countPortal})</p>
                    <p className="text-3xl font-black text-violet-400">${(20000 * countPortal).toLocaleString('es-AR')}</p>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h2 className="font-bold text-white">Estado por Emisora</h2>
                    <button onClick={cargar} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors">
                        <RefreshCw className="w-3 h-3" /> Actualizar
                    </button>
                </div>
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    {['Emisora', 'Plan', 'Precio/mes', 'Estado', 'Vence', 'Alta', 'Acciones'].map(h => (
                                        <th key={h} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {radios.map((r) => {
                                    const planSlug = r.plan?.slug || 'audio';
                                    const planNombre = r.plan?.nombre || 'Audio';
                                    const precio = PLAN_PRECIOS[planSlug] || 7000;
                                    return (
                                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Radio className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{r.nombre}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{r.subdominio}.onradio.com.ar</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${planSlug === 'portal'
                                                    ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                                    {planSlug === 'portal' ? '🌐' : '🎧'} {planNombre}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-white font-bold">${precio.toLocaleString('es-AR')} ARS</td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-lg border ${
                                                    r.suspendida ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                    r.activa ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                    'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                                }`}>
                                                    {r.suspendida ? <><Clock className="w-3 h-3" /> Suspendida</> :
                                                     r.activa ? <><CheckCircle className="w-3 h-3" /> Activa</> :
                                                     <><XCircle className="w-3 h-3" /> Inactiva</>}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {r.planVenceEn ? new Date(r.planVenceEn).toLocaleDateString('es-AR') : <span className="text-slate-600">Sin venc.</span>}
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {new Date(r.fechaCreacion).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => abrirGestionar(r)}
                                                    className="text-xs font-bold text-violet-400 hover:text-white flex items-center gap-1 hover:bg-violet-500/10 px-2.5 py-1.5 rounded-lg transition-all"
                                                >
                                                    <CreditCard className="w-3 h-3" /> Gestionar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de gestión */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-white">Gestionar Suscripción</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{selected.nombre}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Selector de Plan */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Plan Contratado</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormPlanId('')}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-all text-left ${!formPlanId ? 'border-slate-500 bg-slate-500/10 text-white' : 'border-white/10 text-slate-500'}`}
                                    >
                                        Sin plan asignado
                                    </button>
                                    {planes.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setFormPlanId(p.id)}
                                            className={`p-3 rounded-xl border-2 font-bold text-sm transition-all text-left ${formPlanId === p.id
                                                ? p.slug === 'portal' ? 'border-violet-500 bg-violet-500/10 text-white' : 'border-blue-500 bg-blue-500/10 text-white'
                                                : 'border-white/10 text-slate-500'}`}
                                        >
                                            {p.slug === 'portal' ? '🌐' : '🎧'} {p.nombre}
                                            <span className="text-xs font-normal opacity-60 ml-2">
                                                AR$ {p.slug === 'portal' ? '20.000' : '7.000'}/mes
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fecha de vencimiento */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> Vencimiento del Plan
                                </label>
                                <input
                                    type="date"
                                    value={formVencimiento}
                                    onChange={e => setFormVencimiento(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/40 transition-all text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-1">Dejá vacío para suscripción indefinida.</p>
                            </div>

                            {/* Estado de la emisora */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Estado de la Emisora</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setFormActiva(true); setFormSuspendida(false); }}
                                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${formActiva && !formSuspendida ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-slate-500'}`}
                                    >
                                        <CheckCircle className="w-4 h-4" /> Activa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormSuspendida(s => !s)}
                                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${formSuspendida ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 text-slate-500'}`}
                                    >
                                        <Clock className="w-4 h-4" /> Suspendida
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setFormActiva(false); setFormSuspendida(false); }}
                                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${!formActiva && !formSuspendida ? 'border-slate-500 bg-slate-500/10 text-slate-300' : 'border-white/10 text-slate-500'}`}
                                    >
                                        <XCircle className="w-4 h-4" /> Inactiva
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-white/5">
                            <button onClick={() => setSelected(null)} className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition font-medium text-sm">
                                Cancelar
                            </button>
                            <button
                                onClick={guardar}
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-2 text-sm"
                            >
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando</> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
