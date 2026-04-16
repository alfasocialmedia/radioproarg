import { Router } from 'express';
import { getNoticias, getNoticiaBySlug, getNoticiasAdmin, crearNoticia, eliminarNoticia, actualizarNoticia } from '../controllers/noticia.controller';
import { registrarCompartido, registrarReaccion } from '../controllers/interaccion.controller';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.get('/', injectTenant, getNoticias);
router.get('/admin/todas', authenticateToken, injectTenant, verifyRadioAccess, getNoticiasAdmin);
router.get('/:slug', injectTenant, getNoticiaBySlug);

router.post('/:id/compartir', injectTenant, registrarCompartido);
router.post('/:id/reaccionar', injectTenant, registrarReaccion);

router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); 

router.post('/', crearNoticia);
router.put('/:id', actualizarNoticia);
router.delete('/:id', eliminarNoticia);

export default router;
