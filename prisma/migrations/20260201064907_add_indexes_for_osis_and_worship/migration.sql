-- CreateIndex
CREATE INDEX "osis_activities_status_createdAt_idx" ON "osis_activities"("status", "createdAt");

-- CreateIndex
CREATE INDEX "osis_activities_date_idx" ON "osis_activities"("date");

-- CreateIndex
CREATE INDEX "osis_activities_author_id_status_idx" ON "osis_activities"("author_id", "status");

-- CreateIndex
CREATE INDEX "student_achievements_siswa_id_status_persetujuan_idx" ON "student_achievements"("siswa_id", "status_persetujuan");

-- CreateIndex
CREATE INDEX "student_achievements_status_persetujuan_createdAt_idx" ON "student_achievements"("status_persetujuan", "createdAt");

-- CreateIndex
CREATE INDEX "student_works_siswa_id_status_persetujuan_idx" ON "student_works"("siswa_id", "status_persetujuan");

-- CreateIndex
CREATE INDEX "student_works_status_persetujuan_createdAt_idx" ON "student_works"("status_persetujuan", "createdAt");

-- CreateIndex
CREATE INDEX "worship_adzan_schedules_date_status_idx" ON "worship_adzan_schedules"("date", "status");

-- CreateIndex
CREATE INDEX "worship_adzan_schedules_siswa_id_date_idx" ON "worship_adzan_schedules"("siswa_id", "date");

-- CreateIndex
CREATE INDEX "worship_carpet_schedules_date_status_idx" ON "worship_carpet_schedules"("date", "status");

-- CreateIndex
CREATE INDEX "worship_carpet_schedules_date_zone_idx" ON "worship_carpet_schedules"("date", "zone");
