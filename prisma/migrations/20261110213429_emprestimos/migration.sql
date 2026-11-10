-- CreateTable
CREATE TABLE "emprestimos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "equipamento_id" INTEGER NOT NULL,
    "solicitado_em" TIMESTAMP(3) NOT NULL,
    "devolucao_prevista_em" DATE NOT NULL,
    "devolvido_em" TIMESTAMP(3),

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emprestimos_usuario_id_devolvido_em_idx" ON "emprestimos"("usuario_id", "devolvido_em");

-- CreateIndex
CREATE INDEX "emprestimos_equipamento_id_devolvido_em_idx" ON "emprestimos"("equipamento_id", "devolvido_em");

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
