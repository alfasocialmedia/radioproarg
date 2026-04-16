require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const progs = await prisma.programacion.findMany({
      where: {
        id: {
            contains: '84d8'
        }
      }
    });
    console.log('Programas encontrados con 84d8:');
    console.log(JSON.stringify(progs, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
