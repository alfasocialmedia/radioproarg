import { Router } from 'express';
import { getNoticias, getNoticiaBySlug, getNoticiasAdmin, crearNoticia, eliminarNoticia, actualizarNoticia } from '../controllers/noticia.controller';
import { registrarCompartido, registrarReaccion } from '../controllers/interaccion.controller';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

// Pública: solo noticias publicadas (para el portal)
router.get('/', injectTenant, getNoticias);

// --- RUTAS PROTEGIDAS (ADMIN) ---
// Admin: todas las noticias incluyendo borradores
router.get('/admin/todas', authenticateToken, injectTenant, verifyRadioAccess, getNoticiasAdmin);

// Pública: detalle de una noticia por slug
router.get('/:slug', injectTenant, getNoticiaBySlug);

// Interacciones Públicas
router.post('/:id/compartir', injectTenant, registrarCompartido);
router.post('/:id/reaccionar', injectTenant, registrarReaccion);

// --- RUTAS PROTEGIDAS (ADMIN) ---
router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); // BLOQUEO CRÍTICO: El usuario debe pertenecer a este tenant

// Crear noticia
router.post('/', crearNoticia);
router.put('/:id', actualizarNoticia);
router.delete('/:id', eliminarNoticia);

export default router;
