/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Roles" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fk_role_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Subjects" (
    "subject_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subjects_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "Institutions" (
    "institution_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "requires_declaration" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Institutions_pkey" PRIMARY KEY ("institution_id")
);

-- CreateTable
CREATE TABLE "Classes" (
    "class_id" SERIAL NOT NULL,
    "fk_institution_id" INTEGER NOT NULL,
    "class_level" TEXT NOT NULL,
    "student_count" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fk_teacher_id" INTEGER NOT NULL,

    CONSTRAINT "Classes_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "Pricing_Modes" (
    "pricing_mode_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Pricing_Modes_pkey" PRIMARY KEY ("pricing_mode_id")
);

-- CreateTable
CREATE TABLE "Contracts" (
    "contract_id" SERIAL NOT NULL,
    "fk_institution_id" INTEGER NOT NULL,
    "fk_pricing_mode_id" INTEGER NOT NULL,
    "contract_number" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "hourly_volume_planned" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Contracts_pkey" PRIMARY KEY ("contract_id")
);

-- CreateTable
CREATE TABLE "Status" (
    "status_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "Intervention_Types" (
    "intervention_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Intervention_Types_pkey" PRIMARY KEY ("intervention_type_id")
);

-- CreateTable
CREATE TABLE "Timescale" (
    "timescale_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Timescale_pkey" PRIMARY KEY ("timescale_id")
);

-- CreateTable
CREATE TABLE "Invoices" (
    "invoice_id" SERIAL NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" DATE NOT NULL,
    "payment_date" DATE,
    "status" TEXT NOT NULL,

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "Interventions" (
    "intervention_id" SERIAL NOT NULL,
    "fk_subject_id" INTEGER,
    "fk_class_id" INTEGER,
    "title" TEXT NOT NULL,
    "fk_contract_id" INTEGER,
    "fk_status_id" INTEGER NOT NULL DEFAULT 1,
    "fk_user_id" INTEGER,
    "fk_invoice_id" INTEGER,
    "fk_intervention_type_id" INTEGER,
    "fk_timescale_id" INTEGER,
    "date" DATE NOT NULL,
    "start" TIME(6) NOT NULL,
    "end" TIME(6) NOT NULL,
    "declaration_reference" TEXT,
    "declaration_date" DATE,

    CONSTRAINT "Interventions_pkey" PRIMARY KEY ("intervention_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_fk_role_id_fkey" FOREIGN KEY ("fk_role_id") REFERENCES "Roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_fk_teacher_id_fkey" FOREIGN KEY ("fk_teacher_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_fk_institution_id_fkey" FOREIGN KEY ("fk_institution_id") REFERENCES "Institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_fk_institution_id_fkey" FOREIGN KEY ("fk_institution_id") REFERENCES "Institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_fk_pricing_mode_id_fkey" FOREIGN KEY ("fk_pricing_mode_id") REFERENCES "Pricing_Modes"("pricing_mode_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_class_id_fkey" FOREIGN KEY ("fk_class_id") REFERENCES "Classes"("class_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_contract_id_fkey" FOREIGN KEY ("fk_contract_id") REFERENCES "Contracts"("contract_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_intervention_type_id_fkey" FOREIGN KEY ("fk_intervention_type_id") REFERENCES "Intervention_Types"("intervention_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_invoice_id_fkey" FOREIGN KEY ("fk_invoice_id") REFERENCES "Invoices"("invoice_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_status_id_fkey" FOREIGN KEY ("fk_status_id") REFERENCES "Status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_subject_id_fkey" FOREIGN KEY ("fk_subject_id") REFERENCES "Subjects"("subject_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_timescale_id_fkey" FOREIGN KEY ("fk_timescale_id") REFERENCES "Timescale"("timescale_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "Users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
