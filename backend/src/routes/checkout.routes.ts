import { Router } from 'express';
import { crearPreferencia } from '../controllers/checkout.controller';

const router = Router();

// POST /api/v1/checkout/crear-preferencia
// Body: { plan, ciclo, nombre, email, telefono }
router.post('/crear-preferencia', crearPreferencia);

export default router;
