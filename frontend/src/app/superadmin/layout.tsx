"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    ShieldCheck, Radio, LayoutDashboard, Users, CreditCard,
    Settings2, LogOut, MessageSquare, DollarSign, Layers,
    HelpCircle, BookOpen, User
} from 'lucide-react';



export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const navGroups = [
        {
            label: 'Plataforma',
            items: [
                { name: 'Resumen', href: '/superadmin', icon: LayoutDashboard, exactMatch: true },
                { name: 'Emisoras', href: '/superadmin/emisoras', icon: Radio },
                { name: 'Clientes', href: '/superadmin/clientes', icon: Users },
            ]
        },
        {
            label: 'Negocio',
            items: [
                { name: 'Planes', href: '/superadmin/planes', icon: Layers },
                { name: 'Suscripciones', href: '/superadmin/suscripciones', icon: CreditCard },
                { name: 'Pagos', href: '/superadmin/pagos', icon: DollarSign },
            ]
        },
        {
            label: 'Soporte & Contenido',
            items: [
                { name: 'Tickets', href: '/superadmin/tickets', icon: MessageSquare },
                { name: 'FAQ', href: '/superadmin/faq', icon: HelpCircle },
                { name: 'Tutoriales', href: '/superadmin/tutoriales', icon: BookOpen },
            ]
        },
        {
            label: 'Sistema',
            items: [
                { name: 'Configuración', href: '/superadmin/settings', icon: Settings2 },
                { name: 'Mi Perfil', href: '/superadmin/perfil', icon: User },
            ]
        },
    ];


    const isActive = (href: string, exactMatch = false) =>
        exactMatch ? pathname === href : pathname.startsWith(href);

    return (
        <div className="flex h-screen overflow-hidden bg-[#020617]">
            <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-[#0a0f1e]">
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white leading-none tracking-wide">SUPERADMIN</p>
                        <p className="text-xs text-violet-400/60 font-medium mt-0.5">ONRADIO Platform</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-5">
                    {navGroups.map(group => (
                        <div key={group.label}>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-2">{group.label}</p>
                            <div className="space-y-0.5">
                                {group.items.map(item => {
                                    const active = isActive(item.href, (item as any).exactMatch);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                                active
                                                    ? 'bg-violet-500/10 text-white border border-violet-500/15'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-400' : ''}`} />
                                            {item.name}
                                            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-3 border-t border-white/5 space-y-1">
                    <div className="px-3 py-1.5 text-xs text-slate-600 font-mono">ONRADIO v2.0 — SaaS</div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('usuario_plan');
                            localStorage.removeItem('usuario_rol');
                            router.push('/');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                    >
                        <LogOut className="w-4 h-4 shrink-0" /> Salir al Inicio
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-[#020617]">
                {children}
            </main>
        </div>
    );
}
