"use client";

import Link from 'next/link';
import { Radio, Mail, MessageSquare } from 'lucide-react';

const FOOTER_LINKS = {
    Plataforma: [
        { label: 'Planes y Precios', href: '/radio-online#precios' },
        { label: 'Funcionalidades', href: '/radio-online#caracteristicas' },
    ],
    Soporte: [
        { label: 'Asistente 24/7', href: '/faq' },
        { label: 'Tutoriales', href: '/tutoriales' },
        { label: 'Centro de Soporte', href: '/admin/tickets' },
    ],
    Legal: [
        { label: 'Términos y Condiciones', href: '/terminos' },
        { label: 'Política de Privacidad', href: '/privacidad' },
    ],
};

export default function PublicFooter() {
    return (
        <footer className="border-t border-white/[0.06] bg-[#04080f] text-slate-400">
            {/* CTA superior */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-5 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-white mb-1">¿Listo para empezar?</h3>
                        <p className="text-slate-500 text-sm">Tu primera emisora online puede estar al aire hoy mismo.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href="/#planes"
                            className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 rounded-xl transition-all text-sm shadow-[0_4px_20px_-4px_rgba(220,38,38,0.5)]"
                        >
                            Ver Planes
                        </Link>
                        <Link
                            href="/admin/dashboard"
                            className="border border-white/10 hover:border-white/20 bg-white/[0.03] text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
                        >
                            Acceso Clientes
                        </Link>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="max-w-7xl mx-auto px-5 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
                            <div className="w-8 h-8 rounded-lg bg-red-600/90 flex items-center justify-center">
                                <Radio className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-black text-white tracking-tight">ONRADIO</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-5">
                            La plataforma SaaS de streaming para emisoras online en Latinoamérica. Streaming, portal web, CMS y más.
                        </p>
                        {/* Contacto */}
                        <div className="space-y-2 text-xs text-slate-600">
                            <a href="https://wa.me/541165234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-400 transition-colors">
                                <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                                WhatsApp Soporte
                            </a>
                            <a href="mailto:soporte@onradio.com.ar" className="flex items-center gap-2 hover:text-slate-400 transition-colors">
                                <Mail className="w-3.5 h-3.5 text-blue-400" />
                                soporte@onradio.com.ar
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([grupo, links]) => (
                        <div key={grupo}>
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-4">{grupo}</h4>
                            <ul className="space-y-2.5">
                                {links.map(l => (
                                    <li key={l.href}>
                                        <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <span>© {new Date().getFullYear()} ONRADIO SaaS — Todos los derechos reservados.</span>
                    <div className="flex items-center gap-5">
                        <Link href="/privacidad" className="hover:text-slate-400 transition-colors">Privacidad</Link>
                        <Link href="/terminos" className="hover:text-slate-400 transition-colors">Términos</Link>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Todos los sistemas operativos
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
