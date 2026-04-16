"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    Layers, PlusCircle, Pencil, Trash2, Loader2, X,
    Check, Wifi, Users, HardDrive
} from 'lucide-react';

const DEFAULT_FORM = {
    nombre: '', slug: '', descripcion: '',
    precioMensual: '', precioAnual: '',
    precioMensualUSD: '', precioAnualUSD: '',
    bitrate: '128', maxOyentes: '100', almacenamientoGB: '5',
    tieneCMS: false, tienePublicidad: false,
};

export default function SuperAdminPlanesPage() {
    const [planes, setPlanes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<any>(DEFAULT_FORM);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; nombre: string } | null>(null);

    const cargar = () => {
        setLoading(true);
        api.get('/planes').then(r => setPlanes(r.data)).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, []);

    const abrirCrear = () => { setForm(DEFAULT_FORM); setEditId(null); setShowModal(true); };
    const abrirEditar = (p: any) => {
        setForm({
            nombre: p.nombre, slug: p.slug, descripcion: p.descripcion || '',
            precioMensual: String(p.precioMensual), precioAnual: String(p.precioAnual),
            precioMensualUSD: p.precioMensualUSD != null ? String(p.precioMensualUSD) : '',
            precioAnualUSD: p.precioAnualUSD != null ? String(p.precioAnualUSD) : '',
            bitrate: String(p.bitrate), maxOyentes: String(p.maxOyentes), almacenamientoGB: String(p.almacenamientoGB),
            tieneCMS: p.tieneCMS, tienePublicidad: p.tienePublicidad,
        });
        setEditId(p.id);
        setShowModal(true);
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const body = {
            ...form,
            precioMensual: parseFloat(form.precioMensual),
            precioAnual: parseFloat(form.precioAnual),
            precioMensualUSD: form.precioMensualUSD !== '' ? parseFloat(form.precioMensualUSD) : null,
            precioAnualUSD: form.precioAnualUSD !== '' ? parseFloat(form.precioAnualUSD) : null,
            bitrate: parseInt(form.bitrate),
            maxOyentes: parseInt(form.maxOyentes),
            almacenamientoGB: parseInt(form.almacenamientoGB),
        };
        try {
            if (editId) await api.put(`/planes/${editId}`, body);
            else await api.post('/planes', body);
            setShowModal(false);
            cargar();
        } catch (e: any) {
            alert(e.response?.data?.error || 'Error guardando el plan.');
        } finally { setSaving(false); }
    };

    const handleEliminar = (id: string, nombre: string) => {
        setConfirmDelete({ id, nombre });
    };

    const confirmarEliminar = async () => {
        if (!confirmDelete) return;
        try { 
            await api.delete(`/planes/${confirmDelete.id}`); 
            cargar(); 
        } catch { 
            alert('❌ Error eliminando el plan.'); 
        } finally {
            setConfirmDelete(null);
        }
    };

    const Campo = ({ label, name, type = 'text', placeholder = '' }: any) => (
        <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">{label}</label>
            <input
                type={type}
                value={form[name]}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/40 transition-all"
            />
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Layers className="text-violet-400 w-8 h-8" /> Planes de Servicio
                    </h1>
                    <p className="text-slate-400 mt-1">Crear y editar planes con bitrate, oyentes y funcionalidades.</p>
                </div>
                <button
                    onClick={abrirCrear}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
                >
                    <PlusCircle className="w-4 h-4" /> Nuevo Plan
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-violet-400 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {planes.map((p: any) => (
                        <div key={p.id} className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 hover:border-violet-500/20 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{p.nombre}</h2>
                                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{p.slug}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => abrirEditar(p)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleEliminar(p.id, p.nombre)} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-5 mt-1 border-y border-white/5 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Precios ARS</span>
                                    <div className="flex gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 leading-none mb-1">MENSUAL</p>
                                            <p className="text-lg font-black text-white leading-none">${p.precioMensual?.toLocaleString('es-AR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 leading-none mb-1">ANUAL</p>
                                            <p className="text-lg font-black text-red-500 leading-none">${p.precioAnual?.toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                </div>
                                {(p.precioMensualUSD || p.precioAnualUSD) && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Precios USD</span>
                                        <div className="flex gap-6">
                                            <div className="text-right">
                                                <p className="text-[10px] text-emerald-600 leading-none mb-1">MENSUAL</p>
                                                <p className="text-lg font-black text-emerald-400 leading-none">U$D {p.precioMensualUSD}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-emerald-600 leading-none mb-1">ANUAL</p>
                                                <p className="text-lg font-black text-emerald-400 leading-none">U$D {p.precioAnualUSD}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-black/20 rounded-xl p-3 text-center">
                                    <Wifi className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                    <p className="text-lg font-black text-white">{p.bitrate}</p>
                                    <p className="text-xs text-slate-500">kbps</p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 text-center">
                                    <Users className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                                    <p className="text-lg font-black text-white">{p.maxOyentes}</p>
                                    <p className="text-xs text-slate-500">oyentes</p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 text-center">
                                    <HardDrive className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                                    <p className="text-lg font-black text-white">{p.almacenamientoGB}</p>
                                    <p className="text-xs text-slate-500">GB</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border ${p.tieneCMS ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-slate-600 bg-white/5 border-white/5'}`}>
                                    {p.tieneCMS ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} CMS Portal
                                </span>
                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border ${p.tienePublicidad ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-slate-600 bg-white/5 border-white/5'}`}>
                                    {p.tienePublicidad ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Publicidad
                                </span>
                            </div>

                            {p.descripcion && <p className="text-xs text-slate-500 mt-3 leading-relaxed">{p.descripcion}</p>}
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white">{editId ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleGuardar} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Campo label="Nombre" name="nombre" placeholder="Ej: Audio Pro" />
                                <Campo label="Slug (único)" name="slug" placeholder="Ej: audio-pro" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                    rows={2}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/40 transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Campo label="Precio Mensual (ARS)" name="precioMensual" type="number" placeholder="7000" />
                                <Campo label="Precio Anual (ARS)" name="precioAnual" type="number" placeholder="75600" />
                            </div>
                            {/* Separador USD */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                    Precios en USD (opcional)
                                </span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Campo label="Precio Mensual (USD)" name="precioMensualUSD" type="number" placeholder="7" />
                                <Campo label="Precio Anual (USD)" name="precioAnualUSD" type="number" placeholder="70" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <Campo label="Bitrate (kbps)" name="bitrate" type="number" placeholder="128" />
                                <Campo label="Máx. Oyentes" name="maxOyentes" type="number" placeholder="100" />
                                <Campo label="Almacenamiento (GB)" name="almacenamientoGB" type="number" placeholder="5" />
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div onClick={() => setForm({ ...form, tieneCMS: !form.tieneCMS })} className={`w-10 h-5 rounded-full transition-all relative ${form.tieneCMS ? 'bg-green-500' : 'bg-white/10'}`}>
                                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${form.tieneCMS ? 'left-5' : 'left-0.5'}`} />
                                    </div>
                                    <span className="text-sm text-slate-300">Incluye CMS Portal</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div onClick={() => setForm({ ...form, tienePublicidad: !form.tienePublicidad })} className={`w-10 h-5 rounded-full transition-all relative ${form.tienePublicidad ? 'bg-yellow-500' : 'bg-white/10'}`}>
                                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${form.tienePublicidad ? 'left-5' : 'left-0.5'}`} />
                                    </div>
                                    <span className="text-sm text-slate-300">Incluye Publicidad</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition">Cancelar</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando</> : <><Check className="w-4 h-4" /> {editId ? 'Actualizar' : 'Crear Plan'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">Eliminar Plan</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Esta acción desactivará el plan</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-6">
                            ¿Desactivar el plan <span className="font-bold text-white">"{confirmDelete.nombre}"</span>? Las emisoras vinculadas no perderán el acceso, pero no podrá asignarse a nuevas emisoras.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 transition text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminar}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all text-sm flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
