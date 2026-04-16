"use client";

import Link from 'next/link';
import { XCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPagoPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">
                <div className="relative mx-auto w-28 h-28">
                    <div className="relative bg-red-500/10 border-2 border-red-500 w-28 h-28 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-14 h-14 text-red-400" />
                    </div>
                </div>

                <div>
                    <h1 className="text-4xl font-black text-white mb-4">El pago no fue procesado</h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Hubo un problema al acreditar el pago. No se realizó ningún cargo. Podés intentarlo nuevamente con otro método de pago o contactarnos directamente.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/checkout" className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <RefreshCw className="w-4 h-4" /> Reintentar pago
                    </Link>
                    <Link href="/" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Home className="w-4 h-4" /> Ir al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
