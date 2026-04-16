"use client";

import { useState } from 'react';
import { Settings2, Globe, Bell, CreditCard, Save, CheckCircle } from 'lucide-react';

export default function SuperAdminSettingsPage() {
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const inputCls = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/40 transition-all";
    const sectionCls = "bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5";

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {saved && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm bg-green-900/90 border border-green-500/30">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Configuración guardada.
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Settings2 className="text-violet-400 w-8 h-8" /> Configuración de la Plataforma
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Ajustes globales de ONRADIO SaaS.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Dominio */}
                <div className={sectionCls}>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Dominio Principal
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Dominio Base de la Plataforma</label>
                        <input type="text" defaultValue="onradio.com.ar" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">URL del Backend API</label>
                        <input type="url" defaultValue="http://localhost:4000" className={inputCls} />
                    </div>
                </div>

                {/* Precios */}
                <div className={sectionCls}>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Precios de los Planes (ARS)
                    </h2>
                    <div className="grid grid-cols-2 gap-5">
                        {[
                            { label: '🎧 Plan Audio — Precio Mensual', color: 'text-blue-400', defaultVal: 7000 },
                            { label: '🌐 Plan Portal — Precio Mensual', color: 'text-violet-400', defaultVal: 20000 },
                            { label: '🎧 Plan Audio — Precio Anual', color: 'text-blue-400', defaultVal: 75600 },
                            { label: '🌐 Plan Portal — Precio Anual', color: 'text-violet-400', defaultVal: 216000 },
                        ].map(({ label, color, defaultVal }) => (
                            <div key={label} className="space-y-2">
                                <label className={`text-sm font-medium ${color}`}>{label}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input type="number" defaultValue={defaultVal}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-white focus:outline-none focus:border-violet-500/40 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notificaciones */}
                <div className={sectionCls}>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Notificaciones de Plataforma
                    </h2>
                    {[
                        { label: 'Alerta cuando se registra un nuevo tenant', defaultVal: true },
                        { label: 'Notificación de pago recibido (MercadoPago)', defaultVal: true },
                        { label: 'Alerta de radio sin actividad por 30 días', defaultVal: false },
                    ].map(({ label, defaultVal }, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input type="checkbox" defaultChecked={defaultVal} className="peer sr-only" />
                                <div className="w-11 h-6 bg-white/10 peer-checked:bg-violet-600 rounded-full transition-colors" />
                                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                            </div>
                            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{label}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20">
                        <Save className="w-4 h-4" /> Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
}
