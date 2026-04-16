"use client";

import { Heart, Coffee } from "lucide-react";

interface DonationsWidgetProps {
    radioName: string;
    mercadoPagoLink?: string;
    paypalLink?: string;
}

export default function DonationsWidget({ radioName, mercadoPagoLink, paypalLink }: DonationsWidgetProps) {
    if (!mercadoPagoLink && !paypalLink) return null;

    return (
        <div className="glass-panel w-full rounded-2xl p-6 relative overflow-hidden group">
            {/* Elementos Decorativos de Fondo */}
            <div 
                className="absolute top-[-50%] right-[-10%] w-[100px] h-[100px] rounded-full blur-[40px] pointer-events-none transition-colors" 
                style={{ backgroundColor: 'var(--primary)', opacity: 0.2 }}
            />
            <div 
                className="absolute bottom-[-20%] left-[-20%] w-[80px] h-[80px] rounded-full blur-[30px] pointer-events-none" 
                style={{ backgroundColor: 'var(--secondary)', opacity: 0.2 }}
            />

            <div className="relative z-10 text-center space-y-4">
                <div 
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: 'var(--primary)15' }}
                >
                    <Heart className="w-6 h-6 animate-pulse" style={{ color: 'var(--primary)' }} />
                </div>

                <h3 className="font-bold text-lg text-foreground">
                    Apoya a {radioName}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Tu contribución nos ayuda a mantener esta radio independiente y libre de interrupciones.
                </p>

                <div className="grid grid-cols-1 gap-3 pt-2">
                    {mercadoPagoLink && (
                        <a
                            href={mercadoPagoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#009EE3] hover:bg-[#009EE3]/90 text-white font-bold py-3 px-4 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#009EE3]/20"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M14.63 12.35l-3.32 1.94c-.6.35-1.02.7-1.16 1.16-.09.31-.07.72.07 1.04.14.3.44.56.77.67.24.09.52.1.75.02.2-.07.38-.2.53-.35.13-.15.22-.32.22-.53 0-.17-.05-.33-.14-.46l3.3-1.93c.42.5.7 1.13.78 1.83.08.7-.06 1.4-.38 2.03-.3.6-.74 1.12-1.3 1.48-.56.36-1.2.56-1.85.6-.66.02-1.32-.1-1.93-.38-.6-.26-1.12-.67-1.5-1.18-.4-.5-.65-1.1-.73-1.74-.08-.65.04-1.3.3-1.88.27-.58.68-1.08 1.2-1.46L14.63 12.35zM9.4 11.6l3.32-1.94c.6-.35 1.02-.7 1.16-1.16.09-.3.07-.72-.07-1.04-.14-.3-.44-.56-.77-.67-.24-.09-.52-.1-.75-.02-.2.07-.38.2-.53.35-.13.15-.22.32-.22.53 0 .17.05.33.14.46L8.38 10.02c-.42-.5-.7-1.13-.78-1.83-.08-.7.06-1.4.38-2.03.3-.6.74-1.12 1.3-1.48.56-.36 1.2-.56 1.85-.6.66-.02 1.32.1 1.93.38.6.26 1.12.67 1.5 1.18.4.5.65 1.1.72 1.74.08.65-.04 1.3-.3 1.88-.27.58-.68 1.08-1.2 1.46L9.4 11.6z" /></svg>
                            Donar con MercadoPago
                        </a>
                    )}
                    {paypalLink && (
                        <a
                            href={paypalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#003087] hover:bg-[#002263] text-white font-bold py-3 px-4 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#003087]/20"
                        >
                            <Coffee className="w-5 h-5" />
                            Invitanos un Café (PayPal)
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
