import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/utils/crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('📡 Configurando datos de transmisión para la radio DEMO...');
    
    const radioId = 'demo';
    const radio = await prisma.radio.findUnique({ where: { id: radioId } });
    
    if (!radio) {
        console.error('❌ Radio demo no encontrada.');
        return;
    }

    await prisma.radio.update({
        where: { id: radioId },
        data: {
            streamUser: 'onradio_demo',
            streamPassword: encrypt('stream123pass'),
            streamUrl: 'https://stream.onradio.com.ar/demo',
            streamMount: '/stream',
            streamPort: 8000,
            sonicpanelId: '101',
            ftpUser: 'ftp_onradio_demo',
            ftpPassword: encrypt('ftp123pass'),
        }
    });

    console.log('✅ Radio DEMO actualizada con credenciales de prueba cifradas.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
