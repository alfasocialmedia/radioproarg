"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Radio, Home, MessageCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function ExitoContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'audio';
    const ciclo = searchParams.get('ciclo') || 'mensual';

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* Animación de éxito */}
                <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-60" />
                    <div className="relative bg-green-500/10 border-2 border-green-500 w-28 h-28 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-14 h-14 text-green-400" />
                    </div>
                </div>

                <div>
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        ¡PAGO APROBADO!
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">¡Tu radio está en camino!</h1>
                    <p className="text-slate-400 leading-relaxed text-lg">
                        Tu pago fue acreditado exitosamente. En los próximos <strong className="text-white">minutos</strong> recibirás un email con los accesos a tu nuevo panel de control.
                    </p>
                </div>

                <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 text-left space-y-4">
                    <h2 className="font-bold text-white">¿Qué sigue a continuación?</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 text-sm font-black flex items-center justify-center shrink-0">1</div>
                            <span className="text-slate-300 text-sm">Revisá tu email — te enviamos los datos de acceso</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-sm font-black flex items-center justify-center shrink-0">2</div>
                            <span className="text-slate-300 text-sm">Un técnico activará tu señal en hasta 24 horas hábiles</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 text-sm font-black flex items-center justify-center shrink-0">3</div>
                            <span className="text-slate-300 text-sm">Te contactamos por WhatsApp para guiarte en el arranque</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Home className="w-4 h-4" /> Volver al inicio
                    </Link>
                    <a
                        href="https://wa.me/549XXXXXXXXXX?text=¡Hola! Acabo de contratar el plan ONRADIO y quiero empezar."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
                    </a>
                </div>

                <p className="text-slate-600 text-xs flex items-center justify-center gap-1">
                    <Radio className="w-4 h-4" /> ONRADIO.com.ar — La plataforma #1 para emisoras online
                </p>
            </div>
        </div>
    );
}

export default function ExitoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-10 h-10 text-green-500 animate-spin" /></div>}>
            <ExitoContent />
        </Suspense>
    );
}
