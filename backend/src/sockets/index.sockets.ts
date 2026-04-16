import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const JWT_SECRET = (process.env.JWT_SECRET as string) || 'DEV_SECRET_CHANGE_ME';

export const inicializarWebSockets = (io: Server) => {
    // Middleware de autenticación para Sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                socket.data.user = decoded;
            } catch (err) {
                console.log("[SOCKET] Token inválido en conexión.");
            }
        }
        next();
    });

    io.on('connection', (socket: Socket) => {
        // Cuando el cliente web se conecta, debe emitir su radioId (subdominio) 
        // para unirse a su propia sala
        socket.on('unirse_a_radio', (radioId: string) => {
            socket.join(radioId);
            console.log(`Cliente suscrito a la radio: ${radioId}`);
        });

        // Chat
        socket.on('enviar_mensaje_chat', async (data: { radioId: string; usuario: string; texto: string; esAdmin?: boolean; replyToId?: string }) => {
            try {
                const user = socket.data.user;

                // VALIDACIÓN DE SEGURIDAD: Solo admins autenticados pueden enviar mensajes oficiales
                let finalEsAdmin = false;
                if (data.esAdmin) {
                    if (user && (user.rol === 'ADMIN_RADIO' || user.rol === 'SUPER_ADMIN')) {
                        // Si es Admin de Radio, debe ser su propia radio
                        if (user.rol === 'ADMIN_RADIO' && user.radioId !== data.radioId) {
                            finalEsAdmin = false; 
                        } else {
                            finalEsAdmin = true;
                        }
                    } else {
                        finalEsAdmin = false; // Intento de suplantación detectado
                    }
                }

                // Guardar en base de datos
                const msjGuardado = await prisma.chatMensaje.create({
                    data: {
                        radioId: data.radioId,
                        nombreEmisor: data.usuario || 'Anónimo',
                        texto: data.texto,
                        leido: false,
                        esAdmin: finalEsAdmin,
                        replyToId: data.replyToId || null
                    },
                    include: {
                        replyTo: true
                    }
                });

                // Retransmitimos el mensaje PÚBLICO y ADMIN a todos los de esa sala (Esa emisora)
                const payload = {
                    id: msjGuardado.id,
                    usuario: msjGuardado.nombreEmisor,
                    texto: msjGuardado.texto,
                    hora: msjGuardado.fechaCreacion,
                    leido: false,
                    esAdmin: msjGuardado.esAdmin,
                    replyTo: msjGuardado.replyTo ? {
                        usuario: msjGuardado.replyTo.nombreEmisor,
                        texto: msjGuardado.replyTo.texto
                    } : null
                };

                console.log(`[SOCKET] Emitiendo nuevo_mensaje_chat a la sala ${data.radioId}:`, payload.texto);
                io.to(data.radioId).emit('nuevo_mensaje_chat', payload);
            } catch (error) {
                console.error("Error guardando mensaje de chat en socket:", error);
            }
        });

        // Control Interno: Recaudador de metadatos de Stream (Icecast)
        socket.on('actualizar_metadata_stream', (data: { radioId: string; cancionActual: string }) => {
            // Re-emitir a todos los oyentes de ese portal 
            io.to(data.radioId).emit('metadata_stream', { cancion: data.cancionActual });
        });

        // Editar Mensaje (Solo para Admin autorizado)
        socket.on('editar_mensaje_chat', async (data: { id: string; radioId: string; nuevoTexto: string }) => {
            try {
                const user = socket.data.user;
                if (!user || (user.rol !== 'ADMIN_RADIO' && user.rol !== 'SUPER_ADMIN')) {
                    return; // No autorizado
                }

                // Si es admin de radio, verificar que el mensaje pertenece a su radio
                if (user.rol === 'ADMIN_RADIO' && user.radioId !== data.radioId) {
                    return; 
                }

                const msjActualizado = await prisma.chatMensaje.update({
                    where: { 
                        id: data.id,
                        radioId: data.radioId // Asegurar que el mensaje borrado sea de la radio correcta
                    },
                    data: { texto: data.nuevoTexto }
                });

                // Notificar a todos la edición
                io.to(data.radioId).emit('mensaje_chat_editado', {
                    id: msjActualizado.id,
                    nuevoTexto: msjActualizado.texto
                });
            } catch (error) {
                console.error("Error editando mensaje de chat en socket:", error);
            }
        });

        socket.on('disconnect', () => {
            // cleanup si fuera necesario
        });
    });
};
