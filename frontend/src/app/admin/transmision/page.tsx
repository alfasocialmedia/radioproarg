"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Server, Wifi, Lock, User, FolderOpen, Copy, CheckCheck, Loader2, AlertCircle, Music } from 'lucide-react';

export default function AdminTransmisionPage() {
    const [datos, setDatos] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copiado, setCopiado] = useState<string | null>(null);

    useEffect(() => {
        api.get('/platform/transmision')
            .then(r => setDatos(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const copiar = (texto: string, campo: string) => {
        navigator.clipboard.writeText(texto);
        setCopiado(campo);
        setTimeout(() => setCopiado(null), 2000);
    };

    const CopyField = ({ label, value, icon: Icon, campo, sensitive = false }: any) => (
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-white break-all">
                    {sensitive ? '••••••••••••' : (value || '—')}
                </span>
                {value && (
                    <button
                        onClick={() => copiar(value, campo)}
                        className="shrink-0 text-xs flex items-center gap-1 text-slate-500 hover:text-primary transition-colors"
                    >
                        {copiado === campo ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Wifi className="text-primary w-8 h-8" /> Datos de Transmisión
                </h1>
                <p className="text-slate-400 mt-1">Credenciales para conectar tu software de transmisión (BUTT, Mixxx, Zara, etc.)</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>
            ) : !datos?.streamUser ? (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Configuración en proceso</h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                        Tus credenciales de streaming están siendo configuradas en el servidor. Si pagaste recién, aguardá algunos minutos y recargá esta página. Si el problema persiste, contactá soporte.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Plan info */}
                    <div className="bg-gradient-to-r from-primary/10 to-blue-600/5 border border-primary/20 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Plan Activo</p>
                                <p className="text-xl font-black text-white">{datos.plan?.nombre || 'Audio'}</p>
                                <p className="text-sm text-primary">{datos.plan?.bitrate || 128} kbps · {datos.plan?.maxOyentes || 100} oyentes máx.</p>
                            </div>
                            {datos.planVenceEn && (
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Vence</p>
                                    <p className="text-lg font-bold text-white">{new Date(datos.planVenceEn).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Servidor de Streaming */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                            <Server className="w-4 h-4" /> Servidor de Streaming
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <CopyField label="Servidor" value={datos.streamUrl ? new URL(datos.streamUrl).hostname : 'stream.onradio.com.ar'} icon={Server} campo="servidor" />
                            <CopyField label="Puerto" value={String(datos.streamPort || 8000)} icon={Wifi} campo="puerto" />
                            <CopyField label="Mountpoint" value={datos.streamMount || '/stream'} icon={Wifi} campo="mount" />
                            <CopyField label="URL Completa del Stream" value={datos.streamUrl} icon={Wifi} campo="streamUrl" />
                        </div>
                    </div>

                    {/* Credenciales de Transmisión */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Credenciales de Transmisión
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <CopyField label="Usuario" value={datos.streamUser} icon={User} campo="streamUser" />
                            <div className="bg-black/20 border border-white/5 rounded-xl p-4 group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contraseña</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-mono text-sm text-white">{'•'.repeat(12)}</span>
                                    <button
                                        onClick={() => copiar(datos.streamPassword, 'streamPass')}
                                        className="shrink-0 text-xs flex items-center gap-1 text-slate-500 hover:text-primary transition-colors"
                                    >
                                        {copiado === 'streamPass' ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FTP / AutoDJ */}
                    {(datos.ftpUser) && (
                        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-5">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                                <FolderOpen className="w-4 h-4" /> FTP para AutoDJ
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <CopyField label="Usuario FTP" value={datos.ftpUser} icon={User} campo="ftpUser" />
                                <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contraseña FTP</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-sm text-white">{'•'.repeat(12)}</span>
                                        <button onClick={() => copiar(datos.ftpPassword, 'ftpPass')} className="text-xs text-slate-500 hover:text-primary transition-colors">
                                            {copiado === 'ftpPass' ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instrucciones */}
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                            <Music className="w-4 h-4" /> Cómo conectarte
                        </h2>
                        <ol className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-start gap-3"><span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">1</span>Instalá un software de streaming: <strong className="text-white">BUTT, Mixxx, Zara Radio o SAM Broadcaster</strong>.</li>
                            <li className="flex items-start gap-3"><span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">2</span>Configurá un servidor <strong className="text-white">Icecast/Shoutcast</strong> con los datos de arriba.</li>
                            <li className="flex items-start gap-3"><span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">3</span>Usá el <strong className="text-white">mountpoint y las credenciales</strong> tal como aparecen.</li>
                            <li className="flex items-start gap-3"><span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">4</span>¿Querés usar AutoDJ? Subí tu música por FTP y configuralo desde SonicPanel.</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
}
