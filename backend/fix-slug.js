const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log('--- ACTUALIZANDO SUBDOMINIO DE RADIO ---');
    
    // Buscar la radio con subdominio 'onradio'
    const r = await prisma.radio.findFirst({ where: { subdominio: 'onradio' } });
    if (r) {
        await prisma.radio.update({
            where: { id: r.id },
            data: { subdominio: 'demo' }
        });
        console.log(`✅ Radio '${r.nombre}' actualizada: onradio -> demo`);
    } else {
        console.log('❌ No se encontró la radio con subdominio onradio.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
