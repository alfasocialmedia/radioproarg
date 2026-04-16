import axios from 'axios';

const SONICPANEL_URL = process.env.SONICPANEL_URL || '';
const SONICPANEL_KEY = process.env.SONICPANEL_KEY || '';

/**
 * Cliente HTTP para la API de SonicPanel
 * Docs: https://www.sonicpanel.net/api-docs
 */
const sonicClient = axios.create({
    baseURL: SONICPANEL_URL,
    headers: {
        'Authorization': `Bearer ${SONICPANEL_KEY}`,
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

export interface SonicRadioParams {
    nombre: string;
    bitrate: number;
    maxOyentes: number;
    email: string;
    paquete?: string; // el paquete de SonicPanel correspondiente al plan
}

export interface SonicRadioResult {
    radioId: string;
    streamUser: string;
    streamPassword: string;
    streamMount: string;
    streamPort: number;
    ftpUser: string;
    ftpPassword: string;
    streamUrl: string;
}

/**
 * Crea una nueva radio en SonicPanel
 * Retorna las credenciales de streaming y FTP
 */
export const crearRadioEnSonicPanel = async (params: SonicRadioParams): Promise<SonicRadioResult> => {
    if (!SONICPANEL_URL || !SONICPANEL_KEY) {
        console.warn('[SonicPanel] Variables de entorno no configuradas. Generando credenciales placeholder.');
        // En modo demo/desarrollo, devuelve credenciales placeholder
        const username = `radio_${Date.now()}`;
        return {
            radioId: `sp_${Date.now()}`,
            streamUser: username,
            streamPassword: generarPassword(),
            streamMount: `/${username}`,
            streamPort: 8000,
            ftpUser: `ftp_${username}`,
            ftpPassword: generarPassword(),
            streamUrl: `http://${SONICPANEL_URL || 'stream.miservidor.com'}:8000/${username}`,
        };
    }

    try {
        // Endpoint real de SonicPanel para crear una nueva cuenta de radio
        const response = await sonicClient.post('/api/v2/radio/create', {
            name: params.nombre,
            bitrate: params.bitrate,
            maxListeners: params.maxOyentes,
            email: params.email,
            package: params.paquete || 'basic',
        });

        const data = response.data;

        return {
            radioId: data.id,
            streamUser: data.stream_username,
            streamPassword: data.stream_password,
            streamMount: data.mount,
            streamPort: data.port,
            ftpUser: data.ftp_username,
            ftpPassword: data.ftp_password,
            streamUrl: data.stream_url,
        };
    } catch (error: any) {
        console.error('[SonicPanel] Error creando radio:', error.response?.data || error.message);
        throw new Error('Error al crear la radio en SonicPanel. Contacte al administrador.');
    }
};

/**
 * Suspende una radio en SonicPanel
 */
export const suspenderRadioEnSonicPanel = async (sonicpanelId: string): Promise<void> => {
    if (!SONICPANEL_URL || !SONICPANEL_KEY) return;
    try {
        await sonicClient.post(`/api/v2/radio/${sonicpanelId}/suspend`);
    } catch (error: any) {
        console.error('[SonicPanel] Error suspendiendo radio:', error.message);
    }
};

/**
 * Reactiva una radio suspendida en SonicPanel
 */
export const reactivarRadioEnSonicPanel = async (sonicpanelId: string): Promise<void> => {
    if (!SONICPANEL_URL || !SONICPANEL_KEY) return;
    try {
        await sonicClient.post(`/api/v2/radio/${sonicpanelId}/unsuspend`);
    } catch (error: any) {
        console.error('[SonicPanel] Error reactivando radio:', error.message);
    }
};

/**
 * Elimina una radio de SonicPanel
 */
export const eliminarRadioEnSonicPanel = async (sonicpanelId: string): Promise<void> => {
    if (!SONICPANEL_URL || !SONICPANEL_KEY) return;
    try {
        await sonicClient.delete(`/api/v2/radio/${sonicpanelId}`);
    } catch (error: any) {
        console.error('[SonicPanel] Error eliminando radio:', error.message);
    }
};

// Genera contraseña aleatoria segura
function generarPassword(longitud = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789!@#$%';
    return Array.from({ length: longitud }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
