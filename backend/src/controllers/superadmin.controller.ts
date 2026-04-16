import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const radios = await prisma.radio.findMany({
            include: { 
                plan: true,
                _count: { select: { usuarios: true } }
            },
            orderBy: { fechaCreacion: 'desc' }
        });

        const totalRadios = radios.length;
        const radiosActivas = radios.filter(r => r.activa && !r.suspendida).length;
        const radiosSuspendidas = radios.filter(r => r.suspendida).length;
        
        let mrrTotal = 0;
        radios.forEach(r => {
            if (r.activa && r.plan) {
                mrrTotal += r.periodoFacturacion === 'anual' ? (r.plan.precioAnual / 12) : r.plan.precioMensual;
            }
        });

        const totalStorageAssigned = radios.reduce((acc, r) => {
            if (r.activa && r.plan) {
                return acc + (r.plan.almacenamientoGB || 0) + ((r as any).almacenamientoExtraGB || 0);
            }
            return acc;
        }, 0);

        const totalUsuarios = radios.reduce((sum, r) => sum + (r._count?.usuarios || 0), 0);
        const ticketsAbiertos = await prisma.ticket.count({ where: { estado: 'ABIERTO' } });

        return res.json({
            totalRadios,
            radiosActivas,
            radiosSuspendidas,
            totalUsuarios,
            ticketsAbiertos,
            mrrTotal: Math.round(mrrTotal),
            totalStorageAssigned,
            totalStorageLimit: 100,
            ultimasRadios: radios.slice(0, 6)
        });
    } catch (error) {
        console.error("Error SuperAdmin getDashboardStats:", error);
        return res.status(500).json({ error: 'Error del servidor al obtener métricas' });
    }
};

export const getTodasRadios = async (req: Request, res: Response) => {
    try {
        const radios = await prisma.radio.findMany({
            include: { plan: true },
            orderBy: { fechaCreacion: 'desc' },
        });

        const radiosConOwner = await Promise.all(radios.map(async (r) => {
            const admin = await prisma.usuario.findFirst({
                where: { radioId: r.id, rol: 'ADMIN_RADIO' }
            });
            return {
                ...r,
                dueño: admin ? { nombre: admin.nombre, email: admin.email } : null
            };
        }));

        return res.json(radiosConOwner);
    } catch (error) {
        console.error("Error SuperAdmin getTodasRadios:", error);
        return res.status(500).json({ error: 'Error del servidor al obtener emisoras' });
    }
};

export const toggleEstadoRadio = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { activa } = req.body;

        if (typeof activa !== 'boolean') {
            return res.status(400).json({ error: 'El campo "activa" debe ser un booleano' });
        }

        const radio = await prisma.radio.update({
            where: { id },
            data: { 
                ...(activa !== undefined && { activa }),
                ...(req.body.almacenamientoExtraGB !== undefined && { almacenamientoExtraGB: Number(req.body.almacenamientoExtraGB) })
            }
        });

        return res.json(radio);
    } catch (error) {
        console.error("Error SuperAdmin toggleEstadoRadio:", error);
        return res.status(500).json({ error: 'Error al cambiar estado de la emisora' });
    }
};
