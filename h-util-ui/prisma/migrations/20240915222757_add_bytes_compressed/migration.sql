/*
  Warnings:

  - You are about to drop the column `times_edited` on the `PipelineStats` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PipelineStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pipeline_id" INTEGER NOT NULL,
    "times_ran" INTEGER NOT NULL DEFAULT 0,
    "time_taken" INTEGER NOT NULL DEFAULT 0,
    "bytes_compressed" INTEGER NOT NULL DEFAULT 0,
    "words_parsed" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PipelineStats_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "Pipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PipelineStats" ("id", "pipeline_id", "time_taken", "times_ran", "words_parsed") SELECT "id", "pipeline_id", "time_taken", "times_ran", "words_parsed" FROM "PipelineStats";
DROP TABLE "PipelineStats";
ALTER TABLE "new_PipelineStats" RENAME TO "PipelineStats";
CREATE UNIQUE INDEX "PipelineStats_pipeline_id_key" ON "PipelineStats"("pipeline_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
