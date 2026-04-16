"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
    id: string;
    imagenUrl: string;
    urlDestino?: string;
    mostrarMobile: boolean;
    mostrarEscritorio: boolean;
}

interface Props {
    banners: Banner[];
    ubicacion: string;
}

export default function BannerSlider({ banners, ubicacion }: Props) {
    const [index, setIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Filtrar banners según el dispositivo actual
    const displayBanners = banners.filter(b => 
        (isMobile && b.mostrarMobile) || (!isMobile && b.mostrarEscritorio)
    );

    useEffect(() => {
        if (displayBanners.length <= 1) {
            setIndex(0); // Reset index if list changes
            return;
        }
        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % displayBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [displayBanners.length]);

    if (displayBanners.length === 0) return null;

    const handleNext = () => setIndex((index + 1) % displayBanners.length);
    const handlePrev = () => setIndex((index - 1 + displayBanners.length) % displayBanners.length);

    return (
        <div className="relative group w-full overflow-hidden rounded-xl border border-white/10 hover:border-white/20 transition-all shadow-lg shadow-black/40 bg-black/20">
            <div className="relative w-full overflow-hidden">
                {displayBanners.map((b, i) => (
                    <div
                        key={b.id}
                        className={`transition-opacity duration-1000 ${i === index ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                    >
                        <a 
                            href={b.urlDestino || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block w-full"
                        >
                            <img 
                                src={b.imagenUrl} 
                                alt="Publicidad" 
                                className={`w-full h-auto object-contain bg-black/5 ${ubicacion === 'SIDEBAR' ? 'aspect-square md:aspect-auto' : 'max-h-[300px]'}`} 
                            />
                        </a>
                    </div>
                ))}
            </div>
            
            {displayBanners.length > 1 && (

                <>
                    <button 
                        onClick={handlePrev} 
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleNext} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {displayBanners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-orange-500 w-3' : 'bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>

                </>
            )}
        </div>
    );
}
