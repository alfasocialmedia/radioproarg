import { prisma } from '../config/prisma';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export const startStatsWorker = () => {
    // Ejecutar cada 15 minutos = 15 * 60 * 1000 = 900000 ms
    const INTERVAL = 15 * 60 * 1000;
    
    console.log(`[Worker] Inicializando recolector de estadísticas (Intervalo: ${INTERVAL / 60000} mins)`);
    
    // Lo ejecutamos la primera vez con un retraso de 30 segundos para que el server termine de levantar
    setTimeout(() => {
        recolectarStats();
        setInterval(recolectarStats, INTERVAL);
    }, 30000);
};

export const recolectarStats = async () => {
    console.log('[Worker] Recolectando estadísticas en vivo de todas las emisoras activas...');
    try {
        const radios = await prisma.radio.findMany({
            where: { activa: true },
            select: { id: true, streamUrl: true }
        });

        const parser = new XMLParser();

        let procesadas = 0;
        let fallidas = 0;

        // Procesamos concurrentemente
        await Promise.allSettled(radios.map(async (radio) => {
            if (!radio.streamUrl) return;

            try {
                // Sacar stats.xml
                const parts = radio.streamUrl.split('/');
                const baseUrl = parts.slice(0, 3).join('/');
                const mount = parts[3];

                const xmlUrl = `${baseUrl}/admin/stats.xml`;

                // Pedimos el XML a Icecast (Intentamos sin auth primero, suele estar público)
                const res = await axios.get(xmlUrl, { timeout: 10000 });
                const json = parser.parse(res.data);

                let source = json?.icestats?.source;
                let listeners = 0;

                if (Array.isArray(source)) {
                    const mountObj = source.find((s: any) => s['@_mount'] === `/${mount}`);
                    if (mountObj) listeners = Number(mountObj.listeners) || 0;
                } else if (source && source['@_mount'] === `/${mount}`) {
                    listeners = Number(source.listeners) || 0;
                }

                // Guardar en la base de datos
                await prisma.estadisticaListener.create({
                    data: {
                        radioId: radio.id,
                        cantidad: listeners,
                        // fecha usa default(now())
                    }
                });

                procesadas++;
            } catch (err) {
                // Silencio: si falla una emisora (no tiene stats.xml publico o está down) no rompemos el cron
                fallidas++;
            }
        }));

        console.log(`[Worker] Recolección finalizada. Procesadas: ${procesadas}. Fallidas/Sin datos: ${fallidas}.`);
    } catch (error) {
        console.error('[Worker] Error crítico al recolectar stats:', error);
    }
};
