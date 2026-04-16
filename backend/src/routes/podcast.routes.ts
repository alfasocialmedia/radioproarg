import { Router } from 'express';
import { getPodcasts, getPodcastById, createPodcast, updatePodcast, deletePodcast } from '../controllers/podcast.controller';
import { getEpisodiosPorPodcast, createEpisodio, updateEpisodio, deleteEpisodio, getEpisodiosRecientes } from '../controllers/episodio.controller';
import { requireRoles, authenticateToken, verifyRadioAccess } from '../middlewares/auth.middleware';
import { injectTenant } from '../middlewares/tenant.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Storage config para audios
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Rutas Públicas de consumo (requiere injectTenant para saber la radio)
router.get('/public', injectTenant, getPodcasts);
router.get('/public/episodios/recientes', injectTenant, getEpisodiosRecientes);
router.get('/public/:podcastId/episodios', injectTenant, getEpisodiosPorPodcast);

// Proteccion general (Admin o Editor)
router.use(authenticateToken);
router.use(injectTenant);
router.use(verifyRadioAccess); // BLOQUEO CRÍTICO: El usuario debe pertenecer a este tenant
router.use(requireRoles(['ADMIN_RADIO', 'EDITOR_NOTICIAS']));

// Rutas de Podcast (Programas)
router.get('/', getPodcasts);
router.get('/:id', getPodcastById);
router.post('/', createPodcast); 
router.put('/:id', updatePodcast);
router.delete('/:id', deletePodcast);

// Rutas de Episodios
router.get('/:podcastId/episodios', getEpisodiosPorPodcast);
router.post('/:podcastId/episodios', upload.single('audioFisico'), createEpisodio);
router.put('/episodios/:id', upload.single('audioFisico'), updateEpisodio);
router.delete('/episodios/:id', deleteEpisodio);

export default router;
