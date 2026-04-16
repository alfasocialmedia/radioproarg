import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// ─────────────────────────────────────────────────────────────────────────────
// PLANES
// ─────────────────────────────────────────────────────────────────────────────

export const getPlanes = async (_req: Request, res: Response) => {
    try {
        const planes = await prisma.plan.findMany({ where: { activo: true }, orderBy: { precioMensual: 'asc' } });
        res.json(planes);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo planes.' }); }
};

export const createPlan = async (req: Request, res: Response) => {
    try {
        const { nombre, slug, descripcion, precioMensual, precioAnual, bitrate, maxOyentes, almacenamientoGB, tieneCMS, tienePublicidad } = req.body;
        const plan = await prisma.plan.create({
            data: { nombre, slug, descripcion, precioMensual, precioAnual, bitrate: bitrate || 128, maxOyentes: maxOyentes || 100, almacenamientoGB: almacenamientoGB || 5, tieneCMS: tieneCMS || false, tienePublicidad: tienePublicidad || false }
        });
        res.status(201).json(plan);
    } catch (e: any) {
        if (e.code === 'P2002') return res.status(400).json({ error: 'Ya existe un plan con ese slug.' });
        res.status(500).json({ error: 'Error creando el plan.' });
    }
};

export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await prisma.plan.update({ where: { id: String(id) }, data: req.body });
        res.json(plan);
    } catch (e) { res.status(500).json({ error: 'Error actualizando el plan.' }); }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.plan.update({ where: { id: String(id) }, data: { activo: false } });
        res.json({ mensaje: 'Plan desactivado.' });
    } catch (e) { res.status(500).json({ error: 'Error eliminando el plan.' }); }
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS GLOBALES
// ─────────────────────────────────────────────────────────────────────────────

export const getSettings = async (_req: Request, res: Response) => {
    try {
        const settings = await prisma.setting.findMany();
        const obj = Object.fromEntries(settings.map(s => [s.clave, s.valor]));
        res.json(obj);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo configuración.' }); }
};

export const upsertSetting = async (req: Request, res: Response) => {
    try {
        const { clave, valor } = req.body;
        const setting = await prisma.setting.upsert({ where: { clave }, create: { clave, valor }, update: { valor } });
        res.json(setting);
    } catch (e) { res.status(500).json({ error: 'Error guardando configuración.' }); }
};

export const upsertManySettings = async (req: Request, res: Response) => {
    try {
        const settings: Record<string, string> = req.body;
        await Promise.all(
            Object.entries(settings).map(([clave, valor]) =>
                prisma.setting.upsert({ where: { clave }, create: { clave, valor: String(valor) }, update: { valor: String(valor) } })
            )
        );
        res.json({ mensaje: 'Configuración guardada.' });
    } catch (e) { res.status(500).json({ error: 'Error guardando configuración.' }); }
};
