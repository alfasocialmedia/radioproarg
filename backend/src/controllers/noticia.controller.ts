import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getNoticias = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;

        const noticias = await prisma.noticia.findMany({
            where: {
                radioId,
                estado: 'PUBLICADA'
            },
            include: {
                categorias: true,
                autor: {
                    select: { email: true }
                }
            },
            orderBy: { fechaPublicacion: 'desc' }
        });

        res.json(noticias);
    } catch (error) {
        console.error('getNoticias error:', error);
        res.status(500).json({ error: 'Error al obtener las noticias.' });
    }
};

// GET /noticias/:slug -> Devuelve una noticia publicada por su slug
export const getNoticiaBySlug = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

        const noticia = await prisma.noticia.findUnique({
            where: { radioId_slug: { radioId, slug } },
            include: {
                autor: { select: { email: true } },
                categorias: true,
            }
        });

        if (!noticia || noticia.estado !== 'PUBLICADA') {
            return res.status(404).json({ error: 'Noticia no encontrada.' });
        }

        res.json(noticia);
    } catch (error) {
        console.error('getNoticiaBySlug error:', error);
        res.status(500).json({ error: 'Error al obtener la noticia.' });
    }
};



// GET /noticias/admin -> Devuelve TODAS las noticias (borradores + publicadas) para el panel
export const getNoticiasAdmin = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const noticias = await prisma.noticia.findMany({
            where: { radioId },
            include: { autor: { select: { email: true } } },
            orderBy: { fechaCreacion: 'desc' }
        });
        res.json(noticias);
    } catch (error) {
        console.error('getNoticiasAdmin error:', error);
        res.status(500).json({ error: 'Error al obtener las noticias.' });
    }
};

export const crearNoticia = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { titulo, slug, copete, contenidoHtml, imagenDestacada, metaTitulo, metaDescripcion, ogImagen, categorias } = req.body;

        if (!titulo || !slug || !contenidoHtml) {
            return res.status(400).json({ error: 'título, slug y contenido son requeridos.' });
        }

        // Intentar obtener el autorId del token (si hay autenticación),
        // si no, usar el primer usuario de la radio (modo admin demo)
        let autorId = (req as any).user?.userId;
        if (!autorId) {
            const primerAdmin = await prisma.usuario.findFirst({ where: { radioId } });
            if (!primerAdmin) {
                return res.status(400).json({ error: 'No se encontró un usuario administrador para esta radio. Registrá uno primero.' });
            }
            autorId = primerAdmin.id;
        }

        const nuevaNoticia = await prisma.noticia.create({
            data: {
                radioId,
                titulo,
                slug,
                copete,
                contenidoHtml,
                imagenDestacada,
                metaTitulo,
                metaDescripcion,
                ogImagen,
                estado: 'PUBLICADA',
                fechaPublicacion: new Date(),
                autorId,
                categorias: categorias && categorias.length > 0 ? {
                    connect: categorias.map((c: string) => ({ id: c }))
                } : undefined
            }
        });

        res.status(201).json(nuevaNoticia);
    } catch (error: any) {
        console.error('crearNoticia error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe una noticia con ese slug.' });
        }
        res.status(500).json({ error: 'Error al crear la noticia.' });
    }
};

export const eliminarNoticia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radioId = (req as any).tenantId;

        // Verificar que la noticia pertenece a la radio actual
        const noticia = await prisma.noticia.findFirst({
            where: { id: String(id), radioId }
        });

        if (!noticia) {
            return res.status(404).json({ error: 'Noticia no encontrada o no pertenece a esta radio.' });
        }

        await prisma.noticia.delete({
            where: { id: String(id) }
        });

        res.json({ mensaje: 'Noticia eliminada correctamente.' });
    } catch (error) {
        console.error('eliminarNoticia error:', error);
        res.status(500).json({ error: 'Error al eliminar la noticia.' });
    }
};

export const actualizarNoticia = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { id } = req.params;
        const { titulo, slug, copete, contenidoHtml, imagenDestacada, metaTitulo, metaDescripcion, ogImagen, estado, categorias } = req.body;

        const existente = await prisma.noticia.findFirst({ where: { id: String(id), radioId } });
        if (!existente) return res.status(404).json({ error: 'Noticia no encontrada.' });

        const dataToUpdate: any = {
            ...(titulo !== undefined && { titulo }),
            ...(slug !== undefined && { slug }),
            ...(copete !== undefined && { copete }),
            ...(contenidoHtml !== undefined && { contenidoHtml }),
            ...(imagenDestacada !== undefined && { imagenDestacada }),
            ...(metaTitulo !== undefined && { metaTitulo }),
            ...(metaDescripcion !== undefined && { metaDescripcion }),
            ...(ogImagen !== undefined && { ogImagen }),
            ...(estado !== undefined && { estado }),
        };

        if (categorias !== undefined) {
            dataToUpdate.categorias = {
                set: categorias.map((c: string) => ({ id: c }))
            };
        }

        const actualizada = await prisma.noticia.update({
            where: { id: String(id) },
            data: dataToUpdate
        });

        res.json(actualizada);
    } catch (error) {
        console.error('actualizarNoticia error:', error);
        res.status(500).json({ error: 'Error al actualizar la noticia.' });
    }
};
