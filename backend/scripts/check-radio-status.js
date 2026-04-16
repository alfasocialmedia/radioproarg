require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const radio = await prisma.radio.findFirst({
        where: { subdominio: 'demo' }
    });
    console.log('--- Radio Demo Status ---');
    if (radio) {
        console.log('ID:', radio.id);
        console.log('Nombre:', radio.nombre);
        console.log('Activa:', radio.activa);
        console.log('Suspendida:', radio.suspendida);
    } else {
        console.log('Radio demo no encontrada.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
