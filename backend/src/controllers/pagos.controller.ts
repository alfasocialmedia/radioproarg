import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { decrypt } from '../utils/crypto';

// Pagos de una radio
export const getPagosRadio = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const pagos = await prisma.payment.findMany({
            where: { radioId },
            orderBy: { fechaCreacion: 'desc' }
        });
        res.json(pagos);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo pagos.' }); }
};

// Todos los pagos (SuperAdmin)
export const getTodosPagos = async (_req: Request, res: Response) => {
    try {
        const pagos = await prisma.payment.findMany({
            include: { radio: { select: { nombre: true, subdominio: true } } },
            orderBy: { fechaCreacion: 'desc' }
        });
        res.json(pagos);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo pagos.' }); }
};

// Datos de transmisión de la radio del cliente
export const getDatosTransmision = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const radio = await prisma.radio.findUnique({
            where: { id: radioId },
            select: {
                id: true,
                nombre: true,
                streamUrl: true,
                streamUser: true,
                streamPassword: true,
                streamMount: true,
                streamPort: true,
                ftpUser: true,
                ftpPassword: true,
                sonicpanelId: true,
                plan: { select: { nombre: true, bitrate: true, maxOyentes: true } },
                planVenceEn: true,
                activa: true,
            }
        });
        if (!radio) return res.status(404).json({ error: 'Radio no encontrada.' });

        // Descifrar contraseñas antes de enviar
        if (radio.streamPassword) radio.streamPassword = decrypt(radio.streamPassword);
        if (radio.ftpPassword) radio.ftpPassword = decrypt(radio.ftpPassword);

        res.json(radio);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo datos de transmisión.' }); }
};
