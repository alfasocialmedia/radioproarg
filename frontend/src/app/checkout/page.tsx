"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Radio, Headphones, Globe2, CreditCard, Check, Loader2, ArrowLeft, CalendarClock, Wifi, Users, HardDrive, Zap } from 'lucide-react';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

interface Plan {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    precioMensual: number;
    precioAnual: number;
    precioMensualUSD: number | null;
    precioAnualUSD: number | null;
    bitrate: number;
    maxOyentes: number;
    almacenamientoGB: number;
    tieneCMS: boolean;
    tienePublicidad: boolean;
}

// Fallback si la API no responde
const PLANES_DEFAULT: Record<string, Omit<Plan, 'id'>> = {
    audio: {
        nombre: 'Plan Audio', slug: 'audio',
        descripcion: 'Transmití tu radio en vivo con todas las herramientas esenciales.',
        precioMensual: 7000, precioAnual: 75600,
        precioMensualUSD: 7, precioAnualUSD: 70,
        bitrate: 128, maxOyentes: 100, almacenamientoGB: 5,
        tieneCMS: false, tienePublicidad: false,
    },
    portal: {
        nombre: 'Plan Portal', slug: 'portal',
        descripcion: 'Todo el plan Audio más portal web, CMS de noticias y publicidad.',
        precioMensual: 20000, precioAnual: 216000,
        precioMensualUSD: 20, precioAnualUSD: 200,
        bitrate: 192, maxOyentes: 500, almacenamientoGB: 20,
        tieneCMS: true, tienePublicidad: true,
    },
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
    audio: <Headphones className="w-5 h-5" />,
    portal: <Globe2 className="w-5 h-5" />,
};

function CurrencyToggle({ moneda, onChange, disabledUSD = false }: { moneda: 'ARS' | 'USD'; onChange: (m: 'ARS' | 'USD') => void, disabledUSD?: boolean }) {
    return (
        <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-full sm:w-auto overflow-hidden">
            <button
                type="button"
                onClick={() => onChange('ARS')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${moneda === 'ARS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                Pesos ARS
            </button>
            <button
                type="button"
                onClick={() => {
                    if (!disabledUSD) onChange('USD');
                }}
                disabled={disabledUSD}
                style={{ cursor: disabledUSD ? 'not-allowed' : 'pointer' }}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                    moneda === 'USD' 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                        : disabledUSD 
                            ? 'text-slate-600 opacity-50 bg-transparent' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                {disabledUSD ? 'USD N/D' : 'Dólares USD'}
            </button>
        </div>
    );
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planParam = searchParams.get('plan') || 'audio';
    const cicloParam = (searchParams.get('ciclo') || 'mensual') as 'mensual' | 'anual';
    const monedaParam = (searchParams.get('moneda') || 'ARS') as 'ARS' | 'USD';
    const radioIdParam = searchParams.get('radioId');

    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loadingPlanes, setLoadingPlanes] = useState(true);
    const [planSlug, setPlanSlug] = useState(planParam);
    const [ciclo, setCiclo] = useState<'mensual' | 'anual'>(cicloParam);
    const [moneda, setMoneda] = useState<'ARS' | 'USD'>(monedaParam);

    // Forzar sincronización con searchParams una vez montado el componente
    // (resuelve problema de hidratación con Next.js Suspense/Turbopack)
    useEffect(() => {
        const m = searchParams.get('moneda');
        if (m === 'USD' || m === 'ARS') setMoneda(m);
        const p = searchParams.get('plan');
        if (p) setPlanSlug(p);
        const c = searchParams.get('ciclo');
        if (c === 'mensual' || c === 'anual') setCiclo(c);
    }, [searchParams]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [pais, setPais] = useState('Argentina');
    const [captchaRespuesta, setCaptchaRespuesta] = useState('');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const captchaA = 9, captchaB = 5;
    const captchaRespuestaCorrecta = String(captchaA + captchaB);

    // Cargar planes reales desde la API
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/planes`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setPlanes(data);
                else {
                    // Usar fallback
                    setPlanes(Object.values(PLANES_DEFAULT).map((p, i) => ({ ...p, id: String(i + 1) })));
                }
            })
            .catch(() => {
                setPlanes(Object.values(PLANES_DEFAULT).map((p, i) => ({ ...p, id: String(i + 1) })));
            })
            .finally(() => setLoadingPlanes(false));
    }, []);

    const planActual = planes.find(p => p.slug === planSlug) || planes[0];

    // Determinar si el plan tiene precios en USD
    const tieneUSD = planActual?.precioMensualUSD != null && planActual?.precioAnualUSD != null;
    const monedaEfectiva = (moneda === 'USD' && tieneUSD) ? 'USD' : 'ARS';

    // Calcular precio según moneda y ciclo
    const precio = planActual
        ? ciclo === 'anual'
            ? (monedaEfectiva === 'USD' ? (planActual.precioAnualUSD ?? planActual.precioAnual) : planActual.precioAnual)
            : (monedaEfectiva === 'USD' ? (planActual.precioMensualUSD ?? planActual.precioMensual) : planActual.precioMensual)
        : 0;

    // Ahorro anual en la moneda correcta
    const precioMensualBase = monedaEfectiva === 'USD' ? (planActual?.precioMensualUSD ?? planActual?.precioMensual ?? 0) : (planActual?.precioMensual ?? 0);
    const precioAnualBase = monedaEfectiva === 'USD' ? (planActual?.precioAnualUSD ?? planActual?.precioAnual ?? 0) : (planActual?.precioAnual ?? 0);
    const ahorro = planActual ? (precioMensualBase * 12 - precioAnualBase) : 0;

    const formatARS = (n: number) => `AR$ ${n.toLocaleString('es-AR')}`;
    const formatUSD = (n: number) => `U$D ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    const formatPrecio = (n: number) => monedaEfectiva === 'USD' ? formatUSD(n) : formatARS(n);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!aceptaTerminos) {
            setError('Debés aceptar los términos y condiciones para continuar.');
            return;
        }
        if (captchaRespuesta.trim() !== captchaRespuestaCorrecta) {
            setError('La verificación anti-bot es incorrecta.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/checkout/crear-preferencia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    radioId: radioIdParam || undefined,
                    planId: planActual?.id,
                    planSlug,
                    periodoFacturacion: ciclo,
                    moneda: monedaEfectiva,
                    nombreRadio: nombre || 'Upgrade Radio', // Fix prevent empty 
                    email,
                    telefono,
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || data.detail || 'Error del servidor');
            window.location.href = data.checkoutUrl;
        } catch (err: any) {
            setError(err.message || 'Error inesperado al procesar el pago.');
            setLoading(false);
        }
    };

    if (loadingPlanes) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando planes disponibles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans">
            <PublicNavbar />
            <div className="max-w-6xl mx-auto px-4 pt-32 pb-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Formulario */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">

                    {/* Selector de Plan — desde DB */}
                    <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                            <div>
                                <h2 className="text-base font-black text-white uppercase tracking-wider text-xs mb-1">1. Elegí tu plan</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Selecciona la moneda de pago</p>
                            </div>
                            <CurrencyToggle moneda={moneda} onChange={setMoneda} disabledUSD={!tieneUSD} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {planes.map((p) => (
                                <button
                                    type="button"
                                    key={p.slug}
                                    onClick={() => setPlanSlug(p.slug)}
                                    className={`flex flex-col p-4 rounded-xl border-2 font-bold text-sm transition-all text-left ${
                                        planSlug === p.slug
                                            ? 'border-red-500 bg-red-500/10 text-white'
                                            : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        {PLAN_ICONS[p.slug] || <Zap className="w-5 h-5" />}
                                        <span>{p.nombre}</span>
                                    </div>
                                    <div className="flex gap-3 text-xs">
                                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" />{p.bitrate}kbps</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.maxOyentes} oys.</span>
                                        <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{p.almacenamientoGB}GB</span>
                                    </div>
                                    <div className="mt-2 text-base font-black text-white">
                                        {monedaEfectiva === 'USD' && tieneUSD
                                            ? formatUSD(ciclo === 'anual' ? (p.precioAnualUSD ?? p.precioAnual) : (p.precioMensualUSD ?? p.precioMensual))
                                            : formatARS(ciclo === 'anual' ? p.precioAnual : p.precioMensual)
                                        }
                                        <span className="text-xs font-normal text-slate-400">/{ciclo === 'anual' ? 'año' : 'mes'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ciclo de Pago */}
                    <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Periodo de facturación</h2>
                            <div className="flex items-center gap-2">
                                {monedaEfectiva === 'USD' && (
                                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg">USD</span>
                                )}
                                {ahorro > 0 && (
                                    <span className="text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg">
                                        Ahorrás 2 meses
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setCiclo('mensual')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${ciclo === 'mensual' ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                                <div className="font-bold text-white">Mensual</div>
                                <div className="text-xs text-slate-400 mt-1">Flexibilidad total</div>
                            </button>
                            <button type="button" onClick={() => setCiclo('anual')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${ciclo === 'anual' ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                                <div className="font-bold text-white flex items-center gap-2">
                                    Anual <span className="text-xs font-bold bg-green-500 text-black px-1.5 py-0.5 rounded">2 GRATIS</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">Pagás 10 meses</div>
                            </button>
                        </div>
                        {ciclo === 'anual' && ahorro > 0 && (
                            <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm text-green-300">
                                <CalendarClock className="w-4 h-4 inline-block mr-2 text-green-400" />
                                Pasándote a <strong>ANUAL</strong> ahorrás <strong>2 meses</strong>.
                            </div>
                        )}
                    </div>

                    {/* Datos del cliente */}
                    <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-4">
                        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Datos de tu radio</h2>
                        {[
                            { label: 'Nombre de la Radio', value: nombre, setter: setNombre, type: 'text', placeholder: 'Ej. Radio Zenith FM', required: true },
                            { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'tunombre@email.com', required: true },
                            { label: 'Teléfono / WhatsApp', value: telefono, setter: setTelefono, type: 'tel', placeholder: '5491112334455', required: false },
                        ].map(({ label, value, setter, type, placeholder, required }) => (
                            <div key={label}>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
                                <input
                                    type={type}
                                    required={required}
                                    value={value}
                                    onChange={e => setter(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30 transition-all"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">País</label>
                            <select value={pais} onChange={e => setPais(e.target.value)}
                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/70 transition-all">
                                {['Argentina', 'Uruguay', 'Chile', 'Colombia', 'Perú', 'México', 'España', 'Otro'].map(p => (
                                    <option key={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Verificación */}
                    <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 space-y-4">
                        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">4. Verificación rápida</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                Resolvé: <strong className="text-white">{captchaA} + {captchaB} = ?</strong>
                            </label>
                            <input
                                type="text"
                                value={captchaRespuesta}
                                onChange={e => setCaptchaRespuesta(e.target.value)}
                                placeholder="Tu respuesta"
                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500/70 transition-all"
                            />
                        </div>
                        <div className="flex items-start gap-3">
                            <div
                                onClick={() => setAceptaTerminos(!aceptaTerminos)}
                                className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-all ${aceptaTerminos ? 'bg-red-500 border-red-500' : 'border-slate-500 bg-transparent'}`}
                            >
                                {aceptaTerminos && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <label className="text-sm text-slate-400 cursor-pointer leading-relaxed" onClick={() => setAceptaTerminos(!aceptaTerminos)}>
                                Acepto los <Link href="/terminos" target="_blank" className="text-red-400 underline hover:text-red-300">Términos y Condiciones</Link> del servicio.
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !planActual}
                        id="btn-contratar-ahora"
                        className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-black text-lg py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_-10px_rgba(34,197,94,0.6)] hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.9)]"
                    >
                        {loading ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /> Procesando...</>
                        ) : (
                            <><CreditCard className="w-6 h-6" /> Continuar al Pago →</>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-500">🔒 Pago seguro con MercadoPago · Toda la operación es confidencial</p>
                </form>

                {/* Resumen del Pedido */}
                <div className="lg:col-span-2">
                    {planActual && (
                        <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 sticky top-24 space-y-5">
                            <h2 className="text-base font-bold text-slate-200 border-b border-white/5 pb-4">Resumen del pedido</h2>

                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="bg-red-600/30 text-red-400 p-2.5 rounded-lg">
                                    {PLAN_ICONS[planActual.slug] || <Zap className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{planActual.nombre}</p>
                                    <p className="text-xs text-slate-500">ONRADIO.com.ar</p>
                                </div>
                            </div>

                            {/* Specs del plan */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { icon: <Wifi className="w-3 h-3" />, val: `${planActual.bitrate}kbps`, label: 'Bitrate' },
                                    { icon: <Users className="w-3 h-3" />, val: planActual.maxOyentes, label: 'Oyentes' },
                                    { icon: <HardDrive className="w-3 h-3" />, val: `${planActual.almacenamientoGB}GB`, label: 'Storage' },
                                ].map(({ icon, val, label }) => (
                                    <div key={label} className="bg-black/20 rounded-xl p-2.5 text-center">
                                        <div className="text-slate-500 flex justify-center mb-1">{icon}</div>
                                        <p className="text-xs font-black text-white">{val}</p>
                                        <p className="text-xs text-slate-600">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Features */}
                            <ul className="space-y-1.5">
                                {[
                                    'Transmisión 24/7 con AutoDJ',
                                    'Panel de control completo',
                                    'Estadísticas de oyentes',
                                    ...(planActual.tieneCMS ? ['Portal de noticias (CMS)'] : []),
                                    ...(planActual.tienePublicidad ? ['Gestión de publicidad'] : []),
                                    'Soporte técnico especializado',
                                ].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {f}
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-white/5 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>Facturación</span>
                                    <span className="font-medium text-white capitalize">{ciclo}</span>
                                </div>
                                {ciclo === 'anual' && ahorro > 0 && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Descuento anual</span>
                                        <span>-{formatPrecio(ahorro)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-baseline mt-2 pt-3 border-t border-white/5">
                                    <span className="text-white font-bold">Total</span>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-white">{formatPrecio(precio)}</div>
                                        <div className="text-xs text-slate-400">/{ciclo === 'mensual' ? 'mes' : 'año'} en {monedaEfectiva}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-400 pt-1">
                                {monedaEfectiva === 'ARS' ? (
                                    <>
                                        <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span>Procesado por <strong className="text-blue-400">MercadoPago</strong></span>
                                    </>
                                ) : (
                                    <>
                                        <Globe2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>Procesado por <strong className="text-emerald-400">PayPal / Stripe</strong></span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <PublicFooter />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
