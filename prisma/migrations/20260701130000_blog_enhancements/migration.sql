-- Blog enhancements: featured image, SEO keywords, multiple categories
ALTER TABLE "articles"
ADD COLUMN IF NOT EXISTS "featured_image_url" TEXT,
ADD COLUMN IF NOT EXISTS "seo_keywords" TEXT,
ADD COLUMN IF NOT EXISTS "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "articles"
SET "categories" = ARRAY["category"]
WHERE "category" IS NOT NULL
  AND "category" <> ''
  AND COALESCE(array_length("categories", 1), 0) = 0;

ALTER TABLE "articles" DROP COLUMN IF EXISTS "category";
