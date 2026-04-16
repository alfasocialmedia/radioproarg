import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// [Admin] Crear Encuesta
export const crearEncuesta = async (req: Request, res: Response): Promise<void> => {
    try {
        const radioId = (req as any).tenantId;
        const { pregunta, opciones, noticiaId, estado, estilo, fechaFin, mostrarResultados } = req.body; 

        // Si es una encuesta global, podemos desactivar las anteriores
        if (!noticiaId && estado === "PUBLISHED") {
            await prisma.encuesta.updateMany({
                where: { radioId, noticiaId: null, activa: true },
                data: { activa: false, estado: "CLOSED" }
            });
        }

        // Crear la nueva
        const nuevaEncuesta = await prisma.encuesta.create({
            data: {
                radioId,
                pregunta,
                noticiaId: noticiaId || null,
                estado: estado || "PUBLISHED",
                estilo: estilo || "premium",
                mostrarResultados: mostrarResultados !== undefined ? mostrarResultados : true,
                fechaFin: fechaFin ? new Date(fechaFin) : null,
                activa: estado === "PUBLISHED",
                opciones: {
                    create: opciones.map((opt: any, index: number) => ({ 
                        texto: typeof opt === 'string' ? opt : opt.texto,
                        imagenUrl: typeof opt === 'object' ? opt.imagenUrl : null,
                        orden: typeof opt === 'object' && opt.orden !== undefined ? opt.orden : index
                    }))
                }
            },
            include: { opciones: true }
        });

        // Emitir WS solo si está publicada
        if (estado === "PUBLISHED") {
            const io = req.app.get('io');
            if (io) {
                io.to(radioId).emit('nueva_encuesta', nuevaEncuesta);
            }
        }

        res.status(201).json(nuevaEncuesta);
    } catch (error) {
        console.error("Error al crear encuesta", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};

// [Publico] Obtener Activa
export const obtenerEncuestaActiva = async (req: Request, res: Response): Promise<void> => {
    try {
        const radioId = (req as any).tenantId; 
        const ahora = new Date();
        const encuesta = await prisma.encuesta.findFirst({
            where: { 
                radioId, 
                activa: true,
                estado: "PUBLISHED",
                OR: [
                    { fechaFin: null },
                    { fechaFin: { gt: ahora } }
                ]
            },
            include: { opciones: true },
            orderBy: { creadaEn: 'desc' }
        });

        if (!encuesta) {
            res.json(null);
            return;
        }
        res.json(encuesta);
    } catch (error) {
        console.error("Error al obtener encuesta activa", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};

// [Admin] Listar Todas
export const listarEncuestas = async (req: Request, res: Response): Promise<void> => {
    try {
        const radioId = (req as any).tenantId;
        const encuestas = await prisma.encuesta.findMany({
            where: { radioId },
            include: { 
                opciones: {
                    orderBy: { orden: 'asc' }
                },
                noticia: { select: { titulo: true } }
            },
            orderBy: { creadaEn: 'desc' }
        });
        res.json(encuestas);
    } catch (error) {
        console.error("Error al listar encuestas", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};

// [Publico] Votar
export const votar = async (req: Request, res: Response): Promise<void> => {
    try {
        const opcionId = req.params.opcionId as string;

        const opcion = await prisma.opcionEncuesta.update({
            where: { id: opcionId },
            data: { votos: { increment: 1 } },
            include: { encuesta: true }
        });

        // Enviar resultados actualizados por WS
        const encuestaActualizada = await prisma.encuesta.findUnique({
            where: { id: opcion.encuestaId },
            include: { 
                opciones: {
                    orderBy: { orden: 'asc' }
                }
            }
        });

        const io = req.app.get('io');
        if (io && encuestaActualizada) {
            io.to(encuestaActualizada.radioId).emit('votos_actualizados', encuestaActualizada);
        }

        res.json(encuestaActualizada);
    } catch (error) {
        console.error("Error al votar", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};

// [Publico] Obtener Encuesta por Noticia
export const obtenerEncuestaPorNoticia = async (req: Request, res: Response): Promise<void> => {
    try {
        const noticiaId = req.params.noticiaId as string;
        const encuesta = await prisma.encuesta.findFirst({
            where: { noticiaId, activa: true },
            include: { 
                opciones: {
                    orderBy: { orden: 'asc' }
                }
            },
            orderBy: { creadaEn: 'desc' }
        });

        res.json(encuesta || null);
    } catch (error) {
        console.error("Error al obtener encuesta por noticia", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};

// [Admin] Editar Encuesta
export const editarEncuesta = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const radioId = (req as any).tenantId;
        const { pregunta, estado, estilo, fechaFin, noticiaId, activa, opciones, mostrarResultados } = req.body;

        // Verificar pertenencia
        const existente = await prisma.encuesta.findFirst({ where: { id, radioId } });
        if (!existente) {
            res.status(403).json({ msg: "No tienes permiso para editar esta encuesta" });
            return;
        }

        // 1. Actualizar datos básicos
        const encuesta = await prisma.encuesta.update({
            where: { id },
            data: {
                pregunta,
                estado,
                estilo,
                mostrarResultados: mostrarResultados !== undefined ? mostrarResultados : undefined,
                fechaFin: fechaFin ? new Date(fechaFin) : undefined,
                noticiaId: noticiaId !== undefined ? (noticiaId || null) : undefined,
                activa: activa !== undefined ? activa : (estado === "PUBLISHED")
            }
        });

        // 2. Sincronizar opciones si vienen en el body
        if (opciones && Array.isArray(opciones)) {
            const opcionesIds = opciones.map(o => o.id).filter(Boolean);
            
            // Borrar las que ya no están
            await prisma.opcionEncuesta.deleteMany({
                where: { 
                    encuestaId: id,
                    id: { notIn: opcionesIds }
                }
            });

            // Upsert de las restantes
            for (const [index, opt] of opciones.entries()) {
                if (!opt.id) {
                    await prisma.opcionEncuesta.create({
                        data: {
                            encuestaId: id,
                            texto: opt.texto,
                            imagenUrl: opt.imagenUrl || null,
                            votos: 0,
                            orden: opt.orden !== undefined ? opt.orden : index
                        }
                    });
                } else {
                    await prisma.opcionEncuesta.update({
                        where: { id: opt.id },
                        data: { 
                            texto: opt.texto,
                            imagenUrl: opt.imagenUrl || null,
                            orden: opt.orden !== undefined ? opt.orden : index
                        }
                    });
                }
            }
        }

        const encuestaCompleta = await prisma.encuesta.findUnique({
            where: { id },
            include: { 
                opciones: {
                    orderBy: { orden: 'asc' }
                }
            }
        });

        // Emitir WS
        const io = req.app.get('io');
        if (io && encuestaCompleta) {
            io.to(encuestaCompleta.radioId).emit('nueva_encuesta', encuestaCompleta);
        }

        res.json(encuestaCompleta);
    } catch (error) {
        console.error("Error al editar encuesta:", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};

// [Admin] Obtener Reporte Detallado
export const obtenerReporteEncuesta = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const radioId = (req as any).tenantId;

        const encuesta = await prisma.encuesta.findFirst({
            where: { id, radioId },
            include: { 
                opciones: {
                    orderBy: { orden: 'asc' }
                }
            }
        });

        if (!encuesta) {
            res.status(404).json({ msg: "Encuesta no encontrada" });
            return;
        }

        const totalVotos = (encuesta as any).opciones.reduce((acc: number, opt: any) => acc + opt.votos, 0);
        
        const reporte = {
            id: encuesta.id,
            pregunta: encuesta.pregunta,
            totalVotos,
            estado: encuesta.estado,
            creadaEn: encuesta.creadaEn,
            opciones: (encuesta as any).opciones.map((opt: any) => ({
                id: opt.id,
                texto: opt.texto,
                votos: opt.votos,
                porcentaje: totalVotos > 0 ? Math.round((opt.votos / totalVotos) * 100) : 0,
                imagenUrl: opt.imagenUrl
            }))
        };

        res.json(reporte);
    } catch (error) {
        console.error("Error al obtener reporte", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};

// [Admin] Eliminar Encuesta
export const eliminarEncuesta = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const radioId = (req as any).tenantId;
        
        // Verificar pertenencia
        const existente = await prisma.encuesta.findFirst({ where: { id, radioId } });
        if (!existente) {
            res.status(403).json({ msg: "No tienes permiso para eliminar esta encuesta" });
            return;
        }

        // Primero eliminar opciones
        await prisma.opcionEncuesta.deleteMany({ where: { encuestaId: id } });
        await prisma.encuesta.delete({ where: { id } });

        res.json({ msg: "Encuesta eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar encuesta", error);
        res.status(500).json({ msg: "Error del servidor" });
    }
};
