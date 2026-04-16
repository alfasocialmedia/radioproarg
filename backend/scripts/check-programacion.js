require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const progs = await prisma.programacion.findMany({
      take: 10,
      include: {
        radio: {
            select: {
                id: true,
                subdominio: true
            }
        }
      }
    });
    console.log('Programas en la DB:');
    console.log(JSON.stringify(progs.map(p => ({
        id: p.id,
        nombre: p.nombrePrograma,
        radioIdEnProg: p.radioId,
        radioIdReal: p.radio?.id,
        subdominio: p.radio?.subdominio
    })), null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
