"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Newspaper, Headphones, CalendarDays, Radio } from "lucide-react";
import { usePlayerStore } from '@/store/playerStore';

export default function PublicRadioNavbar({ slug, radio, isPureRadio }: { slug: string, radio: any, isPureRadio: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isPlaying, setPlaying } = usePlayerStore();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Evitar scroll cuando el menú móvil está abierto
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [mobileMenuOpen]);

    const links = [
        { name: "Inicio", href: `/radio/${slug}`, icon: Home },
        ...(!isPureRadio ? [{ name: "Noticias", href: `/radio/${slug}/noticias`, icon: Newspaper }] : []),
        { name: "Programación", href: `/radio/${slug}/programacion`, icon: CalendarDays },
        { name: "Podcasts", href: `/radio/${slug}/podcast`, icon: Headphones }
    ];

    const colorPrimario = radio?.colorPrimario || '#3b82f6';
    const togglePlay = () => setPlaying(!isPlaying);

    return (
        <>
            {/* --- TOP NAVBAR --- */}
            <header 
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                    scrolled 
                        ? "backdrop-blur-xl border-b border-white/10 shadow-2xl py-3" 
                        : "bg-black/30 backdrop-blur-md border-b border-white/5 py-4 md:py-5"
                }`}
                style={{ backgroundColor: scrolled ? 'var(--secondary)' : undefined, opacity: 0.95 }}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <nav className="flex items-center justify-between">
                        {/* Logo / Título */}
                        <Link href={`/radio/${slug}`} className="flex items-center gap-2.5 shrink-0 group py-1">
                            {radio?.logoUrl ? (
                                <div className="relative">
                                    <img src={radio.logoUrl} alt={radio.nombre} className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover border-2 border-white/10 group-hover:border-[var(--primary)] transition-all shadow-lg" />
                                    <div className="absolute inset-0 rounded-full bg-[var(--primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ) : (
                                <div 
                                    className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all shadow-inner"
                                    style={{ background: `linear-gradient(135deg, var(--primary), var(--secondary))` }}
                                >
                                    <Radio className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-black text-white text-base md:text-xl tracking-tighter leading-none group-hover:text-[var(--primary)] transition-colors">
                                    {radio?.nombre || slug}
                                </span>
                                <span className="text-[10px] md:text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-0.5 opacity-60">Radio</span>
                            </div>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1 lg:gap-2">
                            {links.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link 
                                        key={item.name} 
                                        href={item.href}
                                        className={`
                                            px-4 py-2 rounded-full text-sm font-bold transition-all relative overflow-hidden group
                                            ${isActive ? "text-white" : "text-slate-300 hover:text-white"}
                                        `}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {item.name}
                                        </span>
                                        {isActive && (
                                            <div 
                                                className="absolute inset-0 opacity-20"
                                                style={{ backgroundColor: 'var(--primary)' }}
                                            />
                                        )}
                                        <div 
                                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                                            style={{ backgroundColor: 'var(--primary)' }}
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Botón Escuchar en Vivo (Desktop) */}
                        <div className="hidden md:flex items-center gap-3">
                            {radio?.streamUrl && (
                                <button 
                                    onClick={togglePlay}
                                    className="px-5 py-2.5 rounded-full text-white text-sm font-black tracking-wide uppercase shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                                    style={{ backgroundColor: 'var(--primary)' }}
                                >
                                    <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-white/50 group-hover:bg-white'} animate-pulse`} />
                                    {isPlaying ? 'Pausar' : 'Radio en Vivo'}
                                </button>
                            )}
                        </div>

                        {/* Hamburguesa (Mobile) */}
                        <button 
                            className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </nav>
                </div>
            </header>

            {/* --- MOBILE DRAWER (Izquierda a Derecha) --- */}
            {/* Overlay Oscuro */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
                    mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menú Lateral */}
            <aside 
                className={`fixed top-0 left-0 h-full w-[280px] border-r border-white/5 shadow-2xl z-50 transform flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] md:hidden ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ backgroundColor: 'var(--secondary)' }}
            >
                {/* Cabecera del Drawer */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {radio?.logoUrl ? (
                            <img src={radio.logoUrl} alt={radio.nombre} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <Radio className="w-5 h-5 text-slate-400" />
                            </div>
                        )}
                        <span className="font-black text-white text-lg truncate">
                            {radio?.nombre || slug}
                        </span>
                    </div>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Enlaces Mobile */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {links.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                                    flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all
                                    ${isActive ? "text-white bg-white/5" : "text-slate-400 hover:text-white hover:bg-white/5"}
                                `}
                            >
                                <Icon className="w-5 h-5 opacity-70" style={{ color: isActive ? 'var(--primary)' : undefined }} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer del Drawer */}
                <div className="p-6 border-t border-white/5">
                    {radio?.streamUrl ? (
                        <button 
                            onClick={() => { togglePlay(); setMobileMenuOpen(false); }}
                            className="w-full py-3.5 rounded-2xl text-white text-sm font-black tracking-widest uppercase shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                            style={{ backgroundColor: 'var(--primary)' }}
                        >
                            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-white/50'} animate-pulse`} />
                            {isPlaying ? 'Pausar Radio' : 'Radio en Vivo'}
                        </button>
                    ) : (
                        <p className="text-xs text-center text-slate-500 font-medium">
                            Streaming no configurado
                        </p>
                    )}
                </div>
            </aside>
        </>
    );
}
