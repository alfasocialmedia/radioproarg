import { Router } from 'express';
import { injectTenant } from '../middlewares/tenant.middleware';
import { authenticateToken, requireRoles, verifyRadioAccess } from '../middlewares/auth.middleware';
import {
    getVapidPublicKey,
    subscribe,
    unsubscribe,
    sendNotification,
    getHistory,
    getSubscriberCount,
} from '../controllers/push.controller';

const router = Router();

// Pública: la clave VAPID la necesita el SW antes de hacer login
router.get('/vapid-public-key', getVapidPublicKey);

// El navegador del oyente se suscribe (usa tenant por header x-tenant)
router.post('/subscribe', injectTenant, subscribe);
router.delete('/unsubscribe', unsubscribe);

// Rutas de administrador (requieren auth, tenant y aislamiento)
router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); // BLOQUEO CRÍTICO: El usuario debe pertenecer a este tenant
router.use(requireRoles(['ADMIN_RADIO', 'SUPER_ADMIN', 'LOCUTOR']));

router.post('/send', sendNotification);
router.get('/history', getHistory);
router.get('/count', getSubscriberCount);

export default router;
