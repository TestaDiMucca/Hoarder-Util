-- CreateTable
CREATE TABLE "Pipeline" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" DATETIME NOT NULL,
    "color" TEXT,
    "manual_ranking" INTEGER NOT NULL DEFAULT 100
);

-- CreateTable
CREATE TABLE "PipelineModule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pipeline_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    CONSTRAINT "PipelineModule_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "Pipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PipelineModule_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Module" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PipelineStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pipeline_id" INTEGER NOT NULL,
    "times_ran" INTEGER NOT NULL DEFAULT 0,
    "time_taken" INTEGER NOT NULL DEFAULT 0,
    "times_edited" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PipelineStats_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "Pipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
