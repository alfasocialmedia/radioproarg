"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { HelpCircle, ChevronDown, ChevronUp, Search, Loader2, Sparkles, Send, Bot, User, X, MessageCircle } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

interface Mensaje {
    rol: 'user' | 'ia';
    texto: string;
}

const SUGERENCIAS = [
    '¿Qué incluye el Plan Portal?',
    '¿Cómo configuro BUTT para transmitir?',
    '¿Cuánto almacenamiento tengo?',
    '¿Cómo funciona el AutoDJ?',
    '¿Se pueden cambiar los planes?',
];

export default function FaqPage() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [abierto, setAbierto] = useState<number | null>(null);

    // Chat IA
    const [chatAbierto, setChatAbierto] = useState(true);
    const [mensajes, setMensajes] = useState<Mensaje[]>([
        { rol: 'ia', texto: '¡Hola! Soy el asistente virtual de ONRADIO 🎙️\nPodés preguntarme sobre planes, configuración técnica, funcionalidades y más. ¿En qué puedo ayudarte?' }
    ]);
    const [input, setInput] = useState('');
    const [pensando, setPensando] = useState(false);
    const mensajesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.get('/faq')
            .then(r => setFaqs(r.data))
            .catch(() => {
                setFaqs([
                    { pregunta: '¿Qué necesito para empezar a transmitir?', respuesta: 'Solo necesitás un micrófono, una computadora y tu cuenta ONRADIO activa. Usá cualquier software de streaming (BUTT, Mixxx, o Zara Radio) con las credenciales que te enviamos.' },
                    { pregunta: '¿Cuál es la diferencia entre el Plan Audio y el Plan Portal?', respuesta: 'El Plan Audio incluye transmisión, panel de control y estadísticas. El Plan Portal agrega portal web completo, noticias, podcasts, publicidad, encuestas y mucho más.' },
                    { pregunta: '¿Puedo cambiar de plan más adelante?', respuesta: 'Sí. Podés upgradear o degradar tu plan en cualquier momento desde el panel de administración.' },
                    { pregunta: '¿Los pagos son seguros?', respuesta: 'Sí. Procesamos todos los pagos a través de MercadoPago, plataforma líder en seguridad de pagos en Latinoamérica.' },
                    { pregunta: '¿Qué pasa si supero el límite de oyentes?', respuesta: 'El sistema soporta picos temporales. Si tu radio crece consistentemente, te recomendamos upgradear para garantizar la mejor experiencia.' },
                    { pregunta: '¿Cómo configuro el AutoDJ?', respuesta: 'Usá las credenciales FTP para subir música al servidor. Desde SonicPanel configurás listas de reproducción y horarios de transmisión automática.' },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, chatAbierto]);

    const enviarPregunta = async (preguntaTexto?: string) => {
        const texto = (preguntaTexto ?? input).trim();
        if (!texto || pensando) return;

        // No enviamos `setMensajes` todavía a la API desde el state actual porque React es asíncrono
        const nuevoHistorial = [...mensajes, { rol: 'user', texto }];
        
        setMensajes(nuevoHistorial as Mensaje[]);
        setInput('');
        setPensando(true);

        try {
            const start = Date.now();
            const res = await api.post('/faq/ask-ai', { 
                pregunta: texto,
                historial: mensajes // No pasamos el último todavía, el backend sólo recibe el historial "viejo" para dar contexto
            });
            const data = res.data;

            // Esperar al menos 3 segundos para simular que está "escribiendo"
            const elapsed = Date.now() - start;
            if (elapsed < 3000) {
                await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
            }

            setMensajes(prev => [...prev, {
                rol: 'ia',
                texto: data.respuesta || 'No pude obtener una respuesta. Intentá de nuevo.'
            }]);
        } catch (error) {
            console.error("Error al consultar IA:", error);
            setMensajes(prev => [...prev, {
                rol: 'ia',
                texto: 'Hubo un error al conectar con el asistente. Por favor intentá más tarde.'
            }]);
        } finally {
            setPensando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#04080f] text-slate-50 font-sans overflow-x-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            <div className="fixed top-[-20vh] left-[-10vw] w-[70vw] h-[70vw] bg-red-700/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-[-10vh] right-[-10vw] w-[50vw] h-[50vw] bg-orange-700/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-[40vh] right-[20vw] w-[30vw] h-[30vw] bg-blue-700/5 rounded-full blur-[100px] pointer-events-none" />

            <PublicNavbar />

            {/* Hero */}
            <div className="relative z-10 pt-32 pb-20 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-extrabold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Centro de Ayuda
                    </div>
                    <h1 className="text-[clamp(2.5rem,7vw,4rem)] font-black tracking-tight text-white leading-[1.1] mb-6">
                        Soporte & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-pink-500">
                            Preguntas Frecuentes
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                        Encontrá respuestas rápidas a las consultas más comunes o utilizá nuestro asistente en vivo disponible 24/7.
                    </p>

                    {/* Botón Modal IA */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setChatAbierto(true)}
                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black text-base shadow-[0_6px_30px_-6px_rgba(220,38,38,0.7)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
                        >
                            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Iniciar Chat de Soporte
                        </button>
                    </div>
                </div>

            {/* FAQs Estáticas */}
            <div className="max-w-3xl mx-auto px-4 pb-32 relative z-10">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${abierto === i ? 'bg-white/[0.04] border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.03]'}`}
                                onClick={() => setAbierto(abierto === i ? null : i)}
                            >
                                <div className="flex items-center justify-between p-6 gap-4">
                                    <h3 className={`font-bold text-base leading-tight ${abierto === i ? 'text-white' : 'text-slate-300'}`}>
                                        {faq.pregunta}
                                    </h3>
                                    <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${abierto === i ? 'bg-red-500/20 text-red-400 rotate-180' : 'bg-white/5 text-slate-500'}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className={`px-6 pb-6 pt-0 transition-all duration-300 ${abierto === i ? 'block opacity-100' : 'hidden opacity-0'}`}>
                                    <p className="text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                        {faq.respuesta}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <PublicFooter />
            </div>

            {/* ── Modal de Chat Estilo WhatsApp ────────────────────────────────────────────── */}
            {chatAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setChatAbierto(false)}
                    />
                    
                    {/* Contenedor del Modal */}
                    <div className="relative w-full h-full sm:h-[80vh] sm:max-w-2xl bg-[#0b141a] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        style={{ backgroundImage: "radial-gradient(#ffffff04 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                        
                        {/* Header - Estilo WhatsApp */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] border-b border-[#2a3942]/50 z-10 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
                                <Bot className="w-6 h-6 text-[#111b21]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[#e9edef] font-semibold text-base">Asistente ONRADIO</p>
                                <p className="text-[#8696a0] text-xs">en línea</p>
                            </div>
                            <button
                                onClick={() => setChatAbierto(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full text-[#8696a0] hover:bg-[#2a3942] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 z-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                            {mensajes.map((m, i) => (
                                <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative max-w-[85%] sm:max-w-[75%] rounded-xl px-3 py-2 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${m.rol === 'ia'
                                        ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                                        : 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                                    }`}>
                                        {/* Colita del globo */}
                                        <div className={`absolute top-0 w-3 h-3 ${m.rol === 'ia' ? '-left-2 bg-[#202c33]' : '-right-2 bg-[#005c4b]'}`} 
                                            style={{ clipPath: m.rol === 'ia' ? 'polygon(100% 0, 0 0, 100% 100%)' : 'polygon(0 0, 100% 0, 0 100%)' }} />
                                        
                                        {m.texto}
                                        {/* Hora falsa para el look */}
                                        <span className={`block text-[10px] text-right mt-1 opacity-70 ${m.rol === 'ia' ? 'text-[#8696a0]' : 'text-white/70'}`}>
                                            ahora
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {pensando && (
                                <div className="flex justify-start">
                                    <div className="relative bg-[#202c33] rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                                        <div className="absolute top-0 -left-2 w-3 h-3 bg-[#202c33]" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={mensajesEndRef} />
                        </div>

                        {/* Input y Sugerencias */}
                        <div className="flex flex-col bg-[#202c33] z-10 px-4 py-3">
                            {mensajes.length <= 2 && (
                                <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {SUGERENCIAS.slice(0, 4).map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => enviarPregunta(s)}
                                            disabled={pensando}
                                            className="text-sm shrink-0 bg-[#2a3942] hover:bg-[#374c58] text-[#e9edef] px-4 py-1.5 rounded-full transition-all disabled:opacity-40"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex gap-2 items-end">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) { 
                                            e.preventDefault(); 
                                            enviarPregunta(); 
                                        } 
                                    }}
                                    placeholder="Escribe un mensaje"
                                    disabled={pensando}
                                    rows={1}
                                    className="flex-1 bg-[#2a3942] min-h-[44px] max-h-32 resize-none rounded-3xl px-5 py-3 text-[#e9edef] placeholder-[#8696a0] focus:outline-none transition-all text-[15px] disabled:opacity-50 overflow-hidden"
                                    autoFocus
                                    style={{ height: input.includes('\n') ? 'auto' : '44px' }}
                                />
                                <button
                                    onClick={() => enviarPregunta()}
                                    disabled={!input.trim() || pensando}
                                    className="w-11 h-11 mb-0.5 rounded-full bg-[#00a884] hover:bg-[#00bfa5] text-[#111b21] flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#00a884] shrink-0"
                                >
                                    {pensando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
