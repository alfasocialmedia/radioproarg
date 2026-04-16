import Link from 'next/link';
import { Newspaper, ChevronRight } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getNoticias(slug: string) {
    try {
        const res = await fetch(`${BACKEND}/api/v1/noticias?page=1&limit=30`, {
            headers: { 'x-tenant': slug },
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.noticias || []);
    } catch { return []; }
}

export default async function NoticiasPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const noticias = await getNoticias(slug);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-[60vh]">
            <h1 className="text-3xl md:text-5xl font-black mb-10 flex items-center gap-4">
                <Newspaper className="w-10 h-10 text-primary" /> Noticias
            </h1>

            {noticias.length === 0 ? (
                <div className="border border-white/5 rounded-2xl p-10 text-center text-slate-500" style={{ backgroundColor: 'var(--secondary)' }}>
                    No hay noticias publicadas.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {noticias.map((n: any) => (
                        <Link key={n.id} href={`/radio/${slug}/noticias/${n.slug}`} className="group flex flex-col border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300" style={{ backgroundColor: 'var(--secondary)' }}>
                            <div className="w-full aspect-[16/10] bg-slate-800 relative overflow-hidden shrink-0">
                                {n.imagenDestacada
                                    ? <img src={n.imagenDestacada} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-8 h-8 text-slate-600" /></div>
                                }
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h2 className="font-bold text-white text-xl line-clamp-3 group-hover:text-primary transition-colors leading-tight mb-3">{n.titulo}</h2>
                                {n.copete && <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed mb-4">{n.copete}</p>}
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                        {new Date(n.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    <span className="text-xs font-bold text-primary group-hover:opacity-80 flex items-center gap-1 transition-opacity">
                                        Leer más <ChevronRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
