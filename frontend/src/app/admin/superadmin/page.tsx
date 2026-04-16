"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PlusCircle, Search, RadioTower, TrendingUp, Users, Power, CircleDollarSign, AlertTriangle } from 'lucide-react';

export default function SuperAdminRadiosPage() {
    const [radios, setRadios] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalRadios: 0, radiosActivas: 0, radiosSuspendidas: 0, mrrTotal: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ nombre: '', subdominio: '', streamUrl: '' });

    useEffect(() => {
        cargarRadios();
    }, []);

    const cargarRadios = async () => {
        setLoading(true);
        try {
            const [resRadios, resStats] = await Promise.all([
                api.get('/superadmin/radios'),
                api.get('/superadmin/dashboard')
            ]);
            setRadios(resRadios.data);
            setStats(resStats.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActiva = async (id: string, activaActual: boolean, nombre: string) => {
        const accion = activaActual ? 'SUSPENDER' : 'REACTIVAR';
        if (!confirm(`¿Seguro que deseas ${accion} la emisora "${nombre}"?`)) return;
        try {
            await api.put(`/superadmin/radios/${id}/toggle-estado`, { activa: !activaActual });
            cargarRadios();
        } catch (e) {
            console.error(e);
            alert('Error al cambiar el estado de la Radio.');
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Seguro que deseas eliminar la emisora "${nombre}" y TODOS sus datos asociados (noticias, usuarios, etc)? Esta acción es destructiva e irreversible.`)) return;
        try {
            await api.delete(`/radios/${id}`);
            cargarRadios();
        } catch (e) {
            console.error(e);
            alert('Error eliminando la Radio. Verifica la consola.');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/radios', form);
            setIsModalOpen(false);
            setForm({ nombre: '', subdominio: '', streamUrl: '' });
            cargarRadios();
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.error || 'Error registrando la nueva emisora (Tenant).');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <RadioTower className="text-primary w-8 h-8" />
                        SuperAdmin: Emisoras
                    </h1>
                    <p className="text-muted-foreground mt-1">Alta y Baja de Tenants (Radios) en la plataforma ONRADIO.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-medium transition-transform shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
                >
                    <PlusCircle className="w-5 h-5" />
                    Registrar Emisora
                </button>
            </div>

            {/* Panel de Métricas (Dashboard) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/20 transition-all">
                    <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Radios Creadas</p>
                    <h3 className="text-4xl font-black text-white">{stats.totalRadios}</h3>
                    <div className="absolute top-5 right-5 text-blue-500/20 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all"><RadioTower className="w-12 h-12" /></div>
                </div>
                <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/20 transition-all">
                    <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">MRR (Ingresos/mes)</p>
                    <h3 className="text-4xl font-black text-green-400">${stats.mrrTotal.toLocaleString('es-AR')}</h3>
                    <div className="absolute top-5 right-5 text-green-500/20 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all"><CircleDollarSign className="w-12 h-12" /></div>
                </div>
                <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/20 transition-all">
                    <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Total Activas</p>
                    <h3 className="text-4xl font-black text-white">{stats.radiosActivas}</h3>
                    <div className="absolute top-5 right-5 text-green-500/20 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all"><TrendingUp className="w-12 h-12" /></div>
                </div>
                <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-red-500/20 transition-all">
                    <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Suspendidas</p>
                    <h3 className="text-4xl font-black text-red-500">{stats.radiosSuspendidas}</h3>
                    <div className="absolute top-5 right-5 text-red-500/20 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all"><AlertTriangle className="w-12 h-12" /></div>
                </div>
            </div>

            <div className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-black/20">
                                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest">Emisora</th>
                                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest">Plan & Info</th>
                                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest">Dueño / Contacto</th>
                                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest">Estado</th>
                                <th className="p-5 font-bold text-slate-500 text-xs text-right uppercase tracking-widest">Moderación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-16 text-center text-slate-400 animate-pulse">Cargando métricas maestras...</td></tr>
                            ) : radios.length === 0 ? (
                                <tr><td colSpan={5} className="p-16 text-center text-slate-500">No hay Radios registradas en el servidor.</td></tr>
                            ) : (
                                radios.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5">
                                            <p className="font-black text-white text-base">{r.nombre}</p>
                                            <a href={`https://${r.subdominio}.onradio.com.ar`} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 font-mono">
                                                {r.subdominio}.onradio.com.ar
                                            </a>
                                        </td>
                                        <td className="p-5">
                                            <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded border border-white/5 mr-2">
                                                {r.plan?.nombre || 'Custom'}
                                            </span>
                                            <p className="text-slate-500 text-[10px] mt-2 font-mono uppercase tracking-widest">Expira: {r.planVenceEn ? new Date(r.planVenceEn).toLocaleDateString() : 'N/A'}</p>
                                        </td>
                                        <td className="p-5">
                                            {r.dueño ? (
                                                <>
                                                    <p className="font-medium text-slate-300 text-sm whitespace-nowrap">{r.dueño.nombre}</p>
                                                    <p className="text-slate-500 text-xs">{r.dueño.email}</p>
                                                </>
                                            ) : (
                                                <p className="text-slate-600 text-xs italic">Sin dueño asignado</p>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${r.activa ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                                {r.activa ? 'Activa' : 'Suspendida'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right space-x-3 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleToggleActiva(r.id, r.activa, r.nombre)} 
                                                className={`text-sm font-bold flex items-center justify-end gap-1.5 ml-auto transition-colors ${r.activa ? 'text-slate-500 hover:text-red-400' : 'text-slate-500 hover:text-green-400'}`}
                                            >
                                                <Power className="w-4 h-4" /> {r.activa ? 'Suspender' : 'Reactivar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Creación Tenant */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold text-foreground mb-4">Nueva Instancia de Radio</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Nombre Comercial</label>
                                <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-foreground" placeholder="Ej: Radio Mitre" />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Identificador (Subdominio)</label>
                                <input required value={form.subdominio} onChange={e => setForm({ ...form, subdominio: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-foreground" placeholder="Ej: radiomitre" />
                                <p className="text-xs text-muted-foreground mt-1">Este ID será usado para las URLs ({form.subdominio || 'emisora'}.onradio.com)</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">URL Icecast/Shoutcast Válido (Opcional)</label>
                                <input type="url" value={form.streamUrl} onChange={e => setForm({ ...form, streamUrl: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-foreground" placeholder="https://stream.ruta.com/radio" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-white/5 transition">Descartar</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition shadow-md shadow-green-500/20">Instanciar Tenant</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
