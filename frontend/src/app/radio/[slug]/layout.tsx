import { Metadata } from 'next';
import PublicRadioNavbar from '@/components/PublicRadioNavbar';
import GlobalPlayer from '@/components/GlobalPlayer';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    
    try {
        const res = await fetch(`${BACKEND}/api/v1/radios/config`, {
            headers: { 'x-tenant': slug },
            cache: 'no-store'
        });
        if (!res.ok) return { title: `Radio ${slug}` };
        
        const data = await res.json();
        
        return {
            title: data.metaTitulo || data.nombre || `Emisora ${slug}`,
            description: data.metaDescripcion || 'Las mejores transmisiones en vivo.',
            icons: {
                icon: data.faviconUrl || data.logoUrl || '/globe.svg',
                shortcut: data.faviconUrl || data.logoUrl || '/globe.svg',
                apple: data.faviconUrl || data.logoUrl || '/globe.svg',
            },
            openGraph: {
                title: data.metaTitulo || data.nombre || `Emisora ${slug}`,
                description: data.metaDescripcion || 'Las mejores transmisiones en vivo.',
                url: `/radio/${slug}`,
                siteName: data.nombre || `Emisora ${slug}`,
                images: data.ogImagenUrl ? [{ url: data.ogImagenUrl, width: 1200, height: 630 }] : [],
                locale: 'es_AR',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: data.metaTitulo || data.nombre || `Emisora ${slug}`,
                description: data.metaDescripcion || 'Las mejores transmisiones en vivo.',
                images: data.ogImagenUrl ? [data.ogImagenUrl] : [],
            }
        };
    } catch (e) {
        return { title: `Radio ${slug}` };
    }
}

async function getRadioConfig(slug: string) {
    try {
        const res = await fetch(`${BACKEND}/api/v1/radios/config`, {
            headers: { 'x-tenant': slug },
            cache: 'no-store' // Sin caché para actualizaciones instantáneas
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error cargando layout radio:", error);
        return null;
    }
}

export default async function RadioLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    // Resolvemos la promesa params de Next 15
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const radio = await getRadioConfig(slug);
    
    const colorPrimario = radio?.colorPrimario || '#64748b'; // Slate 500
    const colorSecundario = radio?.colorSecundario || '#0f172a'; // Slate 900
    const fontFamily = radio?.fontFamily || 'inter';
    
    const fontMap: Record<string, string> = {
        inter: 'Inter, sans-serif',
        outfit: 'Outfit, sans-serif',
        roboto: 'Roboto, sans-serif',
        merriweather: 'Merriweather, Georgia, serif',
    };

    const isPureRadio = radio?.plan && radio.plan.tieneCMS === false;

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };

    const dynamicStyles = {
        '--primary': colorPrimario,
        '--primary-rgb': hexToRgb(colorPrimario.startsWith('#') ? colorPrimario : '#64748b'),
        '--secondary': colorSecundario,
        '--secondary-rgb': hexToRgb(colorSecundario.startsWith('#') ? colorSecundario : '#0f172a'),
        '--color-botones': radio?.colorBotones || colorPrimario,
        '--color-textos': radio?.colorTextos || '#ffffff',
        '--player-bg': radio?.playerColor || '#0f172a',
        '--player-image': radio?.playerImagenUrl ? `url(${radio.playerImagenUrl})` : 'none',
        '--player-blur': `${radio?.playerBlur || 0}px`,
        '--font-main': fontMap[fontFamily],
        fontFamily: 'var(--font-main)',
    } as any;

    return (
        <div 
            className="min-h-screen text-white relative transition-none"
            id="radio-portal-root"
            style={{ ...dynamicStyles, backgroundColor: 'var(--secondary)' }}
        >
            {/* Imagen de Fondo Dedicada (Solo Audio) */}
            {isPureRadio && radio?.fondoPlayerUrl && (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-fixed opacity-40 pointer-events-none"
                    style={{ backgroundImage: `url(${radio.fondoPlayerUrl})` }}
                />
            )}

            {/* Fondo de Emisora Desenfocado Constante (Solo Portal) */}
            {!isPureRadio && radio?.logoUrl && (
                <div 
                    className="absolute inset-0 z-0 opacity-10 bg-cover bg-center bg-fixed pointer-events-none mix-blend-screen"
                    style={{ backgroundImage: `url(${radio.logoUrl})`, filter: 'blur(120px)' }}
                />
            )}
            
            {/* Gradiente global sutil */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ 
                    background: isPureRadio 
                        ? `linear-gradient(180deg, transparent 0%, var(--secondary) 90%)` 
                        : `linear-gradient(180deg, ${colorPrimario}10 0%, var(--secondary) 60%, var(--secondary) 100%)` 
                }}
            />

            <div className="relative z-10 flex flex-col min-h-screen">
                <PublicRadioNavbar slug={slug} radio={radio} isPureRadio={isPureRadio} />
                
                <main className="flex-1 w-full pt-20 md:pt-24">
                    {children}
                </main>

                <footer className="w-full py-8 mt-auto text-center border-t border-white/5 backdrop-blur-md" style={{ backgroundColor: 'var(--secondary)', opacity: 0.95 }}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                        Potenciado por <a href="/" className="text-white hover:text-slate-300 transition-colors">OnRadio 2026</a>
                    </p>
                </footer>
                
                <GlobalPlayer />

                {/* Botón Flotante de WhatsApp */}
                {radio?.whatsapp && (
                    <a
                        href={`https://wa.me/${radio.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-50 bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_4px_25px_rgba(37,211,102,0.6)] transition-all flex items-center justify-center group"
                        aria-label="Contactar por WhatsApp"
                    >
                        <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.299-.018-.461.13-.611.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
}
