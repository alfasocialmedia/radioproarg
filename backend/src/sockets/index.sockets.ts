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
        socket.on('unirse_a_radio', (radioId: string) => {
            socket.join(radioId);
            console.log(`Cliente suscrito a la radio: ${radioId}`);
        });

        socket.on('enviar_mensaje_chat', async (data: { radioId: string; usuario: string; texto: string; esAdmin?: boolean; replyToId?: string }) => {
            try {
                const user = socket.data.user;

                let finalEsAdmin = false;
                if (data.esAdmin) {
                    if (user && (user.rol === 'ADMIN_RADIO' || user.rol === 'SUPER_ADMIN')) {
                        if (user.rol === 'ADMIN_RADIO' && user.radioId !== data.radioId) {
                            finalEsAdmin = false; 
                        } else {
                            finalEsAdmin = true;
                        }
                    } else {
                        finalEsAdmin = false; 
                    }
                }

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

                io.to(data.radioId).emit('nuevo_mensaje_chat', payload);
            } catch (error) {
                console.error("Error guardando mensaje de chat en socket:", error);
            }
        });

        socket.on('actualizar_metadata_stream', (data: { radioId: string; cancionActual: string }) => {
            io.to(data.radioId).emit('metadata_stream', { cancion: data.cancionActual });
        });

        socket.on('editar_mensaje_chat', async (data: { id: string; radioId: string; nuevoTexto: string }) => {
            try {
                const user = socket.data.user;
                if (!user || (user.rol !== 'ADMIN_RADIO' && user.rol !== 'SUPER_ADMIN')) {
                    return; 
                }

                if (user.rol === 'ADMIN_RADIO' && user.radioId !== data.radioId) {
                    return; 
                }

                const msjActualizado = await prisma.chatMensaje.update({
                    where: { 
                        id: data.id,
                        radioId: data.radioId 
                    },
                    data: { texto: data.nuevoTexto }
                });

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
