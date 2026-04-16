
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    select: {
      email: true,
      rol: true,
      radioId: true
    }
  });
  console.log('USUARIOS EN DB:');
  console.table(users);
  
  const radios = await prisma.radio.findMany({
    select: {
      id: true,
      nombre: true,
      subdominio: true
    }
  });
  console.log('RADIOS EN DB:');
  console.table(radios);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
