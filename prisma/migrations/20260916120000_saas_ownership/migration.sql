-- Backfill session owner from the linked contract when missing
UPDATE "Sessions" AS s
SET "fk_teacher_id" = c."fk_teacher_id"
FROM "Contracts" AS c
WHERE s."fk_contract_id" = c."contract_id"
  AND s."fk_teacher_id" IS NULL;

-- Ownerless sessions cannot exist in SaaS
DELETE FROM "Sessions"
WHERE "fk_teacher_id" IS NULL;

ALTER TABLE "Sessions" ALTER COLUMN "fk_teacher_id" SET NOT NULL;

-- Invoice owner from a linked session
ALTER TABLE "Invoices" ADD COLUMN "fk_teacher_id" INTEGER;

UPDATE "Invoices" AS i
SET "fk_teacher_id" = s."fk_teacher_id"
FROM "Sessions" AS s
WHERE s."fk_invoice_id" = i."invoice_id"
  AND i."fk_teacher_id" IS NULL
  AND s."fk_teacher_id" IS NOT NULL;

DELETE FROM "Invoices"
WHERE "fk_teacher_id" IS NULL;

ALTER TABLE "Invoices" ALTER COLUMN "fk_teacher_id" SET NOT NULL;

ALTER TABLE "Invoices"
  ADD CONSTRAINT "Invoices_fk_teacher_id_fkey"
  FOREIGN KEY ("fk_teacher_id") REFERENCES "Users"("user_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
