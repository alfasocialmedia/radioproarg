"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CalendarDays, PlusCircle, Trash2, Loader2, CheckCircle, AlertCircle, Edit3, Image as ImageIcon, Upload } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const FORM_INICIAL = {
    nombrePrograma: '',
    conductores: '',
    diasSemana: ['1'] as string[],
    diaSemana: '1', // Solo usado al editar
    horaInicio: '08:00',
    horaFin: '10:00',
    imagenPrograma: '',
    descripcion: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    twitter: '',
};

export default function AdminProgramacionPage() {
    const [programas, setProgramas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [filtrodia, setFiltroDia] = useState('0');
    const [editId, setEditId] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await api.get('/programacion');
            setProgramas(res.data);
        } catch (e: any) {
            mostrarToast('error', 'Error cargando la programación.');
        } finally {
            setLoading(false);
        }
    };

    const mostrarToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUploadImage = async (file: File) => {
        setUploadingImage(true);
        try {
            const fd = new FormData();
            fd.append('imagen', file);
            const { data } = await api.post('/upload/imagen', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(prev => ({ ...prev, imagenPrograma: data.url }));
            mostrarToast('success', '✅ Imagen subida correctamente.');
        } catch (e: any) {
            mostrarToast('error', `❌ Error subiendo imagen: ${e?.response?.data?.error || e.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleEdit = (p: any) => {
        setEditId(p.id);
        setForm({
            nombrePrograma: p.nombrePrograma || '',
            conductores: p.conductores || '',
            diasSemana: [String(p.diaSemana)],
            diaSemana: String(p.diaSemana),
            horaInicio: p.horaInicio || '08:00',
            horaFin: p.horaFin || '10:00',
            imagenPrograma: p.imagenPrograma || '',
            descripcion: p.descripcion || '',
            whatsapp: p.whatsapp || '',
            facebook: p.facebook || '',
            instagram: p.instagram || '',
            twitter: p.twitter || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                const payload = { ...form, diaSemana: Number(form.diaSemana) };
                await api.put(`/programacion/${editId}`, payload);
                mostrarToast('success', '✅ Programa actualizado correctamente.');
            } else {
                if (form.diasSemana.length === 0) {
                    throw new Error('Debes seleccionar al menos un día.');
                }
                const payload = { ...form, diasSemana: form.diasSemana.map(Number) };
                await api.post('/programacion', payload);
                mostrarToast('success', '✅ Programa creado en los días seleccionados.');
            }
            setShowModal(false);
            setForm(FORM_INICIAL);
            setEditId(null);
            cargar();
        } catch (e: any) {
            mostrarToast('error', `❌ ${e?.response?.data?.error || e.message || 'Error guardando programa.'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar el programa "${nombre}"?`)) return;
        try {
            await api.delete(`/programacion/${id}`);
            mostrarToast('success', '✅ Programa eliminado.');
            cargar();
        } catch {
            mostrarToast('error', '❌ Error eliminando el programa.');
        }
    };

    const programasFiltrados = filtrodia === '0'
        ? programas
        : programas.filter(p => String(p.diaSemana) === filtrodia);

    // Agrupar por día
    const porDia: Record<string, any[]> = {};
    programasFiltrados.forEach(p => {
        const dia = String(p.diaSemana);
        if (!porDia[dia]) porDia[dia] = [];
        porDia[dia].push(p);
    });

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm border ${toast.type === 'success' ? 'bg-green-900/90 border-green-500/30' : 'bg-red-900/90 border-red-500/30'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <CalendarDays className="text-purple-400 w-8 h-8" /> Grilla de Programación
                    </h1>
                    <p className="text-slate-400 mt-1">Organizá los programas de tu emisora por día y horario.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20"
                >
                    <PlusCircle className="w-5 h-5" /> Agregar Programa
                </button>
            </div>

            {/* Filtro por Día */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setFiltroDia('0')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtrodia === '0' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                    Todos los días
                </button>
                {DIAS.slice(1).map((dia, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setFiltroDia(String(i + 1))}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtrodia === String(i + 1) ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        {dia}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-purple-400 animate-spin" /></div>
            ) : programasFiltrados.length === 0 ? (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-12 text-center">
                    <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No hay programas cargados{filtrodia !== '0' ? ` para el ${DIAS[Number(filtrodia)]}` : ''}.</p>
                    <button onClick={() => setShowModal(true)} className="bg-purple-600/20 text-purple-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-600/30 transition-colors border border-purple-500/20 inline-flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Agregar primer programa
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.keys(porDia).sort().map(diaNum => (
                        <div key={diaNum}>
                            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="h-px flex-1 bg-white/5" />
                                {DIAS[Number(diaNum)]}
                                <div className="h-px flex-1 bg-white/5" />
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {porDia[diaNum].map((p: any) => (
                                    <div key={p.id} className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 group hover:border-purple-500/20 transition-colors relative overflow-hidden">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {p.imagenPrograma && (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                                        <img src={p.imagenPrograma} alt={p.nombrePrograma} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="bg-purple-500/10 text-purple-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-500/20 font-mono">
                                                    {p.horaInicio} → {p.horaFin}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="text-blue-400 hover:text-blue-300 transition-all p-1.5 rounded-lg hover:bg-blue-500/10"
                                                    title="Editar programa"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id, p.nombrePrograma)}
                                                    className="text-red-400 hover:text-red-300 transition-all p-1.5 rounded-lg hover:bg-red-500/10"
                                                    title="Eliminar programa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{p.nombrePrograma}</h3>
                                        {p.conductores && <p className="text-slate-400 text-sm mt-1">con {p.conductores}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear Programa */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white">{editId ? 'Editar Programa' : 'Nuevo Programa'}</h2>
                            <button onClick={() => { setShowModal(false); setForm(FORM_INICIAL); setEditId(null); }} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1.5">Nombre del programa *</label>
                                <input required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-all" placeholder="Ej: Despertador Musical" value={form.nombrePrograma} onChange={e => setForm({ ...form, nombrePrograma: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1.5">Conductores</label>
                                <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-all" placeholder="Ej: Juan y Marina" value={form.conductores} onChange={e => setForm({ ...form, conductores: e.target.value })} />
                            </div>
                            {!editId ? (
                                <div className="mb-4">
                                    <label className="text-sm text-slate-400 block mb-2">Días de la semana *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DIAS.slice(1).map((d, i) => {
                                            const val = String(i + 1);
                                            const isActive = form.diasSemana.includes(val);
                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => {
                                                        const newDias = isActive 
                                                            ? form.diasSemana.filter(x => x !== val) 
                                                            : [...form.diasSemana, val];
                                                        setForm({ ...form, diasSemana: newDias });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isActive ? 'bg-purple-600 border-purple-500 text-white' : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                >
                                                    {d}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : null}

                            <div className={`grid ${editId ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                                {editId && (
                                    <div>
                                        <label className="text-sm text-slate-400 block mb-1.5">Día *</label>
                                        <select required className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all" value={form.diaSemana} onChange={e => setForm({ ...form, diaSemana: e.target.value })}>
                                            {DIAS.slice(1).map((d, i) => <option key={i + 1} value={i + 1}>{d}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5">Inicio *</label>
                                    <input type="time" required className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all" value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5">Fin *</label>
                                    <input type="time" required className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all" value={form.horaFin} onChange={e => setForm({ ...form, horaFin: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-1.5">Imagen del Programa</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {form.imagenPrograma ? (
                                            <img src={form.imagenPrograma} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 mt-1 rounded-xl text-xs font-bold transition-all cursor-pointer">
                                            {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                                            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadImage(e.target.files[0])} disabled={uploadingImage} />
                                        </label>
                                        <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-all text-xs" placeholder="🔗 O pegá una URL web..." value={form.imagenPrograma} onChange={e => setForm({ ...form, imagenPrograma: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="text-sm text-slate-400 block mb-1.5">Descripción del Programa</label>
                                <textarea 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-all resize-none" 
                                    rows={3}
                                    placeholder="Contanos de qué trata el programa..."
                                    value={form.descripcion} 
                                    onChange={e => setForm({ ...form, descripcion: e.target.value })} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5 font-bold text-green-400">WhatsApp del Programa</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/60 transition-all text-sm" placeholder="Ej: +54911..." value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5 font-bold text-blue-400">Facebook</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-all text-sm" placeholder="URL perfil..." value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5 font-bold text-pink-400">Instagram</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/60 transition-all text-sm" placeholder="Usuario o URL..." value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1.5 font-bold text-sky-400">Twitter / X</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/60 transition-all text-sm" placeholder="Usuario..." value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setForm(FORM_INICIAL); setEditId(null); }} className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" disabled={saving || uploadingImage} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando</> : <><CheckCircle className="w-4 h-4" /> {editId ? 'Guardar Cambios' : 'Agregar'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
