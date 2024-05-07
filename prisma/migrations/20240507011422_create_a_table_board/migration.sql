-- AlterTable
ALTER TABLE "task" ADD COLUMN     "board_id" INTEGER;

-- CreateTable
CREATE TABLE "board" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE SET NULL ON UPDATE CASCADE;
