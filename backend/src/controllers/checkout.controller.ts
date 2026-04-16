import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { crearRadioEnSonicPanel } from '../services/sonicpanel.service';
import { enviarEmailBienvenida } from '../services/email.service';
import { encrypt } from '../utils/crypto';
import bcrypt from 'bcrypt';

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

const generarPassword = (longitud = 12): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789!@#$%';
    return Array.from({ length: longitud }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const generarSubdominio = (nombre: string): string => {
    return nombre
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30) + '-' + Math.random().toString(36).slice(2, 6);
};

export const crearPreferencia = async (req: Request, res: Response) => {
    try {
        const { planSlug, email, nombreRadio, nombreCliente, telefono, periodoFacturacion = 'mensual', radioId, moneda = 'ARS' } = req.body;

        if (!planSlug || !email || !nombreRadio) {
            return res.status(400).json({ error: 'planSlug, email y nombreRadio son requeridos.' });
        }

        const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
        if (!plan) {
            return res.status(404).json({ error: `Plan "${planSlug}" no encontrado.` });
        }

        let precio = periodoFacturacion === 'anual' ? plan.precioAnual : plan.precioMensual;
        let currency_id = 'ARS';

        if (moneda === 'USD' && plan.precioMensualUSD) {
            precio = periodoFacturacion === 'anual' ? (plan.precioAnualUSD || plan.precioAnual) : (plan.precioMensualUSD || plan.precioMensual);
            currency_id = 'USD';
        }

        const preference = new Preference(mpClient);
        const prefResponse = await preference.create({
            body: {
                items: [{
                    id: plan.id,
                    title: `ONRADIO ${plan.nombre} — ${periodoFacturacion === 'anual' ? 'Anual' : 'Mensual'}`,
                    quantity: 1,
                    unit_price: precio,
                    currency_id: currency_id,
                }],
                payer: {
                    email,
                    name: nombreCliente || '',
                    phone: telefono ? { number: String(telefono) } : undefined,
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/checkout/exito`,
                    failure: `${process.env.FRONTEND_URL}/checkout/error`,
                    pending: `${process.env.FRONTEND_URL}/checkout/pendiente`,
                },
                auto_return: 'approved',
                notification_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/v1/checkout/webhook`,
                metadata: {
                    radioId: radioId || null,
                    planId: plan.id,
                    planSlug,
                    email,
                    nombreRadio,
                    nombreCliente,
                    telefono,
                    periodoFacturacion,
                },
            }
        });

        await prisma.order.create({
            data: {
                radioId: radioId || null,
                planId: plan.id,
                total: precio,
                estado: 'PENDIENTE',
                mpPreferenceId: prefResponse.id,
                datosPagador: { email, nombreRadio, nombreCliente, telefono },
            }
        });

        res.json({ preferenceId: prefResponse.id, initPoint: prefResponse.init_point });
    } catch (error: any) {
        console.error('crearPreferencia Error:', error);
        
        let errorMsg = 'Error creando preferencia de pago.';
        if (error.status === 403 || error.status === 401) {
            errorMsg = 'Error de validación en MercadoPago. Verifica que tu MP_ACCESS_TOKEN sea correcto en el archivo .env.';
        } else if (error.message) {
            errorMsg = error.message;
        }

        res.status(500).json({ error: errorMsg });
    }
};

export const webhookMercadoPago = async (req: Request, res: Response) => {
    res.sendStatus(200);

    try {
        const { type, data } = req.body;

        if (type !== 'payment' || !data?.id) return;

        const mpPaymentId = String(data.id);

        const pagoExistente = await prisma.payment.findFirst({ where: { mpPaymentId } });
        if (pagoExistente) return;

        const paymentApi = new Payment(mpClient);
        const mpPago = await paymentApi.get({ id: mpPaymentId });

        if (!mpPago || mpPago.status !== 'approved') {
            await prisma.payment.create({
                data: {
                    monto: mpPago?.transaction_amount || 0,
                    estado: mapearEstadoMP(mpPago?.status),
                    mpPaymentId,
                    mpStatus: mpPago?.status_detail,
                    metodo: 'mercadopago',
                }
            });
            return;
        }

        const metadata = mpPago.metadata || {};
        const { planId, planSlug, email, nombreRadio, nombreCliente, periodoFacturacion = 'mensual', radio_id: upgradeRadioId } = metadata;
        const radioIdParaUpgrade = metadata.radioId || upgradeRadioId;

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            console.error('[Webhook] Plan no encontrado:', planId);
            return;
        }

        const orden = await prisma.order.findFirst({
            where: { planId, estado: 'PENDIENTE', datosPagador: { path: ['email'], equals: email } }
        });
        if (orden) {
            await prisma.order.update({ where: { id: orden.id }, data: { estado: 'PAGADA' } });
        }

        if (radioIdParaUpgrade) {
            const radio = await prisma.radio.update({
                where: { id: radioIdParaUpgrade },
                data: {
                    planId: plan.id,
                    periodoFacturacion,
                    planVenceEn: calcularVencimiento(periodoFacturacion),
                }
            });

            await prisma.payment.create({
                data: {
                    radioId: radio.id,
                    orderId: orden?.id,
                    monto: mpPago.transaction_amount || plan.precioMensual,
                    estado: 'APROBADO',
                    mpPaymentId,
                    mpStatus: mpPago.status_detail,
                    metodo: 'mercadopago',
                    fechaPago: new Date(),
                }
            });

            console.log(`[Webhook] ✅ Radio UPGRADED: ${radio.nombre} | Nuevo Plan: ${plan.nombre}`);

        } else {
            const subdominio = generarSubdominio(nombreRadio || 'radio');
            const nuevaRadio = await prisma.radio.create({
                data: {
                    nombre: nombreRadio || 'Mi Radio',
                    subdominio,
                    planId: plan.id,
                    periodoFacturacion,
                    planVenceEn: calcularVencimiento(periodoFacturacion),
                    activa: true,
                }
            });

            let sonicData = null;
            try {
                sonicData = await crearRadioEnSonicPanel({
                    nombre: nombreRadio || 'Mi Radio',
                    bitrate: plan.bitrate,
                    maxOyentes: plan.maxOyentes,
                    email: email || '',
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
                console.error('[Webhook] Error SonicPanel (no bloqueante):', sonicError);
            }

            const passwordPanel = generarPassword();
            const passwordHash = await bcrypt.hash(passwordPanel, 10);

            const nuevoUsuario = await prisma.usuario.create({
                data: {
                    email: email || `admin@${subdominio}.onradio.com.ar`,
                    passwordHash,
                    nombre: nombreCliente || '',
                    rol: 'ADMIN_RADIO',
                    radioId: nuevaRadio.id,
                }
            });

            await prisma.payment.create({
                data: {
                    radioId: nuevaRadio.id,
                    orderId: orden?.id,
                    monto: mpPago.transaction_amount || plan.precioMensual,
                    estado: 'APROBADO',
                    mpPaymentId,
                    mpStatus: mpPago.status_detail,
                    metodo: 'mercadopago',
                    fechaPago: new Date(),
                }
            });

            await enviarEmailBienvenida({
                destinatario: email || nuevoUsuario.email,
                nombreRadio: nuevaRadio.nombre,
                plan: plan.nombre,
                streamUser: sonicData?.streamUser || 'configurando...',
                streamPassword: sonicData?.streamPassword || 'configurando...',
                streamMount: sonicData?.streamMount || '/stream',
                streamPort: sonicData?.streamPort || 8000,
                streamUrl: sonicData?.streamUrl || `http://stream.onradio.com.ar:8000`,
                ftpUser: sonicData?.ftpUser || 'configurando...',
                ftpPassword: sonicData?.ftpPassword || 'configurando...',
                panelUrl: `${process.env.FRONTEND_URL}/admin/dashboard`,
                passwordPanel,
            });

            console.log(`[Webhook] ✅ Radio creada desde cero: ${nuevaRadio.nombre} (${subdominio}) | Plan: ${plan.nombre}`);
        }

    } catch (error: any) {
        console.error('[Webhook] Error procesando pago:', error.message);
    }
};

const mapearEstadoMP = (mpStatus?: string): any => {
    const mapa: Record<string, string> = {
        approved: 'APROBADO',
        rejected: 'RECHAZADO',
        pending: 'PENDIENTE',
        in_process: 'EN_PROCESO',
        refunded: 'DEVUELTO',
    };
    return mapa[mpStatus || ''] || 'PENDIENTE';
};

const calcularVencimiento = (periodo: string): Date => {
    const d = new Date();
    if (periodo === 'anual') d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d;
};
