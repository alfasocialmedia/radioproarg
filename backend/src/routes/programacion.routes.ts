import { Router } from 'express';
import { getProgramacion, crearPrograma, actualizarPrograma, eliminarPrograma } from '../controllers/programacion.controller';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

// Públicas
router.get('/', injectTenant, getProgramacion);

// Todas las que bajen de acá necesitan Auth, Tenant y Aislamiento
router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); // BLOQUEO CRÍTICO: El usuario debe pertenecer a este tenant
router.use(requireRoles(['ADMIN_RADIO', 'LOCUTOR']));

// Protegidas
router.post('/', crearPrograma);
router.put('/:id', actualizarPrograma);
router.delete('/:id', eliminarPrograma);

export default router;
