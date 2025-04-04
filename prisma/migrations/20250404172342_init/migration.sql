-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "breezeSubdomain" TEXT NOT NULL,
    "breezeApiKey" TEXT NOT NULL,
    "breezeFormId" TEXT NOT NULL,
    "emailTemplate" TEXT NOT NULL,
    "emailFrom" TEXT NOT NULL,
    "emailBcc" TEXT,
    "formFieldMappings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");
