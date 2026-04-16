import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getProgramacion = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;

        const grilla = await prisma.programacion.findMany({
            where: { radioId },
            orderBy: [
                { diaSemana: 'asc' },
                { horaInicio: 'asc' }
            ]
        });

        res.json(grilla);
    } catch (error) {
        console.error('getProgramacion Error:', error);
        res.status(500).json({ error: 'Error interno obteniendo la grilla de programación.' });
    }
};

export const crearPrograma = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { diasSemana, horaInicio, horaFin, nombrePrograma, conductores, imagenPrograma, descripcion, facebook, instagram, twitter, whatsapp } = req.body;

        if (!diasSemana || !Array.isArray(diasSemana) || diasSemana.length === 0) {
            return res.status(400).json({ error: 'Debes seleccionar al menos un día.' });
        }

        const overlapping = await prisma.programacion.findFirst({
            where: {
                radioId,
                diaSemana: { in: diasSemana },
                OR: [
                    { AND: [{ horaInicio: { lte: horaInicio } }, { horaFin: { gt: horaInicio } }] },
                    { AND: [{ horaInicio: { lt: horaFin } }, { horaFin: { gte: horaFin } }] },
                    { AND: [{ horaInicio: { gte: horaInicio } }, { horaFin: { lte: horaFin } }] }
                ]
            }
        });

        if (overlapping) {
            return res.status(400).json({ error: `Ya existe el programa "${overlapping.nombrePrograma}" en ese horario uno de los días seleccionados.` });
        }

        const creados = await Promise.all(diasSemana.map((dia: number) => 
            prisma.programacion.create({
                data: {
                    radioId,
                    diaSemana: dia,
                    horaInicio,
                    horaFin,
                    nombrePrograma,
                    conductores,
                    imagenPrograma,
                    descripcion,
                    facebook,
                    instagram,
                    twitter,
                    whatsapp
                }
            })
        ));

        res.status(201).json(creados);
    } catch (error) {
        console.error('crearPrograma Error:', error);
        res.status(500).json({ error: 'Error al crear programa.' });
    }
};

export const actualizarPrograma = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radioId = (req as any).tenantId;
        const { diaSemana, horaInicio, horaFin, nombrePrograma, conductores, imagenPrograma, descripcion, facebook, instagram, twitter, whatsapp } = req.body;

        const prog = await prisma.programacion.findFirst({ where: { id: String(id), radioId } });
        if (!prog) return res.status(404).json({ error: 'Programa no encontrado o no pertenece a esta radio.' });

        if (diaSemana !== undefined && horaInicio && horaFin) {
            const overlapping = await prisma.programacion.findFirst({
                where: {
                    id: { not: String(id) },
                    radioId,
                    diaSemana: diaSemana,
                    OR: [
                        { AND: [{ horaInicio: { lte: horaInicio } }, { horaFin: { gt: horaInicio } }] },
                        { AND: [{ horaInicio: { lt: horaFin } }, { horaFin: { gte: horaFin } }] },
                        { AND: [{ horaInicio: { gte: horaInicio } }, { horaFin: { lte: horaFin } }] }
                    ]
                }
            });

            if (overlapping) {
                return res.status(400).json({ error: `Conflicto de horario con el programa: ${overlapping.nombrePrograma}.` });
            }
        }

        const actualizado = await prisma.programacion.update({
            where: { id: String(id) },
            data: {
                ...(diaSemana !== undefined && { diaSemana }),
                ...(horaInicio && { horaInicio }),
                ...(horaFin && { horaFin }),
                ...(nombrePrograma && { nombrePrograma }),
                ...(conductores !== undefined && { conductores }),
                ...(imagenPrograma !== undefined && { imagenPrograma }),
                ...(descripcion !== undefined && { descripcion }),
                ...(facebook !== undefined && { facebook }),
                ...(instagram !== undefined && { instagram }),
                ...(twitter !== undefined && { twitter }),
                ...(whatsapp !== undefined && { whatsapp }),
            }
        });

        res.json(actualizado);
    } catch (error) {
        console.error('actualizarPrograma Error:', error);
        res.status(500).json({ error: 'Error al actualizar el programa.' });
    }
};

export const eliminarPrograma = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radioId = (req as any).tenantId;

        const programa = await prisma.programacion.findFirst({
            where: { id: String(id), radioId }
        });

        if (!programa) {
            return res.status(404).json({ error: 'Programa no encontrado o no pertenece a esta radio.' });
        }

        await prisma.programacion.delete({ where: { id: String(id) } });

        res.json({ mensaje: 'Programa eliminado correctamente.' });
    } catch (error) {
        console.error('eliminarPrograma Error:', error);
        res.status(500).json({ error: 'Error al eliminar programa.' });
    }
};
