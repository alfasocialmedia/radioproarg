import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getCategorias = async (_req: Request, res: Response) => {
    try {
        const categorias = await prisma.categoriaNoticia.findMany({
            include: { _count: { select: { noticias: true } } },
            orderBy: { nombre: 'asc' }
        });
        res.json(categorias);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo categorías.' }); }
};

export const crearCategoria = async (req: Request, res: Response) => {
    try {
        const { nombre, slug } = req.body;
        if (!nombre || !slug) return res.status(400).json({ error: 'Nombre y slug son requeridos.' });

        const cat = await prisma.categoriaNoticia.create({ data: { nombre, slug } });
        res.status(201).json(cat);
    } catch (e: any) {
        if (e.code === 'P2002') return res.status(400).json({ error: 'Ya existe una categoría con ese slug.' });
        res.status(500).json({ error: 'Error creando la categoría.' });
    }
};

export const actualizarCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, slug } = req.body;

        const cat = await prisma.categoriaNoticia.findUnique({ where: { id: String(id) } });
        if (!cat) return res.status(404).json({ error: 'Categoría no encontrada.' });

        const actualizada = await prisma.categoriaNoticia.update({
            where: { id: String(id) },
            data: { ...(nombre && { nombre }), ...(slug && { slug }) }
        });
        res.json(actualizada);
    } catch (e) { res.status(500).json({ error: 'Error actualizando la categoría.' }); }
};

export const eliminarCategoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cat = await prisma.categoriaNoticia.findUnique({ where: { id: String(id) } });
        if (!cat) return res.status(404).json({ error: 'Categoría no encontrada.' });

        await prisma.categoriaNoticia.delete({ where: { id: String(id) } });
        res.json({ mensaje: 'Categoría eliminada.' });
    } catch (e) { res.status(500).json({ error: 'Error eliminando la categoría.' }); }
};
