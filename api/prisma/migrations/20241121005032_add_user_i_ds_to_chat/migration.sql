-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "userIDs" INTEGER[];

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;
