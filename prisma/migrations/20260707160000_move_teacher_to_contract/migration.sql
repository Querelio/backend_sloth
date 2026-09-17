-- Drop teacher from Classes
ALTER TABLE "Classes" DROP CONSTRAINT "Classes_fk_teacher_id_fkey";
ALTER TABLE "Classes" DROP COLUMN "fk_teacher_id";

-- Rename user to teacher on Sessions
ALTER TABLE "Sessions" RENAME COLUMN "fk_user_id" TO "fk_teacher_id";
ALTER TABLE "Sessions" RENAME CONSTRAINT "Sessions_fk_user_id_fkey" TO "Sessions_fk_teacher_id_fkey";

-- Add teacher to Contracts (backfill existing rows with first user)
ALTER TABLE "Contracts" ADD COLUMN "fk_teacher_id" INTEGER;

UPDATE "Contracts"
SET "fk_teacher_id" = (SELECT MIN("user_id") FROM "Users")
WHERE "fk_teacher_id" IS NULL;

ALTER TABLE "Contracts" ALTER COLUMN "fk_teacher_id" SET NOT NULL;

ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_fk_teacher_id_fkey" FOREIGN KEY ("fk_teacher_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
