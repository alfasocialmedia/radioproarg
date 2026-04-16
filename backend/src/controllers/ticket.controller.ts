import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { enviarEmailTicketRespuesta } from '../services/email.service';

export const crearTicket = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { asunto, mensaje } = req.body;

        if (!asunto || !mensaje) return res.status(400).json({ error: 'Asunto y mensaje son requeridos.' });

        const usuario = await prisma.usuario.findFirst({ where: { radioId } });
        if (!usuario) return res.status(400).json({ error: 'No se encontró el usuario de esta radio.' });

        const ticket = await prisma.ticket.create({
            data: {
                radioId,
                usuarioId: usuario.id,
                asunto,
                mensajes: {
                    create: { autorId: usuario.id, contenido: mensaje, esAdmin: false }
                }
            },
            include: { mensajes: true }
        });

        res.status(201).json(ticket);
    } catch (e) { res.status(500).json({ error: 'Error creando el ticket.' }); }
};

export const getTickets = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const tickets = await prisma.ticket.findMany({
            where: { radioId },
            include: { mensajes: { orderBy: { creadoEn: 'asc' }, include: { autor: { select: { email: true } } } } },
            orderBy: { fechaCreacion: 'desc' }
        });
        res.json(tickets);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo tickets.' }); }
};

export const getTicketsAdmin = async (_req: Request, res: Response) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                radio: { select: { nombre: true, subdominio: true } },
                mensajes: { orderBy: { creadoEn: 'desc' }, take: 1, include: { autor: { select: { email: true } } } }
            },
            orderBy: { fechaCreacion: 'desc' }
        });
        res.json(tickets);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo tickets.' }); }
};

export const responderTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { contenido } = req.body;

        const ticket = await prisma.ticket.findUnique({ where: { id: String(id) }, include: { usuario: true } });
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado.' });

        const superAdmin = await prisma.usuario.findFirst({ where: { rol: 'SUPER_ADMIN' } });
        const autorId = superAdmin?.id || ticket.usuarioId;

        const mensaje = await prisma.ticketMensaje.create({
            data: { ticketId: String(id), autorId: String(autorId), contenido, esAdmin: true }
        });

        if (ticket.estado === 'ABIERTO') {
            await prisma.ticket.update({ where: { id: String(id) }, data: { estado: 'EN_PROCESO' } });
        }

        await enviarEmailTicketRespuesta(ticket.usuario.email, ticket.asunto, String(contenido), String(id));

        res.json(mensaje);
    } catch (e) { res.status(500).json({ error: 'Error respondiendo el ticket.' }); }
};

export const cerrarTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ticket = await prisma.ticket.update({ where: { id: String(id) }, data: { estado: 'CERRADO' } });
        res.json(ticket);
    } catch (e) { res.status(500).json({ error: 'Error cerrando el ticket.' }); }
};

export const agregarMensajeTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radioId = (req as any).tenantId;
        const { contenido } = req.body;

        const usuario = await prisma.usuario.findFirst({ where: { radioId } });
        if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado.' });

        const ticket = await prisma.ticket.findFirst({ where: { id: String(id), radioId: String(radioId) } });
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado.' });
        if (ticket.estado === 'CERRADO') return res.status(400).json({ error: 'El ticket está cerrado.' });

        const mensaje = await prisma.ticketMensaje.create({
            data: { ticketId: String(id), autorId: String(usuario.id), contenido, esAdmin: false }
        });

        res.status(201).json(mensaje);
    } catch (e) { res.status(500).json({ error: 'Error agregando mensaje.' }); }
};
