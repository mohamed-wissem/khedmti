import { PrismaClient, ProductCategory, Rarity } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  slug: string;
  title: string;
  platform: string;
  category: ProductCategory;
  rarity?: Rarity;
  priceCents: number;
  compareCents?: number;
  stock?: number;
  description?: string;
};

const PRODUCTS: Seed[] = [
  // Games
  { slug: "eclipse-saga-ultimate", title: "Eclipse Saga: Ultimate Edition", platform: "PC · Steam", category: "GAME", rarity: "LEGENDARY", priceCents: 3999, compareCents: 6999, stock: 999, description: "The complete dark-fantasy epic — base game, all DLC chapters, and the Season of Ash expansion." },
  { slug: "ashen-realms", title: "Ashen Realms", platform: "PC · Steam", category: "GAME", priceCents: 4999, stock: 999, description: "An open-world action-RPG across a kingdom swallowed by eternal dusk." },
  { slug: "stormcaller-iii", title: "Stormcaller III", platform: "PlayStation 5", category: "GAME", rarity: "PREMIUM", priceCents: 5999, compareCents: 6999, stock: 500, description: "Command the storm in this cinematic souls-like sequel." },
  { slug: "rune-knights", title: "Rune Knights", platform: "Xbox Series X", category: "GAME", priceCents: 2999, stock: 750, description: "Co-op tactical combat with deep rune-crafting." },

  // Accounts
  { slug: "veteran-warlord-account", title: "Veteran Account · Rank Warlord", platform: "Account", category: "ACCOUNT", rarity: "PREMIUM", priceCents: 12900, compareCents: 19900, stock: 8, description: "Max-rank account with rare cosmetics and full campaign unlocked." },
  { slug: "starter-knight-account", title: "Starter Account · Knight", platform: "Account", category: "ACCOUNT", priceCents: 3900, stock: 20, description: "Mid-tier account, ready for ranked." },

  // Gift cards
  { slug: "stormcaller-gift-50", title: "Stormcaller Gift Card $50", platform: "Gift Card", category: "GIFT_CARD", priceCents: 5000, stock: 9999, description: "Digital gift card, delivered instantly." },
  { slug: "stormcaller-gift-100", title: "Stormcaller Gift Card $100", platform: "Gift Card", category: "GIFT_CARD", priceCents: 10000, stock: 9999, description: "Digital gift card, delivered instantly." },

  // Currency
  { slug: "rune-shards-5000", title: "5,000 Rune Shards", platform: "In-Game Currency", category: "CURRENCY", priceCents: 2499, stock: 9999, description: "Premium currency pack — delivered to your account in minutes." },
  { slug: "rune-shards-12000", title: "12,000 Rune Shards", platform: "In-Game Currency", category: "CURRENCY", rarity: "PREMIUM", priceCents: 4999, compareCents: 5999, stock: 9999, description: "Best-value premium currency pack." },

  // Subscriptions
  { slug: "forge-pass-12mo", title: "Forge Pass · 12 Months", platform: "Subscription", category: "SUBSCRIPTION", rarity: "PREMIUM", priceCents: 5999, compareCents: 8999, stock: 9999, description: "A year of premium perks: free delivery, early flash access, bonus XP." },
  { slug: "forge-pass-3mo", title: "Forge Pass · 3 Months", platform: "Subscription", category: "SUBSCRIPTION", priceCents: 1999, stock: 9999, description: "Three months of premium perks." },

  // Accessories
  { slug: "blackforge-headset", title: "BLACKFORGE Tactical Headset", platform: "Accessory", category: "ACCESSORY", priceCents: 8999, compareCents: 11999, stock: 40, description: "Low-latency wireless headset with forged-steel finish." },
  { slug: "ember-mechanical-keyboard", title: "Ember Mechanical Keyboard", platform: "Accessory", category: "ACCESSORY", rarity: "PREMIUM", priceCents: 12900, stock: 25, description: "Hot-swappable switches, ember backlight, aluminum frame." },
];

async function main() {
  console.log("Seeding BLACKFORGE products…");
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, instant: p.category !== "ACCESSORY" },
      create: { ...p, instant: p.category !== "ACCESSORY" },
    });
  }
  const count = await prisma.product.count();
  console.log(`Done. ${count} products in catalog.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
