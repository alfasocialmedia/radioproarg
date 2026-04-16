import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getPodcasts = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const podcasts = await prisma.podcast.findMany({
            where: { radioId },
            orderBy: { creadoEn: 'desc' },
            include: {
                _count: {
                    select: { episodios: true }
                }
            }
        });
        res.json(podcasts);
    } catch (error) {
        console.error('getPodcasts Error:', error);
        res.status(500).json({ error: 'Error obteniendo podcasts.' });
    }
};

export const getPodcastById = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId as string;
        const id = req.params.id as string;
        const podcast = await prisma.podcast.findFirst({
            where: { id, radioId }
        });
        if (!podcast) return res.status(404).json({ error: 'Podcast no encontrado' });
        res.json(podcast);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo podcast.' });
    }
};

export const createPodcast = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { titulo, descripcion, portadaUrl } = req.body;

        const podcast = await prisma.podcast.create({
            data: { 
                radioId, 
                titulo, 
                descripcion, 
                portadaUrl,
            }
        });

        res.status(201).json(podcast);
    } catch (error) {
        console.error('createPodcast Error:', error);
        res.status(500).json({ error: 'Error creando podcast.' });
    }
};

export const updatePodcast = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const id = req.params.id as string;
        const { titulo, descripcion, portadaUrl } = req.body;

        const exists = await prisma.podcast.findFirst({ where: { id, radioId } });
        if (!exists) return res.status(404).json({ error: 'Podcast no encontrado' });

        const podcast = await prisma.podcast.update({
            where: { id },
            data: { 
                titulo, 
                descripcion, 
                portadaUrl,
            }
        });

        res.json(podcast);
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando podcast.' });
    }
};

export const deletePodcast = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const id = req.params.id as string;

        const exists = await prisma.podcast.findFirst({
            where: { id, radioId }
        });
        
        if (!exists) return res.status(404).json({ error: 'Podcast no encontrado' });

        await prisma.podcast.delete({ where: { id } });

        res.json({ mensaje: 'Podcast eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando podcast.' });
    }
};
