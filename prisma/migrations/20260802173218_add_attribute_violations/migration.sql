-- CreateTable
CREATE TABLE "attribute_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_violations" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scan_time" TEXT NOT NULL,
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribute_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_violation_items" (
    "id" TEXT NOT NULL,
    "violation_id" TEXT NOT NULL,
    "attribute_item_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribute_violation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_items_name_key" ON "attribute_items"("name");

-- CreateIndex
CREATE INDEX "attribute_violations_siswa_id_date_idx" ON "attribute_violations"("siswa_id", "date");

-- CreateIndex
CREATE INDEX "attribute_violations_date_idx" ON "attribute_violations"("date");

-- CreateIndex
CREATE INDEX "attribute_violations_recorded_by_idx" ON "attribute_violations"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_violation_items_violation_id_attribute_item_id_key" ON "attribute_violation_items"("violation_id", "attribute_item_id");

-- AddForeignKey
ALTER TABLE "attribute_violations" ADD CONSTRAINT "attribute_violations_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_violations" ADD CONSTRAINT "attribute_violations_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_violation_items" ADD CONSTRAINT "attribute_violation_items_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "attribute_violations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_violation_items" ADD CONSTRAINT "attribute_violation_items_attribute_item_id_fkey" FOREIGN KEY ("attribute_item_id") REFERENCES "attribute_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
