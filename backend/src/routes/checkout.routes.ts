import { Router } from 'express';
import { crearPreferencia } from '../controllers/checkout.controller';

const router = Router();

router.post('/crear-preferencia', crearPreferencia);

export default router;
