"use client";

import { CalendarDays, Facebook, Instagram, Twitter, MessageCircle, X, Users, Clock } from 'lucide-react';

interface ProgramModalProps {
    program: any;
    onClose: () => void;
}

export default function ProgramModal({ program, onClose }: ProgramModalProps) {
    if (!program) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                {/* Botón de Cierre */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Imagen (Lado izquierdo en desktop, arriba en mobile) */}
                <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden bg-black/20">
                    {program.imagenPrograma ? (
                        <img 
                            src={program.imagenPrograma} 
                            alt={program.nombrePrograma} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-700">
                            <CalendarDays className="w-16 h-16" />
                        </div>
                    )}
                </div>

                {/* Contenido (Lado derecho) */}
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">
                            <Clock className="w-3 h-3" />
                            {program.horaInicio} – {program.horaFin}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                            {program.nombrePrograma}
                        </h2>
                        {program.conductores && (
                            <p className="text-lg text-slate-400 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500/60" />
                                con {program.conductores}
                            </p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="flex-1 mb-8 overflow-y-auto max-h-[150px] custom-scrollbar pr-2">
                        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                            {program.descripcion || 'Sin descripción detallada por el momento.'}
                        </p>
                    </div>

                    {/* Redes Sociales y Contacto */}
                    <div className="mt-auto border-t border-white/5 pt-6 flex flex-wrap gap-4 items-center">
                        {program.whatsapp && (
                            <a 
                                href={`https://wa.me/${program.whatsapp.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-green-500/20 hover:-translate-y-1"
                                title="Enviar mensaje al programa"
                            >
                                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                            </a>
                        )}
                        {program.facebook && (
                            <a 
                                href={program.facebook.startsWith('http') ? program.facebook : `https://facebook.com/${program.facebook}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-1"
                            >
                                <Facebook className="w-6 h-6" />
                            </a>
                        )}
                        {program.instagram && (
                            <a 
                                href={program.instagram.startsWith('http') ? program.instagram : `https://instagram.com/${program.instagram}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 hover:opacity-90 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-pink-500/20 hover:-translate-y-1"
                            >
                                <Instagram className="w-6 h-6" />
                            </a>
                        )}
                        {program.twitter && (
                            <a 
                                href={program.twitter.startsWith('http') ? program.twitter : `https://x.com/${program.twitter}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white border border-white/10 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:-translate-y-1"
                            >
                                <Twitter className="w-5 h-5 fill-current" />
                            </a>
                        )}
                        
                        <div className="ml-auto hidden sm:block">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Sintonizá ahora</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.4);
                }
            `}</style>
        </div>
    );
}
