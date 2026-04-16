const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function main() {
    console.log('--- DIAGNÓSTICO DE DATOS ONRADIO ---');
    
    const radios = await prisma.radio.findMany();
    console.log('\nRadios registradas:', radios.length);
    radios.forEach(r => {
        console.log(`- ID: ${r.id} | Subdominio: ${r.subdominio} | Activa: ${r.activa}`);
    });

    const usuarios = await prisma.usuario.findMany({
        where: { email: 'admin@onradio.com' },
        include: { radio: true }
    });
    
    console.log('\nUsuario admin@onradio.com:');
    usuarios.forEach(u => {
        console.log(`- ID: ${u.id} | Email: ${u.email} | RadioId: ${u.radioId} | Rol: ${u.rol}`);
        if (u.radio) {
            console.log(`  -> Vinculado a Radio: ${u.radio.nombre} (${u.radio.subdominio})`);
        } else {
            console.log(`  -> ⚠️ SIN RADIO VINCULADA`);
        }
    });

    if (radios.length > 0 && usuarios.length > 0) {
        const u = usuarios[0];
        const r = radios[0];
        if (u.radioId !== r.id) {
            console.log(`\n⚠️ DISCREPANCIA DETECTADA: El usuario no tiene el ID de la radio creada.`);
            console.log(`Ejecuta: await prisma.usuario.update({ where: { id: '${u.id}' }, data: { radioId: '${r.id}' } })`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
