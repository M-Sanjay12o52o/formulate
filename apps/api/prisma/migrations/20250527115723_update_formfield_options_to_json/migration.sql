/*
  Warnings:

  - You are about to alter the column `options` on the `FormField` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "formId" TEXT NOT NULL,
    CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FormField" ("formId", "id", "name", "options", "required", "type") SELECT "formId", "id", "name", "options", "required", "type" FROM "FormField";
DROP TABLE "FormField";
ALTER TABLE "new_FormField" RENAME TO "FormField";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
