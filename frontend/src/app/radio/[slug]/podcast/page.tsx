import Link from 'next/link';
import { Headphones, Layers, ChevronRight } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getProgramas(slug: string) {
    try {
        const res = await fetch(`${BACKEND}/api/v1/podcasts/public`, {
            headers: { 'x-tenant': slug },
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch { return []; }
}

export default async function PodcastsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const programas = await getProgramas(slug);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-[60vh]">
            <h1 className="text-3xl md:text-5xl font-black mb-3 flex items-center gap-4">
                <Headphones className="w-10 h-10 text-primary" /> Podcasts On-Demand
            </h1>
            <p className="text-slate-400 mb-10 text-base">Escuchá nuestros programas y episodios grabados cuando quieras.</p>

            {programas.length === 0 ? (
                <div className="border border-white/5 rounded-2xl p-10 text-center text-slate-500" style={{ backgroundColor: 'var(--secondary)' }}>
                    <Headphones className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No hay programas disponibles en este momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {programas.map((p: any) => (
                        <Link
                            key={p.id}
                            href={`/radio/${slug}/podcast/${p.id}`}
                            className="group bg-[#0f172a] border border-white/5 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col"
                        >
                            {/* Portada */}
                            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                                {p.portadaUrl ? (
                                    <img
                                        src={p.portadaUrl}
                                        alt={p.titulo}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Headphones className="w-16 h-16 text-slate-700" />
                                    </div>
                                )}
                                {/* Overlay botón */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/50">
                                        <ChevronRight className="w-7 h-7 text-white ml-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h2 className="font-bold text-white text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">{p.titulo}</h2>
                                {p.descripcion && (
                                    <p className="text-sm text-slate-400 mt-1 line-clamp-2 flex-1">{p.descripcion}</p>
                                )}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                        <Layers className="w-3.5 h-3.5" />
                                        {p._count?.episodios ?? 0} Episodios
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium group-hover:text-primary transition-colors">Ver todos →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
