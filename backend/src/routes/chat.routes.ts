import { Router } from 'express';
import { getHistorial, marcarLeidos } from '../controllers/chat.controller';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

// Ruta pública para el portal (Oyentes)
router.get('/public/:radioId', getHistorial);

// Todas las rutas de chat de admin necesitan Auth, un Tenant y permisos
router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); // BLOQUEO CRÍTICO: El usuario debe pertenecer a este tenant
router.use(requireRoles(['ADMIN_RADIO', 'LOCUTOR', 'SUPER_ADMIN']));

router.get('/', getHistorial);
router.post('/marcar-leidos', marcarLeidos);

export default router;
