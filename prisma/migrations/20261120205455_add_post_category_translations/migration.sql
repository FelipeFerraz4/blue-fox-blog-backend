-- CreateTable
CREATE TABLE "post_translations" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(160) NOT NULL,

    CONSTRAINT "post_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_translations_post_id_locale_key" ON "post_translations"("post_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_locale_key" ON "category_translations"("category_id", "locale");

-- AddForeignKey
ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
