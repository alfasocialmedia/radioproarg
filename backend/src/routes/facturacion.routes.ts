import { Router } from 'express';
import { getFacturacion, getDetallePago, getResumenFacturacion } from '../controllers/facturacion.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authenticateToken);
router.use(injectTenant);
router.use(requireRoles(['ADMIN_RADIO', 'SUPER_ADMIN']));

router.get('/pagos', getFacturacion);
router.get('/pagos/resumen', getResumenFacturacion);
router.get('/pagos/:id', getDetallePago);

export default router;
