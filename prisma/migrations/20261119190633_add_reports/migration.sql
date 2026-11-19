-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('POST', 'SPECIES', 'BIOME', 'EQUIPMENT', 'PAGE');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'IN_REVIEW', 'FIXED', 'DISMISSED');

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_slug" VARCHAR(255) NOT NULL,
    "target_title" VARCHAR(255),
    "page_url" VARCHAR(500),
    "message" TEXT NOT NULL,
    "suggestion" TEXT,
    "source" VARCHAR(500),
    "email" VARCHAR(255),
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "internal_note" TEXT,
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_blog_id_status_created_at_idx" ON "reports"("blog_id", "status", "created_at");
