import axios from 'axios';

// Asegurarse de que la URL tenga el protocolo correcto
const baseSonicUrl = process.env.SONICPANEL_URL || '';
const SONICPANEL_URL = baseSonicUrl.startsWith('http') ? baseSonicUrl : `https://${baseSonicUrl}`;
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
    timeout: 20000, // Aumentado a 20s para operaciones de creación pesadas
});

export interface SonicRadioParams {
    nombre: string;
    bitrate: number;
    maxOyentes: number;
    email: string;
    paquete?: string;
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
 */
export const crearRadioEnSonicPanel = async (params: SonicRadioParams): Promise<SonicRadioResult> => {
    // Validaciones básicas antes de llamar a la API
    if (params.bitrate > 320) params.bitrate = 320;
    if (params.bitrate < 32) params.bitrate = 32;

    if (!SONICPANEL_URL || !SONICPANEL_KEY || SONICPANEL_KEY === '') {
        console.warn('[SonicPanel] API no configurada. Generando credenciales de prueba.');
        const username = `radio_${Date.now().toString().slice(-6)}`;
        const pass = generarPassword();
        return {
            radioId: `mock_${Date.now()}`,
            streamUser: username,
            streamPassword: pass,
            streamMount: `/${username}`,
            streamPort: 8000 + Math.floor(Math.random() * 1000),
            ftpUser: username,
            ftpPassword: pass,
            streamUrl: `http://stream.onradio.com.ar:8000${username}`,
        };
    }

    try {
        console.log(`[SonicPanel] Intentando crear radio: ${params.nombre} (${params.email})`);
        
        const response = await sonicClient.post('/api/v2/radio/create', {
            name: params.nombre,
            bitrate: params.bitrate,
            maxListeners: params.maxOyentes,
            email: params.email,
            package: params.paquete || 'basic',
        });

        const data = response.data;
        
        if (!data || !data.id) {
            throw new Error('Respuesta inválida de la API de SonicPanel');
        }

        console.log(`[SonicPanel] Radio creada con ID: ${data.id}`);

        return {
            radioId: String(data.id),
            streamUser: data.stream_username,
            streamPassword: data.stream_password,
            streamMount: data.mount || `/${data.stream_username}`,
            streamPort: Number(data.port),
            ftpUser: data.ftp_username,
            ftpPassword: data.ftp_password,
            streamUrl: data.stream_url,
        };
    } catch (error: any) {
        const detail = error.response?.data || error.message;
        console.error('[SonicPanel] Error crítico en creación:', detail);
        
        // Mapeo de errores comunes de SonicPanel para que el usuario reciba algo útil
        if (typeof detail === 'object' && detail.error) {
            throw new Error(`SonicPanel: ${detail.error}`);
        }
        
        throw new Error('No se pudo establecer conexión con el servidor de streaming. Por favor, reintente en unos minutos.');
    }
};

/**
 * Suspende o reactiva una radio
 */
export const cambiarEstadoRadioEnSonicPanel = async (sonicpanelId: string, suspender: boolean): Promise<boolean> => {
    if (!SONICPANEL_URL || !SONICPANEL_KEY) return false;
    
    const action = suspender ? 'suspend' : 'unsuspend';
    try {
        await sonicClient.post(`/api/v2/radio/${sonicpanelId}/${action}`);
        console.log(`[SonicPanel] Acción "${action}" exitosa para ID: ${sonicpanelId}`);
        return true;
    } catch (error: any) {
        console.error(`[SonicPanel] Error en "${action}":`, error.message);
        return false;
    }
};

/**
 * Elimina una radio
 */
export const eliminarRadioEnSonicPanel = async (sonicpanelId: string): Promise<boolean> => {
    if (!SONICPANEL_URL || !SONICPANEL_KEY) return false;
    try {
        await sonicClient.delete(`/api/v2/radio/${sonicpanelId}`);
        console.log(`[SonicPanel] Radio eliminada exitosamente: ${sonicpanelId}`);
        return true;
    } catch (error: any) {
        console.error('[SonicPanel] Error en eliminación:', error.message);
        return false;
    }
};

// Genera contraseña aleatoria segura
function generarPassword(longitud = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < longitud; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
}
