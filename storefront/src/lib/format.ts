import type { ProductCategory } from "@prisma/client";

/** Format integer cents as a USD price string. */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Human label for each product category. */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  GAME: "Games",
  ACCOUNT: "Accounts",
  GIFT_CARD: "Gift Cards",
  CURRENCY: "Currency",
  SUBSCRIPTION: "Subscriptions",
  ACCESSORY: "Gear",
};

/** URL slug <-> category enum mapping. */
export const CATEGORY_BY_SLUG: Record<string, ProductCategory> = {
  games: "GAME",
  accounts: "ACCOUNT",
  "gift-cards": "GIFT_CARD",
  currency: "CURRENCY",
  subscriptions: "SUBSCRIPTION",
  accessories: "ACCESSORY",
};

export const SLUG_BY_CATEGORY: Record<ProductCategory, string> = {
  GAME: "games",
  ACCOUNT: "accounts",
  GIFT_CARD: "gift-cards",
  CURRENCY: "currency",
  SUBSCRIPTION: "subscriptions",
  ACCESSORY: "accessories",
};
