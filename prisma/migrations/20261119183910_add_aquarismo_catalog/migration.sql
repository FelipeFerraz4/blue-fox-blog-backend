-- CreateEnum
CREATE TYPE "AquarismoWaterType" AS ENUM ('FRESH', 'BRACKISH', 'SALT');

-- CreateEnum
CREATE TYPE "AquarismoPublication" AS ENUM ('DRAFT', 'REVIEWED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AquarismoTemperament" AS ENUM ('PEACEFUL', 'SEMI_AGGRESSIVE', 'AGGRESSIVE');

-- CreateEnum
CREATE TYPE "AquarismoSwimLayer" AS ENUM ('SURFACE', 'MIDDLE', 'BOTTOM');

-- CreateEnum
CREATE TYPE "AquarismoDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "AquarismoDiet" AS ENUM ('HERBIVORE', 'OMNIVORE', 'CARNIVORE');

-- CreateEnum
CREATE TYPE "AquarismoLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AquarismoBreeding" AS ENUM ('EASY', 'MODERATE', 'HARD');

-- CreateEnum
CREATE TYPE "AquarismoTechLevel" AS ENUM ('LOW', 'HIGH');

-- CreateEnum
CREATE TYPE "AquarismoEquipmentType" AS ENUM ('FILTER', 'HEATER', 'LIGHTING', 'CO2', 'PUMP', 'TEST_KIT', 'SUBSTRATE', 'OTHER');

-- CreateEnum
CREATE TYPE "AquarismoSizingUnit" AS ENUM ('WATTS_PER_LITER', 'TURNOVER_PER_HOUR', 'NONE');

-- CreateEnum
CREATE TYPE "AquarismoCompatibilityOverride" AS ENUM ('COMPATIBLE', 'AVOID');

-- CreateTable
CREATE TABLE "aquarismo_biomes" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "water_type" "AquarismoWaterType" NOT NULL DEFAULT 'FRESH',
    "temp_min_c" DOUBLE PRECISION NOT NULL,
    "temp_max_c" DOUBLE PRECISION NOT NULL,
    "ph_min" DOUBLE PRECISION NOT NULL,
    "ph_max" DOUBLE PRECISION NOT NULL,
    "gh_min" INTEGER,
    "gh_max" INTEGER,
    "current" "AquarismoLevel" NOT NULL DEFAULT 'LOW',
    "light" "AquarismoLevel" NOT NULL DEFAULT 'MEDIUM',
    "tech_level" "AquarismoTechLevel" NOT NULL DEFAULT 'LOW',
    "image_url" VARCHAR(255),
    "publication" "AquarismoPublication" NOT NULL DEFAULT 'DRAFT',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aquarismo_biomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_biome_translations" (
    "id" UUID NOT NULL,
    "biome_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "region" VARCHAR(255),
    "description" TEXT NOT NULL,
    "substrate" TEXT,
    "hardscape" TEXT,
    "plants" TEXT,

    CONSTRAINT "aquarismo_biome_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_equipment" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "type" "AquarismoEquipmentType" NOT NULL,
    "water_types" "AquarismoWaterType"[],
    "tech_level" "AquarismoTechLevel" NOT NULL DEFAULT 'LOW',
    "min_volume_l" INTEGER,
    "max_volume_l" INTEGER,
    "sizing_unit" "AquarismoSizingUnit" NOT NULL DEFAULT 'NONE',
    "sizing_min" DOUBLE PRECISION,
    "sizing_max" DOUBLE PRECISION,
    "guide_slug" VARCHAR(255),
    "publication" "AquarismoPublication" NOT NULL DEFAULT 'DRAFT',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aquarismo_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_equipment_translations" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "sizing_note" TEXT,

    CONSTRAINT "aquarismo_equipment_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_families" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "scientific_name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aquarismo_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_family_translations" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,

    CONSTRAINT "aquarismo_family_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_species" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "scientific_name" VARCHAR(160) NOT NULL,
    "family_id" UUID,
    "water_type" "AquarismoWaterType" NOT NULL DEFAULT 'FRESH',
    "adult_size_cm" DOUBLE PRECISION NOT NULL,
    "min_volume_l" INTEGER NOT NULL,
    "min_tank_length_cm" INTEGER NOT NULL,
    "min_group_size" INTEGER NOT NULL DEFAULT 1,
    "temp_min_c" DOUBLE PRECISION NOT NULL,
    "temp_max_c" DOUBLE PRECISION NOT NULL,
    "ph_min" DOUBLE PRECISION NOT NULL,
    "ph_max" DOUBLE PRECISION NOT NULL,
    "gh_min" INTEGER,
    "gh_max" INTEGER,
    "temperament" "AquarismoTemperament" NOT NULL,
    "fin_nipper" BOOLEAN NOT NULL DEFAULT false,
    "long_finned" BOOLEAN NOT NULL DEFAULT false,
    "territorial" BOOLEAN NOT NULL DEFAULT false,
    "conspecific_aggression" BOOLEAN NOT NULL DEFAULT false,
    "layers" "AquarismoSwimLayer"[],
    "activity" "AquarismoLevel" NOT NULL DEFAULT 'MEDIUM',
    "difficulty" "AquarismoDifficulty" NOT NULL,
    "diet" "AquarismoDiet" NOT NULL,
    "needs_plants" BOOLEAN NOT NULL DEFAULT false,
    "needs_hiding" BOOLEAN NOT NULL DEFAULT false,
    "eats_plants" BOOLEAN NOT NULL DEFAULT false,
    "jumps" BOOLEAN NOT NULL DEFAULT false,
    "breeding" "AquarismoBreeding" NOT NULL DEFAULT 'MODERATE',
    "suitable_for_breeding_sale" BOOLEAN NOT NULL DEFAULT false,
    "image_url" VARCHAR(255),
    "sources" TEXT[],
    "last_reviewed_at" TIMESTAMPTZ(6),
    "publication" "AquarismoPublication" NOT NULL DEFAULT 'DRAFT',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aquarismo_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_species_translations" (
    "id" UUID NOT NULL,
    "species_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "common_name" VARCHAR(160) NOT NULL,
    "other_names" TEXT[],
    "region" VARCHAR(255),
    "description" TEXT NOT NULL,
    "care_notes" TEXT,

    CONSTRAINT "aquarismo_species_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_species_biomes" (
    "species_id" UUID NOT NULL,
    "biome_id" UUID NOT NULL,

    CONSTRAINT "aquarismo_species_biomes_pkey" PRIMARY KEY ("species_id","biome_id")
);

-- CreateTable
CREATE TABLE "aquarismo_species_compatibility" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "species_a_id" UUID NOT NULL,
    "species_b_id" UUID NOT NULL,
    "override" "AquarismoCompatibilityOverride" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aquarismo_species_compatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aquarismo_species_compatibility_translations" (
    "id" UUID NOT NULL,
    "compatibility_id" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "aquarismo_species_compatibility_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aquarismo_biomes_blog_id_publication_status_idx" ON "aquarismo_biomes"("blog_id", "publication", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_biomes_blog_id_slug_key" ON "aquarismo_biomes"("blog_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_biome_translations_biome_id_locale_key" ON "aquarismo_biome_translations"("biome_id", "locale");

-- CreateIndex
CREATE INDEX "aquarismo_equipment_blog_id_type_publication_status_idx" ON "aquarismo_equipment"("blog_id", "type", "publication", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_equipment_blog_id_slug_key" ON "aquarismo_equipment"("blog_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_equipment_translations_equipment_id_locale_key" ON "aquarismo_equipment_translations"("equipment_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_families_blog_id_slug_key" ON "aquarismo_families"("blog_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_families_blog_id_scientific_name_key" ON "aquarismo_families"("blog_id", "scientific_name");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_family_translations_family_id_locale_key" ON "aquarismo_family_translations"("family_id", "locale");

-- CreateIndex
CREATE INDEX "aquarismo_species_blog_id_publication_status_idx" ON "aquarismo_species"("blog_id", "publication", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_species_blog_id_slug_key" ON "aquarismo_species"("blog_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_species_blog_id_scientific_name_key" ON "aquarismo_species"("blog_id", "scientific_name");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_species_translations_species_id_locale_key" ON "aquarismo_species_translations"("species_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_species_compatibility_species_a_id_species_b_id_key" ON "aquarismo_species_compatibility"("species_a_id", "species_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "aquarismo_species_compatibility_translations_compatibility__key" ON "aquarismo_species_compatibility_translations"("compatibility_id", "locale");

-- AddForeignKey
ALTER TABLE "aquarismo_biome_translations" ADD CONSTRAINT "aquarismo_biome_translations_biome_id_fkey" FOREIGN KEY ("biome_id") REFERENCES "aquarismo_biomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_equipment_translations" ADD CONSTRAINT "aquarismo_equipment_translations_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "aquarismo_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_family_translations" ADD CONSTRAINT "aquarismo_family_translations_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "aquarismo_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_species" ADD CONSTRAINT "aquarismo_species_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "aquarismo_families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_species_translations" ADD CONSTRAINT "aquarismo_species_translations_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "aquarismo_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_species_biomes" ADD CONSTRAINT "aquarismo_species_biomes_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "aquarismo_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_species_biomes" ADD CONSTRAINT "aquarismo_species_biomes_biome_id_fkey" FOREIGN KEY ("biome_id") REFERENCES "aquarismo_biomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_species_compatibility" ADD CONSTRAINT "aquarismo_species_compatibility_species_a_id_fkey" FOREIGN KEY ("species_a_id") REFERENCES "aquarismo_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_species_compatibility" ADD CONSTRAINT "aquarismo_species_compatibility_species_b_id_fkey" FOREIGN KEY ("species_b_id") REFERENCES "aquarismo_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aquarismo_species_compatibility_translations" ADD CONSTRAINT "aquarismo_species_compatibility_translations_compatibility_fkey" FOREIGN KEY ("compatibility_id") REFERENCES "aquarismo_species_compatibility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
