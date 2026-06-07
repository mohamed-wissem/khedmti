-- CreateEnum
CREATE TYPE "bfapi"."Rarity" AS ENUM ('COMMON', 'PREMIUM', 'LEGENDARY');

-- CreateTable
CREATE TABLE "bfapi"."category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."brand" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "rarity" "bfapi"."Rarity" NOT NULL DEFAULT 'COMMON',
    "priceCents" INTEGER NOT NULL,
    "compareCents" INTEGER,
    "instant" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."product_variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "color" TEXT,
    "size" TEXT,
    "priceCents" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."product_image" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."product_spec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "product_spec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."wishlist_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "bfapi"."category"("slug");

-- CreateIndex
CREATE INDEX "category_parentId_idx" ON "bfapi"."category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "brand_slug_key" ON "bfapi"."brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "bfapi"."product"("slug");

-- CreateIndex
CREATE INDEX "product_categoryId_idx" ON "bfapi"."product"("categoryId");

-- CreateIndex
CREATE INDEX "product_brandId_idx" ON "bfapi"."product"("brandId");

-- CreateIndex
CREATE INDEX "product_active_priceCents_idx" ON "bfapi"."product"("active", "priceCents");

-- CreateIndex
CREATE INDEX "product_avgRating_idx" ON "bfapi"."product"("avgRating");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "bfapi"."product_variant"("sku");

-- CreateIndex
CREATE INDEX "product_variant_productId_idx" ON "bfapi"."product_variant"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_productId_color_size_key" ON "bfapi"."product_variant"("productId", "color", "size");

-- CreateIndex
CREATE INDEX "product_image_productId_idx" ON "bfapi"."product_image"("productId");

-- CreateIndex
CREATE INDEX "product_spec_productId_idx" ON "bfapi"."product_spec"("productId");

-- CreateIndex
CREATE INDEX "wishlist_item_productId_idx" ON "bfapi"."wishlist_item"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_item_userId_productId_key" ON "bfapi"."wishlist_item"("userId", "productId");

-- AddForeignKey
ALTER TABLE "bfapi"."category" ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "bfapi"."category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "bfapi"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."product" ADD CONSTRAINT "product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "bfapi"."brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."product_variant" ADD CONSTRAINT "product_variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bfapi"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."product_image" ADD CONSTRAINT "product_image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bfapi"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."product_spec" ADD CONSTRAINT "product_spec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bfapi"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."wishlist_item" ADD CONSTRAINT "wishlist_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "bfapi"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."wishlist_item" ADD CONSTRAINT "wishlist_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bfapi"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Full-text search index (matches the expression used by the /search endpoint).
CREATE INDEX "product_fts_idx" ON "bfapi"."product"
  USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(platform,'')));
