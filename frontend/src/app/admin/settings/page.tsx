"use client";

import { useState } from 'react';
import { Settings, Palette, Globe, Bell, Shield, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminSettingsPage() {
    const [toast, setToast] = useState(false);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    const mockSave = (e: React.FormEvent) => {
        e.preventDefault();
        setToast(true);
        setTimeout(() => setToast(false), 3000);
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {toast && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm bg-green-900/90 border border-green-500/30">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Configuración guardada.
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Settings className="text-slate-400 w-8 h-8" /> Configuración
                    </h1>
                    <p className="text-slate-400 mt-1">Ajustes del panel de administración y preferencias.</p>
                </div>
            </div>

            <form onSubmit={mockSave} className="space-y-6">
                {/* Sección Portal Web */}
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Portal Público
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Mensaje de Bienvenida</label>
                        <input
                            type="text"
                            defaultValue="Bienvenidos a nuestra transmisión en vivo"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/60 transition-all"
                        />
                        <p className="text-xs text-slate-500">Se muestra en el hero de tu portal de radio.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Redes Sociales — Facebook</label>
                            <input
                                type="url"
                                placeholder="https://facebook.com/tu-pagina"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Redes Sociales — Instagram</label>
                            <input
                                type="url"
                                placeholder="https://instagram.com/tu-cuenta"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Identidad Visual */}
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Apariencia del Panel
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Nombre que aparece en la barra lateral</label>
                        <input
                            type="text"
                            defaultValue="ONRADIO Panel"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/60 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">URL del Logo (Cabecera)</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                        />
                    </div>
                </div>

                {/* Seguridad */}
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Seguridad
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Cambiar Contraseña Actual</label>
                        <div className="relative">
                            <input
                                type={showOldPass ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all pr-12"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowOldPass(!showOldPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Nueva Contraseña</label>
                        <div className="relative">
                            <input
                                type={showNewPass ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-all pr-12"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPass(!showNewPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notificaciones */}
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Notificaciones
                    </h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Aviso cuando en el stream hay menos de 10 oyentes', defaultVal: true },
                            { label: 'Resumen diario de estadísticas por email', defaultVal: false },
                            { label: 'Notificación al recibir una donación', defaultVal: true },
                        ].map(({ label, defaultVal }, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" defaultChecked={defaultVal} className="peer sr-only" />
                                    <div className="w-11 h-6 bg-white/10 peer-checked:bg-primary rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-primary/30" />
                                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                                </div>
                                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-primary hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Save className="w-4 h-4" /> Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
}
