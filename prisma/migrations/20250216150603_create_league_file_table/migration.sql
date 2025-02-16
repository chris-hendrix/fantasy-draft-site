-- CreateEnum
CREATE TYPE "LeagueFileCategory" AS ENUM ('backup', 'deadline_rosters', 'league_image', 'other');

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bucketPath" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "league_id" TEXT NOT NULL,
    "draft_id" TEXT,
    "file_id" TEXT NOT NULL,
    "category" "LeagueFileCategory" NOT NULL DEFAULT 'other',

    CONSTRAINT "LeagueFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "File_user_id_idx" ON "File"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueFile_league_id_file_id_key" ON "LeagueFile"("league_id", "file_id");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueFile" ADD CONSTRAINT "LeagueFile_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueFile" ADD CONSTRAINT "LeagueFile_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueFile" ADD CONSTRAINT "LeagueFile_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
