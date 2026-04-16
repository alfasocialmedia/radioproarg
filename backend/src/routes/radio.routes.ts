import { Router } from 'express';
import { getRadioConfig, createRadio, getRadios, eliminarRadio, updateRadioConfig, getRadioStats, getHistoricalStats, provisionRadio, getStorageStats } from '../controllers/radio.controller';
import { webhookMetadata, updateDonaciones } from '../controllers/radioExtras.controller';
import { injectTenant } from '../middlewares/tenant.middleware';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

// Rutas de configuración de radio - Actualizado: 28/03/2026 15:45
const router = Router();

router.get('/config', injectTenant, getRadioConfig);
router.put('/config', authenticateToken, injectTenant, updateRadioConfig);
router.get('/stats', authenticateToken, injectTenant, getRadioStats);
router.get('/stats/storage', authenticateToken, injectTenant, getStorageStats);
router.get('/stats/historical', authenticateToken, injectTenant, getHistoricalStats);
router.get('/', getRadios);
router.get('/all', getRadios);
router.post('/', createRadio);
router.put('/:id/config', updateRadioConfig);
router.post('/:id/provision', provisionRadio);
router.delete('/:id', eliminarRadio);

router.post('/:radioId/metadata', webhookMetadata);
router.put('/:radioId/donaciones', updateDonaciones);

export default router;
