-- Drop Session_Types table and remove session type reference from Sessions.
ALTER TABLE "Sessions" DROP CONSTRAINT "Sessions_fk_session_type_id_fkey";

ALTER TABLE "Sessions" DROP COLUMN "fk_session_type_id";

DROP TABLE "Session_Types";
