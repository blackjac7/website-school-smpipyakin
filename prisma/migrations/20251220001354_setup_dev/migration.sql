-- CreateTable
CREATE TABLE "hero_slides" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255) NOT NULL,
    "image_small" VARCHAR(500) NOT NULL,
    "image_medium" VARCHAR(500) NOT NULL,
    "link_primary_text" VARCHAR(50),
    "link_primary_href" VARCHAR(255),
    "link_secondary_text" VARCHAR(50),
    "link_secondary_href" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_stats" (
    "id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "icon_name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "school_stats_pkey" PRIMARY KEY ("id")
);
