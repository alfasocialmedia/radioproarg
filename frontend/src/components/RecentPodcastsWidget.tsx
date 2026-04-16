'use client';
import { useState, useEffect } from 'react';
import { Play, Mic2, Clock } from 'lucide-react';
import Link from 'next/link';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RecentPodcastsWidget({ radioId, slug }: { radioId: string, slug: string }) {
    const [podcasts, setPodcasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPodcasts = async () => {
            try {
                // Asumimos que existe un endpoint de podcasts por radio
                const res = await fetch(`${BACKEND}/api/v1/podcasts/public/episodios/recientes`, {
                    headers: { 'x-tenant': slug }
                });
                const data = await res.json();
                setPodcasts(data || []);
            } catch (e) {
                console.error("Error fetching podcasts:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPodcasts();
    }, [radioId, slug]);

    if (loading) return (
        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/5 rounded w-1/3"></div>
            <div className="space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="flex gap-3">
                        <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-white/5 rounded w-3/4"></div>
                            <div className="h-2 bg-white/5 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (podcasts.length === 0) return (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                <Mic2 className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-[10px] text-slate-500 font-medium italic">No hay podcasts recientes</p>
            </div>
    );

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Podcasts Recientes</h4>
            <div className="space-y-3">
                {podcasts.slice(0, 3).map((item: any) => (
                    <Link 
                        key={item.id} 
                        href={`/radio/${slug}/podcasts/${item.slug}`}
                        className="group flex gap-4 p-2.5 rounded-2xl transition-all hover:bg-white/[0.04] border border-transparent hover:border-white/5"
                    >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 shadow-lg">
                            <img 
                                src={item.podcast?.portadaUrl || '/podcast-placeholder.jpg'} 
                                alt={item.titulo} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h5 
                                className="text-sm font-bold text-white line-clamp-1 transition-colors"
                                style={{ color: 'inherit' }} // El hover se manejará via CSS o simplemente quitando el hardcode
                            >
                                <span className="group-hover:text-[var(--primary)] transition-colors">
                                    {item.titulo}
                                </span>
                            </h5>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {item.duracion || '0h 00m'}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
