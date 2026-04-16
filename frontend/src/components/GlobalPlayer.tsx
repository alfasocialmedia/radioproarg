"use client";

import { usePathname } from 'next/navigation';
import AudioPlayer from './AudioPlayer';
import { usePlayerStore } from '@/store/playerStore';

export default function GlobalPlayer() {
    const pathname = usePathname();
    const isPureRadio = usePlayerStore((state) => state.isPureRadio);

    // El reproductor SOLO aparece en el portal de radio público (/radio/[slug])
    // Se oculta en todas las demás páginas (home, faq, tutoriales, admin, etc.)
    const esPaginaDeRadio = pathname.startsWith('/radio/') && pathname !== '/radio';
    
    if (!esPaginaDeRadio) {
        return null;
    }

    // Le pasamos isHidden para que en caso de emisora PureRadio no se vea la pastilla inferior, 
    // pero mantenga la etiqueta HTML de <audio> disponible.
    return <AudioPlayer isHidden={isPureRadio} />;
}
