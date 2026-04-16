"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Props {
    slug: string; // subdominio de la radio (para el header x-tenant)
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushSubscribeButton({ slug }: Props) {
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setSupported(true);
            // Registrar SW si no está registrado
            navigator.serviceWorker.register('/sw-push.js').then(async (reg) => {
                const sub = await reg.pushManager.getSubscription();
                setSubscribed(!!sub);
            }).catch(console.error);
        }
    }, []);

    const handleToggle = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;

            if (subscribed) {
                // Desuscribir
                const sub = await reg.pushManager.getSubscription();
                if (sub) {
                    await fetch(`${BACKEND}/api/v1/push/unsubscribe`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint: sub.endpoint }),
                    });
                    await sub.unsubscribe();
                }
                setSubscribed(false);
            } else {
                // Suscribir: primero obtenemos la clave pública del backend
                const keyRes = await fetch(`${BACKEND}/api/v1/push/vapid-public-key`);
                const { publicKey } = await keyRes.json();

                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
                });

                await fetch(`${BACKEND}/api/v1/push/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-tenant': slug,
                    },
                    body: JSON.stringify(sub.toJSON()),
                });
                setSubscribed(true);
            }
        } catch (err) {
            console.error('Push toggle error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!supported) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={subscribed ? 'Desactivar notificaciones' : 'Activar notificaciones de esta radio'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                subscribed
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : subscribed ? (
                <BellOff className="w-4 h-4" />
            ) : (
                <Bell className="w-4 h-4" />
            )}
            {subscribed ? 'Notificaciones activas' : 'Recibir alertas'}
        </button>
    );
}
