"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, Mail, Phone, Lock, Save, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface UserProfile {
    id: string;
    email: string;
    nombre: string | null;
    telefono: string | null;
    rol: string;
    radioId: string | null;
}

export default function ProfilePage({ theme = 'blue' }: { theme?: 'blue' | 'violet' }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: ''
    });

    const accentColor = theme === 'violet' ? 'text-violet-400' : 'text-blue-400';
    const bgAccent = theme === 'violet' ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20';
    const borderAccent = theme === 'violet' ? 'focus:border-violet-500/40' : 'focus:border-blue-500/40';

    const mostrarToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const cargarPerfil = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            setForm({
                nombre: res.data.nombre || '',
                email: res.data.email || '',
                telefono: res.data.telefono || '',
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error cargando perfil:', error);
            mostrarToast('error', 'No se pudo cargar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPerfil();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (form.password && form.password !== form.confirmPassword) {
            mostrarToast('error', 'Las contraseñas no coinciden.');
            return;
        }

        setSaving(true);
        try {
            const body: any = {
                nombre: form.nombre,
                email: form.email,
                telefono: form.telefono
            };
            if (form.password) body.password = form.password;

            await api.put('/auth/me', body);
            mostrarToast('success', 'Perfil actualizado correctamente.');
            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
            cargarPerfil();
        } catch (error: any) {
            mostrarToast('error', error.response?.data?.error || 'Error al guardar cambios.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className={`w-10 h-10 ${accentColor} animate-spin`} />
                <p className="text-slate-500 animate-pulse font-medium">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm border ${
                    toast.type === 'success' ? 'bg-green-900/90 border-green-500/30' : 'bg-red-900/90 border-red-500/30'
                }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                    {toast.msg}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <User className={`${accentColor} w-8 h-8`} /> Mi Perfil
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Gestiona tu información personal y contraseña.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Card */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 text-center space-y-4">
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 border-white/5 bg-white/5`}>
                            <User className={`w-10 h-10 ${accentColor}`} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{user?.nombre || 'Usuario'}</p>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10`}>
                                {user?.rol.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none ${borderAccent} transition-all`}
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none ${borderAccent} transition-all`}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={form.telefono}
                                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                                    className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none ${borderAccent} transition-all`}
                                    placeholder="+54 9 11 ..."
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-amber-500" /> Cambiar Contraseña
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nueva Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none ${borderAccent} transition-all pr-12`}
                                            placeholder="••••••••"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPass ? "text" : "password"}
                                            value={form.confirmPassword}
                                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                            className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none ${borderAccent} transition-all pr-12`}
                                            placeholder="••••••••"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-3 italic">* Deja estos campos vacíos si no deseas cambiar tu contraseña actual.</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`px-8 py-3 rounded-xl font-black text-white transition-all flex items-center gap-2 ${bgAccent} disabled:opacity-50`}
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Guardar Cambios</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
