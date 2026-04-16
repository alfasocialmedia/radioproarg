import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Obtiene el historial de pagos filtrado por la radio actual (tenant)
 */
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

/**
 * Obtiene el detalle de un pago específico
 */
export const getDetallePago = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radioId = (req as any).tenantId;

        const pago = await prisma.payment.findFirst({
            where: { id, radioId },
            include: {
                orden: {
                    include: { plan: true }
                },
                radio: true
            }
        });

        if (!pago) {
            return res.status(404).json({ error: 'Pago no encontrado.' });
        }

        return res.json(pago);
    } catch (error) {
        console.error("Error getDetallePago:", error);
        return res.status(500).json({ error: 'Error al obtener el detalle del pago.' });
    }
};

/**
 * Obtiene un resumen consolidado para el dashboard del admin
 */
export const getResumenFacturacion = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;

        const [pagosExitosos, pagosPendientes, radio] = await Promise.all([
            prisma.payment.aggregate({
                where: { radioId, estado: 'APROBADO' },
                _sum: { monto: true },
                _count: true
            }),
            prisma.payment.count({
                where: { radioId, estado: 'PENDIENTE' }
            }),
            prisma.radio.findUnique({
                where: { id: radioId },
                select: { planVenceEn: true, plan: { select: { nombre: true, precioMensual: true } } }
            })
        ]);

        return res.json({
            totalInvertido: pagosExitosos._sum.monto || 0,
            cantidadPagos: pagosExitosos._count || 0,
            pagosPendientes,
            proximoVencimiento: radio?.planVenceEn,
            planActual: radio?.plan?.nombre,
            cuotaMensual: radio?.plan?.precioMensual
        });
    } catch (error) {
        console.error("Error getResumenFacturacion:", error);
        return res.status(500).json({ error: 'Error al obtener resumen de facturación.' });
    }
};
