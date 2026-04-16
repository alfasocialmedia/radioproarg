import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getFacturacion = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;

        const pagos = await prisma.payment.findMany({
            where: { radioId },
            include: {
                orden: {
                    include: { plan: true }
                }
            },
            orderBy: { fechaCreacion: 'desc' }
        });

        return res.json(pagos);
    } catch (error) {
        console.error("Error getFacturacion:", error);
        return res.status(500).json({ error: 'Error al obtener historial de pagos.' });
    }
};
