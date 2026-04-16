import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET as string) || 'DEV_SECRET_CHANGE_ME';

export const loginUsuario = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son requeridos.' });
        }

        const unUsuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!unUsuario) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const isValidPassword = await bcrypt.compare(password, unUsuario.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Firma del token (Valid 24hs)
        const token = jwt.sign(
            {
                userId: unUsuario.id,
                radioId: unUsuario.radioId,
                rol: unUsuario.rol
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Autenticado correctamente',
            token,
            usuario: {
                id: unUsuario.id,
                email: unUsuario.email,
                rol: unUsuario.rol,
                radioId: unUsuario.radioId
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
    }
};

export const registrarUsuario = async (req: Request, res: Response) => {
    try {
        const { email, password, rol, radioId } = req.body;

        // TODO: En produccion, este endpoint debiera estar protegido y solo un Super Admin 
        // o Admin Radio podría registrar un nuevo usuario en su radio.

        const userExists = await prisma.usuario.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: 'El email ya se encuentra registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.usuario.create({
            data: {
                email,
                passwordHash,
                rol,
                radioId
            }
        });

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: { id: newUser.id, email: newUser.email, rol: newUser.rol }
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Error del servidor al crear cuenta.' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                nombre: true,
                telefono: true,
                rol: true,
                radioId: true,
                fechaCreacion: true
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('getMe Error:', error);
        res.status(500).json({ error: 'Error obteniendo perfil.' });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { nombre, email, telefono, password } = req.body;

        // Validar si el email ya existe en otro usuario
        if (email) {
            const existing = await prisma.usuario.findFirst({
                where: { 
                    email,
                    NOT: { id: userId }
                }
            });
            if (existing) {
                return res.status(400).json({ error: 'El email ya está en uso por otro usuario.' });
            }
        }

        const data: any = {
            ...(nombre !== undefined && { nombre }),
            ...(email !== undefined && { email }),
            ...(telefono !== undefined && { telefono }),
        };

        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.usuario.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                nombre: true,
                telefono: true,
                rol: true,
                radioId: true
            }
        });

        res.json({ mensaje: 'Perfil actualizado correctamente', usuario: updated });
    } catch (error) {
        console.error('updateMe Error:', error);
        res.status(500).json({ error: 'Error actualizando perfil.' });
    }
};

