-- Rename Intervention_Types to Session_Types while preserving existing rows.
ALTER TABLE "Sessions" DROP CONSTRAINT "Sessions_fk_intervention_type_id_fkey";

ALTER TABLE "Intervention_Types" RENAME TO "Session_Types";
ALTER TABLE "Session_Types" RENAME COLUMN "intervention_type_id" TO "session_type_id";
ALTER TABLE "Session_Types" RENAME CONSTRAINT "Intervention_Types_pkey" TO "Session_Types_pkey";

ALTER TABLE "Sessions" RENAME COLUMN "fk_intervention_type_id" TO "fk_session_type_id";
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_fk_session_type_id_fkey" FOREIGN KEY ("fk_session_type_id") REFERENCES "Session_Types"("session_type_id") ON DELETE SET NULL ON UPDATE CASCADE;
