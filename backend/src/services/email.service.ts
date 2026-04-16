import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

export interface EmailBienvenidaParams {
    destinatario: string;
    nombreRadio: string;
    plan: string;
    streamUser: string;
    streamPassword: string;
    streamMount: string;
    streamPort: number;
    streamUrl: string;
    ftpUser: string;
    ftpPassword: string;
    panelUrl: string;
    passwordPanel: string;
}

export const enviarEmailBienvenida = async (params: EmailBienvenidaParams): Promise<void> => {
    const {
        destinatario, nombreRadio, plan,
        streamUser, streamPassword, streamMount, streamPort, streamUrl,
        ftpUser, ftpPassword, panelUrl, passwordPanel
    } = params;

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:40px 30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-1px;">🎙️ ONRADIO</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:16px;">¡Tu radio está lista para transmitir!</p>
        </div>
        
        <!-- Body -->
        <div style="padding:30px;">
          <h2 style="color:#1e293b;font-size:20px;">Hola, bienvenido/a a <strong>${nombreRadio}</strong> 👋</h2>
          <p style="color:#64748b;line-height:1.6;">Tu suscripción al <strong>Plan ${plan}</strong> fue activada con éxito. Aquí encontrás todos los accesos que necesitás para empezar a transmitir.</p>
          
          <!-- Panel de Administración -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
            <h3 style="color:#3b82f6;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">🖥️ Panel de Administración</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:140px;">URL del Panel</td><td style="padding:6px 0;font-weight:bold;font-size:14px;"><a href="${panelUrl}" style="color:#3b82f6;">${panelUrl}</a></td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:6px 0;font-weight:bold;font-size:14px;">${destinatario}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Contraseña</td><td style="padding:6px 0;font-weight:bold;font-size:14px;color:#dc2626;">${passwordPanel}</td></tr>
            </table>
          </div>
          
          <!-- Datos de Streaming -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;">
            <h3 style="color:#16a34a;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">🎵 Datos de Streaming</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:140px;">URL del Stream</td><td style="padding:6px 0;font-weight:bold;font-size:13px;font-family:monospace;">${streamUrl}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Servidor</td><td style="padding:6px 0;font-weight:bold;font-size:13px;font-family:monospace;">${new URL(streamUrl).hostname}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Puerto</td><td style="padding:6px 0;font-weight:bold;font-size:13px;font-family:monospace;">${streamPort}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Mountpoint</td><td style="padding:6px 0;font-weight:bold;font-size:13px;font-family:monospace;">${streamMount}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Usuario</td><td style="padding:6px 0;font-weight:bold;font-size:13px;font-family:monospace;">${streamUser}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Contraseña</td><td style="padding:6px 0;font-weight:bold;font-size:13px;color:#dc2626;font-family:monospace;">${streamPassword}</td></tr>
            </table>
          </div>
          
          <!-- FTP -->
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:20px;margin:20px 0;">
            <h3 style="color:#d97706;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">📁 Acceso FTP (AutoDJ)</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:140px;">Usuario FTP</td><td style="padding:6px 0;font-weight:bold;font-size:13px;font-family:monospace;">${ftpUser}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Contraseña FTP</td><td style="padding:6px 0;font-weight:bold;font-size:13px;color:#dc2626;font-family:monospace;">${ftpPassword}</td></tr>
            </table>
          </div>
          
          <p style="color:#64748b;line-height:1.6;font-size:14px;">⚠️ <strong>Guardá bien estas credenciales</strong>. Te recomendamos cambiar tu contraseña del panel al ingresar por primera vez.</p>
          <p style="color:#64748b;line-height:1.6;font-size:14px;">¿Necesitás ayuda? Respondé este email o contactanos por WhatsApp.</p>
        </div>
        
        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2025 ONRADIO · onradio.com.ar · Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>`;

    try {
        if (!process.env.SMTP_USER) {
            console.log('[Email] SMTP no configurado. Email que se enviaría a:', destinatario);
            console.log('[Email] Contraseña del panel:', passwordPanel);
            return;
        }

        await transporter.sendMail({
            from: `"ONRADIO" <${process.env.SMTP_USER}>`,
            to: destinatario,
            subject: `🎙️ ¡Tu radio "${nombreRadio}" está lista! Aquí tus credenciales`,
            html,
        });

        console.log('[Email] Bienvenida enviada a:', destinatario);
    } catch (error: any) {
        console.error('[Email] Error enviando email:', error.message);
        // No lanzamos el error para no interrumpir el flujo principal
    }
};

/**
 * Notifica al cliente que su ticket recibió una respuesta
 */
export const enviarEmailTicketRespuesta = async (
    destinatario: string,
    asuntoTicket: string,
    respuesta: string,
    ticketId: string
): Promise<void> => {
    if (!process.env.SMTP_USER) return;
    
    // Un diseño más estilizado para la respuesta del ticket
    const htmlSnippet = `
    <div style="font-family:sans-serif;color:#333;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;border-radius:10px;">
        <h2 style="color:#3b82f6;">Nueva respuesta en tu ticket 🎙️</h2>
        <p>Hola, el equipo de soporte de <strong>ONRADIO</strong> ha respondido a tu consulta:</p>
        <div style="background:#f9f9f9;padding:15px;border-left:4px solid #3b82f6;font-style:italic;margin:20px 0;">
            "${respuesta}"
        </div>
        <p style="font-size:14px;color:#666;">Ticket: <strong>${asuntoTicket}</strong> (Ref: #${ticketId.slice(-6)})</p>
        <hr style="border:0;border-top:1px solid #eee;margin:20px 0;" />
        <p style="font-size:12px;color:#999;text-align:center;">Este es un mensaje automático, por favor no lo respondas directamente.</p>
    </div>`;

    try {
        await transporter.sendMail({
            from: `"Soporte ONRADIO" <${process.env.SMTP_USER}>`,
            to: destinatario,
            subject: `[Re: #${ticketId.slice(-6)}] Nueva respuesta: ${asuntoTicket}`,
            html: htmlSnippet,
        });
    } catch (e: any) {
        console.error('[Email] Error enviando respuesta de ticket:', e.message);
    }
};

/**
 * Notifica a los administradores del sistema que se ha creado un nuevo ticket
 */
export const enviarNotificacionNuevoTicket = async (
    radioNombre: string,
    asuntoTicket: string,
    mensaje: string,
    ticketId: string
): Promise<void> => {
    const adminEmail = process.env.ADMIN_NOTIFICACIONES_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) return;

    const htmlSnippet = `
    <div style="font-family:sans-serif;color:#333;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;border-radius:10px;background:#fff5f5;">
        <h2 style="color:#e11d48;">🚨 Nuevo Ticket de Soporte</h2>
        <p>La radio <strong>${radioNombre}</strong> ha abierto un nuevo ticket.</p>
        <p><strong>Asunto:</strong> ${asuntoTicket}</p>
        <div style="background:#fff;padding:15px;border:1px solid #fecaca;border-radius:8px;margin:20px 0;">
            ${mensaje}
        </div>
        <a href="${process.env.ADMIN_URL || '#'}/tickets/${ticketId}" 
           style="display:inline-block;background:#e11d48;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold;">
           Ver Ticket en el Panel
        </a>
    </div>`;

    try {
        await transporter.sendMail({
            from: `"Sistema ONRADIO" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🚨 NUEVO TICKET: ${radioNombre} - ${asuntoTicket}`,
            html: htmlSnippet,
        });
    } catch (e: any) {
        console.error('[Email] Error enviando notificación de nuevo ticket:', e.message);
    }
};
