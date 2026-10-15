-- CreateTable
CREATE TABLE "Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "externalId" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL,
    "requester" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "owner" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_externalId_key" ON "Request"("externalId");
