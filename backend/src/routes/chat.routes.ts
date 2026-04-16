import { Router } from 'express';
import { getHistorial, marcarLeidos } from '../controllers/chat.controller';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.get('/public/:radioId', getHistorial);

router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); 
router.use(requireRoles(['ADMIN_RADIO', 'LOCUTOR', 'SUPER_ADMIN']));

router.get('/', getHistorial);
router.post('/marcar-leidos', marcarLeidos);

export default router;
