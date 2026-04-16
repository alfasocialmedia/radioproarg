import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET as string) || 'DEV_SECRET_CHANGE_ME';

export interface AuthPayload {
    id: string;
    email: string;
    rol: string;
    radioId?: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log(`[authenticateToken] 🚫 Sin Token. URL: ${req.originalUrl}`);
            return res.status(401).json({ error: 'Acceso denegado. Se requiere autenticación.', code: 'AUTH_REQUIRED' });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.log(`[authenticateToken] 🚫 Token inválido o expirado. Error: ${err.message} URL: ${req.originalUrl}`);
                const message = err.name === 'TokenExpiredError' ? 'Tu sesión ha expirado. Por favor, volvé a ingresar.' : 'Token inválido o falta de permisos.';
                return res.status(403).json({ error: message, code: 'AUTH_REQUIRED' });
            }

            // Inyectamos la información del token en el objeto de request
            (req as any).user = user as AuthPayload;
            next();
        });
    } catch (error: any) {
        console.log(`[authenticateToken] 🚫 Crash. Error: ${error.message}`);
        return res.status(401).json({ error: 'Error procesando token.' });
    }
};

export const requireRoles = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as AuthPayload;
        if (!user) {
            console.log(`[requireRoles] 🚫 Falta info de usuario en request. URL: ${req.originalUrl}`);
            return res.status(401).json({ error: 'Falta información de usuario.' });
        }
        
        if (roles.includes(user.rol) || user.rol === 'SUPER_ADMIN') {
            next();
        } else {
            console.log(`[requireRoles] 🚫 Rol denegado. RolUser: ${user.rol} | Permitidos: ${roles.join(',')} | URL: ${req.originalUrl}`);
            return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
        }
    };
};

/**
 * Middleware para asegurar que un usuario solo acceda a los datos de SU radio.
 * Excepto si es SUPER_ADMIN.
 */
export const verifyRadioAccess = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthPayload;
    const tenantId = (req as any).tenantId; // Inyectado previamente por injectTenant

    if (!user) {
        return res.status(401).json({ error: 'No autenticado.' });
    }

    // El Super Admin tiene pase libre a todo
    if (user.rol === 'SUPER_ADMIN') {
        return next();
    }

    // Si el usuario no tiene radio asignada o es distinta a la del tenant solicitado
    // Patch: tolerancia para ID 'demo' (legacy) vs UUID real 
    const isLocalDemo = (user.radioId === 'demo' && tenantId === 'e77e232e-c75c-4a7e-94c0-e44e622d9137');
    
    // Desarrollo: Permitir ADMIN_RADIO siempre para evitar bloqueos de sincronización de seed
    const isDevAdmin = process.env.NODE_ENV !== 'production' && user.rol === 'ADMIN_RADIO';

    if (!user.radioId || (tenantId && user.radioId !== tenantId && !isLocalDemo && !isDevAdmin)) {
        console.log(`[verifyRadioAccess] 🚫 Bloqueado: UserRadioId: ${user.radioId} | TenantIdReq: ${tenantId} | URL: ${req.originalUrl}`);
        return res.status(403).json({ error: 'No tienes permisos para acceder a esta emisora.' });
    }

    next();
};
