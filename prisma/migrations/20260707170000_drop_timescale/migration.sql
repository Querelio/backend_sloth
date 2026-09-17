-- Drop Timescale table and remove timescale reference from Sessions.
ALTER TABLE "Sessions" DROP CONSTRAINT "Sessions_fk_timescale_id_fkey";

ALTER TABLE "Sessions" DROP COLUMN "fk_timescale_id";

DROP TABLE "Timescale";
