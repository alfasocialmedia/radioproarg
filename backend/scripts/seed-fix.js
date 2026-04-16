
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando configuración de datos iniciales...');
  console.log('Conectando a DB:', process.env.DATABASE_URL ? 'OK (URL presente)' : 'ERROR (URL ausente)');

  // 1. Crear un Plan (si no existe)
  const planPremium = await prisma.plan.upsert({
    where: { slug: 'premium' },
    update: {},
    create: {
      nombre: 'Premium',
      slug: 'premium',
      precioMensual: 29.99,
      precioAnual: 299.99,
      descripcion: 'Plan completo con CMS y Audio',
      almacenamientoGB: 10,
      tieneCMS: true,
      tienePublicidad: true,
      tieneEstadisticas: true,
      bitrate: 128,
      maxOyentes: 1000,
      activo: true
    },
  });

  // 2. Crear una Radio
  const radio = await prisma.radio.upsert({
    where: { subdominio: 'onradio' },
    update: {},
    create: {
      nombre: 'OnRadio Demo',
      subdominio: 'onradio',
      planId: planPremium.id,
      activa: true,
      colorPrimario: '#3b82f6',
      colorSecundario: '#020817',
      colorBotones: '#3b82f6',
      colorTextos: '#ffffff',
      tituloNoticias: 'Titulares de Hoy',
    },
  });

  // 3. Crear Usuario Administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@onradio.com' },
    update: {},
    create: {
      email: 'admin@onradio.com',
      passwordHash: hashedPassword,
      nombre: 'Administrador',
      rol: 'ADMIN_RADIO',
      radioId: radio.id,
    },
  });

  console.log('✅ Datos creados con éxito:');
  console.log(`- Radio: ${radio.nombre} (ID: ${radio.id})`);
  console.log(`- Usuario: ${admin.email} (Password: admin123)`);
}

main()
  .catch((e) => {
    console.error('❌ Error configurando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
