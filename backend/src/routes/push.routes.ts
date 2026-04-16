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

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', injectTenant, subscribe);
router.delete('/unsubscribe', unsubscribe);

router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess);  
router.use(requireRoles(['ADMIN_RADIO', 'SUPER_ADMIN', 'LOCUTOR']));

router.post('/send', sendNotification);
router.get('/history', getHistory);
router.get('/count', getSubscriberCount);

export default router;
