DROP INDEX "idx_agend_sala";--> statement-breakpoint
ALTER TABLE "unidades" ALTER COLUMN "id_unidade" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "areas" ALTER COLUMN "id_area" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "salas" ALTER COLUMN "id_sala" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "perfis" ALTER COLUMN "id_perfil" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "id_usuario" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "equipamentos" ALTER COLUMN "id_equipamento" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "turmas" ALTER COLUMN "id_turma" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "checklists" ALTER COLUMN "id_checklist" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "agendamentos" ADD COLUMN "docente" varchar(255);--> statement-breakpoint
ALTER TABLE "agendamentos" ADD COLUMN "disciplina" varchar(255);--> statement-breakpoint
ALTER TABLE "agendamentos" ADD COLUMN "observacao" text;--> statement-breakpoint
ALTER TABLE "agendamentos" ADD COLUMN "codigo_serie" varchar(50);--> statement-breakpoint
CREATE INDEX "idx_agend_serie" ON "agendamentos" USING btree ("codigo_serie" text_ops);