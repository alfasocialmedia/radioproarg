"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, PlayCircle, ExternalLink, Clock, Loader2 } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const DEFAULT_TUTORIALES = [
    {
        titulo: 'Primeros pasos con ONRADIO',
        descripcion: 'Aprendé cómo configurar tu radio desde cero, instalar el software de transmisión y conectarte al servidor por primera vez.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duracion: '12 min',
        categoria: 'Inicio',
        dificultad: 'Básico',
    },
    {
        titulo: 'Cómo configurar BUTT para transmitir',
        descripcion: 'Guía paso a paso para configurar BUTT (Broadcast Using This Tool) con tu servidor de streaming de ONRADIO.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duracion: '8 min',
        categoria: 'Transmisión',
        dificultad: 'Básico',
    },
    {
        titulo: 'AutoDJ: subir música y crear playlists',
        descripcion: 'Cómo subir tu biblioteca musical por FTP y configurar el AutoDJ para que tu radio transmita incluso cuando no estés en vivo.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duracion: '15 min',
        categoria: 'AutoDJ',
        dificultad: 'Intermedio',
    },
    {
        titulo: 'Publicar noticias en tu portal',
        descripcion: 'Usá el CMS integrado de ONRADIO para crear artículos, agregar imágenes y publicar noticias de tu radio en minutos.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duracion: '10 min',
        categoria: 'CMS',
        dificultad: 'Básico',
    },
    {
        titulo: 'SEO para tu portal de radio',
        descripcion: 'Optimizá tus artículos y noticias para aparecer en los primeros resultados de Google con los campos SEO integrados.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duracion: '18 min',
        categoria: 'CMS',
        dificultad: 'Avanzado',
    },
    {
        titulo: 'Administrar la publicidad de tu radio',
        descripcion: 'Cómo agregar auspiciantes, crear banners y configurar las posiciones de publicidad en tu portal de radio.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duracion: '20 min',
        categoria: 'Publicidad',
        dificultad: 'Intermedio',
    },
];

const DIFICULTAD_COLOR: Record<string, string> = {
    Básico: 'text-green-400 bg-green-500/10 border-green-500/20',
    Intermedio: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Avanzado: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function TutorialesPage() {
    const [tutoriales, setTutoriales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtrotCat, setFiltrocat] = useState('TODOS');

    useEffect(() => {
        api.get('/tutoriales')
            .then(r => setTutoriales(r.data.length > 0 ? r.data : DEFAULT_TUTORIALES))
            .catch(() => setTutoriales(DEFAULT_TUTORIALES))
            .finally(() => setLoading(false));
    }, []);

    const categorias = ['TODOS', ...new Set(tutoriales.map(t => t.categoria))];
    const filtrados = filtrotCat === 'TODOS' ? tutoriales : tutoriales.filter(t => t.categoria === filtrotCat);

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <PublicNavbar />
            {/* Hero */}
            <div className="bg-gradient-to-b from-[#0f172a] to-[#020617] pt-32 pb-16 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full text-purple-400 text-sm font-bold mb-6">
                    <BookOpen className="w-4 h-4" /> Base de Conocimiento
                </div>
                <h1 className="text-4xl lg:text-5xl font-black mb-4">
                    Tutoriales <span className="text-purple-400">& Guías</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Todo lo que necesitás saber para sacar el máximo provecho de tu radio con ONRADIO.
                </p>
            </div>

            {/* Filtros por categoría */}
            <div className="max-w-6xl mx-auto px-4 mb-8">
                <div className="flex flex-wrap gap-2 justify-center">
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFiltrocat(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${filtrotCat === cat ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'text-slate-500 border-white/5 hover:text-white hover:border-white/15'}`}
                        >
                            {cat === 'TODOS' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de tutoriales */}
            <div className="max-w-6xl mx-auto px-4 pb-24">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtrados.map((t, i) => (
                            <div key={i} className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/20 hover:-translate-y-1 transition-all group">
                                {/* Thumbnail con play */}
                                <div className="relative aspect-video bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlayCircle className="w-8 h-8 text-purple-400" />
                                    </div>
                                    {t.duracion && (
                                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {t.duracion}
                                        </span>
                                    )}
                                </div>
                                {/* Contenido */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg">{t.categoria}</span>
                                        {t.dificultad && (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${DIFICULTAD_COLOR[t.dificultad] || DIFICULTAD_COLOR.Básico}`}>{t.dificultad}</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">{t.titulo}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">{t.descripcion}</p>
                                    {t.videoUrl && (
                                        <a
                                            href={t.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors"
                                        >
                                            <PlayCircle className="w-4 h-4" /> Ver tutorial <ExternalLink className="w-3 h-3 ml-auto" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <PublicFooter />
        </div>
    );
}
