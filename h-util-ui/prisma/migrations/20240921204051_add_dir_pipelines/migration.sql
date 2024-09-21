-- CreateTable
CREATE TABLE "Aqueduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "pipeline_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "directories" TEXT NOT NULL,
    CONSTRAINT "Aqueduct_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "Pipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Aqueduct_uuid_key" ON "Aqueduct"("uuid");
