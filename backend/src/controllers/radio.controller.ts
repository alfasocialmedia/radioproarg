import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { encrypt, decrypt } from '../utils/crypto';
import { crearRadioEnSonicPanel } from '../services/sonicpanel.service';

export const getRadioConfig = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;

        const radioInfo = await prisma.radio.findUnique({
            where: { id: radioId },
            select: {
                id: true,
                nombre: true,
                subdominio: true,
                logoUrl: true,
                colorPrimario: true,
                colorSecundario: true,
                colorBotones: true,
                colorTextos: true,
                playerColor: true,
                playerImagenUrl: true,
                playerBlur: true,
                fontFamily: true,
                plantilla: true,
                iaIconoUrl: true,
                streamUrl: true,
                fondoPlayerUrl: true,
                spotifyUrl: true,
                mercadoPagoLink: true,
                paypalLink: true,
                adHorizontal: true,
                adSquare: true,
                publicidadActiva: true,
                adDisplayBajoPlayer: true,
                mostrarSpotify: true,
                tituloNoticias: true,
                configSidebar: true,

                plan: {
                    select: {
                        slug: true,
                        tieneCMS: true
                    }
                }
            }
        });

        if (!radioInfo) {
            return res.status(404).json({ error: 'Configuración no encontrada.' });
        }

        res.json(radioInfo);
    } catch (error) {
        console.error('getRadioConfig Error:', error);
        res.status(500).json({ error: 'Error interno obteniendo metadatos de la radio.' });
    }
};

export const createRadio = async (req: Request, res: Response) => {
    try {
        const { nombre, subdominio, dominioCustom, streamUrl, plan: planSlug, autoProvision } = req.body;

        const exists = await prisma.radio.findFirst({
            where: {
                OR: [{ subdominio }, { dominioCustom: dominioCustom || undefined }]
            }
        });

        if (exists) {
            return res.status(400).json({ error: 'La radio con ese subdominio o dominio ya existe.' });
        }

        const plan = await prisma.plan.findUnique({ where: { slug: planSlug || 'audio' } });

        const nuevaRadio = await prisma.radio.create({
            data: {
                nombre,
                subdominio,
                dominioCustom,
                streamUrl,
                planId: plan?.id || null
            }
        });

        if (autoProvision && plan) {
            try {
                const sonicData = await crearRadioEnSonicPanel({
                    nombre,
                    bitrate: plan.bitrate,
                    maxOyentes: plan.maxOyentes,
                    email: `admin@${subdominio}.onradio.com.ar`,
                    paquete: plan.slug,
                });

                await prisma.radio.update({
                    where: { id: nuevaRadio.id },
                    data: {
                        sonicpanelId: sonicData.radioId,
                        streamUser: sonicData.streamUser,
                        streamPassword: encrypt(sonicData.streamPassword),
                        streamMount: sonicData.streamMount,
                        streamPort: sonicData.streamPort,
                        streamUrl: sonicData.streamUrl,
                        ftpUser: sonicData.ftpUser,
                        ftpPassword: encrypt(sonicData.ftpPassword),
                    }
                });
            } catch (sonicError) {
                console.error('[CreateRadio] Error SonicPanel:', sonicError);
            }
        }

        res.status(201).json({ mensaje: 'Radio creada satisfactoriamente', radio: nuevaRadio });
    } catch (error) {
        console.error('createRadio Error:', error);
        res.status(500).json({ error: 'Error del servidor al intentar crear la radio.' });
    }
};

export const provisionRadio = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const radio = await prisma.radio.findUnique({
            where: { id: String(id) },
            include: { plan: true }
        });

        if (!radio) return res.status(404).json({ error: 'Radio no encontrada.' });
        if (!radio.plan) return res.status(400).json({ error: 'La radio debe tener un plan asignado para aprovisionar.' });
        if (radio.sonicpanelId) return res.status(400).json({ error: 'Esta radio ya tiene un ID de SonicPanel.' });

        const sonicData = await crearRadioEnSonicPanel({
            nombre: radio.nombre,
            bitrate: radio.plan.bitrate,
            maxOyentes: radio.plan.maxOyentes,
            email: `admin@${radio.subdominio}.onradio.com.ar`,
            paquete: radio.plan.slug,
        });

        const updated = await prisma.radio.update({
            where: { id: radio.id },
            data: {
                sonicpanelId: sonicData.radioId,
                streamUser: sonicData.streamUser,
                streamPassword: encrypt(sonicData.streamPassword),
                streamMount: sonicData.streamMount,
                streamPort: sonicData.streamPort,
                streamUrl: sonicData.streamUrl,
                ftpUser: sonicData.ftpUser,
                ftpPassword: encrypt(sonicData.ftpPassword),
            }
        });

        res.json({ mensaje: 'Aprovisionamiento exitoso', radio: updated });
    } catch (error: any) {
        console.error('provisionRadio Error:', error);
        res.status(500).json({ error: error.message || 'Error al aprovisionar en SonicPanel.' });
    }
};

export const updateRadioConfig = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = (req as any).tenantId;
        const targetId = id || tenantId;

        if (!targetId) {
            return res.status(404).json({ error: 'Radio no identificada.' });
        }
        const { nombre, streamUrl, spotifyUrl, mostrarSpotify, logoUrl, colorPrimario, colorSecundario,
                mercadoPagoLink, paypalLink, whatsapp, fontFamily, plantilla, adHorizontal, adSquare,
                publicidadActiva, adDisplayBajoPlayer, planId, activa, suspendida, planVenceEn,
                metaTitulo, metaDescripcion, faviconUrl, ogImagenUrl, almacenamientoExtraGB,
                colorBotones, colorTextos, playerColor, playerImagenUrl, playerBlur, tituloNoticias,
                configSidebar,
                sonicpanelId, streamUser, streamPassword, streamPort, streamMount, ftpUser, ftpPassword, iaIconoUrl } = req.body;


        const radio = await prisma.radio.update({
            where: { id: String(targetId) },
            data: {
                ...(nombre !== undefined && { nombre }),
                ...(streamUrl !== undefined && { streamUrl }),
                ...(spotifyUrl !== undefined && { spotifyUrl }),
                ...(mostrarSpotify !== undefined && { mostrarSpotify }),
                ...(logoUrl !== undefined && { logoUrl }),
                ...(faviconUrl !== undefined && { faviconUrl }),
                ...(ogImagenUrl !== undefined && { ogImagenUrl }),
                ...(metaTitulo !== undefined && { metaTitulo }),
                ...(metaDescripcion !== undefined && { metaDescripcion }),

                ...(colorPrimario !== undefined && { colorPrimario }),
                ...(colorSecundario !== undefined && { colorSecundario }),
                ...(colorBotones !== undefined && { colorBotones }),
                ...(colorTextos !== undefined && { colorTextos }),
                ...(playerColor !== undefined && { playerColor }),
                ...(playerImagenUrl !== undefined && { playerImagenUrl }),
                ...(playerBlur !== undefined && { playerBlur: Number(playerBlur) }),
                ...(iaIconoUrl !== undefined && { iaIconoUrl }),
                ...(mercadoPagoLink !== undefined && { mercadoPagoLink }),
                ...(paypalLink !== undefined && { paypalLink }),
                ...(whatsapp !== undefined && { whatsapp }),
                ...(fontFamily !== undefined && { fontFamily }),
                ...(plantilla !== undefined && { plantilla }),
                ...(adHorizontal !== undefined && { adHorizontal }),
                ...(adSquare !== undefined && { adSquare }),
                ...(publicidadActiva !== undefined && { publicidadActiva }),
                ...(adDisplayBajoPlayer !== undefined && { adDisplayBajoPlayer }),
                ...(planId !== undefined && { planId: planId || null }),

                ...(activa !== undefined && { activa }),
                ...(suspendida !== undefined && { suspendida }),
                ...(planVenceEn !== undefined && { planVenceEn: planVenceEn ? new Date(planVenceEn) : null }),

                ...(sonicpanelId !== undefined && { sonicpanelId }),
                ...(streamUser !== undefined && { streamUser }),
                ...(streamPassword !== undefined && { streamPassword: streamPassword ? encrypt(streamPassword) : null }),
                ...(streamPort !== undefined && { streamPort: Number(streamPort) || null }),
                ...(streamMount !== undefined && { streamMount }),
                ...(ftpUser !== undefined && { ftpUser }),
                ...(ftpPassword !== undefined && { ftpPassword: ftpPassword ? encrypt(ftpPassword) : null }),
                ...(almacenamientoExtraGB !== undefined && { almacenamientoExtraGB: Number(almacenamientoExtraGB) }),
                ...(tituloNoticias !== undefined && { tituloNoticias }),
                ...(configSidebar !== undefined && { configSidebar }),
            },
            include: { plan: { select: { id: true, slug: true, nombre: true } } }
        });

        if (radio) {
            radio.streamPassword = radio.streamPassword ? decrypt(radio.streamPassword) : null;
            radio.ftpPassword = radio.ftpPassword ? decrypt(radio.ftpPassword) : null;
        }

        res.json(radio);
    } catch (error) {
        console.error('updateRadioConfig Error:', error);
        res.status(500).json({ error: 'Error al actualizar la configuración de la radio.' });
    }
};

export const getRadios = async (req: Request, res: Response) => {
    try {
        const radios = await prisma.radio.findMany({
            orderBy: { fechaCreacion: 'desc' },
            include: {
                plan: true,
                _count: {
                    select: { usuarios: true }
                },
                medios: {
                    select: { tamanoBytes: true }
                }
            }
        });

        const radiosWithStorage = radios.map(r => {
            const usedBytes = r.medios.reduce((acc, m) => acc + Number(m.tamanoBytes || 0), 0);
            const planGB = r.plan?.almacenamientoGB || 0;
            const extraGB = (r as any).almacenamientoExtraGB || 0;
            const totalGB = planGB + extraGB;
            
            return {
                ...r,
                storage: {
                    usedBytes,
                    usedGB: Number((usedBytes / (1024 * 1024 * 1024)).toFixed(3)),
                    totalGB,
                    percentage: totalGB > 0 ? Number(((usedBytes / (totalGB * 1024 * 1024 * 1024)) * 100).toFixed(2)) : 0
                },
                streamPassword: r.streamPassword ? decrypt(r.streamPassword) : null,
                ftpPassword: r.ftpPassword ? decrypt(r.ftpPassword) : null,
                medios: undefined
            };
        });

        res.json(radiosWithStorage);
    } catch (error) {
        console.error('getRadios Error:', error);
        res.status(500).json({ error: 'Error interno obteniendo radios.' });
    }
};


export const eliminarRadio = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.auspiciante.deleteMany({ where: { radioId: String(id) } });
        await prisma.programacion.deleteMany({ where: { radioId: String(id) } });
        await prisma.noticia.deleteMany({ where: { radioId: String(id) } });
        await prisma.usuario.deleteMany({ where: { radioId: String(id) } });

        await prisma.radio.delete({
            where: { id: String(id) }
        });

        res.json({ mensaje: 'Radio eliminada correctamente.' });
    } catch (error) {
        console.error('eliminarRadio error:', error);
        res.status(500).json({ error: 'Error al eliminar la radio.' });
    }
};

export const getRadioStats = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const radioInfo = await prisma.radio.findUnique({
            where: { id: radioId },
            select: { streamUrl: true }
        });

        if (!radioInfo || !radioInfo.streamUrl) {
            return res.json({ listeners: 0 });
        }

        try {
            const urlObj = new URL(radioInfo.streamUrl);
            const statsUrl = `${urlObj.protocol}//${urlObj.host}/status-json.xsl`;
            
            const response = await fetch(statsUrl, { signal: AbortSignal.timeout(3000) });
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const data = await response.json();
            let listeners = 0;
            if (data?.icestats?.source) {
                if (Array.isArray(data.icestats.source)) {
                    const mount = data.icestats.source.find((s: any) => s.listenurl?.endsWith(urlObj.pathname));
                    listeners = mount ? (mount.listeners || 0) : data.icestats.source.reduce((acc: number, s: any) => acc + (s.listeners || 0), 0);
                } else {
                    listeners = data.icestats.source.listeners || 0;
                }
            }
            return res.json({ listeners });
        } catch (e) {
            return res.json({ listeners: 0, error: 'Icecast stats unreachable' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
};

export const getHistoricalStats = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        const stats = await prisma.estadisticaListener.findMany({
            where: {
                radioId,
                fecha: { gte: hace7Dias }
            },
            orderBy: { fecha: 'asc' }
        });

        res.json(stats);
    } catch (error) {
        console.error("Error getHistoricalStats:", error);
        res.status(500).json({ error: 'Error obteniendo stats históricas' });
    }
};

export const getStorageStats = async (req: Request, res: Response) => {
    try {
        const radioId = (req as any).tenantId;
        const radio = await prisma.radio.findUnique({
            where: { id: radioId },
            include: { plan: true }
        });

        if (!radio) return res.status(404).json({ error: 'Radio no encontrada.' });

        const totalUsed = await prisma.media.aggregate({
            where: { radioId },
            _sum: { tamanoBytes: true }
        });

        const usedBytes = Number(totalUsed._sum.tamanoBytes || 0);
        const planGB = radio.plan?.almacenamientoGB || 0;
        const extraGB = (radio as any).almacenamientoExtraGB || 0;
        const totalGB = planGB + extraGB;
        
        const effectiveLimitGB = totalGB > 0 ? totalGB : 0.001; 
        const limitBytes = effectiveLimitGB * 1024 * 1024 * 1024;
        const percentage = (usedBytes / limitBytes) * 100;

        res.json({
            usedGB: Number((usedBytes / (1024 * 1024 * 1024)).toFixed(3)),
            totalGB,
            percentage: Number(percentage.toFixed(2)),
            usedBytes,
            limitBytes
        });
    } catch (error) {
        console.error('getStorageStats Error:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas de almacenamiento.' });
    }
};
