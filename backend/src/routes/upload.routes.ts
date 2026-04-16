import { Router } from 'express';
import { upload, subirImagen, subirArchivo, listarMedia, eliminarMedia } from '../controllers/upload.controller';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

// POST /api/v1/upload/imagen — compatible con legacy
router.post('/imagen', injectTenant, upload.single('imagen'), subirImagen);

// GESTOR DE MEDIOS CENTRALIZADO
// POST /api/v1/upload — subida universal (usa el campo "file")
router.post('/', injectTenant, upload.single('file'), subirArchivo);

// GET /api/v1/upload/media — listar archivos de la radio
router.get('/media', injectTenant, listarMedia);

// DELETE /api/v1/upload/:id — eliminar archivo
router.delete('/:id', eliminarMedia);

export default router;
