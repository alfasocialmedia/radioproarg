import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const webhookMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
        const radioId = req.params.radioId as string;
        const { song, artist, title } = req.body;

        let cancion = song || title;
        if (artist && title) cancion = `${artist} - ${title}`;
        if (!cancion) cancion = "Trasmisión en Vivo";

        const io = req.app.get('io');
        if (io) {
            io.to(radioId).emit('metadata_stream', { cancion });
        }

        res.json({ success: true, cancion });
    } catch (error) {
        console.error("Error en webhook de metadata:", error);
        res.status(500).json({ msg: 'Error de servidor' });
    }
};

export const updateDonaciones = async (req: Request, res: Response): Promise<void> => {
    try {
        const radioId = req.params.radioId as string;
        const { mercadoPagoLink, paypalLink } = req.body;

        const radioToUpdate = await prisma.radio.findFirst({ where: { id: radioId } });
        if (!radioToUpdate) {
            res.status(404).json({ msg: 'Radio no encontrada' }); return;
        }

        const radio = await prisma.radio.update({
            where: { id: radioId },
            data: { mercadoPagoLink, paypalLink }
        });

        res.json(radio);
    } catch (error) {
        console.error("Error actualizando donaciones:", error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};
