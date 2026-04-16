require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        radio: {
            select: {
                id: true,
                subdominio: true
            }
        }
      }
    });
    console.log('Usuarios en la DB:');
    console.log(JSON.stringify(usuarios.map(u => ({
        email: u.email,
        rol: u.rol,
        radioIdEnUsuario: u.radioId,
        radioIdReal: u.radio?.id,
        subdominioRadio: u.radio?.subdominio
    })), null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
