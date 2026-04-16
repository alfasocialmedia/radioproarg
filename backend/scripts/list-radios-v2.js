require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const radios = await prisma.radio.findMany({
      select: {
        id: true,
        nombre: true,
        subdominio: true
      }
    });
    console.log('Radios encontradas:');
    console.log(JSON.stringify(radios, null, 2));
  } catch (err) {
    console.error('Error connect:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
