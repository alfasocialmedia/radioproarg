import { Router } from 'express';
import { getProgramacion, crearPrograma, actualizarPrograma, eliminarPrograma } from '../controllers/programacion.controller';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.get('/', injectTenant, getProgramacion);

router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); 
router.use(requireRoles(['ADMIN_RADIO', 'LOCUTOR']));

router.post('/', crearPrograma);
router.put('/:id', actualizarPrograma);
router.delete('/:id', eliminarPrograma);

export default router;
