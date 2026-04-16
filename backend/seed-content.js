const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log('--- POBLANDO CONTENIDO DEMO ONRADIO (v2) ---');

    const radio = await prisma.radio.findUnique({ where: { subdominio: 'demo' } });
    if (!radio) {
        console.error('❌ No se encontró la radio demo.');
        return;
    }

    const admin = await prisma.usuario.findFirst({ where: { email: 'admin@onradio.com' } });
    if (!admin) {
        console.error('❌ No se encontró el usuario admin.');
        return;
    }

    // 1. Crear Categoría Corregida
    const cat = await prisma.categoriaNoticia.upsert({
        where: { slug: 'general' },
        update: {},
        create: { nombre: 'General', slug: 'general' }
    });

    // 2. Crear Noticias Corregidas
    console.log('Creando noticias...');
    const noticiasData = [
        {
            titulo: 'Bienvenidos a la Nueva Era de OnRadio',
            copete: 'Estamos lanzando nuestra nueva plataforma interactiva para emisoras de todo el mundo.',
            contenidoHtml: '<p>Hoy es un día histórico. OnRadio permite que cualquier radio tenga un portal moderno, chat en vivo y gestión de programación en minutos.</p>',
            imagenDestacada: 'https://picsum.photos/seed/radio1/800/600',
            slug: 'bienvenidos-onradio',
            radioId: radio.id,
            autorId: admin.id,
            estado: 'PUBLICADA'
        },
        {
            titulo: 'El Futuro del Podcasting',
            copete: 'Descubre cómo los podcasts están cambiando la forma en que consumimos audio.',
            contenidoHtml: '<p>El podcasting sigue creciendo y en OnRadio te damos las herramientas para triunfar.</p>',
            imagenDestacada: 'https://picsum.photos/seed/radio2/800/600',
            slug: 'futuro-podcasting',
            radioId: radio.id,
            autorId: admin.id,
            estado: 'PUBLICADA'
        }
    ];

    for (const n of noticiasData) {
        await prisma.noticia.upsert({
            where: { radioId_slug: { radioId: n.radioId, slug: n.slug } },
            update: n,
            create: n
        });
    }

    // 3. Crear Programas Corregidos
    console.log('Creando programas...');
    const programasData = [
        {
            nombrePrograma: 'Mañana Deportiva',
            descripcion: 'Todo el acontecer del deporte local e internacional.',
            conductores: 'Juan Pérez',
            horaInicio: '08:00',
            horaFin: '10:00',
            diaSemana: 1, // Lunes
            radioId: radio.id
        },
        {
            nombrePrograma: 'El Show del Mediodía',
            descripcion: 'Entrevistas, música y humor para tu almuerzo.',
            conductores: 'María García',
            horaInicio: '12:00',
            horaFin: '14:00',
            diaSemana: 1, // Lunes
            radioId: radio.id
        }
    ];

    for (const p of programasData) {
        await prisma.programacion.create({ data: p });
    }

    console.log('✅ Contenido demo cargado exitosamente.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
