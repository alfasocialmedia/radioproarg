"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, Menu, X, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
    { label: 'Planes y Precios', href: '/radio-online#precios' },
    { label: 'Funcionalidades', href: '/radio-online#caracteristicas' },
    { label: 'Asistente 24/7', href: '/faq' },
];

function CurrencySelector() {
    const [moneda, setMoneda] = useState<'ARS' | 'USD'>('ARS');

    // Cargar preferencia al montar
    useEffect(() => {
        const saved = localStorage.getItem('pref_moneda');
        if (saved === 'USD' || saved === 'ARS') setMoneda(saved);
    }, []);

    const toggle = (m: 'ARS' | 'USD') => {
        setMoneda(m);
        localStorage.setItem('pref_moneda', m);
        // Disparar evento para que otros componentes se enteren con el detalle de la moneda
        window.dispatchEvent(new CustomEvent('monedaChange', { detail: { moneda: m } }));
        // Si estamos en la landing o checkout, esto ayudará a la sincronización instantánea
    };

    return (
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
                onClick={() => toggle('ARS')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${moneda === 'ARS' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
                ARS
            </button>
            <button
                onClick={() => toggle('USD')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${moneda === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
                USD
            </button>
        </div>
    );
}

export default function PublicNavbar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="fixed top-0 w-full z-50 bg-[#04080f]/85 backdrop-blur-2xl border-b border-white/[0.05]">
            <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_22px_rgba(220,38,38,0.6)] transition-shadow">
                            <Radio className="w-4 h-4 text-white" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-[#04080f] animate-pulse" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">ONRADIO</span>
                </Link>

                {/* Links — desktop */}
                <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-400">
                    {NAV_LINKS.map(l => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`hover:text-white transition-colors ${pathname === l.href ? 'text-white' : ''}`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* CTA derecha */}
                <div className="hidden lg:flex items-center gap-4">
                    <CurrencySelector />
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    <Link href="/admin/dashboard" className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">
                        Acceso Clientes
                    </Link>
                    <Link
                        href="/radio-online#precios"
                        className="bg-red-600 hover:bg-red-500 text-white text-[13px] font-black px-5 py-2 rounded-lg transition-all shadow-[0_0_16px_rgba(220,38,38,0.25)] hover:shadow-[0_0_24px_rgba(220,38,38,0.45)]"
                    >
                        Ver Planes
                    </Link>
                </div>

                {/* Hamburger — mobile */}
                <button
                    onClick={() => setOpen(!open)}
                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    aria-label="Abrir menú"
                >
                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="lg:hidden border-t border-white/[0.06] bg-[#04080f]/95 backdrop-blur-2xl">
                    <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
                        {NAV_LINKS.map(l => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                            >
                                {l.label}
                            </Link>
                        ))}
                        <div className="border-t border-white/[0.06] mt-3 pt-3 flex flex-col gap-2">
                            <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                Acceso Clientes
                            </Link>
                            <Link href="/#planes" onClick={() => setOpen(false)} className="bg-red-600 hover:bg-red-500 text-white text-sm font-black px-4 py-3 rounded-xl transition-all text-center">
                                Ver Planes
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
