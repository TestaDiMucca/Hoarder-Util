/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Module` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Pipeline` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pipeline_id]` on the table `PipelineStats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Module_uuid_key" ON "Module"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_uuid_key" ON "Pipeline"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineStats_pipeline_id_key" ON "PipelineStats"("pipeline_id");
