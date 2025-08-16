-- CreateEnum
CREATE TYPE "public"."TaskType" AS ENUM ('FORM', 'REVIEW');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('SHORT', 'PARAGRAPH', 'MULTIPLE', 'DROPDOWN', 'DATE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conference" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "abstractDeadline" TIMESTAMP(3) NOT NULL,
    "fullSubmissionDeadline" TIMESTAMP(3) NOT NULL,
    "conferenceDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "firstAuthors" TEXT,
    "seniorAuthors" TEXT,
    "overleaf" TEXT,
    "userId" INTEGER NOT NULL,
    "conferenceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProcessItem" (
    "id" SERIAL NOT NULL,
    "conferenceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "dueDaysBeforeAbstract" INTEGER,
    "dueDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" SERIAL NOT NULL,
    "processItemId" INTEGER NOT NULL,
    "type" "public"."TaskType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormQuestion" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "title" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormOption" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskSubmission" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "answers" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSubmission_taskId_submissionId_key" ON "public"."TaskSubmission"("taskId", "submissionId");

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "public"."Conference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcessItem" ADD CONSTRAINT "ProcessItem_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "public"."Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_processItemId_fkey" FOREIGN KEY ("processItemId") REFERENCES "public"."ProcessItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormQuestion" ADD CONSTRAINT "FormQuestion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormOption" ADD CONSTRAINT "FormOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."FormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskSubmission" ADD CONSTRAINT "TaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskSubmission" ADD CONSTRAINT "TaskSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
