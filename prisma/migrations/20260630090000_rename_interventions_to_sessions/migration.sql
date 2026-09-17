-- Drop the old subject relation before removing the Subjects lookup table.
ALTER TABLE "Interventions" DROP CONSTRAINT "Interventions_fk_subject_id_fkey";
ALTER TABLE "Interventions" DROP COLUMN "fk_subject_id";
DROP TABLE "Subjects";

-- Rename Interventions to Sessions while preserving existing rows.
ALTER TABLE "Interventions" RENAME TO "Sessions";
ALTER TABLE "Sessions" RENAME COLUMN "intervention_id" TO "session_id";
ALTER TABLE "Sessions" ADD COLUMN "subject" TEXT;

-- Keep physical constraint names aligned with the renamed table.
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_pkey" TO "Sessions_pkey";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_fk_class_id_fkey" TO "Sessions_fk_class_id_fkey";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_fk_contract_id_fkey" TO "Sessions_fk_contract_id_fkey";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_fk_intervention_type_id_fkey" TO "Sessions_fk_intervention_type_id_fkey";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_fk_invoice_id_fkey" TO "Sessions_fk_invoice_id_fkey";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_fk_status_id_fkey" TO "Sessions_fk_status_id_fkey";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_fk_timescale_id_fkey" TO "Sessions_fk_timescale_id_fkey";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Interventions_fk_user_id_fkey" TO "Sessions_fk_user_id_fkey";
