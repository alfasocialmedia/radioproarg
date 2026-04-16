import { Server } from 'socket.io';
import { prisma } from '../config/prisma';

export class IcecastService {
    private static intervalId: NodeJS.Timeout | null = null;
    private static io: Server | null = null;

    static startPolling(io: Server) {
        this.io = io;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        console.log('📻 Iniciando Icecast Metadata Polling Service...');
        
        // Ejecutar cada 15 segundos
        this.intervalId = setInterval(() => {
            this.pollMetadata();
        }, 15000);

        // Primera ejecución inmediata
        this.pollMetadata();
    }

    static stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('🛑 Icecast Metadata Polling detenido.');
        }
    }

    private static async pollMetadata() {
        if (!this.io) return;

        try {
            const radios = await prisma.radio.findMany({
                where: {
                    streamUrl: { not: null }
                },
                select: { id: true, streamUrl: true, nombre: true }
            });

            for (const radio of radios) {
                if (!radio.streamUrl) continue;

                try {
                    const urlObj = new URL(radio.streamUrl);
                    const statsUrl = `${urlObj.protocol}//${urlObj.host}/status-json.xsl`;
                    
                    const response = await fetch(statsUrl, { signal: AbortSignal.timeout(4000) });
                    if (!response.ok) continue;

                    const data = await response.json();
                    let currentTrack = 'Transmitiendo en vivo';

                    if (data?.icestats?.source) {
                        if (Array.isArray(data.icestats.source)) {
                            const mount = data.icestats.source.find((s: any) => s.listenurl?.endsWith(urlObj.pathname));
                            if (mount && mount.title) {
                                currentTrack = mount.title;
                            } else if (mount && mount.server_name) {
                                currentTrack = mount.server_name;
                            } else if (data.icestats.source[0]?.title) {
                                currentTrack = data.icestats.source[0].title;
                            }
                        } else {
                            if (data.icestats.source.title) {
                                currentTrack = data.icestats.source.title;
                            } else if (data.icestats.source.server_name) {
                                currentTrack = data.icestats.source.server_name;
                            }
                        }
                    }

                    // Decode HTML entities if any (like &amp;) - basic replace
                    currentTrack = currentTrack.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

                    // Emitir a los clientes conectados a este radioId
                    this.io.to(radio.id).emit('metadata_stream', { cancion: currentTrack });
                } catch (e) {
                    // Fail silently for individual failing streams (offline, etc)
                }
            }
        } catch (error) {
            console.error('Error general en IcecastService pollMetadata:', error);
        }
    }
}
