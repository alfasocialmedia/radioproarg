import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding planes de ONRADIO...');

    // Crear planes por defecto
    const planes = [
        {
            nombre: 'Audio',
            slug: 'audio',
            descripcion: 'Transmite tu radio en vivo. Panel de control básico, datos de streaming y estadísticas.',
            precioMensual: 7000,
            precioAnual: 75600,
            bitrate: 128,
            maxOyentes: 100,
            almacenamientoGB: 5,
            tieneCMS: false,
            tienePublicidad: false,
        },
        {
            nombre: 'Portal',
            slug: 'portal',
            descripcion: 'Todo lo del plan Audio más portal de noticias, CMS completo, publicidad y estadísticas avanzadas.',
            precioMensual: 20000,
            precioAnual: 216000,
            bitrate: 192,
            maxOyentes: 500,
            almacenamientoGB: 20,
            tieneCMS: true,
            tienePublicidad: true,
        },
    ];

    for (const plan of planes) {
        const existing = await prisma.plan.findUnique({ where: { slug: plan.slug } });
        if (!existing) {
            await prisma.plan.create({ data: plan });
            console.log(`  ✅ Plan "${plan.nombre}" creado.`);
        } else {
            await prisma.plan.update({ where: { slug: plan.slug }, data: plan });
            console.log(`  🔄 Plan "${plan.nombre}" actualizado.`);
        }
    }

    // Settings globales por defecto
    const settingsDefecto = [
        { clave: 'dominio_base', valor: 'onradio.com.ar' },
        { clave: 'sonicpanel_url', valor: '' },
        { clave: 'sonicpanel_key', valor: '' },
        { clave: 'mp_access_token', valor: '' },
        { clave: 'smtp_host', valor: 'smtp.gmail.com' },
        { clave: 'smtp_port', valor: '587' },
        { clave: 'smtp_user', valor: '' },
    ];

    for (const s of settingsDefecto) {
        const existing = await prisma.setting.findUnique({ where: { clave: s.clave } });
        if (!existing) {
            await prisma.setting.create({ data: s });
        }
    }

    // -----------------------------------------------------------------------
    // CREAR RADIOS Y USUARIOS DE PRUEBAS (AUDIO Y PORTAL)
    // -----------------------------------------------------------------------
    // Obtener los IDs reales de los planes para los FKs
    const planAudio = await prisma.plan.findUnique({ where: { slug: 'audio' } });
    const planPortal = await prisma.plan.findUnique({ where: { slug: 'portal' } });

    if (!planAudio || !planPortal) {
        throw new Error('❌ Los planes "audio" o "portal" no existen. Abortando seed.');
    }

    const RADIOS_DEMO = [
        {
            id: 'demo-audio',
            nombre: 'Radio Plan Audio',
            subdominio: 'demo-audio',
            streamUrl: 'https://stream.zeno.fm/1xvaxymzz3quv',
            activa: true,
            planId: planAudio.id,
            email: 'audio@onradio.com'
        },
        {
            id: 'demo', 
            nombre: 'Radio Plan Portal',
            subdominio: 'demo',
            streamUrl: 'https://stream.zeno.fm/1xvaxymzz3quv',
            activa: true,
            planId: planPortal.id,
            email: 'portal@onradio.com'
        }
    ];

    const passwordHash = await bcrypt.hash('admin123', 10);

    // Asegurar Super Admin Global
    const superAdminEmail = 'admin@onradio.com';
    await prisma.usuario.upsert({
        where: { email: superAdminEmail },
        update: { passwordHash, rol: 'SUPER_ADMIN' },
        create: {
            email: superAdminEmail,
            passwordHash,
            nombre: 'Super Admin',
            rol: 'SUPER_ADMIN'
        }
    });
    console.log(`  ✅ Super Admin global asegurado.`);

    for (const r of RADIOS_DEMO) {
        // 1. Asegurar la radio
        const radio = await prisma.radio.upsert({
            where: { subdominio: r.subdominio },
            update: { 
                planId: r.planId,
                nombre: r.nombre
            },
            create: {
                id: r.id,
                nombre: r.nombre,
                subdominio: r.subdominio,
                streamUrl: r.streamUrl,
                activa: r.activa,
                planId: r.planId
            }
        });
        console.log(`  ✅ Radio "${radio.nombre}" vinculada.`);

        // 2. Asegurar el usuario administrador de esa radio
        await prisma.usuario.upsert({
            where: { email: r.email },
            update: { 
                passwordHash,
                radioId: radio.id,
                rol: 'ADMIN_RADIO'
            },
            create: {
                email: r.email,
                passwordHash,
                nombre: `Usuario Demo`,
                rol: 'ADMIN_RADIO',
                radioId: radio.id
            }
        });
        console.log(`  ✅ Usuario "${r.email}" (re)configurado.`);
    }

    // -----------------------------------------------------------------------
    // NOTICIAS DE DEMOSTRACIÓN (SOLO PARA LA RADIO PORTAL)
    // -----------------------------------------------------------------------
    const radioPortal = await prisma.radio.findUnique({
        where: { id: 'demo' }, // Usamos 'demo' en lugar de 'demo-portal'
        include: { usuarios: true }
    });

    if (radioPortal && radioPortal.usuarios.length > 0) {
        const portalUser = radioPortal.usuarios[0];
        const noticiasDemo = [
            {
                slug: 'radio-online-la-nueva-era-de-la-comunicacion',
                titulo: 'La radio online: la nueva era de la comunicación',
                copete: 'Las emisoras digitales están revolucionando la forma en que las personas consumen audio. Te contamos por qué el streaming de radio llegó para quedarse.',
                contenidoHtml: `
<p>En los últimos años, la radio online ha demostrado ser mucho más que una moda pasajera. Con millones de oyentes que migran a las plataformas digitales, la transmisión por internet se convirtió en el motor de un ecosistema de contenidos que combina lo mejor de la radio tradicional con la inmediatez de la tecnología.</p>
<h2>¿Qué hace tan especial a la radio online?</h2>
<p>A diferencia de la transmisión analógica, una emisora digital puede llegar a cualquier rincón del planeta sin las limitaciones del espectro radioeléctrico. Esto abre posibilidades enormes para comunidades pequeñas, proyectos independientes y grandes medios por igual.</p>
<ul>
  <li><strong>Alcance global</strong>: tu señal cruza fronteras sin costo adicional.</li>
  <li><strong>Estadísticas en tiempo real</strong>: sabés exactamente cuántos oyentes te escuchan en cada momento.</li>
  <li><strong>Interactividad</strong>: chats en vivo, votaciones, encuestas y redes sociales integradas.</li>
  <li><strong>Contenido a demanda</strong>: los programas quedan grabados para escucharlos en cualquier momento.</li>
</ul>
<p>La convergencia entre radio y podcast también está redibujando el paisaje. Muchos programas nacen directamente en formato digital, sin necesidad de frecuencia FM ni infraestructura costosa.</p>
<h2>El futuro es ahora</h2>
<p>Con herramientas como ONRADIO, gestionar una emisora completa —desde el streaming hasta las noticias y la publicidad— está al alcance de cualquier persona con ganas de comunicar. La democratización del medio es real.</p>
`,
                imagenDestacada: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
                estado: 'PUBLICADA' as any,
            },
            {
                slug: 'musica-latinoamericana-domina-el-streaming-global',
                titulo: 'La música latinoamericana domina el streaming global en 2025',
                copete: 'El reggaetón, la cumbia digital y el trap latino rompen récords en plataformas internacionales. Argentina, Colombia y México lideran la expansión.',
                contenidoHtml: `
<p>Si hay algo que marcó la agenda musical global en los últimos tiempos es el avance arrollador de la música latinoamericana. Los géneros que nacieron en barrios populares de Latinoamérica hoy compiten de igual a igual con el pop anglosajón en las listas más importantes del mundo.</p>
<h2>Los números no mienten</h2>
<p>Según los datos más recientes de las principales plataformas de streaming, los artistas latinoamericanos acumulan en conjunto más de 2.000 millones de reproducciones mensuales. Géneros como el reggaetón, el trap latino, la cumbia digital y el afrobeats con influencia caribeña encabezan las listas virales semana tras semana.</p>
<blockquote>
  <p>"La música latina dejó de ser un nicho para convertirse en el mainstream global", señaló un analista de la industria discográfica.</p>
</blockquote>
<h2>Argentina en el centro de la escena</h2>
<p>El país no es la excepción. Artistas locales que comenzaron tocando en pequeños bares o publicando sus primeras canciones en redes sociales hoy llenan estadios en varios continentes. La guardia nueva del rap y el indie electrónico nacional también suma adeptos internacionales.</p>
<p>Para las radios online, esta tendencia representa una oportunidad única: programar contenido fresco, relevante y con altísima demanda por parte de las audiencias más jóvenes.</p>
`,
                imagenDestacada: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
                estado: 'PUBLICADA' as any,
            },
            {
                slug: 'como-ganar-oyentes-en-tu-radio-online',
                titulo: '5 estrategias probadas para ganar oyentes en tu radio online',
                copete: 'Tener una buena señal de streaming no alcanza. La clave del éxito de una emisora digital está en la comunidad, el contenido y la constancia.',
                contenidoHtml: `
<p>Lanzar una radio online es más fácil que nunca. El verdadero desafío está en construir y mantener una audiencia fiel. Estas son las cinco estrategias que los directores de las emisoras más exitosas del mundo digital aplican de forma consistente.</p>
<h2>1. Definí tu nicho con precisión</h2>
<p>Las radios generalistas tienen cada vez menos espacio frente a una oferta infinita. El oyente digital busca contenido específico: rock alternativo de los 90, noticias de tecnología, programas de entrenamiento físico, folklore regional. Cuanto más claro sea tu nicho, más apasionada será tu comunidad.</p>
<h2>2. Publicá en redes sociales a diario</h2>
<p>Los clips de audio, las frases del programa del día y los avances de lo que viene después son tu mejor herramienta de captación. TikTok, Instagram Reels y YouTube Shorts amplifican tu alcance sin necesidad de invertir en publicidad.</p>
<h2>3. Interactuá con tus oyentes en tiempo real</h2>
<p>Los chats de WhatsApp, los comentarios en vivo y las votaciones durante el programa generan un sentido de pertenencia que la radio tradicional nunca pudo proveer. Un oyente que participa es un oyente que vuelve.</p>
<h2>4. Colaborá con otras emisoras y creadores</h2>
<p>Las emisiones compartidas, los cruces con influencers de tu nicho y las participaciones especiales traen audiencias nuevas sin el costo de una campaña publicitaria.</p>
<h2>5. Medí todo y ajustá constantemente</h2>
<p>Las estadísticas de oyentes en tiempo real son tu GPS. Identificá qué programas generan más fidelidad, en qué horarios se pica la audiencia y qué tipo de contenido hace que la gente apague. Y ajustá sin miedo.</p>
`,
                imagenDestacada: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
                estado: 'PUBLICADA' as any,
            },
        ];

        for (const noticia of noticiasDemo) {
            const existing = await prisma.noticia.findUnique({
                where: { radioId_slug: { radioId: radioPortal.id, slug: noticia.slug } }
            });
            if (!existing) {
                await prisma.noticia.create({
                    data: {
                        slug: noticia.slug,
                        titulo: noticia.titulo,
                        copete: noticia.copete,
                        contenidoHtml: noticia.contenidoHtml,
                        imagenDestacada: noticia.imagenDestacada,
                        estado: noticia.estado,
                        radioId: radioPortal.id,
                        autorId: portalUser.id,
                        fechaPublicacion: new Date(),
                    }
                });
                console.log(`  ✅ Noticia "${noticia.titulo.slice(0, 40)}..." creada.`);
            } else {
                console.log(`  ⏭️  Noticia "${noticia.titulo.slice(0, 40)}..." ya existe.`);
            }
        }
    }

    console.log('  ✅ Settings inicializados.');
    console.log('\n🎉 Seed completado!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
