require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const radios = await prisma.radio.findMany({
        select: {
            id: true,
            nombre: true,
            subdominio: true,
            activa: true
        }
    });
    console.log('Radios en la DB:');
    console.log(JSON.stringify(radios, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
