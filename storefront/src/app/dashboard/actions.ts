"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { evaluateClaim, dailyXp, levelForXp, makeReferralCode } from "@/lib/gamification";

export type ClaimResult =
  | { claimed: true; reward: number; streak: number }
  | { claimed: false; reason: "already" | "auth" };

export async function claimDaily(): Promise<ClaimResult> {
  const session = await auth();
  if (!session?.user?.id) return { claimed: false, reason: "auth" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { claimed: false, reason: "auth" };

  const state = evaluateClaim(new Date(), user.lastClaimAt, user.streak);
  if (!state.claimable) return { claimed: false, reason: "already" };

  const reward = dailyXp(state.nextStreak);
  const newXp = user.xp + reward;
  await prisma.user.update({
    where: { id: user.id },
    data: { xp: newXp, level: levelForXp(newXp), streak: state.nextStreak, lastClaimAt: new Date() },
  });
  revalidatePath("/dashboard");
  return { claimed: true, reward, streak: state.nextStreak };
}

/** Lazily assign a referral code to accounts created before referrals existed. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;

  for (let i = 0; i < 5; i++) {
    const code = makeReferralCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch {
      // unique collision — retry
    }
  }
  return makeReferralCode();
}
