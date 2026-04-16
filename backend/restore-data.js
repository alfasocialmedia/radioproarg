/**
 * Script de restauración de datos base de ONRADIO
 * Restaura planes, usuarios demo y settings sin borrar datos existentes
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Restaurando datos base...\n');

    // 1. Restaurar planes
    const planes = [
        {
            slug: 'audio',
            nombre: 'Audio',
            descripcion: 'Transmite tu radio en vivo. Panel de control básico, datos de streaming y estadísticas.',
            precioMensual: 7000,
            precioAnual: 75600,
            bitrate: 128,
            maxOyentes: 100,
            almacenamientoGB: 5,
            tieneCMS: false,
            tienePublicidad: false,
            tieneEstadisticas: true,
            activo: true,
        },
        {
            slug: 'portal',
            nombre: 'Portal',
            descripcion: 'Todo lo del plan Audio más portal de noticias, CMS completo, publicidad y estadísticas avanzadas.',
            precioMensual: 20000,
            precioAnual: 216000,
            bitrate: 192,
            maxOyentes: 500,
            almacenamientoGB: 20,
            tieneCMS: true,
            tienePublicidad: true,
            tieneEstadisticas: true,
            activo: true,
        },
    ];

    for (const plan of planes) {
        const existing = await prisma.plan.findUnique({ where: { slug: plan.slug } });
        if (!existing) {
            const created = await prisma.plan.create({ data: plan });
            console.log(`  ✅ Plan "${plan.nombre}" creado (id: ${created.id})`);
        } else {
            await prisma.plan.update({ where: { slug: plan.slug }, data: plan });
            console.log(`  🔄 Plan "${plan.nombre}" actualizado (id: ${existing.id})`);
        }
    }

    // 2. Obtener IDs de planes
    const planAudio = await prisma.plan.findUnique({ where: { slug: 'audio' } });
    const planPortal = await prisma.plan.findUnique({ where: { slug: 'portal' } });
    console.log('\nPlanes disponibles:', {
        audio: planAudio?.id,
        portal: planPortal?.id
    });

    // 3. Restaurar/asegurar radios demo
    const passwordHash = await bcrypt.hash('admin123', 10);

    const radiosDemo = [
        {
            subdominio: 'demo-audio',
            nombre: 'Radio Plan Audio',
            streamUrl: 'https://stream.zeno.fm/1xvaxymzz3quv',
            planSlug: 'audio',
            email: 'audio@onradio.com',
        },
        {
            subdominio: 'demo',
            nombre: 'Radio Plan Portal',
            streamUrl: 'https://stream.zeno.fm/1xvaxymzz3quv',
            planSlug: 'portal',
            email: 'portal@onradio.com',
        },
    ];

    for (const r of radiosDemo) {
        const planId = r.planSlug === 'audio' ? planAudio?.id : planPortal?.id;
        if (!planId) { console.log(`  ❌ No se encontró plan ${r.planSlug}`); continue; }

        const radio = await prisma.radio.upsert({
            where: { subdominio: r.subdominio },
            update: { planId, nombre: r.nombre },
            create: {
                nombre: r.nombre,
                subdominio: r.subdominio,
                streamUrl: r.streamUrl,
                activa: true,
                planId,
            }
        });
        console.log(`  ✅ Radio "${radio.nombre}" (id: ${radio.id})`);

        await prisma.usuario.upsert({
            where: { email: r.email },
            update: { passwordHash, radioId: radio.id, rol: 'ADMIN_RADIO' },
            create: {
                email: r.email,
                passwordHash,
                nombre: 'Usuario Demo',
                rol: 'ADMIN_RADIO',
                radioId: radio.id,
            }
        });
        console.log(`  ✅ Usuario "${r.email}" configurado`);
    }

    // 4. Asegurar Super Admin
    await prisma.usuario.upsert({
        where: { email: 'admin@onradio.com' },
        update: { passwordHash, rol: 'SUPER_ADMIN', radioId: null },
        create: {
            email: 'admin@onradio.com',
            passwordHash,
            nombre: 'Super Admin',
            rol: 'SUPER_ADMIN',
        }
    });
    console.log('  ✅ Super Admin (admin@onradio.com) confirmado como SUPER_ADMIN');

    // 5. Settings por defecto
    const settings = [
        { clave: 'dominio_base', valor: 'onradio.com.ar' },
        { clave: 'smtp_host', valor: 'smtp.gmail.com' },
        { clave: 'smtp_port', valor: '587' },
        { clave: 'smtp_user', valor: '' },
        { clave: 'sonicpanel_url', valor: '' },
        { clave: 'sonicpanel_key', valor: '' },
        { clave: 'mp_access_token', valor: '' },
    ];

    for (const s of settings) {
        const existing = await prisma.setting.findUnique({ where: { clave: s.clave } });
        if (!existing) {
            await prisma.setting.create({ data: s });
            console.log(`  ✅ Setting "${s.clave}" creado`);
        }
    }

    // 6. Verificación final
    console.log('\n📊 Resumen final:');
    const allPlanes = await prisma.plan.findMany({ orderBy: { nombre: 'asc' } });
    console.log('  Planes en DB:', allPlanes.map(p => `${p.nombre} (${p.slug})`).join(', '));

    const allUsuarios = await prisma.usuario.findMany({ select: { email: true, rol: true, radioId: true } });
    console.log('  Usuarios en DB:');
    allUsuarios.forEach(u => console.log(`    - ${u.email} | ${u.rol} | radioId: ${u.radioId}`));

    console.log('\n✅ Restauración completada!');
}

main()
    .catch(e => { console.error('Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
