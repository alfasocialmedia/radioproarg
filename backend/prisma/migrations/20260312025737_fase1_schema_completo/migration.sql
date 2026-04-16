-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('SUPER_ADMIN', 'ADMIN_RADIO', 'EDITOR_NOTICIAS', 'LOCUTOR');

-- CreateEnum
CREATE TYPE "EstadoOrder" AS ENUM ('PENDIENTE', 'PAGADA', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_PROCESO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('ABIERTO', 'EN_PROCESO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoNoticia" AS ENUM ('BORRADOR', 'PUBLICADA', 'PROGRAMADA');

-- CreateEnum
CREATE TYPE "UbicacionBanner" AS ENUM ('HEADER', 'FOOTER', 'SIDEBAR', 'IN_ARTICLE_TOP', 'IN_ARTICLE_MIDDLE', 'IN_ARTICLE_BOTTOM');

-- CreateTable
CREATE TABLE "planes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioMensual" DOUBLE PRECISION NOT NULL,
    "precioAnual" DOUBLE PRECISION NOT NULL,
    "bitrate" INTEGER NOT NULL DEFAULT 128,
    "maxOyentes" INTEGER NOT NULL DEFAULT 100,
    "almacenamientoGB" INTEGER NOT NULL DEFAULT 5,
    "tieneCMS" BOOLEAN NOT NULL DEFAULT false,
    "tienePublicidad" BOOLEAN NOT NULL DEFAULT false,
    "tieneEstadisticas" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "subdominio" TEXT NOT NULL,
    "dominioCustom" TEXT,
    "logoUrl" TEXT,
    "colorPrimario" TEXT NOT NULL DEFAULT '#3b82f6',
    "colorSecundario" TEXT NOT NULL DEFAULT '#1d4ed8',
    "streamUrl" TEXT,
    "mercadoPagoLink" TEXT,
    "paypalLink" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "suspendida" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" TEXT,
    "planVenceEn" TIMESTAMP(3),
    "periodoFacturacion" TEXT NOT NULL DEFAULT 'mensual',
    "sonicpanelId" TEXT,
    "streamUser" TEXT,
    "streamPassword" TEXT,
    "streamPort" INTEGER,
    "streamMount" TEXT,
    "ftpUser" TEXT,
    "ftpPassword" TEXT,

    CONSTRAINT "radios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT,
    "telefono" TEXT,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ADMIN_RADIO',
    "radioId" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes" (
    "id" TEXT NOT NULL,
    "radioId" TEXT,
    "planId" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoOrder" NOT NULL DEFAULT 'PENDIENTE',
    "mpPreferenceId" TEXT,
    "datosPagador" JSONB,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "radioId" TEXT,
    "orderId" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "mpPaymentId" TEXT,
    "mpStatus" TEXT,
    "metodo" TEXT,
    "fechaPago" TIMESTAMP(3),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'ABIERTO',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_mensajes" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "esAdmin" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noticias" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "copete" TEXT,
    "contenidoHtml" TEXT NOT NULL,
    "imagenDestacada" TEXT,
    "estado" "EstadoNoticia" NOT NULL DEFAULT 'BORRADOR',
    "metaTitulo" TEXT,
    "metaDescripcion" TEXT,
    "ogImagen" TEXT,
    "autorId" TEXT NOT NULL,
    "fechaPublicacion" TIMESTAMP(3),
    "fechaProgramada" TIMESTAMP(3),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_noticias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "categorias_noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanoBytes" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auspiciantes" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "nombreEmpresa" TEXT NOT NULL,
    "emailContacto" TEXT,

    CONSTRAINT "auspiciantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "auspicianteId" TEXT NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "urlDestino" TEXT,
    "ubicacion" "UbicacionBanner" NOT NULL DEFAULT 'SIDEBAR',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "clics" INTEGER NOT NULL DEFAULT 0,
    "impresiones" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programacion" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "nombrePrograma" TEXT NOT NULL,
    "conductores" TEXT,
    "imagenPrograma" TEXT,

    CONSTRAINT "programacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuestas" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opciones_encuesta" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "votos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "opciones_encuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NoticiaToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NoticiaToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoriaNoticiaToNoticia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoriaNoticiaToNoticia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "planes_slug_key" ON "planes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "radios_subdominio_key" ON "radios"("subdominio");

-- CreateIndex
CREATE UNIQUE INDEX "radios_dominioCustom_key" ON "radios"("dominioCustom");

-- CreateIndex
CREATE UNIQUE INDEX "settings_clave_key" ON "settings"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "noticias_radioId_slug_key" ON "noticias"("radioId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_noticias_slug_key" ON "categorias_noticias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_radioId_slug_key" ON "tags"("radioId", "slug");

-- CreateIndex
CREATE INDEX "_NoticiaToTag_B_index" ON "_NoticiaToTag"("B");

-- CreateIndex
CREATE INDEX "_CategoriaNoticiaToNoticia_B_index" ON "_CategoriaNoticiaToNoticia"("B");

-- AddForeignKey
ALTER TABLE "radios" ADD CONSTRAINT "radios_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_mensajes" ADD CONSTRAINT "ticket_mensajes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_mensajes" ADD CONSTRAINT "ticket_mensajes_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auspiciantes" ADD CONSTRAINT "auspiciantes_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_auspicianteId_fkey" FOREIGN KEY ("auspicianteId") REFERENCES "auspiciantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion" ADD CONSTRAINT "programacion_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuestas" ADD CONSTRAINT "encuestas_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opciones_encuesta" ADD CONSTRAINT "opciones_encuesta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoticiaToTag" ADD CONSTRAINT "_NoticiaToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoticiaToTag" ADD CONSTRAINT "_NoticiaToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaNoticiaToNoticia" ADD CONSTRAINT "_CategoriaNoticiaToNoticia_A_fkey" FOREIGN KEY ("A") REFERENCES "categorias_noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaNoticiaToNoticia" ADD CONSTRAINT "_CategoriaNoticiaToNoticia_B_fkey" FOREIGN KEY ("B") REFERENCES "noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
