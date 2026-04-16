import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getHistorial = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId || req.params.radioId;

        if (!radioId) {
            return res.status(400).json({ error: 'RadioId es requerido' });
        }

        const mensajes = await prisma.chatMensaje.findMany({
            where: { radioId },
            include: { replyTo: true },
            orderBy: { fechaCreacion: 'desc' },
            take: 100 // Traer los últimos 100
        });

        // Los devolvemos en orden cronológico (los más antiguos primero) 
        // porque la UI general de chat los apila hacia abajo.
        return res.json(mensajes.reverse()); 
    } catch (error) {
        console.error("Error getHistorial:", error);
        return res.status(500).json({ error: 'Error al obtener mensajes.' });
    }
};

export const marcarLeidos = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        
        await prisma.chatMensaje.updateMany({
            where: { 
                radioId,
                leido: false 
            },
            data: { leido: true }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("Error marcarLeidos:", error);
        return res.status(500).json({ error: 'Error al actualizar mensajes.' });
    }
};
