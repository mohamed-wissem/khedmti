-- CreateEnum
CREATE TYPE "bfapi"."CouponType" AS ENUM ('PERCENT', 'FIXED');

-- CreateTable
CREATE TABLE "bfapi"."cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."cart_item" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "bfapi"."CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "maxRedemptions" INTEGER,
    "redeemedCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER,
    "minSpendCents" INTEGER,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bfapi"."coupon_redemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_userId_key" ON "bfapi"."cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_guestId_key" ON "bfapi"."cart"("guestId");

-- CreateIndex
CREATE INDEX "cart_item_cartId_idx" ON "bfapi"."cart_item"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cartId_productId_variantId_key" ON "bfapi"."cart_item"("cartId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "bfapi"."coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_active_expiresAt_idx" ON "bfapi"."coupon"("active", "expiresAt");

-- CreateIndex
CREATE INDEX "coupon_redemption_couponId_userId_idx" ON "bfapi"."coupon_redemption"("couponId", "userId");

-- AddForeignKey
ALTER TABLE "bfapi"."cart" ADD CONSTRAINT "cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "bfapi"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."cart_item" ADD CONSTRAINT "cart_item_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "bfapi"."cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."cart_item" ADD CONSTRAINT "cart_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bfapi"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."cart_item" ADD CONSTRAINT "cart_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "bfapi"."product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."coupon_redemption" ADD CONSTRAINT "coupon_redemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "bfapi"."coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bfapi"."coupon_redemption" ADD CONSTRAINT "coupon_redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "bfapi"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

