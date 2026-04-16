import { Router } from 'express';
import { getDashboardStats, getTodasRadios, toggleEstadoRadio } from '../controllers/superadmin.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas aquí dentro requieren token y rol de SUPER_ADMIN indiscutiblemente
router.use(authenticateToken);
router.use(requireRoles(['SUPER_ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/radios', getTodasRadios);
router.put('/radios/:id/toggle-estado', toggleEstadoRadio);

export default router;
