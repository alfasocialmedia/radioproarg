/**
 * BASE DE CONOCIMIENTO DE ONRADIO
 * Este archivo contiene toda la información del sistema para que la IA
 * pueda responder preguntas frecuentes de manera automática y precisa.
 */

export const ONRADIO_KNOWLEDGE = `
# ONRADIO — Plataforma de Radio Streaming

## ¿Qué es ONRADIO?
ONRADIO es una plataforma SaaS (Software como Servicio) Argentina para radios online.
Permite a cualquier radio crear su presencia digital completa: streaming de audio en vivo,
portal web con noticias, podcasts, programación, publicidad, encuestas, y mucho más.
La plataforma opera bajo el dominio onradio.com.ar y cada radio recibe un subdominio propio
(ej: miradio.onradio.com.ar).

---

## PLANES Y PRECIOS

### Plan Audio — AR$ 7.000/mes
- Streaming de audio en vivo (servidor SonicPanel/Icecast)
- Panel de administración completo
- Reproductor embebible
- Estadísticas de oyentes en tiempo real
- AutoDJ (reproducción automática de música cuando no hay locutor)
- FTP para subir música al AutoDJ
- 5 GB de almacenamiento
- Hasta 100 oyentes simultáneos
- Soporte vía ticket

### Plan Portal — AR$ 20.000/mes
- TODO lo del Plan Audio, más:
- Portal web completo y personalizable con colores/logos propios
- CMS de Noticias (crear, editar, publicar notas con imágenes)
- Gestión de Podcasts (series, episodios, audio)
- Programación de grilla horaria (artículos con horarios y días)
- Sistema de Publicidad (banners, spots de audio, campañas)
- Encuestas interactivas en vivo con resultados en tiempo real
- Push Notifications a oyentes suscritos
- Chat en vivo durante transmisiones
- Categorías personalizadas de contenido
- 20 GB de almacenamiento
- Hasta 500 oyentes simultáneos
- Soporte prioritario

### Plan Premium (futuro)
- Características enterprise a definir

---

## FUNCIONALIDADES DEL PANEL DE ADMINISTRACIÓN

### Dashboard
- Estadísticas en tiempo real: oyentes actuales, pico del día, canciones más escuchadas
- Estado del stream: activo/inactivo, calidad del stream, bitrate
- Actividad reciente de la radio

### Transmisión / Live
- Ver estado del stream en tiempo real
- Metadatos de la canción actual (título, artista)
- Controles básicos del stream
- Historial de transmisiones

### Apariencia
- Configurar colores primarios y de fondo del portal
- Subir logo y favicon de la radio
- Personalizar el nombre y descripción de la radio
- Vista previa de cambios en tiempo real

### Noticias (Plan Portal)
- Editor de noticias con formato rich-text (negrita, cursiva, listas, links, imágenes)
- Subida de imagen destacada
- Categorías de noticias
- Publicar/archivar/eliminar notas
- Vista previa antes de publicar

### Programación (Plan Portal)
- Crear grilla de programas: nombre, descripción, horario, días de la semana
- Asignar imagen/imagen de programa
- Los oyentes pueden ver la programación semanal en el portal

### Podcasts (Plan Portal)
- Crear series de podcasts con descripción y portada
- Agregar episodios con archivo de audio (MP3)
- Los episodios son escuchables desde el portal

### Publicidad (Plan Portal)
- Gestión de campañas publicitarias
- Soporte para banners de imagen
- Spots de audio para reproducir entre canciones
- Configurar duración y frecuencia de anuncios

### Encuestas (Plan Portal)
- Crear encuestas con múltiples opciones
- Las encuestas aparecen en el portal para que voten los oyentes
- Resultados en tiempo real con gráficos
- Historial de encuestas

### Usuarios
- Gestionar el equipo de la radio: ADMIN, LOCUTOR
- Invitar usuarios por email
- Cada usuario tiene su propio acceso al panel

### Facturación
- Ver historial de pagos y facturas
- Gestionar suscripción y plan

### Soporte / Tickets
- Abrir tickets de soporte con descripción del problema
- Seguimiento de respuestas del equipo ONRADIO
- Historial de conversaciones de soporte

### Notificaciones Push (Plan Portal)
- Enviar notificaciones a todos los suscriptores de la radio
- Personalizar título y mensaje
- Historial de notificaciones enviadas

---

## CONFIGURACIÓN TÉCNICA DEL STREAMING

### SonicPanel / ICY Server
ONRADIO utiliza SonicPanel como servidor de streaming. Cada radio recibe:
- **SonicPanel ID**: Identificador único en el servidor (ej: sp_1234)
- **Puerto**: Puerto del servidor de streaming (ej: 8000)
- **Usuario Stream**: Credencial para conectar software de broadcasting
- **Password Stream**: Contraseña del stream
- **Mount Point**: Punto de montaje del stream (ej: /live)
- **URL de Stream**: URL completa para conectar oyentes y software

### Configurar Software de Broadcasting
Para transmitir en vivo necesitás conectar tu software al servidor:
- **BUTT (Broadcast Using This Tool)**: Software gratuito, muy fácil de configurar
- **Mixxx**: Software de DJ con soporte de streaming incorporado
- **Zara Radio**: Para automatización y AutoDJ local
- **Configuración**: Servidor = URL del stream, Puerto, Usuario y Password del Stream

### AutoDJ y FTP
El AutoDJ permite que la radio suene automáticamente cuando no hay locutor:
- Accedé con las credenciales FTP a la carpeta de música
- Subí archivos MP3 al servidor
- Desde SonicPanel configurás las listas de reproducción y horarios del AutoDJ
- Software FTP recomendado: FileZilla (gratuito)

### URL de streaming
La URL pública del stream es la que comparten los oyentes para escuchar la radio.
Formato típico: https://stream.servidor.com:8000/live

---

## PORTAL PÚBLICO DE LA RADIO

Cada radio con Plan Portal tiene un portal web en su subdominio (ej: miradio.onradio.com.ar):
- Reproductor de audio en vivo siempre visible
- Canción actual en reproducción (si el servidor lo soporta)
- Sección de Noticias con las últimas novedades
- Grilla de Programación semanal
- Sección de Podcasts
- Encuestas activas
- Galería de oyentes / chat en vivo
- Diseño completamente responsive (móvil, tablet, desktop)

---

## PAGOS Y FACTURACIÓN

- Los pagos se procesan a través de **MercadoPago**
- Los planes son mensuales con renovación automática
- Se puede cancelar en cualquier momento desde el panel
- Las facturas quedan disponibles en la sección Facturación del panel
- Si hay mora en el pago, la radio puede quedar suspendida temporalmente

---

## ALMACENAMIENTO

- **Plan Audio**: 5 GB para música del AutoDJ
- **Plan Portal**: 20 GB para música, imágenes, podcasts y medios
- El SuperAdmin puede asignar GB extras individualmente a cada radio
- Se puede controlar el uso de disco desde el panel de SuperAdmin

---

## SOPORTE TÉCNICO

- **Tickets**: Desde el panel de administración > Soporte
- **Tiempo de respuesta**: 24-48hs hábiles
- **WhatsApp**: Disponible para clientes activos
- **Email**: Configurado en los settings de la plataforma

---

## ROLES Y USUARIOS

### SUPER_ADMIN
- Acceso total a la plataforma
- Gestiona todas las radios (emisoras/tenants)
- Configura planes, FAQ, tutoriales
- Responde tickets de soporte
- Accede al panel en /superadmin

### ADMIN_RADIO
- Administrador de una radio específica
- Acceso a todas las funciones según el plan contratado
- No puede ver otras radios

### LOCUTOR
- Acceso limitado: puede gestionar transmisión en vivo, noticias y encuestas
- No puede cambiar configuraciones críticas de la radio

---

## PREGUNTAS TÉCNICAS FRECUENTES

### ¿Por qué no se escucha mi radio?
1. Verificar que el software de broadcasting esté conectado y transmitiendo
2. Comprobar que los datos de conexión (servidor, puerto, usuario, contraseña) sean correctos
3. Verificar que la radio esté en estado "Activa" en el panel de SuperAdmin
4. Comprobar si hay error en el SonicPanel

### ¿Cómo configuro BUTT para transmitir?
1. Descargar BUTT desde https://danielnoethen.de/butt/
2. En Settings > Server: elegir "ICY / SHOUTcast"
3. Ingresar la URL del servidor, puerto, usuario y contraseña del stream
4. En Settings > Audio: seleccionar el micrófono o fuente de audio
5. Clic en el botón Play para comenzar a transmitir

### ¿Qué bitrate usar?
- 128 kbps MP3: Calidad estándar, recomendado para la mayoría
- 192 kbps MP3: Alta calidad, requiere mayor ancho de banda del locutor

### ¿Cuántos mb/s de internet necesito para transmitir?
- 128 kbps: Al menos 256 kbps de subida (0.25 Mbps)
- 192 kbps: Al menos 384 kbps de subida (0.38 Mbps)
- Se recomienda conexión fija o fibra óptica para mayor estabilidad

---

## INFORMACIÓN GENERAL

**Empresa**: ONRADIO — Plataforma de Radio Streaming
**País**: Argentina
**Moneda**: Pesos Argentinos (ARS)
**Idioma de la plataforma**: Español
**Web principal**: onradio.com.ar
**El sistema opera 24/7** con monitoreo automático del estado de los streams.
`;
