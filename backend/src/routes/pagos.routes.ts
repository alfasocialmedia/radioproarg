import { Router } from 'express';
import { getTodosPagos } from '../controllers/pagos.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas aquí dentro requieren token y rol de SUPER_ADMIN
router.use(authenticateToken);
router.use(requireRoles(['SUPER_ADMIN']));

router.get('/todos', getTodosPagos);

export default router;
