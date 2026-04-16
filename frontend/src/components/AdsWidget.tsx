import BannerSlider from './BannerSlider';

export default function AdsWidget({ 
    adImage, 
    link, 
    banners = [], 
    ubicacion = 'SIDEBAR' 
}: { 
    adImage?: string; 
    link?: string; 
    banners?: any[];
    ubicacion?: string;
}) {
    // Si tenemos banners dinámicos del sistema, los priorizamos
    if (banners && banners.length > 0) {
        return (
            <div className="w-full">
                <BannerSlider banners={banners} ubicacion={ubicacion} />
            </div>
        );
    }

    // Fallback: Si no hay banners pero hay una imagen estática (legacy)
    if (!adImage || adImage.trim() === '') return (
        <div className="w-full aspect-square rounded-3xl bg-white/[0.03] border border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center sm:p-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 sm:w-12 sm:h-12 sm:mb-2">
                <span className="text-2xl sm:text-xl">📢</span>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 sm:text-[10px]">Publicidad</p>
            <p className="text-[10px] text-slate-600 italic sm:text-[8px]">Espacio disponible</p>
        </div>
    );

    const AdContent = () => (
        <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl transition-all" style={{ borderColor: 'var(--primary, rgba(255,255,255,0.1))' }}>
            <div className="absolute top-3 left-3 z-10">
                <span className="bg-black/60 backdrop-blur-md text-[8px] font-black text-white/70 px-2 py-1 rounded-md uppercase tracking-widest border border-white/10">
                    Anuncio
                </span>
            </div>
            <img 
                src={adImage} 
                alt="Publicidad" 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {link && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ backgroundColor: 'var(--primary, rgba(255,255,255,0.2))' }}>
                    <span className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        Ver más
                    </span>
                </div>
            )}
        </div>
    );

    if (link) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className="block outline-none">
                <AdContent />
            </a>
        );
    }

    return <AdContent />;
}
