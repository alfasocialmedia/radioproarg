"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
    Radio, 
    Mail, 
    Lock, 
    Loader2, 
    ShieldAlert, 
    ArrowRight, 
    CheckCircle2, 
    Sparkles, 
    Terminal,
    UserCircle2,
    Headphones,
    Globe2
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Prevenir redirección si ya hay un token (opcional)
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            // router.push('/admin/dashboard');
        }
    }, [router]);

    const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        const loginEmail = customEmail || email;
        const loginPass = customPass || password;

        try {
            const res = await api.post('/auth/login', {
                email: loginEmail,
                password: loginPass
            });

            const { token, usuario } = res.data;

            // Guardar datos en el cliente
            localStorage.setItem('auth_token', token);
            localStorage.setItem('tenant_id', usuario.radioId || 'demo');
            localStorage.setItem('usuario_rol', usuario.rol);
            
            // Determinar plan (esto ideally vendría del backend más explícito)
            // Por ahora usamos la lógica de nombres para las demos o el rol
            if (usuario.rol === 'SUPER_ADMIN') {
                localStorage.setItem('usuario_plan', 'portal'); // El superadmin ve todo
                router.push('/superadmin');
            } else {
                // Llamada extra para obtener el slug del plan de la radio
                const radioRes = await api.get('/radios/config', {
                    headers: { 'X-Tenant-Id': usuario.radioId }
                });
                // plan es un objeto relacionado { slug: 'portal' | 'audio' | ... }
                const planSlug = radioRes.data.plan?.slug || 'audio';
                localStorage.setItem('usuario_plan', planSlug);
                router.push('/admin/dashboard');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Error al conectar con el servidor. Revisá tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    const loginQuick = (role: 'super' | 'portal' | 'audio') => {
        const creds = {
            super: { e: 'admin@onradio.com', p: 'admin123' },
            portal: { e: 'portal@onradio.com', p: 'admin123' },
            audio: { e: 'audio@onradio.com', p: 'admin123' }
        };
        const { e, p } = creds[role];
        handleLogin(undefined, e, p);
    };

    return (
        <div className="min-h-screen bg-[#04080f] text-slate-50 relative flex items-center justify-center p-5 overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl relative z-10">
                
                {/* Left Side: Form */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <Link href="/" className="inline-flex items-center gap-2.5 group mb-10">
                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.4)]">
                            <Radio className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">ONRADIO</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Bienvenido de nuevo</h1>
                        <p className="text-slate-500 text-sm font-medium">Ingresá tus credenciales para administrar tu emisora.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-shake">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tunombre@email.com"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition-all placeholder:text-slate-600 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">Contraseña</label>
                                <a href="#" className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">¿La olvidaste?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-sm focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition-all placeholder:text-slate-600 font-medium"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L4.62 4.62"/><path d="M7 7a7 7 0 0 0 9.9 9.9"/><path d="M2 2l20 20"/><path d="M10.37 4.54a10 10 0 0 1 11.2 5.03"/><path d="M22 12c0 1.2-.4 2.3-1.04 3.22"/><path d="M13.63 19.46a10 10 0 0 1-11.2-5.03"/><path d="M2 12c0-1.2.4-2.3 1.04-3.22"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-1">
                            <input 
                                type="checkbox" 
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-500/50 transition-all cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="text-xs font-medium text-slate-500 cursor-pointer select-none">Recordarme en este dispositivo</label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_20px_-4px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 group mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Ingresar al Panel <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-xs font-medium">
                        ¿No tenés una cuenta? <Link href="/#planes" className="text-white hover:underline font-bold">Ver Planes</Link>
                    </p>
                </div>

                {/* Right Side: Quick Access / Demo Info */}
                <div className="bg-white/[0.03] border-l border-white/5 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
                            <Terminal className="w-3.5 h-3.5" /> Entorno de Pruebas
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-3">Acceso Rápido Demo</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Probá las diferentes funcionalidades del sistema sin necesidad de registrarte. Elegí un perfil para explorar:
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* SuperAdmin */}
                        <button 
                            onClick={() => loginQuick('super')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                                <UserCircle2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm">Super Administrador</p>
                                <p className="text-slate-500 text-xs truncate">Gestión global de la plataforma.</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-black tracking-tighter uppercase">Global</span>
                                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>

                        {/* Portal Plan */}
                        <button 
                            onClick={() => loginQuick('portal')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                                <Globe2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm">Admin Plan Portal</p>
                                <p className="text-slate-500 text-xs truncate">Acceso total + CMS de Noticias.</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black tracking-tighter uppercase">Pro</span>
                                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>

                        {/* Audio Plan */}
                        <button 
                            onClick={() => loginQuick('audio')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                                <Headphones className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm">Admin Plan Audio</p>
                                <p className="text-slate-500 text-xs truncate">Streaming y gestión básica.</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-black tracking-tighter uppercase">Esencial</span>
                                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>
                    </div>

                    <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-400 leading-relaxed"><span className="text-white font-bold">Verificar planes:</span> Cambiá de cuenta para ver cómo cambian las herramientas disponibles.</p>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-400 leading-relaxed"><span className="text-white font-bold">Pruebas en vivo:</span> Todos los cambios que hagas impactarán en la base de datos de demo.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
