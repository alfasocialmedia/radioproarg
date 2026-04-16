import { Router } from 'express';
import { loginUsuario, registrarUsuario, getMe, updateMe } from '../controllers/auth.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';


const router = Router();

// Endpoint publico para ingresar al sistema administrativo
router.post('/login', loginUsuario);

// Solo el Super Admin puede registrar nuevos usuarios administrativos
router.post('/register', authenticateToken, requireRoles(['SUPER_ADMIN']), registrarUsuario);

// Endpoints de perfil del usuario logueado
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);


export default router;
