import Link from 'next/link';
import {
    ArrowLeft, CalendarDays, Share2, Radio, Newspaper
} from 'lucide-react';
import ReactionButtons from '@/components/ReactionButtons';
import PollWidget from '@/components/PollWidget';
import CurrencyWidget from '@/components/CurrencyWidget';
import RecentPodcastsWidget from '@/components/RecentPodcastsWidget';
import AdsWidget from '@/components/AdsWidget';
import ShareButtons from '@/components/ShareButtons';
import { Metadata } from 'next';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Props = {
    params: { slug: string; noticiaSlug: string }
};

// Generamos meta tags para OG (Facebook/WhatsApp) y Twitter Cards automáticamente
export async function generateMetadata({ params }: { params: Promise<{ slug: string; noticiaSlug: string }> }): Promise<Metadata> {
    const { slug, noticiaSlug } = await params;
    try {
        const res = await fetch(`${BACKEND}/api/v1/noticias/${noticiaSlug}`, {
            headers: { 'x-tenant': slug },
            cache: 'no-store'
        });
        const noticia = await res.json();
        
        if (!noticia || !noticia.id) return { title: 'Noticia no encontrada' };

        const title = noticia.titulo;
        const description = noticia.copete || "📰 Lee esta noticia completa en nuestro portal.";
        
        // Tratar de buscar la imagen, si es relativa o vacía asignar algo por defecto
        const ogImage = noticia.imagenDestacada || '/og-default.jpg';
        
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
                type: 'article',
                publishedTime: noticia.fechaCreacion,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [ogImage],
            }
        };
    } catch {
        return { title: 'Noticia' };
    }
}

export default async function DetalleNoticiaPage({ params }: { params: Promise<{ slug: string; noticiaSlug: string }> }) {
    const { slug, noticiaSlug } = await params;
    let radio = null;
    let noticia = null;
    try {
        const [noticiaRes, radioRes, bannersRes] = await Promise.all([
            fetch(`${BACKEND}/api/v1/noticias/${noticiaSlug}`, {
                headers: { 'x-tenant': slug },
                cache: 'no-store'
            }),
            fetch(`${BACKEND}/api/v1/radios/config`, {
                headers: { 'x-tenant': slug },
                cache: 'no-store'
            }),
            fetch(`${BACKEND}/api/v1/publicidad/banners`, {
                headers: { 'x-tenant': slug },
                cache: 'no-store'
            })
        ]);
        
        noticia = await noticiaRes.json();
        radio = await radioRes.json();
        const banners = await bannersRes.json();
        const sidebarBanners = Array.isArray(banners) ? banners.filter((b: any) => b.ubicacion && b.ubicacion.toUpperCase() === 'SIDEBAR') : [];
    } catch (e) {
        console.error("Error fetching noticia data:", e);
    }

    const activeWidgets = radio?.configSidebar && Array.isArray(radio.configSidebar) 
        ? radio.configSidebar.filter((w: any) => w.enabled)
        : [];

    if (!noticia || !noticia.id) return (
        <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] gap-4 text-slate-400">
            <Newspaper className="w-12 h-12 text-slate-600" />
            <p>La nota no fue encontrada.</p>
            <Link href={`/radio/${slug}`} className="text-slate-400 hover:text-white transition-colors text-sm">
                ← Volver a la radio
            </Link>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pt-28 pb-16">
            {/* Breadcrumb - Siempre arriba */}
            <div className="mb-8">
                <Link href={`/radio/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver a la emisora
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Columna Principal: Contenido de la Nota */}
                <article className="flex-1 min-w-0">
                    {/* Imagen */}
                    {noticia.imagenDestacada && (
                        <div className="w-full h-64 sm:h-96 rounded-3xl overflow-hidden mb-10 shadow-2xl shadow-black/40 border border-white/5">
                            <img src={noticia.imagenDestacada} alt={noticia.titulo} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Header */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6 text-white tracking-tight">
                        {noticia.titulo}
                    </h1>
                    
                    {noticia.copete && (
                        <p className="text-xl text-slate-400 leading-relaxed mb-8 font-medium italic border-l-4 border-primary/40 pl-6">
                            {noticia.copete}
                        </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest mb-10 pb-6 border-b border-white/5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>
                            {new Date(noticia.fechaCreacion).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Cuerpo HTML */}
                    <div
                        className="max-w-none text-lg text-slate-300 leading-relaxed
                            [&>p]:mb-6 [&>p]:mt-2
                            [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-white [&>h2]:mt-10 [&>h2]:mb-4
                            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-3
                            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
                            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
                            [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:text-slate-400
                            [&>img]:rounded-2xl [&>img]:my-8 [&>img]:w-full [&>img]:object-cover 
                            [&>a]:text-primary hover:[&>a]:underline"
                        dangerouslySetInnerHTML={{ __html: noticia.contenidoHtml }}
                    />

                    {/* ── BOTONES DE COMPARTIR ── */}
                    <div className="mt-16 pt-10 border-t border-white/5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Compartir esta nota
                        </p>
                        <ShareButtons noticiaId={noticia.id} titulo={noticia.titulo} />
                    </div>

                    {/* ── BOTONES DE REACCIÓN ── */}
                    <div className="mt-12 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <h3 className="text-lg font-black text-white mb-6">¿Qué te pareció esta nota?</h3>
                        <ReactionButtons 
                            noticiaId={noticia.id} 
                            initialStats={{
                                votosMeEncanto: noticia.votosMeEncanto || 0,
                                votosInteresante: noticia.votosInteresante || 0,
                                votosRegular: noticia.votosRegular || 0,
                                votosNoMeGusto: noticia.votosNoMeGusto || 0,
                            }} 
                        />
                    </div>

                    {/* Widgets en Móvil (Visible solo si no es desktop) */}
                    <div className="mt-12 lg:hidden space-y-8">
                        {activeWidgets.length > 0 ? (
                            activeWidgets.map((widget: any) => {
                                if (widget.id === 'polls') return <PollWidget key={widget.id} noticiaId={noticia.id} radioId={noticia.radioId} />;
                                if (widget.id === 'currency') return <div key={widget.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"><CurrencyWidget type={widget.type || 'blue'} /></div>;
                                return null;
                            })
                        ) : (
                            <PollWidget noticiaId={noticia.id} radioId={noticia.radioId} />
                        )}
                    </div>
                </article>

                {/* Columna Lateral: Sidebar */}
                <aside className="hidden lg:block w-[350px] shrink-0">
                    <div className="sticky top-28 space-y-8">
                        {activeWidgets.length > 0 ? (
                            activeWidgets.map((widget: any) => {
                                if (widget.id === 'polls') {
                                    return (
                                        <div key={widget.id} className="bg-white/[0.02] border border-white/10 rounded-3xl p-1 overflow-hidden shadow-2xl">
                                            <PollWidget noticiaId={noticia.id} radioId={noticia.radioId} />
                                        </div>
                                    );
                                }
                                if (widget.id === 'ads') {
                                    return (
                                        <div key={widget.id}>
                                            <AdsWidget 
                                                adImage={radio.adSquare} 
                                                banners={sidebarBanners} 
                                            />
                                        </div>
                                    );
                                }
                                if (widget.id === 'currency') {
                                    return (
                                        <div key={widget.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                             <CurrencyWidget type={widget.type || 'blue'} />
                                        </div>
                                    );
                                }
                                if (widget.id === 'podcasts') {
                                    return (
                                        <div key={widget.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
                                            <RecentPodcastsWidget radioId={radio.id} slug={slug} />
                                        </div>
                                    );
                                }
                                return null;
                            })
                        ) : (
                            <>
                                {/* Default Sidebar si no hay widgets activos */}
                                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-1 overflow-hidden shadow-2xl">
                                    <PollWidget noticiaId={noticia.id} radioId={noticia.radioId} />
                                </div>

                                <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-white/5">
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">Escuchanos ahora</h4>
                                    <p className="text-xs text-slate-400 mb-4">La mejor música las 24 horas del día.</p>
                                    <Link 
                                        href={`/radio/${slug}`}
                                        className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                                    >
                                        <Radio className="w-4 h-4" /> Ir al vivo
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
