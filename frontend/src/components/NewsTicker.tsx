"use client";

interface NewsTickerProps {
    noticias: { titulo: string; slug: string }[];
    slug: string;
}

export default function NewsTicker({ noticias, slug }: NewsTickerProps) {
    if (!noticias || noticias.length === 0) return null;

    // Duplicamos para que el loop sea continuo
    const textos = [...noticias, ...noticias];

    return (
        <div className="md:hidden w-full overflow-hidden flex items-center gap-0 h-8 relative" style={{ backgroundColor: 'var(--secondary)' }}>
            
            {/* Badge "ÚLTIMO" */}
            <div 
                className="shrink-0 z-10 h-full flex items-center px-3 text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap"
                style={{ backgroundColor: 'var(--primary)' }}
            >
                Último
            </div>

            {/* Cinta deslizante */}
            <div className="relative flex-1 h-full overflow-hidden">
                {/* Fade izquierda */}
                <div 
                    className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
                    style={{ background: `linear-gradient(to right, var(--secondary), transparent)` }}
                />
                {/* Fade derecha */}
                <div 
                    className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
                    style={{ background: `linear-gradient(to left, var(--secondary), transparent)` }}
                />

                <div className="flex items-center h-full animate-ticker whitespace-nowrap">
                    {textos.map((n, i) => (
                        <a 
                            key={i}
                            href={`/radio/${slug}/noticias/${n.slug}`}
                            className="inline-flex items-center gap-3 pl-4 text-[11px] font-semibold text-white/80 hover:text-white transition-colors"
                        >
                            <span 
                                className="w-1 h-1 rounded-full shrink-0 opacity-60"
                                style={{ backgroundColor: 'var(--primary)' }}
                            />
                            {n.titulo}
                        </a>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes ticker {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker ${Math.max(noticias.length * 6, 24)}s linear infinite;
                }
            `}</style>
        </div>
    );
}
