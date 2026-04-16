-- CreateTable
CREATE TABLE "chat_mensajes" (
    "id" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "nombreEmisor" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_mensajes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat_mensajes" ADD CONSTRAINT "chat_mensajes_radioId_fkey" FOREIGN KEY ("radioId") REFERENCES "radios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
