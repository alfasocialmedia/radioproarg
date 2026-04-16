"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PlusCircle, Radio, Trash2, ExternalLink, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Zap, KeyRound, Server, HardDrive, BarChart3 } from 'lucide-react';

function EmisorasContent() {
    const [radios, setRadios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ nombre: '', subdominio: '', streamUrl: '', plan: 'audio', autoProvision: true });
    const [techForm, setTechForm] = useState<any>(null);
    const [selectedRadio, setSelectedRadio] = useState<any>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [showStreamPass, setShowStreamPass] = useState(false);
    const [showFtpPass, setShowFtpPass] = useState(false);
    const [confirmDeleteRadio, setConfirmDeleteRadio] = useState<{ id: string; nombre: string } | null>(null);

    const searchParams = useSearchParams();
    const radioIdParam = searchParams.get('id');

    useEffect(() => { cargar(); }, []);

    useEffect(() => {
        if (radioIdParam && radios.length > 0) {
            const r = radios.find(x => x.id === radioIdParam);
            if (r) handleOpenTech(r);
        }
    }, [radioIdParam, radios]);

    const cargar = async () => {
        setLoading(true);
        try { const res = await api.get('/radios/all'); setRadios(res.data); }
        catch { mostrarToast('error', 'Error cargando emisoras.'); }
        finally { setLoading(false); }
    };

    const mostrarToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/radios', form);
            mostrarToast('success', `✅ Emisora "${form.nombre}" creada correctamente.`);
            setShowModal(false);
            setForm({ nombre: '', subdominio: '', streamUrl: '', plan: 'audio', autoProvision: true });
            cargar();
        } catch (e: any) { mostrarToast('error', e.response?.data?.error || '❌ Error creando la emisora.'); }
        finally { setSaving(false); }
    };

    const handleProvision = async (id: string, nombre: string) => {
        if (!confirm(`🚀 ¿Deseas aprovisionar la radio "${nombre}" en SonicPanel ahora?`)) return;
        setSaving(true);
        try {
            await api.post(`/radios/${id}/provision`);
            mostrarToast('success', `✅ Radio "${nombre}" aprovisionada correctamente en SonicPanel.`);
            cargar();
        } catch (e: any) { 
            mostrarToast('error', e.response?.data?.error || '❌ Error al aprovisionar.'); 
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: string, nombre: string) => {
        setConfirmDeleteRadio({ id, nombre });
    };

    const confirmarEliminarRadio = async () => {
        if (!confirmDeleteRadio) return;
        try { 
            await api.delete(`/radios/${confirmDeleteRadio.id}`); 
            mostrarToast('success', `✅ Emisora "${confirmDeleteRadio.nombre}" eliminada.`); 
            cargar(); 
        } catch { 
            mostrarToast('error', '❌ Error eliminando la emisora.'); 
        } finally {
            setConfirmDeleteRadio(null);
        }
    };

    const handleOpenTech = (r: any) => {
        setSelectedRadio(r);
        setTechForm({
            sonicpanelId: r.sonicpanelId || '',
            streamUser: r.streamUser || '',
            streamPassword: r.streamPassword || '',
            streamPort: r.streamPort || '',
            streamMount: r.streamMount || '',
            ftpUser: r.ftpUser || '',
            ftpPassword: r.ftpPassword || '',
            streamUrl: r.streamUrl || '',
            almacenamientoExtraGB: r.almacenamientoExtraGB || 0,
            activa: r.activa,
            suspendida: r.suspendida
        });
    };

    const handleSaveTech = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/radios/${selectedRadio.id}/config`, techForm);
            mostrarToast('success', `✅ Configuración técnica de "${selectedRadio.nombre}" actualizada.`);
            setSelectedRadio(null);
            cargar();
        } catch (err) {
            mostrarToast('error', 'Error al guardar la configuración técnica.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm border ${toast.type === 'success' ? 'bg-green-900/90 border-green-500/30' : 'bg-slate-800 border-white/10'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Radio className="text-violet-400 w-8 h-8" /> Gestión de Emisoras
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Alta, baja y configuración de tenants (radios) en la plataforma.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
                >
                    <PlusCircle className="w-5 h-5" /> Nueva Emisora
                </button>
            </div>

            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-violet-400 animate-spin" /></div>
                ) : radios.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 text-sm">No hay emisoras registradas. Registrá la primera haciendo click en "Nueva Emisora".</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    <th className="p-3 lg:p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Emisora</th>
                                    <th className="p-3 lg:p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Subdominio</th>
                                    <th className="p-3 lg:p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                                    <th className="p-3 lg:p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Disco (Uso/Total)</th>
                                    <th className="p-3 lg:p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden xl:table-cell">Alta</th>
                                    <th className="p-3 lg:p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {radios.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-3 lg:p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="hidden sm:flex w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                    <Radio className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-white text-sm truncate max-w-[150px] lg:max-w-xs">{r.nombre}</p>
                                                        {r.sonicpanelId ? (
                                                            <div className="flex items-center gap-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter shadow-sm" title={`ID: ${r.sonicpanelId}`}>
                                                                <CheckCircle className="w-2.5 h-2.5" /> <span className="hidden lg:inline">Activo</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-0.5 bg-slate-500/10 border border-slate-500/20 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter" title="Sin aprovisionar">
                                                                Pte
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-mono">{r.id.split('-')[0]}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 lg:p-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-blue-400 font-mono truncate max-w-[120px] lg:max-w-[200px]">{r.subdominio}.onradio.com.ar</span>
                                                <a href={`http://${r.subdominio}.onradio.com.ar`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="p-3 lg:p-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 w-fit ${r.plan?.slug === 'portal'
                                                ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                                {r.plan?.slug === 'portal' ? '🌐' : '🎧'} <span className="hidden sm:inline">{r.plan?.slug === 'portal' ? 'Portal' : 'Audio'}</span>
                                            </span>
                                        </td>
                                        <td className="p-3 lg:p-4 hidden sm:table-cell">
                                            <div className="flex flex-col gap-1 w-24 lg:w-32">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-[11px] font-black ${
                                                        (r.storage?.percentage ?? 0) > 90 ? 'text-red-400' : 
                                                        (r.storage?.percentage ?? 0) > 70 ? 'text-amber-400' : 'text-emerald-400'
                                                    }`}>
                                                        {r.storage?.usedGB?.toFixed(2) ?? '0.00'} GB
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter hidden lg:inline">
                                                        de {r.storage?.totalGB ?? 0} GB
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <div 
                                                        className={`h-full transition-all duration-700 ease-out ${
                                                            (r.storage?.percentage ?? 0) > 90 ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 
                                                            (r.storage?.percentage ?? 0) > 70 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                                                            'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                        }`}
                                                        style={{ width: `${Math.min(r.storage?.percentage ?? 0, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 lg:p-4 text-xs text-slate-500 whitespace-nowrap hidden xl:table-cell">
                                            {new Date(r.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-3 lg:p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                     onClick={() => { 
                                                        localStorage.removeItem('radioId');
                                                        localStorage.setItem('tenant_id', r.id); 
                                                        localStorage.setItem('usuario_plan', r.plan?.slug || 'audio'); 
                                                        window.location.href = '/admin/dashboard'; 
                                                    }}
                                                    className="text-blue-400 hover:text-white flex items-center justify-center w-8 h-8 opacity-80 hover:opacity-100 transition-all hover:bg-blue-500/10 rounded-lg shrink-0"
                                                    title="Gestionar Panel"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenTech(r)}
                                                    className="bg-[#0f172a] border border-white/10 text-amber-400 hover:text-white flex items-center justify-center gap-1.5 px-3 py-1.5 opacity-80 hover:opacity-100 transition-all hover:bg-amber-500/20 hover:border-amber-500/40 rounded-lg shrink-0 text-xs font-bold"
                                                    title="Configuración Técnica"
                                                >
                                                    <KeyRound className="w-3.5 h-3.5" /> Editar
                                                </button>
                                                {!r.sonicpanelId && (
                                                    <button
                                                        onClick={() => handleProvision(r.id, r.nombre)}
                                                        disabled={saving}
                                                        className="text-violet-400 hover:text-white flex items-center justify-center w-8 h-8 opacity-80 hover:opacity-100 transition-all hover:bg-violet-500/10 rounded-lg shrink-0"
                                                        title="Aprovisionar Automáticamente"
                                                    >
                                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(r.id, r.nombre)}
                                                    className="text-slate-400 hover:text-red-400 flex items-center justify-center w-8 h-8 opacity-80 hover:opacity-100 transition-all hover:bg-red-500/10 rounded-lg shrink-0"
                                                    title="Eliminar Emisora"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-6 py-3 border-t border-white/5 text-xs text-slate-500 flex justify-between">
                    <span>{radios.length} emisora{radios.length !== 1 ? 's' : ''} en la plataforma ({radios.reduce((a,b) => a + (b._count?.usuarios || 0), 0)} usuarios)</span>
                    <span>ONRADIO SuperAdmin</span>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white">Nueva Emisora (Tenant)</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nombre Comercial *</label>
                                <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/40 transition-all"
                                    placeholder="Ej: Radio Zenith FM" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Subdominio (Identificador) *</label>
                                <div className="flex items-center">
                                    <input required value={form.subdominio}
                                        onChange={e => setForm({ ...form, subdominio: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                        className="flex-1 bg-black/30 border border-white/10 rounded-l-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/40 transition-all"
                                        placeholder="zenithfm" />
                                    <div className="bg-black/20 border border-l-0 border-white/10 rounded-r-xl px-3 py-3 text-slate-500 text-sm font-mono whitespace-nowrap">.onradio.com.ar</div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Plan Contratado</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setForm({ ...form, plan: 'audio' })}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-all text-left ${form.plan === 'audio' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/10 text-slate-500'}`}>
                                        🎧 Plan Audio<br /><span className="text-xs font-normal opacity-60">AR$ 7.000/mes</span>
                                    </button>
                                    <button type="button" onClick={() => setForm({ ...form, plan: 'portal' })}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-all text-left ${form.plan === 'portal' ? 'border-violet-500 bg-violet-500/10 text-white' : 'border-white/10 text-slate-500'}`}>
                                        🌐 Plan Portal<br /><span className="text-xs font-normal opacity-60">AR$ 20.000/mes</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">URL de Stream (Opcional)</label>
                                <input type="url" value={form.streamUrl} onChange={e => setForm({ ...form, streamUrl: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/40 transition-all"
                                    placeholder="https://stream.miservidor.com:8000/live" />
                            </div>
                            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 flex items-center gap-3">
                                <input type="checkbox" id="autoProvision" checked={form.autoProvision} onChange={e => setForm({...form, autoProvision: e.target.checked})}
                                    className="w-5 h-5 rounded border-white/10 bg-black/30 text-violet-600 focus:ring-violet-500/40" />
                                <label htmlFor="autoProvision" className="text-sm font-bold text-violet-200 cursor-pointer select-none">
                                    🚀 Aprovisionar en SonicPanel automáticamente
                                    <p className="text-[10px] font-normal text-violet-400/80 leading-tight mt-0.5">Crea la cuenta de streaming, activa AutoDJ y genera credenciales al instante.</p>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />} Crear Emisora
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Configuración Técnica (SonicPanel / Stream) */}
            {selectedRadio && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0d1526] border border-white/10 rounded-2xl w-full shadow-2xl my-4 relative max-w-5xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    <KeyRound className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Configuración Técnica</h2>
                                    <p className="text-xs text-slate-500 font-mono">{selectedRadio.nombre} · <span className="text-slate-600">{selectedRadio.id.split('-')[0]}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRadio(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all text-lg leading-none"
                            >✕</button>
                        </div>

                        <form onSubmit={handleSaveTech} className="p-5 space-y-4">

                                {/* Fila Superior: Stream URL y Sonic ID (Lado a lado) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">URL de Streaming (Finalizada)</label>
                                        <input
                                            value={techForm.streamUrl}
                                            onChange={e => setTechForm({...techForm, streamUrl: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500/50 outline-none transition-all placeholder:text-slate-700"
                                            placeholder="https://stream.servidor.com:8000/live"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">SonicPanel ID</label>
                                        <input
                                            value={techForm.sonicpanelId}
                                            onChange={e => setTechForm({...techForm, sonicpanelId: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500/50 outline-none transition-all"
                                            placeholder="sp_1234..."
                                        />
                                    </div>
                                </div>

                                {/* Fila principal: Grid de 4 columnas horizontales */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-violet-500/5 border border-violet-500/10 rounded-xl p-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Puerto</label>
                                        <input
                                            type="number"
                                            value={techForm.streamPort}
                                            onChange={e => setTechForm({...techForm, streamPort: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all"
                                            placeholder="8000"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Mount Point</label>
                                        <input
                                            value={techForm.streamMount}
                                            onChange={e => setTechForm({...techForm, streamMount: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all"
                                            placeholder="/live"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Usuario Stream</label>
                                        <input
                                            value={techForm.streamUser}
                                            onChange={e => setTechForm({...techForm, streamUser: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all"
                                            placeholder="admin"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Password Stream</label>
                                        <div className="relative">
                                            <input
                                                type={showStreamPass ? "text" : "password"}
                                                value={techForm.streamPassword}
                                                onChange={e => setTechForm({...techForm, streamPassword: e.target.value})}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all font-mono pr-8"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowStreamPass(!showStreamPass)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                                {showStreamPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Fila Inferior: FTP y Estado en horizontal */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Usuario FTP</label>
                                        <input
                                            value={techForm.ftpUser}
                                            onChange={e => setTechForm({...techForm, ftpUser: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all"
                                            placeholder="ftp_user"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Password FTP</label>
                                        <div className="relative">
                                            <input
                                                type={showFtpPass ? "text" : "password"}
                                                value={techForm.ftpPassword}
                                                onChange={e => setTechForm({...techForm, ftpPassword: e.target.value})}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all font-mono pr-8"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowFtpPass(!showFtpPass)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                                {showFtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">GB Extras</label>
                                        <input
                                            type="number"
                                            value={techForm.almacenamientoExtraGB}
                                            onChange={e => setTechForm({...techForm, almacenamientoExtraGB: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Estado</label>
                                        <select
                                            value={techForm.suspendida ? 'suspendida' : (techForm.activa ? 'activa' : 'inactiva')}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setTechForm({ ...techForm, activa: val === 'activa', suspendida: val === 'suspendida' });
                                            }}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:border-violet-500/50 outline-none transition-all"
                                        >
                                            <option value="activa">Activa</option>
                                            <option value="inactiva">Inactiva</option>
                                            <option value="suspendida">Suspendida</option>
                                        </select>
                                    </div>
                                </div>

                            {/* Acciones */}
                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRadio(null)}
                                    className="px-6 py-2.5 rounded-xl text-slate-400 font-medium hover:bg-white/5 transition-colors text-sm"
                                >Cerrar</button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-7 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-95"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Guardar Cambios Técnicos'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación de emisora */}
            {confirmDeleteRadio && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">Eliminar Emisora</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Esta acción es irreversible</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-6">
                            ¿Eliminar la emisora <span className="font-bold text-white">"{confirmDeleteRadio.nombre}"</span> y <span className="text-red-400 font-bold">TODOS sus datos</span>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDeleteRadio(null)}
                                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 transition text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminarRadio}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all text-sm flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar Emisora
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SuperAdminEmisorasPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-16"><Loader2 className="w-10 h-10 text-violet-400 animate-spin" /></div>}>
            <EmisorasContent />
        </Suspense>
    );
}
