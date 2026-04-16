import { Router } from 'express';
import { listarBanners, listarAuspiciantes, crearAuspiciante, crearBanner, eliminarBanner, actualizarBanner } from '../controllers/publicidad.controller';
import { injectTenant } from '../middlewares/tenant.middleware';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';

const router = Router();

router.get('/banners', injectTenant, listarBanners);

router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); 
router.use(requireRoles(['ADMIN_RADIO', 'LOCUTOR']));

router.get('/auspiciantes', listarAuspiciantes);
router.post('/auspiciantes', crearAuspiciante);
router.post('/banners', crearBanner);
router.put('/banners/:id', actualizarBanner);
router.delete('/banners/:id', eliminarBanner);

export default router;
