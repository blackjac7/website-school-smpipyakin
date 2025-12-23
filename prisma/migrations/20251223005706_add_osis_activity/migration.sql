-- CreateTable
CREATE TABLE "osis_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "participants" INTEGER NOT NULL,
    "organizer" TEXT NOT NULL,
    "proposal_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_note" TEXT,
    "author_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "osis_activities_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
