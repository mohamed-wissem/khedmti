/**
 * BLACKFORGE gamification rules — ported verbatim from the storefront's
 * `lib/gamification.ts` so the API is the single source of truth. Pure functions
 * only; persistence lives in the gamification service (Sprint 5) and is also
 * invoked by order fulfillment (Sprint 4).
 */

export const XP_PER_LEVEL = 1000;

export const levelForXp = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
export const xpIntoLevel = (xp: number) => Math.max(0, xp) % XP_PER_LEVEL;
export const xpToNextLevel = (xp: number) => XP_PER_LEVEL - xpIntoLevel(xp);

export const RANKS = [
  { min: 1, name: "Squire" },
  { min: 5, name: "Knight" },
  { min: 15, name: "Warlord" },
  { min: 30, name: "Eclipse" },
] as const;

export function rankForLevel(level: number): string {
  let name: string = RANKS[0].name;
  for (const r of RANKS) if (level >= r.min) name = r.name;
  return name;
}

/** XP for an order: 50 base + 1 XP per dollar spent. */
export const xpForOrder = (totalCents: number) => 50 + Math.floor(totalCents / 100);
/** Loyalty credit (Forge Credit) earned back: 5% of order total. */
export const creditForOrder = (totalCents: number) => Math.round(totalCents * 0.05);

export const DAILY_BASE_XP = 25;
/** Daily reward grows with streak, capped. */
export const dailyXp = (streak: number) =>
  DAILY_BASE_XP + Math.min(Math.max(streak - 1, 0), 6) * 10;

export const REFERRAL_BONUS_CENTS = 500;
export const REFERRAL_XP = 100;

// ── Daily streak ─────────────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => Math.floor(d.getTime() / DAY);

export type ClaimState =
  | { claimable: true; nextStreak: number }
  | { claimable: false; reason: "already" };

export function evaluateClaim(now: Date, lastClaimAt: Date | null, streak: number): ClaimState {
  if (!lastClaimAt) return { claimable: true, nextStreak: 1 };
  const days = startOfDay(now) - startOfDay(lastClaimAt);
  if (days <= 0) return { claimable: false, reason: "already" };
  if (days === 1) return { claimable: true, nextStreak: streak + 1 };
  return { claimable: true, nextStreak: 1 };
}

// ── Achievements (derived; no storage) ───────────────────────────────────────
export interface AchievementCtx {
  orders: number;
  spentCents: number;
  streak: number;
  level: number;
  referrals: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  earned: boolean;
}

export function achievements(c: AchievementCtx): Achievement[] {
  return [
    {
      id: "first-blade",
      name: "First Blade",
      desc: "Place your first order",
      earned: c.orders >= 1,
    },
    { id: "stockpiler", name: "Stockpiler", desc: "Place 5 orders", earned: c.orders >= 5 },
    {
      id: "big-spender",
      name: "Big Spender",
      desc: "Spend $200 total",
      earned: c.spentCents >= 20000,
    },
    {
      id: "forge-loyalist",
      name: "Forge Loyalist",
      desc: "Reach a 7-day streak",
      earned: c.streak >= 7,
    },
    { id: "ascendant", name: "Ascendant", desc: "Reach level 5 (Knight)", earned: c.level >= 5 },
    { id: "warband", name: "Warband", desc: "Refer a friend", earned: c.referrals >= 1 },
  ];
}
