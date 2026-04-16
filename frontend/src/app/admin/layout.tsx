"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, RadioIcon, Newspaper, CalendarDays,
    Settings, ExternalLink, LogOut, Radio, Music2,
    Wifi, CreditCard, LifeBuoy, FolderOpen, Tag, Megaphone, Users, MessageSquare, Headphones, Palette, Bell, User, PieChart
} from 'lucide-react';


export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // En producción, leer desde JWT o contexto de auth
    const [PLAN, setPlan] = useState<string>('audio');
    const [slug, setSlug] = useState<string>('demo');
    const [ROL, setRol] = useState<string>('ADMIN_RADIO');
    const [radioIdActual, setRadioIdActual] = useState<string>('');

    useEffect(() => {
        const storedPlan = localStorage.getItem('usuario_plan');
        if (storedPlan) {
            setPlan(storedPlan);
        } else {
            setPlan('audio'); // Sin plan guardado, el mínimo es Audio
            localStorage.setItem('usuario_plan', 'audio');
        }

        const storedRol = localStorage.getItem('usuario_rol');
        if (storedRol) {
            setRol(storedRol);
        }

        // Obtener la configuración de la radio actual
        import('@/lib/api').then(({ api }) => {
            api.get('/radios/config')
                .then(res => {
                    const { id, subdominio } = res.data;
                    if (subdominio) setSlug(subdominio);
                    if (id) {
                        localStorage.setItem('radioId', id);
                        setRadioIdActual(id);
                    }
                })
                .catch(err => {
                    // Evitar el error gigante de Axios en la pantalla usando err.message
                    console.error('Error fetching radio slug:', err?.message || 'Check tenant configuration');
                });
        });
    }, []);

    const togglePlanDemo = () => {
        const newPlan = PLAN === 'portal' ? 'audio' : 'portal';
        setPlan(newPlan);
        localStorage.setItem('usuario_plan', newPlan);
    };

    const isPlanPortal = PLAN === 'portal';

    const allNavItems = [
        { name: 'Resumen', href: '/admin/dashboard', icon: LayoutDashboard, color: 'text-blue-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'EDITOR_NOTICIAS', 'LOCUTOR', 'SUPER_ADMIN'] },
        { name: 'Cabina (Live)', href: '/admin/live', icon: MessageSquare, color: 'text-rose-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'LOCUTOR', 'SUPER_ADMIN'] },
        { name: 'Mi Emisora', href: '/admin/emisora', icon: RadioIcon, color: 'text-green-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Apariencia del Portal', href: '/admin/apariencia', icon: Palette, color: 'text-pink-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Notificaciones Push', href: '/admin/notificaciones', icon: Bell, color: 'text-yellow-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'LOCUTOR', 'SUPER_ADMIN'] },
        { name: 'Podcasts (On-Demand)', href: '/admin/podcasts', icon: Headphones, color: 'text-pink-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'LOCUTOR', 'SUPER_ADMIN'] },
        { name: 'Transmisión', href: '/admin/transmision', icon: Wifi, color: 'text-cyan-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Noticias', href: '/admin/noticias', icon: Newspaper, color: 'text-yellow-400', requiredPlan: 'portal', roles: ['ADMIN_RADIO', 'EDITOR_NOTICIAS', 'SUPER_ADMIN'] },
        { name: 'Encuestas', href: '/admin/encuestas', icon: PieChart, color: 'text-indigo-400', requiredPlan: 'portal', roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Categorías', href: '/admin/categorias', icon: Tag, color: 'text-orange-400', requiredPlan: 'portal', roles: ['ADMIN_RADIO', 'EDITOR_NOTICIAS', 'SUPER_ADMIN'] },
        { name: 'Programación', href: '/admin/programacion', icon: CalendarDays, color: 'text-purple-400', requiredPlan: 'portal', roles: ['ADMIN_RADIO', 'LOCUTOR', 'SUPER_ADMIN'] },
        { name: 'Publicidad', href: '/admin/publicidad', icon: Megaphone, color: 'text-amber-400', requiredPlan: 'portal', roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Medios', href: '/admin/media', icon: FolderOpen, color: 'text-sky-400', requiredPlan: 'portal', roles: ['ADMIN_RADIO', 'EDITOR_NOTICIAS', 'SUPER_ADMIN'] },
        { name: 'Facturación', href: '/admin/facturacion', icon: CreditCard, color: 'text-emerald-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Soporte', href: '/admin/tickets', icon: LifeBuoy, color: 'text-primary', requiredPlan: null, roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Usuarios', href: '/admin/usuarios', icon: Users, color: 'text-indigo-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Configuración', href: '/admin/settings', icon: Settings, color: 'text-slate-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'SUPER_ADMIN'] },
        { name: 'Mi Perfil', href: '/admin/perfil', icon: User, color: 'text-blue-400', requiredPlan: null, roles: ['ADMIN_RADIO', 'EDITOR_NOTICIAS', 'LOCUTOR', 'SUPER_ADMIN'] },
    ];


    const navItems = allNavItems.filter(item => 
        (item.requiredPlan === null || item.requiredPlan === PLAN) &&
        item.roles.includes(ROL)
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#020617]">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-[#0a0f1e]">
                {/* Header */}
                <div className="h-20 flex flex-col justify-center px-5 border-b border-white/5 relative group">
                    <div className="flex items-center gap-3">
                        <Radio className="w-6 h-6 text-primary shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-black text-white leading-tight truncate">Panel de Radio</p>
                            <p className={`text-xs font-bold leading-none mt-0.5 ${isPlanPortal ? 'text-purple-400' : 'text-blue-400'}`}>
                                {isPlanPortal ? '🌐 Plan Portal' : '🎧 Plan Audio'}
                            </p>
                        </div>
                    </div>
                    {/* Botón Oculto de Demo para alternar Plan rápidamente  */}
                    <button 
                        onClick={togglePlanDemo}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1 active:scale-95"
                        title="Alternar vista entre Plan Audio y Plan Portal"
                    >
                        ⇄ Prueba
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                    isActive ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? item.color : ''}`} />
                                {item.name}
                                {isActive && (
                                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                                )}
                            </Link>
                        );
                    })}

                    {/* Secciones bloqueadas si es Plan Audio y Rol Admin */}
                    {!isPlanPortal && ['ADMIN_RADIO', 'SUPER_ADMIN'].includes(ROL) && (
                        <div className="pt-4 border-t border-white/5 mt-4">
                            <p className="text-[10px] text-slate-500 px-3 mb-3 font-bold uppercase tracking-[0.15em]">Módulos Portal (Bloqueados)</p>
                            {[
                                { name: 'CMS de Noticias', icon: Newspaper },
                                { name: 'Programación', icon: CalendarDays },
                                { name: 'Publicidad', icon: Megaphone },
                            ].map(({ name, icon: Icon }) => (
                                <div key={name} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600/50 grayscale select-none">
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {name}
                                    <span className="ml-auto text-[8px] bg-yellow-500/10 text-yellow-600/60 px-1 py-0.5 rounded font-black">PRO</span>
                                </div>
                            ))}
                            <Link
                                href={`/checkout?plan=portal&radioId=${radioIdActual}`}
                                className="mt-5 mx-2 group relative overflow-hidden flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 text-white text-xs font-black transition-all shadow-lg active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <Music2 className="w-4 h-4 text-purple-400" /> Subir a Plan Portal
                            </Link>
                        </div>
                    )}
                </nav>


                {/* Footer */}
                <div className="p-3 border-t border-white/5 space-y-1">
                    <a
                        href={`/radio/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                    >
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        Ver Portal de Radio
                    </a>
                    <button
                        onClick={() => {
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('usuario_plan');
                            localStorage.removeItem('usuario_rol');
                            localStorage.removeItem('radioId');
                            localStorage.removeItem('tenant_id');
                            router.push('/');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-white hover:bg-red-500/10 transition-all font-medium"
                    >
                        <LogOut className="w-4 h-4 shrink-0" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 overflow-y-auto bg-[#020617]">
                {children}
            </main>
        </div>
    );
}
