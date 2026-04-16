"use client";

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import ProgramModal from '@/components/ProgramModal';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProgramacionPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [programacion, setProgramacion] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<any>(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch(`${BACKEND}/api/v1/programacion`, {
                    headers: { 'x-tenant': slug }
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setProgramacion(Array.isArray(data) ? data : []);
            } catch {
                setProgramacion([]);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [slug]);

    const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 min-h-[60vh]">
            <h1 className="text-3xl md:text-5xl font-black mb-10 flex items-center gap-4 text-white">
                <CalendarDays className="w-10 h-10 text-primary" /> Grilla de Programación
            </h1>
            
            {programacion.length === 0 ? (
                <div className="border border-white/5 rounded-2xl p-10 text-center text-slate-500" style={{ backgroundColor: 'var(--secondary)' }}>
                    No hay programación definida en este momento.
                </div>
            ) : (
                <div className="space-y-10">
                    {DIAS.map((dia, index) => {
                        const diaSemanaInt = index + 1; // 1:Lunes, 7:Domingo
                        const progDelDia = programacion.filter((p: any) => p.diaSemana === diaSemanaInt);
                        if (progDelDia.length === 0) return null;
                        
                        // Ordenar por hora de inicio
                        progDelDia.sort((a: any, b: any) => a.horaInicio.localeCompare(b.horaInicio));
                        
                        return (
                            <div key={dia} className="border-b border-white/5 pb-10 last:border-0">
                                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4 uppercase tracking-wider">{dia}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {progDelDia.map((p: any) => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => setSelectedProgram(p)}
                                            className="backdrop-blur-md rounded-2xl p-4 flex gap-4 items-center group shadow-lg border border-white/5 transition-all hover:bg-white/5 hover:border-primary/30 cursor-pointer"
                                            style={{ backgroundColor: 'var(--secondary)', opacity: 0.9 }}
                                        >
                                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                                                 {p.imagenPrograma 
                                                    ? <img src={p.imagenPrograma} alt={p.nombrePrograma} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> 
                                                    : <div className="w-full h-full flex items-center justify-center"><CalendarDays className="w-8 h-8 text-slate-600" /></div>
                                                 }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-lg text-white group-hover:text-primary transition-colors line-clamp-1">{p.nombrePrograma}</h3>
                                                <div className="flex items-center gap-2 mt-1 mb-1">
                                                    <Clock className="w-3 h-3 text-primary" />
                                                    <span className="text-xs font-mono font-bold text-primary">
                                                        {p.horaInicio} – {p.horaFin}
                                                    </span>
                                                </div>
                                                {p.conductores && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 truncate">
                                                        <Users className="w-3 h-3" />
                                                        <span>{p.conductores}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />
        </div>
    );
}
