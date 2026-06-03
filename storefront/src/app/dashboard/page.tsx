import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Package, Coins, Trophy, ArrowRight, Lock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrders, getUserOrderStats } from "@/lib/orders";
import { formatCents } from "@/lib/format";
import {
  levelForXp,
  xpIntoLevel,
  xpToNextLevel,
  rankForLevel,
  evaluateClaim,
  achievements,
  XP_PER_LEVEL,
} from "@/lib/gamification";
import { ensureReferralCode } from "./actions";
import { DailyReward } from "@/components/dashboard/daily-reward";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { ProductTile } from "@/components/product/product-tile";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, stats, orders, referrals] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    getUserOrderStats(userId),
    getUserOrders(userId),
    prisma.user.count({ where: { referredById: userId } }),
  ]);
  if (!user) redirect("/login");

  const referralCode = await ensureReferralCode(userId);
  const level = levelForXp(user.xp);
  const rank = rankForLevel(level);
  const progress = (xpIntoLevel(user.xp) / XP_PER_LEVEL) * 100;
  const claim = evaluateClaim(new Date(), user.lastClaimAt, user.streak);

  const badges = achievements({
    orders: stats.count,
    spentCents: stats.spentCents,
    streak: user.streak,
    level,
    referrals,
  });

  // Recommendations from the user's most-purchased category (fallback: newest).
  const purchasedCategory = orders[0]?.items[0]?.product.category;
  const recommended = await prisma.product.findMany({
    where: { active: true, ...(purchasedCategory ? { category: purchasedCategory } : {}) },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      {/* Player card */}
      <section className="forged-surface relative overflow-hidden rounded-bf border border-ash/60 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_85%_0%,rgba(194,65,12,0.15),transparent_60%)]" />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-bf border border-bronze/50 bg-iron">
            <Shield className="h-7 w-7 text-bronze" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-bronze">Level {level} · {rank}</p>
            <h1 className="font-display text-2xl font-bold tracking-wide text-moon">{user.name ?? "Player"}</h1>
            <p className="text-sm text-smoke">{user.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs uppercase tracking-widest text-bronze">Forge Credit</p>
            <p className="font-mono text-2xl font-bold text-moon">{formatCents(user.creditCents)}</p>
          </div>
        </div>
        <div className="relative mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-smoke">
            <span>{xpIntoLevel(user.xp)} XP</span>
            <span>{xpToNextLevel(user.xp)} XP to level {level + 1}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-iron">
            <div className="h-full rounded-full bg-gradient-to-r from-ember-deep to-ember" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      {/* Daily reward */}
      <DailyReward claimable={claim.claimable} streak={user.streak} />

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat icon={Package} label="Orders" value={String(stats.count)} />
        <Stat icon={Coins} label="Total spent" value={formatCents(stats.spentCents)} />
        <Stat icon={Trophy} label="XP" value={String(user.xp)} />
      </section>

      {/* Achievements */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-wide text-moon">Achievements</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-bf border p-4 ${b.earned ? "border-ember/40 bg-ember/5" : "border-ash/60 bg-iron/30 opacity-60"}`}
            >
              <div className="flex items-center gap-2">
                {b.earned ? <Trophy className="h-4 w-4 text-ember" /> : <Lock className="h-4 w-4 text-smoke" />}
                <p className="text-sm font-medium text-moon">{b.name}</p>
              </div>
              <p className="mt-1 text-xs text-smoke">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Referral */}
      <ReferralCard code={referralCode} referrals={referrals} />

      {/* Recent orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-wide text-moon">Recent orders</h2>
          <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-smoke hover:text-ember">
            All orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="forged-surface rounded-bf border border-ash/60 p-8 text-center">
            <p className="text-moon">No orders yet.</p>
            <Link href="/shop" className="mt-3 inline-block text-sm text-ember hover:underline">Browse the armory →</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.slice(0, 4).map((o) => (
              <li key={o.id}>
                <Link href={`/order/${o.id}`} className="forged-surface flex items-center justify-between gap-4 rounded-bf border border-ash/60 p-4 transition-colors hover:border-ember/40">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-moon">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-smoke">{o.items.length} item{o.items.length === 1 ? "" : "s"} · {o.createdAt.toLocaleDateString()}</p>
                  </div>
                  <span className="font-mono text-moon">{formatCents(o.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recommendations */}
      {recommended.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-wide text-moon">Recommended for you</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {recommended.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="forged-surface rounded-bf border border-ash/60 p-4">
      <Icon className="h-5 w-5 text-ember" />
      <p className="mt-3 font-mono text-2xl font-bold text-moon">{value}</p>
      <p className="text-xs uppercase tracking-wider text-smoke">{label}</p>
    </div>
  );
}
