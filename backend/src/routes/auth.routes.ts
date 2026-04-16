import { Router } from 'express';
import { loginUsuario, registrarUsuario, getMe, updateMe } from '../controllers/auth.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', loginUsuario);
router.post('/register', authenticateToken, requireRoles(['SUPER_ADMIN']), registrarUsuario);
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);

export default router;
