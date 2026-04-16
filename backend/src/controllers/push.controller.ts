import { Request, Response } from 'express';
import webpush from 'web-push';
import { prisma } from '../config/prisma';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@onradio.cloud',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn("⚠️ Las claves VAPID no están configuradas en .env. Las notificaciones Push estarán desactivadas.");
}

export const getVapidPublicKey = (req: Request, res: Response) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

export const subscribe = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId as string;
        const { endpoint, keys } = req.body as {
            endpoint: string;
            keys: { p256dh: string; auth: string };
        };

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ error: 'Datos de suscripción incompletos.' });
        }

        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: { p256dh: keys.p256dh, auth: keys.auth, radioId },
            create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, radioId },
        });

        res.status(201).json({ ok: true });
    } catch (error) {
        console.error('push subscribe error:', error);
        res.status(500).json({ error: 'Error guardando suscripción.' });
    }
};

export const unsubscribe = async (req: Request, res: Response) => {
    try {
        const { endpoint } = req.body as { endpoint: string };
        await prisma.pushSubscription.deleteMany({ where: { endpoint } });
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Error cancelando suscripción.' });
    }
};

export const sendNotification = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId as string;
        const { titulo, cuerpo, url } = req.body as {
            titulo: string;
            cuerpo: string;
            url?: string;
        };

        if (!titulo || !cuerpo) {
            return res.status(400).json({ error: 'Título y cuerpo son requeridos.' });
        }

        const suscripciones = await prisma.pushSubscription.findMany({
            where: { radioId },
        });

        const payload = JSON.stringify({ titulo, cuerpo, url: url || '/' });

        let enviadas = 0;
        const fallidas: string[] = [];

        await Promise.allSettled(
            suscripciones.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                        payload
                    );
                    enviadas++;
                } catch (err: any) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        fallidas.push(sub.endpoint);
                    }
                }
            })
        );

        if (fallidas.length) {
            await prisma.pushSubscription.deleteMany({
                where: { endpoint: { in: fallidas } },
            });
        }

        await prisma.pushNotification.create({
            data: { radioId, titulo, cuerpo, url, enviadas },
        });

        res.json({ ok: true, enviadas, fallidas: fallidas.length });
    } catch (error) {
        console.error('push send error:', error);
        res.status(500).json({ error: 'Error enviando notificaciones.' });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId as string;
        const notifs = await prisma.pushNotification.findMany({
            where: { radioId },
            orderBy: { enviadoEn: 'desc' },
            take: 50,
        });
        res.json(notifs);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo historial.' });
    }
};

export const getSubscriberCount = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId as string;
        const count = await prisma.pushSubscription.count({ where: { radioId } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo cantidad.' });
    }
};
