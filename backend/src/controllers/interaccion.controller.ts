import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const registrarCompartido = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { redSocial } = req.body; 

        let field = '';
        if (redSocial === 'facebook') field = 'sharesFacebook';
        else if (redSocial === 'whatsapp') field = 'sharesWhatsapp';
        else if (redSocial === 'twitter') field = 'sharesTwitter';

        if (!field) return res.status(400).json({ error: 'Red social no válida' });

        const noticia = await prisma.noticia.update({
            where: { id },
            data: { [field]: { increment: 1 } }
        });

        res.json({ success: true, noticia });
    } catch (error) {
        console.error('registrarCompartido error:', error);
        res.status(500).json({ error: 'Error al registrar compartido' });
    }
};

export const registrarReaccion = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { tipo } = req.body; 

        let field = '';
        if (tipo === 'meEncanto') field = 'votosMeEncanto';
        else if (tipo === 'interesante') field = 'votosInteresante';
        else if (tipo === 'regular') field = 'votosRegular';
        else if (tipo === 'noMeGusto') field = 'votosNoMeGusto';

        if (!field) return res.status(400).json({ error: 'Tipo de reacción no válido' });

        const noticia = await prisma.noticia.update({
            where: { id },
            data: { [field]: { increment: 1 } }
        });

        res.json({ success: true, noticia });
    } catch (error) {
        console.error('registrarReaccion error:', error);
        res.status(500).json({ error: 'Error al registrar reacción' });
    }
};
