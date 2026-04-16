import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import fs from 'fs';
import path from 'path';

export const getEpisodiosPorPodcast = async (req: Request, res: Response) => {
    try {
        const podcastId = req.params.podcastId as string;
        const episodios = await prisma.episodioPodcast.findMany({
            where: { podcastId },
            orderBy: { fechaPublicacion: 'desc' }
        });
        res.json(episodios);
    } catch (error) {
        console.error('Error fetching episodios:', error);
        res.status(500).json({ error: 'Error obteniendo episodios.' });
    }
};

export const createEpisodio = async (req: Request, res: Response) => {
    try {
        const podcastId = req.params.podcastId as string;
        const titulo = req.body.titulo as string;
        const descripcion = req.body.descripcion as string | undefined;
        const audioLinkExt = req.body.audioLinkExt as string | undefined;

        let audioMp3Url: string | null = null;
        if (req.file) {
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
            audioMp3Url = `${baseUrl}/uploads/${req.file.filename}`;

            // Registrar en Media para el gestor centralizado
            try {
                const podcast = await prisma.podcast.findUnique({ where: { id: podcastId } });
                if (podcast) {
                    await prisma.media.create({
                        data: {
                            radioId: podcast.radioId,
                            nombre: req.file.originalname,
                            url: audioMp3Url,
                            tipo: 'documento', // O 'audio' si expandimos
                            mimetype: req.file.mimetype,
                            tamanoBytes: req.file.size
                        }
                    });
                }
            } catch (err) {
                console.error("No se pudo registrar audio en Media:", err);
            }
        }

        const episodio = await prisma.episodioPodcast.create({
            data: { podcastId, titulo, descripcion, audioMp3Url, audioLinkExt }
        });
        res.status(201).json(episodio);
    } catch (error) {
        console.error('Error creating episodio:', error);
        res.status(500).json({ error: 'Error creando episodio.' });
    }
};

export const updateEpisodio = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const titulo = req.body.titulo as string;
        const descripcion = req.body.descripcion as string | undefined;
        const audioLinkExt = req.body.audioLinkExt as string | undefined;

        const exists = await prisma.episodioPodcast.findUnique({ where: { id } });
        if (!exists) return res.status(404).json({ error: 'Episodio no encontrado' });

        let audioMp3Url = exists.audioMp3Url;
        if (req.file) {
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
            audioMp3Url = `${baseUrl}/uploads/${req.file.filename}`;
            
            // Registrar en Media para el gestor centralizado
            try {
                const podcast = await prisma.podcast.findUnique({ where: { id: exists.podcastId } });
                if (podcast) {
                    await prisma.media.create({
                        data: {
                            radioId: podcast.radioId,
                            nombre: req.file.originalname,
                            url: audioMp3Url,
                            tipo: 'documento',
                            mimetype: req.file.mimetype,
                            tamanoBytes: req.file.size
                        }
                    });
                }
            } catch (err) {
                console.error("No se pudo registrar audio en Media:", err);
            }

            if (exists.audioMp3Url && exists.audioMp3Url.includes('/uploads/')) {
                const oldFilename = path.basename(exists.audioMp3Url);
                const oldFilePath = path.join(process.cwd(), 'uploads', oldFilename);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            }
        }

        const episodio = await prisma.episodioPodcast.update({
            where: { id },
            data: { titulo, descripcion, audioMp3Url, audioLinkExt }
        });
        res.json(episodio);
    } catch (error) {
        console.error('Error updating episodio:', error);
        res.status(500).json({ error: 'Error actualizando episodio.' });
    }
};

export const deleteEpisodio = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const exists = await prisma.episodioPodcast.findUnique({ where: { id } });
        if (!exists) return res.status(404).json({ error: 'Episodio no encontrado' });

        if (exists.audioMp3Url && exists.audioMp3Url.includes('/uploads/')) {
            const filename = path.basename(exists.audioMp3Url);
            const filePath = path.join(process.cwd(), 'uploads', filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await prisma.episodioPodcast.delete({ where: { id } });
        res.json({ mensaje: 'Episodio eliminado' });
    } catch (error) {
        console.error('Error deleting episodio:', error);
        res.status(500).json({ error: 'Error eliminando episodio.' });
    }
};

export const getEpisodiosRecientes = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const episodios = await prisma.episodioPodcast.findMany({
            where: {
                podcast: { radioId }
            },
            take: 10,
            orderBy: { fechaPublicacion: 'desc' },
            include: {
                podcast: {
                    select: {
                        titulo: true,
                        portadaUrl: true
                    }
                }
            }
        });
        res.json(episodios);
    } catch (error) {
        console.error('Error fetching episodios frecuentes:', error);
        res.status(500).json({ error: 'Error obteniendo episodios frecuentes.' });
    }
};
