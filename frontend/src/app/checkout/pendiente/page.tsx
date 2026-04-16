"use client";

import Link from 'next/link';
import { Clock, Home, MessageCircle } from 'lucide-react';

export default function PendientePagoPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">
                <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse opacity-60" />
                    <div className="relative bg-yellow-500/10 border-2 border-yellow-500 w-28 h-28 rounded-full flex items-center justify-center">
                        <Clock className="w-14 h-14 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                </div>

                <div>
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        PAGO PENDIENTE
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Tu pago está siendo procesado</h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        El pago está pendiente de acreditación. Esto puede tardar entre <strong className="text-white">unos minutos y 1 día hábil</strong> dependiendo del método elegido. Te notificaremos por email cuando se acredite.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Home className="w-4 h-4" /> Ir al inicio
                    </Link>
                    <a
                        href="https://wa.me/549XXXXXXXXXX?text=Hola, hice un pago en ONRADIO y está pendiente."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <MessageCircle className="w-4 h-4" /> Consultar estado
                    </a>
                </div>
            </div>
        </div>
    );
}
