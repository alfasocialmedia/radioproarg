import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/prisma';

// Crear directorio de uploads si no existe
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido. Solo imágenes, videos, documentos y audio.'));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // Aumentado a 50MB para videos
});

// [Publico/Admin] Sube y guarda en DB
export const subirArchivo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo.' });
        }

        const radioId = (req as any).tenantId || (req.headers['x-radio-id'] as string) || (req.headers['x-tenant-id'] as string);
        if (!radioId) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No se identificó la radio (radioId).' });
        }

        // VALIDAR CUOTA DE DISCO
        const radio = await prisma.radio.findUnique({
            where: { id: radioId },
            include: { plan: true }
        });
        const totalUsed = await prisma.media.aggregate({
            where: { radioId },
            _sum: { tamanoBytes: true }
        });
        const usedBytes = Number(totalUsed._sum.tamanoBytes || 0);
        const limitGB = (radio?.plan?.almacenamientoGB || 0) + ((radio as any)?.almacenamientoExtraGB || 0);
        const limitBytes = limitGB * 1024 * 1024 * 1024;

        if (limitGB > 0 && (usedBytes + req.file.size) > limitBytes) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ 
                error: `Límite de almacenamiento alcanzado (${limitGB}GB).`,
                usage: { usedBytes, limitBytes }
            });
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        const url = `${baseUrl}/uploads/${req.file.filename}`;
        
        // Categorizar tipo
        let tipo = 'documento';
        const mt = req.file.mimetype;
        if (mt.startsWith('image/')) tipo = 'imagen';
        else if (mt.startsWith('video/')) tipo = 'video';
        else if (mt.startsWith('audio/')) tipo = 'documento'; 

        const medio = await prisma.media.create({
            data: {
                radioId,
                nombre: req.file.originalname,
                url,
                tipo,
                mimetype: mt,
                tamanoBytes: req.file.size
            }
        });

        res.json(medio);
    } catch (error) {
        console.error('subirArchivo error:', error);
        res.status(500).json({ error: 'Error al procesar la subida' });
    }
};

// [Admin] Listar medios de la radio
export const listarMedia = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId || (req.headers['x-radio-id'] as string) || (req.headers['x-tenant-id'] as string);
        if (!radioId) return res.status(400).json({ error: 'No se identificó la radio.' });

        const { tipo } = req.query; // opcional: 'imagen' | 'video' | 'documento'

        const medios = await prisma.media.findMany({
            where: { 
                radioId,
                ...(tipo && tipo !== 'all' ? { tipo: tipo as string } : {})
            },
            orderBy: { creadoEn: 'desc' }
        });

        // Mapear para que el frontend reciba "tamano" en lugar de "tamanoBytes" si es necesario
        const responseData = medios.map(m => ({
            ...m,
            tamano: m.tamanoBytes
        }));

        res.json(responseData);
    } catch (error) {
        console.error('listarMedia error:', error);
        res.status(500).json({ error: 'Error al listar medios' });
    }
};

// [Admin] Borrar medio
export const eliminarMedia = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        const medio = await prisma.media.findUnique({ where: { id } });
        if (!medio) return res.status(404).json({ error: 'Archivo no encontrado' });

        // Borrar registro DB
        await prisma.media.delete({ where: { id } });

        // Intentar borrar archivo físico
        const filename = path.basename(medio.url);
        const fullPath = path.join(uploadDir, filename);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('eliminarMedia error:', error);
        res.status(500).json({ error: 'Error al eliminar archivo' });
    }
};

// Mantener subirImagen para compatibilidad legacy (pero ahora guarda en Media)
export const subirImagen = subirArchivo;
