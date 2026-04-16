"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    ArrowRight, Mic2, Radio, Zap, Server, Cloud, Headphones,
    CheckCircle2, Globe2, Shield, BarChart3, Music, Clock,
    Users, MessageSquare, FileAudio, Download, Play, Layers,
    Smartphone, Monitor, Mail, Star, ArrowUpRight
} from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

type Moneda = 'ARS' | 'USD';

function formatPrecio(valor: number, moneda: Moneda) {
    if (moneda === 'ARS') return `$${valor.toLocaleString('es-AR')}`;
    return `U$D ${valor}`;
}

function CurrencyToggle({ moneda, onChange }: { moneda: Moneda; onChange: (m: Moneda) => void }) {
    return (
        <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
                onClick={() => onChange('ARS')}
                className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${moneda === 'ARS' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
            >
                Pesos ARS
            </button>
            <button
                onClick={() => onChange('USD')}
                className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${moneda === 'USD' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-400 hover:text-white'}`}
            >
                Dólares USD
            </button>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any; title: string; desc: string; delay: number }) {
    return (
        <div 
            className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center">
            <Icon className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-slate-500 text-sm">{label}</div>
        </div>
    );
}

function TestimonialCard({ nombre, rol, texto, estrellas }: { nombre: string; rol: string; texto: string; estrellas: number }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex gap-1 mb-4">
                {[...Array(estrellas)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed">"{texto}"</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {nombre[0]}
                </div>
                <div>
                    <div className="font-bold text-white text-sm">{nombre}</div>
                    <div className="text-slate-500 text-xs">{rol}</div>
                </div>
            </div>
        </div>
    );
}

export default function RadioOnlinePage() {
    const [moneda, setMoneda] = useState<Moneda>('ARS');
    const [planData, setPlanData] = useState<any>(null);
    const [loadingPrecios, setLoadingPrecios] = useState(true);

    useEffect(() => {
        // Cargar moneda inicial
        const saved = localStorage.getItem('pref_moneda') as Moneda;
        if (saved && (saved === 'ARS' || saved === 'USD')) setMoneda(saved);

        // Escuchar cambios globales
        const handleMonedaGlobal = (e: any) => {
            if (e.detail?.moneda) {
                setMoneda(e.detail.moneda);
            }
        };
        window.addEventListener('monedaChange', handleMonedaGlobal);

        api.get('/planes')
            .then(r => {
                const planes = r.data as any[];
                // Buscar por slug 'audio', si no el primero activo
                const plan = planes.find((p: any) => p.slug === 'audio') || planes[0];
                if (plan) setPlanData(plan);
            })
            .catch(() => {
                // Si falla la API, usar valores de fallback
                setPlanData({ precioMensual: 7000, precioAnual: 75600, precioMensualUSD: null, precioAnualUSD: null });
            })
            .finally(() => setLoadingPrecios(false));

        return () => window.removeEventListener('monedaChange', handleMonedaGlobal);
    }, []);

    const cambiarMoneda = (nueva: Moneda) => {
        setMoneda(nueva);
        localStorage.setItem('pref_moneda', nueva);
        window.dispatchEvent(new CustomEvent('monedaChange', { detail: { moneda: nueva } }));
    };

    const tieneUSD = planData?.precioMensualUSD != null && planData?.precioAnualUSD != null;
    const precioMensual = planData ? (moneda === 'ARS' ? planData.precioMensual : (planData.precioMensualUSD ?? planData.precioMensual)) : 0;
    const precioAnual = planData ? (moneda === 'ARS' ? planData.precioAnual : (planData.precioAnualUSD ?? planData.precioAnual)) : 0;
    const monedaEfectiva: Moneda = (!tieneUSD && moneda === 'USD') ? 'ARS' : moneda;

    const features = [
        { icon: Zap, title: 'Streaming 24/7', desc: 'Servidores redundantres con 99.9% uptime. Tu señal siempre al aire.' },
        { icon: Server, title: 'AutoDJ Integrado', desc: 'Biblioteca musical ilimitada. Tu radio suena aunque no estés.' },
        { icon: Headphones, title: 'Reproductor Web', desc: 'Widget embebible para tu sitio web. Diseño adaptable y profesional.' },
        { icon: Users, title: '1000 Oyentes', desc: 'Capacidad para hasta 1000 oyentes simultáneos sin corte.' },
        { icon: BarChart3, title: 'Estadísticas', desc: 'Panel con oyentes en tiempo real, picos y métricas detalladas.' },
        { icon: Shield, title: 'Soporte WhatsApp', desc: 'Equipo humano disponible de Lun-Sáb. Sin bots ni esperas.' },
    ];

    const includes = [
        'Streaming HD (hasta 1000 oyentes simultáneos)',
        'AutoDJ en la nube 24/7',
        'Panel de estadísticas profesionales',
        'Reproductor HTML5 seguro (SSL)',
        'Soporte técnico preferencial',
    ];

    const testimonials = [
        { nombre: 'Carlos Mendoza', rol: 'Radio Tropical FM', texto: 'Desde que migramos a OnRadio, nuestra audiencia se triplicó. El AutoDJ es una maravilla.', estrellas: 5 },
        { nombre: 'María López', rol: 'Radio Deportivo', texto: 'El soporte es increible. Siempre que tuve un problema, me resolvieron en minutos.', estrellas: 5 },
        { nombre: 'Jorge Ramírez', rol: 'Radio Nostalgia', texto: 'Llevo 2 años transmitiendo y nunca tuve un corte. Totalmente confiable.', estrellas: 5 },
    ];

    return (
        <div className="min-h-screen bg-[#04080f] text-slate-50 font-sans overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            <div className="fixed top-[-20vh] left-[-10vw] w-[70vw] h-[70vw] bg-red-700/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-[-10vh] right-[-10vw] w-[50vw] h-[50vw] bg-orange-700/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-[40vh] right-[20vw] w-[30vw] h-[30vw] bg-blue-700/5 rounded-full blur-[100px] pointer-events-none" />

            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-5 text-center z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-extrabold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
                        <Radio className="w-3.5 h-3.5" />
                        Streaming Profesional
                    </div>

                    <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black tracking-tight text-white leading-[1.1] mb-6">
                        Tu radio online<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-pink-500">
                            sin complicaciones
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        Streaming de audio profesional con AutoDJ incluido. 
                        Envía tu señal a todo el mundo y reacha miles de oyentes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <a 
                            href="#precios" 
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black text-base shadow-[0_6px_30px_-6px_rgba(220,38,38,0.7)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                        >
                            Comenzar Ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a 
                            href="#caracteristicas" 
                            className="w-full sm:w-auto border border-white/10 hover:border-white/20 bg-white/[0.03] text-white px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
                        >
                            Ver Características
                        </a>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                            <div className="text-2xl font-black text-white">99.9%</div>
                            <div className="text-slate-500 text-xs">Uptime</div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                            <div className="text-2xl font-black text-white">1000</div>
                            <div className="text-slate-500 text-xs">Oyentes máx</div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                            <div className="text-2xl font-black text-white">24/7</div>
                            <div className="text-slate-500 text-xs">Transmisión</div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                            <div className="text-2xl font-black text-white">∞</div>
                            <div className="text-slate-500 text-xs">AutoDJ</div>
                        </div>
                    </div>
                </div>

            </section>

            {/* Features Grid */}
            <section id="caracteristicas" className="py-28 px-5 z-10 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-red-500 text-xs font-extrabold uppercase tracking-[.2em] mb-3">Características</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Todo lo que necesitás<br />para tu radio online
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Herramientas profesionales diseñadas para que te concentres en lo importante: tu contenido.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <FeatureCard key={f.title} {...f} delay={i * 100} />
                        ))}
                    </div>
                </div>
            </section>

            {/* What's Included */}
            <section className="py-28 px-5 z-10 relative bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-red-500 text-xs font-extrabold uppercase tracking-[.2em] mb-3">Incluido</p>
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6">
                                ¿Qué obtienes con<br />tu plan de streaming?
                            </h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Un paquete completo de streaming de audio profesional. 
                                Sin costos ocultos, sin letras pequeñas. Solo vos y tu radio.
                            </p>

                            <ul className="space-y-3">
                                {includes.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-3xl p-8 border border-white/10">
                                <div className="mb-6">
                                    <div className="text-sm text-slate-400 mb-2">Reproductor Web</div>
                                    <div className="text-2xl font-black text-white">Vista Previa</div>
                                </div>
                                
                                <div className="bg-[#0a0f1a] rounded-2xl p-6 border border-white/5">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                            <Radio className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">Tu Radio Online</div>
                                            <div className="text-xs text-green-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                En Vivo
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center gap-4 py-4">
                                        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                            <Play className="w-4 h-4 text-white ml-0.5" />
                                        </button>
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-1/2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                                        </div>
                                        <div className="text-xs text-slate-400">128kbps</div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 245 oyentes</span>
                                        <span>Live</span>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl" />
                                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-28 px-5 z-10 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-red-500 text-xs font-extrabold uppercase tracking-[.2em] mb-3">Cómo Funciona</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            En 3 pasos, al aire
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Contratá', desc: 'Elegí tu plan y completá el registro en minutos.' },
                            { step: '02', title: 'Configurá', desc: 'Subí tu lista de reproducción al AutoDJ.' },
                            { step: '03', title: 'Transmití', desc: 'Conectá tu software y empezá a transmitir.' },
                        ].map((s, i) => (
                            <div key={s.step} className="relative">
                                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 h-full">
                                    <div className="text-6xl font-black text-white/10 mb-4">{s.step}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                                    <p className="text-slate-500">{s.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="w-6 h-6 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials - Oculto temporalmente */}
            <section className="hidden py-28 px-5 z-10 relative bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-red-500 text-xs font-extrabold uppercase tracking-[.2em] mb-3">Testimonios</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Radios que confían en nosotros
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={i} {...t} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="precios" className="py-28 px-5 z-10 relative">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-red-500 text-xs font-extrabold uppercase tracking-[.2em] mb-3">Precios</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Planes simples, sin sorpresas
                        </h2>
                        <p className="text-slate-400">Elegí la opción que mejor se adapte a vos.</p>

                        <div className="mt-6 flex flex-col items-center gap-3">
                            {!loadingPrecios && (
                                <CurrencyToggle moneda={moneda} onChange={cambiarMoneda} />
                            )}
                            {loadingPrecios && (
                                <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mensual */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-white mb-2">Plan Mensual</h3>
                                <p className="text-slate-500 text-sm">Paga mes a mes, sin compromiso.</p>
                            </div>
                            
                            <div className="mb-6">
                                <div className="text-4xl font-black text-white">
                                    {loadingPrecios 
                                        ? <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse" />
                                        : formatPrecio(precioMensual, monedaEfectiva)
                                    }
                                </div>
                                <div className="text-slate-500 text-sm">/mes</div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {includes.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => window.location.href = `/checkout?plan=audio&ciclo=mensual&moneda=${moneda}`}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-xl transition-all border border-white/10"
                            >
                                Contratar Mensual
                            </button>
                        </div>

                        {/* Anual - Destacado */}
                        <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-3xl p-8 relative">
                            <div className="absolute -top-3 right-6 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                2 meses gratis
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-white mb-2">Plan Anual</h3>
                                <p className="text-slate-500 text-sm">Ahorrá un 17% vs mensual.</p>
                            </div>
                            
                            <div className="mb-6">
                                <div className="text-4xl font-black text-white">
                                    {loadingPrecios
                                        ? <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse" />
                                        : formatPrecio(precioAnual, monedaEfectiva)
                                    }
                                </div>
                                <div className="text-slate-500 text-sm">/año</div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {includes.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => window.location.href = `/checkout?plan=audio&ciclo=anual&moneda=${moneda}`}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_20px_-4px_rgba(220,38,38,0.5)]"
                            >
                                Contratar Anual <ArrowRight className="w-4 h-4 inline ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>



            {/* CTA Final */}
            <section className="py-28 px-5 z-10 relative">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                        ¿Listo para salir al aire?
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Tu radio online te espera. Arrancá hoy y reachá a tu audiencia en todo el mundo.
                    </p>
                    <a 
                        href="#precios"
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black text-base shadow-[0_6px_30px_-6px_rgba(220,38,38,0.7)] transition-all hover:-translate-y-0.5"
                    >
                        Ver Planes <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}