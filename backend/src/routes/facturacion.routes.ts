import { Router } from 'express';
import { getFacturacion } from '../controllers/facturacion.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authenticateToken);
router.use(injectTenant);
router.use(requireRoles(['ADMIN_RADIO', 'SUPER_ADMIN']));

router.get('/pagos', getFacturacion);

export default router;
