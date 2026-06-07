import { prisma } from "@/prisma/client";
import { AppError } from "@/utils/apiError";
import { makeReferralCode } from "@/utils/token";
import {
  levelForXp,
  xpIntoLevel,
  xpToNextLevel,
  rankForLevel,
  dailyXp,
  evaluateClaim,
  achievements,
  REFERRAL_BONUS_CENTS,
  REFERRAL_XP,
} from "@/modules/gamification/gamification.rules";

async function userStats(userId: string) {
  const [orderAgg, referrals] = await Promise.all([
    prisma.order.aggregate({
      where: { userId, status: { in: ["PAID", "FULFILLED", "SHIPPED"] } },
      _count: true,
      _sum: { totalCents: true },
    }),
    prisma.user.count({ where: { referredById: userId } }),
  ]);
  return {
    orders: orderAgg._count,
    spentCents: orderAgg._sum.totalCents ?? 0,
    referrals,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User not found");
  const stats = await userStats(userId);

  return {
    xp: user.xp,
    level: user.level,
    rank: rankForLevel(user.level),
    xpIntoLevel: xpIntoLevel(user.xp),
    xpToNextLevel: xpToNextLevel(user.xp),
    creditCents: user.creditCents,
    streak: user.streak,
    achievements: achievements({
      orders: stats.orders,
      spentCents: stats.spentCents,
      streak: user.streak,
      level: user.level,
      referrals: stats.referrals,
    }),
  };
}

export async function claimDaily(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User not found");

  const state = evaluateClaim(new Date(), user.lastClaimAt, user.streak);
  if (!state.claimable) throw AppError.badRequest("You've already claimed your daily reward today");

  const reward = dailyXp(state.nextStreak);
  const newXp = user.xp + reward;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: levelForXp(newXp),
      streak: state.nextStreak,
      lastClaimAt: new Date(),
    },
  });
  return { claimed: true, reward, streak: state.nextStreak, xp: updated.xp, level: updated.level };
}

export async function getReferral(userId: string) {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User not found");

  // Lazily assign a referral code to legacy accounts.
  if (!user.referralCode) {
    for (let i = 0; i < 5; i++) {
      try {
        user = await prisma.user.update({
          where: { id: userId },
          data: { referralCode: makeReferralCode() },
        });
        break;
      } catch {
        // unique collision — retry
      }
    }
  }

  const referrals = await prisma.user.count({ where: { referredById: userId } });
  return {
    referralCode: user.referralCode,
    referrals,
    rewardPerReferralCents: REFERRAL_BONUS_CENTS,
    rewardPerReferralXp: REFERRAL_XP,
  };
}
