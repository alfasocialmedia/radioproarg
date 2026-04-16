const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  try {
    const user = await prisma.usuario.findUnique({ where: { email: 'admin@onradio.com' } });
    if (!user) { console.log('ERROR: usuario no encontrado'); return; }
    console.log('ANTES:', user.id, '|', user.rol, '|', user.radioId);

    const updated = await prisma.usuario.update({
      where: { email: 'admin@onradio.com' },
      data: { rol: 'SUPER_ADMIN', radioId: null }
    });
    console.log('DESPUES:', updated.id, '|', updated.rol, '|', updated.radioId);

    // Verificar también portal y audio
    const others = await prisma.usuario.findMany({
      where: { email: { in: ['portal@onradio.com', 'audio@onradio.com'] } },
      select: { email: true, rol: true, radioId: true }
    });
    console.log('Otros usuarios:', JSON.stringify(others));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
fix();
