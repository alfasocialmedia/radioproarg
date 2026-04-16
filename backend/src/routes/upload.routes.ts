import { Router } from 'express';
import { upload, subirImagen, subirArchivo, listarMedia, eliminarMedia } from '../controllers/upload.controller';
import { injectTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.post('/imagen', injectTenant, upload.single('imagen'), subirImagen);
router.post('/', injectTenant, upload.single('file'), subirArchivo);
router.get('/media', injectTenant, listarMedia);
router.delete('/:id', eliminarMedia);

export default router;
