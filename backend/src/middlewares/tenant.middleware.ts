import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const JWT_SECRET = (process.env.JWT_SECRET as string) || 'DEV_SECRET_CHANGE_ME';

export const injectTenant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const host = req.get('host') || '';
        const method = req.method;
        const url = req.originalUrl;

        // Headers personalizados que pueden venir del frontend
        const tenantIdHeader = req.headers['x-tenant-id'] as string;   // ID directo
        const tenantSlugHeader = req.headers['x-tenant'] as string;     // subdominio

        console.log(`[TenantMW] ${method} ${url} | ID: ${tenantIdHeader} | Slug: ${tenantSlugHeader} | Host: ${host}`);

        let radio;

        if (tenantIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdHeader)) {
            // Buscar por ID (admin panel, api.ts)
            radio = await prisma.radio.findUnique({ where: { id: tenantIdHeader } });
        } else if (tenantSlugHeader || tenantIdHeader) {
            // Buscar por subdominio (frontend público)
            // Si tenantIdHeader no era UUID, lo intentamos como slug por si el frontend se equivocó de header
            const slugToSearch = tenantSlugHeader || tenantIdHeader;
            radio = await prisma.radio.findUnique({ where: { subdominio: slugToSearch } });
        } else {
            // Extraer subdominio del Host (producción: emisora1.onradio.com.ar)
            let subdominio = host.split('.')[0];

            // En localhost no hay subdominio real, usamos fallback 'demo'
            if (subdominio === 'localhost' || subdominio.includes(':')) {
                subdominio = 'demo';
            }

            radio = await prisma.radio.findUnique({ where: { subdominio } });

            // Si no hay subdominio, verificar el dominio personalizado
            if (!radio) {
                radio = await prisma.radio.findUnique({ where: { dominioCustom: host } });
            }
        }

        // --- AUTO-CORRECCIÓN DE TENANT VÍA AUTH ---
        // Si no encontramos la radio por headers/host, pero tenemos un token, 
        // rescatamos la radio asociada al usuario logueado.
        if (!radio) {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET) as any;
                    if (decoded.radioId) {
                        radio = await prisma.radio.findUnique({ where: { id: decoded.radioId } });
                        if (radio) console.log(`[TenantMW] ✅ Radio recuperada vía JWT: ${radio.subdominio}`);
                    }
                    if (!radio && decoded.id) {
                        const usuario = await prisma.usuario.findUnique({ 
                            where: { id: decoded.id },
                            include: { radio: true }
                        });
                        if (usuario?.radio) {
                            radio = usuario.radio;
                            console.log(`[TenantMW] ✅ Radio recuperada vía DB Usuario: ${radio.subdominio}`);
                        }
                    }
                } catch (e) {}
            }
        }

        if (!radio || !radio.activa) {
            return res.status(404).json({ error: 'Emisora no encontrada o inactiva.' });
        }

        if (radio.suspendida) {
            // Si la radio está suspendida, solo el SUPER_ADMIN puede entrar a gestionar
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            let isSuperAdmin = false;

            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET) as any;
                    if (decoded.rol === 'SUPER_ADMIN') isSuperAdmin = true;
                } catch (e) {}
            }

            if (!isSuperAdmin) {
                return res.status(403).json({ 
                    error: 'Emisora suspendida.', 
                    mensaje: 'El servicio se encuentra suspendido temporalmente.' 
                });
            }
        }

        // Inyectamos el ID y el objeto completo para compatibilidad
        (req as any).tenantId = radio.id;
        (req as any).radio = radio;
        next();
    } catch (error: any) {
        console.error('❌ [TenantMW Error]:', error.message || error);
        
        // Si el error es de Prisma (ej: fallo de conexión)
        if (error.code && error.code.startsWith('P')) {
            return res.status(503).json({ 
                error: 'Servicio temporalmente no disponible.',
                mensaje: 'Error de conexión con la base de datos.'
            });
        }

        res.status(500).json({ 
            error: 'Error interno de servidor identificando el tenant.',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
