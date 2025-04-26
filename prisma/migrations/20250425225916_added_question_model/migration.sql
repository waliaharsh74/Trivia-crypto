-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_slug_fkey" FOREIGN KEY ("slug") REFERENCES "Bet"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
