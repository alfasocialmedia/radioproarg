const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const radios = await prisma.radio.findMany({
    select: {
      id: true,
      nombre: true,
      subdominio: true
    }
  });
  console.log(JSON.stringify(radios, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
