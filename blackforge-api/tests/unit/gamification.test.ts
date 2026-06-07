import { describe, it, expect } from "vitest";
import {
  levelForXp,
  rankForLevel,
  xpForOrder,
  creditForOrder,
  dailyXp,
  evaluateClaim,
  achievements,
} from "@/modules/gamification/gamification.rules";

describe("gamification rules", () => {
  it("levels every 1000 xp", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(999)).toBe(1);
    expect(levelForXp(1000)).toBe(2);
    expect(levelForXp(4500)).toBe(5);
  });

  it("maps level to rank", () => {
    expect(rankForLevel(1)).toBe("Squire");
    expect(rankForLevel(5)).toBe("Knight");
    expect(rankForLevel(20)).toBe("Warlord");
    expect(rankForLevel(30)).toBe("Eclipse");
  });

  it("computes order rewards", () => {
    expect(xpForOrder(5999)).toBe(50 + 59);
    expect(creditForOrder(5999)).toBe(300); // 5%
  });

  it("grows the daily reward with streak, capped", () => {
    expect(dailyXp(1)).toBe(25);
    expect(dailyXp(7)).toBe(85);
    expect(dailyXp(50)).toBe(85);
  });

  it("evaluates daily claim windows", () => {
    const now = new Date("2026-06-07T12:00:00Z");
    expect(evaluateClaim(now, null, 0)).toEqual({ claimable: true, nextStreak: 1 });
    const yesterday = new Date("2026-06-06T23:00:00Z");
    expect(evaluateClaim(now, yesterday, 3)).toEqual({ claimable: true, nextStreak: 4 });
    const today = new Date("2026-06-07T01:00:00Z");
    expect(evaluateClaim(now, today, 3)).toEqual({ claimable: false, reason: "already" });
  });

  it("derives achievements", () => {
    const a = achievements({ orders: 1, spentCents: 0, streak: 0, level: 1, referrals: 0 });
    expect(a.find((x) => x.id === "first-blade")?.earned).toBe(true);
    expect(a.find((x) => x.id === "stockpiler")?.earned).toBe(false);
  });
});
