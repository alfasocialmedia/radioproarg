import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const listarBanners = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const banners = await prisma.banner.findMany({
            where: {
                auspiciante: { radioId },
                fechaInicio: { lte: new Date() },
                OR: [{ fechaFin: null }, { fechaFin: { gte: new Date() } }]
            },
            include: { auspiciante: { select: { nombreEmpresa: true } } },
            orderBy: { fechaInicio: 'desc' }
        });
        res.json(banners);    } catch (error) {
        res.status(500).json({ error: 'Error al obtener banners activos.' });
    }
};

export const listarAuspiciantes = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const auspiciantes = await prisma.auspiciante.findMany({
            where: { radioId },
            include: { _count: { select: { banners: true } } },
            orderBy: { nombreEmpresa: 'asc' }
        });
        res.json(auspiciantes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener auspiciantes.' });
    }
};

export const crearAuspiciante = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { nombreEmpresa, emailContacto } = req.body;
        if (!nombreEmpresa) return res.status(400).json({ error: 'Nombre de empresa requerido.' });

        const ausp = await prisma.auspiciante.create({
            data: { radioId, nombreEmpresa, emailContacto }
        });
        res.status(201).json(ausp);
    } catch (error: any) {
        res.status(500).json({ error: 'Error creando auspiciante' });
    }
};

export const crearBanner = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { auspicianteId, imagenUrl, urlDestino, posicion, fechaInicio, fechaFin, mostrarMobile, mostrarEscritorio } = req.body;
        if (!auspicianteId || !imagenUrl) return res.status(400).json({ error: 'auspicianteId e imagenUrl son requeridos.' });

        const auspiciante = await prisma.auspiciante.findFirst({ where: { id: String(auspicianteId), radioId } });
        if (!auspiciante) return res.status(404).json({ error: 'Auspiciante no encontrado o no pertenece a esta radio.' });

        const ubicacionMap: Record<string, any> = {
            'header': 'HEADER', 'footer': 'FOOTER', 'sidebar': 'SIDEBAR', 'under_player': 'UNDER_PLAYER',
            'HEADER': 'HEADER', 'FOOTER': 'FOOTER', 'SIDEBAR': 'SIDEBAR', 'UNDER_PLAYER': 'UNDER_PLAYER'
        };
        const ubicacion = ubicacionMap[posicion] || 'SIDEBAR';

        const banner = await prisma.banner.create({
            data: {
                auspicianteId: String(auspicianteId),
                imagenUrl,
                urlDestino: urlDestino || null,
                ubicacion,
                fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
                fechaFin: fechaFin ? new Date(fechaFin) : null,
                mostrarMobile: mostrarMobile !== undefined ? Boolean(mostrarMobile) : true,
                mostrarEscritorio: mostrarEscritorio !== undefined ? Boolean(mostrarEscritorio) : true,
            }
        });

        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ error: 'Error creando banner.' });
    }
};

export const eliminarBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radioId = (req as any).tenantId;

        const banner = await prisma.banner.findFirst({
            where: { id: String(id), auspiciante: { radioId } }
        });
        if (!banner) return res.status(404).json({ error: 'Banner no encontrado.' });

        await prisma.banner.delete({ where: { id: String(id) } });
        res.json({ mensaje: 'Banner eliminado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando banner.' });
    }
};

export const actualizarBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radioId = (req as any).tenantId;
        const { auspicianteId, imagenUrl, urlDestino, posicion, fechaInicio, fechaFin, mostrarMobile, mostrarEscritorio } = req.body;

        const banner = await prisma.banner.findFirst({
            where: { id: String(id), auspiciante: { radioId } }
        });
        if (!banner) return res.status(404).json({ error: 'Banner no encontrado.' });

        const ubicacionMap: Record<string, any> = {
            'header': 'HEADER', 'footer': 'FOOTER', 'sidebar': 'SIDEBAR', 'under_player': 'UNDER_PLAYER',
            'HEADER': 'HEADER', 'FOOTER': 'FOOTER', 'SIDEBAR': 'SIDEBAR', 'UNDER_PLAYER': 'UNDER_PLAYER'
        };

        const updated = await prisma.banner.update({
            where: { id: String(id) },
            data: {
                ...(auspicianteId && { auspicianteId: String(auspicianteId) }),
                ...(imagenUrl && { imagenUrl }),
                ...(urlDestino !== undefined && { urlDestino: urlDestino || null }),
                ...(posicion && { ubicacion: ubicacionMap[posicion] || 'SIDEBAR' }),
                ...(fechaInicio && { fechaInicio: new Date(fechaInicio) }),
                ...(fechaFin !== undefined && { fechaFin: fechaFin ? new Date(fechaFin) : null }),
                ...(mostrarMobile !== undefined && { mostrarMobile: Boolean(mostrarMobile) }),
                ...(mostrarEscritorio !== undefined && { mostrarEscritorio: Boolean(mostrarEscritorio) }),
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('actualizarBanner Error:', error);
        res.status(500).json({ error: 'Error actualizando banner.' });
    }
};
