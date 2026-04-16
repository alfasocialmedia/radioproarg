import dotenv from 'dotenv';
dotenv.config(); 

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Rutas
import authRoutes from './routes/auth.routes';
import radioRoutes from './routes/radio.routes';
import noticiaRoutes from './routes/noticia.routes';
import programacionRoutes from './routes/programacion.routes';
import publicidadRoutes from './routes/publicidad.routes';
import encuestaRoutes from './routes/encuesta.routes';
import checkoutRoutes from './routes/checkout.routes';
import usuarioRoutes from './routes/usuario.routes';
import uploadRoutes from './routes/upload.routes';
import chatRoutes from './routes/chat.routes';
import facturacionRoutes from './routes/facturacion.routes';
import superadminRoutes from './routes/superadmin.routes';
import platformRoutes from './routes/platform.routes';
import podcastRoutes from './routes/podcast.routes';
import pushRoutes from './routes/push.routes';
import pagosRoutes from './routes/pagos.routes';

// Sockets
import { inicializarWebSockets } from './sockets/index.sockets';
import { IcecastService } from './services/icecast.service';
import { startStatsWorker } from './workers/stats.worker';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, { cors: { origin: '*' } });
inicializarWebSockets(io);
app.set('io', io); 

IcecastService.startPolling(io);
startStatsWorker();

const PORT = process.env.PORT || 4000;

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, 
})); 
app.use(hpp()); 
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: { error: 'Demasiadas peticiones desde esta IP. Inténtalo más tarde.' }
});
app.use('/api/', limiter);

app.use('/uploads', express.static('uploads'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/radios', radioRoutes);
app.use('/api/v1/noticias', noticiaRoutes);
app.use('/api/v1/programacion', programacionRoutes);
app.use('/api/v1/publicidad', publicidadRoutes);
app.use('/api/v1/encuestas', encuestaRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/facturacion', facturacionRoutes);
app.use('/api/v1/superadmin', superadminRoutes);
app.use('/api/v1/podcasts', podcastRoutes);
app.use('/api/v1/push', pushRoutes); 
app.use('/api/v1/pagos', pagosRoutes);
app.use('/api/v1', platformRoutes);

app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', environment: process.env.NODE_ENV });
});

server.listen(PORT, () => {
    console.log(`Backend de ONRADIO escuchando en http://localhost:${PORT}`);
});
