import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupSockets } from './sockets/index.sockets';

// Config
dotenv.config();
const app = express();
const httpServer = createServer(app);

// Sockets
setupSockets(httpServer);

// Middlewares
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (Imports mock for this snippet)
import authRoutes from './routes/auth.routes';
import radioRoutes from './routes/radio.routes';
import superadminRoutes from './routes/superadmin.routes';
import noticiaRoutes from './routes/noticia.routes';
import programacionRoutes from './routes/programacion.routes';
import podcastRoutes from './routes/podcast.routes';
import encuestaRoutes from './routes/encuesta.routes';
import chatRoutes from './routes/chat.routes';
import publicidadRoutes from './routes/publicidad.routes';
import uploadRoutes from './routes/upload.routes';
import facturacionRoutes from './routes/facturacion.routes';
import pushRoutes from './routes/push.routes';
import platformRoutes from './routes/platform.routes';

app.use('/api/auth', authRoutes);
app.use('/api/radio', radioRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/programacion', programacionRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/encuestas', encuestaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/publicidad', publicidadRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/facturacion', facturacionRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/platform', platformRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 ONRADIO Backend running on port ${PORT}`);
});
