import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

export const getUsuarios = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const usuarios = await prisma.usuario.findMany({
            where: { radioId },
            select: { id: true, nombre: true, email: true, rol: true, activo: true, telefono: true, fechaCreacion: true }
        });
        res.json(usuarios);
    } catch (error) {
        console.error('getUsuarios Error:', error);
        res.status(500).json({ error: 'Error obteniendo usuarios.' });
    }
};

export const createUsuario = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { nombre, email, password, rol, telefono } = req.body;

        const existe = await prisma.usuario.findUnique({ where: { email } });
        if (existe) {
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevo = await prisma.usuario.create({
            data: {
                nombre,
                email,
                passwordHash,
                rol,
                telefono,
                radioId
            },
            select: { id: true, nombre: true, email: true, rol: true, activo: true }
        });

        res.status(201).json(nuevo);
    } catch (error) {
        console.error('createUsuario Error:', error);
        res.status(500).json({ error: 'Error al crear usuario.' });
    }
};

export const updateUsuario = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const id = req.params.id as string;
        const { nombre, rol, telefono, activo, password } = req.body;

        const user = await prisma.usuario.findFirst({ where: { id, radioId } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const dataUpdate: any = {
            ...(nombre !== undefined && { nombre }),
            ...(rol !== undefined && { rol }),
            ...(telefono !== undefined && { telefono }),
            ...(activo !== undefined && { activo })
        };

        if (password) {
            dataUpdate.passwordHash = await bcrypt.hash(password, 10);
        }

        const actualizado = await prisma.usuario.update({
            where: { id },
            data: dataUpdate,
            select: { id: true, nombre: true, email: true, rol: true, activo: true }
        });

        res.json(actualizado);
    } catch (error) {
        console.error('updateUsuario Error:', error);
        res.status(500).json({ error: 'Error al actualizar usuario.' });
    }
};

export const deleteUsuario = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const { id } = req.params;

        const user = await prisma.usuario.findFirst({ where: { id: String(id), radioId } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        await prisma.usuario.delete({ where: { id: String(id) } });
        res.json({ mensaje: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('deleteUsuario error:', error);
        res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
};
