import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ONRADIO_KNOWLEDGE } from '../data/onradio-knowledge';

export const getFaq = async (_req: Request, res: Response) => {
    try {
        const setting = await prisma.setting.findUnique({ where: { clave: 'faq_items' } });
        const items = setting ? JSON.parse(setting.valor) : [];
        res.json(items);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo FAQ.' }); }
};

export const saveFaq = async (req: Request, res: Response) => {
    try {
        const items = req.body; 
        await prisma.setting.upsert({
            where: { clave: 'faq_items' },
            create: { clave: 'faq_items', valor: JSON.stringify(items) },
            update: { valor: JSON.stringify(items) }
        });
        res.json({ mensaje: 'FAQ guardada correctamente.' });
    } catch (e) { res.status(500).json({ error: 'Error guardando FAQ.' }); }
};

export const getTutoriales = async (_req: Request, res: Response) => {
    try {
        const setting = await prisma.setting.findUnique({ where: { clave: 'tutorial_items' } });
        const items = setting ? JSON.parse(setting.valor) : [];
        res.json(items);
    } catch (e) { res.status(500).json({ error: 'Error obteniendo tutoriales.' }); }
};

export const saveTutoriales = async (req: Request, res: Response) => {
    try {
        const items = req.body;
        await prisma.setting.upsert({
            where: { clave: 'tutorial_items' },
            create: { clave: 'tutorial_items', valor: JSON.stringify(items) },
            update: { valor: JSON.stringify(items) }
        });
        res.json({ mensaje: 'Tutoriales guardados correctamente.' });
    } catch (e) { res.status(500).json({ error: 'Error guardando tutoriales.' }); }
};

export const askFaqAI = async (req: Request, res: Response) => {
    const { pregunta, historial } = req.body;

    if (!pregunta || typeof pregunta !== 'string' || pregunta.trim().length < 3) {
        return res.status(400).json({ error: 'Debe enviar una pregunta válida.' });
    }

    const historialParseado = Array.isArray(historial) ? historial : [];
    const historialTexto = historialParseado
        .filter((m: any) => m.texto && m.rol)
        .map((m: any) => `${m.rol === 'user' ? 'Usuario' : 'Asistente'}: ${m.texto}`)
        .join('\n\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ error: 'El servicio de IA no está configurado.' });
    }

    try {
        const prompt = `Eres el asistente virtual de ONRADIO, una plataforma argentina de radio streaming.
Respondé siempre en español, de forma clara, amigable y concisa (máximo 3 párrafos).
USA SOLO la información de la base de conocimiento. Si la pregunta no tiene relación con ONRADIO, decilo amablemente.
No inventes información que no esté en la base de conocimiento.

IMPORTANTE: NUNCA saludes con la palabra "Hola" o similares al iniciar tu respuesta, el usuario ya fue saludado en el mensaje inicial. Mantén un hilo conversacional fluido. 

=== BASE DE CONOCIMIENTO DE ONRADIO ===
${ONRADIO_KNOWLEDGE}
=== FIN DE LA BASE DE CONOCIMIENTO ===

=== HISTORIAL DE CONVERSACIÓN ===
${historialTexto ? historialTexto : 'No hay mensajes previos.'}
=== FIN DEL HISTORIAL ===

Pregunta actual del usuario: ${pregunta.trim()}

Respuesta (sin saludo inicial):`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 512,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('[FAQ IA] Error detallado de Gemini:', response.status, errorBody);
            return res.status(502).json({ error: 'Error al consultar el servicio de IA. Revisa logs.' });
        }

        const data = await response.json() as any;
        const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No pude generar una respuesta. Intentá reformular tu pregunta.';

        res.json({ respuesta: respuesta.trim() });

    } catch (err) {
        console.error('[FAQ IA] Error:', err);
        res.status(500).json({ error: 'Error interno al procesar la pregunta.' });
    }
};
