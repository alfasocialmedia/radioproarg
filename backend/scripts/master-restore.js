require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🛠️ Iniciando RESTAURACIÓN MAESTRA...');

  // 1. Obtener radio demo
  let radio = await prisma.radio.findFirst({
    where: { subdominio: 'demo' }
  });

  if (!radio) {
    console.log('⚠️ Radio demo no encontrada. Creándola...');
    radio = await prisma.radio.create({
        data: {
            nombre: 'OnRadio Demo',
            subdominio: 'demo',
            activa: true,
            colorPrimario: '#3b82f6',
            colorSecundario: '#020817'
        }
    });
  }

  // 2. Asegurar campos de configuración (WOW Edition)
  console.log('🎨 Aplicando configuración premium...');
  await prisma.radio.update({
    where: { id: radio.id },
    data: {
        tituloNoticias: 'Últimas Noticias OnRadio', // Campo que el usuario pedía
        colorPrimario: '#6d28d9', // Púrpura Premium
        colorBotones: '#6d28d9',
        colorSecundario: '#0f172a',
        colorTextos: '#ffffff',
        plantilla: 'moderno', // Volvemos a la moderna por defecto si se desconfiguró
        activa: true,
        suspendida: false
    }
  });

  // 3. Vincular Usuario Admin con el id REAL (UUID) de la radio
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@onradio.com' },
    update: {
        radioId: radio.id, // Sincronizamos con el UUID real
        rol: 'ADMIN_RADIO'
    },
    create: {
        email: 'admin@onradio.com',
        passwordHash: hashedPassword,
        nombre: 'Administrador Demo',
        rol: 'ADMIN_RADIO',
        radioId: radio.id
    }
  });

  console.log('✅ Restauración completada con éxito.');
  console.log(`- Radio ID: ${radio.id} (Subdominio: demo)`);
  console.log(`- Usuario: admin@onradio.com (Vinculado correctamente)`);
  console.log('🚀 TIP: Recomendá al usuario hacer logout/login.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
