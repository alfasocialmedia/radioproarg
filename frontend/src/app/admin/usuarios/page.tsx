"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, PlusCircle, Trash2, Edit3, Loader2, CheckCircle, AlertCircle, Shield, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const ROL_LABELS: any = {
    ADMIN_RADIO: 'Administrador',
    EDITOR_NOTICIAS: 'Editor',
    LOCUTOR: 'Locutor',
    SUPER_ADMIN: 'Super Admin'
};

const FORM_INICIAL = {
    nombre: '',
    email: '',
    telefono: '',
    rol: 'ADMIN_RADIO',
    password: '',
    activo: true
};

export default function AdminUsuariosPage() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (e: any) {
            mostrarToast('error', 'Error cargando usuarios.');
        } finally {
            setLoading(false);
        }
    };

    const mostrarToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleEdit = (u: any) => {
        setEditId(u.id);
        setForm({
            nombre: u.nombre || '',
            email: u.email || '',
            telefono: u.telefono || '',
            rol: u.rol || 'ADMIN_RADIO',
            password: '',
            activo: u.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`¿Eliminar al usuario "${email}" permanentemente?`)) return;
        try {
            await api.delete(`/usuarios/${id}`);
            mostrarToast('success', '✅ Usuario eliminado.');
            cargar();
        } catch {
            mostrarToast('error', '❌ Error eliminando el usuario.');
        }
    };

    const handleToggleActivo = async (u: any) => {
        try {
            await api.put(`/usuarios/${u.id}`, { activo: !u.activo });
            mostrarToast('success', `Usuario ${!u.activo ? 'activado' : 'desactivado'}.`);
            cargar();
        } catch {
            mostrarToast('error', 'Error cambiando estado del usuario.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form };
            if (editId) {
                if (!payload.password) delete (payload as any).password;
                delete (payload as any).email; // email no se cambia una vez creado
                await api.put(`/usuarios/${editId}`, payload);
                mostrarToast('success', '✅ Usuario actualizado correctamente.');
            } else {
                if (!payload.password) throw new Error("La contraseña es obligatoria.");
                await api.post('/usuarios', payload);
                mostrarToast('success', '✅ Usuario creado correctamente.');
            }
            setShowModal(false);
            setForm(FORM_INICIAL);
            setEditId(null);
            cargar();
        } catch (e: any) {
            mostrarToast('error', `❌ ${e?.response?.data?.error || e.message || 'Error guardando usuario.'}`);
        } finally {
            setSaving(false);
        }
    };

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
                        <Users className="text-indigo-400 w-8 h-8" /> Usuarios del Sistema
                    </h1>
                    <p className="text-slate-400 mt-1">Gestioná los accesos y permisos al panel de tu emisora.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                    <PlusCircle className="w-5 h-5" /> Invitar Usuario
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>
            ) : usuarios.length === 0 ? (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-12 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No hay otros usuarios registrados.</p>
                </div>
            ) : (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                                    <th className="px-6 py-4 font-bold">Usuario</th>
                                    <th className="px-6 py-4 font-bold">Rol</th>
                                    <th className="px-6 py-4 font-bold text-center">Estado</th>
                                    <th className="px-6 py-4 font-bold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {usuarios.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                                                    {u.nombre?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{u.nombre || 'Sin nombre'}</p>
                                                    <p className="text-slate-400 text-xs mt-0.5">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold whitespace-nowrap">
                                                <Shield className="w-3 h-3" />
                                                {ROL_LABELS[u.rol] || u.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleActivo(u)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                    u.activo 
                                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                                                {u.activo ? 'ACTIVO' : 'SUSPENDIDO'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(u)}
                                                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                                                    title="Editar usuario"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id, u.email)}
                                                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                                    title="Eliminar permanentemente"
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
                </div>
            )}

            {/* Modal Crear/Editar Usuario */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                                {editId ? 'Editar Accesos' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={() => { setShowModal(false); setForm(FORM_INICIAL); setEditId(null); }} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Nombre Completo</label>
                                <input required className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all" placeholder="Ej: Juan Pérez" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Correo Electrónico *</label>
                                <input type="email" required disabled={!!editId} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed" placeholder="juan@ejemplo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                {editId && <p className="text-[10px] text-slate-500 mt-1">El email no se puede modificar.</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-1.5">Teléfono</label>
                                    <input type="tel" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all" placeholder="+54 9..." value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-1.5">Rol de Acceso *</label>
                                    <select required className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-indigo-500/60 transition-all" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                                        <option value="ADMIN_RADIO">Administrador</option>
                                        <option value="EDITOR_NOTICIAS">Editor de Noticias</option>
                                        <option value="LOCUTOR">Locutor</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Contraseña {editId && '(Opcional)'}</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required={!editId} 
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all pr-12" 
                                        placeholder={editId ? "Dejar en blanco para mantener" : "Mínimo 6 caracteres"} 
                                        value={form.password} 
                                        onChange={e => setForm({ ...form, password: e.target.value })} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                                <button type="button" onClick={() => { setShowModal(false); setForm(FORM_INICIAL); setEditId(null); }} className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando</> : <><CheckCircle className="w-4 h-4" /> {editId ? 'Guardar Cambios' : 'Invitar Usuario'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
