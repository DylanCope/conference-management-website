-- CreateTable
CREATE TABLE "ProcessItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conferenceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "dueDaysBeforeAbstract" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProcessItem_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- removed (switching providers)
-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processItemId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_processItemId_fkey" FOREIGN KEY ("processItemId") REFERENCES "ProcessItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FormQuestion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FormOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
