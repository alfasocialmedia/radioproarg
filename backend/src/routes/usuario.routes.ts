import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../controllers/usuario.controller';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.get('/', injectTenant, getUsuarios);
router.post('/', injectTenant, createUsuario);
router.put('/:id', injectTenant, updateUsuario);
router.delete('/:id', injectTenant, deleteUsuario);

export default router;
