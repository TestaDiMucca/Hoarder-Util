/*
  Warnings:

  - A unique constraint covering the columns `[pipeline_id,module_id]` on the table `PipelineModule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PipelineModule_pipeline_id_module_id_key" ON "PipelineModule"("pipeline_id", "module_id");
