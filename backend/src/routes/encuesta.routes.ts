import { Router } from 'express';
import { 
    crearEncuesta, 
    obtenerEncuestaActiva, 
    votar, 
    obtenerEncuestaPorNoticia, 
    listarEncuestas,
    editarEncuesta,
    eliminarEncuesta,
    obtenerReporteEncuesta
} from '../controllers/encuesta.controller';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

// --- RUTAS PÚBLICAS (PORTAL) ---
router.get('/activa', injectTenant, obtenerEncuestaActiva);
router.post('/votar/:opcionId', injectTenant, votar);
router.get('/noticia/:noticiaId', injectTenant, obtenerEncuestaPorNoticia);

// --- RUTAS PROTEGIDAS (ADMIN) ---
router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); // BLOQUEO CRÍTICO: El usuario debe pertenecer a este tenant

router.get('/todas', listarEncuestas);
router.post('/', crearEncuesta);
router.put('/:id', editarEncuesta);
router.delete('/:id', eliminarEncuesta);
router.get('/:id/reporte', obtenerReporteEncuesta);

export default router;
