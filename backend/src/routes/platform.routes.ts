import { Router } from 'express';
import { getPlanes, createPlan, updatePlan, deletePlan, getSettings, upsertSetting, upsertManySettings } from '../controllers/planes.controller';
import { getPagosRadio, getTodosPagos, getDatosTransmision } from '../controllers/pagos.controller';
import { crearTicket, getTickets, getTicketsAdmin, responderTicket, cerrarTicket, agregarMensajeTicket } from '../controllers/ticket.controller';
import { getFaq, saveFaq, getTutoriales, saveTutoriales, askFaqAI } from '../controllers/contenido.controller';
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../controllers/categoria.controller';
import { injectTenant } from '../middlewares/tenant.middleware';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/faq', getFaq);
router.post('/faq/ask-ai', askFaqAI);  
router.get('/planes', getPlanes);       
router.get('/tutoriales', getTutoriales); 
router.get('/settings', getSettings);   

router.use(authenticateToken);

router.post('/planes', requireRoles(['SUPER_ADMIN']), createPlan);
router.put('/planes/:id', requireRoles(['SUPER_ADMIN']), updatePlan);
router.delete('/planes/:id', requireRoles(['SUPER_ADMIN']), deletePlan);

router.get('/pagos/radio', injectTenant, getPagosRadio);
router.get('/pagos/admin', requireRoles(['SUPER_ADMIN']), getTodosPagos);
router.get('/transmision', injectTenant, getDatosTransmision);

router.post('/tickets', injectTenant, crearTicket);
router.get('/tickets', injectTenant, getTickets);
router.get('/tickets/admin', requireRoles(['SUPER_ADMIN']), getTicketsAdmin);
router.put('/tickets/:id/responder', requireRoles(['SUPER_ADMIN']), responderTicket);
router.put('/tickets/:id/cerrar', requireRoles(['SUPER_ADMIN']), cerrarTicket);
router.post('/tickets/:id/mensajes', injectTenant, agregarMensajeTicket);

router.post('/settings', requireRoles(['SUPER_ADMIN']), upsertSetting);
router.post('/settings/bulk', requireRoles(['SUPER_ADMIN']), upsertManySettings);

router.post('/faq', requireRoles(['SUPER_ADMIN']), saveFaq);
router.post('/tutoriales', requireRoles(['SUPER_ADMIN']), saveTutoriales);

router.get('/categorias', injectTenant, getCategorias);
router.post('/categorias', injectTenant, crearCategoria);
router.put('/categorias/:id', injectTenant, actualizarCategoria);
router.delete('/categorias/:id', injectTenant, eliminarCategoria);

export default router;
